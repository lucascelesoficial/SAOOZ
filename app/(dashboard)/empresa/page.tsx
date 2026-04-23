'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { SaoozAIPJ } from '@/components/dashboard/SaoozAIPJ'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatCurrencyShort, formatMonth } from '@/lib/utils/formatters'
import { regimeLabel, activityLabel } from '@/lib/utils/taxes'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import type { BusinessExpCategory, Database } from '@/types/database.types'
import type { TaxEstimate } from '@/lib/utils/taxes'
import type { BusinessTotals } from '@/lib/context/BusinessDataContext'
import {
  Building2, ArrowUpRight, ArrowDownLeft,
  Users2, Handshake, ChevronRight, Sparkles,
  BrainCircuit, BadgeCheck, TriangleAlert, Lightbulb, Rocket,
  Calendar, TrendingDown, Target, Truck, Receipt,
} from 'lucide-react'

type BusinessRevenue = Database['public']['Tables']['business_revenues']['Row']
type BusinessExpense = Database['public']['Tables']['business_expenses']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ArApSummary {
  totalAReceber:   number
  totalAPagar:     number
  overdueRevenues: number
  overdueExpenses: number
  dueSoon:         number
  dueSoonAmount:   number
}

interface ComprehensiveData {
  employeeCount:   number
  clienteCount:    number
  fornecedorCount: number
  budgetTotal:     number
  budgetActual:    number
}

type InsightType = 'risk' | 'warning' | 'opportunity' | 'achievement'

interface ProactiveInsight {
  id:      string
  type:    InsightType
  title:   string
  body:    string
  metric?: string
  action?: { label: string; href: string }
  priority: 1 | 2 | 3
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function generateIntelligence(
  totals:      BusinessTotals,
  expenses:    BusinessExpense[],
  revenues:    BusinessRevenue[],
  comp:        ComprehensiveData | null,
  arAp:        ArApSummary | null,
  taxEstimate: TaxEstimate | null,
): ProactiveInsight[] {
  const list: ProactiveInsight[] = []

  const fixedCosts = expenses
    .filter((e) => (e.category as BusinessExpCategory).startsWith('fixo_'))
    .reduce((s, e) => s + e.amount, 0)
  const mrr = revenues.filter((r) => r.is_recurring).reduce((s, r) => s + r.amount, 0)
  const recurringExpTotal = expenses.filter((e) => e.is_recurring).reduce((s, e) => s + e.amount, 0)

  // 1 · Vencidos
  if (arAp && (arAp.overdueRevenues > 0 || arAp.overdueExpenses > 0)) {
    const parts: string[] = []
    if (arAp.overdueRevenues > 0) parts.push(`${arAp.overdueRevenues} recebimento${arAp.overdueRevenues > 1 ? 's' : ''} em atraso`)
    if (arAp.overdueExpenses > 0) parts.push(`${arAp.overdueExpenses} pagamento${arAp.overdueExpenses > 1 ? 's' : ''} vencido${arAp.overdueExpenses > 1 ? 's' : ''}`)
    list.push({
      id: 'overdue', type: 'risk', priority: 1,
      title: 'Você tem cobranças atrasadas',
      body: parts.join(' e ') + `. Total envolvido: ${formatCurrency(arAp.totalAPagar)}.`,
      metric: `${arAp.overdueRevenues + arAp.overdueExpenses} itens`,
      action: { label: 'Ver fluxo de caixa', href: '/empresa/fluxo-de-caixa' },
    })
  } else if (arAp && arAp.dueSoon > 0) {
    list.push({
      id: 'due-soon', type: 'warning', priority: 1,
      title: `${formatCurrency(arAp.dueSoonAmount)} vencem nos próximos 7 dias`,
      body: `Você tem ${arAp.dueSoon} conta${arAp.dueSoon > 1 ? 's' : ''} vencendo esta semana. Fique de olho.`,
      metric: `${arAp.dueSoon} itens`,
      action: { label: 'Ver fluxo de caixa', href: '/empresa/fluxo-de-caixa' },
    })
  }

  // 2 · Cobertura MRR
  if (fixedCosts > 0 && totals.totalRevenue > 0) {
    const coverage = mrr / fixedCosts
    if (coverage >= 1) {
      list.push({
        id: 'mrr-full', type: 'achievement', priority: 2,
        title: 'Sua receita mensal cobre todos os custos fixos',
        body: `Você recebe ${formatCurrency(mrr)} todo mês de forma garantida e gasta ${formatCurrency(fixedCosts)} em custos fixos. Situação confortável.`,
        metric: `${Math.round(coverage * 100)}% cobertura`,
      })
    } else if (coverage >= 0.5) {
      list.push({
        id: 'mrr-partial', type: 'opportunity', priority: 2,
        title: `Sua receita mensal cobre ${Math.round(coverage * 100)}% dos custos fixos`,
        body: `Se você garantir mais ${formatCurrency(fixedCosts - mrr)}/mês em receitas fixas, não vai depender de trabalhos avulsos.`,
        metric: `gap de ${formatCurrencyShort(fixedCosts - mrr)}`,
        action: { label: 'Ver finanças', href: '/empresa/financas' },
      })
    } else if (mrr > 0) {
      list.push({
        id: 'mrr-low', type: 'warning', priority: 1,
        title: `Só ${Math.round(coverage * 100)}% dos seus custos fixos estão cobertos`,
        body: `Você depende muito de vendas avulsas. Uma queda nas entradas pode comprometer ${formatCurrency(fixedCosts)}/mês em contas fixas.`,
        metric: `MRR ${formatCurrencyShort(mrr)}`,
        action: { label: 'Adicionar recorrências', href: '/empresa/financas' },
      })
    }
  }

  // 3 · Orçamento
  if (comp && comp.budgetTotal > 0) {
    const pct = comp.budgetActual / comp.budgetTotal
    if (pct > 1) {
      list.push({
        id: 'budget-over', type: 'risk', priority: 1,
        title: 'Você gastou mais do que planejou',
        body: `Você gastou ${formatCurrency(comp.budgetActual)}, passando ${formatCurrencyShort(comp.budgetActual - comp.budgetTotal)} acima do limite de ${formatCurrency(comp.budgetTotal)} que definiu.`,
        metric: `+${Math.round((pct - 1) * 100)}% acima`,
        action: { label: 'Ver orçamento', href: '/empresa/orcamento' },
      })
    } else if (pct > 0.85) {
      list.push({
        id: 'budget-alert', type: 'warning', priority: 2,
        title: `Você já usou ${Math.round(pct * 100)}% do orçamento`,
        body: `Ainda tem ${formatCurrency(comp.budgetTotal - comp.budgetActual)} disponível. Avalie os gastos antes de fechar o mês.`,
        metric: `restam ${formatCurrencyShort(comp.budgetTotal - comp.budgetActual)}`,
        action: { label: 'Ver orçamento', href: '/empresa/orcamento' },
      })
    }
  }

  // 4 · Margem
  if (totals.profitMargin >= 0.3 && totals.totalRevenue > 0) {
    list.push({
      id: 'margin-excellent', type: 'achievement', priority: 3,
      title: `Margem de lucro de ${(totals.profitMargin * 100).toFixed(1)}% — acima da média`,
      body: `De cada R$ 100 faturados, ${(totals.profitMargin * 100).toFixed(0)} ficam como lucro.`,
      metric: `${(totals.profitMargin * 100).toFixed(1)}%`,
      action: { label: 'Ver DRE', href: '/empresa/dre' },
    })
  } else if (totals.profitMargin < 0.05 && totals.totalRevenue > 0) {
    list.push({
      id: 'margin-low', type: 'risk', priority: 1,
      title: `Sua margem de lucro está muito baixa: ${(totals.profitMargin * 100).toFixed(1)}%`,
      body: `Quase nada sobra de lucro. Veja se pode cortar custos ou cobrar mais pelos seus serviços.`,
      metric: `${(totals.profitMargin * 100).toFixed(1)}%`,
      action: { label: 'Ver despesas', href: '/empresa/despesas' },
    })
  }

  // 5 · Sem clientes
  if (comp && comp.clienteCount === 0 && totals.totalRevenue > 0) {
    list.push({
      id: 'no-clients', type: 'opportunity', priority: 2,
      title: 'Cadastre seus clientes',
      body: `Você já tem receita, mas não tem clientes cadastrados. Faça isso para saber de onde vem o dinheiro.`,
      metric: 'sem clientes',
      action: { label: 'Cadastrar clientes', href: '/empresa/clientes' },
    })
  }

  // 6 · Base recorrente positiva
  if (mrr > 0 && recurringExpTotal > 0 && mrr > recurringExpTotal) {
    list.push({
      id: 'recurring-positive', type: 'achievement', priority: 3,
      title: 'Entradas fixas maiores que saídas fixas',
      body: `Sua receita mensal fixa supera seus gastos fixos em ${formatCurrency(mrr - recurringExpTotal)} por mês.`,
      metric: `+${formatCurrencyShort(mrr - recurringExpTotal)}/mês`,
    })
  }

  // 7 · Regime eficiente
  if (totals.taxRate > 0 && totals.taxRate <= 0.06 && totals.totalRevenue > 0) {
    list.push({
      id: 'tax-efficient', type: 'achievement', priority: 3,
      title: `Você paga ${(totals.taxRate * 100).toFixed(1)}% de imposto — uma das menores taxas possíveis`,
      body: `O ${taxEstimate?.regime ?? 'seu regime tributário'} te dá uma das menores taxas de imposto disponíveis.`,
      metric: `${(totals.taxRate * 100).toFixed(1)}%`,
    })
  }

  return list.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT VISUAL CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHT_CFG: Record<InsightType, { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
  risk:        { color: '#f87171', bg: '#f8717108', border: '#f8717122', Icon: TriangleAlert, label: 'Risco'        },
  warning:     { color: '#f59e0b', bg: '#f59e0b08', border: '#f59e0b22', Icon: TriangleAlert, label: 'Atenção'      },
  opportunity: { color: '#026648', bg: '#02664808', border: '#02664822', Icon: Lightbulb,     label: 'Oportunidade' },
  achievement: { color: '#026648', bg: '#02664808', border: '#02664822', Icon: BadgeCheck,    label: 'Conquista'    },
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────

function healthScore(margin: number, taxRate: number, hasRevenue: boolean) {
  if (!hasRevenue) return { score: 0, label: 'Sem dados', color: '#4B5563' }
  const s = Math.round(Math.min(margin * 250, 60) + Math.max(0, 40 - taxRate * 200))
  if (s >= 75) return { score: s, label: 'Saudável',  color: '#026648' }
  if (s >= 55) return { score: s, label: 'Estável',   color: '#026648' }
  if (s >= 35) return { score: s, label: 'Atenção',   color: '#f59e0b' }
  return              { score: s, label: 'Crítico',   color: '#f87171' }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ProactiveInsightCard({ insight }: { insight: ProactiveInsight }) {
  const cfg = INSIGHT_CFG[insight.type]
  const Icon = cfg.Icon
  return (
    <div className="flex flex-col gap-2.5 rounded-[12px] p-4 transition-all"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}22` }}>
            <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        {insight.metric && (
          <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: cfg.color }}>
            {insight.metric}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-app leading-snug mb-1">{insight.title}</p>
        <p className="text-xs leading-relaxed text-app-soft">{insight.body}</p>
      </div>
      {insight.action && (
        <Link href={insight.action.href}
          className="self-start text-[11px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: cfg.color }}>
          {insight.action.label} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY LABELS
// ─────────────────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  fixo_aluguel: 'Aluguel', fixo_salarios: 'Salários', fixo_prolabore: 'Pró-labore',
  fixo_contador: 'Contabilidade', fixo_software: 'Softwares', fixo_internet: 'Internet',
  fixo_outros: 'Fixos outros', variavel_comissao: 'Comissões', variavel_frete: 'Frete',
  variavel_embalagem: 'Embalagem', variavel_trafego: 'Tráfego pago',
  variavel_taxas: 'Taxas bancárias', variavel_outros: 'Variáveis outros',
  operacional_marketing: 'Marketing', operacional_admin: 'Administrativo',
  operacional_juridico: 'Jurídico', operacional_manutencao: 'Manutenção',
  operacional_viagem: 'Viagens', operacional_outros: 'Operacional outros',
  investimento_equipamento: 'Equipamentos', investimento_estoque: 'Estoque',
  investimento_expansao: 'Expansão', investimento_contratacao: 'Contratações',
  investimento_outros: 'Investimentos outros',
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function EmpresaPage() {
  const { business, revenues, expenses, totals, taxEstimate, currentMonth, isLoading } =
    useBusinessData()

  const [userId,        setUserId]        = useState<string | null>(null)
  const [arAp,          setArAp]          = useState<ArApSummary | null>(null)
  const [comprehensive, setComprehensive] = useState<ComprehensiveData | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // AR/AP + vencimentos próximos
  useEffect(() => {
    if (!business) return
    const supabase = createClient()
    const today    = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const in7d     = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0]
    Promise.all([
      supabase.from('business_revenues').select('amount,due_date,status')
        .eq('business_id', business.id).in('status', ['pending', 'overdue']),
      supabase.from('business_expenses').select('amount,due_date,status')
        .eq('business_id', business.id).in('status', ['pending', 'overdue']),
    ]).then(([rr, er]) => {
      const revs = rr.data ?? []
      const exps = er.data ?? []
      const all  = [...revs, ...exps]
      const soon = all.filter((x) => x.due_date && x.due_date > todayStr && x.due_date <= in7d)
      setArAp({
        totalAReceber:   revs.reduce((s, r) => s + r.amount, 0),
        totalAPagar:     exps.reduce((s, e) => s + e.amount, 0),
        overdueRevenues: revs.filter((r) => r.due_date && r.due_date < todayStr).length,
        overdueExpenses: exps.filter((e) => e.due_date && e.due_date < todayStr).length,
        dueSoon:         soon.length,
        dueSoonAmount:   soon.reduce((s, x) => s + x.amount, 0),
      })
    })
  }, [business])

  // Equipe, clientes, fornecedores, orçamento
  useEffect(() => {
    if (!business) return
    const supabase = createClient()
    const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      .toISOString().split('T')[0]
    Promise.all([
      supabase.from('business_employees')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id).eq('is_active', true),
      supabase.from('business_counterparties')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id).eq('type', 'cliente').eq('is_active', true),
      supabase.from('business_counterparties')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id).eq('type', 'fornecedor').eq('is_active', true),
      supabase.from('business_budgets').select('planned_amount')
        .eq('business_id', business.id).eq('month', monthStr),
    ]).then(([empR, cliR, forR, budR]) => {
      setComprehensive({
        employeeCount:   empR.count ?? 0,
        clienteCount:    cliR.count ?? 0,
        fornecedorCount: forR.count ?? 0,
        budgetTotal:     (budR.data ?? []).reduce((s, b) => s + b.planned_amount, 0),
        budgetActual:    expenses.reduce((s, e) => s + e.amount, 0),
      })
    })
  }, [business, currentMonth, expenses])

  const intelligence = useMemo(
    () => generateIntelligence(totals, expenses, revenues, comprehensive, arAp, taxEstimate),
    [totals, expenses, revenues, comprehensive, arAp, taxEstimate],
  )

  const { score, label: scoreLabel, color: scoreColor } = healthScore(
    totals.profitMargin, totals.taxRate, totals.totalRevenue > 0,
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
        <p className="text-sm text-[#6B6B6B]">Carregando dados da empresa…</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Onboarding checklist PJ — shown until all steps done or dismissed */}
      {userId && (
        <OnboardingChecklist
          scope="pj"
          userId={userId}
          activeBusinessId={business?.id ?? null}
        />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-sm font-semibold text-app">{business?.name ?? 'Empresa'}</span>
            <span className="text-app-soft">·</span>
            <span className="text-xs text-app-soft">{business ? regimeLabel(business.tax_regime) : ''}</span>
            <span className="text-app-soft">·</span>
            <span className="text-xs text-app-soft">{business ? activityLabel(business.activity) : ''}</span>
          </div>
          <h1 className="text-xl font-extrabold text-app">Empresa</h1>
          <p className="text-sm text-app-soft mt-0.5">{formatMonth(currentMonth)}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ExportPDFButton
            data={{
              title: 'Central da Empresa',
              subtitle: business?.name ?? '',
              month: formatMonth(currentMonth),
              totalIncome: totals.totalRevenue,
              totalExpenses: totals.totalExpenses,
              balance: totals.netProfit,
              taxAmount: totals.taxAmount,
              netProfit: totals.netProfit,
              profitMargin: `${(totals.profitMargin * 100).toFixed(1)}%`,
              businessName: business?.name,
              taxRegime: business?.tax_regime,
              sections: [],
            }}
              fileName={`pearfy-empresa-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />

          {totals.totalRevenue > 0 && (
            <div className="flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-[12px]"
              style={{
                background: `linear-gradient(135deg, ${scoreColor}0A, ${scoreColor}05)`,
                border: `1px solid ${scoreColor}25`,
              }}>
              <div className="relative h-10 w-10 shrink-0">
                <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#1E1E1E" strokeWidth="3.5" />
                  <circle cx="20" cy="20" r="16" fill="none"
                    stroke={scoreColor} strokeWidth="3.5"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - score / 100)}`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 3px ${scoreColor})`, transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold"
                  style={{ color: scoreColor }}>
                  {score}
                </span>
              </div>
              <div>
                <p className="text-[9px] text-app-soft uppercase tracking-widest leading-none mb-1">Saúde da empresa</p>
                <p className="text-sm font-extrabold leading-none" style={{ color: scoreColor }}>{scoreLabel}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── METRIC CARDS — igual ao PF, com ondas ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Recebido"
          value={totals.totalRevenue}
          color="green"
          trend="up"
          loading={isLoading}
        />
        <MetricCard
          title="Total Gasto"
          value={totals.totalExpenses}
          color="red"
          trend="down"
          loading={isLoading}
        />
        <MetricCard
          title="Lucro do Mês"
          value={totals.netProfit}
          color={totals.netProfit >= 0 ? 'blue' : 'red'}
          trend={totals.netProfit >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
      </div>

      {/* ── INTELLIGENCE FEED + AI CHAT ────────────────────────────────────── */}
      <div className="rounded-[14px] overflow-hidden"
        style={{ border: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0A1D13, #163424)', boxShadow: '0 0 12px rgba(116,169,61,0.30)' }}>
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-app flex items-center gap-1.5">
                Pearfy <span style={{ color: 'var(--accent-blue)' }}>Inteligência</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#026648] animate-pulse" />
              </p>
              <p className="text-[10px] text-app-soft">
                {intelligence.length > 0
                  ? `${intelligence.length} análise${intelligence.length > 1 ? 's' : ''} gerada${intelligence.length > 1 ? 's' : ''} com base nos seus dados`
                  : 'Registre dados para ver análises personalizadas'}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: '#02664812', color: '#026648', border: '1px solid #02664822' }}>
            <Sparkles className="h-2.5 w-2.5" /> ao vivo
          </span>
        </div>

        {/* Insight cards */}
        {intelligence.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 pb-0">
            {intelligence.map((ins) => (
              <ProactiveInsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Rocket className="h-8 w-8 text-app-soft mb-3 opacity-40" />
            <p className="text-sm text-app font-semibold mb-1">Nenhum dado ainda</p>
            <p className="text-xs text-app-soft max-w-xs">
              Adicione seus ganhos, gastos e dados da equipe para receber análises feitas para o seu negócio.
            </p>
          </div>
        )}

      </div>

      {/* ── LINHA 1: Contas pendentes + Imposto estimado ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Card — Contas do mês (col-span-2) */}
        <div className="lg:col-span-2 panel-card rounded-[12px] p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
              style={{ background: '#02664812', border: '1px solid #02664822' }}>
              <Calendar className="h-4 w-4" style={{ color: '#026648' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-app">Contas do mês</p>
                <p className="text-[11px] text-app-soft mt-0.5">
                  {arAp && (arAp.overdueRevenues > 0 || arAp.overdueExpenses > 0)
                    ? 'Você tem cobranças atrasadas — aja logo'
                    : arAp && arAp.dueSoon > 0
                    ? 'Tudo em dia, mas atenção aos vencimentos desta semana'
                    : 'Sem pendências no momento'}
                </p>
              </div>
            </div>
          </div>

          {/* Linhas A receber / A pagar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[8px]"
              style={{ background: '#02664808', border: '1px solid #02664812' }}>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-[#026648]" />
                <span className="text-xs font-semibold text-app-soft">A receber</span>
              </div>
              <div className="flex items-center gap-2">
                {arAp && arAp.overdueRevenues > 0 && (
                  <span className="rounded-full bg-[#f87171] px-2 py-0.5 text-[9px] font-bold text-white">
                    {arAp.overdueRevenues} atrasado{arAp.overdueRevenues > 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-sm font-extrabold tabular-nums text-[#026648]">
                  {arAp ? formatCurrency(arAp.totalAReceber) : '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[8px]"
              style={{ background: '#f8717108', border: '1px solid #f8717118' }}>
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-[#f87171]" />
                <span className="text-xs font-semibold text-app-soft">A pagar</span>
              </div>
              <div className="flex items-center gap-2">
                {arAp && arAp.overdueExpenses > 0 && (
                  <span className="rounded-full bg-[#f87171] px-2 py-0.5 text-[9px] font-bold text-white">
                    {arAp.overdueExpenses} vencido{arAp.overdueExpenses > 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-sm font-extrabold tabular-nums text-[#f87171]">
                  {arAp ? formatCurrency(arAp.totalAPagar) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <Link href="/empresa/fluxo-de-caixa"
              className="text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              Ver fluxo de caixa →
            </Link>
          </div>
        </div>

        {/* Card — Imposto estimado */}
        <div className="panel-card rounded-[12px] p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
              style={{ background: '#f59e0b12', border: '1px solid #f59e0b22' }}>
              <Receipt className="h-4 w-4" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-app">Imposto estimado</p>
              <p className="text-[11px] text-app-soft mt-0.5">{taxEstimate?.regime ?? '—'}</p>
            </div>
          </div>

          <p className="text-2xl font-extrabold tabular-nums text-app mb-0.5">
            {formatCurrency(totals.taxAmount)}
          </p>
          <p className="text-[11px] text-app-soft mb-4">
            {(totals.taxRate * 100).toFixed(1)}% do faturamento
          </p>

          {/* Barra de progresso */}
          <div className="h-2 rounded-full overflow-hidden mb-4"
            style={{ background: 'var(--panel-border)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, totals.totalRevenue > 0 ? (totals.taxAmount / totals.totalRevenue) * 100 : 0).toFixed(1)}%`,
                background: '#f59e0b',
              }} />
          </div>

          <div className="pt-3 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <Link href="/empresa/impostos"
              className="text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              Ver impostos →
            </Link>
          </div>
        </div>
      </div>

      {/* ── LINHA 2: Maiores gastos + Equipe + Orçamento ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Card — Maiores gastos do mês */}
        {(() => {
          const catMap: Record<string, number> = {}
          expenses.forEach((e) => {
            const cat = e.category as string
            catMap[cat] = (catMap[cat] ?? 0) + e.amount
          })
          const top3 = Object.entries(catMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
          const maxVal = top3[0]?.[1] ?? 1
          return (
            <div className="panel-card rounded-[12px] p-5"
              style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: '#f8717112', border: '1px solid #f8717122' }}>
                  <TrendingDown className="h-4 w-4 text-[#f87171]" />
                </div>
                <p className="text-sm font-bold text-app">Maiores gastos do mês</p>
              </div>

              {top3.length > 0 ? (
                <div className="space-y-3">
                  {top3.map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-app-soft">{CAT_LABEL[cat] ?? cat}</span>
                        <span className="text-xs font-bold tabular-nums text-app">{formatCurrency(val)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--panel-border)' }}>
                        <div className="h-full rounded-full bg-[#f87171] transition-all"
                          style={{ width: `${((val / maxVal) * 100).toFixed(1)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-app-soft py-4 text-center">Nenhum gasto registrado ainda</p>
              )}

              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                <Link href="/empresa/despesas"
                  className="text-[11px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent-blue)' }}>
                  Ver despesas →
                </Link>
              </div>
            </div>
          )
        })()}

        {/* Card — Sua equipe */}
        <div className="panel-card rounded-[12px] p-5"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
          <p className="text-sm font-bold text-app mb-4">Sua equipe</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-[#026648]" />
                <span className="text-xs text-app-soft">Funcionários</span>
              </div>
              <span className="text-sm font-extrabold tabular-nums text-app">
                {comprehensive?.employeeCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-[#026648]" />
                <span className="text-xs text-app-soft">Clientes ativos</span>
              </div>
              <span className="text-sm font-extrabold tabular-nums text-app">
                {comprehensive?.clienteCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#f97316]" />
                <span className="text-xs text-app-soft">Fornecedores</span>
              </div>
              <span className="text-sm font-extrabold tabular-nums text-app">
                {comprehensive?.fornecedorCount ?? 0}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center gap-4" style={{ borderColor: 'var(--panel-border)' }}>
            <Link href="/empresa/funcionarios"
              className="text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              Funcionários →
            </Link>
            <Link href="/empresa/clientes"
              className="text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              Clientes →
            </Link>
            <Link href="/empresa/fornecedores"
              className="text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              Fornecedores →
            </Link>
          </div>
        </div>

        {/* Card — Orçamento do mês */}
        {(() => {
          const budTotal = comprehensive?.budgetTotal ?? 0
          const budActual = comprehensive?.budgetActual ?? 0
          const pct = budTotal > 0 ? budActual / budTotal : 0
          const pctCapped = Math.min(100, Math.round(pct * 100))
          const barColor = pct >= 1 ? '#f87171' : pct >= 0.7 ? '#f59e0b' : '#026648'
          const statusText = pct >= 1
            ? 'Orçamento estourado'
            : pct >= 0.7
            ? 'Atenção — quase no limite'
            : 'Você está bem dentro do orçamento'
          return (
            <div className="panel-card rounded-[12px] p-5"
              style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: '#a855f712', border: '1px solid #a855f722' }}>
                  <Target className="h-4 w-4 text-[#a855f7]" />
                </div>
                <p className="text-sm font-bold text-app">Orçamento do mês</p>
              </div>

              {budTotal > 0 ? (
                <>
                  <p className="text-2xl font-extrabold tabular-nums text-app mb-0.5">
                    {formatCurrency(budActual)}
                  </p>
                  <p className="text-[11px] text-app-soft mb-3">
                    de {formatCurrency(budTotal)} — {pctCapped}% usado
                  </p>
                  <div className="h-2 rounded-full overflow-hidden mb-2"
                    style={{ background: 'var(--panel-border)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pctCapped}%`, background: barColor }} />
                  </div>
                  <p className="text-[11px] text-app-soft">{statusText}</p>
                </>
              ) : (
                <p className="text-xs text-app-soft py-2">
                  Defina um orçamento para controlar seus gastos.{' '}
                  <Link href="/empresa/orcamento"
                    className="font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent-blue)' }}>
                    Configurar →
                  </Link>
                </p>
              )}

              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                <Link href="/empresa/orcamento"
                  className="text-[11px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent-blue)' }}>
                  Ver orçamento →
                </Link>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Floating AI assistant */}
      {userId && <SaoozAIPJ userId={userId} />}

    </div>
  )
}
