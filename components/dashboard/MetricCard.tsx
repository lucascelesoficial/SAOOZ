'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/formatters'

interface MetricCardProps {
  title: string
  value: number
  color: 'green' | 'red' | 'blue' | 'amber'
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  loading?: boolean
}

const PALETTE = {
  green: {
    base: '#4ade80',
    strong: '#026648',
    surface: 'color-mix(in oklab, #4ade80 14%, transparent)',
    text: '#4ade80',
  },
  red: {
    base: '#f87171',
    strong: '#ef4444',
    surface: 'color-mix(in oklab, #f87171 14%, transparent)',
    text: '#f87171',
  },
  blue: {
    base: 'var(--accent-blue)',
    strong: 'var(--accent-cyan)',
    surface: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
    text: 'var(--accent-blue)',
  },
  amber: {
    base: '#fbbf24',
    strong: '#f59e0b',
    surface: 'color-mix(in oklab, #fbbf24 14%, transparent)',
    text: '#fbbf24',
  },
}

export function MetricCard({
  title,
  value,
  color,
  trend = 'neutral',
  subtitle,
  loading = false,
}: MetricCardProps) {
  const palette = PALETTE[color]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  if (loading) {
    return (
      <div className="panel-card rounded-[14px] p-5">
        <Skeleton className="mb-3 h-3.5 w-28" style={{ background: 'var(--panel-border)' }} />
        <Skeleton className="mb-4 h-9 w-36" style={{ background: 'var(--panel-border)' }} />
        <Skeleton className="h-3.5 w-40" style={{ background: 'var(--panel-border)' }} />
      </div>
    )
  }

  return (
    <div className="panel-card rounded-[14px] p-5 flex flex-col gap-2 transition-all hover:border-[var(--panel-border-strong)]">
      {/* Title + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-app-soft">
          {title}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-[8px]"
          style={{ background: palette.surface, color: palette.strong }}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>

      {/* Value */}
      <p className="text-[1.75rem] font-extrabold tabular-nums leading-none text-app">
        {formatCurrency(value)}
      </p>

      {/* Subtitle / trend text */}
      <div className="flex items-center gap-1 text-xs">
        {subtitle ? (
          <span style={{ color: palette.text }} className="font-medium">
            {subtitle}
          </span>
        ) : (
          <span className="text-app-soft">—</span>
        )}
      </div>

      {/* Bottom accent bar */}
      <div
        className="mt-1 h-[3px] w-full rounded-full opacity-30"
        style={{ background: `linear-gradient(90deg, ${palette.base}, transparent)` }}
      />
    </div>
  )
}
