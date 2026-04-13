'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, CalendarDays, Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MAX_ATTEMPTS = 10
const POLL_MS = 2000

interface SubInfo {
  planName: string
  trialEnd: string | null
}

export default function TrialAtivoPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'polling' | 'ready'>('polling')
  const [info, setInfo] = useState<SubInfo>({ planName: '', trialEnd: null })
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
      .select('status, current_period_end, plan_type')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .maybeSingle()

    if (sub) {
      const planLabels: Record<string, string> = { pf: 'PF', pj: 'PJ', pro: 'PRO' }
      const trialEnd = sub.current_period_end
        ? new Date(sub.current_period_end).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : null

      setInfo({
        planName: planLabels[sub.plan_type as string] ?? (sub.plan_type as string)?.toUpperCase() ?? '',
        trialEnd,
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
        // Webhook may still be processing — show ready state anyway.
        // The middleware + dashboard will handle the subscription guard.
        if (mounted) setPhase('ready')
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [check])

  if (phase === 'polling') {
    return (
      <div className="panel-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
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
    )
  }

  return (
    <div className="panel-card rounded-2xl p-8 space-y-7">
      {/* Icon */}
      <div className="flex justify-center">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in oklab, #22c55e 14%, transparent)',
            border: '1px solid color-mix(in oklab, #22c55e 30%, transparent)',
          }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: '#22c55e' }} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-app">Trial ativado!</h1>
        <p className="text-sm text-app-soft">
          Você tem 7 dias gratuitos para explorar o SAOOZ
          {info.planName ? ` no plano ${info.planName}` : ''}.
        </p>
      </div>

      {/* Info blocks */}
      <div className="grid gap-3">
        <div
          className="rounded-[12px] border p-4 flex items-start gap-3"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <CalendarDays className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-blue)' }} />
          <div>
            <p className="text-xs uppercase tracking-wider text-app-soft mb-0.5">Período gratuito</p>
            <p className="text-sm font-semibold text-app">7 dias a partir de hoje</p>
            {info.trialEnd && (
              <p className="text-xs text-app-soft mt-0.5">Termina em {info.trialEnd}</p>
            )}
          </div>
        </div>

        <div
          className="rounded-[12px] border p-4 flex items-start gap-3"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <Shield className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#22c55e' }} />
          <div>
            <p className="text-xs uppercase tracking-wider text-app-soft mb-0.5">Cobrança</p>
            <p className="text-sm font-semibold text-app">Somente após o período de teste</p>
            <p className="text-xs text-app-soft mt-0.5">
              Cancele antes{info.trialEnd ? ` de ${info.trialEnd}` : ''} e não paga nada.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/onboarding')}
        className="w-full h-12 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          boxShadow: '0 4px 20px color-mix(in oklab, var(--accent-blue) 25%, transparent)',
        }}
      >
        Configurar minha conta
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="text-center text-xs text-app-soft">
        Você pode cancelar a qualquer momento nas configurações da conta.
      </p>
    </div>
  )
}
