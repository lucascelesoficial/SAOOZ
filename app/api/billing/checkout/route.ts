import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getPlanPriceForDuration, getDurationLabel } from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'
import type { BillingGateway } from '@/types/database.types'
import { resolveCheckoutProvider } from '@/lib/billing/providers'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  paymentMethod: z.enum(['pix', 'card']),
  gateway: z.enum(['stripe', 'kiwify', 'cakto']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 })
    }

    const { planType, duration, paymentMethod, gateway } = parsed.data
    const pricing = getPlanPriceForDuration(planType, duration as BillingDuration)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

    const runtimeProvider = resolveCheckoutProvider({
      requestedProvider: (gateway ?? undefined) as BillingGateway | undefined,
      paymentMethod,
    })

    if (gateway && !runtimeProvider) {
      return NextResponse.json(
        {
          error: `Provider "${gateway}" nao esta configurado para o metodo ${paymentMethod}.`,
        },
        { status: 400 }
      )
    }

    if (runtimeProvider) {
      // A configured provider is available — attempt checkout. Do NOT fall
      // through to manual PIX if this fails: a provider error means the
      // payment flow is broken, not that we should silently downgrade.
      const checkout = await runtimeProvider.createCheckout({
        userId: user.id,
        userEmail: user.email ?? null,
        planType,
        durationMonths: duration,
        paymentMethod,
        amountCents: Math.round(pricing.totalPrice * 100),
        currency: 'BRL',
        productName: `SAOOZ ${planType.toUpperCase()} - ${getDurationLabel(duration)}`,
        successUrl: `${appUrl}/onboarding/documento?plan=${planType}&redirect=${encodeURIComponent(planType === 'pj' ? '/empresa' : '/central')}`,
        cancelUrl: `${appUrl}/planos?payment=cancelled`,
      })

      return NextResponse.json({
        checkoutUrl: checkout.checkoutUrl,
        provider: checkout.gateway,
        references: checkout.references,
      })
    }

    // No configured provider — fall back to manual PIX instructions.
    // Subscription state is NOT touched here: it will be updated by the
    // webhook handler after payment is confirmed by the operator.
    const pixKey = process.env.PIX_KEY ?? null
    const pixName = process.env.PIX_NAME ?? 'SAOOZ'
    const pixKeyParam = pixKey ? `&pixKey=${encodeURIComponent(pixKey)}` : ''
    const pixNameParam = `&pixName=${encodeURIComponent(pixName)}`

    return NextResponse.json({
      provider: 'manual',
      paymentMethod,
      planType,
      duration,
      totalPrice: pricing.totalPrice,
      effectiveMonthly: pricing.effectiveMonthly,
      pixKey,
      pixName,
      checkoutUrl: `/planos/pagamento?plan=${planType}&duration=${duration}&method=${paymentMethod}&total=${pricing.totalPrice}${pixKeyParam}${pixNameParam}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('Checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
