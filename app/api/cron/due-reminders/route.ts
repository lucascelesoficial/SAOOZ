/**
 * Cron: Due-date reminders
 * Runs daily at 08:00 BRT (11:00 UTC).
 * Queries all users who have PJ revenues/expenses due in the next 3 days
 * and sends one consolidated email per user.
 *
 * Protected by CRON_SECRET header (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendDueDateReminderEmail,
  sendOverdueAlertEmail,
  type DueItem,
} from '@/lib/email/sender'

function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')
  return secret === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const in3d     = new Date(today.getTime() + 3 * 86_400_000).toISOString().split('T')[0]

  let sent     = 0
  let skipped  = 0
  const errors: string[] = []

  try {
    // ── Business revenues due in 3 days ──────────────────────────────────────
    const { data: dueRevenues } = await supabase
      .from('business_revenues')
      .select(`
        id, description, amount, due_date, business_id,
        business_profiles!inner ( user_id, name )
      `)
      .gte('due_date', todayStr)
      .lte('due_date', in3d)
      .in('status', ['pending'])

    // ── Business expenses due in 3 days ──────────────────────────────────────
    const { data: dueExpenses } = await supabase
      .from('business_expenses')
      .select(`
        id, description, amount, due_date, business_id,
        business_profiles!inner ( user_id, name )
      `)
      .gte('due_date', todayStr)
      .lte('due_date', in3d)
      .in('status', ['pending'])

    // ── Business revenues overdue ─────────────────────────────────────────────
    const { data: overdueRevenues } = await supabase
      .from('business_revenues')
      .select(`
        id, description, amount, due_date, business_id,
        business_profiles!inner ( user_id, name )
      `)
      .lt('due_date', todayStr)
      .in('status', ['overdue', 'pending'])

    // ── Business expenses overdue ─────────────────────────────────────────────
    const { data: overdueExpenses } = await supabase
      .from('business_expenses')
      .select(`
        id, description, amount, due_date, business_id,
        business_profiles!inner ( user_id, name )
      `)
      .lt('due_date', todayStr)
      .in('status', ['overdue', 'pending'])

    // ── Aggregate per user ────────────────────────────────────────────────────
    type UserMap = Map<string, { dueItems: DueItem[]; overdueItems: DueItem[] }>
    const userMap: UserMap = new Map()

    function getOrCreate(userId: string) {
      if (!userMap.has(userId)) {
        userMap.set(userId, { dueItems: [], overdueItems: [] })
      }
      return userMap.get(userId)!
    }

    for (const r of dueRevenues ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uid = (r.business_profiles as any)?.user_id
      if (!uid) continue
      getOrCreate(uid).dueItems.push({
        description: r.description ?? '',
        amount:      r.amount,
        dueDate:     r.due_date ?? '',
        type:        'receber',
      })
    }
    for (const e of dueExpenses ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uid = (e.business_profiles as any)?.user_id
      if (!uid) continue
      getOrCreate(uid).dueItems.push({
        description: e.description ?? '',
        amount:      e.amount,
        dueDate:     e.due_date ?? '',
        type:        'pagar',
      })
    }
    for (const r of overdueRevenues ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uid = (r.business_profiles as any)?.user_id
      if (!uid) continue
      getOrCreate(uid).overdueItems.push({
        description: r.description ?? '',
        amount:      r.amount,
        dueDate:     r.due_date ?? '',
        type:        'receber',
      })
    }
    for (const e of overdueExpenses ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uid = (e.business_profiles as any)?.user_id
      if (!uid) continue
      getOrCreate(uid).overdueItems.push({
        description: e.description ?? '',
        amount:      e.amount,
        dueDate:     e.due_date ?? '',
        type:        'pagar',
      })
    }

    // ── Fetch profiles in one batch ───────────────────────────────────────────
    const userIds = [...userMap.keys()]
    if (userIds.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, message: 'No due items today' })
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)

    type ProfileRow = { id: string; name: string; email: string }
    const profileMap = new Map<string, ProfileRow>(
      (profiles ?? []).map((p: ProfileRow) => [p.id, p]),
    )

    // ── Send emails ───────────────────────────────────────────────────────────
    for (const [userId, { dueItems, overdueItems }] of userMap.entries()) {
      const profile = profileMap.get(userId) as { id: string; name: string; email: string } | undefined
      if (!profile?.email) { skipped++; continue }

      try {
        if (dueItems.length > 0) {
          await sendDueDateReminderEmail(profile.email, profile.name, dueItems, 'pj')
          sent++
        }
        if (overdueItems.length > 0) {
          await sendOverdueAlertEmail(profile.email, profile.name, overdueItems, 'pj')
          sent++
        }
      } catch (err) {
        errors.push(`user ${userId}: ${String(err)}`)
      }
    }

    return NextResponse.json({
      ok:      true,
      sent,
      skipped,
      errors:  errors.length > 0 ? errors : undefined,
    })

  } catch (err) {
    console.error('[cron/due-reminders]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
