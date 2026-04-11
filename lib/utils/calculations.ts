import type { Database } from '@/types/database.types'
import type { CategorySummary, FinancialTotals } from '@/types/financial.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/financial.types'

type Income = Database['public']['Tables']['income_sources']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

export function calculateTotals(
  incomes: Income[],
  expenses: Expense[]
): FinancialTotals {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const balance = totalIncome - totalExpenses
  const consumptionRate =
    totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0

  return { totalIncome, totalExpenses, balance, consumptionRate }
}

export function groupByCategory(
  expenses: Expense[]
): CategorySummary[] {
  const map = new Map<string, number>()

  for (const expense of expenses) {
    const existing = map.get(expense.category) ?? 0
    map.set(expense.category, existing + expense.amount)
  }

  const totalExpenses = Array.from(map.values()).reduce((a, b) => a + b, 0)

  const result: CategorySummary[] = Array.from(map.entries()).map(
    ([category, total]) => ({
      category: category as CategorySummary['category'],
      total,
      percentage:
        totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      label: CATEGORY_LABELS[category as CategorySummary['category']],
      color: CATEGORY_COLORS[category as CategorySummary['category']],
    })
  )

  return result.sort((a, b) => b.total - a.total)
}

export function generateInsights(
  totals: FinancialTotals,
  categoryData: CategorySummary[]
): string[] {
  const insights: string[] = []
  const { consumptionRate, totalIncome, balance } = totals

  // Insight 1: consumption rate
  if (consumptionRate === 0 && totalIncome === 0) {
    insights.push('Adicione suas fontes de renda para ver seu ritmo financeiro.')
  } else if (consumptionRate <= 65) {
    insights.push(
      `Você está usando ${consumptionRate}% da sua renda. Excelente controle!`
    )
  } else if (consumptionRate <= 85) {
    insights.push(
      `Você comprometeu ${consumptionRate}% da renda. Margem diminuindo — revise os gastos.`
    )
  } else {
    insights.push(
      `Atenção: ${consumptionRate}% da renda comprometida. Gastos acima da renda não é sustentável.`
    )
  }

  // Insight 2: top category
  if (categoryData.length > 0) {
    const top = categoryData[0]
    insights.push(
      `Sua maior despesa é ${top.label} (${top.percentage}% dos gastos — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(top.total)}).`
    )
  } else {
    insights.push('Nenhum gasto registrado neste mês ainda.')
  }

  // Insight 3: balance / savings opportunity
  if (balance > 0) {
    insights.push(
      `Sobra disponível: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}. Considere investir parte disso.`
    )
  } else if (balance < 0) {
    insights.push(
      `Déficit de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(balance))}. Seus gastos superam a renda este mês.`
    )
  } else {
    insights.push('Renda e gastos equilibrados. Tente criar uma reserva.')
  }

  return insights
}

export function getGaugeColor(consumptionRate: number): string {
  if (consumptionRate <= 65) return '#3b82f6'  // blue — control
  if (consumptionRate <= 85) return '#f59e0b'  // amber — caution
  return '#f87171'                              // red — danger
}

export function getStatusLabel(consumptionRate: number): {
  label: string
  color: string
  description: string
} {
  if (consumptionRate <= 65) {
    return {
      label: 'Controle',
      color: '#22c55e',
      description: 'Você está no controle das suas finanças.',
    }
  }
  if (consumptionRate <= 85) {
    return {
      label: 'Atenção',
      color: '#f59e0b',
      description: 'Margem diminuindo. Revise seus gastos.',
    }
  }
  return {
    label: 'Descontrole',
    color: '#f87171',
    description: 'Padrão não sustentável. Reduza os gastos.',
  }
}
