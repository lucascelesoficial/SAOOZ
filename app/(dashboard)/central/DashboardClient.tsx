'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { AddExpenseModal } from '@/components/dashboard/AddExpenseModal'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { GaugeChart } from '@/components/dashboard/GaugeChart'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SaoozAI } from '@/components/dashboard/SaoozAI'
import { WaveCashflowChart } from '@/components/dashboard/WaveCashflowChart'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { generateInsights } from '@/lib/utils/calculations'

interface DashboardClientProps {
  userId: string
  canCreateBusiness: boolean
  businessLimitReached: boolean
}

export function DashboardClient({
  userId,
  canCreateBusiness,
  businessLimitReached,
}: DashboardClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { totals, categoryData, incomes, expenses, isLoading } = useFinancialData()
  const insights = useMemo(() => generateInsights(totals, categoryData), [categoryData, totals])
  const businessCtaHref = canCreateBusiness
    ? '/onboarding/empresa'
    : businessLimitReached
      ? '/planos?feature=business_limit'
      : '/planos?feature=business'
  const businessCtaLabel = canCreateBusiness
    ? 'Adicionar empresa'
    : businessLimitReached
      ? 'Aumentar limite'
      : 'Liberar PJ'

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Central</h1>
          <p className="mt-1 text-sm text-app-soft">
            Seu cockpit financeiro pessoal com visao rapida, execucao e expansao para PJ.
          </p>
        </div>
        <Link
          href={businessCtaHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium text-app transition-colors hover:opacity-90"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
          }}
        >
          <Building2 className="h-4 w-4" />
          {businessCtaLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Renda Total"
          value={totals.totalIncome}
          color="green"
          trend="up"
          loading={isLoading}
        />
        <MetricCard
          title="Gastos Totais"
          value={totals.totalExpenses}
          color="red"
          trend="down"
          loading={isLoading}
        />
        <MetricCard
          title="Saldo Atual"
          value={totals.balance}
          color="blue"
          trend={totals.balance >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
      </div>

      <div className="panel-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-base uppercase tracking-wider mb-4 flex items-center gap-2">
          Ritmo Financeiro
          <span style={{ color: 'var(--accent-blue)', opacity: 0.6 }}>›</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-[240px] shrink-0">
            <GaugeChart percentage={totals.consumptionRate} loading={isLoading} />
          </div>
          <div className="flex-1 w-full">
            <InsightsPanel insights={insights} loading={isLoading} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <WaveCashflowChart incomes={incomes} expenses={expenses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="panel-card p-5">
          <h2 className="text-sm font-semibold text-app-base uppercase tracking-wider mb-4">
            Gastos por Categoria
          </h2>
          <CategoryList
            data={categoryData}
            loading={isLoading}
            onAddExpense={() => setModalOpen(true)}
          />
        </div>

        <div>
          <SaoozAI userId={userId} totals={totals} categoryData={categoryData} />
        </div>
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
      />
    </>
  )
}
