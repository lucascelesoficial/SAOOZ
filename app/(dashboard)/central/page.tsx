import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Painel' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snapshot = await getBillingSnapshot(user.id)
  const access = getBillingAccess(snapshot)
  const { count: businessCount, error: businessCountError } = await supabase
    .from('business_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const resolvedBusinessCount = businessCountError ? 0 : businessCount ?? 0
  const businessLimitReached =
    access.businessModule &&
    access.maxBusinessAccounts > 0 &&
    resolvedBusinessCount >= access.maxBusinessAccounts
  const canCreateBusiness = access.canCreateBusiness && !businessLimitReached

  if (!access.personalModule) {
    redirect(getUpgradeHref('personal'))
  }

  return (
    <DashboardClient
      userId={user.id}
      canCreateBusiness={canCreateBusiness}
      businessLimitReached={businessLimitReached}
      isTrial={snapshot.trialAccess}
      planType={snapshot.subscription.plan_type as 'pf' | 'pj' | 'pro'}
    />
  )
}
