import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    // RLS policy "team_member_self" only returns rows where member_user_id = auth.uid(),
    // so pending invites (member_user_id=null) are NOT returned here — handled below.
    supabase
      .from('business_team_members')
      .select('business_id')
      .eq('member_user_id', user.id)
      .eq('status', 'active'),
  ])

  // ── Accept pending invites ─────────────────────────────────────────────────
  // If no active memberships were found, the user may have a *pending* invite.
  // This happens when: (a) email confirmation is disabled so /auth/callback
  // never ran, or (b) the callback failed for any reason.
  //
  // Strategy — try two approaches in order:
  // 1. SECURITY DEFINER RPC (requires migration 028 to be applied in Supabase)
  // 2. Admin client direct query+update (works even without migration 028 RPC)
  let resolvedMemberships = teamMemberships ?? []
  if (resolvedMemberships.length === 0 && (ownedBusinesses?.length ?? 0) === 0) {
    // Approach 1: SECURITY DEFINER RPC
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: accepted } = await (supabase as any)
        .rpc('accept_pending_team_invites') as {
          data: Array<{ business_id: string }> | null
        }
      if (accepted && accepted.length > 0) {
        resolvedMemberships = accepted
      }
    } catch {
      // RPC not available — fall through to admin approach
    }

    // Approach 2: Admin client — bypasses RLS entirely, works for pending invites
    // (member_user_id=null) which the anon client cannot read.
    if (resolvedMemberships.length === 0 && user.email) {
      try {
        const admin = createAdminClient()
        const { data: pendingRow } = await admin
          .from('business_team_members')
          .select('id, business_id')
          .eq('member_email', user.email)
          .eq('status', 'pending')
          .limit(1)
          .maybeSingle()

        if (pendingRow) {
          // Accept the invite
          await admin
            .from('business_team_members')
            .update({
              member_user_id: user.id,
              status: 'active',
              accepted_at: new Date().toISOString(),
            })
            .eq('id', pendingRow.id)

          resolvedMemberships = [{ business_id: pendingRow.business_id }]

          // Update profile so future requests are fast (is_team_member flag)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await admin.from('profiles').update({
            is_team_member: true,
            mode: 'both',
            active_business_id: pendingRow.business_id,
          } as any).eq('id', user.id)
        }
      } catch {
        // Admin client failed — fail silently
      }
    }
  }

  // If team member has no owned business, resolve business names separately.
  const memberBusinessIds = resolvedMemberships.map(m => m.business_id)
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

  // A user is "team member only" when they have active (or just-accepted) team
  // memberships and no businesses of their own.
  const isTeamMemberOnly =
    (
      !!(profileData as { is_team_member?: boolean } | null)?.is_team_member ||
      resolvedMemberships.length > 0
    ) &&
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
  // Team members bypass the onboarding redirect: they have no subscription/mode
  // but are legitimately here via an owner's invitation.
  const isTeamMemberLayout = isTeamMemberOnly

  if (!profile && !isTeamMemberLayout) {
    redirect('/onboarding')
  }
  if (!profile?.mode && !isTeamMemberLayout) {
    redirect('/onboarding')
  }

  // Ensure team members always have a valid profile object so downstream
  // components don't receive null. Fall back to a minimal profile if needed.
  if (isTeamMemberLayout) {
    if (!profile) {
      profile = {
        id: user.id,
        mode: 'both' as const,
        name: user.email?.split('@')[0] ?? 'Membro',
        email: user.email ?? '',
        avatar_url: null,
        active_business_id: teamBusinesses[0]?.id ?? null,
        created_at: new Date().toISOString(),
        cpf: null,
        phone: null,
        birth_date: null,
        city: null,
        state: null,
        onboarding_completed_at: null,
      } as ProfileRow
    } else if (!profile.mode) {
      profile = { ...profile, mode: 'both' }
    }
  }

  // onboarding_completed_at check removed until migration 023 is applied.
  // profile.mode (checked above) is the gate for now.

  // profile is guaranteed non-null by the guards above (null → redirect or team member fallback)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (profile!.mode === 'pf' && (businesses?.length ?? 0) > 0) {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    profile!.mode === 'pf' ? '/onboarding/pf' : '/onboarding/empresa'

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
