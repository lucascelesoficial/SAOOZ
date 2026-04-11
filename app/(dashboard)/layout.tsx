import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Topbar } from '@/components/layout/Topbar'
import { FinancialDataProvider } from '@/lib/context/FinancialDataContext'

function formatPlanStatusLabel(
  lifecycleStatus: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'inactive',
  trialDaysRemaining: number
) {
  if (lifecycleStatus === 'active') {
    return 'Ativo'
  }

  if (lifecycleStatus === 'trialing') {
    return `${trialDaysRemaining} dia(s)`
  }

  if (lifecycleStatus === 'past_due') {
    return 'Pagamento pendente'
  }

  if (lifecycleStatus === 'canceled') {
    return 'Cancelado'
  }

  if (lifecycleStatus === 'expired') {
    return 'Expirado'
  }

  return 'Inativo'
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profileData }, { data: businesses }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('business_profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const businessCount = businesses?.length ?? 0
  const policy = await resolveUserAccessPolicy(user.id, { businessCount })
  const snapshot = policy.snapshot
  const businessLimitReached = policy.businessLimitReached
  const canCreateBusiness = policy.canCreateBusiness

  let profile = profileData

  if (!profile?.mode) {
    redirect('/onboarding')
  }

  if (profile.mode === 'pf' && (businesses?.length ?? 0) > 0) {
    const nextActiveBusinessId =
      (profile as { active_business_id?: string | null }).active_business_id ??
      businesses?.[0]?.id ??
      null
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        mode: 'both',
        active_business_id: nextActiveBusinessId,
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError && isMissingActiveBusinessColumnError(updateError.message)) {
      const { data: fallbackProfile } = await supabase
        .from('profiles')
        .update({
          mode: 'both',
        })
        .eq('id', user.id)
        .select('*')
        .single()

      if (fallbackProfile) {
        profile = fallbackProfile
      }
    } else if (updatedProfile) {
      profile = updatedProfile
    }
  }

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar
        profile={profile}
        planLabel={
          snapshot.paidAccess
            ? snapshot.subscription.plan_type.toUpperCase()
            : snapshot.trialDaysRemaining > 0
              ? 'TRIAL'
              : 'GRATIS'
        }
        planStatusLabel={formatPlanStatusLabel(snapshot.lifecycleStatus, snapshot.trialDaysRemaining)}
        canAccessPersonalModule={policy.modules.personal}
        canAccessBusinessModule={policy.modules.business}
      />
      <div className="flex min-w-0 flex-1 flex-col md:ml-[240px]">
        <Topbar
          profile={profile}
          businesses={businesses ?? []}
          canAccessPersonalModule={policy.modules.personal}
          canAccessBusinessModule={policy.modules.business}
          canCreateBusiness={canCreateBusiness}
          businessLimitReached={businessLimitReached}
        />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <FinancialDataProvider userId={user.id}>
            {children}
          </FinancialDataProvider>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
