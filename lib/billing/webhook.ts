import { createHash } from 'crypto'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BillingActivationDomainPayload,
  ParsedProviderWebhookEvent,
} from '@/lib/billing/providers'
import type { BillingGateway, Database, Json } from '@/types/database.types'
import { activateSubscription, renewSubscription } from '@/lib/billing/lifecycle'

type AdminClient = SupabaseClient<Database>

const planTypeSchema = z.enum(['pf', 'pj', 'pro'])
const durationSchema = z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])
const paymentMethodSchema = z.enum(['card', 'pix'])
const gatewaySchema = z.enum(['stripe', 'kiwify', 'cakto']).nullable()

const manualWebhookBodySchema = z.object({
  userId: z.string().min(1),
  planType: planTypeSchema,
  duration: z.coerce.number().pipe(durationSchema),
  paymentMethod: paymentMethodSchema,
  gateway: gatewaySchema,
  amount: z.coerce.number().finite().nonnegative(),
  gatewayPaymentId: z.string().min(1).optional(),
  providerEventId: z.string().min(1).optional(),
  providerEventType: z.string().min(1).optional(),
  providerSubscriptionId: z.string().min(1).optional(),
  providerPaymentId: z.string().min(1).optional(),
  providerCustomerId: z.string().min(1).optional(),
  providerReference: z.string().min(1).optional(),
})

const activationPayloadSchema = z.object({
  userId: z.string().min(1),
  planType: planTypeSchema,
  duration: durationSchema,
  paymentMethod: paymentMethodSchema,
  gateway: gatewaySchema,
  providerEventId: z.string().min(1),
  providerEventType: z.string().min(1),
  providerSubscriptionId: z.string().min(1).nullable(),
  providerPaymentId: z.string().min(1).nullable(),
  providerCustomerId: z.string().min(1).nullable(),
  providerReference: z.string().min(1).nullable(),
  amount: z.number().finite().nonnegative(),
  trialEndsAt: z.string().min(1).nullable().optional(),
})

export type BillingWebhookProvider = BillingGateway | 'manual'
export type BillingActivationPayload = z.infer<typeof activationPayloadSchema>

export type BillingWebhookAction =
  | {
      type: 'activate_subscription'
      eventType: string
      payload: BillingActivationPayload
    }
  | { type: 'noop'; eventType: string }

export interface BillingWebhookEnvelope {
  provider: BillingWebhookProvider
  eventId: string
  eventType: string
  rawPayload: Json
  relatedUserId: string | null
  externalEvent: {
    provider: BillingWebhookProvider
    eventId: string
    eventType: string
  }
  action: BillingWebhookAction
}

interface UpdateWebhookEventStatusInput {
  eventStatus: 'processing' | 'processed' | 'failed'
  processedAt?: string
  errorMessage?: string | null
  relatedSubscriptionId?: string | null
}

function asJsonObject(raw: string): Json {
  try {
    return JSON.parse(raw) as Json
  } catch {
    return { raw }
  }
}

function coerceEventId(seed: string, provider: BillingWebhookProvider, body: string) {
  if (seed.trim().length > 0) {
    return seed.trim()
  }

  return createHash('sha256').update(`${provider}:${body}`).digest('hex')
}

function parseActivationPayloadFromProvider(
  payload: BillingActivationDomainPayload
): BillingActivationPayload {
  return activationPayloadSchema.parse({
    userId: payload.userId,
    planType: payload.planType,
    duration: payload.durationMonths,
    paymentMethod: payload.paymentMethod,
    gateway: payload.gateway,
    providerEventId: payload.providerEventId,
    providerEventType: payload.providerEventType,
    providerSubscriptionId: payload.providerSubscriptionId,
    providerPaymentId: payload.providerPaymentId,
    providerCustomerId: payload.providerCustomerId,
    providerReference: payload.providerReference,
    amount: payload.amount,
    trialEndsAt: payload.trialEndsAt ?? null,
  })
}

export function normalizeProviderWebhookEvent(
  parsedEvent: ParsedProviderWebhookEvent
): BillingWebhookEnvelope {
  const provider = parsedEvent.externalEvent.provider
  const eventId = parsedEvent.externalEvent.eventId
  const eventType = parsedEvent.externalEvent.eventType
  const rawPayload = parsedEvent.externalEvent.payload

  if (parsedEvent.domainEvent.kind === 'noop') {
    return {
      provider,
      eventId,
      eventType,
      rawPayload,
      relatedUserId: parsedEvent.relatedUserId,
      externalEvent: {
        provider,
        eventId,
        eventType,
      },
      action: {
        type: 'noop',
        eventType,
      },
    }
  }

  const activation = parseActivationPayloadFromProvider(parsedEvent.domainEvent.payload)

  return {
    provider,
    eventId: activation.providerEventId,
    eventType: activation.providerEventType,
    rawPayload,
    relatedUserId: activation.userId,
    externalEvent: {
      provider,
      eventId: activation.providerEventId,
      eventType: activation.providerEventType,
    },
    action: {
      type: 'activate_subscription',
      eventType: activation.providerEventType,
      payload: activation,
    },
  }
}

export function normalizeManualWebhookEvent(
  rawBody: string,
  headerEventId: string | null
): BillingWebhookEnvelope {
  const parsedRaw = asJsonObject(rawBody)
  const parsedBody = manualWebhookBodySchema.safeParse(parsedRaw)

  if (!parsedBody.success) {
    throw new Error(`Invalid manual billing webhook payload: ${parsedBody.error.message}`)
  }

  const provider: BillingWebhookProvider = parsedBody.data.gateway ?? 'manual'
  const eventType = parsedBody.data.providerEventType ?? 'manual.confirmed'
  const eventId = coerceEventId(
    parsedBody.data.providerEventId ?? headerEventId ?? '',
    provider,
    rawBody
  )

  const activation = activationPayloadSchema.parse({
    userId: parsedBody.data.userId,
    planType: parsedBody.data.planType,
    duration: parsedBody.data.duration,
    paymentMethod: parsedBody.data.paymentMethod,
    gateway: parsedBody.data.gateway,
    providerEventId: eventId,
    providerEventType: eventType,
    providerSubscriptionId: parsedBody.data.providerSubscriptionId ?? null,
    providerPaymentId:
      parsedBody.data.providerPaymentId ?? parsedBody.data.gatewayPaymentId ?? null,
    providerCustomerId: parsedBody.data.providerCustomerId ?? null,
    providerReference: parsedBody.data.providerReference ?? null,
    amount: parsedBody.data.amount,
  })

  return {
    provider,
    eventId: activation.providerEventId,
    eventType: activation.providerEventType,
    rawPayload: parsedRaw,
    relatedUserId: activation.userId,
    externalEvent: {
      provider,
      eventId: activation.providerEventId,
      eventType: activation.providerEventType,
    },
    action: {
      type: 'activate_subscription',
      eventType: 'manual.confirmed',
      payload: activation,
    },
  }
}

export async function persistBillingWebhookEventReceived(
  admin: AdminClient,
  event: BillingWebhookEnvelope
) {
  // Guard: event_id must be non-empty. Null/empty event_ids bypass PostgreSQL
  // unique index deduplication because NULL != NULL in unique indexes.
  const safeEventId = event.eventId?.trim() || null
  if (!safeEventId) {
    throw new Error(
      `Billing webhook event_id is missing or empty for provider "${event.provider}". Cannot guarantee idempotency.`
    )
  }

  const { data, error } = await admin
    .from('billing_webhook_events')
    .insert({
      provider: event.provider,
      event_id: safeEventId,
      event_type: event.eventType,
      event_status: 'received',
      payload: event.rawPayload,
      related_user_id: event.relatedUserId,
    })
    .select('id,event_status,processed_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      const { data: existing, error: lookupError } = await admin
        .from('billing_webhook_events')
        .select('id,event_status,processed_at')
        .eq('provider', event.provider)
        .eq('event_id', event.eventId)
        .maybeSingle()

      if (lookupError) {
        throw new Error(lookupError.message)
      }

      return {
        duplicate: true as const,
        eventId: existing?.id ?? null,
        status: existing?.event_status ?? null,
      }
    }

    throw new Error(error.message)
  }

  return {
    duplicate: false as const,
    eventId: data.id,
    status: data.event_status,
  }
}

export async function updateBillingWebhookEventStatus(
  admin: AdminClient,
  webhookEventId: string,
  input: UpdateWebhookEventStatusInput
) {
  const { error } = await admin
    .from('billing_webhook_events')
    .update({
      event_status: input.eventStatus,
      processed_at: input.processedAt ?? null,
      error_message: input.errorMessage ?? null,
      related_subscription_id: input.relatedSubscriptionId ?? null,
    })
    .eq('id', webhookEventId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function processBillingWebhookEvent(
  admin: AdminClient,
  event: BillingWebhookEnvelope
) {
  if (event.action.type === 'noop') {
    return {
      processed: false,
      reason: 'event_not_supported',
      relatedSubscriptionId: null as string | null,
    }
  }

  const payload = event.action.payload
  const nowIso = new Date().toISOString()

  const { data: existingSubscription, error: existingSubscriptionError } = await admin
    .from('subscriptions')
    .select('status,current_period_end')
    .eq('user_id', payload.userId)
    .maybeSingle()

  if (existingSubscriptionError) {
    throw new Error(existingSubscriptionError.message)
  }

  // Use renewSubscription when a subscription record already exists and is in
  // a post-trial state. trialing is intentionally excluded: first conversions
  // go through activateSubscription to set all initial fields cleanly.
  const shouldRenew =
    !!existingSubscription &&
    (existingSubscription.status === 'active' ||
      existingSubscription.status === 'past_due' ||
      existingSubscription.status === 'canceled' ||
      existingSubscription.status === 'expired' ||
      existingSubscription.status === 'inactive')

  // NOTE: these three operations are not wrapped in a DB transaction.
  // Supabase does not expose server-side transactions over the REST API.
  // The webhook event deduplication (via unique index on event_id) ensures
  // this block runs at most once per payment event, which limits the blast
  // radius of any partial failure. If a partial failure does occur:
  //   - subscription updated but usage reset failed → usage stays stale (non-fatal)
  //   - subscription updated but payment insert failed → orphaned active sub
  //     → visible in admin observability (no payment record for active sub)
  //     → recoverable by replaying the webhook event
  const subscription = shouldRenew
    ? await renewSubscription(admin, {
        userId: payload.userId,
        planType: payload.planType,
        durationMonths: payload.duration,
        paymentMethod: payload.paymentMethod,
        gateway: payload.gateway,
        gatewayEventId: payload.providerEventId,
        gatewaySubscriptionId: payload.providerSubscriptionId,
        gatewayCustomerId: payload.providerCustomerId,
        providerReference: payload.providerReference,
      })
    : await activateSubscription(admin, {
        userId: payload.userId,
        planType: payload.planType,
        durationMonths: payload.duration,
        paymentMethod: payload.paymentMethod,
        gateway: payload.gateway,
        gatewayEventId: payload.providerEventId,
        gatewaySubscriptionId: payload.providerSubscriptionId,
        gatewayCustomerId: payload.providerCustomerId,
        providerReference: payload.providerReference,
        trialEndsAt: payload.trialEndsAt ?? null,
      })

  const { error: usageError } = await admin.from('usage_limits').upsert(
    {
      user_id: payload.userId,
      transactions_used: 0,
      ai_actions_used: 0,
      reset_date: nowIso.split('T')[0],
    },
    { onConflict: 'user_id' }
  )

  if (usageError) {
    throw new Error(usageError.message)
  }

  const { error: paymentError } = await admin.from('payments').insert({
    user_id: payload.userId,
    subscription_id: subscription.id,
    amount: payload.amount,
    status: 'paid',
    payment_method: payload.paymentMethod,
    gateway: payload.gateway,
    gateway_payment_id: payload.providerPaymentId,
    currency: 'BRL',
    paid_at: nowIso,
    provider_event_id: payload.providerEventId,
    raw_reference: payload.providerReference,
  })

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  return {
    processed: true,
    reason: 'subscription_activated',
    relatedSubscriptionId: subscription.id,
  }
}
