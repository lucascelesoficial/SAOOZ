'use client'

import { Receipt, Info, TrendingUp } from 'lucide-react'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { regimeLabel } from '@/lib/utils/taxes'

const REGIME_TIPS: Record<string, string[]> = {
  mei: [
    'MEI paga um DAS fixo mensal independente do faturamento.',
    'Limite de faturamento: R$ 81.000/ano (R$ 6.750/mês).',
    'Ultrapassando o limite, pode ser necessário migrar para Simples Nacional.',
  ],
  simples: [
    'Alíquota calculada com base na receita bruta acumulada dos últimos 12 meses.',
    'Anexo III (Serviços): alíquotas entre 6% e 33%.',
    'Anexo I (Comércio): alíquotas entre 4% e 19%.',
    'Um único DAS concentra todos os tributos.',
  ],
  presumido: [
    'IRPJ e CSLL calculados sobre lucro presumido (% sobre receita bruta).',
    'Para serviços: presunção de 32%. Para comércio: 8%.',
    'Mais simples contabilmente que o Lucro Real.',
  ],
  real: [
    'IRPJ e CSLL calculados sobre o lucro contábil apurado.',
    'PIS e COFINS no regime não-cumulativo (1,65% e 7,6%).',
    'Exige contabilidade rigorosa. Vantajoso para margens baixas.',
  ],
}

export default function ImpostosPage() {
  const { business, totals, taxEstimate, currentMonth, isLoading } = useBusinessData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
      </div>
    )
  }

  const regime = business?.tax_regime ?? 'simples'
  const tips = REGIME_TIPS[regime] ?? []

  // Annual projection based on current month
  const annualProjection = totals.taxAmount * 12

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Impostos</h1>
          <p className="text-sm text-[#B3B3B3] mt-1">{formatMonth(currentMonth)} · {business?.name}</p>
        </div>
        <ExportPDFButton
          data={{
            title: 'Relatório de Impostos',
            subtitle: business?.name ?? 'Módulo Empresarial',
            month: formatMonth(currentMonth),
            totalIncome: totals.totalRevenue,
            totalExpenses: 0,
            balance: totals.totalRevenue - totals.taxAmount,
            taxAmount: totals.taxAmount,
            businessName: business?.name,
            taxRegime: regimeLabel(regime),
            sections: [
              {
                title: 'Resumo Tributário',
                rows: [
                  { label: 'Regime tributário', value: regimeLabel(regime), bold: true },
                  { label: 'Atividade', value: business?.activity === 'comercio' ? 'Comércio' : 'Serviço' },
                  { label: 'Faturamento do mês', value: formatCurrency(totals.totalRevenue), color: 'green' },
                  { label: 'Imposto estimado', value: formatCurrency(totals.taxAmount), color: 'yellow', bold: true },
                  { label: 'Alíquota efetiva', value: taxEstimate?.ratePct ?? '—', color: 'yellow' },
                  { label: 'Projeção anual (× 12)', value: formatCurrency(annualProjection), color: 'red', bold: true, divider: true },
                  { label: 'Restante após imposto', value: formatCurrency(totals.totalRevenue - totals.taxAmount), color: 'blue' },
                ],
              },
              ...(tips.length > 0 ? [{
                title: `Sobre o ${regimeLabel(regime)}`,
                rows: tips.map((tip) => ({ label: '•', value: tip, note: '' })),
              }] : []),
            ],
            taxBreakdown: taxEstimate && taxEstimate.breakdown.length > 0 && totals.totalRevenue > 0
              ? {
                  regime: taxEstimate.regime,
                  ratePct: taxEstimate.ratePct,
                  totalAmount: totals.taxAmount,
                  annualProjection,
                  items: taxEstimate.breakdown.map((b) => ({
                    label: b.label,
                    ratePct: `${(b.rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`,
                    amount: b.amount,
                  })),
                }
              : undefined,
          }}
          fileName={`saooz-impostos-${currentMonth.toISOString().slice(0, 7)}.pdf`}
        />
      </div>

      {/* Regime badge */}
      <div className="card-premium rounded-[14px] p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B6B6B] mb-1">Regime tributário ativo</p>
          <p className="text-xl font-extrabold text-white">{regimeLabel(regime)}</p>
          <p className="text-xs text-[#6B6B6B] mt-1">{business?.activity === 'comercio' ? 'Comércio' : 'Serviço'}</p>
        </div>
        <div className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
          <Receipt className="h-5 w-5 text-[#f59e0b]" />
        </div>
      </div>

      {/* This month */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium rounded-[14px] p-5">
          <p className="text-xs text-[#6B6B6B] mb-1">Imposto estimado</p>
          <p className="text-2xl font-extrabold text-[#f59e0b] tabular-nums">
            {formatCurrency(totals.taxAmount)}
          </p>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {taxEstimate?.ratePct ?? '—'} do faturamento
          </p>
        </div>
        <div className="card-premium rounded-[14px] p-5">
          <p className="text-xs text-[#6B6B6B] mb-1">Projeção anual</p>
          <p className="text-2xl font-extrabold text-[#f87171] tabular-nums">
            {formatCurrency(annualProjection)}
          </p>
          <p className="text-xs text-[#6B6B6B] mt-1">Base: mês atual × 12</p>
        </div>
      </div>

      {/* Breakdown */}
      {taxEstimate && taxEstimate.breakdown.length > 0 && totals.totalRevenue > 0 && (
        <div className="card-premium rounded-[14px] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Composição detalhada</h2>
          <div className="space-y-4">
            {taxEstimate.breakdown.map((b) => {
              const pct = totals.taxAmount > 0 ? (b.amount / totals.taxAmount) * 100 : 0
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#B3B3B3]">{b.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#6B6B6B]">
                        {(b.rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                      </span>
                      <span className="text-sm font-semibold text-[#f59e0b] tabular-nums w-24 text-right">
                        {formatCurrency(b.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="border-t border-[#2A2A2A] pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-sm font-bold text-[#f59e0b] tabular-nums">{formatCurrency(totals.taxAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue vs Tax comparison */}
      {totals.totalRevenue > 0 && (
        <div className="card-premium rounded-[14px] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Faturamento × Imposto</h2>
          <div className="space-y-3">
            {[
              { label: 'Faturamento bruto',  value: totals.totalRevenue,  color: '#026648', pct: 100 },
              { label: 'Imposto estimado',   value: totals.taxAmount,     color: '#f59e0b', pct: (totals.taxAmount / totals.totalRevenue) * 100 },
              { label: 'Restante líquido',   value: totals.totalRevenue - totals.taxAmount, color: '#3b82f6', pct: ((totals.totalRevenue - totals.taxAmount) / totals.totalRevenue) * 100 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#B3B3B3]">{row.label}</span>
                  <span className="font-semibold tabular-nums" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
                </div>
                <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card-premium rounded-[14px] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-[#3b82f6]" />
          <h2 className="text-sm font-bold text-white">Sobre o {regimeLabel(regime)}</h2>
        </div>
        <ul className="space-y-2.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-[#B3B3B3]">
              <span className="text-[#3b82f6] mt-0.5 shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Empty state */}
      {totals.totalRevenue === 0 && (
        <div className="card-premium rounded-[14px] p-8 text-center">
          <TrendingUp className="h-10 w-10 text-[#383838] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhum faturamento neste mês</p>
          <p className="text-sm text-[#6B6B6B]">
            Registre faturamento para calcular a estimativa de imposto.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-app-soft text-center leading-relaxed pb-2">
        ⚠️ Os valores são estimativas baseadas no regime tributário cadastrado. Consulte seu contador para apuração oficial.

      </p>
    </div>
  )
}
