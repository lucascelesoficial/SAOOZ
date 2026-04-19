import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BancosEmpresaClient from './BancosEmpresaClient'

export const metadata: Metadata = { title: 'Bancos da Empresa' }

export default async function BancosEmpresaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get the user's active business
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user.id)
    .single()

  const activeBusinessId = (profile as { active_business_id?: string | null } | null)?.active_business_id ?? null

  // Get all businesses for the selector
  const { data: businesses } = await supabase
    .from('business_profiles')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <BancosEmpresaClient
      activeBusinessId={activeBusinessId}
      businesses={businesses ?? []}
    />
  )
}
