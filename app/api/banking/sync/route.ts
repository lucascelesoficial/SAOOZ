import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/server/request-guard'
import { createClient } from '@/lib/supabase/server'
import { getApiKey, getAccounts, getTransactions } from '@/lib/banking/pluggy'
import {
  mapPluggyCategoryToExpenseCategory,
  mapPluggyCategoryToBusinessExpCategory,
  mapPluggyCategoryToBusinessRevCategory,
} from '@/lib/banking/mapper'
import { withSecurityHeaders, requireSameOrigin, requireJsonContentType } from '@/lib/server/security'
import type { ExpenseCategory, BusinessExpCategory, BusinessRevCategory } from '@/types/database.types'

// Local types for bank tables
interface DbSyncBankItem { id: string; pluggy_item_id: string; mode: 'pf' | 'pj'; business_id: string | null }
interface DbSyncBankAccount { id: string; pluggy_account_id: string; type: string }

export const dynamic = 'force-dynamic'

const syncSchema = z.object({
  itemId: z.string().uuid(),
  months: z.number().int().min(1).max(12).optional().default(3),
})

// ── POST /api/banking/sync ────────────────────────────────────────────────────
// Imports transactions from a connected bank item.
//
// Routing logic:
//   PF mode, BANK account, DEBIT    → expenses (personal)
//   PF mode, CREDIT account, any    → expenses (credit card purchases = expenses)
//   PJ mode, BANK account, DEBIT    → business_expenses
//   PJ mode, BANK account, CREDIT   → business_revenues
//   PJ mode, CREDIT account, any    → business_expenses
//   INVESTMENT accounts             → always skipped
//   PENDING transactions            → always skipped

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  try {
    const body = await request.json().catch(() => null)
    const parsed = syncSchema.safeParse(body)

    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 }))
    }

    const { itemId, months } = parsed.data
    const supabase = await createClient()

    // Verify ownership of the item and get its mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbItem, error: itemError } = await (supabase as any)
      .from('bank_items')
      .select('id, pluggy_item_id, mode, business_id')
      .eq('id', itemId)
      .eq('user_id', auth.user.id)
      .single() as { data: DbSyncBankItem | null; error: unknown }

    if (itemError || !dbItem) {
      return withSecurityHeaders(NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 }))
    }

    const isPJ = dbItem.mode === 'pj'
    const businessId = dbItem.business_id

    if (isPJ && !businessId) {
      return withSecurityHeaders(NextResponse.json({ error: 'business_id ausente no item PJ.' }, { status: 400 }))
    }

    // Get DB accounts for this item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbAccounts, error: accError } = await (supabase as any)
      .from('bank_accounts')
      .select('id, pluggy_account_id, type')
      .eq('item_id', dbItem.id)
      .eq('user_id', auth.user.id) as { data: DbSyncBankAccount[] | null; error: unknown }

    if (accError) throw accError
    if (!dbAccounts || dbAccounts.length === 0) {
      return withSecurityHeaders(NextResponse.json({ imported: 0, skipped: 0, message: 'Nenhuma conta encontrada para este banco.' }))
    }

    // Calculate date range
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - months)
    const fromStr = from.toISOString().split('T')[0]
    const toStr = to.toISOString().split('T')[0]

    // Fetch already-imported transaction IDs for this user (deduplication)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: alreadyImported } = await (supabase as any)
      .from('bank_imported_transactions')
      .select('pluggy_transaction_id')
      .eq('user_id', auth.user.id) as { data: { pluggy_transaction_id: string }[] | null }

    const importedIds = new Set(
      (alreadyImported ?? []).map((r) => r.pluggy_transaction_id)
    )

    const apiKey = await getApiKey()

    // Sync balances (best-effort)
    try {
      const liveAccounts = await getAccounts(apiKey, dbItem.pluggy_item_id)
      await Promise.all(
        liveAccounts.map((acc) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from('bank_accounts')
            .update({ balance: acc.balance, updated_at: new Date().toISOString() })
            .eq('pluggy_account_id', acc.id)
        )
      )
    } catch {
      // Non-fatal — continue with sync
    }

    let totalImported = 0
    let totalSkipped = 0

    for (const dbAccount of dbAccounts) {
      // Skip investment accounts entirely
      if (dbAccount.type === 'INVESTMENT') {
        continue
      }

      let transactions
      try {
        transactions = await getTransactions(
          apiKey,
          dbAccount.pluggy_account_id,
          fromStr,
          toStr
        )
      } catch {
        continue
      }

      for (const tx of transactions) {
        // Skip pending transactions
        if (tx.status === 'PENDING') {
          totalSkipped++
          continue
        }

        // Skip already imported
        if (importedIds.has(tx.id)) {
          totalSkipped++
          continue
        }

        const txDate = new Date(tx.date)
        const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-01`
        const amount = Math.abs(tx.amount)
        const description = tx.description ?? tx.descriptionRaw ?? 'Transação bancária'

        // ── Routing logic ──────────────────────────────────────────────────

        if (!isPJ) {
          // ── PF mode ───────────────────────────────────────────────────
          // BANK account: only DEBITs become expenses
          // CREDIT account: all transactions become expenses (credit card)
          const shouldImport =
            (dbAccount.type === 'BANK' && tx.type === 'DEBIT') ||
            dbAccount.type === 'CREDIT'

          if (!shouldImport) {
            totalSkipped++
            continue
          }

          const category: ExpenseCategory = mapPluggyCategoryToExpenseCategory(tx.category)

          const { data: record, error: expError } = await supabase
            .from('expenses')
            .insert({
              user_id: auth.user.id,
              category,
              description,
              amount,
              month,
              is_recurring: false,
            })
            .select('id')
            .single()

          if (expError) {
            console.error('[banking/sync] Failed to insert PF expense:', expError.message)
            totalSkipped++
            continue
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('bank_imported_transactions')
            .insert({
              user_id: auth.user.id,
              pluggy_transaction_id: tx.id,
              bank_account_id: dbAccount.id,
              amount,
              description,
              date: tx.date.split('T')[0],
              type: tx.type,
              category,
              pluggy_category: tx.category ?? null,
              imported_to: 'expenses',
              imported_record_id: record.id,
            })

          importedIds.add(tx.id)
          totalImported++

        } else {
          // ── PJ mode ───────────────────────────────────────────────────
          // BANK account DEBIT → business_expenses
          // BANK account CREDIT → business_revenues
          // CREDIT account → business_expenses (credit card = cost to business)

          const isBankDebit = dbAccount.type === 'BANK' && tx.type === 'DEBIT'
          const isBankCredit = dbAccount.type === 'BANK' && tx.type === 'CREDIT'
          const isCreditCard = dbAccount.type === 'CREDIT'

          if (isBankCredit) {
            // Revenue entry
            const revCategory: BusinessRevCategory = mapPluggyCategoryToBusinessRevCategory(tx.category)

            const { data: record, error: revError } = await supabase
              .from('business_revenues')
              .insert({
                user_id: auth.user.id,
                business_id: businessId as string,
                description,
                amount,
                month,
                category: revCategory,
                status: 'received',
                is_recurring: false,
              })
              .select('id')
              .single()

            if (revError) {
              console.error('[banking/sync] Failed to insert PJ revenue:', revError.message)
              totalSkipped++
              continue
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('bank_imported_transactions')
              .insert({
                user_id: auth.user.id,
                pluggy_transaction_id: tx.id,
                bank_account_id: dbAccount.id,
                amount,
                description,
                date: tx.date.split('T')[0],
                type: tx.type,
                category: revCategory,
                pluggy_category: tx.category ?? null,
                imported_to: 'business_revenues',
                imported_record_id: record.id,
              })

            importedIds.add(tx.id)
            totalImported++

          } else if (isBankDebit || isCreditCard) {
            // Expense entry
            const expCategory: BusinessExpCategory = mapPluggyCategoryToBusinessExpCategory(tx.category)

            const { data: record, error: expError } = await supabase
              .from('business_expenses')
              .insert({
                user_id: auth.user.id,
                business_id: businessId as string,
                description,
                amount,
                month,
                category: expCategory,
                status: 'paid',
                is_recurring: false,
              })
              .select('id')
              .single()

            if (expError) {
              console.error('[banking/sync] Failed to insert PJ expense:', expError.message)
              totalSkipped++
              continue
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('bank_imported_transactions')
              .insert({
                user_id: auth.user.id,
                pluggy_transaction_id: tx.id,
                bank_account_id: dbAccount.id,
                amount,
                description,
                date: tx.date.split('T')[0],
                type: tx.type,
                category: expCategory,
                pluggy_category: tx.category ?? null,
                imported_to: 'business_expenses',
                imported_record_id: record.id,
              })

            importedIds.add(tx.id)
            totalImported++

          } else {
            totalSkipped++
          }
        }
      }
    }

    // Update last_synced_at for all accounts in this item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('bank_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('item_id', dbItem.id)
      .eq('user_id', auth.user.id)

    return withSecurityHeaders(
      NextResponse.json({ imported: totalImported, skipped: totalSkipped })
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao sincronizar transações.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}
