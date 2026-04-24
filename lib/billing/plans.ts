import type { SubscriptionPlanType } from '@/types/database.types'

export type BillingDuration = 1 | 3 | 12

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
export const BILLING_DURATIONS: BillingDuration[] = [1, 3, 12]

export const DURATION_DISCOUNTS: Record<BillingDuration, number> = {
  1: 0,
  3: 0,
  12: 0.25,
}

export const FREE_LIMITS = {
  transactions: 20,
  aiActions: 5,
} as const

const BUSINESS_ACCOUNT_LIMITS: Record<SubscriptionPlanType, Record<BillingDuration, number>> = {
  pf:  { 1: 0, 3: 0, 12: 0 },
  pj:  { 1: 1, 3: 1, 12: 3 },
  pro: { 1: 1, 3: 2, 12: 5 },
}

export const PLAN_CATALOG: Record<SubscriptionPlanType, PlanDefinition> = {
  pf: {
    code: 'pf',
    name: 'Clareza',
    priceMonthly: 37,
    description: 'Sua vida financeira com visão clara, rotina organizada e IA assistida.',
    aiActionsLimit: 60,
    supportsPersonal: true,
    supportsBusiness: false,
    advancedInsights: false,
    features: [
      'Dashboard financeiro pessoal',
      'Receitas, despesas e saldo mensal',
      'Categorização inteligente',
      'Planejamento e orçamento',
      'Insights automáticos',
      'IA com 60 ações/mês',
      'Relatórios exportáveis',
      'Alertas e digest mensal',
    ],
  },
  pj: {
    code: 'pj',
    name: 'Gestão',
    priceMonthly: 97,
    description: 'Controle financeiro empresarial com leitura operacional, estrutura e clareza do negócio.',
    aiActionsLimit: 60,
    supportsPersonal: false,
    supportsBusiness: true,
    advancedInsights: false,
    features: [
      'Dashboard empresarial',
      'DRE em tempo real',
      'Fluxo de caixa',
      'Receitas e despesas',
      'Clientes e fornecedores',
      'Impostos por regime tributário',
      'Fechamento por lançamento',
      'IA com 60 ações/mês',
      'Relatórios exportáveis',
      'Alertas e digest',
    ],
  },
  pro: {
    code: 'pro',
    name: 'Comando',
    priceMonthly: 147,
    description: 'Acesso total ao ecossistema SAOOZ — visão completa, inteligência sem limite, operação com poder.',
    aiActionsLimit: null,
    supportsPersonal: true,
    supportsBusiness: true,
    advancedInsights: true,
    highlight: true,
    features: [
      'Tudo do Clareza + tudo do Gestão',
      'Visão unificada PF + PJ',
      'IA sem limite de uso',
      'Análises cruzadas e recomendações avançadas',
      'Relatórios premium',
      'Suporte prioritário',
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
  return 'Anual'
}

