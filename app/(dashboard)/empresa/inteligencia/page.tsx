import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import { createClient } from '@/lib/supabase/server'
import { EmpresaInteligenciaClient } from './EmpresaInteligenciaClient'

export const metadata: Metadata = { title: 'Inteligência' }

export default async function EmpresaInteligenciaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snapshot = await getBillingSnapshot(user.id)
  const access = getBillingAccess(snapshot)

  if (!access.businessModule) {
    redirect(getUpgradeHref('business'))
  }

  return (
    <EmpresaInteligenciaClient advancedInsightsEnabled={access.advancedInsights} />
  )
}
