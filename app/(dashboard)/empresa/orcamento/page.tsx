'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, SlidersHorizontal, Target, TrendingDown } from 'lucide-react'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { ExportCSVButton } from '@/components/csv/ExportCSVButton'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth, toMonthISO } from '@/lib/utils/formatters'
import type { BusinessExpCategory } from '@/types/database.types'

// ── Category definitions (mirrors despesas/page.tsx) ──────────────────────────

interface CatDef {
  id: BusinessExpCategory
  label: string
  group: string
}

const CATEGORIES: CatDef[] = [
  { id: 'fixo_aluguel',            label: 'Aluguel',             group: 'Fixos' },
  { id: 'fixo_salarios',           label: 'Salários',            group: 'Fixos' },
  { id: 'fixo_prolabore',          label: 'Pró-labore',          group: 'Fixos' },
  { id: 'fixo_contador',           label: 'Contador',            group: 'Fixos' },
  { id: 'fixo_software',           label: 'Software',            group: 'Fixos' },
  { id: 'fixo_internet',           label: 'Internet',            group: 'Fixos' },
  { id: 'fixo_outros',             label: 'Outros fixos',        group: 'Fixos' },
  { id: 'variavel_comissao',       label: 'Comissão',            group: 'Variáveis' },
  { id: 'variavel_frete',          label: 'Frete',               group: 'Variáveis' },
  { id: 'variavel_embalagem',      label: 'Embalagem',           group: 'Variáveis' },
  { id: 'variavel_trafego',        label: 'Tráfego pago',        group: 'Variáveis' },
  { id: 'variavel_taxas',          label: 'Taxas',               group: 'Variáveis' },
  { id: 'variavel_outros',         label: 'Outros variáveis',    group: 'Variáveis' },
  { id: 'operacional_marketing',   label: 'Marketing',           group: 'Operacional' },
  { id: 'operacional_admin',       label: 'Administrativo',      group: 'Operacional' },
  { id: 'operacional_juridico',    label: 'Jurídico',            group: 'Operacional' },
  { id: 'operacional_manutencao',  label: 'Manutenção',          group: 'Operacional' },
  { id: 'operacional_viagem',      label: 'Viagens',             group: 'Operacional' },
  { id: 'operacional_outros',      label: 'Outros operacionais', group: 'Operacional' },
  { id: 'investimento_equipamento',label: 'Equipamentos',        group: 'Investimento' },
  { id: 'investimento_estoque',    label: 'Estoque',             group: 'Investimento' },
  { id: 'investimento_expansao',   label: 'Expansão',            group: 'Investimento' },
  { id: 'investimento_contratacao',label: 'Contratação',         group: 'Investimento' },
  { id: 'investimento_outros',     label: 'Outros invest.',      group: 'Investimento' },
]

const GROUP_COLORS: Record<string, string> = {
  Fixos:       '#f87171',
  Variáveis:   '#f59e0b',
  Operacional: '#3b82f6',
  Investimento:'#026648',
}

type DraftMap = Record<string, string>  // category → raw input string

function barColor(pct: number) {
  if (pct > 100) return '#ef4444'
  if (pct > 80)  return '#f59e0b'
  return '#026648'
}

export default function OrcamentoPage() {
  const { business, expenses, currentMonth, isLoading: ctxLoading } = useBusinessData()
  const [draft, setDraft]       = useState<DraftMap>({})
  const [saving, setSaving]     = useState(false)
  const [loadingBudget, setLoadingBudget] = useState(true)
  const [dirty, setDirty]       = useState(false)

  const monthKey = toMonthISO(currentMonth)

  // Load saved budget for this month
  useEffect(() => {
    if (!business) return
    setLoadingBudget(true)

    createClient()
      .from('business_budgets')
      .select('category, planned_amount')
      .eq('business_id', business.id)
      .eq('month', monthKey)
      .then(({ data }) => {
        const map: DraftMap = {}
        for (const row of data ?? []) {
          if (row.planned_amount > 0) {
            map[row.category] = String(row.planned_amount)
          }
        }
        setDraft(map)
        setDirty(false)
        setLoadingBudget(false)
      })
  }, [business, monthKey])

  // Actual spend per category from context
  const actualByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    }
    return map
  }, [expenses])

  // Categories with either a budget or actual spend (hide zero-zero rows)
  const activeCategories = CATEGORIES.filter(
    (c) => (parseFloat(draft[c.id] ?? '0') || 0) > 0 || (actualByCategory[c.id] ?? 0) > 0
  )

  const groups = Array.from(new Set(CATEGORIES.map((c) => c.group)))

  const totalBudget = CATEGORIES.reduce((sum, c) => sum + (parseFloat(draft[c.id] ?? '0') || 0), 0)
  const totalActual = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalPct    = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0

  function handleChange(catId: string, value: string) {
    setDraft((prev) => ({ ...prev, [catId]: value }))
    setDirty(true)
  }

  async function handleSave() {
    if (!business) return
    setSaving(true)
    const supabase = createClient()

    const upserts = CATEGORIES
      .map((c) => ({
        business_id: business.id,
        month: monthKey,
        category: c.id,
        planned_amount: parseFloat(draft[c.id]?.replace(',', '.') ?? '0') || 0,
      }))
      .filter((r) => r.planned_amount > 0)

    // Delete rows not in upserts (zeroed-out categories)
    const keptCategories = upserts.map((u) => u.category)
    const deleteQuery = supabase
      .from('business_budgets')
      .delete()
      .eq('business_id', business.id)
      .eq('month', monthKey)

    if (keptCategories.length > 0) {
      await deleteQuery.not('category', 'in', `(${keptCategories.join(',')})`)
    } else {
      await deleteQuery
    }

    if (upserts.length > 0) {
      const { error } = await supabase
        .from('business_budgets')
        .upsert(upserts, { onConflict: 'business_id,month,category' })

      if (error) {
        toast.error('Erro ao salvar orçamento', { description: error.message })
        setSaving(false)
        return
      }
    }

    toast.success('Orçamento salvo')
    setDirty(false)
    setSaving(false)
  }

  const isLoading = ctxLoading || loadingBudget

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-app-soft" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-[#f59e0b]" />
            Orçamento
          </h1>
          <p className="text-sm text-app-soft mt-1">
            {formatMonth(currentMonth)} · {business?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportCSVButton
            headers={['Grupo', 'Categoria', 'Orçado (R$)', 'Realizado (R$)', 'Utilização (%)']}
            rows={activeCategories.map((c) => {
              const planned = parseFloat(draft[c.id] ?? '0') || 0
              const actual  = actualByCategory[c.id] ?? 0
              const pct     = planned > 0 ? ((actual / planned) * 100).toFixed(1) : ''
              return {
                'Grupo': c.group,
                'Categoria': c.label,
                'Orçado (R$)': planned.toFixed(2),
                'Realizado (R$)': actual.toFixed(2),
                'Utilização (%)': pct,
              }
            })}
            fileName={`saooz-orcamento-${monthKey.slice(0, 7)}.csv`}
          />
          <ExportPDFButton
            data={{
              title: 'Orçamento Empresarial',
              subtitle: business?.name ?? 'Módulo Empresarial',
              month: formatMonth(currentMonth),
              totalIncome: totalBudget,
              totalExpenses: totalActual,
              balance: totalBudget - totalActual,
              businessName: business?.name,
              sections: [
                {
                  title: 'Resumo',
                  rows: [
                    { label: 'Total orçado',  value: formatCurrency(totalBudget), color: 'blue',  bold: true },
                    { label: 'Total gasto',   value: formatCurrency(totalActual), color: totalActual > totalBudget ? 'red' : 'green' },
                    { label: 'Saldo restante',value: formatCurrency(totalBudget - totalActual), color: totalBudget - totalActual >= 0 ? 'green' : 'red', bold: true, divider: true },
                    { label: 'Utilização',    value: `${totalPct.toFixed(1)}%`, color: totalPct > 100 ? 'red' : totalPct > 80 ? 'yellow' : 'green' },
                  ],
                },
                {
                  title: 'Por Categoria',
                  rows: activeCategories.map((c) => {
                    const planned = parseFloat(draft[c.id] ?? '0') || 0
                    const actual  = actualByCategory[c.id] ?? 0
                    const pct     = planned > 0 ? (actual / planned) * 100 : 0
                    return {
                      label: c.label,
                      value: `${formatCurrency(actual)} / ${formatCurrency(planned)}`,
                      note: planned > 0 ? `${pct.toFixed(0)}% utilizado` : '',
                      color: pct > 100 ? 'red' : pct > 80 ? 'yellow' : 'green',
                    }
                  }),
                },
              ],
            }}
            fileName={`saooz-orcamento-${monthKey.slice(0, 7)}.pdf`}
          />
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: '#f59e0b' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total orçado',   value: totalBudget, color: '#3b82f6' },
          { label: 'Total gasto',    value: totalActual, color: totalActual > totalBudget ? '#ef4444' : '#026648' },
          { label: 'Saldo restante', value: totalBudget - totalActual, color: totalBudget - totalActual >= 0 ? '#026648' : '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-premium rounded-[14px] p-4">
            <p className="text-xs text-app-soft mb-1">{label}</p>
            <p className="text-base font-extrabold tabular-nums" style={{ color }}>
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Overall utilization bar */}
      {totalBudget > 0 && (
        <div className="card-premium rounded-[14px] p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-app-soft">Utilização total</span>
            <span className="font-semibold tabular-nums" style={{ color: barColor(totalPct) }}>
              {totalPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--panel-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(totalPct, 100)}%`, background: barColor(totalPct) }}
            />
          </div>
        </div>
      )}

      {/* Category rows by group */}
      {groups.map((grp) => {
        const cats = CATEGORIES.filter((c) => c.group === grp)
        const grpColor = GROUP_COLORS[grp] ?? '#6B7280'
        return (
          <div key={grp} className="card-premium rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" style={{ color: grpColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: grpColor }}>{grp}</h2>
            </div>
            <div className="space-y-3">
              {cats.map((c) => {
                const planned = parseFloat(draft[c.id]?.replace(',', '.') ?? '0') || 0
                const actual  = actualByCategory[c.id] ?? 0
                const pct     = planned > 0 ? (actual / planned) * 100 : actual > 0 ? 100 : 0
                const color   = barColor(pct)
                const hasActivity = planned > 0 || actual > 0

                return (
                  <div key={c.id}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-sm flex-1 ${hasActivity ? 'text-app' : 'text-app-soft'}`}>
                        {c.label}
                      </span>
                      {/* Actual spend badge */}
                      {actual > 0 && (
                        <span className="text-xs text-app-soft tabular-nums">
                          gasto: <span className="font-medium" style={{ color }}>{formatCurrency(actual)}</span>
                        </span>
                      )}
                      {/* Budget input */}
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-app-soft">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={draft[c.id] ?? ''}
                          onChange={(e) => handleChange(c.id, e.target.value)}
                          placeholder="0"
                          className="h-8 w-28 rounded-[8px] pl-7 pr-2 text-right text-sm tabular-nums outline-none transition-all"
                          style={{
                            background: 'var(--panel-bg-soft)',
                            border: `1px solid ${planned > 0 ? `${grpColor}40` : 'var(--panel-border)'}`,
                            color: 'var(--text-strong)',
                          }}
                        />
                      </div>
                    </div>
                    {/* Progress bar — only show when there's data */}
                    {(planned > 0 || actual > 0) && (
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--panel-border)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {totalBudget === 0 && totalActual === 0 && (
        <div className="card-premium rounded-[14px] p-8 text-center">
          <TrendingDown className="h-10 w-10 text-[#383838] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Orçamento não definido</p>
          <p className="text-sm text-app-soft">
            Preencha os valores planejados por categoria e clique em Salvar.
          </p>
        </div>
      )}

      <p className="text-xs text-app-soft text-center pb-2">
        O orçamento é salvo por mês. Navegue entre meses no seletor do topo para comparar períodos.
      </p>
    </div>
  )
}
