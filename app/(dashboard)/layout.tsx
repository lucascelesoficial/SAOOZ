import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBillingAccess } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import {
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Topbar } from '@/components/layout/Topbar'
import { FinancialDataProvider } from '@/lib/context/FinancialDataContext'

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

  const [snapshot, { data: profileData }, { data: businesses }] = await Promise.all([
    getBillingSnapshot(user.id),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('business_profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const billingAccess = getBillingAccess(snapshot)
  const businessCount = businesses?.length ?? 0
  const businessLimitReached =
    billingAccess.businessModule &&
    billingAccess.maxBusinessAccounts > 0 &&
    businessCount >= billingAccess.maxBusinessAccounts
  const canCreateBusiness = billingAccess.canCreateBusiness && !businessLimitReached

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
          snapshot.subscription.status === 'active'
            ? snapshot.subscription.plan_type.toUpperCase()
            : snapshot.trialDaysRemaining > 0
              ? 'TRIAL'
              : 'GRATIS'
        }
        planStatusLabel={
          snapshot.subscription.status === 'active'
            ? 'Ativo'
            : snapshot.trialDaysRemaining > 0
              ? `${snapshot.trialDaysRemaining} dia(s)`
              : 'Sem assinatura'
        }
        canAccessPersonalModule={billingAccess.personalModule}
        canAccessBusinessModule={billingAccess.businessModule}
      />
      <div className="flex min-w-0 flex-1 flex-col md:ml-[240px]">
        <Topbar
          profile={profile}
          businesses={businesses ?? []}
          canAccessPersonalModule={billingAccess.personalModule}
          canAccessBusinessModule={billingAccess.businessModule}
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
