import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getBillingSnapshot } from '@/lib/billing/server'
import { PlanoClient } from './PlanoClient'
import type { SubscriptionPlanType } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{ feature?: string }>
}

async function PlanoPageContent({ searchParams }: PageProps) {
  const { feature } = await searchParams

  // Fetch billing state — anonymous or new users get null (show default trial CTA)
  let currentPlanType: SubscriptionPlanType | null = null
  let isInTrial = false
  let isPaid = false
  let trialDaysRemaining = 0

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const snapshot = await getBillingSnapshot(user.id)
      // Only mark as "has active sub" if there is a real Stripe subscription
      // (gateway set) or a paid/trial access — ignore default fake rows (gateway=null)
      // that ensureSubscription() creates for every dashboard visitor.
      const hasRealSub = !!snapshot.subscription.gateway
      if (hasRealSub || snapshot.paidAccess || snapshot.trialAccess) {
        currentPlanType = snapshot.subscription.plan_type as SubscriptionPlanType
        isInTrial = snapshot.trialAccess
        isPaid = snapshot.paidAccess
        trialDaysRemaining = snapshot.trialDaysRemaining
      }
    }
  } catch {
    // Fail open — show the default "start trial" view
  }

  return (
    <PlanoClient
      currentPlanType={currentPlanType}
      isInTrial={isInTrial}
      isPaid={isPaid}
      trialDaysRemaining={trialDaysRemaining}
      feature={feature ?? null}
    />
  )
}

export default function OnboardingPlanoPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="fixed inset-0" style={{ background: '#06080f' }} />}>
      <PlanoPageContent {...props} />
    </Suspense>
  )
}
