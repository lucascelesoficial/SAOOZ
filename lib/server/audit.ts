/**
 * SAOOZ — Central Audit Logging
 *
 * Every sensitive operation MUST call logAuditEvent().
 * Writes to the `audit_logs` table using the admin client (bypasses RLS).
 * Fails silently — never blocks the main operation.
 *
 * Usage:
 *   await logAuditEvent({
 *     userId: user.id,
 *     actorType: 'user',
 *     actionType: 'account.delete',
 *     resourceType: 'profile',
 *     resourceId: user.id,
 *     metadata: { reason: 'user_requested', ip: getClientIp(request) },
 *   })
 */

import type { NextRequest } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuditActorType = 'user' | 'system' | 'ai'

export interface AuditEvent {
  userId?: string | null
  actorType: AuditActorType
  actionType: AuditActionType
  resourceType: string
  resourceId?: string | null
  metadata?: Record<string, unknown>
}

/**
 * All auditable action types.
 * Format: `resource.action` — makes log queries simple.
 */
export type AuditActionType =
  // Auth
  | 'auth.login'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.password_reset_request'
  | 'auth.password_changed'
  | 'auth.mfa_enrolled'
  | 'auth.mfa_verified'
  | 'auth.mfa_disabled'
  // Account
  | 'account.delete'
  | 'account.export_data'
  // Subscription / Billing
  | 'subscription.activated'
  | 'subscription.canceled'
  | 'subscription.reactivated'
  | 'subscription.plan_changed'
  | 'subscription.payment_succeeded'
  | 'subscription.payment_failed'
  | 'subscription.trial_started'
  | 'subscription.trial_ended'
  // Billing webhook (system actor)
  | 'webhook.received'
  | 'webhook.processed'
  | 'webhook.failed'
  // Business
  | 'business.created'
  | 'business.updated'
  | 'business.deleted'
  | 'business.switched'
  // Financial data
  | 'revenue.created'
  | 'revenue.updated'
  | 'revenue.deleted'
  | 'expense.created'
  | 'expense.updated'
  | 'expense.deleted'
  // AI
  | 'ai.action_executed'
  | 'ai.action_blocked'
  // Security
  | 'security.rate_limit_hit'
  | 'security.csrf_blocked'
  | 'security.suspicious_request'

// ── Logger ────────────────────────────────────────────────────────────────────

/**
 * Writes an audit event to the `audit_logs` table.
 * Uses the admin client to bypass RLS (audit_logs has SELECT-only RLS for users).
 * Never throws — if logging fails, the main operation continues.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const { createAdminClient, hasAdminCredentials } = await import('@/lib/supabase/admin')
    if (!hasAdminCredentials()) return

    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      user_id: event.userId ?? null,
      actor_type: event.actorType,
      action_type: event.actionType,
      resource_type: event.resourceType,
      resource_id: event.resourceId ?? null,
      metadata: (event.metadata ?? {}) as import('@/types/database.types').Json,
    })
  } catch (err) {
    // Never let audit logging crash the main operation
    console.error('[audit] Failed to write audit event:', err)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extracts the real client IP from a Next.js request.
 * Handles Vercel's x-forwarded-for (multi-hop) and x-real-ip.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list — first IP is the client
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Extracts a safe user-agent string (truncated to avoid storing huge strings).
 */
export function getUserAgent(request: NextRequest): string {
  const ua = request.headers.get('user-agent') ?? ''
  return ua.slice(0, 200)
}

/**
 * Builds a standardized metadata object for auth events.
 */
export function authEventMeta(request: NextRequest): Record<string, unknown> {
  return {
    ip: getClientIp(request),
    user_agent: getUserAgent(request),
    timestamp: new Date().toISOString(),
  }
}
