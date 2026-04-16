/**
 * Cron: Purge soft-deleted business profiles older than 90 days
 *
 * Schedule: daily at 03:00 UTC (low-traffic window)
 * Protected by CRON_SECRET header.
 *
 * Flow:
 *  1. Find business_profiles WHERE deleted_at < NOW() - 90 days
 *  2. Hard-delete related financial data in dependency order
 *     (business_revenues, business_expenses, etc.)
 *  3. Hard-delete the business_profile row
 *  4. Write one audit event per purged business (actor: system)
 *
 * Runs in batches of 50 to avoid long-running transactions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/server/security'
import { logAuditEvent } from '@/lib/server/audit'

export const dynamic = 'force-dynamic'

const RETENTION_DAYS = 90
const BATCH_SIZE      = 50

export async function GET(request: NextRequest) {
  // ── Auth: CRON_SECRET header ───────────────────────────────────────────
  const cronCheck = verifyCronSecret(request)
  if (cronCheck) return cronCheck

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  let totalPurged = 0
  const errors: string[] = []

  try {
    // ── Fetch expired soft-deleted businesses ────────────────────────────
    const { data: expired, error: fetchErr } = await admin
      .from('business_profiles')
      .select('id, user_id, name, deleted_at, deleted_by')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoff)
      .limit(BATCH_SIZE)

    if (fetchErr) {
      console.error('[purge-deleted] Failed to fetch expired businesses:', fetchErr)
      return NextResponse.json({ error: 'DB fetch failed' }, { status: 500 })
    }

    if (!expired || expired.length === 0) {
      return NextResponse.json({
        ok: true,
        purged: 0,
        message: 'No expired businesses to purge',
      })
    }

    for (const biz of expired) {
      try {
        // Delete financial data in dependency order
        // (FK constraints cascade in DB, but explicit deletes give better audit trail)
        await admin.from('business_revenues').delete().eq('business_id', biz.id)
        await admin.from('business_expenses').delete().eq('business_id', biz.id)

        // Hard-delete the business profile itself
        const { error: delErr } = await admin
          .from('business_profiles')
          .delete()
          .eq('id', biz.id)

        if (delErr) {
          errors.push(`${biz.id}: ${delErr.message}`)
          continue
        }

        totalPurged++

        // Audit log each purged business
        await logAuditEvent({
          userId: biz.user_id ?? null,
          actorType: 'system',
          actionType: 'business.deleted',
          resourceType: 'business_profile',
          resourceId: biz.id,
          metadata: {
            reason: 'retention_policy',
            retention_days: RETENTION_DAYS,
            deleted_at: biz.deleted_at,
            deleted_by: biz.deleted_by ?? null,
            business_name: biz.name,
            purged_at: new Date().toISOString(),
          },
        })
      } catch (bizErr) {
        const msg = bizErr instanceof Error ? bizErr.message : String(bizErr)
        errors.push(`${biz.id}: ${msg}`)
      }
    }

    // ── Also clean up expired rate limit buckets ─────────────────────────
    try {
      await admin
        .from('rate_limit_buckets')
        .delete()
        .lt('reset_at', new Date().toISOString())
    } catch {
      // Non-fatal — stale buckets are harmless
    }

    const status = errors.length > 0 ? 207 : 200
    return NextResponse.json(
      {
        ok: errors.length === 0,
        purged: totalPurged,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status }
    )
  } catch (err) {
    console.error('[purge-deleted] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
