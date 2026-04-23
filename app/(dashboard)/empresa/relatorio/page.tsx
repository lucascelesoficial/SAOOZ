'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ChevronUp,
  ChevronDown,
  Minus,
  Table2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from 'lucide-react'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { ExportCSVButton } from '@/components/csv/ExportCSVButton'
import { createClient } from '@/lib/supabase/client'
import {
  formatCurrency,
  formatCurrencyShort,
  formatMonthShort,
  toMonthISO,
} from '@/lib/utils/formatters'
import { estimateTax } from '@/lib/utils/taxes'
import { shiftActiveMonth } from '@/lib/modules/_shared/month'
import type { BusinessActivity, BusinessTaxRegime } from '@/types/database.types'

type Period = 3 | 6 | 12

interface MonthRow {
  date: Date
  label: string
  monthKey: string
  revenue: number
  expenses: number
  tax: number
  grossProfit: number
  netProfit: number
  margin: number
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 || current === 0) return <span className="text-[#6B6B6B] text-xs">—</span>
  const delta = ((current - previous) / Math.abs(previous)) * 100
  const isUp = delta >= 0
  const color = isUp ? '#026648' : '#f87171'
  const Icon = isUp ? ChevronUp : ChevronDown
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color }}>
      <Icon className="h-3 w-3" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  )
}

function MarginBadge({ margin }: { margin: number }) {
  const color =
    margin >= 20 ? '#026648' :
    margin >= 10 ? '#f59e0b' :
    margin >= 0  ? '#f87171' : '#ef4444'
  return (
    <span className="font-semibold tabular-nums" style={{ color }}>
      {margin.toFixed(1)}%
    </span>
  )
}

const PERIOD_OPTIONS: Period[] = [3, 6, 12]

export default function RelatorioPage() {
  const { business, currentMonth, isLoading: ctxLoading } = useBusinessData()
  const [period, setPeriod] = useState<Period>(6)
  const [rows, setRows] = useState<MonthRow[]>([])
  const [loading, setLoading] = useState(true)

  const bizId = business?.id
  const taxRegime = business?.tax_regime as BusinessTaxRegime | undefined
  const activity = business?.activity as BusinessActivity | undefined

  useEffect(() => {
    if (!bizId || !taxRegime || !activity) return

    async function fetchPeriodData() {
      setLoading(true)
      const supabase = createClient()
      const safeBizId = bizId as string
      const safeRegime = taxRegime as BusinessTaxRegime
      const safeActivity = activity as BusinessActivity

      const months: Date[] = []
      for (let i = period - 1; i >= 0; i--) {
        months.push(shiftActiveMonth(currentMonth, -i))
      }

      const startKey = toMonthISO(months[0])
      const endKey = toMonthISO(months[months.length - 1])

      const [revRes, expRes] = await Promise.all([
        supabase
          .from('business_revenues')
          .select('month, amount')
          .eq('business_id', safeBizId)
          .gte('month', startKey)
          .lte('month', endKey),
        supabase
          .from('business_expenses')
          .select('month, amount')
          .eq('business_id', safeBizId)
          .gte('month', startKey)
          .lte('month', endKey),
      ])

      const revByMonth = new Map<string, number>()
      const expByMonth = new Map<string, number>()

      for (const r of revRes.data ?? []) {
        revByMonth.set(r.month, (revByMonth.get(r.month) ?? 0) + r.amount)
      }
      for (const e of expRes.data ?? []) {
        expByMonth.set(e.month, (expByMonth.get(e.month) ?? 0) + e.amount)
      }

      const built: MonthRow[] = months.map((d) => {
        const key = toMonthISO(d)
        const revenue = revByMonth.get(key) ?? 0
        const expenses = expByMonth.get(key) ?? 0
        const taxEst = estimateTax(revenue, safeRegime, safeActivity)
        const tax = taxEst.amount
        const grossProfit = revenue - expenses
        const netProfit = revenue - expenses - tax
        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0
        return {
          date: d,
          label: formatMonthShort(d),
          monthKey: key,
          revenue,
          expenses,
          tax,
          grossProfit,
          netProfit,
          margin,
        }
      })

      setRows(built)
      setLoading(false)
    }

    fetchPeriodData()
  }, [bizId, taxRegime, activity, currentMonth, period])

  const totals = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + r.revenue, 0)
    const expenses = rows.reduce((s, r) => s + r.expenses, 0)
    const tax = rows.reduce((s, r) => s + r.tax, 0)
    const netProfit = rows.reduce((s, r) => s + r.netProfit, 0)
    const activeMonths = rows.filter((r) => r.revenue > 0).length
    const avgMargin =
      activeMonths > 0
        ? rows.filter((r) => r.revenue > 0).reduce((s, r) => s + r.margin, 0) / activeMonths
        : 0
    return { revenue, expenses, tax, netProfit, avgMargin }
  }, [rows])

  const chartData = rows.map((r) => ({
    label: r.label,
    Receita: r.revenue,
    Despesas: r.expenses,
    Impostos: r.tax,
    'Lucro Líquido': r.netProfit,
  }))

  const CSV_HEADERS = ['Mês', 'Receita (R$)', 'Despesas (R$)', 'Impostos (R$)', 'Lucro Bruto (R$)', 'Lucro Líquido (R$)', 'Margem (%)']
  const csvRows = rows.map((r) => ({
    'Mês': r.label,
    'Receita (R$)': r.revenue.toFixed(2),
    'Despesas (R$)': r.expenses.toFixed(2),
    'Impostos (R$)': r.tax.toFixed(2),
    'Lucro Bruto (R$)': r.grossProfit.toFixed(2),
    'Lucro Líquido (R$)': r.netProfit.toFixed(2),
    'Margem (%)': r.margin.toFixed(2),
  }))

  const isLoading = ctxLoading || loading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
      </div>
    )
  }

  const hasData = rows.some((r) => r.revenue > 0 || r.expenses > 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Table2 className="h-5 w-5 text-[#f59e0b]" />
            Relatório Comparativo
          </h1>
          <p className="text-sm text-app-soft mt-1">{business?.name} · Últimos {period} meses</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Period selector */}
          <div
            className="flex overflow-hidden rounded-[8px] p-0.5"
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all"
                style={
                  period === p
                    ? {
                        background: 'color-mix(in oklab, var(--accent-blue) 20%, transparent)',
                        color: 'var(--accent-blue)',
                      }
                    : { color: 'var(--text-soft)' }
                }
              >
                {p}m
              </button>
            ))}
          </div>

          {/* CSV export */}
          <ExportCSVButton
            headers={CSV_HEADERS}
            rows={csvRows}
            fileName={`saooz-relatorio-${period}m-${new Date().toISOString().slice(0, 7)}.csv`}
          />

          {/* PDF export */}
          <ExportPDFButton
            data={{
              title: 'Relatório Comparativo',
              subtitle: business?.name ?? 'Módulo Empresarial',
              month: `Últimos ${period} meses`,
              totalIncome: totals.revenue,
              totalExpenses: totals.expenses + totals.tax,
              balance: totals.netProfit,
              businessName: business?.name,
              sections: [
                {
                  title: 'Resumo do Período',
                  rows: [
                    { label: 'Receita total', value: formatCurrency(totals.revenue), color: 'green', bold: true },
                    { label: 'Despesas total', value: formatCurrency(totals.expenses), color: 'red' },
                    { label: 'Impostos total', value: formatCurrency(totals.tax), color: 'yellow' },
                    { label: 'Lucro líquido', value: formatCurrency(totals.netProfit), color: totals.netProfit >= 0 ? 'green' : 'red', bold: true, divider: true },
                    { label: 'Margem média', value: `${totals.avgMargin.toFixed(1)}%`, color: totals.avgMargin >= 20 ? 'green' : totals.avgMargin >= 10 ? 'yellow' : 'red' },
                  ],
                },
                {
                  title: 'Por Mês',
                  rows: rows.map((r) => ({
                    label: r.label,
                    value: formatCurrency(r.netProfit),
                    note: `Receita: ${formatCurrency(r.revenue)} | Margem: ${r.margin.toFixed(1)}%`,
                    color: r.netProfit >= 0 ? 'green' : 'red',
                  })),
                },
              ],
            }}
            fileName={`saooz-relatorio-${period}m-${new Date().toISOString().slice(0, 7)}.pdf`}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Receita Total',
            value: totals.revenue,
            icon: TrendingUp,
            color: '#026648',
          },
          {
            label: 'Despesas + Impostos',
            value: totals.expenses + totals.tax,
            icon: TrendingDown,
            color: '#f87171',
          },
          {
            label: 'Lucro Líquido',
            value: totals.netProfit,
            icon: DollarSign,
            color: totals.netProfit >= 0 ? '#026648' : '#f87171',
          },
          {
            label: 'Margem Média',
            value: null,
            pct: totals.avgMargin,
            icon: Percent,
            color:
              totals.avgMargin >= 20
                ? '#026648'
                : totals.avgMargin >= 10
                  ? '#f59e0b'
                  : '#f87171',
          },
        ].map(({ label, value, pct, icon: Icon, color }) => (
          <div key={label} className="card-premium rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-app-soft">{label}</p>
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
            </div>
            {value !== null ? (
              <p className="text-lg font-extrabold tabular-nums" style={{ color }}>
                {formatCurrencyShort(value)}
              </p>
            ) : (
              <p className="text-lg font-extrabold tabular-nums" style={{ color }}>
                {(pct ?? 0).toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      {hasData && (
        <div className="card-premium rounded-[14px] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Evolução mensal</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6B6B6B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrencyShort(v)}
                  tick={{ fill: '#6B6B6B', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  labelStyle={{ color: '#B3B3B3', marginBottom: 4 }}
                  itemStyle={{ color: '#B3B3B3' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#6B6B6B', paddingTop: 8 }}
                />
                <Bar dataKey="Receita" fill="#026648" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Despesas" fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Impostos" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Lucro Líquido" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-premium rounded-[14px] p-5">
        <h2 className="text-sm font-bold text-white mb-4">Detalhamento por mês</h2>

        {/* Desktop table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {['Mês', 'Receita', 'Despesas', 'Impostos', 'Lucro Bruto', 'Lucro Líquido', 'Margem', 'Var.'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs text-app-soft font-medium pb-3 text-right first:text-left first:pl-1 pr-1"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {rows.map((row, i) => {
                const prev = rows[i - 1]
                const isEmpty = row.revenue === 0 && row.expenses === 0
                return (
                  <tr
                    key={row.monthKey}
                    className={isEmpty ? 'opacity-40' : 'hover:bg-[#1A1A1A] transition-colors'}
                  >
                    <td className="py-3 pl-1 text-white font-medium capitalize min-w-[80px]">
                      {row.label}
                    </td>
                    <td className="py-3 pr-1 text-right tabular-nums text-[#026648] font-semibold">
                      {formatCurrencyShort(row.revenue)}
                    </td>
                    <td className="py-3 pr-1 text-right tabular-nums text-[#f87171]">
                      {formatCurrencyShort(row.expenses)}
                    </td>
                    <td className="py-3 pr-1 text-right tabular-nums text-[#f59e0b]">
                      {formatCurrencyShort(row.tax)}
                    </td>
                    <td className="py-3 pr-1 text-right tabular-nums text-app-base">
                      {formatCurrencyShort(row.grossProfit)}
                    </td>
                    <td className="py-3 pr-1 text-right tabular-nums">
                      <span
                        className="font-semibold"
                        style={{ color: row.netProfit >= 0 ? '#026648' : '#f87171' }}
                      >
                        {formatCurrencyShort(row.netProfit)}
                      </span>
                    </td>
                    <td className="py-3 pr-1 text-right">
                      <MarginBadge margin={row.margin} />
                    </td>
                    <td className="py-3 pr-1 text-right">
                      {prev ? (
                        <DeltaBadge current={row.netProfit} previous={prev.netProfit} />
                      ) : (
                        <Minus className="h-3 w-3 text-[#6B6B6B] ml-auto" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#2A2A2A]">
                <td className="py-3 pl-1 text-xs font-bold text-white">Total / Méd.</td>
                <td className="py-3 pr-1 text-right tabular-nums text-[#026648] font-bold text-xs">
                  {formatCurrencyShort(totals.revenue)}
                </td>
                <td className="py-3 pr-1 text-right tabular-nums text-[#f87171] font-bold text-xs">
                  {formatCurrencyShort(totals.expenses)}
                </td>
                <td className="py-3 pr-1 text-right tabular-nums text-[#f59e0b] font-bold text-xs">
                  {formatCurrencyShort(totals.tax)}
                </td>
                <td className="py-3 pr-1 text-right tabular-nums text-app-base font-bold text-xs">
                  {formatCurrencyShort(totals.revenue - totals.expenses)}
                </td>
                <td className="py-3 pr-1 text-right tabular-nums font-bold text-xs">
                  <span style={{ color: totals.netProfit >= 0 ? '#026648' : '#f87171' }}>
                    {formatCurrencyShort(totals.netProfit)}
                  </span>
                </td>
                <td className="py-3 pr-1 text-right">
                  <MarginBadge margin={totals.avgMargin} />
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="card-premium rounded-[14px] p-10 text-center">
          <Table2 className="h-10 w-10 text-[#383838] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Sem dados no período</p>
          <p className="text-sm text-app-soft">
            Registre faturamento ou despesas para ver o relatório comparativo.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-app-soft justify-center pb-2">
        {[
          { color: '#026648', label: 'Receita bruta' },
          { color: '#f87171', label: 'Despesas' },
          { color: '#f59e0b', label: 'Impostos estimados' },
          { color: '#3b82f6', label: 'Lucro líquido' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm inline-block shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
