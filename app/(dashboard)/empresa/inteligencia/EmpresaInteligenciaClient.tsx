'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  buildBusinessIntelligence,
  buildBusinessTrendHistory,
  type BusinessCategoryPoint,
} from '@/lib/intelligence/business'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatMonth, formatMonthShort, toMonthISO } from '@/lib/utils/formatters'

const REV_LABELS: Record<string, string> = {
  servico: 'Serviço',
  produto: 'Produto',
  recorrente: 'Recorrente',
  comissao: 'Comissão',
  outro: 'Outro',
}

const EXP_LABELS: Record<string, string> = {
  fixo_aluguel: 'Aluguel',
  fixo_salarios: 'Salários',
  fixo_prolabore: 'Pró-labore',
  fixo_contador: 'Contador',
  fixo_software: 'Software',
  fixo_internet: 'Internet',
  fixo_outros: 'Custos fixos',
  variavel_comissao: 'Comissão',
  variavel_frete: 'Frete',
  variavel_embalagem: 'Embalagem',
  variavel_trafego: 'Tráfego',
  variavel_taxas: 'Taxas',
  variavel_outros: 'Custos variáveis',
  operacional_marketing: 'Marketing',
  operacional_admin: 'Administrativo',
  operacional_juridico: 'Jurídico',
  operacional_manutencao: 'Manutenção',
  operacional_viagem: 'Viagens',
  operacional_outros: 'Operacional',
  investimento_equipamento: 'Equipamento',
  investimento_estoque: 'Estoque',
  investimento_expansao: 'Expansão',
  investimento_contratacao: 'Contratação',
  investimento_outros: 'Investimento',
}

const REV_COLORS = ['#026648', '#38bdf8', '#7dd3fc', '#93c5fd', '#c4b5fd']
const EXP_COLORS = ['#f87171', '#fb923c', '#f59e0b', '#e879f9', '#8b5cf6']

interface EmpresaInteligenciaClientProps {
  advancedInsightsEnabled: boolean
}

function buildCategoryPoints(
  rows: Array<{ category: string; amount: number }>,
  labelMap: Record<string, string>,
  palette: string[]
) {
  const categoryMap = new Map<string, number>()

  for (const row of rows) {
    categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + row.amount)
  }

  return Array.from(categoryMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(
      ([key, amount], index): BusinessCategoryPoint => ({
        key,
        label: labelMap[key] ?? key,
        amount,
        color: palette[index % palette.length],
      })
    )
}

function useBusinessIntelligenceData(
  businessId: string | undefined,
  currentMonth: Date,
  taxRegime: string | undefined,
  activity: string | undefined
) {
  const [history, setHistory] = useState<ReturnType<typeof buildBusinessTrendHistory>>([])
  const [revenueCategories, setRevenueCategories] = useState<BusinessCategoryPoint[]>([])
  const [expenseCategories, setExpenseCategories] = useState<BusinessCategoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!businessId || !taxRegime || !activity) {
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createClient()
      const months: string[] = []

      for (let index = 5; index >= 0; index -= 1) {
        const date = new Date(currentMonth)
        date.setMonth(date.getMonth() - index)
        date.setDate(1)
        months.push(toMonthISO(date))
      }

      const [{ data: revenues }, { data: expenses }] = await Promise.all([
        supabase
          .from('business_revenues')
          .select('month, amount, category')
          .eq('business_id', businessId)
          .in('month', months),
        supabase
          .from('business_expenses')
          .select('month, amount, category')
          .eq('business_id', businessId)
          .in('month', months),
      ])

      if (!active) {
        return
      }

      setHistory(
        buildBusinessTrendHistory({
          months,
          revenues: revenues ?? [],
          expenses: expenses ?? [],
          taxRegime: taxRegime as never,
          activity: activity as never,
          formatLabel: (monthIso) => formatMonthShort(new Date(`${monthIso}T00:00:00`)),
        })
      )
      setRevenueCategories(buildCategoryPoints(revenues ?? [], REV_LABELS, REV_COLORS))
      setExpenseCategories(buildCategoryPoints(expenses ?? [], EXP_LABELS, EXP_COLORS))
      setLoading(false)
    }

    void load()

    return () => {
      active = false
    }
  }, [activity, businessId, currentMonth, taxRegime])

  return { history, revenueCategories, expenseCategories, loading }
}

function severityStyles(severity: 'high' | 'medium' | 'low') {
  if (severity === 'high') {
    return { color: '#f87171', bg: '#f8717110', border: '#f8717125' }
  }

  if (severity === 'medium') {
    return { color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b25' }
  }

  return { color: '#026648', bg: '#02664812', border: '#02664822' }
}

function AttentionBlock({
  alerts,
  recommendations,
  compact = false,
}: {
  alerts: ReturnType<typeof buildBusinessIntelligence>['alerts']
  recommendations: ReturnType<typeof buildBusinessIntelligence>['recommendations']
  compact?: boolean
}) {
  const items = compact ? alerts.slice(0, 2) : alerts
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
            style={{ background: '#02664812', borderColor: '#02664822' }}
          >
            <p className="text-sm font-semibold text-[#026648]">Operação estável</p>
            <p className="mt-1 text-xs text-app-soft">Nenhum alerta crítico no momento. Continue monitorando os indicadores.</p>
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
  recommendations: ReturnType<typeof buildBusinessIntelligence>['recommendations']
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

export function EmpresaInteligenciaClient({
  advancedInsightsEnabled,
}: EmpresaInteligenciaClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { business, totals, currentMonth, taxEstimate, isLoading } = useBusinessData()
  const { history, revenueCategories, expenseCategories, loading } = useBusinessIntelligenceData(
    business?.id,
    currentMonth,
    business?.tax_regime,
    business?.activity
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const intelligence = useMemo(
    () =>
      buildBusinessIntelligence({
        history,
        revenueCategories,
        expenseCategories,
        currentRevenue: totals.totalRevenue,
        currentExpenses: totals.totalExpenses,
        currentTaxRate: totals.taxRate,
      }),
    [
      expenseCategories,
      history,
      revenueCategories,
      totals.taxRate,
      totals.totalExpenses,
      totals.totalRevenue,
    ]
  )

  const hasData =
    history.some((item) => item.revenue > 0 || item.expenses > 0) ||
    revenueCategories.length > 0 ||
    expenseCategories.length > 0

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
        <h1 className="mb-6 text-xl font-bold text-app">Inteligência Empresarial</h1>
        <div className="panel-card p-12 text-center">
          <BarChart2 className="mx-auto mb-4 h-12 w-12 text-app-soft" />
          <p className="text-base font-semibold text-app">Sem dados para analisar</p>
          <p className="mt-1 text-sm text-app-soft">
            Registre faturamento e despesas para ativar a inteligência empresarial.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <div className="panel-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-app">Inteligência Empresarial</h1>
            <p className="mt-1 text-sm text-app-soft">
              Análise de margem, alertas operacionais e foco de execução para{' '}
              {business?.name ?? 'sua empresa'}.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <ExportPDFButton
              data={{
                title: 'Inteligência Empresarial',
                subtitle: business?.name ?? 'Módulo Empresarial',
                month: formatMonth(currentMonth),
                totalIncome: totals.totalRevenue,
                totalExpenses: totals.totalExpenses,
                balance: totals.netProfit,
                taxAmount: totals.taxAmount,
                netProfit: totals.netProfit,
                profitMargin: `${(totals.profitMargin * 100).toFixed(1)}%`,
                businessName: business?.name,
                taxRegime: business?.tax_regime,
                sections: [
                  {
                    title: 'Resumo Inteligente',
                    rows: [
                      { label: 'Análise do período', value: intelligence.summary, bold: true },
                      { label: 'Faturamento médio (6 meses)', value: `R$ ${intelligence.averageRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'green' },
                      { label: 'Despesas médias (6 meses)', value: `R$ ${intelligence.averageExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'red' },
                      { label: 'Lucro projetado', value: `R$ ${intelligence.projectedNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: intelligence.projectedNetProfit >= 0 ? 'blue' : 'red', bold: true, divider: true },
                    ],
                  },
                  ...(intelligence.alerts.length > 0 ? [{
                    title: 'Alertas',
                    rows: intelligence.alerts.map((a) => ({
                      label: a.title,
                      value: '',
                      note: a.description,
                      color: 'red' as const,
                    })),
                  }] : []),
                  ...(intelligence.recommendations.length > 0 ? [{
                    title: 'Recomendações',
                    rows: intelligence.recommendations.map((r) => ({
                      label: r.title,
                      value: '',
                      note: r.description,
                      color: 'blue' as const,
                    })),
                  }] : []),
                  ...(revenueCategories.length > 0 ? [{
                    title: 'Composição do Faturamento',
                    rows: revenueCategories.map((r) => ({
                      label: r.label,
                      value: `R$ ${r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      color: 'green' as const,
                    })),
                  }] : []),
                  ...(expenseCategories.length > 0 ? [{
                    title: 'Composição das Despesas',
                    rows: expenseCategories.map((e) => ({
                      label: e.label,
                      value: `R$ ${e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      color: 'red' as const,
                    })),
                  }] : []),
                ],
              }}
              fileName={`saooz-inteligencia-empresa-${currentMonth.toISOString().slice(0, 7)}.pdf`}
            />
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
      </div>

      {!advancedInsightsEnabled && (
        <div
          className="rounded-[12px] border px-4 py-4 text-sm text-app"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent-blue) 24%, transparent)',
            background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
          }}
        >
          Seu plano atual libera a leitura essencial. Projeções operacionais, recomendações aprofundadas e mapas de receita estão disponíveis no PRO.
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
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Receita média</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">
            {formatCurrency(intelligence.averageRevenue)}
          </p>
          <p className="mt-1 text-xs text-app-soft">Últimos 3 meses</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Flame className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Despesa média</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">
            {formatCurrency(intelligence.averageExpenses)}
          </p>
          <p className="mt-1 text-xs text-app-soft">Ritmo médio recente</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Radar className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Lucro projetado</p>
          </div>
          <p
            className="mt-3 text-2xl font-bold"
            style={{ color: intelligence.projectedNetProfit >= 0 ? '#026648' : '#f87171' }}
          >
            {formatCurrency(intelligence.projectedNetProfit)}
          </p>
          <p className="mt-1 text-xs text-app-soft">Baseado no ritmo médio atual</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <Compass className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Imposto estimado</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">{taxEstimate?.ratePct ?? '--'}</p>
          <p className="mt-1 text-xs text-app-soft">{taxEstimate?.regime ?? 'Sem cálculo disponível'}</p>
        </div>
      </div>

      {advancedInsightsEnabled && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="panel-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-app-base">
                  Tendência operacional
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={history} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bizRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#026648" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#026648" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bizExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bizProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#026648" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#026648" stopOpacity={0} />
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
                        revenue: 'Faturamento',
                        expenses: 'Despesas',
                        netProfit: 'Lucro líquido',
                      }
                      const numericValue = Number(value ?? 0)
                      const label = String(name ?? '')
                      return [formatCurrency(numericValue), labels[label] ?? label]
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#026648" strokeWidth={2} fill="url(#bizRevenue)" dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#bizExpense)" dot={false} />
                  <Area type="monotone" dataKey="netProfit" stroke="#026648" strokeWidth={1.5} fill="url(#bizProfit)" dot={false} strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <RecommendationsCard recommendations={intelligence.recommendations} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-app-base">
                Receitas por tipo
              </h2>
              <div className="space-y-3">
                {intelligence.revenueHighlights.length ? (
                  intelligence.revenueHighlights.map((item) => (
                    <div key={item.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-app">{item.label}</span>
                        <span className="font-semibold" style={{ color: item.color }}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-border)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: '100%', background: item.color }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-app-soft">Sem receitas registradas no período.</p>
                )}
              </div>
            </div>

            <div className="panel-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-app-base">
                Maiores despesas
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={intelligence.expenseHighlights} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--panel-border)',
                      borderRadius: 8,
                    }}
                    formatter={(value: unknown) => [
                      formatCurrency(Number(value ?? 0)),
                      'Despesa',
                    ]}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
