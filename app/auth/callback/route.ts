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

  if (code) {
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

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData?.user) {
      const userId = sessionData.user.id

      // ── Auto-accept pending team invites ────────────────────────────────────
      // Calls a SECURITY DEFINER function that matches pending invites by email
      // and promotes them to 'active', returning the accepted business IDs.
      const { data: memberships } = await supabase
        .rpc('accept_pending_team_invites') as {
          data: Array<{ business_id: string; owner_user_id: string }> | null
        }

      if (memberships && memberships.length > 0) {
        const firstBusinessId = memberships[0].business_id

        // Mark user as team member and set their active business context.
        // mode='both' is needed so the dashboard layout allows PJ access.
        await supabase
          .from('profiles')
          .update({
            is_team_member: true,
            mode: 'both',
            active_business_id: firstBusinessId,
          })
          .eq('id', userId)

        // Send team members directly to the business module they were invited to.
        return NextResponse.redirect(`${origin}/empresa`)
      }

      // ── No pending invites → standard redirect ──────────────────────────────
      // If the user is already a team member (returning login via magic link),
      // the middleware will handle the /central → /empresa redirect.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
