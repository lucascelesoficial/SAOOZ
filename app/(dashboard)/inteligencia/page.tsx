import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import { createClient } from '@/lib/supabase/server'
import { InteligenciaClient } from './InteligenciaClient'

export const metadata: Metadata = { title: 'Inteligência' }

export default async function InteligenciaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snapshot = await getBillingSnapshot(user.id)
  const access = getBillingAccess(snapshot)

  if (!access.personalModule) {
    redirect(getUpgradeHref('personal'))
  }

  return <InteligenciaClient advancedInsightsEnabled={access.advancedInsights} />
}
