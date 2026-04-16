import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Temporary diagnostic endpoint — shows env var status without exposing secrets
// Visit: /api/billing/diag
export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
  const pfPrice   = process.env.STRIPE_PRICE_PF_1M ?? ''
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const supaUrl   = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const result = {
    stripe_key:    stripeKey  ? `${stripeKey.substring(0, 14)}... (${stripeKey.length} chars)` : 'NOT SET',
    stripe_mode:   stripeKey.startsWith('sk_live_') ? 'LIVE ✓' : stripeKey.startsWith('sk_test_') ? 'TEST ⚠' : 'INVALID ✗',
    pf_1m_price:   pfPrice   ? `${pfPrice.substring(0, 20)}... ✓` : 'NOT SET ✗',
    app_url:       appUrl    ? `${appUrl} ✓` : 'NOT SET ✗',
    supabase_url:  supaUrl   ? `${supaUrl.substring(0, 30)}... ✓` : 'NOT SET ✗',
    node_env:      process.env.NODE_ENV ?? 'unknown',
  }

  // Try to instantiate Stripe
  let stripeStatus = 'not tested'
  if (stripeKey.startsWith('sk_')) {
    try {
      const StripeModule = await import('stripe')
      const Stripe = StripeModule.default
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-03-25.dahlia' as const,
        httpClient: Stripe.createNodeHttpClient(),
      })
      // Lightweight test: list 1 price
      const prices = await stripe.prices.list({ limit: 1 })
      stripeStatus = `OK - ${prices.data.length} price(s) visible`
    } catch (e) {
      stripeStatus = `ERROR: ${e instanceof Error ? e.message : String(e)}`
    }
  } else {
    stripeStatus = 'skipped - key not valid'
  }

  return NextResponse.json({ ...result, stripe_api_test: stripeStatus })
}
