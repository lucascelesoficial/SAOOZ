'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Shield, Building2, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { PLAN_CATALOG, TRIAL_DAYS } from '@/lib/billing/plans'

const PLAN_DISPLAY = [
  {
    code: 'pf' as const,
    icon: Shield,
    color: '#3b82f6',
    features: ['Controle financeiro pessoal', 'Reserva de emergência', 'Investimentos e metas'],
  },
  {
    code: 'pj' as const,
    icon: Building2,
    color: '#0ea5e9',
    features: ['Gestão empresarial completa', 'Impostos e pró-labore', 'Faturamento e despesas'],
  },
  {
    code: 'pro' as const,
    icon: Layers,
    color: '#22c55e',
    features: ['PF + PJ no mesmo lugar', 'IA ilimitada', 'Múltiplas empresas'],
  },
]

export default function OnboardingPlanoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSelect(planType: 'pf' | 'pj' | 'pro') {
    setLoading(planType)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, duration: 1, paymentMethod: 'card', trialDays: TRIAL_DAYS }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? 'Falha ao iniciar checkout.')
      }
      window.location.href = data.checkoutUrl
    } catch (err) {
      toast.error('Erro ao iniciar plano', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      })
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Escolha seu plano</h1>
        <p className="text-sm" style={{ color: '#6B6B6B' }}>
          {TRIAL_DAYS} dias grátis · Cancele quando quiser · Sem cobranças agora
        </p>
      </div>

      {/* Plan cards */}
      <div className="space-y-3">
        {PLAN_DISPLAY.map(({ code, icon: Icon, color, features }) => {
          const plan = PLAN_CATALOG[code]
          const isLoading = loading === code
          return (
            <div
              key={code}
              className="rounded-[14px] p-5 space-y-4"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white">{plan.name}</p>
                    <p className="text-xs truncate" style={{ color: '#6B6B6B' }}>
                      {plan.description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white">
                    R$ {plan.priceMonthly}
                    <span className="text-xs font-normal" style={{ color: '#6B6B6B' }}>/mês</span>
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#B3B3B3' }}>
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(code)}
                disabled={!!loading}
                className="w-full h-10 rounded-[10px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Começar ${TRIAL_DAYS} dias grátis`
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Skip */}
      <p className="text-center text-xs" style={{ color: '#4A4A4A' }}>
        <button
          onClick={() => router.push('/onboarding')}
          className="transition-colors hover:text-[#6B6B6B]"
        >
          Continuar sem plano →
        </button>
      </p>
    </div>
  )
}
