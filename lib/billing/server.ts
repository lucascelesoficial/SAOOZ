import type { Database } from '@/types/database.types'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  FREE_LIMITS,
  TRIAL_DAYS,
  getPlanDefinition,
} from './plans'
import {
  getSubscriptionLifecycleState,
  reconcileSubscriptionLifecycle,
} from './lifecycle'

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type UsageRow = Database['public']['Tables']['usage_limits']['Row']

function isMissingBillingStructureError(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes("could not find the table 'public.subscriptions'") ||
    normalized.includes("could not find the table 'public.usage_limits'") ||
    normalized.includes("relation \"public.subscriptions\" does not exist") ||
    normalized.includes("relation \"public.usage_limits\" does not exist") ||
    normalized.includes('schema cache')
  )
}

export interface BillingSnapshot {
  subscription: SubscriptionRow
  usage: UsageRow
  lifecycleStatus: SubscriptionRow['status']
  paidAccess: boolean
  trialAccess: boolean
  premiumAccess: boolean
  aiActionsLimit: number | null
  transactionsLimit: number | null
  trialDaysRemaining: number
}

export class BillingLimitError extends Error {
  code: string
  limit: number

  constructor(message: string, code: string, limit: number) {
    super(message)
    this.name = 'BillingLimitError'
    this.code = code
    this.limit = limit
  }
}

function startOfCurrentMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function toDateOnly(date: Date) {
  return date.toISOString().split('T')[0]
}

function buildDefaultSubscription(userId: string, now = new Date()): SubscriptionRow {
  const trialEndsAt = new Date(now)
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

  return {
    id: '',
    user_id: userId,
    plan_type: 'pf',
    status: 'trialing',
    trial_ends_at: trialEndsAt.toISOString(),
    current_period_end: null,
    billing_duration_months: 1,
    payment_method: 'none',
    gateway: null,
    gateway_customer_id: null,
    gateway_event_id: null,
    gateway_subscription_id: null,
    started_at: now.toISOString(),
    canceled_at: null,
    cancel_at_period_end: false,
    ended_at: null,
    last_billing_error: null,
    provider_reference: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }
}

function buildDefaultUsage(userId: string, now = new Date()): UsageRow {
  const monthStart = startOfCurrentMonth(now)

  return {
    user_id: userId,
    transactions_used: 0,
    ai_actions_used: 0,
    reset_date: toDateOnly(monthStart),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }
}

async function readSubscription(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Billing readSubscription fallback:', error.message)
    return null
  }

  return data
}

async function readUsage(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Billing readUsage fallback:', error.message)
    return null
  }

  return data
}

async function ensureSubscription(userId: string, now = new Date()) {
  const existing = await readSubscription(userId)
  if (existing) {
    return existing
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    return buildDefaultSubscription(userId, now)
  }

  const fallback = buildDefaultSubscription(userId, now)
  const { data: created, error: insertError } = await admin
    .from('subscriptions')
    .insert({
      user_id: fallback.user_id,
      plan_type: fallback.plan_type,
      status: fallback.status,
      trial_ends_at: fallback.trial_ends_at,
      current_period_end: fallback.current_period_end,
      payment_method: fallback.payment_method,
      gateway: fallback.gateway,
      gateway_subscription_id: fallback.gateway_subscription_id,
    })
    .select('*')
    .single()

  if (insertError) {
    if (isMissingBillingStructureError(insertError.message)) {
      return fallback
    }

    throw new Error(insertError.message)
  }

  return created
}

async function ensureUsage(userId: string, now = new Date()) {
  const existing = await readUsage(userId)
  if (existing) {
    return existing
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    return buildDefaultUsage(userId, now)
  }

  const fallback = buildDefaultUsage(userId, now)
  const { data: created, error: insertError } = await admin
    .from('usage_limits')
    .insert({
      user_id: fallback.user_id,
      transactions_used: fallback.transactions_used,
      ai_actions_used: fallback.ai_actions_used,
      reset_date: fallback.reset_date,
    })
    .select('*')
    .single()

  if (insertError) {
    if (isMissingBillingStructureError(insertError.message)) {
      return fallback
    }

    throw new Error(insertError.message)
  }

  return created
}

function applyDerivedLifecycleStatus(subscription: SubscriptionRow, now = new Date()) {
  const lifecycle = getSubscriptionLifecycleState(subscription, now)
  if (lifecycle.effectiveStatus === subscription.status) {
    return subscription
  }

  const derived: SubscriptionRow = {
    ...subscription,
    status: lifecycle.effectiveStatus,
  }

  if (
    (lifecycle.effectiveStatus === 'expired' || lifecycle.effectiveStatus === 'inactive') &&
    !derived.ended_at
  ) {
    derived.ended_at = now.toISOString()
  }

  return derived
}

async function normalizeSubscriptionLifecycle(subscription: SubscriptionRow, now = new Date()) {
  const lifecycle = getSubscriptionLifecycleState(subscription, now)
  if (lifecycle.effectiveStatus === subscription.status) {
    return subscription
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    return applyDerivedLifecycleStatus(subscription, now)
  }

  try {
    return await reconcileSubscriptionLifecycle(admin, subscription, now)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('Billing lifecycle reconcile fallback:', message)
    return applyDerivedLifecycleStatus(subscription, now)
  }
}

async function normalizeUsageWindow(usage: UsageRow, now = new Date()) {
  const currentResetDate = toDateOnly(startOfCurrentMonth(now))

  if (usage.reset_date === currentResetDate) {
    return usage
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    return {
      ...usage,
      transactions_used: 0,
      ai_actions_used: 0,
      reset_date: currentResetDate,
      updated_at: now.toISOString(),
    }
  }

  const { data, error } = await admin
    .from('usage_limits')
    .update({
      transactions_used: 0,
      ai_actions_used: 0,
      reset_date: currentResetDate,
    })
    .eq('user_id', usage.user_id)
    .select('*')
    .single()

  if (error) {
    if (isMissingBillingStructureError(error.message)) {
      return {
        ...usage,
        transactions_used: 0,
        ai_actions_used: 0,
        reset_date: currentResetDate,
        updated_at: now.toISOString(),
      }
    }

    throw new Error(error.message)
  }

  return data
}

function computeTrialDaysRemaining(subscription: SubscriptionRow, now = new Date()) {
  // Count days whether status is 'trialing' OR 'active' with a future trial_ends_at.
  // The latter happens when Stripe transitions the subscription before our
  // invoice.paid webhook updates our DB record.
  if (!subscription.trial_ends_at) return 0
  const diffMs = new Date(subscription.trial_ends_at).getTime() - now.getTime()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function computeAiActionsLimit(subscription: SubscriptionRow, now = new Date()) {
  const lifecycle = getSubscriptionLifecycleState(subscription, now)

  if (lifecycle.trialAccess) {
    return FREE_LIMITS.aiActions
  }

  if (!lifecycle.paidAccess && !lifecycle.canceledGraceAccess) {
    return FREE_LIMITS.aiActions
  }

  return getPlanDefinition(subscription.plan_type).aiActionsLimit
}

function computeTransactionsLimit(subscription: SubscriptionRow, now = new Date()) {
  const lifecycle = getSubscriptionLifecycleState(subscription, now)

  if (lifecycle.trialAccess) {
    return FREE_LIMITS.transactions
  }

  if (!lifecycle.paidAccess && !lifecycle.canceledGraceAccess) {
    return FREE_LIMITS.transactions
  }

  return null
}

export async function getBillingSnapshot(
  userId: string,
  now = new Date()
): Promise<BillingSnapshot> {
  try {
    const [subscriptionSeed, usageSeed] = await Promise.all([
      ensureSubscription(userId, now),
      ensureUsage(userId, now),
    ])

    const subscription = await normalizeSubscriptionLifecycle(subscriptionSeed, now)
    const lifecycle = getSubscriptionLifecycleState(subscription, now)
    const usage = await normalizeUsageWindow(usageSeed, now)
    const paidAccess = lifecycle.paidAccess || lifecycle.canceledGraceAccess

    return {
      subscription,
      usage,
      lifecycleStatus: lifecycle.effectiveStatus,
      paidAccess,
      trialAccess: lifecycle.trialAccess,
      premiumAccess: lifecycle.hasProductAccess,
      aiActionsLimit: computeAiActionsLimit(subscription, now),
      transactionsLimit: computeTransactionsLimit(subscription, now),
      trialDaysRemaining: computeTrialDaysRemaining(subscription, now),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('Billing snapshot hard fallback:', message)

    const subscription = buildDefaultSubscription(userId, now)
    const usage = buildDefaultUsage(userId, now)

    return {
      subscription,
      usage,
      lifecycleStatus: 'trialing',
      paidAccess: false,
      trialAccess: true,
      premiumAccess: true,
      aiActionsLimit: FREE_LIMITS.aiActions,
      transactionsLimit: FREE_LIMITS.transactions,
      trialDaysRemaining: computeTrialDaysRemaining(subscription, now),
    }
  }
}

export async function consumeAiAction(userId: string) {
  const snapshot = await getBillingSnapshot(userId)
  const limit = snapshot.aiActionsLimit

  if (limit !== null && snapshot.usage.ai_actions_used >= limit) {
    throw new BillingLimitError(
      'Voce atingiu o limite mensal de acoes de IA do seu plano atual.',
      'ai_limit_reached',
      limit
    )
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    console.warn(
      'Supabase admin credentials are not configured. AI usage will not be persisted.'
    )

    return {
      ...snapshot,
      usage: {
        ...snapshot.usage,
        ai_actions_used: snapshot.usage.ai_actions_used + 1,
        updated_at: new Date().toISOString(),
      },
    }
  }

  const { data, error } = await admin
    .from('usage_limits')
    .update({
      ai_actions_used: snapshot.usage.ai_actions_used + 1,
    })
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    console.warn('Billing consumeAiAction fallback:', error.message)
    return {
      ...snapshot,
      usage: {
        ...snapshot.usage,
        ai_actions_used: snapshot.usage.ai_actions_used + 1,
        updated_at: new Date().toISOString(),
      },
    }
  }

  return {
    ...snapshot,
    usage: data,
  }
}
