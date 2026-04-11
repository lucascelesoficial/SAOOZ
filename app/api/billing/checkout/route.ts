import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { getPlanPriceForDuration } from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  planType: z.enum(['pf', 'pj', 'pro']),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  paymentMethod: z.enum(['pix', 'card']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { planType, duration, paymentMethod } = parsed.data
    const pricing = getPlanPriceForDuration(planType, duration as BillingDuration)

    // If Stripe is configured, use it for card payments
    if (process.env.STRIPE_SECRET_KEY && paymentMethod === 'card') {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' })

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: user.email,
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: `SAOOZ ${planType.toUpperCase()} — ${duration === 1 ? 'Mensal' : duration === 3 ? 'Trimestral' : duration === 6 ? 'Semestral' : 'Anual'}`,
              },
              unit_amount: Math.round(pricing.totalPrice * 100),
            },
            quantity: 1,
          }],
          metadata: {
            user_id: user.id,
            plan_type: planType,
            duration: String(duration),
            payment_method: paymentMethod,
          },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?payment=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?payment=cancelled`,
        })

        return NextResponse.json({ checkoutUrl: session.url, provider: 'stripe' })
      } catch (stripeError) {
        console.error('Stripe checkout error:', stripeError)
        // Fall through to manual flow
      }
    }

    // Manual / PIX flow: create pending subscription and return payment page
    const admin = createOptionalAdminClient()

    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + duration)

    if (admin) {
      // Upsert subscription as pending/past_due while awaiting payment
      await admin.from('subscriptions').upsert({
        user_id: user.id,
        plan_type: planType,
        status: 'past_due', // awaiting payment
        payment_method: paymentMethod,
        billing_duration_months: duration,
        current_period_end: periodEnd.toISOString(),
        gateway: null,
      }, { onConflict: 'user_id' })
    }

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
