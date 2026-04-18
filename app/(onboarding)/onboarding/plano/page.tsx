import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
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
    <Suspense fallback={<div className="fixed inset-0" style={{ background: '#06080f' }} />}>
      <PlanoPageContent {...props} />
    </Suspense>
  )
}
