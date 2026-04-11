import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BillingGateway,
  Database,
  SubscriptionPaymentMethod,
  SubscriptionPlanType,
  SubscriptionStatus,
} from '@/types/database.types'

type AdminClient = SupabaseClient<Database>
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type BillingDurationMonths = 1 | 3 | 6 | 12

/**
 * Regras formais de transicao:
 * - trialing -> active | inactive | canceled
 * - active -> past_due | canceled
 * - past_due -> active | canceled | inactive
 * - canceled -> expired | active
 * - expired -> active
 * - inactive -> active
 *
 * Qualquer transicao fora dessa matriz e bloqueada.
 */
export const SUBSCRIPTION_STATUS_TRANSITIONS: Record<
  SubscriptionStatus,
  readonly SubscriptionStatus[]
> = {
  trialing: ['active', 'inactive', 'canceled'],
  active: ['past_due', 'canceled'],
  past_due: ['active', 'canceled', 'inactive'],
  canceled: ['expired', 'active'],
  expired: ['active'],
  inactive: ['active'],
}

export class BillingLifecycleTransitionError extends Error {
  fromStatus: SubscriptionStatus
  toStatus: SubscriptionStatus

  constructor(fromStatus: SubscriptionStatus, toStatus: SubscriptionStatus) {
    super(`Invalid subscription transition from "${fromStatus}" to "${toStatus}".`)
    this.name = 'BillingLifecycleTransitionError'
    this.fromStatus = fromStatus
    this.toStatus = toStatus
  }
}

function toDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function nowIso(now: Date) {
  return now.toISOString()
}

function addMonths(base: Date, months: BillingDurationMonths) {
  const copy = new Date(base.getTime())
  copy.setMonth(copy.getMonth() + months)
  return copy
}

function normalizeDuration(duration: number): BillingDurationMonths {
  if (duration === 3 || duration === 6 || duration === 12) {
    return duration
  }
  return 1
}

export function isSubscriptionTransitionAllowed(
  fromStatus: SubscriptionStatus,
  toStatus: SubscriptionStatus
) {
  if (fromStatus === toStatus) {
    return true
  }

  return SUBSCRIPTION_STATUS_TRANSITIONS[fromStatus].includes(toStatus)
}

export function assertSubscriptionTransition(
  fromStatus: SubscriptionStatus,
  toStatus: SubscriptionStatus
) {
  if (!isSubscriptionTransitionAllowed(fromStatus, toStatus)) {
    throw new BillingLifecycleTransitionError(fromStatus, toStatus)
  }
}

export interface SubscriptionLifecycleState {
  effectiveStatus: SubscriptionStatus
  trialAccess: boolean
  paidAccess: boolean
  canceledGraceAccess: boolean
  hasProductAccess: boolean
}

export function getSubscriptionLifecycleState(
  subscription: SubscriptionRow,
  now = new Date()
): SubscriptionLifecycleState {
  const trialEndsAt = toDate(subscription.trial_ends_at)
  const currentPeriodEnd = toDate(subscription.current_period_end)
  const endedAt = toDate(subscription.ended_at)

  let effectiveStatus: SubscriptionStatus = subscription.status

  if (subscription.status === 'trialing' && trialEndsAt && trialEndsAt.getTime() < now.getTime()) {
    effectiveStatus = 'inactive'
  } else if (
    subscription.status === 'canceled' &&
    ((endedAt && endedAt.getTime() <= now.getTime()) ||
      (currentPeriodEnd && currentPeriodEnd.getTime() <= now.getTime()))
  ) {
    effectiveStatus = 'expired'
  } else if (
    subscription.status === 'past_due' &&
    currentPeriodEnd &&
    currentPeriodEnd.getTime() <= now.getTime()
  ) {
    effectiveStatus = 'inactive'
  } else if (
    subscription.status === 'active' &&
    subscription.cancel_at_period_end &&
    currentPeriodEnd &&
    currentPeriodEnd.getTime() <= now.getTime()
  ) {
    effectiveStatus = 'expired'
  }

  const trialAccess =
    effectiveStatus === 'trialing' &&
    !!trialEndsAt &&
    trialEndsAt.getTime() >= now.getTime()

  const paidAccess = effectiveStatus === 'active'

  const canceledGraceAccess =
    effectiveStatus === 'canceled' &&
    !!currentPeriodEnd &&
    currentPeriodEnd.getTime() >= now.getTime() &&
    (!endedAt || endedAt.getTime() > now.getTime())

  const hasProductAccess = trialAccess || paidAccess || canceledGraceAccess

  return {
    effectiveStatus,
    trialAccess,
    paidAccess,
    canceledGraceAccess,
    hasProductAccess,
  }
}

async function readSubscriptionByUserId(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function updateSubscriptionByUserId(
  admin: AdminClient,
  userId: string,
  updates: Database['public']['Tables']['subscriptions']['Update']
) {
  const { data, error } = await admin
    .from('subscriptions')
    .update(updates)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

interface ActivationLikeInput {
  userId: string
  planType: SubscriptionPlanType
  durationMonths: BillingDurationMonths
  paymentMethod: SubscriptionPaymentMethod
  gateway: BillingGateway | null
  gatewayEventId?: string | null
  gatewayCustomerId?: string | null
  gatewaySubscriptionId?: string | null
  providerReference?: string | null
  now?: Date
}

export async function activateSubscription(
  admin: AdminClient,
  input: ActivationLikeInput
) {
  const now = input.now ?? new Date()
  const nowAsIso = nowIso(now)
  const current = await readSubscriptionByUserId(admin, input.userId)

  if (!current) {
    const periodEnd = addMonths(now, normalizeDuration(input.durationMonths))
    const { data, error } = await admin
      .from('subscriptions')
      .insert({
        user_id: input.userId,
        plan_type: input.planType,
        status: 'active',
        trial_ends_at: null,
        current_period_end: periodEnd.toISOString(),
        billing_duration_months: normalizeDuration(input.durationMonths),
        payment_method: input.paymentMethod,
        gateway: input.gateway,
        gateway_event_id: input.gatewayEventId ?? null,
        gateway_customer_id: input.gatewayCustomerId ?? null,
        gateway_subscription_id: input.gatewaySubscriptionId ?? null,
        started_at: nowAsIso,
        canceled_at: null,
        cancel_at_period_end: false,
        ended_at: null,
        last_billing_error: null,
        provider_reference: input.providerReference ?? null,
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const lifecycle = getSubscriptionLifecycleState(current, now)
  assertSubscriptionTransition(lifecycle.effectiveStatus, 'active')

  return updateSubscriptionByUserId(admin, input.userId, {
    status: 'active',
    plan_type: input.planType,
    billing_duration_months: normalizeDuration(input.durationMonths),
    payment_method: input.paymentMethod,
    gateway: input.gateway,
    gateway_event_id: input.gatewayEventId ?? null,
    gateway_customer_id: input.gatewayCustomerId ?? null,
    gateway_subscription_id: input.gatewaySubscriptionId ?? null,
    provider_reference: input.providerReference ?? null,
    trial_ends_at: null,
    current_period_end: addMonths(now, normalizeDuration(input.durationMonths)).toISOString(),
    started_at: current.started_at ?? nowAsIso,
    canceled_at: null,
    cancel_at_period_end: false,
    ended_at: null,
    last_billing_error: null,
  })
}

interface RenewSubscriptionInput extends ActivationLikeInput {
  extendFromCurrentPeriod?: boolean
}

export async function renewSubscription(
  admin: AdminClient,
  input: RenewSubscriptionInput
) {
  const now = input.now ?? new Date()
  const nowAsIso = nowIso(now)
  const current = await readSubscriptionByUserId(admin, input.userId)

  if (!current) {
    return activateSubscription(admin, input)
  }

  const lifecycle = getSubscriptionLifecycleState(current, now)
  assertSubscriptionTransition(lifecycle.effectiveStatus, 'active')

  const currentPeriodEnd = toDate(current.current_period_end)
  const shouldExtendFromCurrentPeriod = input.extendFromCurrentPeriod ?? true
  const baseDate =
    shouldExtendFromCurrentPeriod &&
    currentPeriodEnd &&
    currentPeriodEnd.getTime() > now.getTime()
      ? currentPeriodEnd
      : now

  return updateSubscriptionByUserId(admin, input.userId, {
    status: 'active',
    plan_type: input.planType,
    billing_duration_months: normalizeDuration(input.durationMonths),
    payment_method: input.paymentMethod,
    gateway: input.gateway,
    gateway_event_id: input.gatewayEventId ?? null,
    gateway_customer_id: input.gatewayCustomerId ?? null,
    gateway_subscription_id: input.gatewaySubscriptionId ?? null,
    provider_reference: input.providerReference ?? null,
    trial_ends_at: null,
    current_period_end: addMonths(baseDate, normalizeDuration(input.durationMonths)).toISOString(),
    started_at: current.started_at ?? nowAsIso,
    canceled_at: null,
    cancel_at_period_end: false,
    ended_at: null,
    last_billing_error: null,
  })
}

interface MarkPastDueInput {
  userId: string
  gatewayEventId?: string | null
  billingError?: string | null
  now?: Date
}

export async function markSubscriptionPastDue(
  admin: AdminClient,
  input: MarkPastDueInput
) {
  const now = input.now ?? new Date()
  const current = await readSubscriptionByUserId(admin, input.userId)

  if (!current) {
    throw new Error('Subscription not found.')
  }

  const lifecycle = getSubscriptionLifecycleState(current, now)
  assertSubscriptionTransition(lifecycle.effectiveStatus, 'past_due')

  return updateSubscriptionByUserId(admin, input.userId, {
    status: 'past_due',
    gateway_event_id: input.gatewayEventId ?? current.gateway_event_id ?? null,
    last_billing_error: input.billingError ?? current.last_billing_error ?? 'payment_failed',
  })
}

interface CancelSubscriptionInput {
  userId: string
  cancelAtPeriodEnd?: boolean
  now?: Date
}

export async function cancelSubscription(
  admin: AdminClient,
  input: CancelSubscriptionInput
) {
  const now = input.now ?? new Date()
  const nowAsIso = nowIso(now)
  const current = await readSubscriptionByUserId(admin, input.userId)

  if (!current) {
    throw new Error('Subscription not found.')
  }

  const lifecycle = getSubscriptionLifecycleState(current, now)
  assertSubscriptionTransition(lifecycle.effectiveStatus, 'canceled')

  const cancelAtPeriodEnd = input.cancelAtPeriodEnd ?? true
  const effectivePeriodEnd = cancelAtPeriodEnd
    ? current.current_period_end ?? nowAsIso
    : nowAsIso

  return updateSubscriptionByUserId(admin, input.userId, {
    status: 'canceled',
    canceled_at: current.canceled_at ?? nowAsIso,
    cancel_at_period_end: cancelAtPeriodEnd,
    current_period_end: effectivePeriodEnd,
    ended_at: cancelAtPeriodEnd ? null : nowAsIso,
  })
}

interface ExpireSubscriptionInput {
  userId: string
  now?: Date
}

export async function expireSubscription(
  admin: AdminClient,
  input: ExpireSubscriptionInput
) {
  const now = input.now ?? new Date()
  const nowAsIso = nowIso(now)
  const current = await readSubscriptionByUserId(admin, input.userId)

  if (!current) {
    throw new Error('Subscription not found.')
  }

  const lifecycle = getSubscriptionLifecycleState(current, now)
  if (lifecycle.effectiveStatus === 'expired') {
    return current
  }

  assertSubscriptionTransition(lifecycle.effectiveStatus, 'expired')

  return updateSubscriptionByUserId(admin, input.userId, {
    status: 'expired',
    cancel_at_period_end: false,
    ended_at: current.ended_at ?? nowAsIso,
  })
}

const AUTO_RECONCILE_TRANSITIONS = new Set([
  'trialing->inactive',
  'past_due->inactive',
  'canceled->expired',
  'active->expired',
])

export async function reconcileSubscriptionLifecycle(
  admin: AdminClient,
  subscription: SubscriptionRow,
  now = new Date()
) {
  const lifecycle = getSubscriptionLifecycleState(subscription, now)
  if (lifecycle.effectiveStatus === subscription.status) {
    return subscription
  }

  const transitionKey = `${subscription.status}->${lifecycle.effectiveStatus}`
  if (!AUTO_RECONCILE_TRANSITIONS.has(transitionKey)) {
    throw new BillingLifecycleTransitionError(subscription.status, lifecycle.effectiveStatus)
  }

  if (!isSubscriptionTransitionAllowed(subscription.status, lifecycle.effectiveStatus)) {
    throw new BillingLifecycleTransitionError(subscription.status, lifecycle.effectiveStatus)
  }

  const nowAsIso = nowIso(now)
  const updates: Database['public']['Tables']['subscriptions']['Update'] = {
    status: lifecycle.effectiveStatus,
  }

  if (lifecycle.effectiveStatus === 'inactive') {
    updates.ended_at = subscription.ended_at ?? nowAsIso
    updates.cancel_at_period_end = false
  }

  if (lifecycle.effectiveStatus === 'expired') {
    updates.ended_at = subscription.ended_at ?? nowAsIso
    updates.cancel_at_period_end = false
  }

  return updateSubscriptionByUserId(admin, subscription.user_id, updates)
}
