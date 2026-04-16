import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  ACTIVE_BUSINESS_COOKIE,
  ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS,
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { createClient } from '@/lib/supabase/server'
import { requireSameOrigin, requireJsonContentType, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

const activateSchema = z.object({
  businessId: z.string().uuid('businessId deve ser um UUID válido'),
})

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 512)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }

    const policy = await resolveUserAccessPolicy(user.id)
    const businessLock = getPolicyBlock(policy, 'business_module_locked')

    if (!policy.modules.business) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            error: 'Seu plano atual não libera a operação empresarial.',
            code: 'business_locked',
            upgradeRequired: true,
            upgradeHref: businessLock?.upgradeHref ?? '/planos?feature=business',
          },
          { status: 403 }
        )
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = activateSchema.safeParse(body)
    if (!parsed.success) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'businessId é obrigatório e deve ser um UUID válido.' }, { status: 400 })
      )
    }

    const { businessId } = parsed.data

    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (businessError) {
      return withSecurityHeaders(NextResponse.json({ error: 'Erro ao verificar empresa.' }, { status: 500 }))
    }

    if (!business) {
      return withSecurityHeaders(NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 }))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mode')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return withSecurityHeaders(NextResponse.json({ error: 'Erro ao carregar perfil.' }, { status: 500 }))
    }

    const nextMode = profile.mode === 'pf' ? 'both' : profile.mode ?? 'pj'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_business_id: business.id, mode: nextMode })
      .eq('id', user.id)

    if (updateError) {
      if (isMissingActiveBusinessColumnError(updateError.message)) {
        const { error: fallbackModeError } = await supabase
          .from('profiles')
          .update({ mode: nextMode })
          .eq('id', user.id)

        if (fallbackModeError) {
          return withSecurityHeaders(NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 }))
        }
      } else {
        return withSecurityHeaders(NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 }))
      }
    }

    const response = withSecurityHeaders(NextResponse.json({ ok: true, businessId: business.id }))
    response.cookies.set(ACTIVE_BUSINESS_COOKIE, business.id, {
      path: '/',
      maxAge: ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS,
      sameSite: 'lax',
      httpOnly: false,
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}
