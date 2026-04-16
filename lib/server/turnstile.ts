/**
 * Cloudflare Turnstile — server-side token verification
 *
 * Usage in an API route:
 *   const check = await verifyTurnstileToken(token, request)
 *   if (!check.success) return withSecurityHeaders(NextResponse.json({ error: check.error }, { status: 403 }))
 *
 * Gracefully disabled when TURNSTILE_SECRET_KEY is not set (dev / before CF account is configured).
 *
 * Setup:
 *   1. Create a Cloudflare account → Turnstile → Add site (Invisible widget)
 *   2. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in Vercel (used in the client component)
 *   3. Set TURNSTILE_SECRET_KEY in Vercel (server-only, never expose to client)
 */

import type { NextRequest } from 'next/server'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const SECRET = process.env.TURNSTILE_SECRET_KEY ?? ''

interface TurnstileResult {
  success: boolean
  error?: string
}

/**
 * Verifies a Turnstile token submitted by the client.
 *
 * @param token  - The `cf-turnstile-response` value from the form
 * @param request - The incoming Next.js request (used to extract the client IP)
 * @returns { success: true } or { success: false, error: string }
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  request: NextRequest
): Promise<TurnstileResult> {
  // Graceful degradation: if the secret isn't configured, skip verification
  if (!SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification in production!')
    }
    return { success: true }
  }

  if (!token || typeof token !== 'string' || token.length === 0) {
    return { success: false, error: 'Verificação de segurança ausente. Recarregue a página e tente novamente.' }
  }

  try {
    const ip =
      request.headers.get('cf-connecting-ip') ??          // Cloudflare
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      undefined

    const form = new URLSearchParams()
    form.set('secret', SECRET)
    form.set('response', token)
    if (ip) form.set('remoteip', ip)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      // Short timeout — never block the user long on CF verify
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      console.error('[turnstile] CF verify HTTP error:', res.status)
      // Fail open on network error to avoid blocking legitimate users
      return { success: true }
    }

    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }

    if (!data.success) {
      const codes = data['error-codes']?.join(', ') ?? 'unknown'
      console.warn('[turnstile] Verification failed:', codes)
      return { success: false, error: 'Verificação de segurança falhou. Tente novamente.' }
    }

    return { success: true }
  } catch (err) {
    // Fail open on timeout / network error
    console.error('[turnstile] Verification error (failing open):', err)
    return { success: true }
  }
}
