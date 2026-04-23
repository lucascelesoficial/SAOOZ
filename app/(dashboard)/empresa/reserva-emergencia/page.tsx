'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Loader2,
  Plus,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/Modal'
import { ReserveKpiCards } from '@/components/modules/reserve/ReserveKpiCards'
import { ReserveMovementsTable } from '@/components/modules/reserve/ReserveMovementsTable'
import { useReserveData } from '@/lib/hooks/useReserveData'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { useAppState } from '@/lib/context/AppStateContext'
import type { ReserveStatus } from '@/lib/modules/reserve/service'

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ReserveStatus, string> = {
  critico: '#f87171',
  atencao: '#f59e0b',
  saudavel: '#026648',
  forte: 'var(--accent-blue)',
}

const STATUS_ICONS: Record<ReserveStatus, React.ElementType> = {
  critico: ShieldAlert,
  atencao: ShieldAlert,
  saudavel: ShieldCheck,
  forte: ShieldCheck,
}

function StatusBadge({ code, label }: { code: ReserveStatus; label: string }) {
  const color = STATUS_COLORS[code]
  const Icon = STATUS_ICONS[code]
  return (
    <div
      className="flex items-center gap-2 rounded-[8px] px-3 py-1.5 text-sm font-bold"
      style={{
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
        color,
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  )
}

// ── Formulário: Configurar meta PJ ────────────────────────────────────────────

interface TargetFormValues {
  targetAmount: string
  initialAmount: string
  monthlyTargetContribution: string
  notes: string
}

function TargetConfigForm({
  onClose,
  currentTargetAmount,
  currentInitialAmount,
  currentMonthlyContribution,
  currentNotes,
  onSave,
  isSaving,
}: {
  onClose: () => void
  currentTargetAmount: number
  currentInitialAmount: number
  currentMonthlyContribution: number | null
  currentNotes: string | null
  onSave: (values: TargetFormValues) => Promise<void>
  isSaving: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TargetFormValues>({
    defaultValues: {
      targetAmount: currentTargetAmount > 0 ? String(currentTargetAmount) : '',
      initialAmount: currentInitialAmount > 0 ? String(currentInitialAmount) : '0',
      monthlyTargetContribution:
        currentMonthlyContribution != null ? String(currentMonthlyContribution) : '',
      notes: currentNotes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div className="space-y-2">
        <Label className="text-app-base">Meta de proteção operacional (R$)</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 30000"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: errors.targetAmount ? '#f87171' : 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('targetAmount', {
            validate: (v) => {
              if (!v) return true
              const n = parseFloat(v.replace(',', '.'))
              return (!isNaN(n) && n >= 0) || 'Valor inválido'
            },
          })}
        />
        {errors.targetAmount && (
          <p className="text-xs text-[#f87171]">{errors.targetAmount.message}</p>
        )}
        <p className="text-xs text-app-soft">
          Recomendado: 3 a 6 meses dos custos operacionais essenciais da empresa.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Saldo atual da reserva (R$)</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 8000"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: errors.initialAmount ? '#f87171' : 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('initialAmount', {
            validate: (v) => {
              if (!v) return true
              const n = parseFloat(v.replace(',', '.'))
              return (!isNaN(n) && n >= 0) || 'Valor inválido'
            },
          })}
        />
        {errors.initialAmount && (
          <p className="text-xs text-[#f87171]">{errors.initialAmount.message}</p>
        )}
        <p className="text-xs text-app-soft">
          Valor já existente antes de registrar aportes aqui.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Aporte mensal planejado (R$) — opcional</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 2000"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('monthlyTargetContribution')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Observações — opcional</Label>
        <Input
          placeholder="Ex: Conta reserva no Banco X"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-[8px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-[8px] text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          }}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

// ── Formulário: Registrar movimentação ────────────────────────────────────────

interface MovementFormValues {
  entryType: 'aporte' | 'resgate' | 'ajuste'
  amount: string
  happenedOn: string
  description: string
}

function MovementForm({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void
  onSave: (values: MovementFormValues) => Promise<void>
  isSaving: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MovementFormValues>({
    defaultValues: {
      entryType: 'aporte',
      amount: '',
      happenedOn: today,
      description: '',
    },
  })

  const entryType = watch('entryType')

  const ENTRY_TYPE_CONFIG = {
    aporte: { label: 'Aporte', icon: TrendingUp, color: '#026648' },
    resgate: { label: 'Resgate', icon: TrendingDown, color: '#f87171' },
    ajuste: { label: 'Ajuste', icon: SlidersHorizontal, color: '#94a3b8' },
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div className="space-y-2">
        <Label className="text-app-base">Tipo</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(ENTRY_TYPE_CONFIG) as [
            'aporte' | 'resgate' | 'ajuste',
            { label: string; icon: React.ElementType; color: string },
          ][]).map(([key, config]) => {
            const Icon = config.icon
            const isSelected = entryType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setValue('entryType', key)}
                className="flex flex-col items-center gap-1.5 rounded-[8px] p-2.5 text-xs font-semibold transition-all"
                style={{
                  background: isSelected
                    ? `color-mix(in oklab, ${config.color} 15%, transparent)`
                    : 'var(--panel-bg-soft)',
                  border: `1px solid ${
                    isSelected
                      ? `color-mix(in oklab, ${config.color} 40%, transparent)`
                      : 'var(--panel-border)'
                  }`,
                  color: isSelected ? config.color : 'var(--text-soft)',
                }}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </button>
            )
          })}
        </div>
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
            borderColor: errors.amount ? '#f87171' : 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('amount', {
            required: 'Informe o valor',
            validate: (v) => {
              const n = parseFloat(v.replace(',', '.'))
              return (!isNaN(n) && n > 0) || 'Valor deve ser maior que zero'
            },
          })}
        />
        {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Data</Label>
        <Input
          type="date"
          className="rounded-[8px]"
          style={{
            background: 'var(--panel-bg-soft)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-strong)',
          }}
          {...register('happenedOn')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descrição — opcional</Label>
        <Input
          placeholder="Ex: Aporte mensal de proteção"
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
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-[8px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-[8px] text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          }}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

// ── Barra de progresso ─────────────────────────────────────────────────────────

function ReserveProgressBar({
  current,
  target,
  status,
}: {
  current: number
  target: number
  status: ReserveStatus | null
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const progressColor =
    status ? STATUS_COLORS[status] : pct >= 66 ? '#026648' : pct >= 33 ? '#f59e0b' : '#f87171'

  return (
    <div className="panel-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-app">Cobertura operacional</p>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: progressColor }}
        >
          {pct.toFixed(1)}%
        </span>
      </div>

      <div
        className="h-3 overflow-hidden rounded-full"
        style={{ background: 'var(--panel-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: progressColor }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-app-soft">
        <span>{formatCurrency(current)} em reserva</span>
        <span>Meta: {formatCurrency(target)}</span>
      </div>
    </div>
  )
}

// ── Página principal (PJ) ──────────────────────────────────────────────────────

export default function ReservaEmergenciaPJPage() {
  const { currentMonth } = useAppState()
  const { business } = useBusinessData()
  const [targetModalOpen, setTargetModalOpen] = useState(false)
  const [movementModalOpen, setMovementModalOpen] = useState(false)

  const businessId = business?.id ?? null
  const isEnabled = Boolean(businessId)

  const {
    reserve,
    metrics,
    movements,
    isLoading,
    isSavingTarget,
    isSavingMovement,
    error,
    refresh,
    updateTarget,
    addMovement,
  } = useReserveData({ scope: 'business', businessId, enabled: isEnabled })

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleDeleteMovement(id: string) {
    const { error: err } = await createClient()
      .from('financial_reserve_entries')
      .delete()
      .eq('id', id)
    if (err) { toast.error('Erro ao remover'); return }
    await refresh()
    toast.success('Registro removido')
  }

  async function handleSaveTarget(values: TargetFormValues) {
    const parse = (v: string) => {
      const n = parseFloat(v.replace(',', '.'))
      return isNaN(n) ? undefined : n
    }

    try {
      await updateTarget({
        targetAmount: parse(values.targetAmount),
        initialAmount: parse(values.initialAmount),
        monthlyTargetContribution:
          values.monthlyTargetContribution
            ? parse(values.monthlyTargetContribution) ?? null
            : null,
        notes: values.notes.trim() || null,
      })
      toast.success('Meta da reserva atualizada')
      setTargetModalOpen(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar meta.'
      toast.error('Erro', { description: msg })
    }
  }

  async function handleAddMovement(values: MovementFormValues) {
    const amount = parseFloat(values.amount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return

    try {
      await addMovement({
        entryType: values.entryType,
        amount,
        happenedOn: values.happenedOn || undefined,
        description: values.description.trim() || null,
      })
      toast.success('Movimentação registrada')
      setMovementModalOpen(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar movimentação.'
      toast.error('Erro', { description: msg })
    }
  }

  // ── Empresa não selecionada ───────────────────────────────────────────────

  if (!isEnabled) {
    return (
      <div className="mx-auto max-w-2xl pb-24 md:pb-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-app">Reserva de Emergência</h1>
          <p className="mt-1 text-sm text-app-base">Empresarial</p>
        </div>
        <div
          className="rounded-[12px] p-6 text-center"
          style={{
            background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
            border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)',
          }}
        >
          <ShieldAlert
            className="mx-auto mb-3 h-8 w-8"
            style={{ color: 'var(--accent-blue)' }}
          />
          <p className="font-semibold text-app">Nenhuma empresa ativa</p>
          <p className="mt-1 text-sm text-app-soft">
            Configure uma empresa em Empresa → Configurações para acessar este módulo.
          </p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Reserva de Emergência</h1>
          <p className="mt-1 text-sm text-app-base">
            {business?.name ?? 'Empresarial'} · {formatMonth(currentMonth)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {metrics?.status && (
            <StatusBadge code={metrics.status.code} label={metrics.status.label} />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTargetModalOpen(true)}
            className="rounded-[8px] gap-1.5"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Meta</span>
          </Button>
          <Button
            onClick={() => setMovementModalOpen(true)}
            size="sm"
            className="rounded-[8px] text-white gap-1.5"
            style={{
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Movimentação</span>
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        </div>
      )}

      {/* Erro */}
      {!isLoading && error && (
        <div
          className="rounded-[10px] p-4 text-sm"
          style={{
            background: 'color-mix(in oklab, #f87171 10%, transparent)',
            border: '1px solid color-mix(in oklab, #f87171 30%, transparent)',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {/* Conteúdo */}
      {!isLoading && !error && metrics && (
        <div className="space-y-5">
          {/* Estado vazio */}
          {!reserve && (
            <div
              className="rounded-[12px] p-6 text-center"
              style={{
                background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
                border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)',
              }}
            >
              <ShieldCheck
                className="mx-auto mb-3 h-8 w-8"
                style={{ color: 'var(--accent-blue)' }}
              />
              <p className="font-semibold text-app">Configure a reserva operacional</p>
              <p className="mt-1 text-sm text-app-soft">
                Defina a meta e o saldo atual para acompanhar a proteção da empresa.
              </p>
              <Button
                onClick={() => setTargetModalOpen(true)}
                className="mt-4 rounded-[8px] text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                }}
              >
                Configurar agora
              </Button>
            </div>
          )}

          {/* Progresso */}
          {reserve && (
            <ReserveProgressBar
              current={metrics.reserveCurrentAmount}
              target={metrics.targetAmount}
              status={metrics.status?.code ?? null}
            />
          )}

          {/* KPI Cards */}
          <ReserveKpiCards scope="business" metrics={metrics} />

          {/* Movimentações do mês */}
          <div>
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-app">Movimentações do mês</p>
              <button
                onClick={() => setMovementModalOpen(true)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent-blue)' }}
              >
                <Plus className="h-3.5 w-3.5" />
                Nova
              </button>
            </div>
            <ReserveMovementsTable movements={movements} onDelete={handleDeleteMovement} />
          </div>
        </div>
      )}

      {/* Modal: Configurar meta */}
      <Modal
        open={targetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        title="Configurar reserva operacional"
        description="Defina a meta de proteção e o saldo atual da empresa."
      >
        <TargetConfigForm
          onClose={() => setTargetModalOpen(false)}
          currentTargetAmount={reserve?.targetAmount ?? 0}
          currentInitialAmount={reserve?.initialAmount ?? 0}
          currentMonthlyContribution={reserve?.monthlyTargetContribution ?? null}
          currentNotes={reserve?.notes ?? null}
          onSave={handleSaveTarget}
          isSaving={isSavingTarget}
        />
      </Modal>

      {/* Modal: Registrar movimentação */}
      <Modal
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        title="Registrar movimentação"
        description="Registre aportes, resgates ou ajustes na reserva da empresa."
      >
        <MovementForm
          onClose={() => setMovementModalOpen(false)}
          onSave={handleAddMovement}
          isSaving={isSavingMovement}
        />
      </Modal>
    </div>
  )
}
