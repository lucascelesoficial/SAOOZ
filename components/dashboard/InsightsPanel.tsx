'use client'

import { TrendingUp, PieChart, AlertTriangle, Info } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface InsightsPanelProps {
  insights: string[]
  loading?: boolean
}

const ICONS = [TrendingUp, PieChart, AlertTriangle, Info]

export function InsightsPanel({ insights, loading = false }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-start p-3 rounded-[8px]" style={{ background: 'color-mix(in oklab, var(--panel-border) 40%, transparent)' }}>
            <Skeleton className="h-5 w-5 rounded shrink-0" style={{ background: 'var(--panel-border)' }} />
            <Skeleton className="h-4 w-full" style={{ background: 'var(--panel-border)' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <p className="text-xs font-bold text-app-soft uppercase tracking-widest mb-3 flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--accent-blue)' }} aria-hidden />
        Case:
      </p>
      <ul className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <li
              key={i}
              className="flex gap-3 items-start px-3 py-2.5 rounded-[8px] transition-colors"
              style={{ background: 'color-mix(in oklab, var(--panel-bg) 85%, transparent)' }}
            >
              <Icon
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: 'var(--accent-blue)', filter: 'drop-shadow(0 0 4px color-mix(in oklab, var(--accent-blue) 70%, transparent))' }}
                aria-hidden
              />
              <span className="text-sm text-app-base leading-snug">{insight}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
