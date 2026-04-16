'use client'

import { useState } from 'react'
import {
  BadgeCheck, CalendarClock, CreditCard, Crown,
  Layers3, LogOut,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  BILLING_DURATIONS,
  PLAN_CATALOG,
  TRIAL_DAYS,
  getBusinessAccountLimit,
  getDurationLabel,
  getPlanPriceForDuration,
} from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'
import type { SubscriptionPlanType } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPlanoPage() {
  const [duration, setDuration]   = useState<BillingDuration>(1)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleCheckout(planCode: SubscriptionPlanType) {
    setCheckingOut(`${planCode}-card`)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ planType: planCode, duration, paymentMethod: 'card', trialDays: TRIAL_DAYS }),
      })

      let data: { checkoutUrl?: string; error?: string } = {}
      try { data = await res.json() } catch { /* non-JSON response */ }

      if (!res.ok) {
        // Redirect to login on auth failure
        if (res.status === 401) {
          toast.error('Sessão expirada', { description: 'Faça login novamente.' })
          setTimeout(() => { window.location.href = '/login?next=/onboarding/plano' }, 1200)
          return
        }
        const description = data.error ?? `HTTP ${res.status} — tente novamente.`
        console.error('[checkout] error', res.status, data)
        toast.error('Erro ao iniciar checkout', { description })
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('[checkout] network error', err)
      toast.error('Erro de conexão', {
        description: err instanceof Error ? err.message : 'Verifique sua internet.',
      })
    } finally {
      setCheckingOut(null)
    }
  }

  return (
    /* Fixed overlay — escapes the onboarding layout max-w-lg */
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

        {/* ── Header row: logo + sair ── */}
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

        {/* ── Trial banner ── */}
        <div
          className="rounded-[14px] border px-5 py-4 mb-8 text-center"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent-blue) 30%, transparent)',
            background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-white mb-0.5">
            🚀 {TRIAL_DAYS} dias grátis — sem cobranças agora
          </p>
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
            Escolha seu plano, insira o cartão e acesse tudo sem pagar nada por {TRIAL_DAYS} dias. Cancele quando quiser.
          </p>
        </div>

        {/* ── Header + Duration ── */}
        <div className="panel-card overflow-hidden p-6 mb-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="text-2xl font-bold text-app">Escolha seu plano</h1>
              <p className="mt-2 max-w-xl text-sm text-app-soft">
                Controle suas finanças pessoais, empresariais ou os dois ao mesmo tempo. Selecione o período e o plano ideal para você.
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

        {/* ── Plan cards ── */}
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          {(Object.keys(PLAN_CATALOG) as SubscriptionPlanType[]).map((planCode) => {
            const plan    = PLAN_CATALOG[planCode]
            const pricing = getPlanPriceForDuration(planCode, duration)

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

                <button
                  onClick={() => handleCheckout(planCode)}
                  disabled={!!checkingOut}
                  className="flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{
                    background: plan.highlight
                      ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                      : 'linear-gradient(135deg, #334155, #1e293b)',
                  }}
                >
                  {checkingOut === `${planCode}-card`
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><CreditCard className="mr-1.5 h-4 w-4" /> Começar {TRIAL_DAYS} dias grátis</>
                  }
                </button>
              </article>
            )
          })}
        </div>

        {/* ── Capacity table ── */}
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

        {/* ── Como funciona ── */}
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
              Trial de {TRIAL_DAYS} dias
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
                <p className="text-xs uppercase tracking-wider text-app-soft">Sem cobrança</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-app">
                  <CalendarClock className="h-4 w-4" /> {TRIAL_DAYS} dias grátis
                </p>
                <p className="mt-1 text-sm text-app-soft">
                  Nenhuma cobrança durante o período de teste. Cancele antes e não paga nada.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helper ───────────────────────────────────────────────────────────────────

function businessCapacityLabel(plan: SubscriptionPlanType, duration: BillingDuration) {
  const limit = getBusinessAccountLimit(plan, duration)
  if (plan === 'pf') return 'Sem acesso a contas empresariais'
  if (plan === 'pro') return `PF + até ${limit} conta(s) empresarial(is)`
  return `Até ${limit} conta(s) empresarial(is)`
}
