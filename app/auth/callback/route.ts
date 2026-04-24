import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // User-session client — needed for exchangeCodeForSession and SECURITY DEFINER RPCs
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

  const userId = sessionData.user.id

  // ── Check for pending team invites ─────────────────────────────────────────
  // accept_pending_team_invites() is SECURITY DEFINER and reads auth.uid(),
  // so it must be called with the user-session client (not admin).
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships, error: rpcError } = await (supabase as any)
      .rpc('accept_pending_team_invites') as {
        data: Array<{ business_id: string; owner_user_id: string }> | null
        error: unknown
      }

    if (rpcError) {
      console.error('[callback] accept_pending_team_invites rpc error:', rpcError)
    }

    if (memberships && memberships.length > 0) {
      const firstBusinessId = memberships[0].business_id

      // Use the admin client to update the profile — this bypasses RLS entirely.
      // We use UPDATE (not upsert) to avoid overwriting existing profile fields
      // (name, CPF, etc.) that were set during signup.
      try {
        const admin = createAdminClient()
        // is_team_member is not in generated types yet (migration 028) — cast needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profilesTable = admin.from('profiles') as any
        await profilesTable
          .update({
            is_team_member:     true,
            mode:               'both',
            active_business_id: firstBusinessId,
          })
          .eq('id', userId)
      } catch (adminErr) {
        console.error('[callback] admin profile update error:', adminErr)
      }

      // Land team member directly in the PJ module
      return NextResponse.redirect(`${origin}/empresa`)
    }
  } catch (err) {
    console.error('[callback] team invite check failed:', err)
  }

  // ── Standard redirect (no pending invites) ─────────────────────────────────
  return NextResponse.redirect(`${origin}${next}`)
}
