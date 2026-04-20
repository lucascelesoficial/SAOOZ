import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'
import { enforceRateLimit } from '@/lib/server/request-guard'
import { requireSameOrigin, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'
import { logAuditEvent, getClientIp } from '@/lib/server/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // ── Security guards ────────────────────────────────────────────────────
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const bodyCheck = rejectLargeBody(request, 1024) // 1 KB max for account delete
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Servidor mal configurado.' }, { status: 500 })
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
      )
    }

    // Strict rate limit: max 3 attempts per hour (prevents brute-force deletion loops)
    const rate = await enforceRateLimit({
      scope: 'account_delete',
      user,
      maxRequests: 3,
      windowMs: 3_600_000, // 1 hour
    })
    if (!rate.ok) return withSecurityHeaders(rate.response)

    const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Best-effort cleanup of avatar files tied to user path
    try {
      const { data: files } = await admin.storage.from('avatars').list(user.id, { limit: 1000 })
      if (files?.length) {
        const paths = files.map((f) => `${user.id}/${f.name}`)
        await admin.storage.from('avatars').remove(paths)
      }
    } catch {
      // Ignore storage cleanup failures; user deletion is the source of truth
    }

    // ── Audit log BEFORE deletion (user_id becomes invalid after) ───────────
    // LGPD: never store PII (email) in audit_logs — log a hash of the domain only
    // so we can audit "an account was deleted" without retaining personal data.
    const emailDomain = user.email?.split('@')[1] ?? 'unknown'
    await logAuditEvent({
      userId: user.id,
      actorType: 'user',
      actionType: 'account.delete',
      resourceType: 'profile',
      resourceId: user.id,
      metadata: { ip: getClientIp(request), email_domain: emailDomain },
    })

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('[account/delete] deleteUser error:', deleteError.message)
      return withSecurityHeaders(
        NextResponse.json({ error: 'Erro ao excluir conta.' }, { status: 500 })
      )
    }

    return withSecurityHeaders(NextResponse.json({ ok: true }))
  } catch (error: unknown) {
    console.error('[account/delete] unexpected error:', error)
    return withSecurityHeaders(
      NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    )
  }
}
