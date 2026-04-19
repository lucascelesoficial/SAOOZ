import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, hasAdminCredentials } from '@/lib/supabase/admin'
import { getApiKey, getItem, getAccounts } from '@/lib/banking/pluggy'
import { normalizeItemStatus } from '@/lib/banking/mapper'

export const dynamic = 'force-dynamic'

// ── Pluggy Webhook event types ────────────────────────────────────────────────

interface PluggyWebhookPayload {
  event: string
  itemId: string
  // Additional fields present in some events
  error?: { code: string; message: string } | null
}

// ── POST /api/banking/webhook ─────────────────────────────────────────────────
// Handles Pluggy webhook notifications for item status changes.
// No user auth required — this is called server-to-server by Pluggy.
// We verify the request by looking up the item in our DB before acting.

export async function POST(request: NextRequest) {
  try {
    const body: PluggyWebhookPayload = await request.json().catch(() => null)

    if (!body?.event || !body?.itemId) {
      return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
    }

    if (!hasAdminCredentials()) {
      console.error('[banking/webhook] Admin credentials not configured')
      return NextResponse.json({ ok: true }) // Acknowledge but do nothing
    }

    const admin = createAdminClient()

    // Find the item in our DB
    const { data: dbItem } = await admin
      .from('bank_items')
      .select('id, user_id, pluggy_item_id, status')
      .eq('pluggy_item_id', body.itemId)
      .maybeSingle()

    if (!dbItem) {
      // Item not in our DB — ignore
      return NextResponse.json({ ok: true })
    }

    const event = body.event.toLowerCase()

    if (event === 'item/updated' || event === 'item/created') {
      // Fetch fresh item data from Pluggy
      try {
        const apiKey = await getApiKey()
        const [liveItem, accounts] = await Promise.all([
          getItem(apiKey, body.itemId),
          getAccounts(apiKey, body.itemId),
        ])

        const newStatus = normalizeItemStatus(liveItem.status)

        // Update item status
        await admin
          .from('bank_items')
          .update({
            status: newStatus,
            last_updated_at: liveItem.lastUpdatedAt,
            error_message: liveItem.error?.message ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbItem.id)

        // Sync account balances
        if (accounts.length > 0) {
          await Promise.all(
            accounts.map((acc) =>
              admin
                .from('bank_accounts')
                .update({ balance: acc.balance, updated_at: new Date().toISOString() })
                .eq('pluggy_account_id', acc.id)
            )
          )
        }

        console.log(`[banking/webhook] ${event} → item ${dbItem.id} status=${newStatus}`)
      } catch (err) {
        console.error('[banking/webhook] Failed to refresh item:', err)
      }
    } else if (event === 'item/error') {
      await admin
        .from('bank_items')
        .update({
          status: 'error',
          error_message: body.error?.message ?? 'Erro desconhecido.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbItem.id)

      console.log(`[banking/webhook] item/error → item ${dbItem.id}`)
    } else if (event === 'item/deleted') {
      // Item was deleted via Pluggy — remove from our DB too
      await admin
        .from('bank_items')
        .delete()
        .eq('id', dbItem.id)

      console.log(`[banking/webhook] item/deleted → removed item ${dbItem.id}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[banking/webhook] Unhandled error:', error)
    // Always return 200 to Pluggy to prevent retry storms
    return NextResponse.json({ ok: true })
  }
}
