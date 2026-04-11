'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Pencil, Plus, Trash2, TrendingDown } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/financial.types'
import type { Database } from '@/types/database.types'

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

interface FormValues {
  description: string
  amount: string
  category: string
}

function mapMutationError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('transaction_limit_reached')) {
    return 'Limite mensal de lancamentos atingido para seu plano.'
  }

  if (normalized.includes('personal_scope_locked')) {
    return 'Seu plano atual nao permite lancamentos no modulo pessoal.'
  }

  if (normalized.includes('business_scope_locked')) {
    return 'Seu plano atual nao permite lancamentos no modulo empresarial.'
  }

  return message
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
        }
      : { description: '', category: 'outros', amount: '' },
  })

  const category = watch('category')
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

    if (editing) {
      const { error } = await supabase
        .from('expenses')
        .update({
          description: values.description || null,
          category: values.category as ExpenseCategory,
          amount: parsed,
          month: monthStr,
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
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Categoria</Label>
        <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'outros'}>
          <SelectTrigger
            className="rounded-[8px]"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="max-h-64 rounded-[8px]"
            style={{
              background: 'var(--panel-bg)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          >
            {groups.map((grp) => (
              <SelectGroup key={grp}>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-app-soft">
                  {grp}
                </SelectLabel>
                {CATEGORIES.filter((c) => c.group === grp).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
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
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('amount')}
        />
        {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
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

  const grouped = expenses.reduce<Record<string, PfExpense[]>>((acc, expense) => {
    const cat = CATEGORIES.find((c) => c.id === expense.category)
    const grp = cat?.group ?? 'Outros'
    if (!acc[grp]) acc[grp] = []
    acc[grp].push(expense)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Despesas</h1>
          <p className="mt-1 text-sm text-app-base">{formatMonth(currentMonth)}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="rounded-[8px] text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
        >
          <Plus className="mr-1 h-4 w-4" /> Lançar
        </Button>
      </div>

      <div className="panel-card mb-6 p-5">
        <p className="text-sm text-app-base">Total em {formatMonth(currentMonth)}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: '#f87171' }}>
          {formatCurrency(totals.totalExpenses)}
        </p>
      </div>

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
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: grpColor }}
                  >
                    {grp}
                  </span>
                  <span className="text-xs tabular-nums text-app-soft">
                    {formatCurrency(grpTotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((expense) => {
                    const cat = CATEGORIES.find((c) => c.id === expense.category)
                    const catColor =
                      CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] ??
                      grpColor
                    const pct =
                      totals.totalExpenses > 0
                        ? Math.round((expense.amount / totals.totalExpenses) * 100)
                        : 0

                    return (
                      <div key={expense.id} className="panel-card p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-app">
                              {expense.description ?? cat?.label ?? '-'}
                            </p>
                            <p className="mt-0.5 text-xs text-app-soft">
                              {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] ?? cat?.label}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => {
                                setEditing(expense)
                                setModalOpen(true)
                              }}
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
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: catColor }}
                          >
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-xs text-app-soft">{pct}% das despesas</span>
                        </div>

                        <div
                          className="h-1.5 overflow-hidden rounded-full"
                          style={{ background: 'var(--panel-border)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: catColor }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {userId && (
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          title={editing ? 'Editar despesa' : 'Lançar despesa'}
        >
          <ExpenseForm
            onClose={() => {
              setModalOpen(false)
              setEditing(null)
            }}
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
