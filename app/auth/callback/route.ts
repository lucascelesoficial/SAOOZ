import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function normalizeNextPath(nextParam: string | null) {
  if (!nextParam) return '/central'
  if (!nextParam.startsWith('/')) return '/central'
  if (nextParam.startsWith('//')) return '/central'
  if (nextParam.includes('://')) return '/central'
  return nextParam
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = normalizeNextPath(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData?.user) {
    console.error('[callback] exchangeCodeForSession error:', sessionError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const userId    = sessionData.user.id
  const userEmail = sessionData.user.email ?? ''

  // ── Check for pending team invites ─────────────────────────────────────────
  // accept_pending_team_invites() is SECURITY DEFINER — it reads auth.users.email
  // and updates business_team_members rows where member_user_id IS NULL.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships, error: rpcError } = await (supabase as any)
      .rpc('accept_pending_team_invites') as {
        data: Array<{ business_id: string; owner_user_id: string }> | null
        error: unknown
      }

    if (rpcError) {
      console.error('[callback] accept_pending_team_invites error:', rpcError)
    }

    if (memberships && memberships.length > 0) {
      const firstBusinessId = memberships[0].business_id

      // Update profile: mark as team member, set PJ context.
      // Uses upsert so it works even if the profile trigger hasn't fired yet.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase as any)
        .from('profiles')
        .upsert(
          {
            id:                  userId,
            email:               userEmail,
            is_team_member:      true,
            mode:                'both',
            active_business_id:  firstBusinessId,
          },
          { onConflict: 'id' }
        )

      if (upsertError) {
        console.error('[callback] profile upsert error:', upsertError)
      }

      // Land team member directly in the PJ module
      return NextResponse.redirect(`${origin}/empresa`)
    }
  } catch (err) {
    console.error('[callback] team invite check failed:', err)
  }

  // ── Standard redirect (no pending invites, or already a team member) ────────
  // Middleware handles /central → /empresa for existing team members.
  return NextResponse.redirect(`${origin}${next}`)
}
