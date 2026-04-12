'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Loader2, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import type { BusinessRevCategory, Database } from '@/types/database.types'

type Revenue = Database['public']['Tables']['business_revenues']['Row']

const CATEGORIES: Array<{ id: BusinessRevCategory; label: string }> = [
  { id: 'servico', label: 'Servico' },
  { id: 'produto', label: 'Produto' },
  { id: 'recorrente', label: 'Recorrente' },
  { id: 'comissao', label: 'Comissao' },
  { id: 'outro', label: 'Outro' },
]

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

  if (normalized.includes('business_scope_locked')) {
    return 'Seu plano atual nao permite lancamentos no modulo empresarial.'
  }

  if (normalized.includes('personal_scope_locked')) {
    return 'Seu plano atual nao permite lancamentos no modulo pessoal.'
  }

  return message
}

function RevenueForm({
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
  editing?: Revenue | null
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
      : { description: '', category: 'servico', amount: '' },
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
        .from('business_revenues')
        .update({
          description: values.description || null,
          category: values.category as BusinessRevCategory,
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
      const { error } = await supabase.from('business_revenues').insert({
        user_id: userId,
        business_id: businessId,
        description: values.description || null,
        category: values.category as BusinessRevCategory,
        amount: parsed,
        month: monthStr,
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
        <Select onValueChange={(v) => v && setValue('category', v)} value={category ?? 'servico'}>
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
            className="rounded-[8px]"
            style={{
              background: 'var(--panel-bg)',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
          >
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
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
        <Button type="submit" disabled={loading} className="flex-1 rounded-[8px] bg-[#22c55e] text-white hover:bg-[#16a34a]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export default function EmpresaFinancasPage() {
  const { revenues, totals, business, currentMonth, refresh } = useBusinessData()
  const [userId, setUserId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Revenue | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

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
                date: r.date ? new Date(r.date).toLocaleDateString('pt-BR') : undefined,
              })),
            }}
            fileName={`saooz-receitas-${currentMonth}.pdf`}
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
            return (
              <div key={r.id} className="panel-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-app">{r.description ?? '-'}</p>
                    <p className="mt-0.5 text-xs text-app-soft">{catLabel[r.category] ?? r.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(r)
                        setModalOpen(true)
                      }}
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
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          title={editing ? 'Editar faturamento' : 'Lancar faturamento'}
        >
          <RevenueForm
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
