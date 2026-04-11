import type { BillingSnapshot } from './server'
import { getBusinessAccountLimit, getPlanDefinition } from './plans'
import { getSubscriptionLifecycleState } from './lifecycle'

type BillingDurationMonths = 1 | 3 | 6 | 12

export interface BillingAccess {
  personalModule: boolean
  businessModule: boolean
  canCreateBusiness: boolean
  advancedInsights: boolean
  maxBusinessAccounts: number
  billingDurationMonths: BillingDurationMonths
}

function normalizeDuration(value: number | null | undefined): BillingDurationMonths {
  if (value === 3 || value === 6 || value === 12) {
    return value
  }
  return 1
}

function inferDurationFromPeriod(snapshot: BillingSnapshot): BillingDurationMonths {
  const periodEnd = snapshot.subscription.current_period_end
  if (!periodEnd) {
    return normalizeDuration(snapshot.subscription.billing_duration_months)
  }

  // Use started_at as the billing period baseline. updated_at is wrong here:
  // any status update (e.g. past_due) shifts it and produces bad inference.
  // Fall back to created_at if started_at is not set (legacy rows).
  const referenceRaw =
    snapshot.subscription.started_at ?? snapshot.subscription.created_at ?? new Date().toISOString()
  const referenceDate = new Date(referenceRaw)
  const periodEndDate = new Date(periodEnd)

  const diffDays = Math.max(
    1,
    Math.round((periodEndDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  if (diffDays >= 330) return 12
  if (diffDays >= 170) return 6
  if (diffDays >= 80) return 3
  return normalizeDuration(snapshot.subscription.billing_duration_months)
}

function resolveBillingDuration(snapshot: BillingSnapshot): BillingDurationMonths {
  const fromSubscription = normalizeDuration(snapshot.subscription.billing_duration_months)
  if (snapshot.subscription.billing_duration_months) {
    return fromSubscription
  }

  return inferDurationFromPeriod(snapshot)
}

function resolveMaxBusinessAccounts(
  snapshot: BillingSnapshot,
  billingDurationMonths: BillingDurationMonths
) {
  const lifecycle = getSubscriptionLifecycleState(snapshot.subscription)

  if (lifecycle.trialAccess) {
    return 1
  }

  if (!lifecycle.paidAccess && !lifecycle.canceledGraceAccess) {
    return 0
  }

  return getBusinessAccountLimit(snapshot.subscription.plan_type, billingDurationMonths)
}

export function isTrialAccess(snapshot: BillingSnapshot) {
  return snapshot.trialAccess
}

export function isActivePaidAccess(snapshot: BillingSnapshot) {
  return snapshot.paidAccess
}

export function getBillingAccess(snapshot: BillingSnapshot): BillingAccess {
  const billingDurationMonths = resolveBillingDuration(snapshot)
  const maxBusinessAccounts = resolveMaxBusinessAccounts(snapshot, billingDurationMonths)

  if (isTrialAccess(snapshot)) {
    return {
      personalModule: true,
      businessModule: true,
      canCreateBusiness: maxBusinessAccounts > 0,
      advancedInsights: true,
      maxBusinessAccounts,
      billingDurationMonths,
    }
  }

  if (isActivePaidAccess(snapshot)) {
    const plan = getPlanDefinition(snapshot.subscription.plan_type)
    const businessModule = plan.supportsBusiness

    return {
      personalModule: plan.supportsPersonal,
      businessModule,
      canCreateBusiness: businessModule && maxBusinessAccounts > 0,
      advancedInsights: plan.advancedInsights,
      maxBusinessAccounts,
      billingDurationMonths,
    }
  }

  return {
    personalModule: true,
    businessModule: false,
    canCreateBusiness: false,
    advancedInsights: false,
    maxBusinessAccounts: 0,
    billingDurationMonths: 1,
  }
}

export function getUpgradeHref(feature: 'personal' | 'business' | 'business_limit' | 'advanced') {
  return `/planos?feature=${feature}`
}
