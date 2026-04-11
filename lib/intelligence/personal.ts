import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type CategorySummary,
  type FinancialTotals,
} from '@/types/financial.types'
import type { ExpenseCategory } from '@/types/database.types'

export interface PersonalTrendPoint {
  monthIso: string
  label: string
  income: number
  expenses: number
  balance: number
}

export interface BudgetComparison {
  category: ExpenseCategory
  label: string
  planned: number
  actual: number
  delta: number
  color: string
}

export interface IntelligenceItem {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface PersonalIntelligenceResult {
  burnRate: number
  projectedBalance: number
  averageIncome: number
  focusCategory: CategorySummary | null
  alerts: IntelligenceItem[]
  recommendations: IntelligenceItem[]
  budgetComparisons: BudgetComparison[]
  summary: string
}

interface Input {
  totals: FinancialTotals
  categoryData: CategorySummary[]
  history: PersonalTrendPoint[]
  budgetItems: Array<{ category: ExpenseCategory; planned: number }>
}

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function severityColorOrder(severity: IntelligenceItem['severity']) {
  if (severity === 'high') return 0
  if (severity === 'medium') return 1
  return 2
}

export function buildPersonalIntelligence(input: Input): PersonalIntelligenceResult {
  const recentHistory = input.history.slice(-3)
  const averageExpenses = average(recentHistory.map((item) => item.expenses))
  const averageIncome = average(recentHistory.map((item) => item.income))
  const projectedBalance = input.totals.totalIncome - averageExpenses
  const focusCategory = input.categoryData[0] ?? null

  const budgetComparisons = input.budgetItems
    .map((item) => {
      const currentCategory = input.categoryData.find((category) => category.category === item.category)
      const actual = currentCategory?.total ?? 0

      return {
        category: item.category,
        label: CATEGORY_LABELS[item.category],
        planned: item.planned,
        actual,
        delta: item.planned - actual,
        color: CATEGORY_COLORS[item.category],
      }
    })
    .sort((left, right) => left.delta - right.delta)

  const alerts: IntelligenceItem[] = []

  if (input.totals.balance < 0) {
    alerts.push({
      title: 'Saldo negativo no mês',
      description: 'Seu ritmo atual já virou o mês para o negativo. Priorize corte imediato e renegociação.',
      severity: 'high',
    })
  }

  if (input.totals.consumptionRate >= 85) {
    alerts.push({
      title: 'Comprometimento elevado',
      description: `Você está consumindo ${input.totals.consumptionRate}% da renda. A margem de manobra ficou estreita.`,
      severity: input.totals.consumptionRate >= 95 ? 'high' : 'medium',
    })
  }

  for (const comparison of budgetComparisons.slice(0, 3)) {
    if (comparison.delta < 0) {
      alerts.push({
        title: `${comparison.label} acima do planejado`,
        description: `O gasto atual superou o orçamento em ${Math.abs(comparison.delta).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}.`,
        severity: Math.abs(comparison.delta) > comparison.planned * 0.2 ? 'high' : 'medium',
      })
    }
  }

  if (focusCategory && focusCategory.percentage >= 35) {
    alerts.push({
      title: `${focusCategory.label} domina o mês`,
      description: `${focusCategory.label} concentra ${focusCategory.percentage}% dos gastos do período.`,
      severity: 'medium',
    })
  }

  const recommendations: IntelligenceItem[] = []

  if (projectedBalance < 0) {
    recommendations.push({
      title: 'Recalibre o próximo ciclo',
      description: 'Seu saldo projetado está negativo. Acesse Despesas e ajuste o planejamento antes do próximo mês.',
      severity: 'high',
    })
  } else {
    recommendations.push({
      title: 'Proteja a sobra projetada',
      description: 'Direcione parte do saldo projetado para reserva, investimento ou amortização de dívida.',
      severity: 'low',
    })
  }

  const biggestOverBudget = budgetComparisons.find((item) => item.delta < 0)
  if (biggestOverBudget) {
    recommendations.push({
      title: `Ataque ${biggestOverBudget.label} primeiro`,
      description: `Essa categoria concentra o maior desvio do orçamento. Um ajuste ali tende a gerar o maior impacto agora.`,
      severity: 'medium',
    })
  }

  if (averageExpenses > averageIncome && averageIncome > 0) {
    recommendations.push({
      title: 'Burn rate maior que a renda média',
      description: 'Seu gasto médio dos últimos meses está acima da renda média. Reduza compromissos fixos antes de ampliar despesas variáveis.',
      severity: 'high',
    })
  }

  if (!recommendations.length) {
    recommendations.push({
      title: 'Continue no mesmo ritmo',
      description: 'Seu cenário atual está equilibrado. A próxima melhoria é transformar excedente em reserva recorrente.',
      severity: 'low',
    })
  }

  const orderedAlerts = alerts.sort(
    (left, right) => severityColorOrder(left.severity) - severityColorOrder(right.severity)
  )

  const summary = orderedAlerts.length
    ? `${orderedAlerts[0].title}. Burn rate médio de ${averageExpenses.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} e saldo projetado de ${projectedBalance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`
    : `Seu mês está controlado. Burn rate médio de ${averageExpenses.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} e saldo projetado de ${projectedBalance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`

  return {
    burnRate: averageExpenses,
    projectedBalance,
    averageIncome,
    focusCategory,
    alerts: orderedAlerts,
    recommendations,
    budgetComparisons,
    summary,
  }
}
