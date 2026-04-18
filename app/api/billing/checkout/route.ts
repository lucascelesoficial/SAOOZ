import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/server/request-guard'
import { PLAN_CATALOG } from '@/lib/billing/plans'
import type { SubscriptionPlanType } from '@/types/database.types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const checkoutSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  paymentMethod: z.enum(['card']),
})

const DURATION_KEY: Record<number, string> = { 1: '1M', 3: '3M', 6: '6M', 12: '12M' }

function priceEnvKey(planType: string, duration: number) {
  return `STRIPE_PRICE_${planType.toUpperCase()}_${DURATION_KEY[duration]}`
}

function log(...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[checkout]', ...args)
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const auth = await requireUser()
    if (!auth.ok) {
      log('401 unauthenticated')
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 })
    }
    const { user } = auth

    // ── Parse body ────────────────────────────────────────────────────────
    let body: unknown
    try { body = await request.json() } catch { body = null }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      log('400 invalid body', parsed.error.issues)
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { planType, duration } = parsed.data
    log('request', { userId: user.id, planType, duration })

    // ── Stripe key ────────────────────────────────────────────────────────
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
    if (!secretKey) {
      log('503 missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Stripe não configurado no servidor (STRIPE_SECRET_KEY ausente).' },
        { status: 503 }
      )
    }
    if (!secretKey.startsWith('sk_')) {
      log('503 invalid key format')
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY inválida (deve começar com sk_test_ ou sk_live_).' },
        { status: 503 }
      )
    }
    const keyMode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'
    log('stripe key mode:', keyMode)

    // ── Price ID ──────────────────────────────────────────────────────────
    const envKey = priceEnvKey(planType, duration)
    const priceId = process.env[envKey]?.trim()
    if (!priceId) {
      log(`503 missing ${envKey}`)
      return NextResponse.json(
        { error: `Price ID não configurado: ${envKey}. Crie o preço no Stripe e defina a env var.` },
        { status: 503 }
      )
    }
    if (!priceId.startsWith('price_')) {
      log(`503 invalid ${envKey}=${priceId.substring(0, 12)}...`)
      return NextResponse.json(
        { error: `${envKey} inválido (deve começar com price_).` },
        { status: 503 }
      )
    }

    // ── App URL ───────────────────────────────────────────────────────────
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '')
    if (!appUrl) {
      log('500 missing NEXT_PUBLIC_APP_URL')
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL não configurada no servidor.' },
        { status: 500 }
      )
    }

    // ── Stripe client ─────────────────────────────────────────────────────
    const StripeModule = await import('stripe')
    const Stripe = StripeModule.default
    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia' as const,
      httpClient: Stripe.createNodeHttpClient(),
      maxNetworkRetries: 2,
      timeout: 20_000,
    })

    // ── Create session ────────────────────────────────────────────────────
    log('creating session', { priceId })

    const planName = PLAN_CATALOG[planType as SubscriptionPlanType]?.name ?? planType.toUpperCase()
    const durationLabel: Record<number, string> = { 1: 'mensal', 3: 'trimestral', 6: 'semestral', 12: 'anual' }

    let session
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        locale: 'pt-BR',
        customer_email: user.email ?? undefined,
        customer_creation: 'always',

        // ── Payment methods ───────────────────────────────────────────────
        // card + boleto (boleto enabled on this Stripe account for BR)
        payment_method_types: ['card', 'boleto'],
        payment_method_options: {
          boleto: {
            expires_after_days: 3,
          },
        },

        // ── Billing address ───────────────────────────────────────────────
        // Required for boleto and improves fraud signals on card
        billing_address_collection: 'required',

        // ── Line items ────────────────────────────────────────────────────
        line_items: [{ price: priceId, quantity: 1 }],

        // ── Subscription data ─────────────────────────────────────────────
        subscription_data: { metadata: { user_id: user.id, plan_type: planType, trial_days: '0' } },

        // ── Session metadata ──────────────────────────────────────────────
        metadata: {
          user_id: user.id,
          plan_type: planType,
          duration: String(duration),
          payment_method: 'card',
          trial_days: '0',
        },

        // ── Custom text (SAOOZ branding) ──────────────────────────────────
        custom_text: {
          submit: {
            message: `Plano ${planName} ${durationLabel[duration] ?? ''} — acesso imediato após confirmação do pagamento.`,
          },
          after_submit: {
            message: 'Seus dados de pagamento são processados com segurança pelo Stripe. A SAOOZ nunca armazena informações do seu cartão.',
          },
        },

        // ── Promotions ────────────────────────────────────────────────────
        allow_promotion_codes: true,

        // ── URLs ──────────────────────────────────────────────────────────
        success_url: `${appUrl}/central?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/onboarding/plano?checkout=cancelled`,
      })
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr)
      log('stripe API error:', msg)

      // Translate known Stripe errors into actionable messages
      let friendly = `Stripe rejeitou a requisição: ${msg}`
      if (/recurring price/i.test(msg)) {
        friendly = `O preço ${envKey} (${priceId.substring(0, 18)}...) foi criado como "One-time" no Stripe. Para assinaturas, recrie-o como "Recurring" no dashboard do Stripe e atualize a env var.`
      } else if (/No such price/i.test(msg)) {
        friendly = `Price ID ${priceId} não existe no modo ${keyMode}. Verifique se foi criado em Test mode (se a chave é sk_test_) ou Live mode (se é sk_live_).`
      } else if (/Invalid API Key/i.test(msg)) {
        friendly = `STRIPE_SECRET_KEY inválida ou expirada. Gere uma nova em https://dashboard.stripe.com/apikeys`
      }

      // In production, never leak internal Stripe details (key names, modes, raw errors)
      const isProd = process.env.NODE_ENV === 'production'
      return NextResponse.json(
        isProd
          ? { error: friendly }
          : { error: friendly, envKey, keyMode, stripeMessage: msg },
        { status: 502 }
      )
    }

    if (!session.url) {
      log('500 session without url')
      return NextResponse.json(
        { error: 'Stripe não retornou URL de checkout.' },
        { status: 500 }
      )
    }

    log('session created', session.id)
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      provider: 'stripe',
      mode: keyMode,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('[checkout] unexpected error:', message, error)
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 })
  }
}
