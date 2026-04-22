'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { AddExpenseModal } from '@/components/dashboard/AddExpenseModal'
import { CashflowAreaChart } from '@/components/dashboard/CashflowAreaChart'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { ExpenseDonutChart } from '@/components/dashboard/ExpenseDonutChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { SaoozAI } from '@/components/dashboard/SaoozAI'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { formatMonth } from '@/lib/utils/formatters'
import { CATEGORY_LABELS, INCOME_TYPE_LABELS } from '@/types/financial.types'

interface DashboardClientProps {
  userId: string
  canCreateBusiness: boolean
  businessLimitReached: boolean
  isTrial: boolean
  planType: 'pf' | 'pj' | 'pro'
}

export function DashboardClient({
  userId,
  canCreateBusiness,
  businessLimitReached,
  isTrial,
  planType,
}: DashboardClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { totals, categoryData, incomes, expenses, isLoading, currentMonth } = useFinancialData()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Plano ativado com sucesso!', {
        description: 'Bem-vindo ao Pear Finance. Seu acesso completo está liberado.',
        duration: 6000,
      })
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const isUpsell = isTrial && planType === 'pf'
  const showHeaderCta = isUpsell || canCreateBusiness || businessLimitReached
  const businessCtaHref = isUpsell
    ? '/onboarding/plano'
    : canCreateBusiness
      ? '/onboarding/empresa'
      : '/planos?feature=business_limit'
  const businessCtaLabel = isUpsell
    ? 'Abrir conta empresarial'
    : canCreateBusiness
      ? 'Adicionar empresa'
      : 'Aumentar limite'

  // Consumption subtitle
  const consumptionSubtitle = `${totals.consumptionRate.toFixed(0)}% da renda comprometida`

  return (
    <>
      <OnboardingChecklist scope="pf" userId={userId} />

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app">Visão geral</h1>
          <p className="mt-0.5 text-sm text-app-soft">
            Bem-vindo de volta 👋 &nbsp;
            <span className="text-app-base font-medium">{formatMonth(currentMonth)}</span>
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
            fileName={`pear-finance-central-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          {showHeaderCta && (
            <Link
              href={businessCtaHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium text-app transition-colors hover:opacity-90"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)' }}
            >
              <Building2 className="h-4 w-4" />
              {businessCtaLabel}
            </Link>
          )}
        </div>
      </div>

      {/* ── 4 Metric cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Saldo total"
          value={totals.balance}
          color={totals.balance >= 0 ? 'green' : 'red'}
          trend={totals.balance >= 0 ? 'up' : 'down'}
          subtitle={totals.balance >= 0 ? 'Positivo este mês' : 'Saldo negativo'}
          loading={isLoading}
        />
        <MetricCard
          title="Receitas do mês"
          value={totals.totalIncome}
          color="green"
          trend="up"
          subtitle={incomes.length > 0 ? `${incomes.length} lançamento${incomes.length > 1 ? 's' : ''}` : 'Sem receitas'}
          loading={isLoading}
        />
        <MetricCard
          title="Despesas do mês"
          value={totals.totalExpenses}
          color="red"
          trend="down"
          subtitle={expenses.length > 0 ? `${expenses.length} lançamento${expenses.length > 1 ? 's' : ''}` : 'Sem despesas'}
          loading={isLoading}
        />
        <MetricCard
          title="Taxa de consumo"
          value={totals.totalExpenses}
          color={totals.consumptionRate > 90 ? 'red' : totals.consumptionRate > 70 ? 'amber' : 'blue'}
          trend={totals.consumptionRate > 80 ? 'down' : 'neutral'}
          subtitle={consumptionSubtitle}
          loading={isLoading}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Cashflow area chart — 3 cols */}
        <div className="lg:col-span-3">
          <CashflowAreaChart incomes={incomes} expenses={expenses} loading={isLoading} />
        </div>
        {/* Donut chart — 2 cols */}
        <div className="lg:col-span-2">
          <ExpenseDonutChart data={categoryData} total={totals.totalExpenses} loading={isLoading} />
        </div>
      </div>

      {/* ── Bottom row: categories + AI ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="panel-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-app-base">
            Gastos por Categoria
          </h2>
          <CategoryList data={categoryData} loading={isLoading} onAddExpense={() => setModalOpen(true)} />
        </div>
        <div>
          <SaoozAI userId={userId} totals={totals} categoryData={categoryData} />
        </div>
      </div>

      {/* ── Business module CTA ── */}
      {!canCreateBusiness && !businessLimitReached && (
        <div
          className="mt-6 flex flex-col items-start gap-4 rounded-[14px] p-5 sm:flex-row sm:items-center"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
            style={{
              background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
              border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)',
            }}
          >
            <Building2 className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-app">Módulo Empresarial</p>
            <p className="mt-0.5 text-xs text-app-soft">
              Gerencie sua empresa, impostos, faturamento e DRE no mesmo lugar.
            </p>
          </div>
          <Link
            href="/planos"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[9px] px-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            Ver planos
          </Link>
        </div>
      )}

      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} />
    </>
  )
}
