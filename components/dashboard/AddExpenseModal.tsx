'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { createClient } from '@/lib/supabase/client'
import { useFinancialData } from '@/lib/hooks/useFinancialData'
import { toMonthISO } from '@/lib/utils/formatters'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/types/financial.types'
import type { ExpenseCategory } from '@/types/database.types'

interface FormValues {
  category: string
  amount: string
  description: string
}

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

function parseCurrencyInput(value: string) {
  const raw = value.trim()
  if (!raw) return NaN

  const hasComma = raw.includes(',')
  const hasDot = raw.includes('.')

  if (hasComma && hasDot) {
    return Number(raw.replace(/\./g, '').replace(',', '.'))
  }

  if (hasComma) {
    return Number(raw.replace(',', '.'))
  }

  return Number(raw)
}

function mapInsertError(message: string) {
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

  if (normalized.includes('row-level security')) {
    return 'Sua sessao expirou. Entre novamente para continuar.'
  }

  return message
}

function ExpenseForm({ onClose, userId }: { onClose: () => void; userId: string }) {
  const { currentMonth, refresh } = useFinancialData()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { category: '', amount: '', description: '' },
  })

  const category = watch('category')

  async function onSubmit(values: FormValues) {
    if (loading) return

    if (!values.category) {
      setError('category', { message: 'Selecione uma categoria' })
      return
    }

    const parsedAmount = parseCurrencyInput(values.amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('amount', { message: 'Informe um valor valido' })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const resolvedUserId = user?.id ?? userId
      if (!resolvedUserId) {
        toast.error('Sessao invalida', { description: 'Entre novamente para salvar seus dados.' })
        return
      }

      const { error } = await supabase.from('expenses').insert({
        user_id: resolvedUserId,
        category: values.category as ExpenseCategory,
        amount: parsedAmount,
        description: values.description.trim() || null,
        month: toMonthISO(currentMonth),
      })

      if (error) {
        toast.error('Erro ao salvar gasto', { description: mapInsertError(error.message) })
        return
      }

      toast.success('Despesa salva com sucesso')
      reset({ category: '', amount: '', description: '' })
      await refresh()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
      <input type="hidden" {...register('category', { required: 'Selecione uma categoria' })} />

      <div className="space-y-2">
        <Label className="text-app-base">Categoria</Label>
        <Select
          onValueChange={(value) => {
            if (!value) return
            setValue('category', value, { shouldDirty: true, shouldValidate: true })
          }}
          value={category ?? ''}
        >
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
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-[#f87171]">{errors.category.message}</p>}
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
          {...register('amount', { required: 'Informe o valor' })}
        />
        {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descricao (opcional)</Label>
        <Input
          type="text"
          placeholder="Ex: Supermercado"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('description')}
        />
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

export function AddExpenseModal({ open, onClose, userId }: AddExpenseModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Adicionar despesa">
        <ExpenseForm onClose={onClose} userId={userId} />
      </BottomSheet>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar despesa">
      <ExpenseForm onClose={onClose} userId={userId} />
    </Modal>
  )
}
