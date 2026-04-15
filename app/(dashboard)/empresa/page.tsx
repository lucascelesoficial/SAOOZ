'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { GaugeChart } from '@/components/dashboard/GaugeChart'
import { SaoozAIPJ } from '@/components/dashboard/SaoozAIPJ'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatCurrencyShort, formatMonth } from '@/lib/utils/formatters'
import { regimeLabel, activityLabel, suggestProLabore } from '@/lib/utils/taxes'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import type { BusinessExpCategory, Database } from '@/types/database.types'
import type { TaxEstimate } from '@/lib/utils/taxes'
import type { BusinessTotals } from '@/lib/context/BusinessDataContext'
import {
  Building2, TrendingUp, TrendingDown, ShieldCheck, Scale, Zap, Receipt,
  ArrowUpRight, ArrowDownLeft, Clock, Users2, Handshake, Package,
  RefreshCw, Target, ChevronRight, AlertTriangle, Sparkles,
  Flame, BarChart3, CircleDollarSign, Layers, BrainCircuit,
  BadgeCheck, TriangleAlert, Lightbulb, Rocket,
} from 'lucide-react'

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']
type BusinessRevenue  = Database['public']['Tables']['business_revenues']['Row']
type BusinessExpense  = Database['public']['Tables']['business_expenses']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ArApSummary {
  totalAReceber:   number
  totalAPagar:     number
  overdueRevenues: number
  overdueExpenses: number
  dueSoon:         number    // itens vencendo nos próximos 7 dias
  dueSoonAmount:   number
}

interface ComprehensiveData {
  employeeCount:   number
  totalPayroll:    number
  clienteCount:    number
  fornecedorCount: number
  budgetTotal:     number
  budgetActual:    number
}

type InsightType = 'risk' | 'warning' | 'opportunity' | 'achievement'

interface ProactiveInsight {
  id:       string
  type:     InsightType
  title:    string
  body:     string
  metric?:  string
  action?:  { label: string; href: string }
  priority: 1 | 2 | 3
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE ENGINE  (deterministic, data-driven)
// ─────────────────────────────────────────────────────────────────────────────

function generateIntelligence(
  totals:       BusinessTotals,
  expenses:     BusinessExpense[],
  revenues:     BusinessRevenue[],
  comp:         ComprehensiveData | null,
  arAp:         ArApSummary | null,
  taxEstimate:  TaxEstimate | null,
): ProactiveInsight[] {
  const list: ProactiveInsight[] = []

  const fixedCosts = expenses
    .filter((e) => (e.category as BusinessExpCategory).startsWith('fixo_'))
    .reduce((s, e) => s + e.amount, 0)

  const mrr = revenues
    .filter((r) => r.is_recurring)
    .reduce((s, r) => s + r.amount, 0)

  const recurringExpTotal = expenses
    .filter((e) => e.is_recurring)
    .reduce((s, e) => s + e.amount, 0)

  // 1 · Itens vencendo em breve ─────────────────────────────────────────────
  if (arAp && (arAp.overdueRevenues > 0 || arAp.overdueExpenses > 0)) {
    const parts: string[] = []
    if (arAp.overdueRevenues > 0)
      parts.push(`${arAp.overdueRevenues} recebimento${arAp.overdueRevenues > 1 ? 's' : ''} em atraso`)
    if (arAp.overdueExpenses > 0)
      parts.push(`${arAp.overdueExpenses} pagamento${arAp.overdueExpenses > 1 ? 's' : ''} vencido${arAp.overdueExpenses > 1 ? 's' : ''}`)
    list.push({
      id: 'overdue',
      type: 'risk',
      title: 'Itens vencidos exigem ação',
      body: parts.join(' e ') + `. Total comprometido: ${formatCurrency(arAp.totalAPagar)}.`,
      metric: arAp.overdueRevenues + arAp.overdueExpenses + ' itens',
      action: { label: 'Ver fluxo de caixa', href: '/empresa/fluxo-de-caixa' },
      priority: 1,
    })
  } else if (arAp && arAp.dueSoon > 0) {
    list.push({
      id: 'due-soon',
      type: 'warning',
      title: `${formatCurrency(arAp.dueSoonAmount)} vencem nos próximos 7 dias`,
      body: `${arAp.dueSoon} compromisso${arAp.dueSoon > 1 ? 's' : ''} financeiro${arAp.dueSoon > 1 ? 's' : ''} precisam de atenção esta semana.`,
      metric: `${arAp.dueSoon} itens`,
      action: { label: 'Ver fluxo de caixa', href: '/empresa/fluxo-de-caixa' },
      priority: 1,
    })
  }

  // 2 · Cobertura MRR dos custos fixos ─────────────────────────────────────
  if (fixedCosts > 0 && totals.totalRevenue > 0) {
    const coverage = mrr / fixedCosts
    if (coverage >= 1) {
      list.push({
        id: 'mrr-full',
        type: 'achievement',
        title: 'Receita recorrente cobre 100% dos fixos',
        body: `Seu MRR de ${formatCurrency(mrr)} supera os custos fixos de ${formatCurrency(fixedCosts)}. Previsibilidade financeira sólida.`,
        metric: `${Math.round(coverage * 100)}% cobertura`,
        priority: 2,
      })
    } else if (coverage >= 0.5) {
      const gap = fixedCosts - mrr
      list.push({
        id: 'mrr-partial',
        type: 'opportunity',
        title: `MRR financia ${Math.round(coverage * 100)}% dos custos fixos`,
        body: `Mais ${formatCurrency(gap)}/mês em receita recorrente eliminaria a dependência de projetos pontuais.`,
        metric: `gap de ${formatCurrencyShort(gap)}`,
        action: { label: 'Ver finanças', href: '/empresa/financas' },
        priority: 2,
      })
    } else if (mrr > 0) {
      list.push({
        id: 'mrr-low',
        type: 'warning',
        title: `Apenas ${Math.round(coverage * 100)}% dos fixos cobertos por MRR`,
        body: `Alta dependência de receita pontual. Uma queda no fluxo pode comprometer custos obrigatórios de ${formatCurrency(fixedCosts)}/mês.`,
        metric: `MRR ${formatCurrencyShort(mrr)}`,
        action: { label: 'Adicionar recorrências', href: '/empresa/financas' },
        priority: 1,
      })
    }
  }

  // 3 · Orçamento perto do limite ────────────────────────────────────────────
  if (comp && comp.budgetTotal > 0) {
    const pct = comp.budgetActual / comp.budgetTotal
    if (pct > 1) {
      list.push({
        id: 'budget-over',
        type: 'risk',
        title: 'Orçamento estourado este mês',
        body: `Despesas (${formatCurrency(comp.budgetActual)}) superaram o limite planejado de ${formatCurrency(comp.budgetTotal)} em ${formatCurrencyShort(comp.budgetActual - comp.budgetTotal)}.`,
        metric: `+${Math.round((pct - 1) * 100)}% acima`,
        action: { label: 'Ver orçamento', href: '/empresa/orcamento' },
        priority: 1,
      })
    } else if (pct > 0.85) {
      list.push({
        id: 'budget-alert',
        type: 'warning',
        title: `Orçamento ${Math.round(pct * 100)}% utilizado`,
        body: `Restam apenas ${formatCurrency(comp.budgetTotal - comp.budgetActual)} dentro da meta mensal. Avalie despesas antes do fechamento.`,
        metric: `restam ${formatCurrencyShort(comp.budgetTotal - comp.budgetActual)}`,
        action: { label: 'Ver orçamento', href: '/empresa/orcamento' },
        priority: 2,
      })
    }
  }

  // 4 · Eficiência da equipe ─────────────────────────────────────────────────
  if (comp && comp.employeeCount > 0 && totals.totalRevenue > 0) {
    const revenuePerHead = totals.totalRevenue / comp.employeeCount
    const payrollRatio   = comp.totalPayroll / totals.totalRevenue
    if (payrollRatio > 0.45) {
      list.push({
        id: 'payroll-high',
        type: 'warning',
        title: `Folha equivale a ${Math.round(payrollRatio * 100)}% do faturamento`,
        body: `${comp.employeeCount} colaborador${comp.employeeCount > 1 ? 'es' : ''} custam ${formatCurrency(comp.totalPayroll)}/mês. Acima do padrão recomendado de 35–40%.`,
        metric: `${formatCurrencyShort(revenuePerHead)}/pessoa`,
        action: { label: 'Ver equipe', href: '/empresa/funcionarios' },
        priority: 2,
      })
    } else if (payrollRatio > 0 && payrollRatio <= 0.3) {
      list.push({
        id: 'payroll-efficient',
        type: 'achievement',
        title: `Equipe eficiente: ${formatCurrencyShort(revenuePerHead)}/colaborador`,
        body: `Folha representa ${Math.round(payrollRatio * 100)}% do faturamento — índice saudável. Cada pessoa gera em média ${formatCurrency(revenuePerHead)}.`,
        metric: `${Math.round(payrollRatio * 100)}% da receita`,
        priority: 3,
      })
    }
  }

  // 5 · Margem excelente ────────────────────────────────────────────────────
  if (totals.profitMargin >= 0.3 && totals.totalRevenue > 0) {
    list.push({
      id: 'margin-excellent',
      type: 'achievement',
      title: `Margem de ${(totals.profitMargin * 100).toFixed(1)}% — resultado acima da média`,
      body: `De cada R$ 100 faturados, ${(totals.profitMargin * 100).toFixed(0)} ficam como lucro. Considere reinvestir para acelerar o crescimento.`,
      metric: `${(totals.profitMargin * 100).toFixed(1)}% margem`,
      action: { label: 'Ver DRE', href: '/empresa/dre' },
      priority: 3,
    })
  } else if (totals.profitMargin < 0.05 && totals.totalRevenue > 0) {
    list.push({
      id: 'margin-low',
      type: 'risk',
      title: `Margem crítica: ${(totals.profitMargin * 100).toFixed(1)}%`,
      body: `Praticamente nenhum lucro está sendo gerado. Revise os maiores centros de custo ou renegocie preços.`,
      metric: `${(totals.profitMargin * 100).toFixed(1)}% margem`,
      action: { label: 'Analisar despesas', href: '/empresa/despesas' },
      priority: 1,
    })
  }

  // 6 · Sem clientes cadastrados ────────────────────────────────────────────
  if (comp && comp.clienteCount === 0 && totals.totalRevenue > 0) {
    list.push({
      id: 'no-clients',
      type: 'opportunity',
      title: 'Cadastre seus clientes para análise de risco',
      body: `Você tem ${formatCurrency(totals.totalRevenue)} de faturamento mas nenhum cliente registrado. Sem isso, não é possível identificar concentração de receita.`,
      metric: 'sem clientes',
      action: { label: 'Cadastrar clientes', href: '/empresa/clientes' },
      priority: 2,
    })
  }

  // 7 · Recorrências cobrindo despesas recorrentes ───────────────────────────
  if (mrr > 0 && recurringExpTotal > 0) {
    const netRecurring = mrr - recurringExpTotal
    if (netRecurring > 0) {
      list.push({
        id: 'recurring-positive',
        type: 'achievement',
        title: 'Base recorrente positiva',
        body: `MRR supera despesas recorrentes em ${formatCurrency(netRecurring)}/mês. Sua base financeira previsível está no positivo.`,
        metric: `+${formatCurrencyShort(netRecurring)}/mês`,
        priority: 3,
      })
    }
  }

  // 8 · Regime tributário eficiente ─────────────────────────────────────────
  if (totals.taxRate > 0 && totals.taxRate <= 0.06 && totals.totalRevenue > 0) {
    list.push({
      id: 'tax-efficient',
      type: 'achievement',
      title: `Carga tributária de ${(totals.taxRate * 100).toFixed(1)}% — regime otimizado`,
      body: `${taxEstimate?.regime ?? 'Seu regime'} proporciona uma das menores cargas tributárias disponíveis. Economia de ${formatCurrency(totals.totalRevenue * 0.20 - totals.taxAmount)} vs alíquota padrão de 20%.`,
      metric: `${(totals.taxRate * 100).toFixed(1)}%`,
      priority: 3,
    })
  }

  // ordenar por prioridade e limitar a 4
  return list.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT TYPE VISUAL CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHT_CONFIG: Record<InsightType, {
  color: string; bg: string; border: string;
  Icon: React.ElementType; label: string
}> = {
  risk:        { color: '#f87171', bg: '#f8717108', border: '#f8717122', Icon: TriangleAlert,  label: 'Risco'       },
  warning:     { color: '#f59e0b', bg: '#f59e0b08', border: '#f59e0b22', Icon: AlertTriangle,  label: 'Atenção'     },
  opportunity: { color: '#0ea5e9', bg: '#0ea5e908', border: '#0ea5e922', Icon: Lightbulb,      label: 'Oportunidade'},
  achievement: { color: '#22c55e', bg: '#22c55e08', border: '#22c55e22', Icon: BadgeCheck,     label: 'Conquista'   },
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────

function healthScore(margin: number, taxRate: number, hasRevenue: boolean) {
  if (!hasRevenue) return { score: 0, label: 'Sem dados', color: '#4B5563', ring: '#1F2937' }
  const s = Math.round(Math.min(margin * 250, 60) + Math.max(0, 40 - taxRate * 200))
  if (s >= 75) return { score: s, label: 'Saudável',  color: '#22c55e', ring: '#14532d' }
  if (s >= 55) return { score: s, label: 'Estável',   color: '#3b82f6', ring: '#1e3a5f' }
  if (s >= 35) return { score: s, label: 'Atenção',   color: '#f59e0b', ring: '#451a03' }
  return              { score: s, label: 'Crítico',   color: '#f87171', ring: '#450a0a' }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE GROUPS
// ─────────────────────────────────────────────────────────────────────────────

const EXPENSE_GROUPS = [
  { prefix: 'fixo_',         label: 'Fixos',        color: '#f87171' },
  { prefix: 'variavel_',     label: 'Variáveis',    color: '#f59e0b' },
  { prefix: 'operacional_',  label: 'Operacional',  color: '#3b82f6' },
  { prefix: 'investimento_', label: 'Investimento', color: '#0ea5e9' },
]

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function PulseMetric({
  label, value, sub, color = '#B3B3B3', glow = false, tag,
}: {
  label: string; value: string; sub?: string
  color?: string; glow?: boolean; tag?: { text: string; ok: boolean }
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3.5 rounded-[12px] shrink-0"
      style={{
        background:  'var(--panel-bg-soft)',
        border:      glow ? `1px solid ${color}30` : '1px solid var(--panel-border)',
        boxShadow:   glow ? `0 0 16px ${color}18` : 'none',
        minWidth:    136,
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B]">{label}</p>
      <p className="text-lg font-extrabold tabular-nums leading-tight"
        style={{ color, textShadow: glow ? `0 0 10px ${color}55` : 'none' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#6B6B6B] leading-tight">{sub}</p>}
      {tag && (
        <span className="mt-0.5 self-start rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{
            background: tag.ok ? '#22c55e18' : '#f8717118',
            color:      tag.ok ? '#22c55e'   : '#f87171',
            border:     `1px solid ${tag.ok ? '#22c55e25' : '#f8717125'}`,
          }}>
          {tag.text}
        </span>
      )}
    </div>
  )
}

function ProactiveInsightCard({ insight }: { insight: ProactiveInsight }) {
  const cfg = INSIGHT_CONFIG[insight.type]
  const Icon = cfg.Icon
  return (
    <div className="flex flex-col gap-2.5 rounded-[12px] p-4 transition-all hover:opacity-90"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}22` }}>
            <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        {insight.metric && (
          <span className="text-[10px] font-bold tabular-nums shrink-0"
            style={{ color: cfg.color }}>
            {insight.metric}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-snug mb-1">{insight.title}</p>
        <p className="text-xs text-[#8899BB] leading-relaxed">{insight.body}</p>
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

function HealthInsightRow({ label, value, status }: {
  label: string; value: string; status: 'good' | 'warn' | 'bad' | 'neutral'
}) {
  const colors = {
    good:    '#22c55e', warn: '#f59e0b',
    bad:     '#f87171', neutral: '#6B6B6B',
  }
  const c = colors[status]
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1E1E1E] last:border-0">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: c, boxShadow: `0 0 5px ${c}` }} />
        <span className="text-sm text-[#9BA3AF]">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: c }}>{value}</span>
    </div>
  )
}

function ModuleLink({ href, label, desc, color }: {
  href: string; label: string; desc: string; color: string
}) {
  return (
    <Link href={href}
      className="group flex items-center justify-between rounded-[10px] px-3.5 py-3 transition-all hover:opacity-80"
      style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-[#6B6B6B]">{desc}</p>
      </div>
      <div className="h-6 w-6 rounded-[6px] flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
        <ChevronRight className="h-3.5 w-3.5" style={{ color }} />
      </div>
    </Link>
  )
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

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // ── AR/AP + due-soon ────────────────────────────────────────────────────────
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

  // ── Employees, clients, suppliers, budgets ──────────────────────────────────
  useEffect(() => {
    if (!business) return
    const supabase  = createClient()
    const monthStr  = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      .toISOString().split('T')[0]
    Promise.all([
      supabase.from('business_employees').select('monthly_salary')
        .eq('business_id', business.id).eq('is_active', true),
      supabase.from('business_counterparties').select('id', { count: 'exact', head: true })
        .eq('business_id', business.id).eq('type', 'cliente').eq('is_active', true),
      supabase.from('business_counterparties').select('id', { count: 'exact', head: true })
        .eq('business_id', business.id).eq('type', 'fornecedor').eq('is_active', true),
      supabase.from('business_budgets').select('planned_amount')
        .eq('business_id', business.id).eq('month', monthStr),
    ]).then(([empR, cliR, forR, budR]) => {
      const emps = empR.data ?? []
      setComprehensive({
        employeeCount:   emps.length,
        totalPayroll:    emps.reduce((s, e) => s + (e.monthly_salary ?? 0), 0),
        clienteCount:    cliR.count ?? 0,
        fornecedorCount: forR.count ?? 0,
        budgetTotal:     (budR.data ?? []).reduce((s, b) => s + b.planned_amount, 0),
        budgetActual:    expenses.reduce((s, e) => s + e.amount, 0),
      })
    })
  }, [business, currentMonth, expenses])

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const mrr = useMemo(
    () => revenues.filter((r) => r.is_recurring).reduce((s, r) => s + r.amount, 0),
    [revenues],
  )
  const fixedCosts = useMemo(
    () => expenses.filter((e) => (e.category as BusinessExpCategory).startsWith('fixo_'))
      .reduce((s, e) => s + e.amount, 0),
    [expenses],
  )
  const mrrCoveragePct = fixedCosts > 0 ? Math.round((mrr / fixedCosts) * 100) : null
  const revenueQuality = totals.totalRevenue > 0
    ? Math.round((mrr / totals.totalRevenue) * 100) : 0
  const budgetPct = comprehensive && comprehensive.budgetTotal > 0
    ? Math.round((comprehensive.budgetActual / comprehensive.budgetTotal) * 100) : null

  const expenseGroups = useMemo(() =>
    EXPENSE_GROUPS.map((g) => {
      const total = expenses
        .filter((e) => (e.category as BusinessExpCategory).startsWith(g.prefix))
        .reduce((s, e) => s + e.amount, 0)
      return { ...g, total }
    }).filter((g) => g.total > 0),
    [expenses],
  )

  const { score, label: scoreLabel, color: scoreColor } = healthScore(
    totals.profitMargin, totals.taxRate, totals.totalRevenue > 0,
  )

  const healthInsights = useMemo(() => {
    if (totals.totalRevenue === 0) return []
    const expRatio = totals.totalExpenses / totals.totalRevenue
    return [
      { label: 'Margem líquida',          value: `${(totals.profitMargin * 100).toFixed(1)}%`,  status: (totals.profitMargin >= 0.2 ? 'good' : totals.profitMargin >= 0.1 ? 'warn' : 'bad') as 'good' | 'warn' | 'bad' },
      { label: 'Carga tributária',         value: `${(totals.taxRate * 100).toFixed(1)}%`,       status: (totals.taxRate <= 0.10 ? 'good' : totals.taxRate <= 0.20 ? 'warn' : 'bad') as 'good' | 'warn' | 'bad' },
      { label: 'Despesas vs faturamento',  value: `${(expRatio * 100).toFixed(1)}%`,             status: (expRatio <= 0.5 ? 'good' : expRatio <= 0.7 ? 'warn' : 'bad') as 'good' | 'warn' | 'bad' },
      { label: 'Resultado líquido',        value: formatCurrency(totals.netProfit),              status: (totals.netProfit > 0 ? 'good' : totals.netProfit === 0 ? 'warn' : 'bad') as 'good' | 'warn' | 'bad' },
    ]
  }, [totals])

  const intelligence = useMemo(
    () => generateIntelligence(totals, expenses, revenues, comprehensive, arAp, taxEstimate),
    [totals, expenses, revenues, comprehensive, arAp, taxEstimate],
  )

  const marginPct = Math.min(100, Math.max(0, Math.round(totals.profitMargin * 100)))

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
        <p className="text-sm text-[#6B6B6B]">Carregando dados da empresa…</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── COMMAND HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-[6px] flex items-center justify-center"
              style={{ background: '#0ea5e915', border: '1px solid #0ea5e925' }}>
              <Building2 className="h-3.5 w-3.5 text-[#0ea5e9]" />
            </div>
            <span className="text-sm font-semibold text-white">{business?.name ?? 'Empresa'}</span>
            <span className="text-[#2A2A2A]">·</span>
            <span className="text-xs text-[#6B6B6B]">{business ? regimeLabel(business.tax_regime) : ''}</span>
            <span className="text-[#2A2A2A]">·</span>
            <span className="text-xs text-[#6B6B6B]">{business ? activityLabel(business.activity) : ''}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white leading-tight">
            Central da Empresa
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{formatMonth(currentMonth)}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ExportPDFButton
            data={{
              title: 'Central da Empresa',
              subtitle: business?.name ?? 'Módulo Empresarial',
              month: formatMonth(currentMonth),
              totalIncome: totals.totalRevenue,
              totalExpenses: totals.totalExpenses,
              balance: totals.netProfit,
              taxAmount: totals.taxAmount,
              netProfit: totals.netProfit,
              profitMargin: `${(totals.profitMargin * 100).toFixed(1)}%`,
              businessName: business?.name,
              taxRegime: business?.tax_regime,
              sections: [{
                title: 'Saúde Empresarial',
                rows: healthInsights.map((h) => ({
                  label: h.label, value: h.value,
                  color: h.status === 'good' ? 'green' as const : h.status === 'warn' ? 'yellow' as const : 'red' as const,
                })),
              }],
            }}
            fileName={`saooz-empresa-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />

          {totals.totalRevenue > 0 && (
            <div className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-[12px]"
              style={{
                background: `linear-gradient(135deg, ${scoreColor}0A, ${scoreColor}05)`,
                border:     `1px solid ${scoreColor}25`,
                boxShadow:  `0 0 20px ${scoreColor}10`,
              }}>
              {/* Score ring SVG */}
              <div className="relative h-11 w-11 shrink-0">
                <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#1E1E1E" strokeWidth="4" />
                  <circle cx="22" cy="22" r="18" fill="none"
                    stroke={scoreColor} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - score / 100)}`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${scoreColor})`, transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold"
                  style={{ color: scoreColor }}>
                  {score}
                </span>
              </div>
              <div>
                <p className="text-[9px] text-[#6B6B6B] uppercase tracking-widest leading-none mb-1">Business Score</p>
                <p className="text-base font-extrabold leading-none" style={{ color: scoreColor }}>{scoreLabel}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PULSE STRIP — 6 KPIs ───────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
        <PulseMetric label="Faturamento"  value={formatCurrencyShort(totals.totalRevenue)}  color="#22c55e" glow={totals.totalRevenue > 0}
          sub={`bruto · ${formatMonth(currentMonth)}`} />
        <PulseMetric label="Lucro Líquido" value={formatCurrencyShort(totals.netProfit)}
          color={totals.netProfit >= 0 ? '#3b82f6' : '#f87171'} glow={totals.netProfit > 0}
          sub={totals.totalRevenue > 0 ? `${(totals.profitMargin * 100).toFixed(1)}% margem` : 'sem dados'}
          tag={totals.totalRevenue > 0 ? {
            text: totals.profitMargin >= 0.2 ? 'saudável' : totals.profitMargin >= 0.1 ? 'atenção' : 'crítico',
            ok: totals.profitMargin >= 0.2,
          } : undefined}
        />
        <PulseMetric label="Impostos" value={formatCurrencyShort(totals.taxAmount)}
          color="#f59e0b"
          sub={taxEstimate ? `${taxEstimate.ratePct} · ${taxEstimate.regime}` : 'estimado'}
        />
        <PulseMetric label="MRR" value={mrr > 0 ? formatCurrencyShort(mrr) : 'R$ 0'}
          color={mrr > 0 ? '#0ea5e9' : '#4B5563'}
          sub={revenueQuality > 0 ? `${revenueQuality}% da receita é recorrente` : 'nenhuma receita recorrente'}
          glow={revenueQuality >= 50}
        />
        <PulseMetric label="Cobertura MRR" value={mrrCoveragePct !== null ? `${mrrCoveragePct}%` : '—'}
          color={mrrCoveragePct === null ? '#4B5563' : mrrCoveragePct >= 100 ? '#22c55e' : mrrCoveragePct >= 60 ? '#f59e0b' : '#f87171'}
          sub={fixedCosts > 0 ? `fixos: ${formatCurrencyShort(fixedCosts)}/mês` : 'sem custos fixos'}
          tag={mrrCoveragePct !== null ? { text: mrrCoveragePct >= 100 ? '100%+ coberto' : 'parcial', ok: mrrCoveragePct >= 100 } : undefined}
        />
        <PulseMetric label="Equipe"
          value={comprehensive ? `${comprehensive.employeeCount}` : '—'}
          color="#0ea5e9"
          sub={comprehensive && comprehensive.totalPayroll > 0
            ? `${formatCurrencyShort(comprehensive.totalPayroll)}/mês folha`
            : 'sem colaboradores'}
        />
      </div>

      {/* ── INTELLIGENCE FEED ──────────────────────────────────────────────── */}
      <div className="rounded-[14px] overflow-hidden"
        style={{ border: '1px solid #1E293B', background: 'linear-gradient(160deg, #0a1628 0%, #0d1117 100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[8px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 12px #0ea5e944' }}>
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                SAOOZ <span style={{ color: '#0ea5e9' }}>Intelligence</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              </p>
              <p className="text-[10px] text-[#6B6B6B]">
                {intelligence.length > 0
                  ? `${intelligence.length} insight${intelligence.length > 1 ? 's' : ''} gerado${intelligence.length > 1 ? 's' : ''} a partir dos seus dados`
                  : 'Registre dados para ver insights personalizados'}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: '#22c55e10', color: '#22c55e', border: '1px solid #22c55e20' }}>
            <Sparkles className="h-2.5 w-2.5" /> ao vivo
          </span>
        </div>

        {/* Intelligence cards */}
        {intelligence.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 pb-0">
            {intelligence.map((ins) => (
              <ProactiveInsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Rocket className="h-8 w-8 text-[#383838] mb-3" />
            <p className="text-sm text-white font-semibold mb-1">Nenhum dado ainda</p>
            <p className="text-xs text-[#6B6B6B] max-w-xs">
              Registre faturamento, despesas e dados da equipe para que a IA gere insights personalizados para sua empresa.
            </p>
          </div>
        )}

        {/* AI Chat — compacto dentro da seção de intelligence */}
        <div className="p-4 pt-3">
          {userId ? (
            <SaoozAIPJ userId={userId} />
          ) : (
            <div className="h-20 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* ── FINANCIAL GRID: 3 cols ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Composição do resultado */}
        <div className="card-premium rounded-[12px] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4 flex items-center gap-2">
            <CircleDollarSign className="h-3.5 w-3.5 text-[#22c55e]" />
            Resultado do Mês
          </h2>
          {totals.totalRevenue === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-8 w-8 text-[#2A2A2A] mb-2" />
              <p className="text-sm text-[#6B6B6B]">Sem lançamentos.</p>
              <Link href="/empresa/financas" className="text-xs text-[#0ea5e9] mt-1 hover:underline">
                Adicionar faturamento →
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {[
                { label: 'Faturamento', value: totals.totalRevenue,          color: '#22c55e', pct: 100 },
                { label: 'Despesas',    value: totals.totalExpenses,         color: '#f87171', pct: totals.totalRevenue > 0 ? (totals.totalExpenses / totals.totalRevenue) * 100 : 0 },
                { label: 'Impostos',    value: totals.taxAmount,             color: '#f59e0b', pct: totals.totalRevenue > 0 ? (totals.taxAmount / totals.totalRevenue) * 100 : 0 },
                { label: 'Lucro',       value: Math.max(0, totals.netProfit),color: '#3b82f6', pct: totals.totalRevenue > 0 ? Math.max(0, (totals.netProfit / totals.totalRevenue) * 100) : 0 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#9BA3AF]">{row.label}</span>
                    <span className="font-bold tabular-nums" style={{ color: row.color }}>
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.min(100, row.pct)}%`, background: row.color, boxShadow: `0 0 6px ${row.color}55`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
              {/* Revenue quality bar */}
              {revenueQuality > 0 && (
                <div className="pt-2 border-t border-[#1E1E1E]">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-[#6B6B6B] flex items-center gap-1">
                      <RefreshCw className="h-2.5 w-2.5" /> Qualidade da receita
                    </span>
                    <span className="font-bold text-[#0ea5e9]">{revenueQuality}% recorrente</span>
                  </div>
                  <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#0ea5e9]"
                      style={{ width: `${revenueQuality}%`, boxShadow: '0 0 5px #0ea5e955', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Distribuição de Despesas */}
        <div className="card-premium rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-[#f87171]" />
              Despesas
            </h2>
            <Link href="/empresa/despesas"
              className="text-[10px] text-[#6B6B6B] hover:text-[#0ea5e9] flex items-center gap-0.5 transition-colors">
              detalhes <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {expenseGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Layers className="h-8 w-8 text-[#2A2A2A] mb-2" />
              <p className="text-sm text-[#6B6B6B]">Sem despesas registradas.</p>
              <Link href="/empresa/despesas" className="text-xs text-[#0ea5e9] mt-1 hover:underline">
                Adicionar despesa →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {expenseGroups.sort((a, b) => b.total - a.total).map((g) => {
                const pct = totals.totalExpenses > 0
                  ? Math.round((g.total / totals.totalExpenses) * 100) : 0
                return (
                  <div key={g.prefix}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
                        <span className="text-[#9BA3AF]">{g.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#4B5563]">{pct}%</span>
                        <span className="font-bold tabular-nums" style={{ color: g.color }}>
                          {formatCurrencyShort(g.total)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: g.color, boxShadow: `0 0 5px ${g.color}44`, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
              {/* Recurring exp line */}
              {expenses.some((e) => e.is_recurring) && (
                <div className="pt-2.5 border-t border-[#1E1E1E] flex items-center justify-between">
                  <span className="text-[10px] text-[#6B6B6B] flex items-center gap-1">
                    <RefreshCw className="h-2.5 w-2.5 text-[#f59e0b]" /> Recorrentes
                  </span>
                  <span className="text-[10px] font-bold text-[#f59e0b]">
                    {formatCurrencyShort(expenses.filter((e) => e.is_recurring).reduce((s, e) => s + e.amount, 0))}/mês
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saúde + Radar */}
        <div className="flex flex-col gap-3">
          {/* Gauge compacto */}
          <div className="card-premium rounded-[12px] p-5 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-3">
              Saúde Financeira
            </h2>
            <div className="flex gap-4 items-center">
              <div className="w-[120px] shrink-0">
                <GaugeChart percentage={marginPct} loading={isLoading} label="MARGEM" />
              </div>
              <div className="flex-1 space-y-0 min-w-0">
                {healthInsights.map((h) => (
                  <HealthInsightRow key={h.label} label={h.label} value={h.value} status={h.status} />
                ))}
                {healthInsights.length === 0 && (
                  <p className="text-xs text-[#4B5563]">Registre faturamento para ver indicadores.</p>
                )}
              </div>
            </div>
          </div>

          {/* Radar módulos mini */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/empresa/funcionarios', Icon: Users2,    label: 'Equipe',       value: comprehensive ? `${comprehensive.employeeCount}` : '—', color: '#0ea5e9' },
              { href: '/empresa/clientes',     Icon: Handshake, label: 'Clientes',     value: comprehensive ? `${comprehensive.clienteCount}` : '—',  color: '#22c55e' },
              { href: '/empresa/fornecedores', Icon: Package,   label: 'Fornecedores', value: comprehensive ? `${comprehensive.fornecedorCount}` : '—', color: '#f59e0b' },
            ].map((m) => (
              <Link key={m.href} href={m.href}
                className="card-premium rounded-[10px] p-3 flex flex-col items-center gap-1.5 text-center transition-all hover:opacity-80">
                <m.Icon className="h-4 w-4" style={{ color: m.color }} />
                <p className="text-base font-extrabold text-white leading-none">{m.value}</p>
                <p className="text-[9px] text-[#6B6B6B] uppercase tracking-wide leading-none">{m.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── AR/AP + ORÇAMENTO ──────────────────────────────────────────────── */}
      {(arAp && (arAp.totalAReceber > 0 || arAp.totalAPagar > 0)) || budgetPct !== null ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {arAp && arAp.totalAReceber > 0 && (
            <Link href="/empresa/fluxo-de-caixa"
              className="card-premium rounded-[12px] p-4 flex items-center justify-between transition-all hover:opacity-80">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">A Receber</span>
                  {arAp.overdueRevenues > 0 && (
                    <span className="rounded-full bg-[#f87171] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {arAp.overdueRevenues} atrasado{arAp.overdueRevenues > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[#22c55e]">
                  {formatCurrency(arAp.totalAReceber)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-[#22c55e] opacity-15" />
            </Link>
          )}
          {arAp && arAp.totalAPagar > 0 && (
            <Link href="/empresa/fluxo-de-caixa"
              className="card-premium rounded-[12px] p-4 flex items-center justify-between transition-all hover:opacity-80">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowDownLeft className="h-3.5 w-3.5 text-[#f87171]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">A Pagar</span>
                  {arAp.overdueExpenses > 0 && (
                    <span className="rounded-full bg-[#f87171] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {arAp.overdueExpenses} vencido{arAp.overdueExpenses > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[#f87171]">
                  {formatCurrency(arAp.totalAPagar)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-[#f87171] opacity-15" />
            </Link>
          )}
          {budgetPct !== null && (
            <Link href="/empresa/orcamento"
              className="card-premium rounded-[12px] p-4 flex items-center justify-between transition-all hover:opacity-80">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="h-3.5 w-3.5 text-[#f59e0b]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">Orçamento</span>
                  {budgetPct > 95 && (
                    <AlertTriangle className="h-3 w-3 text-[#f87171]" />
                  )}
                </div>
                <p className="text-xl font-extrabold tabular-nums"
                  style={{ color: budgetPct <= 75 ? '#22c55e' : budgetPct <= 95 ? '#f59e0b' : '#f87171' }}>
                  {budgetPct}% usado
                </p>
                <div className="mt-2 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, budgetPct)}%`,
                      background: budgetPct <= 75 ? '#22c55e' : budgetPct <= 95 ? '#f59e0b' : '#f87171',
                    }} />
                </div>
              </div>
            </Link>
          )}
        </div>
      ) : null}

      {/* ── IMPOSTO DETALHADO + PRÓ-LABORE ────────────────────────────────── */}
      {totals.totalRevenue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax */}
          <div className="card-premium rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-[#f59e0b]" /> Composição do Imposto
              </h2>
              <Link href="/empresa/impostos"
                className="text-[10px] text-[#6B6B6B] hover:text-[#0ea5e9] flex items-center gap-0.5 transition-colors">
                {taxEstimate?.regime ?? '—'} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {taxEstimate && taxEstimate.breakdown.length > 0 ? (
              <div className="space-y-3">
                {taxEstimate.breakdown.map((b) => {
                  const pct = totals.taxAmount > 0 ? (b.amount / totals.taxAmount) * 100 : 0
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-[#9BA3AF]">{b.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#4B5563]">
                            {(b.rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                          </span>
                          <span className="text-xs font-semibold text-[#f59e0b] tabular-nums w-20 text-right">
                            {formatCurrency(b.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: '#f59e0b', boxShadow: '0 0 5px #f59e0b55', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )
                })}
                <div className="border-t border-[#1E1E1E] pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total · {taxEstimate.ratePct}</span>
                  <span className="text-sm font-bold text-[#f59e0b] tabular-nums"
                    style={{ textShadow: '0 0 10px #f59e0b66' }}>
                    {formatCurrency(totals.taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-[8px]"
                  style={{ background: '#f8717108', border: '1px solid #f8717118' }}>
                  <span className="text-xs text-[#6B6B6B]">Projeção anual</span>
                  <span className="text-xs font-bold text-[#f87171] tabular-nums">
                    {formatCurrency(totals.taxAmount * 12)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6B6B6B] text-center py-4">Sem dados para breakdown.</p>
            )}
          </div>

          {/* Pro-labore */}
          <ProLaboreCard
            totalRevenue={totals.totalRevenue}
            totalExpenses={totals.totalExpenses}
            taxAmount={totals.taxAmount}
          />
        </div>
      )}

      {/* ── MÓDULOS ────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] mb-3 flex items-center gap-2">
          <Flame className="h-3 w-3" /> Todos os módulos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            { href: '/empresa/financas',       label: 'Finanças',       desc: 'Faturamento',     color: '#22c55e' },
            { href: '/empresa/despesas',        label: 'Despesas',       desc: 'Custos',          color: '#f87171' },
            { href: '/empresa/dre',             label: 'DRE',            desc: 'Resultado',       color: '#3b82f6' },
            { href: '/empresa/orcamento',       label: 'Orçamento',      desc: 'Metas mensais',   color: '#f59e0b' },
            { href: '/empresa/fluxo-de-caixa',  label: 'Fluxo de Caixa', desc: 'Entradas/Saídas', color: '#0ea5e9' },
            { href: '/empresa/relatorio',       label: 'Relatório',      desc: 'Multi-período',   color: '#8b5cf6' },
            { href: '/empresa/clientes',        label: 'Clientes',       desc: 'Carteira',        color: '#22c55e' },
            { href: '/empresa/fornecedores',    label: 'Fornecedores',   desc: 'Cadastro',        color: '#f59e0b' },
            { href: '/empresa/funcionarios',    label: 'Equipe',         desc: 'Colaboradores',   color: '#0ea5e9' },
            { href: '/empresa/impostos',        label: 'Impostos',       desc: 'Tributação',      color: '#f59e0b' },
            { href: '/empresa/pro-labore',      label: 'Pró-labore',     desc: 'Retiradas',       color: '#22c55e' },
            { href: '/empresa/inteligencia',    label: 'Inteligência',   desc: 'Análises',        color: '#8b5cf6' },
          ].map((m) => <ModuleLink key={m.href} {...m} />)}
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRÓ-LABORE CARD
// ─────────────────────────────────────────────────────────────────────────────

function ProLaboreCard({
  totalRevenue, totalExpenses, taxAmount,
}: { totalRevenue: number; totalExpenses: number; taxAmount: number }) {
  const proLabore = suggestProLabore(totalRevenue, totalExpenses, taxAmount)
  const operationalProfit = totalRevenue - totalExpenses - taxAmount

  return (
    <div className="card-premium rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] flex items-center gap-2">
          <ArrowUpRight className="h-3.5 w-3.5 text-[#22c55e]" /> Pró-labore Inteligente
        </h2>
        <Link href="/empresa/pro-labore"
          className="text-[10px] text-[#6B6B6B] hover:text-[#0ea5e9] flex items-center gap-0.5 transition-colors">
          detalhes <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {proLabore.balanced > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Conservador', value: proLabore.conservative, Icon: ShieldCheck, color: '#3b82f6' },
              { label: 'Equilibrado', value: proLabore.balanced,     Icon: Scale,        color: '#22c55e' },
              { label: 'Agressivo',   value: proLabore.aggressive,   Icon: Zap,          color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} className="rounded-[10px] p-3 text-center"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                <div className="h-6 w-6 rounded-[6px] flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${s.color}15` }}>
                  <s.Icon className="h-3 w-3" style={{ color: s.color }} />
                </div>
                <p className="text-[9px] text-[#6B6B6B] mb-1 uppercase tracking-wide">{s.label}</p>
                <p className="text-sm font-extrabold tabular-nums"
                  style={{ color: s.color, textShadow: `0 0 8px ${s.color}44` }}>
                  {formatCurrencyShort(s.value)}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Faturamento bruto', value: totalRevenue,  color: '#22c55e', sign: '+' },
              { label: 'Despesas',          value: totalExpenses, color: '#f87171', sign: '−' },
              { label: 'Imposto estimado',  value: taxAmount,     color: '#f59e0b', sign: '−' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1E1E1E]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold w-3 text-center" style={{ color: row.color }}>{row.sign}</span>
                  <span className="text-[#9BA3AF]">{row.label}</span>
                </div>
                <span className="font-semibold tabular-nums" style={{ color: row.color }}>
                  {formatCurrencyShort(row.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1.5">
              <span className="font-bold text-white">= Lucro disponível</span>
              <span className="font-bold tabular-nums"
                style={{ color: operationalProfit >= 0 ? '#3b82f6' : '#f87171' }}>
                {formatCurrencyShort(operationalProfit)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#6B6B6B] mt-3 leading-relaxed">{proLabore.reason}</p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingDown className="h-8 w-8 text-[#2A2A2A] mb-2" />
          <p className="text-sm text-white font-semibold mb-1">Sem margem disponível</p>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            {operationalProfit < 0
              ? 'As despesas e impostos superam o faturamento.'
              : 'Registre dados para calcular o pró-labore.'}
          </p>
        </div>
      )}
    </div>
  )
}
