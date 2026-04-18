import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { resolveUserAccessPolicy } from '@/lib/billing/policy'
import { getBillingProvider } from '@/lib/billing/providers'
import { createClient } from '@/lib/supabase/server'
import { PlanosClient } from './PlanosClient'

export const metadata: Metadata = { title: 'Planos' }

export default async function PlanosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const policy = await resolveUserAccessPolicy(user.id)

  // Cakto is enabled only when all required env vars are present.
  // No API call is made here — isConfigured() is a pure env-var check.
  const caktoEnabled = getBillingProvider('cakto').isConfigured()

  return <PlanosClient snapshot={policy.snapshot} caktoEnabled={caktoEnabled} />
}
