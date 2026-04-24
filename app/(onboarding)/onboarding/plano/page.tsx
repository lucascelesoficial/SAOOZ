import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBillingSnapshot } from '@/lib/billing/server'
import { PlanoClient } from './PlanoClient'
import type { SubscriptionPlanType } from '@/types/database.types'
import type { BillingDuration } from '@/lib/billing/plans'

export const metadata: Metadata = { title: 'Escolha seu Plano' }

interface PageProps {
  searchParams: Promise<{ feature?: string }>
}

async function PlanoPageContent({ searchParams }: PageProps) {
  const { feature } = await searchParams

  // ── Safety net: team members should never reach this page ─────────────────
  // If a user with active team memberships lands here (e.g. callback redirect
  // failed), detect it and set them up as team member before redirecting.
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user has active team memberships
      const { data: memberships } = await supabase
        .from('business_team_members')
        .select('business_id')
        .eq('member_user_id', user.id)
        .eq('status', 'active')
        .limit(1)

      if (memberships && memberships.length > 0) {
        // Ensure profile is set up as team member via admin client (bypasses RLS)
        try {
          const admin = createAdminClient()
          await admin.from('profiles').update({
            is_team_member: true,
            mode: 'both',
            active_business_id: memberships[0].business_id,
          } as never).eq('id', user.id)
        } catch { /* non-critical */ }

        redirect('/empresa')
      }

      // Also check for pending invites that weren't accepted yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pendingMemberships } = await (supabase as any)
        .rpc('accept_pending_team_invites') as {
          data: Array<{ business_id: string }> | null
        }

      if (pendingMemberships && pendingMemberships.length > 0) {
        try {
          const admin = createAdminClient()
          await admin.from('profiles').update({
            is_team_member: true,
            mode: 'both',
            active_business_id: pendingMemberships[0].business_id,
          } as never).eq('id', user.id)
        } catch { /* non-critical */ }

        redirect('/empresa')
      }
    }
  } catch (err) {
    // If redirect() throws (which is how Next.js redirect works), rethrow it
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
    // Otherwise fail open — show the plans page normally
  }

  // Fetch billing state — anonymous or new users get null (show default CTA)
  let currentPlanType: SubscriptionPlanType | null = null
  let currentDuration: BillingDuration = 1
  let isPaid = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const snapshot = await getBillingSnapshot(user.id)
      // Only consider real Stripe subscriptions (gateway set) — ignore default
      // fake rows (gateway=null) that ensureSubscription() creates for every visitor.
      const hasRealSub = !!snapshot.subscription.gateway
      if (hasRealSub || snapshot.paidAccess) {
        currentPlanType = snapshot.subscription.plan_type as SubscriptionPlanType
        currentDuration = (snapshot.subscription.billing_duration_months ?? 1) as BillingDuration
        isPaid = snapshot.paidAccess
      }
    }
  } catch {
    // Fail open — show the default "start" view
  }

  return (
    <PlanoClient
      currentPlanType={currentPlanType}
      currentDuration={currentDuration}
      isPaid={isPaid}
      feature={feature ?? null}
    />
  )
}

export default function OnboardingPlanoPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="force-light fixed inset-0" style={{ background: 'var(--app-bg, #FFFFFF)' }} />}>
      <PlanoPageContent {...props} />
    </Suspense>
  )
}
