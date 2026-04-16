/**
 * POST /api/auth/log-event
 *
 * Lightweight endpoint called from client-side auth flows (login, signup, logout)
 * to write an audit event to `audit_logs`.
 *
 * Body: { eventType: AuditActionType, metadata?: Record<string, unknown> }
 *
 * Always returns 200 — audit logging must never break the main auth flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logAuditEvent, getClientIp, getUserAgent, type AuditActionType } from '@/lib/server/audit'
import { rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

// Allowlist of event types accepted from the client
const ALLOWED_EVENTS = new Set<AuditActionType>([
  'auth.login',
  'auth.logout',
  'auth.signup',
  'auth.password_reset_request',
  'auth.password_changed',
])

export async function POST(request: NextRequest) {
  // ── Reject oversized bodies ────────────────────────────────────────────
  const bodyCheck = rejectLargeBody(request, 4096)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    // ── Parse body ─────────────────────────────────────────────────────
    let body: { eventType?: unknown; metadata?: unknown }
    try {
      body = await request.json()
    } catch {
      // Always 200 — audit logging must never block the caller
      return withSecurityHeaders(NextResponse.json({ ok: true }, { status: 200 }))
    }

    const { eventType, metadata } = body

    // Validate event type against allowlist
    if (typeof eventType !== 'string' || !ALLOWED_EVENTS.has(eventType as AuditActionType)) {
      return withSecurityHeaders(NextResponse.json({ ok: true }, { status: 200 }))
    }

    // ── Resolve session user (may be null for pre-login events) ────────
    let userId: string | null = null
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (toSet) =>
              toSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              ),
          },
        }
      )
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id ?? null
    } catch {
      // Non-fatal — log event without userId
    }

    // ── Build enriched metadata ────────────────────────────────────────
    const enrichedMeta: Record<string, unknown> = {
      ip: getClientIp(request),
      user_agent: getUserAgent(request),
      timestamp: new Date().toISOString(),
      ...(metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {}),
    }

    await logAuditEvent({
      userId,
      actorType: 'user',
      actionType: eventType as AuditActionType,
      resourceType: 'auth',
      resourceId: userId,
      metadata: enrichedMeta,
    })
  } catch (err) {
    // Never let this endpoint crash or expose internals
    console.error('[auth/log-event] Unhandled error:', err)
  }

  // Always 200 regardless of outcome
  return withSecurityHeaders(NextResponse.json({ ok: true }, { status: 200 }))
}
