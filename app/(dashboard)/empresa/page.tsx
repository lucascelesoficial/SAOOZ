'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { GaugeChart } from '@/components/dashboard/GaugeChart'
import { SaoozAIPJ } from '@/components/dashboard/SaoozAIPJ'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { regimeLabel, activityLabel } from '@/lib/utils/taxes'
import { Building2, TrendingUp, ShieldCheck, Scale, Zap, Receipt, ArrowUpRight } from 'lucide-react'
import { suggestProLabore } from '@/lib/utils/taxes'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'

// ── Business health insights ──────────────────────────────────────────────────
interface Insight { label: string; value: string; status: 'good' | 'warn' | 'bad' | 'neutral' }

function buildInsights(
  totalRevenue: number,
  totalExpenses: number,
  taxAmount: number,
  netProfit: number,
  profitMargin: number,
  taxRate: number,
): Insight[] {
  const insights: Insight[] = []

  if (totalRevenue === 0) return []

  // Margin health
  insights.push({
    label: 'Margem líquida',
    value: `${(profitMargin * 100).toFixed(1)}%`,
    status: profitMargin >= 0.2 ? 'good' : profitMargin >= 0.1 ? 'warn' : 'bad',
  })

  // Tax burden
  insights.push({
    label: 'Carga tributária',
    value: `${(taxRate * 100).toFixed(1)}%`,
    status: taxRate <= 0.10 ? 'good' : taxRate <= 0.20 ? 'warn' : 'bad',
  })

  // Expenses vs revenue
  const expRatio = totalExpenses / totalRevenue
  insights.push({
    label: 'Despesas vs faturamento',
    value: `${(expRatio * 100).toFixed(1)}%`,
    status: expRatio <= 0.5 ? 'good' : expRatio <= 0.7 ? 'warn' : 'bad',
  })

  // Net profit
  insights.push({
    label: 'Resultado líquido',
    value: formatCurrency(netProfit),
    status: netProfit > 0 ? 'good' : netProfit === 0 ? 'warn' : 'bad',
  })

  return insights
}

function InsightRow({ insight }: { insight: Insight }) {
  const colors = {
    good:    { dot: '#22c55e', text: '#22c55e', bg: '#22c55e12' },
    warn:    { dot: '#f59e0b', text: '#f59e0b', bg: '#f59e0b12' },
    bad:     { dot: '#f87171', text: '#f87171', bg: '#f8717112' },
    neutral: { dot: '#6B6B6B', text: '#B3B3B3', bg: '#6B6B6B12' },
  }
  const c = colors[insight.status]

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2A2A2A] last:border-0">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }} />
        <span className="text-sm text-[#B3B3B3]">{insight.label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: c.text }}>{insight.value}</span>
    </div>
  )
}

// ── Health score ──────────────────────────────────────────────────────────────
function healthScore(margin: number, taxRate: number, hasRevenue: boolean) {
  if (!hasRevenue) return { score: 0, label: 'Sem dados', color: '#6B6B6B' }
  const marginScore = Math.min(margin * 250, 60)
  const taxScore    = Math.max(0, 40 - taxRate * 200)
  const total = Math.round(marginScore + taxScore)
  if (total >= 75) return { score: total, label: 'Saudável',  color: '#22c55e' }
  if (total >= 55) return { score: total, label: 'Estável',   color: '#3b82f6' }
  if (total >= 35) return { score: total, label: 'Atenção',   color: '#f59e0b' }
  return              { score: total, label: 'Crítico',   color: '#f87171' }
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EmpresaPage() {
  const { business, totals, taxEstimate, currentMonth, isLoading } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const { score, label: scoreLabel, color: scoreColor } = healthScore(
    totals.profitMargin, totals.taxRate, totals.totalRevenue > 0,
  )

  const insights = buildInsights(
    totals.totalRevenue, totals.totalExpenses, totals.taxAmount,
    totals.netProfit, totals.profitMargin, totals.taxRate,
  )

  // Margin as 0-100 for gauge
  const marginPct = Math.min(100, Math.max(0, Math.round(totals.profitMargin * 100)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-[#0ea5e9]" />
            <span className="text-xs text-[#6B6B6B]">{business?.name ?? 'Empresa'}</span>
            <span className="text-[#383838]">·</span>
            <span className="text-xs text-[#6B6B6B]">{business ? regimeLabel(business.tax_regime) : ''}</span>
            <span className="text-[#383838]">·</span>
            <span className="text-xs text-[#6B6B6B]">{business ? activityLabel(business.activity) : ''}</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Painel Empresarial</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{formatMonth(currentMonth)}</p>
        </div>

        {/* Right side: Export + Business Health Score */}
        <div className="flex items-center gap-3">
          <ExportPDFButton
            data={{
              title: 'Painel Empresarial',
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
              sections: [
                {
                  title: 'Saúde Empresarial',
                  rows: [
                    ...insights.map((ins) => ({
                      label: ins.label,
                      value: ins.value,
                      color: ins.status === 'good' ? 'green' as const
                           : ins.status === 'warn' ? 'yellow' as const
                           : ins.status === 'bad'  ? 'red' as const
                           : 'gray' as const,
                    })),
                    ...(totals.totalRevenue > 0 ? [
                      { label: 'Business Score', value: `${score} — ${scoreLabel}`, bold: true },
                    ] : []),
                  ],
                },
              ],
            }}
            fileName={`saooz-central-pj-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          {totals.totalRevenue > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] card-premium"
              style={{ border: `1px solid ${scoreColor}25` }}>
              <div className="text-right">
                <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">Business Score</p>
                <p className="text-2xl font-extrabold tabular-nums leading-tight"
                  style={{ color: scoreColor, textShadow: `0 0 12px ${scoreColor}66` }}>
                  {score}
                </p>
              </div>
              <div className="h-8 w-px bg-[#2A2A2A]" />
              <p className="text-sm font-bold" style={{ color: scoreColor }}>{scoreLabel}</p>
            </div>
          )}
        </div>
      </div>

      {/* Metric cards — same component as PF */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Faturamento Bruto"
          value={totals.totalRevenue}
          color="green"
          trend="up"
          loading={isLoading}
        />
        <MetricCard
          title="Despesas Totais"
          value={totals.totalExpenses}
          color="red"
          trend="down"
          loading={isLoading}
        />
        <MetricCard
          title="Lucro Líquido"
          value={totals.netProfit}
          color={totals.netProfit >= 0 ? 'blue' : 'red'}
          trend={totals.netProfit >= 0 ? 'up' : 'down'}
          loading={isLoading}
        />
      </div>

      {/* Ritmo Empresarial — mirroring "Ritmo Financeiro" */}
      <div className="card-premium rounded-[12px] p-5 mb-6">
        <h2 className="text-sm font-semibold text-[#B3B3B3] uppercase tracking-wider mb-4 flex items-center gap-2">
          Saúde Empresarial
          <span className="text-[#0ea5e9] opacity-60">›</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Margin gauge */}
          <div className="w-full md:w-[240px] shrink-0">
            <GaugeChart percentage={marginPct} loading={isLoading} label="MARGEM" />
          </div>

          {/* Insights panel */}
          <div className="flex-1 w-full">
            {insights.length > 0 ? (
              <div className="space-y-0">
                {insights.map((ins) => (
                  <InsightRow key={ins.label} insight={ins} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <TrendingUp className="h-10 w-10 text-[#383838] mb-3" />
                <p className="text-[#6B6B6B] text-sm text-center">
                  Registre faturamento e despesas para ver os indicadores empresariais.
                </p>
              </div>
            )}

            {/* Tax highlight */}
            {totals.totalRevenue > 0 && taxEstimate && (
              <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-[10px]"
                style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                <div>
                  <p className="text-xs text-[#6B6B6B]">Imposto estimado · {taxEstimate.regime}</p>
                  <p className="text-sm font-bold text-[#f59e0b] mt-0.5 tabular-nums">
                    {formatCurrency(totals.taxAmount)}
                    <span className="text-xs font-normal text-[#6B6B6B] ml-1.5">({taxEstimate.ratePct})</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B6B6B]">Projeção anual</p>
                  <p className="text-sm font-bold text-[#f87171] tabular-nums">{formatCurrency(totals.taxAmount * 12)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue breakdown + SAOOZ AI PJ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Faturamento por tipo */}
        <div className="card-premium rounded-[12px] p-5">
          <h2 className="text-sm font-semibold text-[#B3B3B3] uppercase tracking-wider mb-4">
            Composição do Faturamento
          </h2>

          {totals.totalRevenue === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUp className="h-8 w-8 text-[#383838] mb-2" />
              <p className="text-sm text-[#6B6B6B]">Nenhum faturamento neste mês.</p>
              <p className="text-xs text-app-soft mt-1">
                Acesse <strong className="text-[#0ea5e9]">Finanças</strong> para registrar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profit waterfall */}
              {[
                { label: 'Faturamento bruto', value: totals.totalRevenue, color: '#22c55e', pct: 100 },
                { label: 'Despesas', value: totals.totalExpenses, color: '#f87171', pct: totals.totalRevenue > 0 ? (totals.totalExpenses / totals.totalRevenue) * 100 : 0 },
                { label: 'Impostos', value: totals.taxAmount, color: '#f59e0b', pct: totals.totalRevenue > 0 ? (totals.taxAmount / totals.totalRevenue) * 100 : 0 },
                { label: 'Lucro líquido', value: Math.max(0, totals.netProfit), color: '#3b82f6', pct: totals.totalRevenue > 0 ? Math.max(0, (totals.netProfit / totals.totalRevenue) * 100) : 0 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#B3B3B3]">{row.label}</span>
                    <span className="font-semibold tabular-nums" style={{ color: row.color }}>
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, row.pct)}%`, background: row.color, boxShadow: `0 0 8px ${row.color}66` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAOOZ AI PJ */}
        <div>
          {userId ? (
            <SaoozAIPJ userId={userId} />
          ) : (
            <div className="card-premium rounded-[12px] h-full flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Tax breakdown + Pro-labore — only when there's revenue */}
      {totals.totalRevenue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          {/* ── Imposto detalhado ── */}
          <div className="card-premium rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-[#f59e0b]" />
                Composição do Imposto
              </h2>
              <span className="text-xs text-[#6B6B6B]">{taxEstimate?.regime ?? '—'}</span>
            </div>

            {taxEstimate && taxEstimate.breakdown.length > 0 ? (
              <div className="space-y-3">
                {taxEstimate.breakdown.map((b) => {
                  const pct = totals.taxAmount > 0 ? (b.amount / totals.taxAmount) * 100 : 0
                  return (
                    <div key={b.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[#B3B3B3]">{b.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#6B6B6B]">
                            {(b.rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                          </span>
                          <span className="text-xs font-semibold text-[#f59e0b] tabular-nums w-20 text-right">
                            {formatCurrency(b.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: '#f59e0b', boxShadow: '0 0 6px #f59e0b66' }} />
                      </div>
                    </div>
                  )
                })}
                <div className="border-t border-[#2A2A2A] pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total · {taxEstimate.ratePct}</span>
                  <span className="text-sm font-bold text-[#f59e0b] tabular-nums glow-red"
                    style={{ textShadow: '0 0 12px #f59e0b99' }}>
                    {formatCurrency(totals.taxAmount)}
                  </span>
                </div>
                {/* Projeção anual */}
                <div className="flex items-center justify-between px-3 py-2 rounded-[8px]"
                  style={{ background: '#f8717108', border: '1px solid #f8717118' }}>
                  <span className="text-xs text-[#6B6B6B]">Projeção anual (base atual × 12)</span>
                  <span className="text-xs font-bold text-[#f87171] tabular-nums">
                    {formatCurrency(totals.taxAmount * 12)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6B6B6B] text-center py-4">Sem dados suficientes para breakdown.</p>
            )}
          </div>

          {/* ── Pró-labore inteligente ── */}
          <ProLaboreCard
            totalRevenue={totals.totalRevenue}
            totalExpenses={totals.totalExpenses}
            taxAmount={totals.taxAmount}
          />
        </div>
      )}
    </>
  )
}

// ── Pro-labore card (inline) ──────────────────────────────────────────────────
function ProLaboreCard({
  totalRevenue, totalExpenses, taxAmount,
}: { totalRevenue: number; totalExpenses: number; taxAmount: number }) {
  const proLabore = suggestProLabore(totalRevenue, totalExpenses, taxAmount)
  const operationalProfit = totalRevenue - totalExpenses - taxAmount

  return (
    <div className="card-premium rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
          <ArrowUpRight className="h-3.5 w-3.5 text-[#22c55e]" />
          Pró-labore Inteligente
        </h2>
      </div>

      {proLabore.balanced > 0 ? (
        <>
          {/* Three scenarios */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Conservador', value: proLabore.conservative, icon: ShieldCheck, color: '#3b82f6' },
              { label: 'Equilibrado', value: proLabore.balanced,     icon: Scale,        color: '#22c55e' },
              { label: 'Agressivo',   value: proLabore.aggressive,   icon: Zap,          color: '#f59e0b' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-[10px] p-3 text-center"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="h-7 w-7 rounded-[8px] flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${s.color}15` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                  </div>
                  <p className="text-[10px] text-[#6B6B6B] mb-1">{s.label}</p>
                  <p className="text-sm font-extrabold tabular-nums leading-tight"
                    style={{ color: s.color, textShadow: `0 0 8px ${s.color}66` }}>
                    {formatCurrency(s.value)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Logic breakdown */}
          <div className="space-y-1.5">
            {[
              { label: 'Faturamento bruto',  value: totalRevenue,    color: '#22c55e', sign: '+' },
              { label: 'Despesas',           value: totalExpenses,   color: '#f87171', sign: '−' },
              { label: 'Imposto estimado',   value: taxAmount,       color: '#f59e0b', sign: '−' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs py-1.5 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold w-3" style={{ color: row.color }}>{row.sign}</span>
                  <span className="text-[#B3B3B3]">{row.label}</span>
                </div>
                <span className="font-semibold tabular-nums" style={{ color: row.color }}>
                  {formatCurrency(row.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1.5">
              <span className="font-bold text-white">= Lucro disponível</span>
              <span className="font-bold tabular-nums"
                style={{ color: operationalProfit >= 0 ? '#3b82f6' : '#f87171' }}>
                {formatCurrency(operationalProfit)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-app-soft mt-3 leading-relaxed">{proLabore.reason}</p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ArrowUpRight className="h-8 w-8 text-[#383838] mb-2" />
          <p className="text-sm text-white font-semibold mb-1">Sem margem disponível</p>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            {operationalProfit < 0
              ? 'As despesas e impostos superam o faturamento. Revise os custos.'
              : 'Registre faturamento e despesas para calcular o pró-labore.'}
          </p>
        </div>
      )}
    </div>
  )
}
