'use client'

import {
  AlertTriangle,
  CalendarClock,
  Goal,
  Layers3,
  ShieldCheck,
  Target,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ReserveModuleSnapshot, ReserveScope } from '@/lib/modules/reserve/service'

interface ReserveKpiCardsProps {
  scope: ReserveScope
  metrics: ReserveModuleSnapshot['metrics']
}

function safeMetric(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return value
}

function formatCoverage(value: number) {
  const safeValue = safeMetric(value)
  return `${safeValue.toFixed(1)} meses`
}

function formatProjection(value: number | null) {
  if (value === null) {
    return 'Nao estimado'
  }

  if (!Number.isFinite(value)) {
    return 'Nao estimado'
  }

  return `${value} mes(es)`
}

export function ReserveKpiCards({ scope, metrics }: ReserveKpiCardsProps) {
  const cards = [
    {
      key: 'essential',
      title: scope === 'personal' ? 'Gasto essencial medio' : 'Custo operacional essencial',
      value: formatCurrency(safeMetric(metrics.essentialMonthlyAverage)),
      icon: Layers3,
    },
    {
      key: 'current',
      title: scope === 'personal' ? 'Reserva atual' : 'Reserva operacional atual',
      value: formatCurrency(safeMetric(metrics.reserveCurrentAmount)),
      icon: Wallet,
    },
    {
      key: 'coverage',
      title: 'Cobertura',
      value: formatCoverage(metrics.coverageMonths),
      icon: ShieldCheck,
    },
    {
      key: 'target',
      title: 'Meta da reserva',
      value: formatCurrency(safeMetric(metrics.targetAmount)),
      icon: Goal,
    },
    {
      key: 'remaining',
      title: 'Falta para atingir',
      value: formatCurrency(safeMetric(metrics.remainingToTarget)),
      icon: Target,
    },
    {
      key: 'projection',
      title: 'Tempo projetado para meta',
      value: formatProjection(metrics.projectedMonthsToTarget),
      icon: CalendarClock,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.key} className="panel-card p-4">
            <div className="flex items-center gap-2 text-app-soft">
              <Icon className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
              <p className="text-xs uppercase tracking-wider">{card.title}</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-app">{card.value}</p>
          </div>
        )
      })}

      {scope === 'business' && metrics.status && (
        <div className="panel-card p-4">
          <div className="flex items-center gap-2 text-app-soft">
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider">Estado da protecao</p>
          </div>
          <p className="mt-3 text-2xl font-bold text-app">{metrics.status.label}</p>
          <p className="mt-1 text-xs text-app-soft">
            Classificacao automatica baseada na cobertura atual.
          </p>
        </div>
      )}
    </div>
  )
}
