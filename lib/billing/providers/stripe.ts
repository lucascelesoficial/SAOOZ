import { z } from 'zod'
import type { Json } from '@/types/database.types'
import { TRIAL_DAYS } from '@/lib/billing/plans'
import type {
  CheckoutInput,
  CheckoutResult,
  ParsedProviderWebhookEvent,
  PaymentProvider,
  ProviderWebhookInput,
  ResolvePaymentReferencesInput,
  ProviderPaymentReferences,
  BillingDurationMonths,
} from './types'

const STRIPE_API_VERSION = '2026-03-25.dahlia' as const

const durationSchema = z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])
const paymentMethodSchema = z.enum(['card', 'pix'])
const planTypeSchema = z.enum(['pf', 'pj', 'pro'])

const stripeCheckoutMetadataSchema = z.object({
  user_id: z.string().min(1),
  plan_type: planTypeSchema,
  duration: z.coerce.number().pipe(durationSchema),
  payment_method: paymentMethodSchema,
  // Present when checkout was created with a trial period
  trial_days: z.coerce.number().int().min(0).optional(),
})

const stripeCheckoutSessionSchema = z.object({
  id: z.string().nullish(),
  amount_total: z.coerce.number().optional(),
  subscription: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
  payment_intent: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
  customer: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
  metadata: z.record(z.string(), z.string()).optional(),
})

function toStringId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  return value.id
}

/**
 * Resolves the pre-created Stripe Price ID from environment variables.
 * Env var format: STRIPE_PRICE_<PLAN>_<DURATION>M
 * e.g. STRIPE_PRICE_PF_1M, STRIPE_PRICE_PJ_12M
 */
function resolvePriceId(planType: string, durationMonths: BillingDurationMonths): string {
  const durationKey =
    durationMonths === 1  ? '1M'  :
    durationMonths === 3  ? '3M'  :
    durationMonths === 6  ? '6M'  : '12M'

  const envKey = `STRIPE_PRICE_${planType.toUpperCase()}_${durationKey}`
  const priceId = process.env[envKey]

  if (!priceId) {
    throw new Error(
      `Stripe Price ID not configured. Set ${envKey} in your environment variables.`
    )
  }

  return priceId
}

export class StripeProvider implements PaymentProvider {
  gateway = 'stripe' as const

  private readonly secretKey: string | null
  private readonly webhookSecret: string | null

  constructor(options?: { secretKey?: string | null; webhookSecret?: string | null }) {
    this.secretKey = (options?.secretKey ?? process.env.STRIPE_SECRET_KEY ?? null)?.trim() ?? null
    this.webhookSecret = (options?.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET ?? null)?.trim() ?? null
  }

  isConfigured() {
    return !!this.secretKey
  }

  supportsPaymentMethod(method: 'card' | 'pix') {
    return method === 'card'  // PIX removed — card only
  }

  resolvePaymentReferences(input: ResolvePaymentReferencesInput): ProviderPaymentReferences {
    return {
      checkoutSessionId: input.checkoutSessionId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      providerPaymentId: input.providerPaymentId ?? null,
      providerCustomerId: input.providerCustomerId ?? null,
      providerReference: input.providerReference ?? input.checkoutSessionId ?? null,
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.secretKey) {
      throw new Error('Stripe provider is not configured.')
    }

    if (input.paymentMethod !== 'card') {
      throw new Error('Stripe checkout supports card only.')
    }

    // Look up the pre-created price ID from environment variables.
    // Every plan × duration combination must have a corresponding STRIPE_PRICE_* var.
    const priceId = resolvePriceId(input.planType, input.durationMonths)

    const stripe = await this.getStripeClient()

    const trialDays = input.trialDays && input.trialDays > 0 ? input.trialDays : 0
    const metadata: Record<string, string> = {
      user_id: input.userId,
      plan_type: input.planType,
      duration: String(input.durationMonths),
      payment_method: input.paymentMethod,
      trial_days: String(trialDays),
    }

    // Always subscription mode — uses the pre-created recurring price.
    // Trial: card is required upfront but not charged until trial ends.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: input.userEmail ?? undefined,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: trialDays > 0
        ? {
            trial_period_days: trialDays,
            metadata: { user_id: input.userId, plan_type: input.planType, trial_days: String(trialDays) },
          }
        : { metadata: { user_id: input.userId, plan_type: input.planType, trial_days: '0' } },
      metadata,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    })

    if (!session.url) {
      throw new Error('Stripe checkout session URL is missing.')
    }

    const references = this.resolvePaymentReferences({
      checkoutSessionId: session.id ?? null,
      providerSubscriptionId: toStringId(session.subscription),
      providerPaymentId: toStringId(session.payment_intent),
      providerReference: session.id ?? null,
    })

    if (session.customer) {
      references.providerCustomerId = toStringId(session.customer)
    }

    return {
      gateway: this.gateway,
      checkoutUrl: session.url,
      references,
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.secretKey) {
      throw new Error('Stripe provider is not configured.')
    }

    if (!subscriptionId) {
      throw new Error('Missing Stripe subscription id.')
    }

    const stripe = await this.getStripeClient()
    await stripe.subscriptions.cancel(subscriptionId)
  }

  async parseWebhookEvent(input: ProviderWebhookInput): Promise<ParsedProviderWebhookEvent | null> {
    const signature = input.headers.get('stripe-signature')
    if (!signature) {
      return null
    }

    if (!this.secretKey || !this.webhookSecret) {
      throw new Error('Stripe webhook credentials are not configured.')
    }

    const stripe = await this.getStripeClient()
    const event = stripe.webhooks.constructEvent(input.rawBody, signature, this.webhookSecret)

    const externalEvent = {
      provider: this.gateway,
      eventId: event.id ?? '',
      eventType: event.type,
      payload: event as unknown as Json,
    }

    if (!externalEvent.eventId) {
      throw new Error('Stripe event id is missing.')
    }

    // ── checkout.session.completed: initial activation (paid OR trial) ──────
    if (event.type === 'checkout.session.completed') {
      const parsedSession = stripeCheckoutSessionSchema.safeParse(event.data.object)
      if (!parsedSession.success) {
        throw new Error(`Invalid Stripe checkout payload: ${parsedSession.error.message}`)
      }

      const metadata = parsedSession.data.metadata ?? {}
      const parsedMetadata = stripeCheckoutMetadataSchema.safeParse(metadata)
      if (!parsedMetadata.success) {
        throw new Error(`Missing Stripe metadata: ${parsedMetadata.error.message}`)
      }

      const refs = this.resolvePaymentReferences({
        checkoutSessionId: parsedSession.data.id ?? null,
        providerSubscriptionId: toStringId(parsedSession.data.subscription),
        providerPaymentId: toStringId(parsedSession.data.payment_intent),
        providerReference: parsedSession.data.id ?? null,
      })

      refs.providerCustomerId = toStringId(parsedSession.data.customer)

      // Determina se é trial e calcula trial_ends_at com 3 camadas de fallback:
      //
      // 1. Busca a subscription no Stripe → usa sub.trial_end (mais preciso)
      // 2. Se a chamada falhar ou sub.trial_end não existir, mas sub.status='trialing'
      //    → usa trial_days da metadata (sessions novas têm esse campo)
      // 3. Se amount_total = 0 (sem cobrança = trial sem dúvida) e nada mais
      //    funcionou → usa TRIAL_DAYS global como fallback absoluto
      //
      // Isso cobre: sessions antigas sem trial_days metadata, falhas de API,
      // e qualquer combinação de modo test/live.
      const amountTotal = parsedSession.data.amount_total ?? 0
      const trialDaysFromMeta = parsedMetadata.data.trial_days ?? 0
      let trialEndsAt: string | null = null

      if (refs.providerSubscriptionId) {
        try {
          const stripeClient = await this.getStripeClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub: any = await stripeClient.subscriptions.retrieve(refs.providerSubscriptionId)
          const isStripeTrial = sub?.status === 'trialing'
          const stripeTrialEnd: number | null = sub?.trial_end ?? null

          if (isStripeTrial && stripeTrialEnd) {
            trialEndsAt = new Date(stripeTrialEnd * 1000).toISOString()
          } else if (isStripeTrial) {
            // trialing mas sem trial_end — usa metadata ou constante
            const days = trialDaysFromMeta > 0 ? trialDaysFromMeta : TRIAL_DAYS
            trialEndsAt = new Date(Date.now() + days * 86400 * 1000).toISOString()
          }
          // sub.status === 'active' → cobrança real, trialEndsAt fica null
        } catch {
          // API do Stripe falhou — usa sinais locais
          if (trialDaysFromMeta > 0) {
            trialEndsAt = new Date(Date.now() + trialDaysFromMeta * 86400 * 1000).toISOString()
          } else if (amountTotal === 0) {
            // amount_total=0 é prova irrefutável de trial (Stripe não cobra $0 em planos pagos)
            trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400 * 1000).toISOString()
          }
        }
      } else if (amountTotal === 0) {
        // Sem subscription ID ainda mas sem cobrança → é trial
        trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400 * 1000).toISOString()
      }

      return {
        externalEvent,
        relatedUserId: parsedMetadata.data.user_id,
        domainEvent: {
          kind: 'activate_subscription',
          payload: {
            userId: parsedMetadata.data.user_id,
            planType: parsedMetadata.data.plan_type,
            durationMonths: parsedMetadata.data.duration,
            paymentMethod: parsedMetadata.data.payment_method,
            gateway: this.gateway,
            providerEventId: externalEvent.eventId,
            providerEventType: externalEvent.eventType,
            providerSubscriptionId: refs.providerSubscriptionId,
            providerPaymentId: refs.providerPaymentId,
            providerCustomerId: refs.providerCustomerId,
            providerReference: refs.providerReference,
            amount: (parsedSession.data.amount_total ?? 0) / 100,
            trialEndsAt,
          },
        },
      }
    }

    // ── invoice.paid: trial → active conversion (or recurring renewal) ──────
    // Stripe fires this when the card is actually charged after the trial
    // period. We re-use the activate_subscription kind so the existing
    // shouldRenew logic in webhook.ts will route it through renewSubscription.
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any
      // Skip $0 invoices created at trial start (we already activated via checkout)
      const amountPaid = Number(invoice?.amount_paid ?? 0)
      const subscriptionId = typeof invoice?.subscription === 'string'
        ? invoice.subscription
        : invoice?.subscription?.id ?? null
      if (amountPaid <= 0 || !subscriptionId) {
        return {
          externalEvent,
          relatedUserId: null,
          domainEvent: { kind: 'noop', reason: 'stripe_invoice_no_charge' },
        }
      }

      // Pull metadata from the subscription (set during checkout.session creation)
      try {
        const stripeClient = await this.getStripeClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = await stripeClient.subscriptions.retrieve(subscriptionId)
        const subMeta = (sub?.metadata ?? {}) as Record<string, string>
        const userId = subMeta.user_id || (invoice?.metadata?.user_id as string | undefined) || ''
        if (!userId) {
          return {
            externalEvent,
            relatedUserId: null,
            domainEvent: { kind: 'noop', reason: 'stripe_invoice_missing_user' },
          }
        }
        const planType = (subMeta.plan_type || 'pf') as 'pf' | 'pj' | 'pro'
        const item = sub?.items?.data?.[0]
        const interval = item?.price?.recurring?.interval as string | undefined
        const intervalCount = Number(item?.price?.recurring?.interval_count ?? 1)
        const durationMonths = (
          interval === 'year' ? 12 : interval === 'month' ? Math.max(1, intervalCount) : 1
        ) as BillingDurationMonths
        const safeDuration = ([1, 3, 6, 12] as const).includes(durationMonths as 1 | 3 | 6 | 12)
          ? durationMonths
          : 1

        return {
          externalEvent,
          relatedUserId: userId,
          domainEvent: {
            kind: 'activate_subscription',
            payload: {
              userId,
              planType,
              durationMonths: safeDuration,
              paymentMethod: 'card',
              gateway: this.gateway,
              providerEventId: externalEvent.eventId,
              providerEventType: externalEvent.eventType,
              providerSubscriptionId: subscriptionId,
              providerPaymentId: typeof invoice?.payment_intent === 'string' ? invoice.payment_intent : null,
              providerCustomerId: typeof sub?.customer === 'string' ? sub.customer : sub?.customer?.id ?? null,
              providerReference: invoice?.id ?? null,
              amount: amountPaid / 100,
              trialEndsAt: null, // post-trial — full active
            },
          },
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown'
        return {
          externalEvent,
          relatedUserId: null,
          domainEvent: { kind: 'noop', reason: `stripe_invoice_lookup_failed:${msg}` },
        }
      }
    }

    return {
      externalEvent,
      relatedUserId: null,
      domainEvent: {
        kind: 'noop',
        reason: 'stripe_event_not_supported',
      },
    }
  }

  private async getStripeClient() {
    if (!this.secretKey) {
      throw new Error('Stripe provider is not configured.')
    }

    const StripeModule = await import('stripe')
    const StripeClient = StripeModule.default
    // Force Node.js native http client to avoid Next.js fetch polyfill interference
    return new StripeClient(this.secretKey, {
      apiVersion: STRIPE_API_VERSION,
      httpClient: StripeClient.createNodeHttpClient(),
    })
  }
}
