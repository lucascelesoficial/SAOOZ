'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SubscriptionPlanType, UserMode } from '@/types/database.types'

/**
 * /onboarding — automatic router after trial activation.
 *
 * Deriva o mode direto do plano assinado (sem pedir ao usuário):
 *   plan_type='pf'  → mode='pf'  → /onboarding/pf
 *   plan_type='pj'  → mode='pj'  → /onboarding/empresa
 *   plan_type='pro' → mode='both' → /onboarding/empresa
 *
 * Antes havia uma aba de escolha PF/PJ/Ambos aqui — removida por redundância,
 * já que o plano já carrega essa informação.
 */

const PLAN_TO_MODE: Record<SubscriptionPlanType, UserMode> = {
  pf: 'pf',
  pj: 'pj',
  pro: 'both',
}

const PLAN_TO_NEXT: Record<SubscriptionPlanType, string> = {
  pf: '/onboarding/pf',
  pj: '/onboarding/empresa',
  pro: '/onboarding/empresa',
}

const MODE_TO_NEXT: Record<UserMode, string> = {
  pf: '/onboarding/pf',
  pj: '/onboarding/empresa',
  both: '/onboarding/empresa',
}

export default function OnboardingRouterPage() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const [{ data: sub }, { data: profile }] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('status, plan_type')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .limit(1)
          .maybeSingle(),
        supabase
          .from('profiles')
          // Note: onboarding_completed_at intentionally omitted — explicit select of a
          // non-existent column causes PostgREST to return null for the entire row.
          // Migration 023 adds this column; once applied, the dashboard layout (select *)
          // will handle the fast-path check.
          .select('mode')
          .eq('id', user.id)
          .maybeSingle(),
      ])

      // No subscription → pick a plan first
      if (!sub) {
        router.replace('/onboarding/plano')
        return
      }

      // Derive mode from plan if needed, then route
      const planType = sub.plan_type as SubscriptionPlanType | null
      const derivedMode = planType ? PLAN_TO_MODE[planType] : null
      const finalMode = (profile?.mode as UserMode | null) ?? derivedMode

      // Save mode if missing
      if (!profile?.mode && derivedMode) {
        await supabase
          .from('profiles')
          .update({ mode: derivedMode })
          .eq('id', user.id)
      }

      const next = finalMode
        ? MODE_TO_NEXT[finalMode]
        : planType
          ? PLAN_TO_NEXT[planType]
          : '/onboarding/plano'

      window.location.href = next
    })()
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-white opacity-40" />
    </div>
  )
}
