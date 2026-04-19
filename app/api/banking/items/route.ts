import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server/request-guard'
import { createClient } from '@/lib/supabase/server'
import { getApiKey, getItem, getAccounts, deleteItem } from '@/lib/banking/pluggy'
import { normalizeItemStatus } from '@/lib/banking/mapper'
import { withSecurityHeaders, requireSameOrigin } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

// ── GET /api/banking/items ────────────────────────────────────────────────────
// Returns user's connected bank items with their accounts and live balances.

export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  try {
    const supabase = await createClient()

    // Load all items + accounts from DB
    const { data: dbItems, error } = await supabase
      .from('bank_items')
      .select('*, bank_accounts(*)')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich with live Pluggy data (best-effort; don't fail if Pluggy is slow)
    let apiKey: string | null = null
    try {
      apiKey = await getApiKey()
    } catch {
      // Return DB data without live enrichment
    }

    const enriched = await Promise.all(
      (dbItems ?? []).map(async (item) => {
        let liveAccounts = null

        if (apiKey) {
          try {
            const [liveItem, accounts] = await Promise.all([
              getItem(apiKey, item.pluggy_item_id),
              getAccounts(apiKey, item.pluggy_item_id),
            ])

            liveAccounts = accounts

            // Sync status back to DB if changed
            const newStatus = normalizeItemStatus(liveItem.status)
            if (newStatus !== item.status) {
              await supabase
                .from('bank_items')
                .update({ status: newStatus, last_updated_at: liveItem.lastUpdatedAt, updated_at: new Date().toISOString() })
                .eq('id', item.id)
            }

            // Sync account balances
            await Promise.all(
              accounts.map((acc) =>
                supabase
                  .from('bank_accounts')
                  .update({ balance: acc.balance, updated_at: new Date().toISOString() })
                  .eq('pluggy_account_id', acc.id)
              )
            )
          } catch {
            // Ignore per-item failures — return DB data
          }
        }

        return { ...item, liveAccounts }
      })
    )

    return withSecurityHeaders(NextResponse.json({ items: enriched }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao listar contas bancárias.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}

// ── POST /api/banking/items ───────────────────────────────────────────────────
// Called after Pluggy Connect onSuccess to store the new item in DB.

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  try {
    const body = await request.json().catch(() => null)

    if (!body?.pluggyItemId || typeof body.pluggyItemId !== 'string') {
      return withSecurityHeaders(NextResponse.json({ error: 'pluggyItemId obrigatório.' }, { status: 400 }))
    }

    const apiKey = await getApiKey()
    const pluggyItem = await getItem(apiKey, body.pluggyItemId)
    const accounts = await getAccounts(apiKey, body.pluggyItemId)

    const supabase = await createClient()

    // Upsert item
    const { data: dbItem, error: itemError } = await supabase
      .from('bank_items')
      .upsert(
        {
          user_id: auth.user.id,
          pluggy_item_id: pluggyItem.id,
          connector_name: pluggyItem.connector.name,
          connector_id: pluggyItem.connector.id,
          status: normalizeItemStatus(pluggyItem.status),
          last_updated_at: pluggyItem.lastUpdatedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'pluggy_item_id' }
      )
      .select()
      .single()

    if (itemError) throw itemError

    // Upsert accounts
    if (accounts.length > 0) {
      const { error: accError } = await supabase
        .from('bank_accounts')
        .upsert(
          accounts.map((acc) => ({
            user_id: auth.user.id,
            item_id: dbItem.id,
            pluggy_account_id: acc.id,
            name: acc.name,
            type: acc.type,
            subtype: acc.subtype ?? null,
            number: acc.number ?? null,
            balance: acc.balance,
            currency_code: acc.currencyCode,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'pluggy_account_id' }
        )

      if (accError) throw accError
    }

    return withSecurityHeaders(NextResponse.json({ item: dbItem }, { status: 201 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao registrar banco.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}

// ── DELETE /api/banking/items?id=<dbItemId> ───────────────────────────────────
// Deletes item from Pluggy and from the local DB.

export async function DELETE(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return withSecurityHeaders(NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 }))
    }

    const supabase = await createClient()

    // Fetch the item to get pluggy_item_id, and verify ownership
    const { data: dbItem, error: fetchError } = await supabase
      .from('bank_items')
      .select('id, pluggy_item_id')
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .single()

    if (fetchError || !dbItem) {
      return withSecurityHeaders(NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 }))
    }

    // Delete from Pluggy (best effort)
    try {
      const apiKey = await getApiKey()
      await deleteItem(apiKey, dbItem.pluggy_item_id)
    } catch {
      // Continue even if Pluggy delete fails — remove from DB anyway
    }

    // Delete from DB (cascade deletes bank_accounts and bank_imported_transactions)
    const { error: deleteError } = await supabase
      .from('bank_items')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id)

    if (deleteError) throw deleteError

    return withSecurityHeaders(NextResponse.json({ ok: true }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao desconectar banco.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}
