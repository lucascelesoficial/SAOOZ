'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { getGaugeColor } from '@/lib/utils/calculations'

interface GaugeChartProps {
  percentage: number
  loading?: boolean
  label?: string
}

export function GaugeChart({ percentage, loading = false, label = 'CONSUMIDO' }: GaugeChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Skeleton className="h-[200px] w-[200px] rounded-full" style={{ background: 'var(--panel-border)' }} />
      </div>
    )
  }

  const clamp = Math.min(100, Math.max(0, percentage))
  const color = getGaugeColor(clamp)
  const R1 = 78
  const R2 = 63
  const C1 = 2 * Math.PI * R1
  const C2 = 2 * Math.PI * R2
  const off1 = C1 * (1 - clamp / 100)
  const off2 = C2 * (1 - clamp / 100)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 200"
        width={200}
        height={200}
        className="overflow-visible"
        aria-label={`${clamp}% da renda consumida`}
      >
        <defs>
          <filter id="outer-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="inner-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="center-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--panel-bg)" />
            <stop offset="100%" stopColor="var(--panel-bg-soft)" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="93" fill="none" stroke="var(--panel-border)" strokeWidth="1" />
        <circle cx="100" cy="100" r="89" fill="none" stroke="var(--panel-bg)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="88" fill="url(#center-fill)" />

        <circle cx="100" cy="100" r={R1} fill="none" stroke="var(--panel-border)" strokeWidth="11" />
        <circle cx="100" cy="100" r={R2} fill="none" stroke="var(--panel-bg)" strokeWidth="7" />

        <circle
          cx="100"
          cy="100"
          r={R1}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C1}
          strokeDashoffset={off1}
          transform="rotate(-90 100 100)"
          filter="url(#outer-glow)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />

        <circle
          cx="100"
          cy="100"
          r={R2}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C2}
          strokeDashoffset={off2}
          transform="rotate(-90 100 100)"
          opacity="0.3"
          filter="url(#inner-glow)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.1s' }}
        />

        <circle cx="100" cy="100" r="52" fill="var(--panel-bg-soft)" />

        <text
          x="100"
          y="94"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="30"
          fontWeight="800"
          fontFamily="inherit"
          style={{ filter: `drop-shadow(0 0 10px ${color}aa)` }}
        >
          {clamp}%
        </text>

        <text
          x="100"
          y="114"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-soft)"
          fontSize="10"
          fontFamily="inherit"
          letterSpacing="1.5"
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
