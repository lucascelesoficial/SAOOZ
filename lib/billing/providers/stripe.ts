import { z } from 'zod'
import type { Json } from '@/types/database.types'
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

    const metadata = {
      user_id: input.userId,
      plan_type: input.planType,
      duration: String(input.durationMonths),
      payment_method: input.paymentMethod,
    }

    // Always subscription mode — uses the pre-created recurring price.
    // Trial: card is required upfront but not charged until trial ends.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: input.userEmail ?? undefined,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: input.trialDays && input.trialDays > 0
        ? { trial_period_days: input.trialDays }
        : undefined,
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

    if (event.type !== 'checkout.session.completed') {
      return {
        externalEvent,
        relatedUserId: null,
        domainEvent: {
          kind: 'noop',
          reason: 'stripe_event_not_supported',
        },
      }
    }

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
        },
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
