import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  const { pathname } = request.nextUrl

  const isAuthRoute       = pathname.startsWith('/login') || pathname.startsWith('/cadastro')
  const isPasswordRoute   = pathname.startsWith('/esqueci-senha') || pathname.startsWith('/redefinir-senha') || pathname.startsWith('/auth/callback')
  const isOnboardingPlano       = pathname.startsWith('/onboarding/plano')
  const isTrialConfirmRoute     = pathname.startsWith('/onboarding/trial-ativo')
  const isOnboardingRoute       = pathname.startsWith('/onboarding')
  const isDemoRoute       = pathname.startsWith('/demo')

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

  // Always allow: password reset, demo, static
  if (isDemoRoute || isPasswordRoute) {
    return supabaseResponse
  }

  // Not logged in → login (except auth routes)
  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in + trying to access login/cadastro → check where to send
  if (user && isAuthRoute) {
    // Will be handled below after subscription check
  }

  if (user) {
    // Check if user has an active subscription or trial
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .maybeSingle()

    const hasSubscription = !!sub

    // No subscription → force plan selection
    // Exceptions: /onboarding/plano itself and /onboarding/trial-ativo (Stripe return URL,
    // webhook may not have fired yet when the redirect lands)
    if (!hasSubscription && !isOnboardingPlano && !isTrialConfirmRoute) {
      if (isAuthRoute || isProtectedRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL('/onboarding/plano', request.url))
      }
    }

    // Has subscription + on auth route → go to dashboard
    if (isAuthRoute) {
      if (hasSubscription) {
        return NextResponse.redirect(new URL('/central', request.url))
      }
      // No subscription handled above
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
