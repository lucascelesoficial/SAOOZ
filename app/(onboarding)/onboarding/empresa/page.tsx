import { redirect } from 'next/navigation'
import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import { createClient } from '@/lib/supabase/server'
import { OnboardingEmpresaClient } from './OnboardingEmpresaClient'

interface OnboardingEmpresaPageProps {
  searchParams?: {
    businessId?: string | string[]
  }
}

export default async function OnboardingEmpresaPage({
  searchParams,
}: OnboardingEmpresaPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snapshot = await getBillingSnapshot(user.id)
  const access = getBillingAccess(snapshot)

  const businessIdParam = searchParams?.businessId
  const businessId =
    typeof businessIdParam === 'string' ? businessIdParam : businessIdParam?.[0] ?? null

  if (!businessId) {
    if (!access.businessModule || !access.canCreateBusiness) {
      redirect(getUpgradeHref('business'))
    }

    const { count, error } = await supabase
      .from('business_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (!error && (count ?? 0) >= access.maxBusinessAccounts) {
      redirect(getUpgradeHref('business_limit'))
    }
  }

  return <OnboardingEmpresaClient businessId={businessId} />
}
