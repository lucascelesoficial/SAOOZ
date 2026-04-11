'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Crown,
  Layers3,
  QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
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

export function PlanosClient({ snapshot }: PlanosClientProps) {
  const [duration, setDuration] = useState<BillingDuration>(6)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const searchParams = useSearchParams()

  async function handleCheckout(planCode: SubscriptionPlanType, paymentMethod: 'pix' | 'card') {
    setCheckingOut(`${planCode}-${paymentMethod}`)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planCode, duration, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Erro ao iniciar checkout', { description: data.error })
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
                Plano atual: {snapshot.subscription.plan_type.toUpperCase()}
              </p>
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
          const isCurrentPlan = snapshot.subscription.plan_type === planCode

          return (
            <article
              key={plan.code}
              className="panel-card relative overflow-hidden p-5"
              style={
                plan.highlight
                  ? {
                      borderColor: 'color-mix(in oklab, var(--accent-blue) 45%, transparent)',
                      boxShadow: '0 12px 40px color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                    }
                  : {}
              }
            >
              {plan.highlight && (
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

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCheckout(planCode, 'pix')}
                  disabled={(isCurrentPlan && snapshot.paidAccess) || !!checkingOut}
                  className="flex h-11 items-center justify-center rounded-[10px] text-sm font-semibold transition-all disabled:opacity-60"
                  style={{
                    background: 'var(--panel-bg-soft)',
                    border: '1.5px solid var(--panel-border)',
                    color: 'var(--text-base)',
                  }}
                >
                  <QrCode className="mr-1.5 h-4 w-4" />
                  PIX
                </button>
                <button
                  onClick={() => handleCheckout(planCode, 'card')}
                  disabled={(isCurrentPlan && snapshot.paidAccess) || !!checkingOut}
                  className="flex h-11 items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{
                    background: plan.highlight
                      ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                      : 'linear-gradient(135deg, #334155, #1e293b)',
                  }}
                >
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  {isCurrentPlan && snapshot.paidAccess ? 'Ativo' : 'Cartão'}
                </button>
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
            <p>Cartão: pagamento registrado, assinatura ativada e renovação automática no vencimento.</p>
            <p>PIX: cobrança imediata, plano ativado após confirmação do pagamento.</p>
            <p>Cada ativação passa por confirmação de pagamento antes da liberação final.</p>
          </div>
        </div>

        <div className="panel-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-app">
            <Layers3 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
            Resumo de ativação
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
              <p className="text-xs uppercase tracking-wider text-app-soft">Métodos</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                <CreditCard className="h-4 w-4" />
                Cartao
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-app">
                <QrCode className="h-4 w-4" />
                PIX
              </p>
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
    </div>
  )
}
