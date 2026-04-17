/**
 * POST /api/auth/resend-confirmation
 * Reenvia o email de confirmação para um endereço ainda não confirmado.
 * Rate-limited a 1 reenvio por 60s por IP para evitar abuso.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  requireSameOrigin,
  requireJsonContentType,
  rejectLargeBody,
  withSecurityHeaders,
} from '@/lib/server/security'

export const dynamic = 'force-dynamic'

// Simples in-memory throttle por IP (reinicia a cada cold start — suficiente para abuso básico)
const lastResend = new Map<string, number>()
const THROTTLE_MS = 60_000 // 1 min

function getIp(req: NextRequest) {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 1024)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  const ip = getIp(request)
  const lastTime = lastResend.get(ip) ?? 0
  const now = Date.now()

  if (now - lastTime < THROTTLE_MS) {
    const retryAfter = Math.ceil((THROTTLE_MS - (now - lastTime)) / 1000)
    return withSecurityHeaders(
      NextResponse.json(
        { error: `Aguarde ${retryAfter}s antes de reenviar.`, retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    )
  }

  try {
    const body = await request.json().catch(() => null) as { email?: unknown } | null
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
      )
    }

    lastResend.set(ip, now)

    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding/plano`,
      },
    })

    if (error) {
      console.error('[resend-confirmation] error:', error.message)
      // Fail silently to the client — don't reveal if account exists
    }

    // Always return 200 — don't reveal whether the email exists
    return withSecurityHeaders(
      NextResponse.json({ ok: true })
    )
  } catch (err) {
    console.error('[resend-confirmation] unexpected:', err)
    return withSecurityHeaders(
      NextResponse.json({ ok: true }) // fail open
    )
  }
}
