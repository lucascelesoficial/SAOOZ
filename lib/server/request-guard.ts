/**
 * SAOOZ — Request Guard
 *
 * Central authentication + rate limiting for API routes.
 *
 * Rate limiting is database-backed (Supabase `rate_limit_buckets` table) so it
 * persists across Vercel serverless cold starts and across multiple instances.
 *
 * Usage:
 *   const auth = await requireUser()
 *   if (!auth.ok) return auth.response
 *
 *   const rate = await enforceRateLimit({ scope: 'ai', user: auth.user, maxRequests: 30, windowMs: 60_000 })
 *   if (!rate.ok) return rate.response
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function requireUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      ),
    }
  }

  return { ok: true as const, user }
}

// ── Rate limiting (DB-backed) ─────────────────────────────────────────────────

/**
 * DB-backed rate limiting — survives serverless restarts.
 * Falls back to allowing the request if Supabase admin client is unavailable
 * (e.g., SUPABASE_SERVICE_ROLE_KEY not set) to avoid blocking all traffic.
 */
export async function enforceRateLimit(input: {
  scope: string
  user: User
  maxRequests: number
  windowMs: number
}) {
  const { scope, user, maxRequests, windowMs } = input
  const key = `${scope}:${user.id}`

  try {
    // Use admin client to bypass RLS (rate_limit_buckets has no RLS)
    const { createAdminClient, hasAdminCredentials } = await import('@/lib/supabase/admin')
    if (!hasAdminCredentials()) {
      // No admin key — fall back to allowing (log a warning)
      console.warn('[rate-limit] SUPABASE_SERVICE_ROLE_KEY not set — rate limiting disabled')
      return { ok: true as const }
    }

    const admin = createAdminClient()
    const now = new Date()
    const resetAt = new Date(now.getTime() + windowMs)

    // Upsert: if no row or reset_at expired → reset to 1, else increment
    // We use a raw RPC / manual logic since Supabase JS doesn't support
    // conditional upsert with arithmetic natively.
    const { data: existing } = await admin
      .from('rate_limit_buckets')
      .select('count, reset_at')
      .eq('key', key)
      .maybeSingle()

    if (!existing || new Date(existing.reset_at) <= now) {
      // New window — insert/upsert fresh bucket
      await admin
        .from('rate_limit_buckets')
        .upsert({ key, count: 1, reset_at: resetAt.toISOString(), updated_at: now.toISOString() })

      return { ok: true as const }
    }

    if (existing.count >= maxRequests) {
      const retryAfterSec = Math.ceil((new Date(existing.reset_at).getTime() - now.getTime()) / 1000)
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: 'Muitas requisições. Tente novamente em instantes.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSec),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': existing.reset_at,
              'Cache-Control': 'no-store',
            },
          }
        ),
      }
    }

    // Increment counter
    await admin
      .from('rate_limit_buckets')
      .update({ count: existing.count + 1, updated_at: now.toISOString() })
      .eq('key', key)

    return { ok: true as const }
  } catch (err) {
    // DB error → fail open (allow request) but log it
    console.error('[rate-limit] DB error — allowing request:', err)
    return { ok: true as const }
  }
}

// ── Cleanup helper ────────────────────────────────────────────────────────────

/**
 * Deletes expired rate limit buckets.
 * Call from a cron job or on-demand to keep the table small.
 */
export async function cleanupRateLimitBuckets() {
  try {
    const { createAdminClient, hasAdminCredentials } = await import('@/lib/supabase/admin')
    if (!hasAdminCredentials()) return

    const admin = createAdminClient()
    const { data } = await admin
      .from('rate_limit_buckets')
      .delete()
      .lt('reset_at', new Date().toISOString())
      .select('key')

    return data?.length ?? 0
  } catch {
    return 0
  }
}
