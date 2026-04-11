import { NextResponse } from 'next/server'
import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getBillingSnapshot } from '@/lib/billing/server'
import {
  ACTIVE_BUSINESS_COOKIE,
  ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS,
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const snapshot = await getBillingSnapshot(user.id)
    const access = getBillingAccess(snapshot)

    if (!access.businessModule) {
      return NextResponse.json(
        {
          error: 'Seu plano atual não libera a operação empresarial.',
          code: 'business_locked',
          upgradeRequired: true,
          upgradeHref: getUpgradeHref('business'),
        },
        { status: 403 }
      )
    }

    const body = (await request.json().catch(() => null)) as { businessId?: string } | null
    const businessId = body?.businessId?.trim()

    if (!businessId) {
      return NextResponse.json({ error: 'businessId é obrigatório.' }, { status: 400 })
    }

    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (businessError) {
      return NextResponse.json({ error: businessError.message }, { status: 500 })
    }

    if (!business) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mode')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const nextMode = profile.mode === 'pf' ? 'both' : profile.mode ?? 'pj'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        active_business_id: business.id,
        mode: nextMode,
      })
      .eq('id', user.id)

    if (updateError) {
      if (isMissingActiveBusinessColumnError(updateError.message)) {
        const { error: fallbackModeError } = await supabase
          .from('profiles')
          .update({ mode: nextMode })
          .eq('id', user.id)

        if (fallbackModeError) {
          return NextResponse.json({ error: fallbackModeError.message }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    const response = NextResponse.json({ ok: true, businessId: business.id })
    response.cookies.set(ACTIVE_BUSINESS_COOKIE, business.id, {
      path: '/',
      maxAge: ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS,
      sameSite: 'lax',
      httpOnly: false,
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
