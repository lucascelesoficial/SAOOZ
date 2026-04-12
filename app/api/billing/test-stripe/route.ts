import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set in env' }, { status: 500 })
  }

  // Show first/last 4 chars to confirm key identity
  const maskedKey = `${key.slice(0, 12)}...${key.slice(-4)}`

  // Test 1: raw fetch to Stripe
  let fetchResult: string
  try {
    const res = await fetch('https://api.stripe.com/v1/account', {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    const body = await res.json()
    fetchResult = `HTTP ${res.status} — id: ${body.id ?? body.error?.message ?? JSON.stringify(body).slice(0, 100)}`
  } catch (e) {
    fetchResult = `FETCH ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 2: Stripe SDK with Node HTTP client
  let sdkResult: string
  try {
    const StripeModule = await import('stripe')
    const Stripe = StripeModule.default
    const stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia' as const,
      httpClient: Stripe.createNodeHttpClient(),
    })
    const account = await stripe.accounts.retrieve()
    sdkResult = `OK — account: ${account.id}`
  } catch (e) {
    sdkResult = `SDK ERROR: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    keyUsed: maskedKey,
    fetchTest: fetchResult,
    sdkTest: sdkResult,
  })
}
