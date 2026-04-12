'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, Briefcase, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { INCOME_TYPE_LABELS } from '@/types/financial.types'
import type { IncomeType, Database } from '@/types/database.types'

type Income = Database['public']['Tables']['income_sources']['Row']

const ALL_TYPES = Object.keys(INCOME_TYPE_LABELS) as IncomeType[]

interface FormValues {
  name: string
  type: string
  amount: string
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

function IncomeForm({
  onClose,
  userId,
  editing,
  onSaved,
  currentMonth,
}: {
  onClose: () => void
  userId: string
  editing?: Income | null
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
      ? { name: editing.name, type: editing.type, amount: String(editing.amount) }
      : { name: '', type: '', amount: '' },
  })

  const type = watch('type')
  const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  async function onSubmit(values: FormValues) {
    if (!values.type) {
      setError('type', { message: 'Selecione o tipo' })
      return
    }
    const parsed = parseFloat(values.amount.replace(',', '.'))
    if (!values.amount || Number.isNaN(parsed) || parsed <= 0) {
      setError('amount', { message: 'Valor invalido' })
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (editing) {
      const { error } = await supabase
        .from('income_sources')
        .update({ name: values.name, type: values.type as IncomeType, amount: parsed, month: monthStr })
        .eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('income_sources').insert({
        user_id: userId,
        name: values.name,
        type: values.type as IncomeType,
        amount: parsed,
        active: true,
        month: monthStr,
      })
      if (error) {
        toast.error('Erro ao adicionar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    }

    toast.success(editing ? 'Renda atualizada' : 'Renda adicionada')
    onSaved()
    onClose()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div
        className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs"
        style={{
          background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
          border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)',
          color: 'var(--accent-blue)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-blue)' }} />
        Lancando para: <span className="ml-0.5 font-semibold">{formatMonth(currentMonth)}</span>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Nome</Label>
        <Input
          placeholder="Ex: Salario principal"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('name', { required: 'Informe o nome' })}
        />
        {errors.name && <p className="text-xs text-[#f87171]">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Tipo</Label>
        <Select onValueChange={(v) => v && setValue('type', v)} value={type ?? ''}>
          <SelectTrigger
            className="rounded-[8px]"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          >
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent
            className="rounded-[8px]"
            style={{
              background: 'var(--panel-bg)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          >
            {ALL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {INCOME_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-[#f87171]">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Valor recebido em {formatMonth(currentMonth)} (R$)</Label>
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function FinancasPage() {
  const { incomes, refresh, currentMonth } = useFinancialData()
  const [userId, setUserId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const total = incomes.reduce((sum, income) => sum + income.amount, 0)

  async function handleDelete(id: string) {
    if (!confirm('Remover esta fonte de renda?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('income_sources').delete().eq('id', id)
    if (error) {
      setDeleting(null)
      toast.error('Erro ao remover', { description: mapMutationError(error.message) })
      return
    }
    await refresh()
    setDeleting(null)
    toast.success('Renda removida')
  }

  async function handleToggleRecurring(income: Income) {
    setToggling(income.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('income_sources')
      .update({ is_recurring: !income.is_recurring })
      .eq('id', income.id)
    if (error) {
      toast.error('Erro ao atualizar')
      setToggling(null)
      return
    }
    await refresh()
    setToggling(null)
    toast.success(income.is_recurring ? 'Fixação removida' : 'Fixado para os próximos meses')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Finanças</h1>
          <p className="mt-1 text-sm text-app-base">{formatMonth(currentMonth)} - lançamentos deste mês</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPDFButton
            data={{
              title: 'Relatório de Rendas',
              subtitle: 'Módulo Pessoal',
              month: formatMonth(currentMonth),
              totalIncome: total,
              totalExpenses: 0,
              balance: total,
              incomes: incomes.map((i) => ({
                name: i.name,
                type: INCOME_TYPE_LABELS[i.type] ?? i.type,
                amount: i.amount,
                date: i.created_at ? new Date(i.created_at).toLocaleDateString('pt-BR') : undefined,
              })),
            }}
            fileName={`saooz-rendas-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          <Button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="rounded-[8px] text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            <Plus className="mr-1 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="panel-card mb-6 p-5">
        <p className="text-sm text-app-base">Renda total em {formatMonth(currentMonth)}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: '#22c55e' }}>
          {formatCurrency(total)}
        </p>
      </div>

      {incomes.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma fonte de renda"
          description="Adicione salarios, freelas e outras rendas para o SAOOZ calcular seu saldo."
          action={{ label: 'Adicionar renda', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {incomes.map((income) => {
            const pct = total > 0 ? Math.round((income.amount / total) * 100) : 0
            return (
              <div key={income.id} className="panel-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-app">{income.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-app-soft">
                      {INCOME_TYPE_LABELS[income.type]}
                      {income.is_recurring && (
                        <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)', color: 'var(--accent-blue)' }}>
                          <Pin className="h-2.5 w-2.5" /> Fixo
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleToggleRecurring(income)}
                      disabled={toggling === income.id}
                      className="rounded-[6px] p-1.5 transition-colors"
                      style={{ color: income.is_recurring ? 'var(--accent-blue)' : 'var(--text-soft)' }}
                      title={income.is_recurring ? 'Fixado — clique para desafixar' : 'Fixar para próximos meses'}
                      aria-label="Fixar"
                    >
                      {toggling === income.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Pin className="h-3.5 w-3.5" style={{ fill: income.is_recurring ? 'var(--accent-blue)' : 'none' }} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(income)
                        setModalOpen(true)
                      }}
                      className="rounded-[6px] p-1.5 text-app-soft hover:text-app"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
                      disabled={deleting === income.id}
                      className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171]"
                      aria-label="Remover"
                    >
                      {deleting === income.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-semibold tabular-nums" style={{ color: '#22c55e' }}>
                    {formatCurrency(income.amount)}
                  </span>
                  <span className="text-xs text-app-soft">{pct}% da renda</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--panel-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#22c55e' }} />
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
          title={editing ? 'Editar renda' : 'Adicionar renda'}
        >
          <IncomeForm
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
