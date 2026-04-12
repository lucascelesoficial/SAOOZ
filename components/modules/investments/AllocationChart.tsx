'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import type { InvestmentAllocationItem } from '@/lib/modules/investments/service'

interface AllocationChartProps {
  allocation: InvestmentAllocationItem[]
  totalInvested: number
}

export function AllocationChart({ allocation, totalInvested }: AllocationChartProps) {
  if (!allocation.length || totalInvested === 0) {
    return (
      <div className="panel-card p-5 text-center">
        <p className="text-sm font-semibold text-app">Sem dados de alocação</p>
        <p className="mt-1 text-xs text-app-soft">
          Cadastre ativos nas suas contas para ver a distribuição.
        </p>
      </div>
    )
  }

  return (
    <div className="panel-card p-5">
      {/* Barra multi-segmento */}
      <div className="mb-4 flex h-3 overflow-hidden rounded-full">
        {allocation.map((item) => (
          <div
            key={item.assetType}
            className="h-full transition-all duration-500"
            style={{
              width: `${item.percentage}%`,
              background: item.color,
              minWidth: item.percentage > 0 ? '2px' : undefined,
            }}
            title={`${item.label}: ${item.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legenda */}
      <div className="space-y-2.5">
        {allocation.map((item) => (
          <div key={item.assetType} className="flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <span className="truncate text-sm text-app">{item.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-app-soft tabular-nums">
                  {formatCurrency(item.totalValue)}
                </span>
                <span
                  className="text-xs font-bold tabular-nums w-10 text-right"
                  style={{ color: item.color }}
                >
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
