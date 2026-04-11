'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/formatters'

interface MetricCardProps {
  title: string
  value: number
  color: 'green' | 'red' | 'blue'
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

export function MetricCard({
  title,
  value,
  color,
  trend = 'neutral',
  loading = false,
}: MetricCardProps) {
  const TrendIcon = TREND_ICONS[trend]

  if (loading) {
    return (
      <div className="rounded-[12px] p-5 overflow-hidden panel-card">
        <Skeleton className="h-4 w-24 mb-3" style={{ background: 'var(--panel-border)' }} />
        <Skeleton className="h-8 w-32 mb-6" style={{ background: 'var(--panel-border)' }} />
        <Skeleton className="h-10 w-full" style={{ background: 'var(--panel-border)' }} />
      </div>
    )
  }

  return (
    <div className="rounded-[12px] p-5 overflow-hidden relative flex flex-col gap-2 panel-card transition-all">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-app-base font-medium">{title}</span>
        <span
          className="p-1.5 rounded-[6px]"
          style={{
            background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
            color: 'var(--accent-blue)',
          }}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>

      {/* Value */}
      <p className="text-[1.7rem] font-extrabold tabular-nums leading-tight text-app">
        {formatCurrency(value)}
      </p>

      {/* Animated blue wave */}
      <div className="relative h-10 w-full overflow-hidden mt-1 rounded-b-[8px]">
        <svg
          className="animate-wave absolute bottom-0"
          style={{ width: '200%', height: '40px' }}
          viewBox="0 0 800 40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={`wave-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 450,20 C500,5 550,35 600,20 C650,5 700,35 750,20 C800,5 800,20 800,20 L800,40 L0,40 Z"
            fill={`url(#wave-grad-${color})`}
          />
          <path
            d="M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 450,20 C500,5 550,35 600,20 C650,5 700,35 750,20 C800,5 800,20 800,20"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  )
}
