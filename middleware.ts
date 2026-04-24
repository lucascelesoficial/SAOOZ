import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Security: blocked HTTP methods ───────────────────────────────────────────
const BLOCKED_METHODS = new Set(['TRACE', 'TRACK', 'CONNECT'])

// ── IP-based rate limiting for auth API routes ────────────────────────────────
// Edge-compatible: uses a Map (per-instance memory).
// Not distributed, but provides meaningful friction against single-source attacks.
// Distributed rate limiting for auth is handled server-side in the route handlers.
type RateBucket = { count: number; resetAt: number }
const authRateMap = new Map<string, RateBucket>()

const AUTH_RATE_LIMIT = {
  maxRequests: 10,    // per IP per window
  windowMs: 60_000,   // 1 minute
}

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = authRateMap.get(ip)

  if (!bucket || bucket.resetAt <= now) {
    authRateMap.set(ip, { count: 1, resetAt: now + AUTH_RATE_LIMIT.windowMs })
    return true // allowed
  }
  if (bucket.count >= AUTH_RATE_LIMIT.maxRequests) {
    return false // blocked
  }
  bucket.count++
  return true // allowed
}

function getIpFromRequest(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Security headers injected on every response ───────────────────────────────
// (next.config.mjs handles the full set via `headers()`; middleware adds them
//  to Supabase redirects / NextResponse.redirect which bypass the config headers)
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()'
  )
  return response
}

export async function middleware(request: NextRequest) {

  // ── Block dangerous HTTP methods ──────────────────────────────────────────
  if (BLOCKED_METHODS.has(request.method.toUpperCase())) {
    return new NextResponse(null, { status: 405, headers: { Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD' } })
  }

  // ── IP rate limit on auth API routes ──────────────────────────────────────
  const { pathname } = request.nextUrl
  const isAuthApiRoute = (
    pathname === '/api/auth/callback' ||
    // Supabase GoTrue routes handled by next.js
    pathname.startsWith('/api/auth/')
  )
  const isSensitivePagePost = request.method === 'POST' && (
    pathname === '/login' || pathname === '/cadastro' || pathname === '/esqueci-senha'
  )
  if (isAuthApiRoute || isSensitivePagePost) {
    const ip = getIpFromRequest(request)
    if (!checkAuthRateLimit(ip)) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: 'Muitas tentativas. Aguarde um momento.' }),
          { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
        )
      )
    }
  }

  // ── Supabase session refresh ──────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // pathname already extracted above for rate limiting
  // ── Route classification ──────────────────────────────────────────────────
  const isAuthRoute             = pathname.startsWith('/login') || pathname.startsWith('/cadastro') || pathname.startsWith('/acesso-equipe')
  const isPasswordRoute         = pathname.startsWith('/esqueci-senha') || pathname.startsWith('/redefinir-senha') || pathname.startsWith('/auth/callback')
  const isOnboardingPlano       = pathname.startsWith('/onboarding/plano')
  const isTrialConfirmRoute     = pathname.startsWith('/onboarding/trial-ativo')
  const isOnboardingRoute       = pathname.startsWith('/onboarding')
  const isDemoRoute             = pathname.startsWith('/demo')
  const isApiRoute              = pathname.startsWith('/api/')

  const isProtectedRoute =
    pathname.startsWith('/central') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/despesas') ||
    pathname.startsWith('/financas') ||
    pathname.startsWith('/negocios') ||
    pathname.startsWith('/inteligencia') ||
    pathname.startsWith('/analise') ||
    pathname.startsWith('/configuracoes') ||
    pathname.startsWith('/conta') ||
    pathname.startsWith('/planos') ||
    pathname.startsWith('/empresa') ||
    pathname.startsWith('/reserva-emergencia') ||
    pathname.startsWith('/investimentos') ||
    pathname.startsWith('/perfil-financeiro')

  // ── Allow: static assets, demo, password routes, API (handled internally) ─
  if (isDemoRoute || isPasswordRoute || isApiRoute) {
    return applySecurityHeaders(supabaseResponse)
  }

  // ── Unauthenticated → redirect to login ───────────────────────────────────
  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)   // preserve intended destination
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  if (user) {
    // Fetch subscription + profile mode in parallel (one round-trip).
    const [{ data: sub }, { data: profile }] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('id, status, gateway_subscription_id, payment_method')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('mode, is_team_member')
        .eq('id', user.id)
        .maybeSingle(),
    ])

    // A REAL subscription was created through Stripe checkout and always has
    // gateway_subscription_id set. The billing system auto-creates a fallback
    // row via ensureSubscription() with gateway_subscription_id=null and
    // payment_method='none' — that must NOT count as "has chosen a plan".
    const hasRealSubscription = !!sub && (
      sub.gateway_subscription_id !== null ||
      (sub.payment_method !== null && sub.payment_method !== 'none')
    )

    // Team members were invited by an owner and don't need their own subscription.
    // They bypass the payment gate entirely; the owner's plan controls team access.
    // Primary check: is_team_member flag on profile (set by callback or invite route).
    let isTeamMember = !!(profile as { is_team_member?: boolean } | null)?.is_team_member

    // Fallback check: if profile flag is not set yet (e.g. existing user just invited
    // for the first time, or profile update failed), query business_team_members directly.
    // This table has RLS policy "team_member_self" so auth.uid() can read own rows.
    if (!isTeamMember && !hasRealSubscription && (isProtectedRoute || isAuthRoute)) {
      const { data: teamRow } = await supabase
        .from('business_team_members')
        .select('business_id')
        .eq('member_user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
      if (teamRow) {
        isTeamMember = true
      }
    }

    // mode being set means the user completed the mode-selection onboarding step.
    const hasCompletedOnboarding = !!profile?.mode

    // ── Team member routing (no PF module; always land on /empresa) ───────────
    if (isTeamMember) {
      // Auth routes → always send to /empresa (they don't need login/signup flows)
      if (isAuthRoute) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/empresa', request.url))
        )
      }
      // Personal-finance routes → redirect to the business dashboard
      const isPersonalRoute =
        pathname === '/central' ||
        pathname.startsWith('/central/') ||
        pathname === '/financas' ||
        pathname.startsWith('/financas/') ||
        pathname.startsWith('/despesas') ||
        pathname.startsWith('/investimentos') ||
        pathname.startsWith('/reserva-emergencia') ||
        pathname.startsWith('/perfil-financeiro') ||
        pathname.startsWith('/inteligencia') ||
        pathname.startsWith('/analise')
      if (isPersonalRoute) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/empresa', request.url))
        )
      }
      // Onboarding & plan pages → not needed for team members
      if (isOnboardingPlano || isOnboardingRoute) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/empresa', request.url))
        )
      }
      // Allow all other routes (PJ module, settings, API, etc.)
      return applySecurityHeaders(supabaseResponse)
    }

    // ── No real subscription → force plan selection ──────────────────────────
    // Em desenvolvimento, bypass para facilitar testes locais.
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && !hasRealSubscription && !isOnboardingPlano && !isTrialConfirmRoute) {
      if (isAuthRoute || isProtectedRoute || isOnboardingRoute) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/onboarding/plano', request.url))
        )
      }
    }

    // ── Has real subscription but onboarding incomplete → block dashboard ─
    if (!isDev && hasRealSubscription && !hasCompletedOnboarding && isProtectedRoute) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/onboarding', request.url))
      )
    }

    // ── Auth route for user who already finished onboarding → dash ────────
    if (isAuthRoute && (hasRealSubscription || isDev)) {
      const dest = (hasCompletedOnboarding || isDev) ? '/central' : '/onboarding'
      return applySecurityHeaders(
        NextResponse.redirect(new URL(dest, request.url))
      )
    }
  }

  return applySecurityHeaders(supabaseResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
