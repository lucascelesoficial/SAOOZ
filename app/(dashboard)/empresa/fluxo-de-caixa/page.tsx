'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Calendar, CheckCircle, Clock, Loader2, Repeat, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, toMonthISO } from '@/lib/utils/formatters'
import { shiftActiveMonth } from '@/lib/modules/_shared/month'
import type { BusinessRevCategory, BusinessExpCategory, BusinessRevenueStatus, BusinessExpenseStatus, Database } from '@/types/database.types'

type Revenue = Database['public']['Tables']['business_revenues']['Row']
type Expense = Database['public']['Tables']['business_expenses']['Row']

// ── Recurring suggestion types ─────────────────────────────────────────────────

interface RecurringSuggestion {
  sourceId: string
  kind: 'revenue' | 'expense'
  description: string | null
  category: string
  amount: number
  is_recurring: boolean
}


// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateBR(d: string | null) {
  if (!d) return '—'
  try {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  } catch { return d }
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate) return false
  if (status === 'received' || status === 'paid' || status === 'canceled') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

function daysDiff(dueDate: string | null) {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function DueDateBadge({ dueDate, status }: { dueDate: string | null; status: string }) {
  if (!dueDate) return null
  const overdue = isOverdue(dueDate, status)
  const diff = daysDiff(dueDate)

  let label = formatDateBR(dueDate)
  if (diff === 0) label = 'Hoje'
  else if (diff === 1) label = 'Amanhã'
  else if (diff === -1) label = 'Ontem'
  else if (diff !== null && diff < 0) label = `${Math.abs(diff)}d atraso`
  else if (diff !== null && diff <= 7) label = `${diff}d`

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        background: overdue
          ? 'color-mix(in oklab, #f87171 15%, transparent)'
          : 'color-mix(in oklab, #f59e0b 15%, transparent)',
        color: overdue ? '#f87171' : '#f59e0b',
      }}
    >
      <Calendar className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function FluxoDeCaixaPage() {
  const { business, currentMonth } = useBusinessData()
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [suggestions, setSuggestions] = useState<RecurringSuggestion[]>([])
  const [copying, setCopying] = useState(false)
  const [loading, setLoading] = useState(true)

  const currentMonthKey = toMonthISO(currentMonth)
  const prevMonthKey = toMonthISO(shiftActiveMonth(currentMonth, -1))

  const fetchData = useCallback(async () => {
    if (!business) return
    setLoading(true)
    const supabase = createClient()

    const [revRes, expRes, prevRevRes, prevExpRes, curRevRes, curExpRes] = await Promise.all([
      // Pending / overdue (all months)
      supabase
        .from('business_revenues')
        .select('*')
        .eq('business_id', business.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true, nullsFirst: false }),
      supabase
        .from('business_expenses')
        .select('*')
        .eq('business_id', business.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true, nullsFirst: false }),
      // Recurring from previous month
      supabase
        .from('business_revenues')
        .select('id, description, category, amount, is_recurring')
        .eq('business_id', business.id)
        .eq('month', prevMonthKey)
        .eq('is_recurring', true),
      supabase
        .from('business_expenses')
        .select('id, description, category, amount, is_recurring')
        .eq('business_id', business.id)
        .eq('month', prevMonthKey)
        .eq('is_recurring', true),
      // Current month revenues (to detect duplicates)
      supabase
        .from('business_revenues')
        .select('description, category, amount')
        .eq('business_id', business.id)
        .eq('month', currentMonthKey),
      supabase
        .from('business_expenses')
        .select('description, category, amount')
        .eq('business_id', business.id)
        .eq('month', currentMonthKey),
    ])

    if (revRes.error) toast.error('Erro ao carregar receitas pendentes')
    if (expRes.error) toast.error('Erro ao carregar despesas pendentes')

    setRevenues(revRes.data ?? [])
    setExpenses(expRes.data ?? [])

    // Build recurring suggestions: prev-month recurring items not yet in current month
    const curRevKeys = new Set(
      (curRevRes.data ?? []).map((r) => `${r.description ?? ''}|${r.category}|${r.amount}`)
    )
    const curExpKeys = new Set(
      (curExpRes.data ?? []).map((e) => `${e.description ?? ''}|${e.category}|${e.amount}`)
    )

    const revSuggestions: RecurringSuggestion[] = (prevRevRes.data ?? [])
      .filter((r) => !curRevKeys.has(`${r.description ?? ''}|${r.category}|${r.amount}`))
      .map((r) => ({ sourceId: r.id, kind: 'revenue', description: r.description, category: r.category, amount: r.amount, is_recurring: r.is_recurring }))

    const expSuggestions: RecurringSuggestion[] = (prevExpRes.data ?? [])
      .filter((e) => !curExpKeys.has(`${e.description ?? ''}|${e.category}|${e.amount}`))
      .map((e) => ({ sourceId: e.id, kind: 'expense', description: e.description, category: e.category, amount: e.amount, is_recurring: e.is_recurring }))

    setSuggestions([...revSuggestions, ...expSuggestions])
    setLoading(false)
  }, [business, currentMonthKey, prevMonthKey])

  useEffect(() => { fetchData() }, [fetchData])

  async function copyAllRecurring() {
    if (!business || suggestions.length === 0) return
    setCopying(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setCopying(false); return }

    const revInserts = suggestions
      .filter((s) => s.kind === 'revenue')
      .map((s) => ({
        user_id: userData.user!.id,
        business_id: business.id,
        description: s.description,
        category: s.category as BusinessRevCategory,
        amount: s.amount,
        month: currentMonthKey,
        status: 'pending' as BusinessRevenueStatus,
        is_recurring: true,
      }))

    const expInserts = suggestions
      .filter((s) => s.kind === 'expense')
      .map((s) => ({
        user_id: userData.user!.id,
        business_id: business.id,
        description: s.description,
        category: s.category as BusinessExpCategory,
        amount: s.amount,
        month: currentMonthKey,
        status: 'pending' as BusinessExpenseStatus,
        is_recurring: true,
      }))

    const results = await Promise.all([
      revInserts.length > 0
        ? supabase.from('business_revenues').insert(revInserts)
        : Promise.resolve({ error: null }),
      expInserts.length > 0
        ? supabase.from('business_expenses').insert(expInserts)
        : Promise.resolve({ error: null }),
    ])

    const hasError = results.some((r) => r.error)
    if (hasError) {
      toast.error('Erro ao copiar recorrentes')
    } else {
      toast.success(`${suggestions.length} lançamento(s) recorrente(s) copiado(s)`)
      setSuggestions([])
    }
    setCopying(false)
  }

  const totalAReceber = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalAPagar = expenses.reduce((sum, e) => sum + e.amount, 0)
  const saldoProjetado = totalAReceber - totalAPagar

  const overdueRevenues = revenues.filter((r) => isOverdue(r.due_date, r.status))
  const overdueExpenses = expenses.filter((e) => isOverdue(e.due_date, e.status))

  async function markRevenuePaid(id: string) {
    const { error } = await createClient()
      .from('business_revenues')
      .update({ status: 'received' as BusinessRevenueStatus, paid_at: new Date().toISOString().split('T')[0] })
      .eq('id', id)
    if (error) { toast.error('Erro ao atualizar', { description: error.message }); return }
    setRevenues((prev) => prev.filter((r) => r.id !== id))
    toast.success('Marcado como recebido')
  }

  async function markExpensePaid(id: string) {
    const { error } = await createClient()
      .from('business_expenses')
      .update({ status: 'paid' as BusinessExpenseStatus, paid_at: new Date().toISOString().split('T')[0] })
      .eq('id', id)
    if (error) { toast.error('Erro ao atualizar', { description: error.message }); return }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    toast.success('Marcado como pago')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-app-soft" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-app">Fluxo de Caixa</h1>
        <p className="mt-1 text-sm text-app-base">
          Contas a receber e a pagar — {business?.name}
        </p>
      </div>

      {/* Recurring suggestions */}
      {suggestions.length > 0 && (
        <div
          className="rounded-[12px] border p-4"
          style={{
            borderColor: 'color-mix(in oklab, #3b82f6 30%, transparent)',
            background: 'color-mix(in oklab, #3b82f6 6%, transparent)',
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-[#3b82f6]" />
              <p className="text-sm font-semibold text-app">
                {suggestions.length} recorrente(s) do mês anterior não lançado(s)
              </p>
            </div>
            <button
              onClick={copyAllRecurring}
              disabled={copying}
              className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: '#3b82f6' }}
            >
              {copying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Repeat className="h-3.5 w-3.5" />}
              Copiar todos
            </button>
          </div>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <div key={s.sourceId} className="flex items-center justify-between gap-2 rounded-[8px] px-3 py-2"
                style={{ background: 'var(--panel-bg-soft)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  {s.kind === 'revenue'
                    ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" />
                    : <ArrowDownLeft className="h-3.5 w-3.5 shrink-0 text-[#f87171]" />}
                  <span className="text-xs text-app truncate">{s.description ?? s.category.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums shrink-0"
                  style={{ color: s.kind === 'revenue' ? '#22c55e' : '#f87171' }}>
                  {formatCurrency(s.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="panel-card p-4">
          <p className="text-xs text-app-soft">A Receber</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#22c55e]">
            {formatCurrency(totalAReceber)}
          </p>
          <p className="mt-1 text-xs text-app-soft">{revenues.length} lançamento(s)</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-app-soft">A Pagar</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#f87171]">
            {formatCurrency(totalAPagar)}
          </p>
          <p className="mt-1 text-xs text-app-soft">{expenses.length} lançamento(s)</p>
        </div>
        <div
          className="panel-card p-4"
          style={
            saldoProjetado !== 0
              ? {
                  borderColor: `color-mix(in oklab, ${saldoProjetado > 0 ? '#22c55e' : '#f87171'} 30%, transparent)`,
                  background: `color-mix(in oklab, ${saldoProjetado > 0 ? '#22c55e' : '#f87171'} 5%, transparent)`,
                }
              : {}
          }
        >
          <p className="text-xs text-app-soft">Saldo Projetado</p>
          <p
            className="mt-1 text-2xl font-bold tabular-nums"
            style={{ color: saldoProjetado >= 0 ? '#22c55e' : '#f87171' }}
          >
            {formatCurrency(saldoProjetado)}
          </p>
          <p className="mt-1 text-xs text-app-soft">
            {saldoProjetado >= 0 ? 'Posição positiva' : 'Posição negativa'}
          </p>
        </div>
      </div>

      {/* Overdue alerts */}
      {(overdueRevenues.length > 0 || overdueExpenses.length > 0) && (
        <div
          className="flex items-start gap-3 rounded-[12px] border px-4 py-3"
          style={{
            borderColor: 'color-mix(in oklab, #f87171 30%, transparent)',
            background: 'color-mix(in oklab, #f87171 6%, transparent)',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f87171]" />
          <p className="text-sm text-app">
            {overdueRevenues.length > 0 && (
              <span>
                <strong>{overdueRevenues.length}</strong> recebimento(s) em atraso
                ({formatCurrency(overdueRevenues.reduce((s, r) => s + r.amount, 0))})
              </span>
            )}
            {overdueRevenues.length > 0 && overdueExpenses.length > 0 && ' · '}
            {overdueExpenses.length > 0 && (
              <span>
                <strong>{overdueExpenses.length}</strong> pagamento(s) em atraso
                ({formatCurrency(overdueExpenses.reduce((s, e) => s + e.amount, 0))})
              </span>
            )}
          </p>
        </div>
      )}

      {/* Contas a Receber */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-[#22c55e]" />
          <h2 className="text-sm font-bold text-app">Contas a Receber</h2>
          <span className="text-xs text-app-soft">({revenues.length})</span>
        </div>

        {revenues.length === 0 ? (
          <div
            className="rounded-[12px] border px-4 py-6 text-center text-sm text-app-soft"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Nenhum recebimento pendente.
          </div>
        ) : (
          <div className="space-y-2">
            {revenues.map((r) => (
              <div key={r.id} className="panel-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-app">{r.description ?? r.category}</p>
                      <DueDateBadge dueDate={r.due_date} status={r.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3">
                      <p className="text-xs text-app-soft capitalize">{r.category}</p>
                      {r.due_date && (
                        <p className="flex items-center gap-1 text-xs text-app-soft">
                          <Clock className="h-3 w-3" />
                          Vence {formatDateBR(r.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-bold tabular-nums text-[#22c55e]">
                      {formatCurrency(r.amount)}
                    </span>
                    <button
                      onClick={() => markRevenuePaid(r.id)}
                      className="flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      style={{ background: '#22c55e' }}
                      title="Marcar como recebido"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Recebido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contas a Pagar */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ArrowDownLeft className="h-4 w-4 text-[#f87171]" />
          <h2 className="text-sm font-bold text-app">Contas a Pagar</h2>
          <span className="text-xs text-app-soft">({expenses.length})</span>
        </div>

        {expenses.length === 0 ? (
          <div
            className="rounded-[12px] border px-4 py-6 text-center text-sm text-app-soft"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Nenhum pagamento pendente.
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="panel-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-app">{e.description ?? e.category}</p>
                      <DueDateBadge dueDate={e.due_date} status={e.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3">
                      <p className="text-xs text-app-soft capitalize">{e.category.replace(/_/g, ' ')}</p>
                      {e.due_date && (
                        <p className="flex items-center gap-1 text-xs text-app-soft">
                          <Clock className="h-3 w-3" />
                          Vence {formatDateBR(e.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-bold tabular-nums text-[#f87171]">
                      {formatCurrency(e.amount)}
                    </span>
                    <button
                      onClick={() => markExpensePaid(e.id)}
                      className="flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      style={{ background: '#3b82f6' }}
                      title="Marcar como pago"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Pago
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {revenues.length === 0 && expenses.length === 0 && (
        <div className="py-10 text-center">
          <TrendingUp className="mx-auto mb-3 h-8 w-8 text-app-soft opacity-40" />
          <p className="text-sm font-medium text-app">Fluxo em dia</p>
          <p className="mt-1 text-xs text-app-soft">
            Nenhum lançamento pendente. Adicione vencimentos em Finanças e Despesas.
          </p>
        </div>
      )}
    </div>
  )
}
