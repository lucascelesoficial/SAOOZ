import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { createClient } from '@/lib/supabase/server'
import { OnboardingEmpresaClient } from './OnboardingEmpresaClient'

export const metadata: Metadata = { title: 'Cadastro da Empresa' }

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

  const businessIdParam = searchParams?.businessId
  const businessId =
    typeof businessIdParam === 'string' ? businessIdParam : businessIdParam?.[0] ?? null

  const { count } = await supabase
    .from('business_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const policy = await resolveUserAccessPolicy(user.id, {
    businessCount: count ?? 0,
  })

  if (!businessId) {
    if (!policy.modules.business || !policy.canCreateBusiness) {
      const limitBlock = getPolicyBlock(policy, 'business_limit_reached')
      const lockBlock = getPolicyBlock(policy, 'business_module_locked')
      redirect(limitBlock?.upgradeHref ?? lockBlock?.upgradeHref ?? '/planos?feature=business')
    }
  }

  return <OnboardingEmpresaClient businessId={businessId} />
}
