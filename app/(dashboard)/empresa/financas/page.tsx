'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, TrendingUp, Calendar, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { ExportCSVButton } from '@/components/csv/ExportCSVButton'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import type { BusinessRevCategory, BusinessRevenueStatus, Database } from '@/types/database.types'

type Revenue = Database['public']['Tables']['business_revenues']['Row']
type Counterparty = Database['public']['Tables']['business_counterparties']['Row']

const CATEGORIES: Array<{ id: BusinessRevCategory; label: string }> = [
  { id: 'servico', label: 'Servico' },
  { id: 'produto', label: 'Produto' },
  { id: 'recorrente', label: 'Recorrente' },
  { id: 'comissao', label: 'Comissao' },
  { id: 'outro', label: 'Outro' },
]

const STATUS_OPTIONS: Array<{ id: BusinessRevenueStatus; label: string; color: string }> = [
  { id: 'received', label: 'Recebido', color: '#22c55e' },
  { id: 'pending', label: 'Pendente', color: '#f59e0b' },
  { id: 'overdue', label: 'Atrasado', color: '#f87171' },
  { id: 'canceled', label: 'Cancelado', color: '#6B7280' },
]

function statusLabel(status: BusinessRevenueStatus | null | undefined) {
  return STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0]
}

interface FormValues {
  description: string
  amount: string
  category: string
  status: BusinessRevenueStatus
  closing_date: string
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

function RevenueForm({
  onClose,
  businessId,
  userId,
  editing,
  onSaved,
  currentMonth,
  clientes,
}: {
  onClose: () => void
  businessId: string
  userId: string
  editing?: Revenue | null
  onSaved: () => void
  currentMonth: Date
  clientes: Counterparty[]
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
          status: (editing.status as BusinessRevenueStatus) ?? 'received',
          closing_date: (editing as Revenue & { closing_date?: string | null }).closing_date ?? '',
          due_date: editing.due_date ?? '',
          counterparty_id: editing.counterparty_id ?? '',
          is_recurring: editing.is_recurring ?? false,
        }
      : {
          description: '',
          category: 'servico',
          amount: '',
          status: 'received',
          closing_date: '',
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
      category: values.category as BusinessRevCategory,
      amount: parsed,
      month: monthStr,
      status: values.status,
      closing_date: values.closing_date || null,
      due_date: values.due_date || null,
      counterparty_id: values.counterparty_id || null,
      is_recurring: values.is_recurring,
    }

    if (editing) {
      const { error } = await supabase
        .from('business_revenues')
        .update(payload)
        .eq('id', editing.id)
      if (error) {
        toast.error('Erro ao atualizar', { description: mapMutationError(error.message) })
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('business_revenues').insert({
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

    toast.success(editing ? 'Faturamento atualizado' : 'Faturamento adicionado')
    onSaved()
    onClose()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <div
        className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs"
        style={{
          background: 'color-mix(in oklab, #22c55e 8%, transparent)',
          border: '1px solid color-mix(in oklab, #22c55e 25%, transparent)',
          color: '#22c55e',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
        Lancando em: <span className="ml-0.5 font-semibold">{formatMonth(currentMonth)}</span>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descricao</Label>
        <Input
          placeholder="Ex: Projeto site cliente X"
          className="rounded-[8px]"
          style={inputStyle}
          {...register('description')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-app-base">Categoria</Label>
          <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'servico'}>
            <SelectTrigger className="rounded-[8px]" style={inputStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="rounded-[8px]"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            >
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-app-base">Status</Label>
          <Select onValueChange={(v) => v && setValue('status', v as BusinessRevenueStatus)} value={status ?? 'received'}>
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

      {/* Datas de medição/fechamento */}
      <div className="space-y-2">
        <Label className="text-app-base flex items-center gap-1.5">
          Data de Fechamento / Medição
          <span className="text-[10px] font-normal text-app-soft">(opcional)</span>
        </Label>
        <Input
          type="date"
          className="rounded-[8px]"
          style={inputStyle}
          {...register('closing_date')}
        />
        <p className="text-[11px] text-app-soft">
          Quando o serviço foi medido ou o contrato foi fechado. O dinheiro pode entrar em outra data.
        </p>
      </div>

      {clientes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-app-base">Cliente</Label>
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
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
          className="flex-1 rounded-[8px] bg-[#22c55e] text-white hover:bg-[#16a34a]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function EmpresaFinancasPage() {
  const { revenues, totals, business, currentMonth, refresh } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Counterparty[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Revenue | null>(null)
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
      .eq('type', 'cliente')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setClientes(data ?? []))
  }, [business])

  async function handleDelete(id: string) {
    if (!confirm('Remover este lancamento?')) return
    setDeleting(id)
    const { error } = await createClient().from('business_revenues').delete().eq('id', id)
    if (error) {
      setDeleting(null)
      toast.error('Erro ao remover', { description: mapMutationError(error.message) })
      return
    }
    await refresh()
    setDeleting(null)
    toast.success('Removido')
  }

  const catLabel: Record<string, string> = {
    servico: 'Servico',
    produto: 'Produto',
    recorrente: 'Recorrente',
    comissao: 'Comissao',
    outro: 'Outro',
  }

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
          <h1 className="text-xl font-bold text-app">Finanças</h1>
          <p className="mt-1 text-sm text-app-base">
            {formatMonth(currentMonth)} - {business?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton
            headers={['Descrição', 'Categoria', 'Status', 'Vencimento', 'Recorrente', 'Valor (R$)']}
            rows={revenues.map((r) => ({
              'Descrição': r.description ?? '',
              'Categoria': catLabel[r.category] ?? r.category,
              'Status': statusLabel(r.status as BusinessRevenueStatus | null).label,
              'Vencimento': r.due_date ?? '',
              'Recorrente': r.is_recurring ? 'Sim' : 'Não',
              'Valor (R$)': r.amount.toFixed(2),
            }))}
            fileName={`saooz-receitas-${currentMonth.toISOString().slice(0, 7)}.csv`}
          />
          <ExportPDFButton
            data={{
              title: 'Relatório de Receitas',
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
              incomes: revenues.map((r) => ({
                name: r.description ?? r.category,
                type: catLabel[r.category] ?? r.category,
                amount: r.amount,
                date: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : undefined,
              })),
            }}
            fileName={`saooz-receitas-${currentMonth.toISOString().slice(0, 7)}.pdf`}
          />
          <Button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="rounded-[8px] bg-[#22c55e] text-white hover:bg-[#16a34a]"
          >
            <Plus className="mr-1 h-4 w-4" /> Lançar
          </Button>
        </div>
      </div>

      <div className="panel-card mb-6 p-5">
        <p className="text-sm text-app-base">Total em {formatMonth(currentMonth)}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[#22c55e]">{formatCurrency(totals.totalRevenue)}</p>
      </div>

      {revenues.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum faturamento"
          description="Registre as receitas da empresa neste mes."
          action={{ label: 'Lancar faturamento', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {revenues.map((r) => {
            const pct = totals.totalRevenue > 0 ? Math.round((r.amount / totals.totalRevenue) * 100) : 0
            const st = statusLabel(r.status as BusinessRevenueStatus | null)
            const clienteName = clientes.find((c) => c.id === r.counterparty_id)?.name
            return (
              <div key={r.id} className="panel-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate font-medium text-app">{r.description ?? '-'}</p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `color-mix(in oklab, ${st.color} 15%, transparent)`,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                      {r.is_recurring && (
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
                      <p className="text-xs text-app-soft">{catLabel[r.category] ?? r.category}</p>
                      {clienteName && (
                        <p className="text-xs text-app-soft">· {clienteName}</p>
                      )}
                      {(r as Revenue & { closing_date?: string | null }).closing_date && (
                        <p className="flex items-center gap-1 text-xs text-app-soft">
                          <Calendar className="h-3 w-3" />
                          Med: {formatDate((r as Revenue & { closing_date?: string | null }).closing_date!)}
                        </p>
                      )}
                      {r.due_date && (
                        <p className="flex items-center gap-1 text-xs text-app-soft">
                          <Calendar className="h-3 w-3" style={{ color: '#f59e0b' }} />
                          Venc: {formatDate(r.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => { setEditing(r); setModalOpen(true) }}
                      className="rounded-[6px] p-1.5 text-app-soft hover:text-app hover:opacity-80"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] hover:opacity-80"
                    >
                      {deleting === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-semibold tabular-nums text-[#22c55e]">{formatCurrency(r.amount)}</span>
                  <span className="text-xs text-app-soft">{pct}% do faturamento</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--panel-border)' }}>
                  <div className="h-full rounded-full bg-[#22c55e] transition-all" style={{ width: `${pct}%` }} />
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
          title={editing ? 'Editar faturamento' : 'Lancar faturamento'}
        >
          <RevenueForm
            onClose={() => { setModalOpen(false); setEditing(null) }}
            businessId={business.id}
            userId={userId}
            editing={editing}
            onSaved={refresh}
            currentMonth={currentMonth}
            clientes={clientes}
          />
        </Modal>
      )}
    </div>
  )
}
