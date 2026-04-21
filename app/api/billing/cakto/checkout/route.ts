/**
 * POST /api/billing/cakto/checkout
 *
 * Returns a Cakto hosted-checkout URL for the requested plan/duration/method.
 * The provider is activated only when the required env vars are present:
 *
 *   Required:
 *     CAKTO_WEBHOOK_SECRET          – shared secret Cakto sends in webhook body
 *
 *   Optional (enables offer-availability pre-check before redirect):
 *     CAKTO_CLIENT_ID               – OAuth2 client ID from Cakto dashboard
 *     CAKTO_CLIENT_SECRET           – OAuth2 client secret from Cakto dashboard
 *
 *   Checkout targets — pick ONE strategy:
 *
 *   Strategy A — individual env vars (simplest):
 *     CAKTO_CHECKOUT_{PLAN}_{DURATION}_{METHOD}
 *     e.g. CAKTO_CHECKOUT_PF_1_PIX=https://pay.cakto.com.br/<offer-id>
 *          CAKTO_CHECKOUT_PF_1_CARD=https://pay.cakto.com.br/<offer-id>
 *          CAKTO_CHECKOUT_PJ_1_PIX=https://pay.cakto.com.br/<offer-id>
 *          ... (plans: PF/PJ/PRO × durations: 1/3/6/12 × methods: PIX/CARD)
 *
 *   Strategy B — single JSON map (easier to version-control):
 *     CAKTO_CHECKOUT_MAP_JSON={"pf":{"1":{"pix":"<offer-id>","card":"<offer-id>"},...}}
 *
 *   How to get offer IDs:
 *     Cakto Dashboard → Products → select product → Offers → copy the offer slug
 *     from the checkout URL: https://pay.cakto.com.br/<OFFER-ID-HERE>
 *
 *   Webhook endpoint to register in Cakto:
 *     https://saooz.com/api/billing/webhook   (same endpoint as Stripe — provider
 *     is auto-detected from the request body)
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/server/request-guard'
import {
  requireSameOrigin,
  requireJsonContentType,
  rejectLargeBody,
  withSecurityHeaders,
} from '@/lib/server/security'
import { createClient } from '@/lib/supabase/server'
import { getBillingProvider } from '@/lib/billing/providers'
import { PLAN_CATALOG } from '@/lib/billing/plans'
import type { SubscriptionPlanType } from '@/types/database.types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const checkoutSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(12)]),
  paymentMethod: z.enum(['pix', 'card']).default('pix'),
})

// Prices in cents — Clareza R$37 | Gestão R$97 | Comando R$147 — anual -25%
const PLAN_PRICES_CENTS: Record<SubscriptionPlanType, Record<number, number>> = {
  pf:  { 1: 3700,  3: 11100,  12: 33300  },
  pj:  { 1: 9700,  3: 29100,  12: 87300  },
  pro: { 1: 14700, 3: 44100,  12: 132300 },
}

export async function POST(request: NextRequest) {
  // ── CSRF / Content-Type / body-size guards ────────────────────────────────
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 512)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const auth = await requireUser()
    if (!auth.ok) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.' },
        { status: 401 }
      ))
    }
    const { user } = auth

    // ── Provider availability ─────────────────────────────────────────────
    const provider = getBillingProvider('cakto')
    if (!provider.isConfigured()) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Método de pagamento indisponível no momento.' },
        { status: 503 }
      ))
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let body: unknown
    try { body = await request.json() } catch { body = null }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Dados inválidos.' },
        { status: 400 }
      ))
    }

    const { planType, duration, paymentMethod } = parsed.data

    if (!provider.supportsPaymentMethod(paymentMethod)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Método de pagamento não suportado.' },
        { status: 400 }
      ))
    }

    // ── App URL ────────────────────────────────────────────────────────────
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '')
    if (!appUrl) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Erro de configuração do servidor.' },
        { status: 500 }
      ))
    }

    // ── Supabase email (best-effort) ───────────────────────────────────────
    let userEmail: string | null = user.email ?? null
    if (!userEmail) {
      try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()
        userEmail = data.user?.email ?? null
      } catch {
        // non-fatal
      }
    }

    // ── Create checkout ────────────────────────────────────────────────────
    const planInfo = PLAN_CATALOG[planType as SubscriptionPlanType]
    const amountCents = PLAN_PRICES_CENTS[planType as SubscriptionPlanType]?.[duration] ?? 0

    const result = await provider.createCheckout({
      userId: user.id,
      userEmail,
      planType: planType as SubscriptionPlanType,
      durationMonths: duration,
      paymentMethod,
      amountCents,
      currency: 'BRL',
      productName: planInfo?.name ?? planType.toUpperCase(),
      successUrl: `${appUrl}/central?checkout=success`,
      cancelUrl: `${appUrl}/planos?checkout=cancelled`,
    })

    return withSecurityHeaders(NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      provider: 'cakto',
      gateway: result.gateway,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('[cakto/checkout] unexpected error:', message, error)
    return withSecurityHeaders(NextResponse.json(
      { error: 'Erro ao processar pagamento.' },
      { status: 500 }
    ))
  }
}
