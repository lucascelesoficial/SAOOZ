import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTeamInviteEmail } from '@/lib/email/sender'

const isDev = process.env.NODE_ENV === 'development'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!isDev && sub?.plan_type !== 'pro') {
    return NextResponse.json({ error: 'Plano Comando necessário para gerenciar equipe' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user.id)
    .single()

  if (!profile?.active_business_id) return NextResponse.json({ members: [] })

  const { data: members } = await supabase
    .from('business_team_members')
    .select('*')
    .eq('business_id', profile.active_business_id)
    .eq('owner_user_id', user.id)
    .order('invited_at', { ascending: true })

  return NextResponse.json({ members: members ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, permissions } = await req.json() as { email: string; permissions?: Record<string, boolean> }
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!isDev && sub?.plan_type !== 'pro') {
    return NextResponse.json({ error: 'Plano Comando necessário para adicionar membros' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user.id)
    .single()

  if (!profile?.active_business_id) {
    return NextResponse.json({ error: 'Nenhuma empresa ativa' }, { status: 400 })
  }

  // Check limit (3 members)
  const { count } = await supabase
    .from('business_team_members')
    .select('id', { count: 'exact' })
    .eq('business_id', profile.active_business_id)
    .eq('owner_user_id', user.id)
    .neq('status', 'revoked')

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Limite de 3 membros atingido no plano Comando' }, { status: 400 })
  }

  if (email === user.email) {
    return NextResponse.json({ error: 'Você não pode se convidar' }, { status: 400 })
  }

  // Check if invited email already has an account
  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  const defaultPerms = permissions ?? {
    view: true,
    add_transactions: false,
    edit_transactions: false,
    delete_transactions: false,
    export_reports: false,
  }

  const { data: member, error } = await supabase
    .from('business_team_members')
    .upsert(
      {
        business_id:    profile.active_business_id,
        owner_user_id:  user.id,
        member_email:   email,
        member_user_id: memberProfile?.id ?? null,
        status:         memberProfile ? 'active' : 'pending',
        permissions:    defaultPerms,
      },
      { onConflict: 'business_id,member_email', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch owner name and business name for the email
  const { data: ownerProfile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()
  const { data: business } = await supabase
    .from('business_profiles').select('name').eq('id', profile.active_business_id).single()

  // ── Generate a direct access link via Supabase Admin API ────────────────────
  // This avoids the user needing to enter their email on /acesso-equipe.
  // type='invite' creates the user if they don't exist; type='magiclink' for existing.
  let directAccessLink: string | null = null
  try {
    const admin = createAdminClient()
    const linkType = memberProfile ? 'magiclink' : 'invite'
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: linkType,
      email,
    })
    if (linkError) {
      console.error('[team invite] generateLink error:', linkError)
    } else {
      directAccessLink = linkData?.properties?.action_link ?? null
    }
  } catch (err) {
    console.error('[team invite] admin generateLink failed:', err)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pearfy.com.br'

  // Send email (non-blocking)
  sendTeamInviteEmail(
    email,
    business?.name ?? 'sua empresa',
    ownerProfile?.name ?? 'Um usuário',
    directAccessLink,
    appUrl,
  ).catch(err => console.error('[team invite email]', err))

  return NextResponse.json({ member, hasAccount: !!memberProfile })
}
