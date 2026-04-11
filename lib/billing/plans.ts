import type {
  SubscriptionPlanType,
  SubscriptionStatus,
} from '@/types/database.types'

export type BillingDuration = 1 | 3 | 6 | 12

export interface PlanDefinition {
  code: SubscriptionPlanType
  name: string
  priceMonthly: number
  description: string
  aiActionsLimit: number | null
  supportsPersonal: boolean
  supportsBusiness: boolean
  advancedInsights: boolean
  highlight?: boolean
  features: string[]
}

export const TRIAL_DAYS = 7
export const BILLING_DURATIONS: BillingDuration[] = [1, 3, 6, 12]

export const DURATION_DISCOUNTS: Record<BillingDuration, number> = {
  1: 0,
  3: 0,
  6: 0.15,
  12: 0.25,
}

export const FREE_LIMITS = {
  transactions: 20,
  aiActions: 5,
} as const

const BUSINESS_ACCOUNT_LIMITS: Record<SubscriptionPlanType, Record<BillingDuration, number>> = {
  pf: { 1: 0, 3: 0, 6: 0, 12: 0 },
  pj: { 1: 1, 3: 1, 6: 2, 12: 3 },
  pro: { 1: 1, 3: 2, 6: 3, 12: 5 },
}

export const PLAN_CATALOG: Record<SubscriptionPlanType, PlanDefinition> = {
  pf: {
    code: 'pf',
    name: 'PF',
    priceMonthly: 47,
    description: 'Gestão financeira pessoal com visão clara, controle diário e IA assistida.',
    aiActionsLimit: 60,
    supportsPersonal: true,
    supportsBusiness: false,
    advancedInsights: false,
    features: [
      'Dashboard pessoal',
      'Despesas e planejamento mensal',
      'IA com limite mensal',
      'Inteligência financeira básica',
    ],
  },
  pj: {
    code: 'pj',
    name: 'PJ',
    priceMonthly: 67,
    description: 'Operação empresarial com faturamento, despesas, impostos e IA assistida.',
    aiActionsLimit: 60,
    supportsPersonal: false,
    supportsBusiness: true,
    advancedInsights: false,
    features: [
      'Dashboard empresarial',
      'Faturamento e despesas',
      'Impostos e pró-labore',
      'IA com limite mensal',
    ],
  },
  pro: {
    code: 'pro',
    name: 'PRO',
    priceMonthly: 97,
    description: 'Operação completa PF + PJ com IA sem limite e inteligência avançada.',
    aiActionsLimit: null,
    supportsPersonal: true,
    supportsBusiness: true,
    advancedInsights: true,
    highlight: true,
    features: [
      'Operação unificada PF + PJ',
      'IA sem limite mensal',
      'Inteligência avançada',
      'Capacidade ampliada para expansão',
    ],
  },
}

export function getPlanDefinition(plan: SubscriptionPlanType) {
  return PLAN_CATALOG[plan]
}

export function getBusinessAccountLimit(
  plan: SubscriptionPlanType,
  duration: BillingDuration
) {
  return BUSINESS_ACCOUNT_LIMITS[plan][duration]
}

export function getPlanPriceForDuration(plan: SubscriptionPlanType, duration: BillingDuration) {
  const definition = getPlanDefinition(plan)
  const discount = DURATION_DISCOUNTS[duration]
  const effectiveMonthly = Number((definition.priceMonthly * (1 - discount)).toFixed(2))
  const totalPrice = Number((effectiveMonthly * duration).toFixed(2))

  return {
    monthlyPrice: definition.priceMonthly,
    effectiveMonthly,
    totalPrice,
    discount,
  }
}

export function getDurationLabel(duration: BillingDuration) {
  if (duration === 1) return 'Mensal'
  if (duration === 3) return 'Trimestral'
  if (duration === 6) return 'Semestral'
  return 'Anual'
}

export function isSubscriptionInGoodStanding(
  status: SubscriptionStatus,
  trialEndsAt: string | null,
  now = new Date()
) {
  if (status === 'active') {
    return true
  }

  if (status !== 'trialing' || !trialEndsAt) {
    return false
  }

  return new Date(trialEndsAt).getTime() >= now.getTime()
}
