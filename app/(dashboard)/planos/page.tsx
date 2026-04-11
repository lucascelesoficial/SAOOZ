import { redirect } from 'next/navigation'
import { getBillingSnapshot } from '@/lib/billing/server'
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

  const snapshot = await getBillingSnapshot(user.id)

  return <PlanosClient snapshot={snapshot} />
}
