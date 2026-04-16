/**
 * POST /api/auth/verify-turnstile
 *
 * Called client-side before executing Supabase signIn/signUp.
 * Validates the Cloudflare Turnstile token server-side.
 *
 * Body: { token: string }
 * Returns: { ok: true } | { ok: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/server/turnstile'
import { requireSameOrigin, requireJsonContentType, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 4096)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const body = await request.json().catch(() => null) as { token?: unknown } | null
    const token = typeof body?.token === 'string' ? body.token : null

    const result = await verifyTurnstileToken(token, request)

    if (!result.success) {
      return withSecurityHeaders(
        NextResponse.json({ ok: false, error: result.error }, { status: 403 })
      )
    }

    return withSecurityHeaders(NextResponse.json({ ok: true }))
  } catch {
    return withSecurityHeaders(NextResponse.json({ ok: true })) // fail open
  }
}
