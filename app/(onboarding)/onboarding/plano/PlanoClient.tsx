'use client'

import { useState } from 'react'
import {
  BadgeCheck, CalendarClock, CreditCard, Crown,
  Layers3, LogOut, ArrowUpCircle,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
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
import type { SubscriptionPlanType } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface PlanoClientProps {
  /** Current plan type if user already has a subscription */
  currentPlanType: SubscriptionPlanType | null
  /** true when there is an active paid subscription */
  isPaid: boolean
  /** The exact billing duration of the current subscription (1/3/6/12) */
  currentDuration: BillingDuration
  /** Context hint — e.g. "business" when coming from the business CTA */
  feature?: string | null
}

const PLAN_RANK: Record<string, number> = { pf: 0, pj: 1, pro: 2 }

export function PlanoClient({
  currentPlanType,
  isPaid,
  currentDuration,
  feature,
}: PlanoClientProps) {
  // Default duration selector to the user's current duration so the active
  // plan is highlighted immediately on open.
  const [duration, setDuration] = useState<BillingDuration>(currentDuration)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  const hasActiveSub = isPaid
  const currentRank = PLAN_RANK[currentPlanType ?? ''] ?? -1

  /**
   * A plan card is "active" only when BOTH plan type AND the currently
   * selected duration match the user's existing subscription exactly.
   * Viewing the same plan at a different duration is NOT "active" — it's
   * an upgrade (longer) or a regular checkout (shorter).
   */
  function isCurrentPlan(planCode: SubscriptionPlanType) {
    return currentPlanType === planCode && duration === currentDuration && hasActiveSub
  }

  /**
   * An option is an "upgrade" when:
   * - It is a strictly higher-tier plan (pj > pf, pro > pj), OR
   * - It is the same plan type but a longer duration (better value, higher commitment)
   */
  function isUpgrade(planCode: SubscriptionPlanType) {
    if (!hasActiveSub) return false
    const planRank = PLAN_RANK[planCode] ?? -1
    if (planRank > currentRank) return true                          // higher tier
    if (planRank === currentRank && duration > currentDuration) return true  // same tier, longer
    return false
  }

  // Button label and state
  function planCta(planCode: SubscriptionPlanType) {
    if (isCurrentPlan(planCode)) {
      return {
        label: 'Plano ativo',
        disabled: true,
        isActive: true,
      }
    }
    if (isUpgrade(planCode)) {
      return {
        label: `Fazer upgrade`,
        disabled: false,
        isUpgrade: true,
      }
    }
    return {
      label: hasActiveSub ? 'Assinar plano' : 'Começar agora',
      disabled: false,
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleCheckout(planCode: SubscriptionPlanType, paymentMethod: 'pix' | 'card' = 'pix') {
    setCheckingOut(`${planCode}-${paymentMethod}`)
    try {
      const res = await fetch('/api/billing/cakto/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          planType: planCode,
          duration,
          paymentMethod,
        }),
      })

      let data: { checkoutUrl?: string; error?: string } = {}
      try { data = await res.json() } catch { /* non-JSON */ }

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Sessão expirada', { description: 'Faça login novamente.' })
          setTimeout(() => { window.location.href = '/login?next=/onboarding/plano' }, 1200)
          return
        }
        toast.error('Erro ao iniciar checkout', { description: data.error ?? `HTTP ${res.status}` })
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error('Resposta inválida do servidor')
      }
    } catch (err) {
      toast.error('Erro de conexão', {
        description: err instanceof Error ? err.message : 'Verifique sua internet.',
      })
    } finally {
      setCheckingOut(null)
    }
  }

  const featurePrompt = feature === 'business'
    ? 'Para criar uma conta empresarial você precisa de um plano PJ ou PRO. Escolha abaixo e faça o upgrade.'
    : feature === 'business_limit'
      ? 'Você atingiu o limite de contas empresariais. Faça upgrade para ampliar a operação.'
      : null

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 100, background: 'var(--bg, #06080f)' }}
    >
      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-12 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1" />
          <SaoozWordmark size="lg" />
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'var(--text-soft)' }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Feature context prompt */}
        {featurePrompt && (
          <div
            className="rounded-[14px] border px-5 py-4 mb-6 text-sm text-app"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
              background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
            }}
          >
            {featurePrompt}
          </div>
        )}

        {/* Guarantee banner — only show when user has no active subscription */}
        {!hasActiveSub && (
          <div
            className="rounded-[14px] border px-5 py-4 mb-8 text-center"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 30%, transparent)',
              background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
            }}
          >
            <p className="text-sm font-semibold text-white mb-0.5">
              7 dias de garantia — ou seu dinheiro de volta
            </p>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
              Assine agora com total segurança. Se não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Sem burocracia.
            </p>
          </div>
        )}

        {/* Header + Duration */}
        <div className="panel-card overflow-hidden p-6 mb-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="text-2xl font-bold text-app">
                {feature === 'business'
                  ? 'Upgrade para módulo empresarial'
                  : 'Escolha seu plano'}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-app-soft">
                Controle suas finanças pessoais, empresariais ou os dois ao mesmo tempo.
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
                    {item === 6 && <span className="ml-1.5 text-[10px] font-bold text-green-400">-15%</span>}
                    {item === 12 && <span className="ml-1.5 text-[10px] font-bold text-green-400">-25%</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-card p-4 flex flex-col justify-center gap-1">
              <p className="text-xs uppercase tracking-wider text-app-soft">Por que o SAOOZ?</p>
              <ul className="mt-2 space-y-1.5 text-sm text-app-soft">
                {[
                  'Dashboard financeiro completo',
                  'IA para análise e recomendações',
                  'PF e PJ no mesmo lugar',
                  'Cancelamento a qualquer momento',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-blue)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          {(Object.keys(PLAN_CATALOG) as SubscriptionPlanType[]).map((planCode) => {
            const plan    = PLAN_CATALOG[planCode]
            const pricing = getPlanPriceForDuration(planCode, duration)
            const cta     = planCta(planCode)
            const active  = isCurrentPlan(planCode)
            const upgrade = isUpgrade(planCode)

            return (
              <article
                key={plan.code}
                className="panel-card relative overflow-hidden p-5"
                style={
                  active
                    ? {
                        borderColor: 'color-mix(in oklab, #22c55e 50%, transparent)',
                        boxShadow: '0 8px 32px color-mix(in oklab, #22c55e 10%, transparent)',
                      }
                    : plan.highlight && !active
                      ? {
                          borderColor: 'color-mix(in oklab, var(--accent-blue) 45%, transparent)',
                          boxShadow: '0 12px 40px color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                        }
                      : {}
                }
              >
                {/* Active plan badge */}
                {active && (
                  <div
                    className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                    style={{
                      background: 'color-mix(in oklab, #22c55e 18%, transparent)',
                      color: '#22c55e',
                    }}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Plano ativo
                  </div>
                )}

                {/* Recommended badge */}
                {plan.highlight && !active && (
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

                <div className={`mb-4 ${active || plan.highlight ? 'mt-7' : ''}`}>
                  <p className="text-sm font-semibold text-app-soft">{plan.name}</p>
                  <div className="mt-1 flex items-end gap-1.5">
                    <h2 className="text-2xl font-bold text-app">{formatCurrency(pricing.effectiveMonthly)}</h2>
                    <span className="mb-0.5 text-sm text-app-soft">/mês</span>
                  </div>
                  {pricing.discount > 0 ? (
                    <p className="mt-1 text-xs text-app-soft">
                      <span className="line-through">{formatCurrency(plan.priceMonthly)}/mês</span>
                      {' · '}
                      <span className="font-medium text-green-400">
                        {Math.round(pricing.discount * 100)}% de economia
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-app-soft">Cobrado mensalmente</p>
                  )}
                </div>

                <p className="mb-4 text-sm text-app-soft">{plan.description}</p>

                <div className="mb-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-app">
                      <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-blue)' }} />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="rounded-[12px] border px-3 py-3 mb-5" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs uppercase tracking-wider text-app-soft">IA e acesso</p>
                  <p className="mt-1 text-sm font-semibold text-app">
                    {plan.aiActionsLimit === null ? 'Uso ilimitado' : `${plan.aiActionsLimit} ações/mês`}
                  </p>
                  <p className="mt-1 text-xs text-app-soft">
                    {plan.supportsPersonal ? 'Módulo PF incluso' : 'Módulo PF não incluso'}{' · '}
                    {plan.supportsBusiness ? 'Módulo PJ incluso' : 'Módulo PJ não incluso'}
                  </p>
                  <p className="mt-1 text-xs text-app-soft">{businessCapacityLabel(planCode, duration)}</p>
                </div>

                {/* CTA button */}
                {cta.isActive ? (
                  <div
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold"
                    style={{
                      borderColor: 'color-mix(in oklab, #22c55e 40%, transparent)',
                      background: 'color-mix(in oklab, #22c55e 10%, transparent)',
                      color: '#22c55e',
                    }}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {cta.label}
                  </div>
                ) : (
                  <>
                    {/* PIX button */}
                    <button
                      onClick={() => handleCheckout(planCode, 'pix')}
                      disabled={!!checkingOut}
                      className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                      style={{
                        background: upgrade || plan.highlight
                          ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                          : 'linear-gradient(135deg, #334155, #1e293b)',
                      }}
                    >
                      {checkingOut === `${planCode}-pix` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>{upgrade ? <ArrowUpCircle className="mr-1.5 h-4 w-4" /> : null}{cta.label} — PIX</>
                      )}
                    </button>
                    {/* Card button */}
                    <button
                      onClick={() => handleCheckout(planCode, 'card')}
                      disabled={!!checkingOut}
                      className="flex h-10 w-full items-center justify-center rounded-[10px] text-sm font-medium text-white transition-all disabled:opacity-60 mt-2"
                      style={{ background: 'linear-gradient(135deg, #334155, #1e293b)' }}
                    >
                      {checkingOut === `${planCode}-card` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><CreditCard className="mr-1.5 h-4 w-4" />{cta.label} — Cartão</>
                      )}
                    </button>
                    {!hasActiveSub && (
                      <p className="text-center text-xs mt-2" style={{ color: 'var(--text-soft)' }}>7 dias de garantia — ou seu dinheiro de volta</p>
                    )}
                  </>
                )}
              </article>
            )
          })}
        </div>

        {/* Capacity table */}
        <div className="panel-card p-5 mb-6">
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
                  <tr key={item} className="border-b last:border-b-0" style={{ borderColor: 'var(--panel-border)' }}>
                    <td className="px-2 py-2 text-app">{getDurationLabel(item)}</td>
                    <td className="px-2 py-2 text-app-soft">Sem PJ</td>
                    <td className="px-2 py-2 text-app">{getBusinessAccountLimit('pj', item)} conta(s) empresariais</td>
                    <td className="px-2 py-2 text-app">PF + {getBusinessAccountLimit('pro', item)} conta(s) empresariais</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How it works */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-app">
              <CreditCard className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
              Como funciona
            </h2>
            <div className="mt-4 space-y-3 text-sm text-app-soft">
              <p>Pagamento seguro via cartão de crédito, processado pelo Stripe.</p>
              <p>Seus dados são criptografados e nunca armazenados nos nossos servidores.</p>
              <p>Plano ativado automaticamente após confirmação do pagamento.</p>
            </div>
          </div>

          <div className="panel-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-app">
              <Layers3 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
              {hasActiveSub ? 'Seu plano atual' : 'Garantia de 7 dias'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs uppercase tracking-wider text-app-soft">Método de pagamento</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                  <CreditCard className="h-4 w-4" /> Cartão de crédito
                </p>
                <p className="mt-1 text-xs text-app-soft">Processado com segurança via Stripe</p>
              </div>
              <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs uppercase tracking-wider text-app-soft">
                  {hasActiveSub ? 'Plano atual' : 'Garantia'}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                  <CalendarClock className="h-4 w-4" />
                  {isPaid
                    ? `${currentPlanType?.toUpperCase()} ativo`
                    : '7 dias de garantia'}
                </p>
                <p className="mt-1 text-sm text-app-soft">
                  {isPaid
                    ? 'Assinatura ativa com renovação automática.'
                    : 'Reembolso total nos primeiros 7 dias, sem perguntas.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function businessCapacityLabel(plan: SubscriptionPlanType, duration: BillingDuration) {
  const limit = getBusinessAccountLimit(plan, duration)
  if (plan === 'pf') return 'Sem acesso a contas empresariais'
  if (plan === 'pro') return `PF + até ${limit} conta(s) empresarial(is)`
  return `Até ${limit} conta(s) empresarial(is)`
}
