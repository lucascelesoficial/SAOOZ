import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { requireSameOrigin, requireJsonContentType, withSecurityHeaders } from '@/lib/server/security'
import { logAuditEvent, getClientIp } from '@/lib/server/audit'

export const dynamic = 'force-dynamic'

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
      return withSecurityHeaders(NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 }))
    }

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, gateway, gateway_subscription_id, cancel_at_period_end, current_period_end, trial_ends_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (subError || !sub) {
      return withSecurityHeaders(NextResponse.json({ error: 'Assinatura nao encontrada.' }, { status: 404 }))
    }

    if (sub.cancel_at_period_end) {
      return withSecurityHeaders(NextResponse.json({ error: 'Cancelamento ja agendado para o fim do periodo.' }, { status: 400 }))
    }

    if (sub.status === 'canceled' || sub.status === 'expired' || sub.status === 'inactive') {
      return withSecurityHeaders(NextResponse.json({ error: 'Assinatura ja encerrada.' }, { status: 400 }))
    }

    // Detect trial by trial_ends_at being in the future — works for both
    // status='trialing' and status='active' with an ongoing trial period
    const now = new Date()
    const isInTrial = !!(sub.trial_ends_at && new Date(sub.trial_ends_at) > now)

    // Schedule Stripe cancel at trial end (for trials) or billing period end (for paid)
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
        if (isInTrial && sub.trial_ends_at) {
          // Cancel exactly at trial end, not at the 30-day billing cycle
          const cancelAt = Math.floor(new Date(sub.trial_ends_at).getTime() / 1000)
          await stripe.subscriptions.update(sub.gateway_subscription_id, {
            cancel_at: cancelAt,
          })
        } else {
          await stripe.subscriptions.update(sub.gateway_subscription_id, {
            cancel_at_period_end: true,
          })
        }
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
      return withSecurityHeaders(NextResponse.json({ error: 'Erro ao registrar cancelamento.' }, { status: 500 }))
    }

    await logAuditEvent({
      userId: user.id,
      actorType: 'user',
      actionType: 'subscription.canceled',
      resourceType: 'subscription',
      resourceId: sub.id,
      metadata: {
        gateway: sub.gateway,
        gateway_subscription_id: sub.gateway_subscription_id,
        cancel_at_period_end: true,
        ip: getClientIp(request),
      },
    })

    return withSecurityHeaders(NextResponse.json({ success: true }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    console.error('Cancel subscription error:', message)
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}
