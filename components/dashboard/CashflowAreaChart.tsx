'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Database } from '@/types/database.types'

type PfExpense = Database['public']['Tables']['expenses']['Row']
type PfIncome = Database['public']['Tables']['income_sources']['Row']

interface CashflowAreaChartProps {
  incomes: PfIncome[]
  expenses: PfExpense[]
  loading?: boolean
}

function buildChartData(incomes: PfIncome[], expenses: PfExpense[]) {
  // Build daily checkpoints for the current month
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const today = now.getDate()

  // Sum incomes and expenses by day
  const byDay: Record<number, { receitas: number; despesas: number }> = {}

  for (const inc of incomes) {
    const d = inc.created_at ? new Date(inc.created_at).getDate() : 1
    if (!byDay[d]) byDay[d] = { receitas: 0, despesas: 0 }
    byDay[d].receitas += inc.amount
  }

  for (const exp of expenses) {
    const d = exp.created_at ? new Date(exp.created_at).getDate() : 1
    if (!byDay[d]) byDay[d] = { receitas: 0, despesas: 0 }
    byDay[d].despesas += exp.amount
  }

  // Build cumulative series for displayed checkpoints
  const checkpoints = [1, Math.ceil(daysInMonth * 0.2), Math.ceil(daysInMonth * 0.4),
    Math.ceil(daysInMonth * 0.6), Math.ceil(daysInMonth * 0.8), daysInMonth]
  const uniqueCheckpoints = [...new Set(checkpoints)].filter((d) => d <= today || d === 1)

  let cumReceitas = 0
  let cumDespesas = 0
  const result: { dia: string; receitas: number; despesas: number; saldo: number }[] = []

  for (let day = 1; day <= today; day++) {
    cumReceitas += byDay[day]?.receitas ?? 0
    cumDespesas += byDay[day]?.despesas ?? 0

    if (uniqueCheckpoints.includes(day) || day === today) {
      result.push({
        dia: `Dia ${day}`,
        receitas: cumReceitas,
        despesas: cumDespesas,
        saldo: cumReceitas - cumDespesas,
      })
    }
  }

  // Always ensure we have at least 2 points for the chart
  if (result.length < 2) {
    return [
      { dia: 'Dia 1', receitas: 0, despesas: 0, saldo: 0 },
      { dia: `Dia ${today}`, receitas: cumReceitas, despesas: cumDespesas, saldo: cumReceitas - cumDespesas },
    ]
  }

  return result
}

function formatYAxis(value: number) {
  if (value === 0) return 'R$0'
  if (Math.abs(value) >= 1000) return `R$${(value / 1000).toFixed(0)}k`
  return `R$${value}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-[10px] px-3 py-2.5 text-xs shadow-xl"
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border-strong)',
        color: 'var(--text-strong)',
        minWidth: 140,
      }}
    >
      <p className="mb-1.5 font-semibold text-app-soft">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center justify-between gap-3">
          <span style={{ color: entry.color }}>
            {entry.name === 'receitas' ? 'Receitas' : entry.name === 'despesas' ? 'Despesas' : 'Saldo'}
          </span>
          <span className="font-bold tabular-nums" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

export function CashflowAreaChart({ incomes, expenses, loading }: CashflowAreaChartProps) {
  const data = buildChartData(incomes, expenses)

  return (
    <div className="panel-card p-5 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-app">Fluxo de caixa ao longo do tempo</h2>
          <p className="mt-0.5 text-xs text-app-soft">Evolução acumulada no mês</p>
        </div>
        <span
          className="rounded-[6px] px-2.5 py-1 text-xs font-medium"
          style={{
            background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
            color: 'var(--accent-blue)',
            border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)',
          }}
        >
          Este mês
        </span>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent-blue)' }} />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="dia"
              tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />

            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--panel-border-strong)', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="receitas"
              stroke="#4ade80"
              strokeWidth={2}
              fill="url(#gradReceitas)"
              dot={false}
              activeDot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="despesas"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#gradDespesas)"
              dot={false}
              activeDot={{ r: 4, fill: '#f87171', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#a3e635"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              fill="url(#gradSaldo)"
              dot={false}
              activeDot={{ r: 4, fill: '#a3e635', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5 justify-center">
        {[
          { color: '#4ade80', label: 'Receitas' },
          { color: '#f87171', label: 'Despesas' },
          { color: '#a3e635', label: 'Saldo', dashed: true },
        ].map(({ color, label, dashed }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {dashed ? (
                <svg width="16" height="3" viewBox="0 0 16 3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke={color} strokeWidth="2" strokeDasharray="4 2" /></svg>
              ) : (
                <div className="h-[3px] w-4 rounded-full" style={{ background: color }} />
              )}
            </div>
            <span className="text-[11px] text-app-soft">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
