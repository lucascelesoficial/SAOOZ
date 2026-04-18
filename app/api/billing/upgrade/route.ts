import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { requireSameOrigin, requireJsonContentType, withSecurityHeaders } from '@/lib/server/security'
import { logAuditEvent, getClientIp } from '@/lib/server/audit'
import { PLAN_CATALOG, getPlanPriceForDuration } from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'
import type { SubscriptionPlanType } from '@/types/database.types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const upgradeSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]).optional(),
  preview: z.boolean().optional().default(false),
})

const DURATION_KEY: Record<number, string> = { 1: '1M', 3: '3M', 6: '6M', 12: '12M' }

function priceEnvKey(planType: string, duration: number) {
  return `STRIPE_PRICE_${planType.toUpperCase()}_${DURATION_KEY[duration]}`
}

// Plan rank: higher = more features
const PLAN_RANK: Record<SubscriptionPlanType, number> = { pf: 0, pj: 1, pro: 2 }

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }

    let body: unknown
    try { body = await request.json() } catch { body = null }

    const parsed = upgradeSchema.safeParse(body)
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 }))
    }

    const { planType: newPlanType, duration: requestedDuration, preview } = parsed.data

    // Get current subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, plan_type, billing_duration_months, gateway, gateway_subscription_id, gateway_customer_id, current_period_end, trial_ends_at, cancel_at_period_end')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subError || !sub) {
      return withSecurityHeaders(NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 }))
    }

    if (!['active', 'trialing'].includes(sub.status)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Assinatura não está ativa.' }, { status: 400 }))
    }

    if (sub.cancel_at_period_end) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não é possível fazer upgrade com cancelamento agendado.' }, { status: 400 }))
    }

    // Upgrade = higher plan rank OR same rank with longer duration
    const currentRank = PLAN_RANK[sub.plan_type]
    const newRank = PLAN_RANK[newPlanType]
    const currentDuration = (sub.billing_duration_months ?? 1) as BillingDuration
    // Requested duration: if not provided, default to current (plan-rank upgrade keeps same duration)
    const duration = (requestedDuration ?? currentDuration) as BillingDuration

    const isHigherPlan = newRank > currentRank
    const isSamePlanLongerDuration = newRank === currentRank && duration > currentDuration

    if (!isHigherPlan && !isSamePlanLongerDuration) {
      return withSecurityHeaders(NextResponse.json({
        error: `Não é possível fazer upgrade: escolha um plano superior ou uma duração maior.`,
      }, { status: 400 }))
    }

    if (sub.gateway !== 'stripe' || !sub.gateway_subscription_id) {
      return withSecurityHeaders(NextResponse.json({ error: 'Assinatura sem vínculo com Stripe.' }, { status: 400 }))
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
    if (!stripeKey) {
      return withSecurityHeaders(NextResponse.json({ error: 'Stripe não configurado.' }, { status: 503 }))
    }
    const envKey = priceEnvKey(newPlanType, duration)
    const newPriceId = process.env[envKey]?.trim()

    if (!newPriceId) {
      return withSecurityHeaders(NextResponse.json({
        error: `Price ID não configurado: ${envKey}. Configure a variável de ambiente no painel da Vercel.`,
      }, { status: 503 }))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StripeModule = await import('stripe') as any
    const StripeClient = StripeModule.default ?? StripeModule
    const stripe = new StripeClient(stripeKey, {
      apiVersion: '2026-03-25.dahlia',
      httpClient: StripeClient.createNodeHttpClient(),
      maxNetworkRetries: 2,
      timeout: 20_000,
    })

    // Retrieve Stripe subscription to get the subscription item ID
    const stripeSub = await stripe.subscriptions.retrieve(sub.gateway_subscription_id)
    const subscriptionItem = stripeSub.items?.data?.[0]

    if (!subscriptionItem) {
      return withSecurityHeaders(NextResponse.json({
        error: 'Não foi possível identificar o item da assinatura no Stripe.',
      }, { status: 500 }))
    }

    const prorationDate = Math.floor(Date.now() / 1000)

    if (preview) {
      // Preview the proration — what will be charged immediately
      // stripe.invoices.createPreview() replaced retrieveUpcoming() in Stripe SDK v22
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const upcomingInvoice = await stripe.invoices.createPreview({
        customer: stripeSub.customer as string,
        subscription: sub.gateway_subscription_id,
        subscription_details: {
          items: [{ id: subscriptionItem.id, price: newPriceId }],
          proration_behavior: 'create_prorations',
          proration_date: prorationDate,
        },
      })

      // Credit = unused value of current plan (negative line items)
      const lines = (upcomingInvoice.lines?.data ?? []) as Array<{ amount: number }>
      const credit = lines
        .filter((l) => l.amount < 0)
        .reduce((sum, l) => sum + Math.abs(l.amount), 0) / 100

      // Immediate charge = total amount due now (can be 0 if credit covers it)
      const immediateCharge = Math.max(0, (upcomingInvoice.amount_due ?? 0)) / 100

      const newPlanPricing = getPlanPriceForDuration(newPlanType, duration)

      return withSecurityHeaders(NextResponse.json({
        preview: true,
        currentPlan: sub.plan_type,
        currentPlanName: PLAN_CATALOG[sub.plan_type].name,
        newPlan: newPlanType,
        newPlanName: PLAN_CATALOG[newPlanType].name,
        duration,
        credit,
        immediateCharge,
        nextBillingAmount: newPlanPricing.totalPrice,
        nextBillingDate: sub.current_period_end,
      }))
    }

    // ── Apply the upgrade ──────────────────────────────────────────────────
    await stripe.subscriptions.update(sub.gateway_subscription_id, {
      items: [{ id: subscriptionItem.id, price: newPriceId }],
      proration_behavior: 'create_prorations',
      proration_date: prorationDate,
    })

    // Update plan_type and billing_duration_months in DB immediately (webhook will confirm later)
    const admin = createOptionalAdminClient()
    const db = admin ?? supabase
    await db
      .from('subscriptions')
      .update({ plan_type: newPlanType, billing_duration_months: duration })
      .eq('id', sub.id)

    await logAuditEvent({
      userId: user.id,
      actorType: 'user',
      actionType: 'subscription.plan_changed',
      resourceType: 'subscription',
      resourceId: sub.id,
      metadata: {
        from_plan: sub.plan_type,
        to_plan: newPlanType,
        from_duration: currentDuration,
        to_duration: duration,
        gateway_subscription_id: sub.gateway_subscription_id,
        ip: getClientIp(request),
      },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      newPlan: newPlanType,
      newPlanName: PLAN_CATALOG[newPlanType].name,
    }))

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('[upgrade] error:', message)
    // Never leak internal error details to the client in production
    const clientMessage = process.env.NODE_ENV === 'production'
      ? 'Não foi possível processar o upgrade. Tente novamente ou contate o suporte.'
      : message
    return withSecurityHeaders(NextResponse.json({ error: clientMessage }, { status: 500 }))
  }
}
