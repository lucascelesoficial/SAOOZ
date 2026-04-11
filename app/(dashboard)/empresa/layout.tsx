import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  ACTIVE_BUSINESS_COOKIE,
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { BusinessDataProvider } from '@/lib/context/BusinessDataContext'
import { createClient } from '@/lib/supabase/server'

export default async function EmpresaLayout({
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

  const policy = await resolveUserAccessPolicy(user.id)
  const businessLock = getPolicyBlock(policy, 'business_module_locked')

  if (!policy.modules.business) {
    redirect(businessLock?.upgradeHref ?? '/planos?feature=business')
  }

  const [{ data: profile }, { data: businesses }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (!businesses?.length) {
    redirect('/onboarding/empresa')
  }

  const cookieStore = await cookies()
  const activeBusinessCookie = cookieStore.get(ACTIVE_BUSINESS_COOKIE)?.value ?? null
  const activeBusinessFromProfile =
    (profile as { active_business_id?: string | null } | null)?.active_business_id ?? null

  const activeBusinessId =
    businesses.find((business) => business.id === activeBusinessFromProfile)?.id ??
    businesses.find((business) => business.id === activeBusinessCookie)?.id ??
    businesses[0]?.id

  if (!activeBusinessId) {
    redirect('/onboarding/empresa')
  }

  const shouldPersistToProfile = activeBusinessFromProfile !== activeBusinessId

  if (shouldPersistToProfile) {
    const { error } = await supabase
      .from('profiles')
      .update({ active_business_id: activeBusinessId })
      .eq('id', user.id)

    if (error && !isMissingActiveBusinessColumnError(error.message)) {
      throw new Error(error.message)
    }
  }

  return <BusinessDataProvider businessId={activeBusinessId}>{children}</BusinessDataProvider>
}
