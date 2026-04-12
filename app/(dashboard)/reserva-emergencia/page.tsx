'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Car,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  MinusCircle,
  PlusCircle,
  Settings2,
  ShieldCheck,
  Trash2,
  Umbrella,
  Wallet,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/Modal'
import { useReserveData } from '@/lib/hooks/useReserveData'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatters'

// ── Categorias de emergência ──────────────────────────────────────────────────

const EMERGENCY_CATEGORIES = [
  { icon: Heart,   label: 'Saúde',       desc: 'Consulta, exame, remédio inesperado' },
  { icon: Car,     label: 'Carro',       desc: 'Pneu furado, batida, manutenção urgente' },
  { icon: Home,    label: 'Casa',        desc: 'Vazamento, elétrica, obra emergencial' },
  { icon: Wallet,  label: 'Desemprego',  desc: 'Período sem renda ou transição' },
  { icon: Wrench,  label: 'Eletro',      desc: 'Geladeira, máquina de lavar quebrou' },
  { icon: Umbrella,label: 'Imprevisto',  desc: 'Qualquer coisa que a vida preparar' },
]

// ── Status de cobertura ───────────────────────────────────────────────────────

function getCoverageInfo(months: number) {
  if (months < 1)  return { label: 'Sem proteção',    color: '#f87171', bg: 'color-mix(in oklab, #f87171 12%, transparent)',    border: 'color-mix(in oklab, #f87171 30%, transparent)',    emoji: '🚨' }
  if (months < 3)  return { label: 'Proteção básica', color: '#f59e0b', bg: 'color-mix(in oklab, #f59e0b 12%, transparent)',    border: 'color-mix(in oklab, #f59e0b 30%, transparent)',    emoji: '⚠️' }
  if (months < 6)  return { label: 'Bem protegido',   color: '#22c55e', bg: 'color-mix(in oklab, #22c55e 12%, transparent)',    border: 'color-mix(in oklab, #22c55e 30%, transparent)',    emoji: '✅' }
  return             { label: 'Muito protegido',  color: 'var(--accent-blue)', bg: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)', border: 'color-mix(in oklab, var(--accent-blue) 30%, transparent)', emoji: '🛡️' }
}

// ── Modal: configurar proteção ────────────────────────────────────────────────

interface ProtectionFormValues {
  targetAmount: string
  initialAmount: string
  monthlyContribution: string
}

function ProtectionForm({
  onClose,
  currentTarget,
  currentInitial,
  currentMonthly,
  suggestedTargets,
  onSave,
  isSaving,
  essentialMonthly,
}: {
  onClose: () => void
  currentTarget: number
  currentInitial: number
  currentMonthly: number | null
  suggestedTargets: { m3: number; m6: number; m12: number } | null
  onSave: (v: ProtectionFormValues) => Promise<void>
  isSaving: boolean
  essentialMonthly: number
}) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProtectionFormValues>({
    defaultValues: {
      targetAmount: currentTarget > 0 ? String(currentTarget) : '',
      initialAmount: currentInitial > 0 ? String(currentInitial) : '',
      monthlyContribution: currentMonthly != null ? String(currentMonthly) : '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-5">
      {/* Sugestões de meta */}
      {suggestedTargets && essentialMonthly > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-app-soft">
            Baseado nos seus gastos essenciais (<strong>{formatCurrency(essentialMonthly)}/mês</strong>):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { label: '3 meses', sub: 'Básico', value: suggestedTargets.m3 },
              { label: '6 meses', sub: 'Ideal', value: suggestedTargets.m6 },
              { label: '12 meses', sub: 'Completo', value: suggestedTargets.m12 },
            ]).map(({ label, sub, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setValue('targetAmount', String(value))}
                className="rounded-[8px] px-2 py-2.5 text-center transition-all"
                style={{
                  background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent-blue) 30%, transparent)',
                }}
              >
                <p className="text-xs font-bold" style={{ color: 'var(--accent-blue)' }}>{label}</p>
                <p className="text-[10px] text-app-soft">{sub}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-app">{formatCurrency(value)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-app-base">Quanto quero ter guardado (R$)</Label>
        <Input
          type="text" inputMode="decimal" placeholder="Ex: 15.000"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: errors.targetAmount ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('targetAmount', {
            validate: (v) => !v || (!isNaN(parseFloat(v.replace(',','.'))) && parseFloat(v.replace(',','.')) >= 0) || 'Valor inválido'
          })}
        />
        {errors.targetAmount && <p className="text-xs text-[#f87171]">{errors.targetAmount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Quanto já tenho guardado hoje (R$)</Label>
        <Input
          type="text" inputMode="decimal" placeholder="Ex: 2.000"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('initialAmount')}
        />
        <p className="text-xs text-app-soft">Dinheiro que você já tem guardado antes de usar o SAOOZ.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Quanto consigo guardar por mês (R$) — opcional</Label>
        <Input
          type="text" inputMode="decimal" placeholder="Ex: 500"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('monthlyContribution')}
        />
        <p className="text-xs text-app-soft">Usado para estimar quando você vai atingir a meta.</p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
        <Button type="submit" disabled={isSaving} className="flex-1 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

// ── Modal: guardar / usar dinheiro ────────────────────────────────────────────

interface MoneyFormValues {
  action: 'guardar' | 'usar'
  amount: string
  reason: string
  date: string
}

function MoneyForm({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void
  onSave: (v: MoneyFormValues) => Promise<void>
  isSaving: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MoneyFormValues>({
    defaultValues: { action: 'guardar', amount: '', reason: '', date: today },
  })
  const action = watch('action')

  const REASONS_GUARDAR = ['Depósito mensal', 'Transferência extra', 'Bônus / 13º', 'Outro']
  const REASONS_USAR = ['Saúde / médico', 'Carro', 'Casa / reforma', 'Eletrodoméstico', 'Desemprego', 'Outro imprevisto']
  const reasons = action === 'guardar' ? REASONS_GUARDAR : REASONS_USAR

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      {/* Toggle guardar / usar */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-[10px]" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
        {(['guardar', 'usar'] as const).map((opt) => {
          const isSelected = action === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValue('action', opt)}
              className="flex items-center justify-center gap-2 rounded-[8px] py-2.5 text-sm font-semibold transition-all"
              style={{
                background: isSelected ? (opt === 'guardar' ? 'color-mix(in oklab, #22c55e 15%, transparent)' : 'color-mix(in oklab, #f59e0b 15%, transparent)') : 'transparent',
                border: isSelected ? `1px solid ${opt === 'guardar' ? 'color-mix(in oklab, #22c55e 40%, transparent)' : 'color-mix(in oklab, #f59e0b 40%, transparent)'}` : '1px solid transparent',
                color: isSelected ? (opt === 'guardar' ? '#22c55e' : '#f59e0b') : 'var(--text-soft)',
              }}
            >
              {opt === 'guardar' ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
              {opt === 'guardar' ? 'Guardei dinheiro' : 'Usei a reserva'}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Valor (R$)</Label>
        <Input
          type="text" inputMode="decimal" placeholder="0,00"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: errors.amount ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('amount', {
            required: 'Informe o valor',
            validate: (v) => { const n = parseFloat(v.replace(',','.')); return (!isNaN(n) && n > 0) || 'Valor inválido' }
          })}
        />
        {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Motivo</Label>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue('reason', r)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-all"
              style={{
                background: watch('reason') === r ? 'color-mix(in oklab, var(--accent-blue) 15%, transparent)' : 'var(--panel-bg-soft)',
                border: `1px solid ${watch('reason') === r ? 'color-mix(in oklab, var(--accent-blue) 40%, transparent)' : 'var(--panel-border)'}`,
                color: watch('reason') === r ? 'var(--accent-blue)' : 'var(--text-soft)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <Input
          placeholder="Ou descreva aqui..."
          className="rounded-[8px] mt-2"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('reason')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Data</Label>
        <Input type="date" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('date')} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
        <Button type="submit" disabled={isSaving} className="flex-1 rounded-[8px] text-white" style={{ background: action === 'guardar' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : action === 'guardar' ? 'Registrar depósito' : 'Registrar uso'}
        </Button>
      </div>
    </form>
  )
}

// ── Histórico simplificado ────────────────────────────────────────────────────

function HistoryList({ movements, onDelete }: {
  movements: Array<{
    id: string
    entryType: 'aporte' | 'resgate' | 'ajuste'
    description: string | null
    signedAmount: number
    happenedOn: string
  }>
  onDelete: (id: string) => Promise<void>
}) {
  const [deleting, setDeleting] = useState<string | null>(null)

  if (!movements.length) return (
    <p className="py-4 text-center text-sm text-app-soft">Nenhum registro neste mês.</p>
  )

  async function handleDelete(id: string) {
    if (!confirm('Remover este registro?')) return
    setDeleting(id)
    await onDelete(id)
    setDeleting(null)
  }

  return (
    <div className="space-y-2">
      {movements.map((mv) => {
        const isIn = mv.signedAmount >= 0
        return (
          <div key={mv.id} className="flex items-center gap-3 rounded-[10px] px-4 py-3" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
              style={{ background: isIn ? 'color-mix(in oklab, #22c55e 15%, transparent)' : 'color-mix(in oklab, #f59e0b 15%, transparent)' }}
            >
              {isIn ? '↑' : '↓'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-app">
                {mv.description || (isIn ? 'Depósito' : 'Uso da reserva')}
              </p>
              <p className="text-xs text-app-soft">
                {new Date(`${mv.happenedOn}T00:00:00`).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <p className="font-bold tabular-nums text-sm shrink-0" style={{ color: isIn ? '#22c55e' : '#f59e0b' }}>
              {isIn ? '+' : ''}{formatCurrency(mv.signedAmount)}
            </p>
            <button
              onClick={() => handleDelete(mv.id)}
              disabled={deleting === mv.id}
              className="ml-1 shrink-0 rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors"
              aria-label="Remover"
            >
              {deleting === mv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ReservaEmergenciaPFPage() {
  const [protectionModalOpen, setProtectionModalOpen] = useState(false)
  const [moneyModalOpen, setMoneyModalOpen] = useState(false)

  const {
    reserve,
    metrics,
    suggestedTargets,
    movements,
    isLoading,
    isSavingTarget,
    isSavingMovement,
    error,
    refresh,
    updateTarget,
    addMovement,
  } = useReserveData({ scope: 'personal' })

  async function handleDeleteMovement(id: string) {
    const { error: err } = await createClient()
      .from('financial_reserve_entries')
      .delete()
      .eq('id', id)
    if (err) { toast.error('Erro ao remover'); return }
    await refresh()
    toast.success('Registro removido')
  }

  async function handleSaveProtection(values: ProtectionFormValues) {
    const parse = (v: string) => { const n = parseFloat(v.replace(',','.')); return isNaN(n) ? undefined : n }
    try {
      await updateTarget({
        targetAmount: parse(values.targetAmount),
        initialAmount: parse(values.initialAmount),
        monthlyTargetContribution: values.monthlyContribution ? parse(values.monthlyContribution) ?? null : null,
      })
      toast.success('Proteção atualizada!')
      setProtectionModalOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar', { description: err instanceof Error ? err.message : 'Tente novamente.' })
    }
  }

  async function handleSaveMoney(values: MoneyFormValues) {
    const amount = parseFloat(values.amount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return
    try {
      await addMovement({
        entryType: values.action === 'guardar' ? 'aporte' : 'resgate',
        amount,
        happenedOn: values.date || undefined,
        description: values.reason.trim() || null,
      })
      toast.success(values.action === 'guardar' ? 'Dinheiro guardado! 💪' : 'Uso registrado.')
      setMoneyModalOpen(false)
    } catch (err) {
      toast.error('Erro', { description: err instanceof Error ? err.message : 'Tente novamente.' })
    }
  }

  const coverageInfo = metrics ? getCoverageInfo(metrics.coverageMonths) : null
  const pct = metrics && metrics.targetAmount > 0
    ? Math.min(100, (metrics.reserveCurrentAmount / metrics.targetAmount) * 100)
    : 0
  const monthsToGoal = metrics?.projectedMonthsToTarget

  return (
    <div className="mx-auto max-w-lg pb-24 md:pb-0">

      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Reserva de Emergência</h1>
          <p className="mt-1 text-sm text-app-soft">Sua proteção para o imprevisto</p>
        </div>
        <button onClick={() => setProtectionModalOpen(true)} className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)', color: 'var(--text-base)' }}>
          <Settings2 className="h-3.5 w-3.5" />
          Ajustar meta
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[10px] p-4 text-sm" style={{ background: 'color-mix(in oklab, #f87171 10%, transparent)', border: '1px solid color-mix(in oklab, #f87171 30%, transparent)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {!isLoading && !error && metrics && (
        <div className="space-y-5">

          {/* ── Card de status principal ── */}
          <div
            className="rounded-[16px] p-5"
            style={{ background: coverageInfo ? coverageInfo.bg : 'var(--panel-bg)', border: `1px solid ${coverageInfo ? coverageInfo.border : 'var(--panel-border)'}` }}
          >
            {!reserve ? (
              /* Estado vazio: nunca configurou */
              <div className="text-center py-2">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 opacity-30 text-app" />
                <p className="font-semibold text-app">Você ainda não tem reserva configurada</p>
                <p className="mt-1 text-sm text-app-soft">
                  Defina uma meta e comece a guardar dinheiro para emergências.
                </p>
                <Button
                  onClick={() => setProtectionModalOpen(true)}
                  className="mt-4 rounded-[10px] text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
                >
                  Configurar minha proteção
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: coverageInfo?.color }}>
                      {coverageInfo?.emoji} {coverageInfo?.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-app">
                      {formatCurrency(metrics.reserveCurrentAmount)}
                    </p>
                    <p className="text-sm text-app-soft">guardados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-app-soft">Cobertura atual</p>
                    <p className="text-2xl font-bold" style={{ color: coverageInfo?.color }}>
                      {metrics.coverageMonths.toFixed(1)}
                    </p>
                    <p className="text-xs text-app-soft">meses</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mb-3">
                  <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'color-mix(in oklab, var(--panel-border) 60%, transparent)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: coverageInfo?.color }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-app-soft">
                    <span>{pct.toFixed(0)}% da meta</span>
                    <span>Meta: {formatCurrency(metrics.targetAmount)}</span>
                  </div>
                </div>

                {/* Falta / projeção */}
                {metrics.remainingToTarget > 0 && (
                  <div className="flex items-center justify-between rounded-[8px] px-3 py-2 text-sm" style={{ background: 'color-mix(in oklab, var(--panel-bg) 60%, transparent)' }}>
                    <span className="text-app-soft">Falta</span>
                    <span className="font-semibold text-app">{formatCurrency(metrics.remainingToTarget)}</span>
                    {monthsToGoal !== null && monthsToGoal !== undefined && monthsToGoal > 0 && (
                      <>
                        <ChevronRight className="h-3.5 w-3.5 text-app-soft" />
                        <span className="text-app-soft">em ~{monthsToGoal} meses</span>
                      </>
                    )}
                  </div>
                )}

                {metrics.remainingToTarget === 0 && (
                  <div className="rounded-[8px] px-3 py-2 text-center text-sm font-semibold" style={{ background: 'color-mix(in oklab, #22c55e 15%, transparent)', color: '#22c55e' }}>
                    🎉 Meta atingida! Você está bem protegido.
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Botão de ação principal ── */}
          {reserve && (
            <Button
              onClick={() => setMoneyModalOpen(true)}
              className="w-full rounded-[12px] py-5 text-base font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Guardar dinheiro / registrar uso
            </Button>
          )}

          {/* ── O que a reserva te protege ── */}
          <div>
            <p className="mb-3 px-1 text-sm font-semibold text-app">O que a reserva te protege</p>
            <div className="grid grid-cols-3 gap-2">
              {EMERGENCY_CATEGORIES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-[12px] p-3 text-center"
                  style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                  <p className="text-xs font-semibold text-app">{label}</p>
                  <p className="text-[10px] leading-tight text-app-soft">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Informações do mês ── */}
          {metrics.essentialMonthlyAverage > 0 && (
            <div className="panel-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-app-soft">Seus gastos essenciais</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-app">Média mensal (moradia, alimentação, saúde, transporte)</p>
                <p className="font-bold text-app tabular-nums">{formatCurrency(metrics.essentialMonthlyAverage)}</p>
              </div>
              {metrics.monthlyContributionUsed > 0 && (
                <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-sm text-app">Guardando por mês</p>
                  <p className="font-bold tabular-nums" style={{ color: '#22c55e' }}>{formatCurrency(metrics.monthlyContributionUsed)}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Histórico do mês ── */}
          {reserve && (
            <div>
              <p className="mb-3 px-1 text-sm font-semibold text-app">Registros recentes</p>
              <HistoryList movements={movements} onDelete={handleDeleteMovement} />
            </div>
          )}

        </div>
      )}

      {/* ── Modais ── */}
      <Modal open={protectionModalOpen} onClose={() => setProtectionModalOpen(false)} title="Configurar minha proteção" description="Defina quanto você quer ter guardado e quanto já tem.">
        <ProtectionForm
          onClose={() => setProtectionModalOpen(false)}
          currentTarget={reserve?.targetAmount ?? 0}
          currentInitial={reserve?.initialAmount ?? 0}
          currentMonthly={reserve?.monthlyTargetContribution ?? null}
          suggestedTargets={suggestedTargets}
          essentialMonthly={metrics?.essentialMonthlyAverage ?? 0}
          onSave={handleSaveProtection}
          isSaving={isSavingTarget}
        />
      </Modal>

      <Modal open={moneyModalOpen} onClose={() => setMoneyModalOpen(false)} title="Movimentar reserva" description="Registre quando guardar ou precisar usar o dinheiro.">
        <MoneyForm
          onClose={() => setMoneyModalOpen(false)}
          onSave={handleSaveMoney}
          isSaving={isSavingMovement}
        />
      </Modal>
    </div>
  )
}
