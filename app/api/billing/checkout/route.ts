import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/server/request-guard'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  paymentMethod: z.enum(['card']),
  trialDays: z.number().int().min(0).max(30).optional(),
})

const DURATION_KEY: Record<number, string> = { 1: '1M', 3: '3M', 6: '6M', 12: '12M' }

function getPriceId(planType: string, duration: number): string {
  const key = `STRIPE_PRICE_${planType.toUpperCase()}_${DURATION_KEY[duration]}`
  const id = process.env[key]
  if (!id) throw new Error(`Preço não configurado: ${key}`)
  return id
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const auth = await requireUser()
    if (!auth.ok) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    const { user } = auth

    // ── Parse body ────────────────────────────────────────────────────────
    let body: unknown
    try { body = await request.json() } catch { body = null }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { planType, duration, trialDays } = parsed.data

    // ── Stripe key ────────────────────────────────────────────────────────
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe não configurado (chave ausente).' }, { status: 503 })
    }
    if (!secretKey.startsWith('sk_')) {
      return NextResponse.json({ error: 'Stripe não configurado (chave inválida).' }, { status: 503 })
    }

    // ── Price ID ──────────────────────────────────────────────────────────
    const priceId = getPriceId(planType, duration)

    // ── App URL ───────────────────────────────────────────────────────────
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
    if (!appUrl) {
      return NextResponse.json({ error: 'URL do app não configurada.' }, { status: 500 })
    }

    // ── Stripe client ─────────────────────────────────────────────────────
    const StripeModule = await import('stripe')
    const Stripe = StripeModule.default
    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia' as const,
      httpClient: Stripe.createNodeHttpClient(),
    })

    // ── Create session ────────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email ?? undefined,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: trialDays && trialDays > 0
        ? { trial_period_days: trialDays }
        : undefined,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        duration: String(duration),
        payment_method: 'card',
      },
      success_url: trialDays
        ? `${appUrl}/onboarding/trial-ativo`
        : `${appUrl}/central`,
      cancel_url: `${appUrl}/onboarding/plano`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe não retornou URL de checkout.' }, { status: 500 })
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      provider: 'stripe',
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('[checkout] Erro:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
