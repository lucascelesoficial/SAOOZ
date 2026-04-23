'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Pin,
  Plus,
  Trash2,
  TrendingDown,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { createClient } from '@/lib/supabase/client'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/financial.types'
import type { Database } from '@/types/database.types'
import type { PfExpenseStatus } from '@/types/database.types'

type PfExpense = Database['public']['Tables']['expenses']['Row']
type ExpenseCategory = PfExpense['category']

const CATEGORIES: Array<{ id: ExpenseCategory; label: string; group: string }> = [
  { id: 'moradia',      label: 'Moradia',      group: 'Essencial' },
  { id: 'alimentacao',  label: 'Alimentação',   group: 'Essencial' },
  { id: 'transporte',   label: 'Transporte',    group: 'Essencial' },
  { id: 'saude',        label: 'Saúde',         group: 'Essencial' },
  { id: 'educacao',     label: 'Educação',      group: 'Pessoal' },
  { id: 'lazer',        label: 'Lazer',         group: 'Pessoal' },
  { id: 'assinaturas',  label: 'Assinaturas',   group: 'Pessoal' },
  { id: 'vestuario',    label: 'Vestuário',     group: 'Pessoal' },
  { id: 'beleza',       label: 'Beleza',        group: 'Pessoal' },
  { id: 'pets',         label: 'Pets',          group: 'Pessoal' },
  { id: 'familia',      label: 'Família',       group: 'Pessoal' },
  { id: 'religiao',     label: 'Religião',      group: 'Pessoal' },
  { id: 'dividas',      label: 'Dívidas',       group: 'Financeiro' },
  { id: 'investimentos',label: 'Investimentos', group: 'Financeiro' },
  { id: 'variaveis',    label: 'Variáveis',     group: 'Outros' },
  { id: 'outros',       label: 'Outros',        group: 'Outros' },
]

const GROUP_COLORS: Record<string, string> = {
  Essencial:   '#3b82f6',
  Pessoal:     '#8b5cf6',
  Financeiro:  '#f59e0b',
  Outros:      '#94a3b8',
}

const STATUS_CONFIG: Record<PfExpenseStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  paid:    { label: 'Pago',     color: '#026648', bg: 'color-mix(in oklab, #026648 12%, transparent)', Icon: CheckCircle2 },
  pending: { label: 'Pendente', color: '#f59e0b', bg: 'color-mix(in oklab, #f59e0b 12%, transparent)', Icon: Clock },
  overdue: { label: 'Vencido',  color: '#f87171', bg: 'color-mix(in oklab, #f87171 12%, transparent)', Icon: XCircle },
}

interface FormValues {
  description: string
  amount: string
  category: string
  status: PfExpenseStatus
  due_date: string
}

function mapMutationError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('transaction_limit_reached')) return 'Limite mensal de lançamentos atingido para seu plano.'
  if (normalized.includes('personal_scope_locked')) return 'Seu plano atual não permite lançamentos no módulo pessoal.'
  if (normalized.includes('business_scope_locked')) return 'Seu plano atual não permite lançamentos no módulo empresarial.'
  return message
}

function formatDueDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00') // avoid timezone shift
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function isDueDateOverdue(dateStr: string | null, status: PfExpenseStatus): boolean {
  if (!dateStr || status === 'paid') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  return due < today
}

function ExpenseForm({
  onClose,
  userId,
  editing,
  onSaved,
  currentMonth,
}: {
  onClose: () => void
  userId: string
  editing?: PfExpense | null
  onSaved: () => void
  currentMonth: Date
}) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: editing
      ? {
          description: editing.description ?? '',
          category: editing.category,
          amount: String(editing.amount),
          status: editing.status ?? 'paid',
          due_date: editing.due_date ?? '',
        }
      : { description: '', category: 'outros', amount: '', status: 'pending', due_date: '' },
  })

  const category = watch('category')
  const status = watch('status')
  const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  async function onSubmit(values: FormValues) {
    const parsed = parseFloat(values.amount.replace(',', '.'))
    if (!values.amount || Number.isNaN(parsed) || parsed <= 0) {
      setError('amount', { message: 'Valor inválido' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const paidAt = values.status === 'paid' ? new Date().toISOString() : null

    if (editing) {
      const { error } = await supabase
        .from('expenses')
        .update({
          description: values.description || null,
          category: values.category as ExpenseCategory,
          amount: parsed,
          month: monthStr,
          status: values.status,
          due_date: values.due_date || null,
          paid_at: values.status === 'paid'
            ? (editing.paid_at ?? paidAt)
            : null,
        })
        .eq('id', editing.id)

      if (error) {
        toast.error('Erro ao atualizar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('expenses').insert({
        user_id: userId,
        description: values.description || null,
        category: values.category as ExpenseCategory,
        amount: parsed,
        month: monthStr,
        status: values.status,
        due_date: values.due_date || null,
        paid_at: paidAt,
      })

      if (error) {
        toast.error('Erro ao adicionar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    }

    toast.success(editing ? 'Despesa atualizada' : 'Despesa adicionada')
    onSaved()
    onClose()
    setLoading(false)
  }

  const groups = Array.from(new Set(CATEGORIES.map((c) => c.group)))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div
        className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs"
        style={{
          background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
          border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)',
          color: 'var(--accent-blue)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-blue)' }} />
        Lançando em: <span className="ml-0.5 font-semibold">{formatMonth(currentMonth)}</span>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descrição</Label>
        <Input
          placeholder="Ex: Conta de luz"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Categoria</Label>
        <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'outros'}>
          <SelectTrigger
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="max-h-64 rounded-[8px]"
            style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          >
            {groups.map((grp) => (
              <SelectGroup key={grp}>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-app-soft">
                  {grp}
                </SelectLabel>
                {CATEGORIES.filter((c) => c.group === grp).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Valor (R$)</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('amount')}
        />
        {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
      </div>

      {/* Status + Due date row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Status</Label>
          <Select onValueChange={(v) => v && setValue('status', v as PfExpenseStatus)} value={status ?? 'pending'}>
            <SelectTrigger
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              <SelectItem value="paid">✅ Pago</SelectItem>
              <SelectItem value="pending">⏳ Pendente</SelectItem>
              <SelectItem value="overdue">🔴 Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Vencimento</Label>
          <Input
            type="date"
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('due_date')}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-[8px] text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : editing ? (
            'Atualizar'
          ) : (
            'Adicionar'
          )}
        </Button>
      </div>
    </form>
  )
}

export default function DespesasPFPage() {
  const { expenses, totals, currentMonth, refresh } = useFinancialData()
  const [userId, setUserId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PfExpense | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Remover esta despesa?')) return
    setDeleting(id)
    const { error } = await createClient().from('expenses').delete().eq('id', id)
    if (error) {
      setDeleting(null)
      toast.error('Erro ao remover', { description: mapMutationError(error.message) })
      return
    }
    await refresh()
    setDeleting(null)
    toast.success('Removido')
  }

  async function handleToggleRecurring(expense: PfExpense) {
    setToggling(expense.id)
    const { error } = await createClient()
      .from('expenses')
      .update({ is_recurring: !expense.is_recurring })
      .eq('id', expense.id)
    if (error) {
      toast.error('Erro ao atualizar')
      setToggling(null)
      return
    }
    await refresh()
    setToggling(null)
    toast.success(expense.is_recurring ? 'Fixação removida' : 'Fixado para os próximos meses')
  }

  async function handleCycleStatus(expense: PfExpense) {
    const cycle: PfExpenseStatus[] = ['pending', 'paid', 'overdue']
    const currentIdx = cycle.indexOf(expense.status ?? 'pending')
    const next = cycle[(currentIdx + 1) % cycle.length]
    setTogglingStatus(expense.id)
    const { error } = await createClient()
      .from('expenses')
      .update({
        status: next,
        paid_at: next === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', expense.id)
    if (error) {
      toast.error('Erro ao atualizar status')
      setTogglingStatus(null)
      return
    }
    await refresh()
    setTogglingStatus(null)
    toast.success(`Status: ${STATUS_CONFIG[next].label}`)
  }

  // Separate overdue/pending from paid
  const overdueAndPending = expenses.filter((e) => {
    const status = e.status ?? 'paid'
    if (status === 'paid') return false
    // also promote to overdue if due_date has passed and still pending
    return true
  })
  const paid = expenses.filter((e) => (e.status ?? 'paid') === 'paid')

  const grouped = expenses.reduce<Record<string, PfExpense[]>>((acc, expense) => {
    const cat = CATEGORIES.find((c) => c.id === expense.category)
    const grp = cat?.group ?? 'Outros'
    if (!acc[grp]) acc[grp] = []
    acc[grp].push(expense)
    return acc
  }, {})

  // Summary counts
  const pendingTotal = overdueAndPending.reduce((s, e) => s + e.amount, 0)
  const overdueCount = overdueAndPending.filter((e) => {
    const status = e.status ?? 'pending'
    return status === 'overdue' || isDueDateOverdue(e.due_date, status)
  }).length

  function renderExpenseCard(expense: PfExpense) {
    const cat = CATEGORIES.find((c) => c.id === expense.category)
    const catColor =
      CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] ??
      (GROUP_COLORS[cat?.group ?? ''] ?? '#94a3b8')
    const pct =
      totals.totalExpenses > 0
        ? Math.round((expense.amount / totals.totalExpenses) * 100)
        : 0
    const expStatus = expense.status ?? 'paid'
    const statusCfg = STATUS_CONFIG[expStatus]
    const StatusIcon = statusCfg.Icon
    const dueLabel = formatDueDate(expense.due_date)
    const isExpiredDue = isDueDateOverdue(expense.due_date, expStatus)

    return (
      <div key={expense.id} className="panel-card p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-app">
              {expense.description ?? cat?.label ?? '-'}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-app-soft">
                {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] ?? cat?.label}
              </span>
              {expense.is_recurring && (
                <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)', color: 'var(--accent-blue)' }}>
                  <Pin className="h-2.5 w-2.5" /> Fixo
                </span>
              )}
              {dueLabel && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: isExpiredDue
                      ? 'color-mix(in oklab, #f87171 12%, transparent)'
                      : 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
                    color: isExpiredDue ? '#f87171' : 'var(--accent-blue)',
                  }}
                >
                  <Calendar className="h-2.5 w-2.5" /> {dueLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {/* Status cycle button */}
            <button
              onClick={() => handleCycleStatus(expense)}
              disabled={togglingStatus === expense.id}
              className="rounded-[6px] p-1.5 transition-colors"
              style={{ color: statusCfg.color }}
              title={`Status: ${statusCfg.label} — clique para mudar`}
            >
              {togglingStatus === expense.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <StatusIcon className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => handleToggleRecurring(expense)}
              disabled={toggling === expense.id}
              className="rounded-[6px] p-1.5 transition-colors"
              style={{ color: expense.is_recurring ? 'var(--accent-blue)' : 'var(--text-soft)' }}
              title={expense.is_recurring ? 'Fixado — clique para desafixar' : 'Fixar para próximos meses'}
            >
              {toggling === expense.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pin className="h-3.5 w-3.5" style={{ fill: expense.is_recurring ? 'var(--accent-blue)' : 'none' }} />
              )}
            </button>
            <button
              onClick={() => { setEditing(expense); setModalOpen(true) }}
              className="rounded-[6px] p-1.5 text-app-soft hover:text-app"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDelete(expense.id)}
              disabled={deleting === expense.id}
              className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171]"
            >
              {deleting === expense.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold tabular-nums" style={{ color: catColor }}>
            {formatCurrency(expense.amount)}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: statusCfg.bg, color: statusCfg.color }}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {statusCfg.label}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--panel-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: catColor }} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Despesas</h1>
          <p className="mt-1 text-sm text-app-base">{formatMonth(currentMonth)}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPDFButton
            data={{
              title: 'Relatório de Despesas',
              subtitle: 'Módulo Pessoal',
              month: formatMonth(currentMonth),
              totalIncome: totals.totalIncome,
              totalExpenses: totals.totalExpenses,
              balance: totals.balance,
              expenses: expenses.map((e) => ({
                description: e.description ?? e.category,
                category: CATEGORY_LABELS[e.category] ?? e.category,
                amount: e.amount,
                date: e.due_date
                  ? new Date(e.due_date + 'T12:00:00').toLocaleDateString('pt-BR')
                  : e.created_at
                    ? new Date(e.created_at).toLocaleDateString('pt-BR')
                    : undefined,
              })),
            }}
            fileName={`saooz-despesas-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          <Button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="rounded-[8px] text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            <Plus className="mr-1 h-4 w-4" /> Lançar
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
        <div className="panel-card p-4">
          <p className="text-xs text-app-soft mb-1">Total em {formatMonth(currentMonth)}</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#f87171' }}>
            {formatCurrency(totals.totalExpenses)}
          </p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-app-soft mb-1">A pagar</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#f59e0b' }}>
            {formatCurrency(pendingTotal)}
          </p>
        </div>
        <div className="panel-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-app-soft mb-1">Pagas</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#026648' }}>
            {paid.length} <span className="text-sm font-normal text-app-soft">lançamentos</span>
          </p>
        </div>
      </div>

      {/* Overdue/Pending alert */}
      {overdueCount > 0 && (
        <div
          className="mb-4 flex items-center gap-3 rounded-[10px] px-4 py-3"
          style={{
            background: 'color-mix(in oklab, #f87171 10%, transparent)',
            border: '1px solid color-mix(in oklab, #f87171 30%, transparent)',
          }}
        >
          <XCircle className="h-4 w-4 shrink-0" style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#f87171' }}>
            <span className="font-semibold">{overdueCount} despesa{overdueCount > 1 ? 's' : ''} vencida{overdueCount > 1 ? 's' : ''}</span>
            {' '}— verifique os vencimentos abaixo.
          </p>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="Nenhuma despesa"
          description="Lance seus gastos do mês para acompanhar seu orçamento."
          action={{ label: 'Lançar despesa', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([grp, items]) => {
            const grpTotal = items.reduce((sum, item) => sum + item.amount, 0)
            const grpColor = GROUP_COLORS[grp] ?? '#94a3b8'

            return (
              <div key={grp}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: grpColor }}>
                    {grp}
                  </span>
                  <span className="text-xs tabular-nums text-app-soft">
                    {formatCurrency(grpTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map(renderExpenseCard)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {userId && (
        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Editar despesa' : 'Lançar despesa'}
        >
          <ExpenseForm
            onClose={() => { setModalOpen(false); setEditing(null) }}
            userId={userId}
            editing={editing}
            onSaved={refresh}
            currentMonth={currentMonth}
          />
        </Modal>
      )}
    </div>
  )
}
