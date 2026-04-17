'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Shield,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { PLAN_CATALOG, TRIAL_DAYS } from '@/lib/billing/plans'
import type { SubscriptionPlanType } from '@/types/database.types'

const MAX_ATTEMPTS = 10
const POLL_MS = 2000

interface SubInfo {
  planType: SubscriptionPlanType | null
  planName: string
  trialEndLabel: string | null
  trialEndDays: number | null
}

// Map plan → mode + next onboarding step
const PLAN_TO_MODE: Record<SubscriptionPlanType, 'pf' | 'pj' | 'both'> = {
  pf: 'pf',
  pj: 'pj',
  pro: 'both',
}
const PLAN_TO_NEXT: Record<SubscriptionPlanType, string> = {
  pf: '/onboarding/pf',
  pj: '/onboarding/empresa',
  pro: '/onboarding/empresa',
}

export default function TrialAtivoPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'polling' | 'ready'>('polling')
  const [info, setInfo] = useState<SubInfo>({
    planType: null,
    planName: '',
    trialEndLabel: null,
    trialEndDays: null,
  })
  const [attempts, setAttempts] = useState(0)

  const check = useCallback(async (): Promise<boolean> => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return false
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at, plan_type')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .maybeSingle()

    if (sub) {
      const planLabels: Record<string, string> = { pf: 'PF', pj: 'PJ', pro: 'PRO' }
      const planType = sub.plan_type as SubscriptionPlanType

      // ── Trial end computation ─────────────────────────────────────────
      // Prefer DB trial_ends_at; fall back to now+TRIAL_DAYS for safety.
      const trialEndDate = sub.trial_ends_at
        ? new Date(sub.trial_ends_at)
        : new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

      const trialEndLabel = trialEndDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      const diffMs = trialEndDate.getTime() - Date.now()
      const trialEndDays = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))

      // ── Auto-set profile.mode from plan_type (skip mode picker step) ──
      if (planType && PLAN_TO_MODE[planType]) {
        await supabase
          .from('profiles')
          .update({ mode: PLAN_TO_MODE[planType] })
          .eq('id', user.id)
      }

      setInfo({
        planType,
        planName: planLabels[planType] ?? planType?.toUpperCase() ?? '',
        trialEndLabel,
        trialEndDays,
      })
      return true
    }

    return false
  }, [router])

  useEffect(() => {
    let mounted = true
    let count = 0

    async function run() {
      if (!mounted) return
      const found = await check()
      if (found) {
        if (mounted) setPhase('ready')
        return
      }
      count++
      setAttempts(count)
      if (count < MAX_ATTEMPTS) {
        setTimeout(run, POLL_MS)
      } else {
        if (mounted) setPhase('ready')
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [check])

  // ── Polling state ──────────────────────────────────────────────────────────
  if (phase === 'polling') {
    return (
      <div
        className="fixed inset-0 overflow-y-auto"
        style={{ zIndex: 100, background: 'var(--bg, #06080f)' }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5">
          <div className="mb-10">
            <SaoozWordmark size="lg" />
          </div>
          <div className="panel-card w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-app">Confirmando seu pagamento…</p>
              <p className="text-sm text-app-soft">Isso leva apenas alguns segundos.</p>
            </div>
            {attempts > 3 && (
              <p className="text-xs text-app-soft opacity-60">
                Aguardando confirmação do provedor de pagamento.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const plan = info.planType ? PLAN_CATALOG[info.planType] : null
  const nextHref = info.planType ? PLAN_TO_NEXT[info.planType] : '/onboarding'

  // ── Ready state ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 100, background: 'var(--bg, #06080f)' }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-12 pb-24">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <SaoozWordmark size="lg" />
        </div>

        {/* Success badge */}
        <div className="flex justify-center mb-6">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{
              background: 'color-mix(in oklab, #22c55e 12%, transparent)',
              border: '1px solid color-mix(in oklab, #22c55e 28%, transparent)',
              boxShadow: '0 0 40px color-mix(in oklab, #22c55e 10%, transparent)',
            }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: '#22c55e' }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold text-app">
            {info.trialEndDays ?? TRIAL_DAYS} dias grátis ativados!
          </h1>
          <p className="text-sm text-app-soft">
            Você tem acesso completo ao plano
            {info.planName ? <strong className="text-app"> {info.planName}</strong> : ''} por {info.trialEndDays ?? TRIAL_DAYS} dias.
            Explore tudo sem nenhuma cobrança agora.
          </p>
        </div>

        {/* Trial info blocks */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-[14px] border p-4"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 25%, transparent)',
              background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
            }}
          >
            <CalendarDays className="h-4 w-4 mb-2" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs uppercase tracking-wider text-app-soft mb-0.5">Período grátis</p>
            <p className="text-sm font-bold text-app">
              {info.trialEndDays !== null ? `${info.trialEndDays} dias` : `${TRIAL_DAYS} dias`} restantes
            </p>
            {info.trialEndLabel && (
              <p className="text-xs text-app-soft mt-0.5">Termina em {info.trialEndLabel}</p>
            )}
          </div>

          <div
            className="rounded-[14px] border p-4"
            style={{
              borderColor: 'color-mix(in oklab, #22c55e 25%, transparent)',
              background: 'color-mix(in oklab, #22c55e 6%, transparent)',
            }}
          >
            <Shield className="h-4 w-4 mb-2 text-green-400" />
            <p className="text-xs uppercase tracking-wider text-app-soft mb-0.5">Cobrança</p>
            <p className="text-sm font-bold text-app">Somente após o teste</p>
            <p className="text-xs text-app-soft mt-0.5">Cancele antes e não paga nada.</p>
          </div>
        </div>

        {/* What's included */}
        {plan && (
          <div className="panel-card rounded-[16px] p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-blue)' }} />
              <p className="text-sm font-semibold text-app">
                O que está incluso no plano {plan.name}
              </p>
            </div>
            <div className="space-y-2.5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-sm text-app-soft">
                  <BadgeCheck
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: 'var(--accent-blue)' }}
                  />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA — skip the generic /onboarding step and go straight to cadastro */}
        <button
          onClick={() => { window.location.href = nextHref }}
          className="w-full h-13 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            height: '52px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
            boxShadow: '0 4px 24px color-mix(in oklab, var(--accent-blue) 30%, transparent)',
          }}
        >
          {info.planType === 'pf' && 'Cadastrar meus dados pessoais'}
          {info.planType === 'pj' && 'Cadastrar minha empresa'}
          {info.planType === 'pro' && 'Cadastrar minha empresa'}
          {!info.planType && 'Continuar'}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-center text-xs text-app-soft">
          Você pode cancelar a qualquer momento nas configurações da conta.
        </p>
      </div>
    </div>
  )
}
