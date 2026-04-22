'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils/formatters'
import type { CategorySummary } from '@/types/financial.types'

interface ExpenseDonutChartProps {
  data: CategorySummary[]
  total: number
  loading?: boolean
}

const DONUT_COLORS = [
  '#4ade80', // green
  '#fb923c', // orange
  '#a78bfa', // purple
  '#60a5fa', // blue
  '#f472b6', // pink
  '#fbbf24', // amber
  '#34d399', // emerald
  '#f87171', // red
  '#38bdf8', // sky
  '#c084fc', // violet
]

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string; label: string } }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-[10px] px-3 py-2 text-xs shadow-xl"
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border-strong)',
        color: 'var(--text-strong)',
      }}
    >
      <p className="font-semibold" style={{ color: item.payload.fill }}>{item.name}</p>
      <p className="mt-0.5 tabular-nums font-bold">{formatCurrency(item.value)}</p>
    </div>
  )
}

export function ExpenseDonutChart({ data, total, loading }: ExpenseDonutChartProps) {
  const chartData = data
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  return (
    <div className="panel-card p-5 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-app">Distribuição de gastos</h2>
          <p className="mt-0.5 text-xs text-app-soft">Por categoria no mês</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent-blue)' }} />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-app-soft">
          <p className="text-sm">Sem despesas lançadas</p>
          <p className="text-xs">Lance gastos para ver a distribuição</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold tabular-nums text-app leading-tight">
                {formatCurrency(total)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-app-soft">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {chartData.map((item, i) => {
              const color = DONUT_COLORS[i % DONUT_COLORS.length]
              const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
              return (
                <div key={item.category} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="flex-1 truncate text-[11px] text-app-base">{item.label}</span>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-app-soft">
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
