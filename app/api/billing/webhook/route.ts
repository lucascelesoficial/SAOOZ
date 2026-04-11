import { NextRequest, NextResponse } from 'next/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// This webhook can be called by Stripe, Kiwify, Cakto, or manually by admin
// For Stripe, it verifies the signature
// For others, it uses a shared secret in the header
export async function POST(request: NextRequest) {
  try {
    const admin = createOptionalAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured.' }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const manualSecret = process.env.BILLING_WEBHOOK_SECRET

    let payload: {
      userId: string
      planType: 'pf' | 'pj' | 'pro'
      duration: 1 | 3 | 6 | 12
      paymentMethod: 'card' | 'pix'
      gateway: 'stripe' | 'kiwify' | 'cakto' | null
      gatewayPaymentId?: string
      amount: number
    } | null = null

    // Stripe webhook
    if (signature && webhookSecret && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as { metadata?: Record<string, string>; amount_total?: number; id?: string }
          const meta = session.metadata ?? {}
          payload = {
            userId: meta.user_id,
            planType: (meta.plan_type ?? 'pf') as 'pf' | 'pj' | 'pro',
            duration: (Number(meta.duration) ?? 1) as 1 | 3 | 6 | 12,
            paymentMethod: (meta.payment_method ?? 'card') as 'card' | 'pix',
            gateway: 'stripe',
            gatewayPaymentId: session.id,
            amount: (session.amount_total ?? 0) / 100,
          }
        }
      } catch (err) {
        console.error('Stripe webhook error:', err)
        return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 })
      }
    }

    // Manual webhook (admin or PIX confirmation)
    if (!payload && manualSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${manualSecret}`) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
      }
      payload = JSON.parse(body)
    }

    if (!payload) {
      return NextResponse.json({ error: 'Could not parse webhook.' }, { status: 400 })
    }

    const { userId, planType, duration, paymentMethod, gateway, gatewayPaymentId, amount } = payload

    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + duration)

    // Activate subscription
    const { error: subError } = await admin.from('subscriptions').upsert({
      user_id: userId,
      plan_type: planType,
      status: 'active',
      payment_method: paymentMethod,
      billing_duration_months: duration,
      current_period_end: periodEnd.toISOString(),
      trial_ends_at: null,
      gateway: gateway,
      gateway_subscription_id: gatewayPaymentId ?? null,
    }, { onConflict: 'user_id' })

    if (subError) {
      console.error('Subscription activation error:', subError)
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    // Reset usage limits for new billing cycle
    await admin.from('usage_limits').upsert({
      user_id: userId,
      transactions_used: 0,
      ai_actions_used: 0,
      reset_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id' })

    // Log payment
    const { data: subData } = await admin.from('subscriptions').select('id').eq('user_id', userId).single()
    await admin.from('payments').insert({
      user_id: userId,
      subscription_id: subData?.id ?? '',
      amount,
      status: 'paid',
      payment_method: paymentMethod,
      gateway: gateway,
      gateway_payment_id: gatewayPaymentId ?? null,
    })

    console.log(`Subscription activated: user=${userId} plan=${planType} duration=${duration}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('Webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
