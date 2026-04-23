'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, TrendingDown, Calendar, Repeat } from 'lucide-react'
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
import { ExportCSVButton } from '@/components/csv/ExportCSVButton'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import type { BusinessExpCategory, BusinessExpenseStatus, Database } from '@/types/database.types'

type BizExpense = Database['public']['Tables']['business_expenses']['Row']
type Counterparty = Database['public']['Tables']['business_counterparties']['Row']

const CATEGORIES: Array<{ id: BusinessExpCategory; label: string; group: string }> = [
  { id: 'fixo_aluguel', label: 'Aluguel', group: 'Fixos' },
  { id: 'fixo_salarios', label: 'Salarios', group: 'Fixos' },
  { id: 'fixo_prolabore', label: 'Pro-labore', group: 'Fixos' },
  { id: 'fixo_contador', label: 'Contador', group: 'Fixos' },
  { id: 'fixo_software', label: 'Software', group: 'Fixos' },
  { id: 'fixo_internet', label: 'Internet', group: 'Fixos' },
  { id: 'fixo_outros', label: 'Outros fixos', group: 'Fixos' },
  { id: 'variavel_comissao', label: 'Comissao', group: 'Variaveis' },
  { id: 'variavel_frete', label: 'Frete', group: 'Variaveis' },
  { id: 'variavel_embalagem', label: 'Embalagem', group: 'Variaveis' },
  { id: 'variavel_trafego', label: 'Trafego pago', group: 'Variaveis' },
  { id: 'variavel_taxas', label: 'Taxas', group: 'Variaveis' },
  { id: 'variavel_outros', label: 'Outros variaveis', group: 'Variaveis' },
  { id: 'operacional_marketing', label: 'Marketing', group: 'Operacional' },
  { id: 'operacional_admin', label: 'Administrativo', group: 'Operacional' },
  { id: 'operacional_juridico', label: 'Juridico', group: 'Operacional' },
  { id: 'operacional_manutencao', label: 'Manutencao', group: 'Operacional' },
  { id: 'operacional_viagem', label: 'Viagens', group: 'Operacional' },
  { id: 'operacional_outros', label: 'Outros operacionais', group: 'Operacional' },
  { id: 'investimento_equipamento', label: 'Equipamentos', group: 'Investimento' },
  { id: 'investimento_estoque', label: 'Estoque', group: 'Investimento' },
  { id: 'investimento_expansao', label: 'Expansao', group: 'Investimento' },
  { id: 'investimento_contratacao', label: 'Contratacao', group: 'Investimento' },
  { id: 'investimento_outros', label: 'Outros investimentos', group: 'Investimento' },
]

const GROUP_COLORS: Record<string, string> = {
  Fixos: '#f87171',
  Variaveis: '#f59e0b',
  Operacional: '#3b82f6',
  Investimento: '#026648',
}

const STATUS_OPTIONS: Array<{ id: BusinessExpenseStatus; label: string; color: string }> = [
  { id: 'paid', label: 'Pago', color: '#026648' },
  { id: 'pending', label: 'A pagar', color: '#f59e0b' },
  { id: 'overdue', label: 'Atrasado', color: '#f87171' },
  { id: 'canceled', label: 'Cancelado', color: '#6B7280' },
]

function statusLabel(status: BusinessExpenseStatus | null | undefined) {
  return STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0]
}

interface FormValues {
  description: string
  amount: string
  category: string
  status: BusinessExpenseStatus
  due_date: string
  counterparty_id: string
  is_recurring: boolean
}

function mapMutationError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('transaction_limit_reached'))
    return 'Limite mensal de lancamentos atingido para seu plano.'
  if (normalized.includes('business_scope_locked'))
    return 'Seu plano atual nao permite lancamentos no modulo empresarial.'
  if (normalized.includes('personal_scope_locked'))
    return 'Seu plano atual nao permite lancamentos no modulo pessoal.'
  return message
}

function ExpenseForm({
  onClose,
  businessId,
  userId,
  editing,
  onSaved,
  currentMonth,
  fornecedores,
}: {
  onClose: () => void
  businessId: string
  userId: string
  editing?: BizExpense | null
  onSaved: () => void
  currentMonth: Date
  fornecedores: Counterparty[]
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
          status: (editing.status as BusinessExpenseStatus) ?? 'paid',
          due_date: editing.due_date ?? '',
          counterparty_id: editing.counterparty_id ?? '',
          is_recurring: editing.is_recurring ?? false,
        }
      : {
          description: '',
          category: 'fixo_outros',
          amount: '',
          status: 'paid',
          due_date: '',
          counterparty_id: '',
          is_recurring: false,
        },
  })

  const category = watch('category')
  const status = watch('status')
  const counterparty_id = watch('counterparty_id')
  const is_recurring = watch('is_recurring')
  const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const inputStyle = {
    background: 'var(--panel-bg-soft)',
    borderColor: 'var(--panel-border)',
    color: 'var(--text-strong)',
  }

  const groups = Array.from(new Set(CATEGORIES.map((c) => c.group)))

  async function onSubmit(values: FormValues) {
    const parsed = parseFloat(values.amount.replace(',', '.'))
    if (!values.amount || Number.isNaN(parsed) || parsed <= 0) {
      setError('amount', { message: 'Valor invalido' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const payload = {
      description: values.description || null,
      category: values.category as BusinessExpCategory,
      amount: parsed,
      month: monthStr,
      status: values.status,
      due_date: values.due_date || null,
      counterparty_id: values.counterparty_id || null,
      is_recurring: values.is_recurring,
    }

    if (editing) {
      const { error } = await supabase
        .from('business_expenses')
        .update(payload)
        .eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('business_expenses').insert({
        user_id: userId,
        business_id: businessId,
        ...payload,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div
        className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs"
        style={{
          background: 'color-mix(in oklab, #f87171 8%, transparent)',
          border: '1px solid color-mix(in oklab, #f87171 25%, transparent)',
          color: '#f87171',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
        Lancando em: <span className="ml-0.5 font-semibold">{formatMonth(currentMonth)}</span>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descricao</Label>
        <Input
          placeholder="Ex: Aluguel da sede"
          className="rounded-[8px]"
          style={inputStyle}
          {...register('description')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-app-base">Categoria</Label>
          <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'fixo_outros'}>
            <SelectTrigger className="rounded-[8px]" style={inputStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="max-h-64 rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              {groups.map((grp) => (
                <SelectGroup key={grp}>
                  <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-app-soft">{grp}</SelectLabel>
                  {CATEGORIES.filter((c) => c.group === grp).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Status</Label>
          <Select onValueChange={(v) => v && setValue('status', v as BusinessExpenseStatus)} value={status ?? 'paid'}>
            <SelectTrigger className="rounded-[8px]" style={inputStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span style={{ color: s.color }}>{s.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-app-base">Valor (R$)</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('amount')}
          />
          {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Vencimento</Label>
          <Input
            type="date"
            className="rounded-[8px]"
            style={inputStyle}
            {...register('due_date')}
          />
        </div>
      </div>

      {fornecedores.length > 0 && (
        <div className="space-y-2">
          <Label className="text-app-base">Fornecedor</Label>
          <Select
            onValueChange={(v) => setValue('counterparty_id', !v || v === '_none' ? '' : v)}
            value={counterparty_id || '_none'}
          >
            <SelectTrigger className="rounded-[8px]" style={inputStyle}>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              <SelectItem value="_none">Nenhum</SelectItem>
              {fornecedores.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Recurring toggle */}
      <button
        type="button"
        onClick={() => setValue('is_recurring', !is_recurring)}
        className="flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-sm transition-all"
        style={{
          background: is_recurring
            ? 'color-mix(in oklab, #3b82f6 10%, transparent)'
            : 'var(--panel-bg-soft)',
          border: `1px solid ${is_recurring ? 'color-mix(in oklab, #3b82f6 35%, transparent)' : 'var(--panel-border)'}`,
          color: is_recurring ? '#3b82f6' : 'var(--text-soft)',
        }}
      >
        <span className="flex items-center gap-2">
          <Repeat className="h-4 w-4 shrink-0" />
          <span className="font-medium">Recorrente</span>
        </span>
        <span className="text-xs">
          {is_recurring ? 'Sim — repete todo mês' : 'Não — lançamento único'}
        </span>
      </button>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-[8px] bg-[#f87171] text-white hover:bg-[#ef4444]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function DespesasEmpresaPage() {
  const { expenses, totals, business, currentMonth, refresh } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [fornecedores, setFornecedores] = useState<Counterparty[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BizExpense | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!business) return
    createClient()
      .from('business_counterparties')
      .select('*')
      .eq('business_id', business.id)
      .eq('type', 'fornecedor')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setFornecedores(data ?? []))
  }, [business])

  async function handleDelete(id: string) {
    if (!confirm('Remover esta despesa?')) return
    setDeleting(id)
    const { error } = await createClient().from('business_expenses').delete().eq('id', id)
    if (error) {
      setDeleting(null)
      toast.error('Erro ao remover', { description: mapMutationError(error.message) })
      return
    }
    await refresh()
    setDeleting(null)
    toast.success('Removido')
  }

  const grouped = expenses.reduce<Record<string, BizExpense[]>>((acc, expense) => {
    const cat = CATEGORIES.find((c) => c.id === expense.category)
    const grp = cat?.group ?? 'Outros'
    if (!acc[grp]) acc[grp] = []
    acc[grp].push(expense)
    return acc
  }, {})

  function formatDate(d: string | null) {
    if (!d) return null
    try {
      const [y, m, day] = d.split('-')
      return `${day}/${m}/${y}`
    } catch { return null }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Despesas</h1>
          <p className="mt-1 text-sm text-app-base">
            {formatMonth(currentMonth)} - {business?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton
            headers={['Descrição', 'Categoria', 'Grupo', 'Status', 'Vencimento', 'Recorrente', 'Valor (R$)']}
            rows={expenses.map((e) => {
              const cat = CATEGORIES.find((c) => c.id === e.category)
              return {
                'Descrição': e.description ?? '',
                'Categoria': cat?.label ?? e.category,
                'Grupo': cat?.group ?? '',
                'Status': statusLabel(e.status as BusinessExpenseStatus | null).label,
                'Vencimento': e.due_date ?? '',
                'Recorrente': e.is_recurring ? 'Sim' : 'Não',
                'Valor (R$)': e.amount.toFixed(2),
              }
            })}
            fileName={`saooz-despesas-${currentMonth.toISOString().slice(0, 7)}.csv`}
          />
          <ExportPDFButton
            data={{
              title: 'Relatório de Despesas',
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
              expenses: expenses.map((e) => ({
                category: CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category,
                description: e.description ?? undefined,
                amount: e.amount,
                date: e.created_at ? new Date(e.created_at).toLocaleDateString('pt-BR') : undefined,
              })),
            }}
            fileName={`saooz-despesas-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          <Button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="rounded-[8px] bg-[#f87171] text-white hover:bg-[#ef4444]"
          >
            <Plus className="mr-1 h-4 w-4" /> Lancar
          </Button>
        </div>
      </div>

      <div className="panel-card mb-6 p-5">
        <p className="text-sm text-app-base">Total em {formatMonth(currentMonth)}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[#f87171]">{formatCurrency(totals.totalExpenses)}</p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="Nenhuma despesa"
          description="Lance os custos da empresa neste mes."
          action={{ label: 'Lancar despesa', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([grp, items]) => {
            const grpTotal = items.reduce((sum, item) => sum + item.amount, 0)
            const grpColor = GROUP_COLORS[grp] ?? '#6B7280'

            return (
              <div key={grp}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: grpColor }}>
                    {grp}
                  </span>
                  <span className="text-xs tabular-nums text-app-soft">{formatCurrency(grpTotal)}</span>
                </div>
                <div className="space-y-2">
                  {items.map((expense) => {
                    const cat = CATEGORIES.find((c) => c.id === expense.category)
                    const pct = totals.totalExpenses > 0 ? Math.round((expense.amount / totals.totalExpenses) * 100) : 0
                    const st = statusLabel(expense.status as BusinessExpenseStatus | null)
                    const fornecedorName = fornecedores.find((f) => f.id === expense.counterparty_id)?.name

                    return (
                      <div key={expense.id} className="panel-card p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="truncate font-medium text-app">{expense.description ?? cat?.label ?? '-'}</p>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{
                                  background: `color-mix(in oklab, ${st.color} 15%, transparent)`,
                                  color: st.color,
                                }}
                              >
                                {st.label}
                              </span>
                              {expense.is_recurring && (
                                <span
                                  className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{ background: 'color-mix(in oklab, #3b82f6 12%, transparent)', color: '#3b82f6' }}
                                >
                                  <Repeat className="h-2.5 w-2.5" />
                                  Recorrente
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-3">
                              <p className="text-xs text-app-soft">{cat?.label}</p>
                              {fornecedorName && (
                                <p className="text-xs text-app-soft">· {fornecedorName}</p>
                              )}
                              {expense.due_date && (
                                <p className="flex items-center gap-1 text-xs text-app-soft">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(expense.due_date)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
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
                          <span className="font-semibold tabular-nums" style={{ color: grpColor }}>
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-xs text-app-soft">{pct}% das despesas</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--panel-border)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: grpColor }} />
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

      {userId && business && (
        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          title={editing ? 'Editar despesa' : 'Lancar despesa'}
        >
          <ExpenseForm
            onClose={() => { setModalOpen(false); setEditing(null) }}
            businessId={business.id}
            userId={userId}
            editing={editing}
            onSaved={refresh}
            currentMonth={currentMonth}
            fornecedores={fornecedores}
          />
        </Modal>
      )}
    </div>
  )
}
