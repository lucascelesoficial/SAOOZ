'use client'

import { Briefcase, Layers, TrendingUp, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { InvestmentModuleSnapshot, InvestmentScope } from '@/lib/modules/investments/service'

interface InvestmentSummaryCardsProps {
  scope: InvestmentScope
  totalInvested: number
  summary: InvestmentModuleSnapshot['summary']
  cashPosition?: number | null
}

export function InvestmentSummaryCards({
  scope,
  totalInvested,
  summary,
  cashPosition,
}: InvestmentSummaryCardsProps) {
  const cards = [
    {
      key: 'total',
      title: 'Total investido',
      value: formatCurrency(totalInvested),
      icon: TrendingUp,
      highlight: true,
    },
    {
      key: 'accounts',
      title: scope === 'personal' ? 'Contas ativas' : 'Contas empresariais',
      value: String(summary.activeAccountsCount),
      icon: Briefcase,
    },
    {
      key: 'assets',
      title: 'Ativos cadastrados',
      value: String(summary.assetsCount),
      icon: Layers,
    },
    ...(scope === 'business' && cashPosition !== null && cashPosition !== undefined
      ? [
          {
            key: 'cash',
            title: 'Caixa líquido do mês',
            value: formatCurrency(cashPosition),
            icon: Wallet,
          },
        ]
      : []),
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.key} className="panel-card p-4">
            <div className="flex items-center gap-2 text-app-soft">
              <Icon
                className="h-4 w-4"
                style={{ color: card.highlight ? 'var(--accent-blue)' : undefined }}
              />
              <p className="text-xs uppercase tracking-wider">{card.title}</p>
            </div>
            <p
              className="mt-3 text-2xl font-bold"
              style={{ color: card.highlight ? 'var(--accent-blue)' : 'var(--text-strong)' }}
            >
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
