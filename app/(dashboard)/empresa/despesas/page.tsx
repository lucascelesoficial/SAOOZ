'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, TrendingDown } from 'lucide-react'
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
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import type { BusinessExpCategory, Database } from '@/types/database.types'

type BizExpense = Database['public']['Tables']['business_expenses']['Row']

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
  Investimento: '#0ea5e9',
}

interface FormValues {
  description: string
  amount: string
  category: string
}

function ExpenseForm({
  onClose,
  businessId,
  userId,
  editing,
  onSaved,
  currentMonth,
}: {
  onClose: () => void
  businessId: string
  userId: string
  editing?: BizExpense | null
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
      ? { description: editing.description ?? '', category: editing.category, amount: String(editing.amount) }
      : { description: '', category: 'fixo_outros', amount: '' },
  })

  const category = watch('category')
  const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  async function onSubmit(values: FormValues) {
    const parsed = parseFloat(values.amount.replace(',', '.'))
    if (!values.amount || Number.isNaN(parsed) || parsed <= 0) {
      setError('amount', { message: 'Valor invalido' })
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (editing) {
      const { error } = await supabase
        .from('business_expenses')
        .update({
          description: values.description || null,
          category: values.category as BusinessExpCategory,
          amount: parsed,
          month: monthStr,
        })
        .eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar', { description: error.message })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('business_expenses').insert({
        user_id: userId,
        business_id: businessId,
        description: values.description || null,
        category: values.category as BusinessExpCategory,
        amount: parsed,
        month: monthStr,
      })
      if (error) {
        toast.error('Erro ao adicionar', { description: error.message })
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
        <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'fixo_outros'}>
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
                <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-app-soft">{grp}</SelectLabel>
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
        <Button type="submit" disabled={loading} className="flex-1 rounded-[8px] bg-[#f87171] text-white hover:bg-[#ef4444]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function DespesasEmpresaPage() {
  const { expenses, totals, business, currentMonth, refresh } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BizExpense | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Remover esta despesa?')) return
    setDeleting(id)
    const { error } = await createClient().from('business_expenses').delete().eq('id', id)
    if (error) {
      setDeleting(null)
      toast.error('Erro ao remover', { description: error.message })
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Despesas</h1>
          <p className="mt-1 text-sm text-app-base">
            {formatMonth(currentMonth)} - {business?.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="rounded-[8px] bg-[#f87171] text-white hover:bg-[#ef4444]"
        >
          <Plus className="mr-1 h-4 w-4" /> Lancar
        </Button>
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

                    return (
                      <div key={expense.id} className="panel-card p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-app">{expense.description ?? cat?.label ?? '-'}</p>
                            <p className="mt-0.5 text-xs text-app-soft">{cat?.label}</p>
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
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          title={editing ? 'Editar despesa' : 'Lancar despesa'}
        >
          <ExpenseForm
            onClose={() => {
              setModalOpen(false)
              setEditing(null)
            }}
            businessId={business.id}
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
