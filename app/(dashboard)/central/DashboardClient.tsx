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
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { generateInsights } from '@/lib/utils/calculations'
import { formatMonth } from '@/lib/utils/formatters'
import { CATEGORY_LABELS, INCOME_TYPE_LABELS } from '@/types/financial.types'

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
  const { totals, categoryData, incomes, expenses, isLoading, currentMonth } = useFinancialData()
  const insights = useMemo(() => generateInsights(totals, categoryData), [categoryData, totals])
  // Show the header CTA only when user has PJ access (can create or hit limit)
  const showHeaderCta = canCreateBusiness || businessLimitReached
  const businessCtaHref = canCreateBusiness
    ? '/onboarding/empresa'
    : '/planos?feature=business_limit'
  const businessCtaLabel = canCreateBusiness ? 'Adicionar empresa' : 'Aumentar limite'

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Central</h1>
          <p className="mt-1 text-sm text-app-soft">
            Seu cockpit financeiro PF com visão rápida, execução e expansão para PJ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPDFButton
            data={{
              title: 'Relatório Central',
              subtitle: 'Módulo PF',
              month: formatMonth(currentMonth),
              totalIncome: totals.totalIncome,
              totalExpenses: totals.totalExpenses,
              balance: totals.balance,
              incomes: incomes.map((i) => ({
                name: i.name,
                type: INCOME_TYPE_LABELS[i.type] ?? i.type,
                amount: i.amount,
                date: i.created_at ? new Date(i.created_at).toLocaleDateString('pt-BR') : undefined,
              })),
              expenses: expenses.map((e) => ({
                category: CATEGORY_LABELS[e.category] ?? e.category,
                description: e.description ?? undefined,
                amount: e.amount,
                date: e.created_at ? new Date(e.created_at).toLocaleDateString('pt-BR') : undefined,
              })),
            }}
            fileName={`saooz-central-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          {showHeaderCta && (
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
          )}
        </div>
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

      {/* Passive PJ upgrade banner — only for users without any PJ access */}
      {!canCreateBusiness && !businessLimitReached && (
        <div
          className="mt-6 rounded-[14px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
          }}
        >
          <div
            className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)' }}
          >
            <Building2 className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-app">Módulo Empresarial</p>
            <p className="text-xs text-app-soft mt-0.5">Gerencie sua empresa, impostos, faturamento e DRE no mesmo lugar.</p>
          </div>
          <Link
            href="/planos"
            className="shrink-0 inline-flex h-9 items-center justify-center gap-2 rounded-[9px] px-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            Ver planos
          </Link>
        </div>
      )}

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
      />
    </>
  )
}
