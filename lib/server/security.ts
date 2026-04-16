/**
 * SAOOZ — Centralized Security Utilities
 *
 * All API routes should use these helpers to enforce:
 * - Same-origin checks (CSRF prevention)
 * - Content-Type validation (prevents parser confusion)
 * - Cron secret validation (prevents external cron abuse)
 * - Request body size limits (prevents DoS)
 * - Security header injection on responses
 */

import { NextResponse, type NextRequest } from 'next/server'

// ── Constants ─────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const MAX_BODY_BYTES = 1_048_576 // 1 MiB — hard limit for all API bodies
const CRON_SECRET = process.env.CRON_SECRET ?? ''

// Vercel cron job source IPs (as documented by Vercel)
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
const VERCEL_CRON_IPS = new Set([
  '76.76.21.21',
  '76.76.21.22',
])

// ── Same-origin / CSRF guard ──────────────────────────────────────────────────

/**
 * Verifies that the request comes from the same origin as the app.
 * Blocks cross-origin requests on state-changing API routes.
 *
 * Returns null if valid, or a 403 NextResponse if invalid.
 */
export function requireSameOrigin(request: NextRequest): NextResponse | null {
  // Skip check in development
  if (process.env.NODE_ENV !== 'production') return null

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow requests without an Origin header (e.g., server-to-server)
  // but reject requests with an explicit foreign Origin
  if (origin) {
    const allowedOrigins = [
      APP_URL,
      // Always allow the Vercel deployment origin in preview
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean) as string[]

    const originUrl = safeParseUrl(origin)
    const isAllowed = allowedOrigins.some((allowed) => {
      const allowedUrl = safeParseUrl(allowed)
      return allowedUrl && originUrl && allowedUrl.hostname === originUrl.hostname
    })

    if (!isAllowed) {
      console.warn(`[security] Blocked cross-origin request: origin=${origin} path=${request.nextUrl.pathname}`)
      return NextResponse.json(
        { error: 'Origem não permitida.' },
        { status: 403 }
      )
    }
  } else if (referer) {
    // No Origin but has Referer — check it
    const refUrl = safeParseUrl(referer)
    const appUrlParsed = safeParseUrl(APP_URL)
    if (refUrl && appUrlParsed && refUrl.hostname !== appUrlParsed.hostname) {
      console.warn(`[security] Blocked cross-referer request: referer=${referer} path=${request.nextUrl.pathname}`)
      return NextResponse.json(
        { error: 'Referer não permitido.' },
        { status: 403 }
      )
    }
  }

  return null
}

// ── Content-Type guard ────────────────────────────────────────────────────────

/**
 * Enforces Content-Type: application/json on POST/PATCH/PUT requests.
 * Prevents form-encoded or XML payloads from bypassing Zod validation.
 */
export function requireJsonContentType(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase()
  if (!['POST', 'PATCH', 'PUT'].includes(method)) return null

  const ct = request.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type deve ser application/json.' },
      { status: 415 }
    )
  }

  return null
}

// ── Body size guard ────────────────────────────────────────────────────────────

/**
 * Rejects requests whose Content-Length exceeds MAX_BODY_BYTES.
 * Defense against memory exhaustion / DoS via huge payloads.
 */
export function rejectLargeBody(request: NextRequest, maxBytes = MAX_BODY_BYTES): NextResponse | null {
  const cl = request.headers.get('content-length')
  if (cl && parseInt(cl, 10) > maxBytes) {
    return NextResponse.json(
      { error: 'Payload muito grande.' },
      { status: 413 }
    )
  }
  return null
}

// ── Cron secret guard ─────────────────────────────────────────────────────────

/**
 * Validates cron job requests by:
 * 1. Checking Authorization: Bearer <CRON_SECRET>
 * 2. Optionally checking source IP against Vercel's known cron IPs
 *
 * Returns null if valid, or a 401/403 NextResponse if invalid.
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  if (!CRON_SECRET) {
    console.error('[security] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Servidor mal configurado.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return NextResponse.json({ error: 'Token ausente.' }, { status: 401 })
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(token, CRON_SECRET)) {
    console.warn(`[security] Invalid cron secret attempt. path=${request.nextUrl.pathname}`)
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
  }

  // In production, also validate the caller IP if set by Vercel
  if (process.env.NODE_ENV === 'production') {
    const sourceIp = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    // Only enforce IP check if we have VERCEL_CRON_IPS and the IP is provided
    // Vercel sets x-vercel-cron-job-id for legitimate cron invocations
    const isVercelCron = request.headers.get('x-vercel-cron-job-id') !== null
    if (!isVercelCron && sourceIp && !VERCEL_CRON_IPS.has(sourceIp)) {
      console.warn(`[security] Cron called from unexpected IP: ${sourceIp}`)
      // Warn only — don't block (IP ranges can change); log for investigation
    }
  }

  return null
}

// ── Safe JSON parse ────────────────────────────────────────────────────────────

/**
 * Safely parses request body as JSON with error handling.
 * Use instead of direct request.json() to avoid 500s on malformed input.
 */
export async function safeJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeParseUrl(url: string): URL | null {
  try { return new URL(url) } catch { return null }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses XOR across character codes — equivalent to crypto.timingSafeEqual
 * but works with strings without Buffer conversion.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still iterate to prevent length-based timing oracle
    let _acc = 1
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      _acc |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0)
    }
    void _acc
    return false
  }
  let acc = 0
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return acc === 0
}

// ── Security headers for API responses ────────────────────────────────────────

/**
 * Adds security headers to an API response.
 * Call on every NextResponse before returning from an API route.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'no-store')  // never cache API responses
  return response
}
