import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { redirect } from 'next/navigation'
import { resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Topbar } from '@/components/layout/Topbar'
import { SidebarOffset } from '@/components/layout/SidebarOffset'
import { SidebarProvider } from '@/lib/context/SidebarContext'
import { FinancialDataProvider } from '@/lib/context/FinancialDataContext'
import { SessionTimeoutGuard } from '@/components/security/SessionTimeoutGuard'
import { OnboardingGateProvider } from '@/components/onboarding/OnboardingGateProvider'

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

  const [{ data: profileData }, { data: ownedBusinesses }, { data: teamMemberships }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('business_profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    // Fetch business IDs this user is a team member of (not owner).
    // Used when the user was invited and has no businesses of their own.
    supabase
      .from('business_team_members')
      .select('business_id')
      .eq('member_user_id', user.id)
      .eq('status', 'active'),
  ])

  // If team member has no owned business, resolve business names separately.
  const memberBusinessIds = (teamMemberships ?? []).map(m => m.business_id)
  let teamBusinesses: { id: string; name: string }[] = []
  if (memberBusinessIds.length > 0 && (ownedBusinesses?.length ?? 0) === 0) {
    const { data: teamBizData } = await supabase
      .from('business_profiles')
      .select('id, name')
      .in('id', memberBusinessIds)
    teamBusinesses = teamBizData ?? []
  }

  const businesses = (ownedBusinesses?.length ?? 0) > 0
    ? ownedBusinesses
    : teamBusinesses

  const isTeamMemberOnly =
    !!(profileData as { is_team_member?: boolean } | null)?.is_team_member &&
    (ownedBusinesses?.length ?? 0) === 0

  const businessCount = ownedBusinesses?.length ?? 0
  const policy = await resolveUserAccessPolicy(user.id, { businessCount })
  const snapshot = policy.snapshot
  const businessLimitReached = policy.businessLimitReached
  const canCreateBusiness = policy.canCreateBusiness

  const isDev = process.env.NODE_ENV === 'development'

  // Em dev, garante profile mínimo para não quebrar componentes downstream
  type ProfileRow = Database['public']['Tables']['profiles']['Row']
  let profile: ProfileRow | null = profileData ?? (isDev ? {
    id: user.id,
    mode: 'pf' as const,
    name: 'Dev User',
    email: user.email ?? '',
    avatar_url: null,
    active_business_id: null,
    created_at: new Date().toISOString(),
    cpf: null,
    phone: null,
    birth_date: null,
    city: null,
    state: null,
    onboarding_completed_at: null,
  } as ProfileRow : null)

  // ── Layer 2 guard (middleware é layer 1) ──────────────────────────────────
  if (!profile?.mode) {
    if (isDev) {
      // em dev nunca chega aqui porque profile foi garantido acima,
      // mas TS precisa da narrowing
      redirect('/onboarding')
    }
    redirect('/onboarding')
  }

  // onboarding_completed_at check removed until migration 023 is applied.
  // profile.mode (checked above) is the gate for now.

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

  // ── Onboarding gate ────────────────────────────────────────────────────────
  // profile.onboarding_completed_at IS NULL means the user skipped cadastro.
  // We allow dashboard access but a persistent banner + mutation-blocking
  // modal will prompt them to finalize. Next step depends on mode:
  //   pf          → /onboarding/pf
  //   pj or both  → /onboarding/empresa
  //
  // IMPORTANT: when migration 023 hasn't been applied yet, the column doesn't
  // exist in the DB so select('*') returns the row WITHOUT the field (undefined,
  // not null). We must distinguish undefined (column absent) from null (column
  // exists but user skipped). Banner is only shown when the column is present
  // AND null — avoids showing it to every user before migration is applied.
  const rawCompleted = (profile as { onboarding_completed_at?: string | null })
    ?.onboarding_completed_at
  const onboardingRequired = rawCompleted !== undefined && rawCompleted === null

  const onboardingNext =
    profile.mode === 'pf' ? '/onboarding/pf' : '/onboarding/empresa'

  // Team members only have access to the PJ module of the business they were invited to.
  // Override the billing policy so the sidebar/topbar reflect that correctly.
  const effectiveModules = isTeamMemberOnly
    ? { personal: false, business: true }
    : policy.modules

  return (
    <SidebarProvider>
      <OnboardingGateProvider required={onboardingRequired} nextHref={onboardingNext}>
        <div
          className="app-shell flex min-h-screen"
          style={onboardingRequired ? { paddingTop: '42px' } : undefined}
        >
          <Sidebar
            profile={profile}
            planLabel={
              isTeamMemberOnly
                ? 'EQUIPE'
                : snapshot.paidAccess
                  ? snapshot.subscription.plan_type.toUpperCase()
                  : snapshot.trialDaysRemaining > 0
                    ? 'TRIAL'
                    : 'GRATIS'
            }
            planStatusLabel={isTeamMemberOnly ? 'Membro' : formatPlanStatusLabel(snapshot.lifecycleStatus, snapshot.trialDaysRemaining)}
            canAccessPersonalModule={effectiveModules.personal}
            canAccessBusinessModule={effectiveModules.business}
          />
          <SidebarOffset>
            <Topbar
              profile={profile}
              businesses={businesses ?? []}
              canAccessPersonalModule={effectiveModules.personal}
              canAccessBusinessModule={effectiveModules.business}
              canCreateBusiness={isTeamMemberOnly ? false : canCreateBusiness}
              businessLimitReached={isTeamMemberOnly ? true : businessLimitReached}
              isTrial={isTeamMemberOnly ? false : snapshot.trialAccess}
              planType={snapshot.subscription.plan_type as 'pf' | 'pj' | 'pro'}
            />
            <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
              <FinancialDataProvider userId={user.id}>
                {children}
              </FinancialDataProvider>
            </main>
            {/* Client island — fires idle logout after 30 min inactivity */}
            <SessionTimeoutGuard />
          </SidebarOffset>
          <BottomNav />
        </div>
      </OnboardingGateProvider>
    </SidebarProvider>
  )
}
