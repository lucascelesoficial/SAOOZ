'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowUpCircle,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Crown,
  Layers3,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { StepUpDialog } from '@/components/security/StepUpDialog'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  BILLING_DURATIONS,
  PLAN_CATALOG,
  getBusinessAccountLimit,
  getDurationLabel,
  getPlanPriceForDuration,
} from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'
import type { BillingSnapshot } from '@/lib/billing/server'
import type { SubscriptionPlanType } from '@/types/database.types'

interface PlanosClientProps {
  snapshot: BillingSnapshot
  /** true when Cakto env vars are configured — shows PIX payment button */
  caktoEnabled?: boolean
}

function usageMessage(label: string, used: number, limit: number | null) {
  if (limit === null) {
    return `${label}: ilimitado`
  }

  return `${label}: ${used}/${limit}`
}

function formatCycleTotal(totalPrice: number, duration: BillingDuration) {
  if (duration === 1) {
    return `total ${formatCurrency(totalPrice)} no ciclo mensal`
  }

  return `total ${formatCurrency(totalPrice)} em ${getDurationLabel(duration)}`
}

function formatStatus(status: BillingSnapshot['subscription']['status']) {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'trialing') {
    return 'Trial'
  }

  if (status === 'past_due') {
    return 'Pagamento pendente'
  }

  if (status === 'canceled') {
    return 'Cancelado'
  }

  if (status === 'expired') {
    return 'Expirado'
  }

  return 'Inativo'
}

function businessCapacityLabel(plan: SubscriptionPlanType, duration: BillingDuration) {
  const limit = getBusinessAccountLimit(plan, duration)

  if (plan === 'pf') {
    return 'Sem acesso a contas empresariais'
  }

  if (plan === 'pro') {
    return `PF + até ${limit} conta(s) empresarial(is)`
  }

  return `Até ${limit} conta(s) empresarial(is)`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return null
  }
}

export function PlanosClient({ snapshot }: PlanosClientProps) {
  // Default to the user's current billing duration so the active plan card is visible immediately
  const [duration, setDuration] = useState<BillingDuration>(
    (snapshot.subscription.billing_duration_months ?? 6) as BillingDuration
  )
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelStepUpOpen, setCancelStepUpOpen] = useState(false)
  const [localCancelScheduled, setLocalCancelScheduled] = useState(
    snapshot.subscription.cancel_at_period_end
  )
  const [upgradePreview, setUpgradePreview] = useState<{
    currentPlanName: string
    newPlan: string
    newPlanName: string
    duration: BillingDuration
    credit: number
    immediateCharge: number
    nextBillingAmount: number
    nextBillingDate: string | null
  } | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const searchParams = useSearchParams()

  // Trial detection — must be before any logic that references isInTrial
  const trialEndsAt = snapshot.subscription.trial_ends_at
  const isInTrial = !!(trialEndsAt && new Date(trialEndsAt) > new Date())

  // Plan rank for upgrade eligibility
  const PLAN_RANK: Record<string, number> = { pf: 0, pj: 1, pro: 2 }
  const currentRank = PLAN_RANK[snapshot.subscription.plan_type] ?? -1
  const currentSubDuration = (snapshot.subscription.billing_duration_months ?? 1) as BillingDuration
  const hasActiveSub = snapshot.paidAccess || isInTrial

  /**
   * A card is the "active" plan only when plan type AND the currently
   * selected duration BOTH match the user's actual subscription.
   */
  function isActivePlan(planCode: SubscriptionPlanType) {
    return (
      hasActiveSub &&
      snapshot.subscription.plan_type === planCode &&
      duration === currentSubDuration
    )
  }

  /**
   * An option is an upgrade when:
   * - Higher plan tier (pro > pj > pf), OR
   * - Same plan tier but longer duration (better value)
   */
  function isAnUpgrade(planCode: SubscriptionPlanType) {
    if (!hasActiveSub || localCancelScheduled) return false
    const rank = PLAN_RANK[planCode] ?? -1
    if (rank > currentRank) return true
    if (rank === currentRank && duration > currentSubDuration) return true
    return false
  }

  // Paid users: in-app proration upgrade (higher tier OR same tier longer duration)
  function canUpgrade(planCode: SubscriptionPlanType) {
    if (!snapshot.paidAccess || localCancelScheduled) return false
    const rank = PLAN_RANK[planCode] ?? -1
    if (rank > currentRank) return true
    if (rank === currentRank && duration > currentSubDuration) return true
    return false
  }

  // Trial users: checkout a higher plan or longer duration (no new trial)
  function canTrialUpgrade(planCode: SubscriptionPlanType) {
    return (
      isInTrial &&
      !snapshot.paidAccess &&
      !localCancelScheduled &&
      isAnUpgrade(planCode)
    )
  }

  async function handleUpgradePreview(planCode: SubscriptionPlanType) {
    setUpgrading(true)
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planCode, duration, preview: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Erro ao calcular upgrade', { description: data.error ?? 'Tente novamente.' })
        return
      }
      setUpgradePreview(data)
    } catch {
      toast.error('Erro ao calcular upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  async function handleUpgradeConfirm() {
    if (!upgradePreview) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: upgradePreview.newPlan, duration: upgradePreview.duration, preview: false }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Erro ao fazer upgrade', { description: data.error ?? 'Tente novamente.' })
        return
      }
      toast.success(`Upgrade para ${data.newPlanName} realizado!`, {
        description: 'Seu plano foi atualizado e o desconto aplicado.',
      })
      setUpgradePreview(null)
      // Refresh page to reflect new plan
      window.location.reload()
    } catch {
      toast.error('Erro ao fazer upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  // Date to show when canceling
  const cancelExpiryDate = isInTrial
    ? formatDate(trialEndsAt ?? null)
    : formatDate(snapshot.subscription.current_period_end)

  async function handleCancelSubscription() {
    if (!cancelConfirm) {
      setCancelConfirm(true)
      return
    }
    setCanceling(true)
    setCancelConfirm(false)
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Erro ao cancelar', { description: data.error })
        return
      }
      setLocalCancelScheduled(true)
      toast.success('Cancelamento agendado', {
        description: isInTrial
          ? 'Seu acesso continua ativo até o fim do período de trial gratuito.'
          : 'Seu acesso continua até o fim do período atual.',
      })
    } catch {
      toast.error('Erro ao cancelar assinatura')
    } finally {
      setCanceling(false)
    }
  }

  async function handleCheckout(planCode: SubscriptionPlanType, method: 'pix' | 'card' = 'pix') {
    setCheckingOut(`${planCode}-${method}`)
    try {
      const res = await fetch('/api/billing/cakto/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planCode, duration, paymentMethod: method }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Erro ao iniciar checkout', { description: data.error ?? 'Tente novamente.' })
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      toast.error('Erro ao iniciar checkout')
    } finally {
      setCheckingOut(null)
    }
  }

  const featurePrompt = useMemo(() => {
    const feature = searchParams.get('feature')

    if (feature === 'business') {
      return 'Seu plano atual não libera o módulo empresarial. Escolha um plano com acesso PJ para continuar.'
    }

    if (feature === 'personal') {
      return 'Seu plano atual não libera o módulo pessoal. Escolha um plano com acesso PF para continuar.'
    }

    if (feature === 'advanced') {
      return 'Os recursos avançados de inteligência ficam liberados no plano PRO.'
    }

    if (feature === 'business_limit') {
      return 'Você atingiu o limite de contas empresariais do seu plano atual. Faça upgrade para ampliar a operação.'
    }

    return null
  }, [searchParams])

  const urgencyMessage = useMemo(() => {
    if (snapshot.trialDaysRemaining > 0 && snapshot.trialDaysRemaining <= 3) {
      return `Seu trial termina em ${snapshot.trialDaysRemaining} dia(s).`
    }

    if (
      snapshot.aiActionsLimit !== null &&
      snapshot.usage.ai_actions_used / snapshot.aiActionsLimit >= 0.8
    ) {
      return 'Você está próximo do limite mensal de ações de IA.'
    }

    return null
  }, [snapshot.aiActionsLimit, snapshot.trialDaysRemaining, snapshot.usage.ai_actions_used])

  return (
    <>
    {/* ── Upgrade confirmation modal ─────────────────────────────────────── */}
    {upgradePreview && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.72)' }}
        onClick={() => !upgrading && setUpgradePreview(null)}
      >
        <div
          className="w-full max-w-md rounded-[16px] border p-6"
          style={{ background: '#0e1017', borderColor: '#1e293b' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: 'color-mix(in oklab, var(--accent-blue) 15%, transparent)' }}
            >
              <ArrowUpCircle className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-app">
                Upgrade {upgradePreview.currentPlanName} → {upgradePreview.newPlanName}
              </h3>
              <p className="text-xs text-app-soft">Desconto proporcional aplicado automaticamente</p>
            </div>
          </div>

          {/* Proration breakdown */}
          <div
            className="mb-4 space-y-2 rounded-[12px] border p-4"
            style={{ borderColor: '#1e293b', background: '#060c18' }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-app-soft">Crédito do plano atual</span>
              <span className="font-semibold text-[#4ade80]">
                − {formatCurrency(upgradePreview.credit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-app-soft">Plano {upgradePreview.newPlanName} (proporcional)</span>
              <span className="font-semibold text-app">
                {formatCurrency(upgradePreview.immediateCharge + upgradePreview.credit)}
              </span>
            </div>
            <div
              className="flex justify-between border-t pt-2 text-sm font-bold"
              style={{ borderColor: '#1e293b' }}
            >
              <span className="text-app">Cobrança agora</span>
              <span style={{ color: 'var(--accent-blue)' }}>
                {formatCurrency(upgradePreview.immediateCharge)}
              </span>
            </div>
          </div>

          <p className="mb-5 text-xs text-app-soft">
            A partir do próximo ciclo, você pagará{' '}
            <strong className="text-app">{formatCurrency(upgradePreview.nextBillingAmount)}</strong>{' '}
            {upgradePreview.nextBillingDate
              ? `(renovação em ${formatDate(upgradePreview.nextBillingDate)})`
              : 'por ciclo'}.
            O upgrade é imediato — acesso ao plano {upgradePreview.newPlanName} liberado agora.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setUpgradePreview(null)}
              disabled={upgrading}
              className="flex-1 rounded-[10px] border py-2.5 text-sm font-medium text-app-base transition-colors hover:text-app disabled:opacity-50"
              style={{ borderColor: '#1e293b' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpgradeConfirm}
              disabled={upgrading}
              className="flex-1 rounded-[10px] py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              {upgrading ? 'Processando...' : `Confirmar upgrade`}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="panel-card overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h1 className="text-2xl font-bold text-app">Planos</h1>
            <p className="mt-2 max-w-2xl text-sm text-app-soft">
              Escolha o plano ideal para sua operacao financeira: PF, PJ ou estrutura completa no PRO.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {BILLING_DURATIONS.map((item) => (
                <button
                  key={item}
                  onClick={() => setDuration(item)}
                  className="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                  style={
                    duration === item
                      ? {
                          background: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                          borderColor: 'var(--accent-blue)',
                          color: 'var(--accent-blue)',
                        }
                      : {
                          borderColor: 'var(--panel-border)',
                          color: 'var(--text-soft)',
                        }
                  }
                >
                  {getDurationLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="panel-card p-4">
              <p className="text-xs uppercase tracking-wider text-app-soft">Status atual</p>
              <p className="mt-2 text-lg font-bold text-app">{formatStatus(snapshot.subscription.status)}</p>
              <p className="mt-1 text-xs text-app-soft">
                Plano: {snapshot.subscription.plan_type.toUpperCase()}
              </p>
              {snapshot.subscription.current_period_end && (
                <p className="mt-1 text-xs text-app-soft">
                  Próx. cobrança: {formatDate(snapshot.subscription.current_period_end)}
                </p>
              )}
              {localCancelScheduled && (
                <div
                  className="mt-2 flex items-center gap-1 rounded-[6px] px-2 py-1 text-[10px] font-semibold"
                  style={{
                    background: 'color-mix(in oklab, #f87171 12%, transparent)',
                    color: '#f87171',
                  }}
                >
                  <XCircle className="h-3 w-3 shrink-0" />
                  Cancelamento agendado
                </div>
              )}
            </div>
            <div className="panel-card p-4">
              <p className="text-xs uppercase tracking-wider text-app-soft">Trial</p>
              <p className="mt-2 text-lg font-bold text-app">{snapshot.trialDaysRemaining} dia(s)</p>
              <p className="mt-1 text-xs text-app-soft">
                {snapshot.trialDaysRemaining > 0 ? 'Acesso completo com limite de uso.' : 'Trial encerrado.'}
              </p>
            </div>
            <div className="panel-card p-4">
              <p className="text-xs uppercase tracking-wider text-app-soft">Uso atual</p>
              <p className="mt-2 text-sm font-semibold text-app">
                {usageMessage('IA', snapshot.usage.ai_actions_used, snapshot.aiActionsLimit)}
              </p>
              <p className="mt-1 text-xs text-app-soft">
                {usageMessage('Transações', snapshot.usage.transactions_used, snapshot.transactionsLimit)}
              </p>
            </div>
          </div>
        </div>

        {urgencyMessage && (
          <div
            className="mt-5 rounded-[12px] border px-4 py-3 text-sm"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 25%, transparent)',
              background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
              color: 'var(--text-strong)',
            }}
          >
            {urgencyMessage}
          </div>
        )}
      </section>

      {featurePrompt && (
        <section
          className="rounded-[14px] border px-4 py-4 text-sm text-app"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent-blue) 30%, transparent)',
            background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
          }}
        >
          {featurePrompt}
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(PLAN_CATALOG) as SubscriptionPlanType[]).map((planCode) => {
          const plan = PLAN_CATALOG[planCode]
          const pricing = getPlanPriceForDuration(planCode, duration)
          const isActiveCurrentPlan = isActivePlan(planCode)

          return (
            <article
              key={plan.code}
              className="panel-card relative overflow-hidden p-5"
              style={
                isActiveCurrentPlan
                  ? {
                      borderColor: isInTrial
                        ? 'color-mix(in oklab, #f59e0b 50%, transparent)'
                        : 'color-mix(in oklab, #22c55e 50%, transparent)',
                      boxShadow: isInTrial
                        ? '0 8px 32px color-mix(in oklab, #f59e0b 10%, transparent)'
                        : '0 8px 32px color-mix(in oklab, #22c55e 10%, transparent)',
                    }
                  : plan.highlight
                    ? {
                        borderColor: 'color-mix(in oklab, var(--accent-blue) 45%, transparent)',
                        boxShadow: '0 12px 40px color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                      }
                    : {}
              }
            >
              {/* Current plan badge */}
              {isActiveCurrentPlan && (
                <div
                  className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                  style={{
                    background: isInTrial
                      ? 'color-mix(in oklab, #f59e0b 18%, transparent)'
                      : 'color-mix(in oklab, #22c55e 18%, transparent)',
                    color: isInTrial ? '#f59e0b' : '#22c55e',
                  }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {isInTrial ? 'Trial ativo' : 'Plano ativo'}
                </div>
              )}

              {/* Recommended badge — don't show if this is also the current plan */}
              {plan.highlight && !isActiveCurrentPlan && (
                <div
                  className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                  style={{
                    background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                    color: 'var(--accent-blue)',
                  }}
                >
                  <Crown className="h-3.5 w-3.5" />
                  Recomendado
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold text-app-soft">{plan.name}</p>
                <div className="mt-1 flex items-end gap-1.5">
                  <h2 className="text-2xl font-bold text-app">{formatCurrency(pricing.effectiveMonthly)}</h2>
                  <span className="mb-0.5 text-sm text-app-soft">/mes</span>
                </div>
                {pricing.discount > 0 ? (
                  <p className="mt-1 text-xs text-app-soft">
                    <span className="line-through">{formatCurrency(plan.priceMonthly)}/mes</span>
                    {' · '}
                    <span className="font-medium text-[#22c55e]">
                      {Math.round(pricing.discount * 100)}% de economia
                    </span>
                    {' · '}
                    {formatCycleTotal(pricing.totalPrice, duration)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-app-soft">{formatCycleTotal(pricing.totalPrice, duration)}</p>
                )}
              </div>

              <p className="mb-4 text-sm text-app-soft">{plan.description}</p>

              <div className="mb-4 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-app">
                    <BadgeCheck className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="rounded-[12px] border px-3 py-3" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs uppercase tracking-wider text-app-soft">IA e acesso</p>
                <p className="mt-1 text-sm font-semibold text-app">
                  {plan.aiActionsLimit === null ? 'Uso ilimitado' : `${plan.aiActionsLimit} ações/mês`}
                </p>
                <p className="mt-2 text-xs text-app-soft">
                  {plan.supportsPersonal ? 'Módulo PF incluso' : 'Módulo PF não incluso'} -{' '}
                  {plan.supportsBusiness ? 'Módulo PJ incluso' : 'Módulo PJ não incluso'}
                </p>
                <p className="mt-1 text-xs text-app-soft">{businessCapacityLabel(planCode, duration)}</p>
              </div>

              <div className="mt-5 space-y-2">
                {/* ── Active plan indicator ──────────────────────────────── */}
                {isActiveCurrentPlan && (
                  <div
                    className="flex items-center justify-center gap-2 rounded-[10px] border py-2 text-sm font-semibold"
                    style={{
                      borderColor: isInTrial
                        ? 'color-mix(in oklab, #f59e0b 40%, transparent)'
                        : 'color-mix(in oklab, #22c55e 40%, transparent)',
                      background: isInTrial
                        ? 'color-mix(in oklab, #f59e0b 10%, transparent)'
                        : 'color-mix(in oklab, #22c55e 10%, transparent)',
                      color: isInTrial ? '#f59e0b' : '#22c55e',
                    }}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {isInTrial
                      ? `Trial ativo — ${snapshot.trialDaysRemaining} dia(s) restante(s)`
                      : 'Plano ativo'}
                  </div>
                )}

                {/* ── Action button ──────────────────────────────────────── */}
                {canUpgrade(planCode) ? (
                  // Paid user, higher tier → in-app proration upgrade
                  <button
                    onClick={() => handleUpgradePreview(planCode)}
                    disabled={upgrading}
                    className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
                  >
                    <ArrowUpCircle className="mr-1.5 h-4 w-4" />
                    {upgrading ? 'Calculando...' : `Fazer upgrade para ${plan.name}`}
                  </button>
                ) : canTrialUpgrade(planCode) ? (
                  // Trial user, higher tier or longer duration → new checkout via Cakto (no new trial)
                  <button
                    onClick={() => handleCheckout(planCode, 'pix')}
                    disabled={!!checkingOut}
                    className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
                  >
                    <ArrowUpCircle className="mr-1.5 h-4 w-4" />
                    {checkingOut === `${planCode}-pix` ? 'Aguarde...' : `Fazer upgrade para ${plan.name}`}
                  </button>
                ) : !isActiveCurrentPlan ? (
                  // No active sub, or same plan at different duration → Cakto checkout
                  <button
                    onClick={() => handleCheckout(planCode, 'pix')}
                    disabled={!!checkingOut}
                    className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{
                      background: plan.highlight
                        ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                        : 'linear-gradient(135deg, #334155, #1e293b)',
                    }}
                  >
                    <CreditCard className="mr-1.5 h-4 w-4" />
                    {checkingOut === `${planCode}-pix` ? 'Aguarde...' : 'Assinar agora'}
                  </button>
                ) : null}

                {/* Cancel subscription (only on current active/paid plan) */}
              </div>
            </article>
          )
        })}
      </section>

      <section className="panel-card p-5">
        <h2 className="text-base font-semibold text-app">Capacidade operacional por ciclo</h2>
        <p className="mt-1 text-sm text-app-soft">
          Diferença real dos planos para contas empresariais e operação PF/PJ.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--panel-border)' }}>
                <th className="px-2 py-2 font-semibold text-app-soft">Ciclo</th>
                <th className="px-2 py-2 font-semibold text-app-soft">PF</th>
                <th className="px-2 py-2 font-semibold text-app-soft">PJ</th>
                <th className="px-2 py-2 font-semibold text-app-soft">PRO</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_DURATIONS.map((item) => (
                <tr
                  key={item}
                  className="border-b last:border-b-0"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <td className="px-2 py-2 text-app">{getDurationLabel(item)}</td>
                  <td className="px-2 py-2 text-app-soft">Sem PJ</td>
                  <td className="px-2 py-2 text-app">
                    {getBusinessAccountLimit('pj', item)} conta(s) empresariais
                  </td>
                  <td className="px-2 py-2 text-app">
                    PF + {getBusinessAccountLimit('pro', item)} conta(s) empresariais
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-app">
            <CreditCard className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            Como funciona
          </h2>
          <div className="mt-4 space-y-3 text-sm text-app-soft">
            <p>Pagamento seguro via cartão de crédito, processado pelo Stripe.</p>
            <p>Seus dados são criptografados e nunca armazenados em nossos servidores.</p>
            <p>Plano ativado automaticamente após confirmação do pagamento.</p>
          </div>
        </div>

        <div className="panel-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-app">
            <Layers3 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            Resumo de ativação
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
              <p className="text-xs uppercase tracking-wider text-app-soft">Método</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                <CreditCard className="h-4 w-4" />
                Cartão de crédito
              </p>
              <p className="mt-1 text-xs text-app-soft">Processado com segurança via Stripe</p>
            </div>
            <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
              <p className="text-xs uppercase tracking-wider text-app-soft">Ciclo</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                <CalendarClock className="h-4 w-4" />
                Trial de 7 dias
              </p>
              <p className="mt-1 text-sm text-app-soft">
                No plano gratuito: 20 transações e 5 ações de IA por mês.
              </p>
            </div>
          </div>
        </div>
      </section>

      {(snapshot.paidAccess || snapshot.trialAccess || isInTrial) && !localCancelScheduled && (
        <section
          className="panel-card p-5"
          style={{
            borderColor: 'color-mix(in oklab, #f87171 20%, transparent)',
          }}
        >
          <h2 className="flex items-center gap-2 text-base font-semibold text-app">
            <AlertTriangle className="h-4 w-4 text-[#f87171]" />
            Cancelar {isInTrial ? 'trial' : 'assinatura'}
          </h2>
          <p className="mt-2 text-sm text-app-soft">
            {isInTrial
              ? `Ao cancelar, seu acesso continuará ativo somente até o fim do período de trial gratuito.${cancelExpiryDate ? ` Seu trial expira em ${cancelExpiryDate}.` : ''}`
              : `Ao cancelar, seu acesso continuará ativo até o fim do período atual já pago.${cancelExpiryDate ? ` Sua assinatura expira em ${cancelExpiryDate}.` : ''}`}
          </p>

          <StepUpDialog
            open={cancelStepUpOpen}
            onClose={() => setCancelStepUpOpen(false)}
            onConfirmed={() => {
              setCancelStepUpOpen(false)
              setCancelConfirm(true)
            }}
            title="Confirme sua identidade"
            description="Para cancelar sua assinatura, confirme sua senha antes de continuar."
            confirmVariant="warning"
          />

          {cancelConfirm ? (
            <div className="mt-4 space-y-3">
              <p
                className="rounded-[8px] border px-3 py-2 text-sm"
                style={{
                  borderColor: 'color-mix(in oklab, #f87171 30%, transparent)',
                  background: 'color-mix(in oklab, #f87171 8%, transparent)',
                  color: '#f87171',
                }}
              >
                {isInTrial
                  ? 'Tem certeza? Seu acesso será encerrado ao fim dos 7 dias de trial gratuito.'
                  : 'Tem certeza? Esta ação agendará o cancelamento ao fim do período vigente.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="flex-1 rounded-[8px] border px-3 py-2 text-sm text-app-base transition-colors hover:text-app"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  Manter assinatura
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  className="flex-1 rounded-[8px] px-3 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: '#dc2626' }}
                >
                  {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCancelStepUpOpen(true)}
              className="mt-4 rounded-[8px] border px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: 'color-mix(in oklab, #f87171 30%, transparent)',
                color: '#f87171',
              }}
            >
              Cancelar assinatura
            </button>
          )}
        </section>
      )}

      {localCancelScheduled && (snapshot.paidAccess || snapshot.trialAccess || isInTrial) && (
        <section
          className="panel-card p-5"
          style={{
            borderColor: 'color-mix(in oklab, #f87171 20%, transparent)',
          }}
        >
          <h2 className="flex items-center gap-2 text-base font-semibold text-app">
            <XCircle className="h-4 w-4 text-[#f87171]" />
            Cancelamento agendado
          </h2>
          <p className="mt-2 text-sm text-app-soft">
            {isInTrial
              ? `Seu trial permanece ativo até o fim do período gratuito${cancelExpiryDate ? ` (${cancelExpiryDate})` : ''}.`
              : `Seu acesso permanece ativo até o fim do período atual${cancelExpiryDate ? ` (${cancelExpiryDate})` : ''}.`}
            {' '}Para reativar, entre em contato com o suporte ou adquira um novo plano.
          </p>
        </section>
      )}
    </div>
    </>
  )
}
