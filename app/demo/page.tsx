'use client'

/**
 * Demo page — shows the full dashboard UI with mock data.
 * Does NOT require Supabase auth. For visual preview only.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { GaugeChart } from '@/components/dashboard/GaugeChart'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { CategoryList } from '@/components/dashboard/CategoryList'
import { StatusCard } from '@/components/dashboard/StatusCard'
import { SaoozLogo } from '@/components/ui/SaoozLogo'
import {
  LayoutDashboard, User, Briefcase, BarChart2,
  Settings, CreditCard, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { CategorySummary } from '@/types/financial.types'

// ── Mock data ──────────────────────────────────────────────
const MOCK_TOTALS = {
  totalIncome: 6500,
  totalExpenses: 4220,
  balance: 2280,
  consumptionRate: 65,
}

const MOCK_CATEGORIES: CategorySummary[] = [
  { category: 'moradia',      label: 'Moradia',      color: '#3b82f6', total: 1620, percentage: 38 },
  { category: 'alimentacao',  label: 'Alimentação',  color: '#22c55e', total: 850,  percentage: 20 },
  { category: 'transporte',   label: 'Transporte',   color: '#f59e0b', total: 450,  percentage: 11 },
  { category: 'saude',        label: 'Saúde',        color: '#ec4899', total: 470,  percentage: 11 },
  { category: 'assinaturas',  label: 'Assinaturas',  color: '#6366f1', total: 80,   percentage: 2  },
  { category: 'educacao',     label: 'Educação',     color: '#8b5cf6', total: 200,  percentage: 5  },
  { category: 'lazer',        label: 'Lazer',        color: '#06b6d4', total: 200,  percentage: 5  },
  { category: 'dividas',      label: 'Dívidas',      color: '#f87171', total: 350,  percentage: 8  },
]

const MOCK_INSIGHTS = [
  'Você está usando 65% da sua renda. Excelente controle!',
  'Sua maior despesa é Moradia (38% dos gastos — R$ 1.620,00).',
  'Sobra disponível: R$ 2.280,00. Considere investir parte disso.',
]

const NAV_ITEMS = [
  { label: 'Resumo',           icon: LayoutDashboard, active: true  },
  { label: 'Perfil Financeiro',icon: User,             active: false },
  { label: 'Negócios & Renda', icon: Briefcase,        active: false },
  { label: 'Análise',          icon: BarChart2,        active: false },
  { label: 'Minha Conta',      icon: Settings,         active: false },
  { label: 'Planos',           icon: CreditCard,       active: false },
]

export default function DemoPage() {
  const [activeNav, setActiveNav] = useState(0)

  return (
    <div className="flex min-h-screen bg-[#04091e]">

      {/* ── SIDEBAR (desktop) ─────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] flex-col bg-[#08112e] border-r border-[#0f1f42] z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#0f1f42]">
          <SaoozLogo size="md" />
          <span className="text-white font-bold text-lg tracking-tight">SAOOZ</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              onClick={() => setActiveNav(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${
                activeNav === i
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                  : 'text-[#8899bb] hover:bg-[#0f1f42] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#0f1f42] space-y-3">
          <div className="px-3 py-1.5 rounded-[8px] bg-[#0f1f42] flex items-center justify-between">
            <span className="text-xs text-[#8899bb]">Plano</span>
            <span className="text-xs font-semibold text-[#3b82f6]">Grátis</span>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold">L</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Lucas Demo</p>
              <p className="text-xs text-[#4a6080] truncate">demo@saooz.com</p>
            </div>
            <LogOut className="h-4 w-4 text-[#4a6080]" />
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#04091e]/80 backdrop-blur border-b border-[#0f1f42] px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#4a6080] hidden md:block tracking-widest">
            NÚCLEO FINANCEIRO ATIVADO...
          </span>
          <span className="text-white font-semibold text-base md:hidden">Resumo</span>

          <div className="flex items-center gap-1">
            <button className="p-1 rounded-[6px] text-[#4a6080] hover:text-white hover:bg-[#0f1f42]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-white min-w-[110px] text-center">Abril 2026</span>
            <button className="p-1 rounded-[6px] text-[#4a6080] opacity-30 cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="h-8 w-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold">L</div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MetricCard title="Renda Total"   value={MOCK_TOTALS.totalIncome}   color="green" trend="up"   />
            <MetricCard title="Gastos Totais" value={MOCK_TOTALS.totalExpenses} color="red"   trend="down" />
            <MetricCard title="Saldo Atual"   value={MOCK_TOTALS.balance}       color="blue"  trend="up"   />
          </div>

          {/* Ritmo Financeiro */}
          <div className="bg-[#08112e] border border-[#0f1f42] rounded-[12px] p-5 mb-6">
            <h2 className="text-sm font-semibold text-[#8899bb] uppercase tracking-wider mb-4">
              Ritmo Financeiro
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-[240px] shrink-0">
                <GaugeChart percentage={MOCK_TOTALS.consumptionRate} />
              </div>
              <div className="flex-1 w-full">
                <InsightsPanel insights={MOCK_INSIGHTS} />
              </div>
            </div>
          </div>

          {/* Category list + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#08112e] border border-[#0f1f42] rounded-[12px] p-5">
              <h2 className="text-sm font-semibold text-[#8899bb] uppercase tracking-wider mb-4">
                Gastos por Categoria
              </h2>
              <CategoryList data={MOCK_CATEGORIES} />
            </div>

            <StatusCard
              variant="positive"
              label="Controle"
              description="Você está no controle das suas finanças."
              action={
                <Button className="bg-[#3b82f6] hover:bg-[#1d4ed8] text-white rounded-[8px] w-full">
                  Adicionar Gasto
                </Button>
              }
            />
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#08112e] border-t border-[#0f1f42] flex items-center justify-around px-2 py-2">
        {[
          { label: 'Resumo',  icon: LayoutDashboard },
          { label: 'Perfil',  icon: User },
          { label: 'Renda',   icon: Briefcase },
          { label: 'Análise', icon: BarChart2 },
          { label: 'Conta',   icon: Settings },
        ].map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            onClick={() => setActiveNav(i)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-[8px] transition-colors ${
              activeNav === i ? 'text-[#3b82f6]' : 'text-[#4a6080]'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
