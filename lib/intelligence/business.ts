import { estimateTax } from '@/lib/utils/taxes'
import type {
  BusinessActivity,
  BusinessTaxRegime,
} from '@/types/database.types'

export interface BusinessTrendPoint {
  monthIso: string
  label: string
  revenue: number
  expenses: number
  tax: number
  netProfit: number
}

export interface BusinessCategoryPoint {
  key: string
  label: string
  amount: number
  color: string
}

export interface BusinessIntelligenceItem {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface BusinessIntelligenceResult {
  averageRevenue: number
  averageExpenses: number
  projectedNetProfit: number
  alerts: BusinessIntelligenceItem[]
  recommendations: BusinessIntelligenceItem[]
  expenseHighlights: BusinessCategoryPoint[]
  revenueHighlights: BusinessCategoryPoint[]
  summary: string
}

interface Input {
  history: BusinessTrendPoint[]
  revenueCategories: BusinessCategoryPoint[]
  expenseCategories: BusinessCategoryPoint[]
  currentRevenue: number
  currentExpenses: number
  currentTaxRate: number
}

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function severityOrder(severity: BusinessIntelligenceItem['severity']) {
  if (severity === 'high') return 0
  if (severity === 'medium') return 1
  return 2
}

export function buildBusinessTrendHistory(input: {
  months: string[]
  revenues: Array<{ month: string; amount: number }>
  expenses: Array<{ month: string; amount: number }>
  taxRegime: BusinessTaxRegime
  activity: BusinessActivity
  formatLabel: (monthIso: string) => string
}) {
  return input.months.map((month) => {
    const revenue = input.revenues
      .filter((item) => item.month?.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0)
    const expenses = input.expenses
      .filter((item) => item.month?.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0)
    const tax = estimateTax(revenue, input.taxRegime, input.activity).amount

    return {
      monthIso: month,
      label: input.formatLabel(month),
      revenue,
      expenses,
      tax,
      netProfit: revenue - expenses - tax,
    }
  })
}

export function buildBusinessIntelligence(input: Input): BusinessIntelligenceResult {
  const recentHistory = input.history.slice(-3)
  const averageRevenue = average(recentHistory.map((item) => item.revenue))
  const averageExpenses = average(recentHistory.map((item) => item.expenses))
  const averageTax = average(recentHistory.map((item) => item.tax))
  const projectedNetProfit = averageRevenue - averageExpenses - averageTax

  const alerts: BusinessIntelligenceItem[] = []

  if (projectedNetProfit < 0) {
    alerts.push({
      title: 'Lucro projetado negativo',
      description: 'A média recente indica que a empresa pode fechar o próximo ciclo no vermelho.',
      severity: 'high',
    })
  }

  if (input.currentTaxRate >= 0.18) {
    alerts.push({
      title: 'Carga tributária elevada',
      description: 'Seu imposto estimado está pressionando a margem. Vale revisar preço, mix ou regime tributário.',
      severity: 'medium',
    })
  }

  const latestPoint = input.history[input.history.length - 1]
  const previousPoint = input.history[input.history.length - 2]
  if (latestPoint && previousPoint && previousPoint.revenue > 0) {
    const drop = ((previousPoint.revenue - latestPoint.revenue) / previousPoint.revenue) * 100
    if (drop >= 15) {
      alerts.push({
        title: 'Queda relevante no faturamento',
        description: `O faturamento caiu ${drop.toFixed(1)}% em relação ao último ciclo disponível.`,
        severity: 'high',
      })
    }
  }

  const primaryExpense = input.expenseCategories[0]
  if (primaryExpense) {
    alerts.push({
      title: `${primaryExpense.label} concentra custos`,
      description: 'Essa é a maior frente de despesa recente e merece revisão operacional imediata.',
      severity: 'medium',
    })
  }

  const recommendations: BusinessIntelligenceItem[] = []

  if (projectedNetProfit < 0) {
    recommendations.push({
      title: 'Proteger caixa antes de crescer',
      description: 'Congele expansão não essencial e reduza as despesas recorrentes de maior impacto.',
      severity: 'high',
    })
  } else {
    recommendations.push({
      title: 'Transforme margem em reserva operacional',
      description: 'Direcione a sobra projetada para reserva ou capital de giro.',
      severity: 'low',
    })
  }

  if (primaryExpense) {
    recommendations.push({
      title: `Renegociar ${primaryExpense.label}`,
      description: 'A maior linha de custo costuma entregar o ajuste mais rápido na margem.',
      severity: 'medium',
    })
  }

  const primaryRevenue = input.revenueCategories[0]
  if (primaryRevenue) {
    recommendations.push({
      title: `Acelerar ${primaryRevenue.label}`,
      description: 'Sua principal fonte de receita merece previsibilidade e recorrência para sustentar o crescimento.',
      severity: 'low',
    })
  }

  const sortedAlerts = alerts.sort(
    (left, right) => severityOrder(left.severity) - severityOrder(right.severity)
  )

  const summary = sortedAlerts.length
    ? `${sortedAlerts[0].title}. Receita média de ${averageRevenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} e lucro líquido projetado de ${projectedNetProfit.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`
    : `Operação estável. Receita média de ${averageRevenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} e lucro líquido projetado de ${projectedNetProfit.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`

  return {
    averageRevenue,
    averageExpenses,
    projectedNetProfit,
    alerts: sortedAlerts,
    recommendations,
    expenseHighlights: input.expenseCategories,
    revenueHighlights: input.revenueCategories,
    summary,
  }
}
