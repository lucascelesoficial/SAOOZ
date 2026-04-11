'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart2,
  Compass,
  Flame,
  Radar,
  TrendingUp,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import {
  buildPersonalIntelligence,
  type PersonalTrendPoint,
} from '@/lib/intelligence/personal'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatMonthShort, toMonthISO } from '@/lib/utils/formatters'
import { CATEGORY_LABELS } from '@/types/financial.types'
import type { ExpenseCategory } from '@/types/database.types'

interface BudgetItem {
  category: ExpenseCategory
  planned: number
}

interface CategoryGrowthInsight {
  category: ExpenseCategory
  label: string
  delta: number
}

interface InteligenciaClientProps {
  advancedInsightsEnabled: boolean
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

function isMissingBudgetStructureError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.budgets'") ||
    normalized.includes("could not find the table 'public.budget_categories'") ||
    normalized.includes('relation "public.budgets" does not exist') ||
    normalized.includes('relation "public.budget_categories" does not exist') ||
    normalized.includes('schema cache')
  )
}

function fallbackBudgetKey(userId: string, monthIso: string) {
  return `saooz:budget-fallback:${userId}:${monthIso}`
}

function loadFallbackBudget(userId: string, monthIso: string): BudgetItem[] {
  try {
    const raw = window.localStorage.getItem(fallbackBudgetKey(userId, monthIso))
    if (!raw) return []

    const parsed = JSON.parse(raw) as Array<{ category?: string; amount?: number }>
    return parsed
      .filter((item) => typeof item.category === 'string' && Number.isFinite(item.amount))
      .map((item) => ({
        category: item.category as ExpenseCategory,
        planned: Number(item.amount),
      }))
  } catch {
    return []
  }
}

function usePersonalIntelligenceData(currentMonth: Date) {
  const [history, setHistory] = useState<PersonalTrendPoint[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [monthlyExpenseVariationPct, setMonthlyExpenseVariationPct] = useState<number | null>(null)
  const [biggestCategoryGrowth, setBiggestCategoryGrowth] = useState<CategoryGrowthInsight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!active) return

        if (!user) {
          setHistory([])
          setBudgetItems([])
          return
        }

        const months: string[] = []
        for (let index = 5; index >= 0; index -= 1) {
          const date = new Date(currentMonth)
          date.setMonth(date.getMonth() - index)
          date.setDate(1)
          months.push(toMonthISO(date))
        }

        const [incomeResponse, expenseResponse] = await Promise.all([
          supabase
            .from('income_sources')
            .select('amount, month')
            .eq('user_id', user.id)
            .in('month', months),
          supabase
            .from('expenses')
            .select('amount, month, category')
            .eq('user_id', user.id)
            .in('month', months),
        ])

        if (incomeResponse.error) {
          throw new Error(incomeResponse.error.message)
        }

        if (expenseResponse.error) {
          throw new Error(expenseResponse.error.message)
        }

        let currentBudgetItems: BudgetItem[] = []
        const currentMonthIso = toMonthISO(currentMonth)

        try {
          const budgetResponse = await supabase
            .from('budgets')
            .select('id')
            .eq('user_id', user.id)
            .eq('month', currentMonthIso)
            .maybeSingle()

          if (budgetResponse.error) {
            const message = budgetResponse.error.message
            if (isMissingBudgetStructureError(message)) {
              currentBudgetItems = loadFallbackBudget(user.id, currentMonthIso)
            } else {
              console.error('Error loading current budget', message)
            }
          } else if (budgetResponse.data?.id) {
            const categoriesResponse = await supabase
              .from('budget_categories')
              .select('category, planned_amount')
              .eq('budget_id', budgetResponse.data.id)

            if (categoriesResponse.error) {
              const message = categoriesResponse.error.message
              if (!isMissingBudgetStructureError(message)) {
                console.error('Error loading budget categories', message)
              }
            } else {
              currentBudgetItems =
                categoriesResponse.data?.map((item) => ({
                  category: item.category,
                  planned: item.planned_amount,
                })) ?? []
            }
          }
        } catch (budgetError) {
          const message = getErrorMessage(budgetError)
          if (isMissingBudgetStructureError(message)) {
            currentBudgetItems = loadFallbackBudget(user.id, currentMonthIso)
          } else {
            console.error('Error loading budget structure', message)
          }
        }

        if (!active) {
          return
        }

        const nextHistory = months.map((month) => {
          const income = (incomeResponse.data ?? [])
            .filter((row) => row.month?.startsWith(month))
            .reduce((sum, row) => sum + row.amount, 0)
          const expenses = (expenseResponse.data ?? [])
            .filter((row) => row.month?.startsWith(month))
            .reduce((sum, row) => sum + row.amount, 0)

          return {
            monthIso: month,
            label: formatMonthShort(new Date(`${month}T00:00:00`)),
            income,
            expenses,
            balance: income - expenses,
          }
        })

        const selectedMonthIso = toMonthISO(currentMonth)
        const previousMonthDate = new Date(currentMonth)
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1)
        previousMonthDate.setDate(1)
        const previousMonthIso = toMonthISO(previousMonthDate)

        const expenseRows = expenseResponse.data ?? []
        const currentRows = expenseRows.filter((row) => row.month?.startsWith(selectedMonthIso))
        const previousRows = expenseRows.filter((row) => row.month?.startsWith(previousMonthIso))

        const currentMonthTotal = currentRows.reduce((sum, row) => sum + row.amount, 0)
        const previousMonthTotal = previousRows.reduce((sum, row) => sum + row.amount, 0)

        const nextVariation =
          previousMonthTotal > 0
            ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
            : null

        const currentByCategory = new Map<ExpenseCategory, number>()
        const previousByCategory = new Map<ExpenseCategory, number>()

        for (const row of currentRows) {
          const category = row.category as ExpenseCategory
          currentByCategory.set(category, (currentByCategory.get(category) ?? 0) + row.amount)
        }

        for (const row of previousRows) {
          const category = row.category as ExpenseCategory
          previousByCategory.set(category, (previousByCategory.get(category) ?? 0) + row.amount)
        }

        let nextBiggestGrowth: CategoryGrowthInsight | null = null
        const categories = new Set<ExpenseCategory>([
          ...currentByCategory.keys(),
          ...previousByCategory.keys(),
        ])

        for (const category of categories) {
          const delta = (currentByCategory.get(category) ?? 0) - (previousByCategory.get(category) ?? 0)
          if (delta <= 0) continue

          if (!nextBiggestGrowth || delta > nextBiggestGrowth.delta) {
            nextBiggestGrowth = {
              category,
              label: CATEGORY_LABELS[category],
              delta,
            }
          }
        }

        setHistory(nextHistory)
        setBudgetItems(currentBudgetItems)
        setMonthlyExpenseVariationPct(nextVariation)
        setBiggestCategoryGrowth(nextBiggestGrowth)
      } catch (error) {
        if (!active) return
        console.error('Error loading intelligence data', getErrorMessage(error))
        setHistory([])
        setBudgetItems([])
        setMonthlyExpenseVariationPct(null)
        setBiggestCategoryGrowth(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [currentMonth])

  return { history, budgetItems, monthlyExpenseVariationPct, biggestCategoryGrowth, loading }
}

function severityStyles(severity: 'high' | 'medium' | 'low') {
  if (severity === 'high') {
    return { color: '#f87171', bg: '#f8717110', border: '#f8717125' }
  }

  if (severity === 'medium') {
    return { color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b25' }
  }

  return { color: '#22c55e', bg: '#22c55e10', border: '#22c55e25' }
}

function AttentionBlock({
  alerts,
  recommendations,
  compact = false,
}: {
  alerts: ReturnType<typeof buildPersonalIntelligence>['alerts']
  recommendations: ReturnType<typeof buildPersonalIntelligence>['recommendations']
  compact?: boolean
}) {
  const items = compact
    ? alerts.slice(0, 2)
    : alerts

  const topRec = recommendations[0]

  return (
    <div className="panel-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" style={{ color: '#f59e0b' }} />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">
          O que merece sua atenção agora
        </h2>
      </div>
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => {
            const style = severityStyles(item.severity)
            return (
              <div
                key={item.title}
                className="rounded-[10px] border px-3 py-3"
                style={{ background: style.bg, borderColor: style.border }}
              >
                <p className="text-sm font-semibold" style={{ color: style.color }}>
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-app-soft">{item.description}</p>
              </div>
            )
          })
        ) : (
          <div
            className="rounded-[10px] border px-3 py-3"
            style={{ background: '#22c55e10', borderColor: '#22c55e25' }}
          >
            <p className="text-sm font-semibold text-[#22c55e]">Tudo sob controle</p>
            <p className="mt-1 text-xs text-app-soft">Nenhum alerta crítico no momento. Continue no mesmo ritmo.</p>
          </div>
        )}

        {topRec && (
          <div
            className="rounded-[10px] border px-3 py-3"
            style={{ borderColor: 'color-mix(in oklab, var(--accent-blue) 25%, transparent)', background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
              {topRec.title}
            </p>
            <p className="mt-1 text-xs text-app-soft">{topRec.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationsCard({
  recommendations,
}: {
  recommendations: ReturnType<typeof buildPersonalIntelligence>['recommendations']
}) {
  return (
    <div className="panel-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Compass className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">
          Recomendações
        </h2>
      </div>
      <div className="space-y-3">
        {recommendations.map((item) => (
          <div
            key={item.title}
            className="rounded-[10px] border px-3 py-3"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <p className="text-sm font-semibold text-app">{item.title}</p>
            <p className="mt-1 text-xs text-app-soft">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InteligenciaClient({
  advancedInsightsEnabled,
}: InteligenciaClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { totals, categoryData, currentMonth, isLoading } = useFinancialData()
  const {
    history,
    budgetItems,
    monthlyExpenseVariationPct,
    biggestCategoryGrowth,
    loading,
  } = usePersonalIntelligenceData(currentMonth)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const intelligence = useMemo(
    () => buildPersonalIntelligence({ totals, categoryData, history, budgetItems }),
    [budgetItems, categoryData, history, totals]
  )

  const hasData =
    categoryData.length > 0 ||
    history.some((item) => item.income > 0 || item.expenses > 0) ||
    budgetItems.length > 0

  if (!isMounted || isLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            className="h-48 w-full rounded-[12px]"
            style={{ background: 'var(--panel-border)' }}
          />
        ))}
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-xl font-bold text-app">Inteligência</h1>
        <EmptyState
          icon={BarChart2}
          title="Sem dados para analisar"
          description="Adicione renda, despesas ou planejamento para ativar sua inteligência financeira."
        />
      </div>
    )
  }

  const overBudgetCount = intelligence.budgetComparisons.filter((item) => item.delta < 0).length

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <div className="panel-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-app">Inteligência</h1>
            <p className="mt-1 text-sm text-app-soft">
              Leitura automática do mês com alertas, projeção e próximos movimentos.
            </p>
          </div>
          <div
            className="rounded-[12px] border px-4 py-3 text-sm text-app"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 22%, transparent)',
              background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
            }}
          >
            {intelligence.summary}
          </div>
        </div>
      </div>

      {!advancedInsightsEnabled && (
        <div
          className="rounded-[12px] border px-4 py-4 text-sm text-app"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent-blue) 24%, transparent)',
            background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
          }}
        >
          Seu plano atual libera a leitura essencial. Projeções, recomendações aprofundadas e comparativos avançados estão disponíveis no PRO.
        </div>
      )}

      {/* O que merece atenção — visível para todos os planos */}
      <AttentionBlock
        alerts={intelligence.alerts}
        recommendations={intelligence.recommendations}
        compact={!advancedInsightsEnabled}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Flame className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Burn rate</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">
            {formatCurrency(intelligence.burnRate)}
          </p>
          <p className="mt-1 text-xs text-app-soft">Média dos últimos 3 meses</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Saldo projetado</p>
          </div>
          <p
            className="mt-3 text-2xl font-bold"
            style={{ color: intelligence.projectedBalance >= 0 ? '#22c55e' : '#f87171' }}
          >
            {formatCurrency(intelligence.projectedBalance)}
          </p>
          <p className="mt-1 text-xs text-app-soft">Baseado no ritmo médio recente</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Radar className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Categoria principal</p>
          </div>
          <p className="mt-3 text-lg font-bold text-app">
            {intelligence.focusCategory?.label ?? 'Sem destaque'}
          </p>
          <p className="mt-1 text-xs text-app-soft">
            {intelligence.focusCategory
              ? `${intelligence.focusCategory.percentage}% dos gastos do mês`
              : 'Sem categoria dominante ainda'}
          </p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Compass className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Desvios</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">{overBudgetCount}</p>
          <p className="mt-1 text-xs text-app-soft">Categorias acima do planejado</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Variacao mensal</p>
          </div>
          <p
            className="mt-3 text-2xl font-bold"
            style={{
              color:
                monthlyExpenseVariationPct === null
                  ? 'var(--text-strong)'
                  : monthlyExpenseVariationPct <= 0
                    ? '#22c55e'
                    : '#f87171',
            }}
          >
            {monthlyExpenseVariationPct === null
              ? '--'
              : `${monthlyExpenseVariationPct > 0 ? '+' : ''}${monthlyExpenseVariationPct.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-app-soft">Gastos comparados ao mes anterior</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Radar className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Maior crescimento</p>
          </div>
          <p className="mt-3 text-lg font-bold text-app">
            {biggestCategoryGrowth?.label ?? 'Sem destaque'}
          </p>
          <p className="mt-1 text-xs text-app-soft">
            {biggestCategoryGrowth
              ? `Aumento de ${formatCurrency(biggestCategoryGrowth.delta)} no mes`
              : 'Sem aumento relevante por categoria'}
          </p>
        </div>
      </div>

      {advancedInsightsEnabled && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="panel-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">
                  Tendência de 6 meses
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={history} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="historyIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="historyExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="historyBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-soft)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--panel-border)',
                      borderRadius: 8,
                    }}
                    formatter={(value: unknown, name: unknown) => {
                      const labels: Record<string, string> = {
                        income: 'Renda',
                        expenses: 'Gastos',
                        balance: 'Saldo',
                      }
                      const numericValue = Number(value ?? 0)
                      const label = String(name ?? '')
                      return [formatCurrency(numericValue), labels[label] ?? label]
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fill="url(#historyIncome)" dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#historyExpenses)" dot={false} />
                  <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={1.5} fill="url(#historyBalance)" dot={false} strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <RecommendationsCard recommendations={intelligence.recommendations} />
          </div>

          <div className="panel-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">
                  Despesas planejadas vs. realizadas
              </h2>
            </div>

            {intelligence.budgetComparisons.length ? (
              <div className="space-y-3">
                {intelligence.budgetComparisons.slice(0, 8).map((item) => {
                  const ratio =
                    item.planned > 0 ? Math.min((item.actual / item.planned) * 100, 100) : 0

                  return (
                    <div key={item.category}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="text-sm text-app">{item.label}</span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: item.delta >= 0 ? '#22c55e' : '#f87171' }}
                        >
                          {item.delta >= 0 ? 'Folga' : 'Desvio'}{' '}
                          {formatCurrency(Math.abs(item.delta))}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-border)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${ratio}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-app-soft">
                        <span>Planejado: {formatCurrency(item.planned)}</span>
                        <span>Real: {formatCurrency(item.actual)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-app-soft">
                Você ainda não configurou o planejamento para este mês. Acesse Despesas para ativar esse comparativo.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
