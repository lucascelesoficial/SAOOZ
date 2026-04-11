'use client'

import { ArrowUpRight, ShieldCheck, Scale, Zap, Info } from 'lucide-react'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { suggestProLabore } from '@/lib/utils/taxes'

export default function ProLaborePage() {
  const { totals, business, currentMonth, isLoading } = useBusinessData()

  const proLabore = suggestProLabore(
    totals.totalRevenue,
    totals.totalExpenses,
    totals.taxAmount,
  )

  const operationalProfit = totals.totalRevenue - totals.totalExpenses - totals.taxAmount
  const hasData = totals.totalRevenue > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#22c55e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Pró-labore</h1>
        <p className="text-sm text-[#B3B3B3] mt-1">{formatMonth(currentMonth)} · {business?.name}</p>
      </div>

      {/* Summary card */}
      <div className="card-premium rounded-[14px] p-6 text-center"
        style={hasData && proLabore.balanced > 0
          ? { background: 'linear-gradient(145deg, #1E1E1E 0%, #1A1A1A 100%)', border: '1px solid #22c55e20' }
          : {}
        }>
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: proLabore.balanced > 0 ? '#22c55e15' : '#383838',
            border: `1px solid ${proLabore.balanced > 0 ? '#22c55e30' : '#2A2A2A'}`,
          }}>
          <ArrowUpRight className="h-6 w-6" style={{ color: proLabore.balanced > 0 ? '#22c55e' : '#6B6B6B' }} />
        </div>
        <p className="text-sm text-[#6B6B6B] mb-2">Pró-labore equilibrado sugerido</p>
        <p className="text-4xl font-extrabold tabular-nums"
          style={{ color: proLabore.balanced > 0 ? '#22c55e' : '#6B6B6B' }}>
          {proLabore.balanced > 0 ? formatCurrency(proLabore.balanced) : '—'}
        </p>
        {hasData && (
          <p className="text-xs text-[#6B6B6B] mt-3 max-w-xs mx-auto leading-relaxed">
            {proLabore.reason}
          </p>
        )}
      </div>

      {/* Three scenarios */}
      {proLabore.balanced > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Conservador',
              value: proLabore.conservative,
              icon: ShieldCheck,
              color: '#3b82f6',
              desc: 'Mais seguro para o caixa',
            },
            {
              label: 'Equilibrado',
              value: proLabore.balanced,
              icon: Scale,
              color: '#22c55e',
              desc: 'Recomendado pelo SAOOZ',
            },
            {
              label: 'Agressivo',
              value: proLabore.aggressive,
              icon: Zap,
              color: '#f59e0b',
              desc: 'Menos reserva operacional',
            },
          ].map((scenario) => {
            const Icon = scenario.icon
            return (
              <div key={scenario.label} className="card-premium rounded-[14px] p-4 text-center"
                style={{ border: `1px solid ${scenario.color}20` }}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${scenario.color}15`, border: `1px solid ${scenario.color}25` }}>
                  <Icon className="h-4 w-4" style={{ color: scenario.color }} />
                </div>
                <p className="text-xs text-[#6B6B6B] mb-1">{scenario.label}</p>
                <p className="text-base font-extrabold tabular-nums" style={{ color: scenario.color }}>
                  {formatCurrency(scenario.value)}
                </p>
                <p className="text-[10px] text-[#2a3860] mt-1.5 leading-tight">{scenario.desc}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Financial breakdown that feeds the calculation */}
      {hasData && (
        <div className="card-premium rounded-[14px] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Como o SAOOZ calcula</h2>
          <div className="space-y-3">
            {[
              { label: 'Faturamento bruto',       value: totals.totalRevenue,  color: '#22c55e', sign: '+' },
              { label: 'Despesas operacionais',   value: -totals.totalExpenses, color: '#f87171', sign: '−' },
              { label: 'Imposto estimado',         value: -totals.taxAmount,    color: '#f59e0b', sign: '−' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold w-4" style={{ color: row.color }}>{row.sign}</span>
                  <span className="text-sm text-[#B3B3B3]">{row.label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: row.color }}>
                  {formatCurrency(Math.abs(row.value))}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-white">= Lucro disponível</span>
              <span className="text-sm font-bold tabular-nums"
                style={{ color: operationalProfit >= 0 ? '#3b82f6' : '#f87171' }}>
                {formatCurrency(operationalProfit)}
              </span>
            </div>
            {operationalProfit > 0 && (
              <div className="flex items-center justify-between pt-1 text-xs text-[#6B6B6B]">
                <span>Reserva operacional mantida (30%)</span>
                <span className="tabular-nums">{formatCurrency(operationalProfit * 0.30)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card-premium rounded-[14px] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-[#3b82f6]" />
          <h2 className="text-sm font-bold text-white">O que é pró-labore?</h2>
        </div>
        <div className="space-y-2.5">
          {[
            'Pró-labore é a remuneração do sócio pelo trabalho prestado na empresa.',
            'É diferente de distribuição de lucros — incide INSS sobre o pró-labore.',
            'A distribuição de lucros, quando bem documentada, é isenta de IR para o sócio (em alguns regimes).',
            'Recomendamos manter ao menos 30% do lucro como reserva operacional antes de definir a retirada.',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2.5 text-sm text-[#B3B3B3]">
              <span className="text-[#3b82f6] mt-0.5 shrink-0">•</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="card-premium rounded-[14px] p-8 text-center">
          <ArrowUpRight className="h-10 w-10 text-[#383838] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Dados insuficientes</p>
          <p className="text-sm text-[#6B6B6B]">
            Registre faturamento e despesas para calcular o pró-labore ideal.
          </p>
        </div>
      )}

      <p className="text-xs text-[#2a3860] text-center pb-2">
        ⚠️ Sugestão baseada em estimativas. Consulte seu contador para decisões de retirada.
      </p>
    </div>
  )
}
