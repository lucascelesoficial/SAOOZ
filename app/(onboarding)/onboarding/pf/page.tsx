import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingPfClient } from './OnboardingPfClient'

/**
 * Server gate for /onboarding/pf
 * - User must be authenticated
 * - Must have an active/trialing subscription
 * - Mode must be 'pf' (if not, redirect to correct onboarding step)
 * - If already completed onboarding → skip to dashboard
 */
export default async function OnboardingPfPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: sub }, { data: profile }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('id, name, cpf, phone, city, state, mode, onboarding_completed_at')
      .eq('id', user.id)
      .single(),
  ])

  // No subscription → go select a plan
  if (!sub) redirect('/onboarding/plano')

  // No mode → go select mode
  if (!profile?.mode) redirect('/onboarding')

  // PJ/both should go through empresa setup
  if (profile.mode === 'pj' || profile.mode === 'both') redirect('/onboarding/empresa')

  // Already completed → go to dashboard
  if (profile.onboarding_completed_at) redirect('/central')

  return (
    <OnboardingPfClient
      initialName={profile?.name ?? ''}
      initialCpf={profile?.cpf ?? ''}
      initialPhone={profile?.phone ?? ''}
      initialCity={profile?.city ?? ''}
      initialState={profile?.state ?? ''}
    />
  )
}
