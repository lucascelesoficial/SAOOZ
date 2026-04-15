/**
 * Cron: Monthly financial digest
 * Runs on the 1st of every month at 09:00 BRT (12:00 UTC).
 * Sends a closing summary of the previous month to every active user.
 *
 * Protected by CRON_SECRET header (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMonthlyDigestEmail, type MonthlyDigestData } from '@/lib/email/sender'

function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')
  return secret === `Bearer ${process.env.CRON_SECRET}`
}

/** Returns YYYY-MM-01 / YYYY-MM-31 for the previous calendar month */
function previousMonthRange(): { start: string; end: string; label: string } {
  const now   = new Date()
  const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = now.getMonth() === 0 ? 12 : now.getMonth() // 1-based
  const last  = new Date(year, month, 0).getDate()         // last day
  const pad   = (n: number) => String(n).padStart(2, '0')
  const MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ]
  return {
    start: `${year}-${pad(month)}-01`,
    end:   `${year}-${pad(month)}-${last}`,
    label: `${MONTHS[month - 1]} ${year}`,
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  moradia: 'Moradia', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', educacao: 'Educação', lazer: 'Lazer',
  assinaturas: 'Assinaturas', vestuario: 'Vestuário', outros: 'Outros',
  fixo_aluguel: 'Aluguel', fixo_salarios: 'Salários', fixo_prolabore: 'Pró-labore',
  variavel_comissao: 'Comissão', variavel_trafego: 'Tráfego',
  operacional_marketing: 'Marketing', operacional_admin: 'Administrativo',
}

function catLabel(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { start, end, label } = previousMonthRange()

  let sent     = 0
  let skipped  = 0
  const errors: string[] = []

  try {
    // ── Fetch all active profiles ─────────────────────────────────────────────
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, mode, active_business_id')
      .not('email', 'is', null)

    if (!profiles?.length) {
      return NextResponse.json({ sent: 0, skipped: 0, message: 'No profiles' })
    }

    for (const profile of profiles) {
      if (!profile.email) { skipped++; continue }

      try {
        // ── PF digest ──────────────────────────────────────────────────────────
        if (profile.mode === 'pf' || profile.mode === 'both') {
          const [{ data: incomes }, { data: expenses }] = await Promise.all([
            supabase
              .from('income_sources')
              .select('amount')
              .eq('user_id', profile.id),
            supabase
              .from('expenses')
              .select('amount, category')
              .eq('user_id', profile.id)
              .gte('date', start)
              .lte('date', end),
          ])

          const totalIncome   = (incomes ?? []).reduce((s: number, i: { amount: number }) => s + (i.amount ?? 0), 0)
          const totalExpenses = (expenses ?? []).reduce((s: number, e: { amount: number; category: string }) => s + (e.amount ?? 0), 0)
          const balance       = totalIncome - totalExpenses

          if (totalIncome === 0 && totalExpenses === 0) { skipped++; continue }

          // Top category by amount
          const catMap: Record<string, number> = {}
          for (const e of expenses ?? []) {
            if (e.category) catMap[e.category] = (catMap[e.category] ?? 0) + e.amount
          }
          const topEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

          const digestData: MonthlyDigestData = {
            month:         label,
            totalIncome,
            totalExpenses,
            balance,
            topCategory:   topEntry ? catLabel(topEntry[0]) : '—',
            topAmount:     topEntry?.[1] ?? 0,
            savingsRate:   totalIncome > 0 ? Math.max(0, balance / totalIncome) : 0,
            scope:         'pf',
          }

          await sendMonthlyDigestEmail(profile.email, profile.name, digestData)
          sent++
        }

        // ── PJ digest ──────────────────────────────────────────────────────────
        if ((profile.mode === 'pj' || profile.mode === 'both') && profile.active_business_id) {
          const bizId = profile.active_business_id

          const [{ data: revenues }, { data: expenses }, { data: biz }] = await Promise.all([
            supabase
              .from('business_revenues')
              .select('amount')
              .eq('business_id', bizId)
              .gte('date', start)
              .lte('date', end),
            supabase
              .from('business_expenses')
              .select('amount, category')
              .eq('business_id', bizId)
              .gte('date', start)
              .lte('date', end),
            supabase
              .from('business_profiles')
              .select('name')
              .eq('id', bizId)
              .single(),
          ])

          const totalIncome   = (revenues ?? []).reduce((s: number, r: { amount: number }) => s + (r.amount ?? 0), 0)
          const totalExpenses = (expenses ?? []).reduce((s: number, e: { amount: number; category: string }) => s + (e.amount ?? 0), 0)
          const balance       = totalIncome - totalExpenses

          if (totalIncome === 0 && totalExpenses === 0) { skipped++; continue }

          const catMap: Record<string, number> = {}
          for (const e of expenses ?? []) {
            if (e.category) catMap[e.category] = (catMap[e.category] ?? 0) + e.amount
          }
          const topEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

          const digestData: MonthlyDigestData = {
            month:         label,
            totalIncome,
            totalExpenses,
            balance,
            topCategory:   topEntry ? catLabel(topEntry[0]) : '—',
            topAmount:     topEntry?.[1] ?? 0,
            savingsRate:   totalIncome > 0 ? Math.max(0, balance / totalIncome) : 0,
            scope:         'pj',
            businessName:  biz?.name,
          }

          await sendMonthlyDigestEmail(profile.email, profile.name, digestData)
          sent++
        }

      } catch (err) {
        errors.push(`user ${profile.id}: ${String(err)}`)
      }
    }

    return NextResponse.json({
      ok:     true,
      sent,
      skipped,
      period: `${start} → ${end}`,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err) {
    console.error('[cron/monthly-digest]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
