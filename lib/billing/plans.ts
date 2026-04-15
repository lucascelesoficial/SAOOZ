import type { SubscriptionPlanType } from '@/types/database.types'

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
      'Dashboard financeiro pessoal',
      'Receitas, despesas e saldo mensal',
      'Categorização em 16 categorias',
      'Planejamento e orçamento mensal',
      'Insights automáticos de gastos',
      'IA com 60 ações/mês',
      'Relatório mensal exportável (PDF/CSV)',
      'Alertas de vencimento por e-mail',
      'Digest financeiro mensal no e-mail',
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
      'Dashboard empresarial completo',
      'DRE (Demonstrativo de Resultado)',
      'Fluxo de caixa operacional',
      'Faturamento e controle de receitas',
      'Despesas fixas, variáveis e operacionais',
      'Clientes e fornecedores (contas a receber/pagar)',
      'Pró-labore e distribuição de lucros',
      'Cálculo de impostos (MEI, Simples, Presumido, Real)',
      'Data de fechamento/medição por lançamento',
      'IA com 60 ações/mês',
      'Relatório fiscal e contábil exportável',
      'Alertas de vencimento e digest mensal',
      'Múltiplas empresas (até 3 no plano anual)',
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
      'Tudo do plano PF + tudo do plano PJ',
      'Dashboard unificado PF + PJ',
      'Análise cruzada finanças pessoais vs empresariais',
      'IA sem limite mensal (CFO dedicado)',
      'Insights avançados e recomendações estratégicas',
      'Visão de reserva de emergência e investimentos',
      'Exportação PDF e CSV ilimitada',
      'Relatórios avançados com comparativos',
      'Suporte prioritário',
      'Múltiplas empresas (até 5 no plano anual)',
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

