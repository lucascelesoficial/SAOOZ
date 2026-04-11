import { redirect } from 'next/navigation'
import { resolveUserAccessPolicy } from '@/lib/billing/policy'
import { createClient } from '@/lib/supabase/server'
import { PlanosClient } from './PlanosClient'

export default async function PlanosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const policy = await resolveUserAccessPolicy(user.id)

  return <PlanosClient snapshot={policy.snapshot} />
}
