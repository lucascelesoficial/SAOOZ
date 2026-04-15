import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
    }

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, gateway, gateway_subscription_id, cancel_at_period_end, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subError || !sub) {
      return NextResponse.json({ error: 'Assinatura nao encontrada.' }, { status: 404 })
    }

    if (sub.cancel_at_period_end) {
      return NextResponse.json({ error: 'Cancelamento ja agendado para o fim do periodo.' }, { status: 400 })
    }

    if (sub.status === 'canceled' || sub.status === 'expired' || sub.status === 'inactive') {
      return NextResponse.json({ error: 'Assinatura ja encerrada.' }, { status: 400 })
    }

    // Schedule Stripe cancel at period end (not immediate)
    if (sub.gateway === 'stripe' && sub.gateway_subscription_id) {
      const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
      if (stripeKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const StripeModule = await import('stripe') as any
        const StripeClient = StripeModule.default ?? StripeModule
        const stripe = new StripeClient(stripeKey, {
          apiVersion: '2026-03-25.dahlia',
          httpClient: StripeClient.createNodeHttpClient(),
        })
        await stripe.subscriptions.update(sub.gateway_subscription_id, {
          cancel_at_period_end: true,
        })
      }
    }

    // Update DB record
    const admin = createOptionalAdminClient()
    const db = admin ?? supabase
    const { error: updateError } = await db
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    if (updateError) {
      console.error('Cancel update error:', updateError.message)
      return NextResponse.json({ error: 'Erro ao registrar cancelamento.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('Cancel subscription error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
