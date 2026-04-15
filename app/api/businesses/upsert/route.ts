import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  ACTIVE_BUSINESS_COOKIE,
  ACTIVE_BUSINESS_COOKIE_MAX_AGE_SECONDS,
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { createClient } from '@/lib/supabase/server'
import type { BusinessActivity, BusinessTaxRegime, UserMode } from '@/types/database.types'
import { requireSameOrigin, requireJsonContentType, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

const businessPayloadSchema = z.object({
  businessId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  cnpj: z.string().trim().max(18).nullable().optional(),
  taxRegime: z.enum(['mei', 'simples', 'presumido', 'real']).default('simples'),
  activity: z.enum(['servico', 'comercio', 'industria', 'misto']).default('servico'),
})

function resolveNextMode(currentMode: UserMode | null): UserMode {
  if (currentMode === 'both') {
    return 'both'
  }

  if (currentMode === 'pf') {
    return 'both'
  }

  return 'pj'
}

function normalizeCnpj(cnpj: string | null | undefined) {
  const normalized = cnpj?.trim() ?? ''
  return normalized.length ? normalized : null
}

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 8192) // 8 KB
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const parsed = businessPayloadSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos para empresa.' }, { status: 400 })
    }

    const policy = await resolveUserAccessPolicy(user.id)
    const businessLock = getPolicyBlock(policy, 'business_module_locked')

    if (!policy.modules.business) {
      return NextResponse.json(
        {
          error: 'Seu plano atual não libera o módulo empresarial.',
          code: 'business_locked',
          upgradeRequired: true,
          upgradeHref: businessLock?.upgradeHref ?? '/planos?feature=business',
        },
        { status: 403 }
      )
    }

    const { businessId, name, cnpj, taxRegime, activity } = parsed.data
    const payload = {
      name,
      cnpj: normalizeCnpj(cnpj),
      tax_regime: taxRegime as BusinessTaxRegime,
      activity: activity as BusinessActivity,
    }

    let savedBusinessId: string

    if (businessId) {
      const { data: existing, error: existingError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingError) {
        return NextResponse.json({ error: existingError.message }, { status: 500 })
      }

      if (!existing) {
        return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
      }

      const { data: updated, error: updateError } = await supabase
        .from('business_profiles')
        .update(payload)
        .eq('id', businessId)
        .eq('user_id', user.id)
        .select('id')
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      savedBusinessId = updated.id
    } else {
      const { count, error: countError } = await supabase
        .from('business_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 })
      }

      const policyWithCount = await resolveUserAccessPolicy(user.id, {
        businessCount: count ?? 0,
      })

      if (!policyWithCount.canCreateBusiness) {
        const limitBlock = getPolicyBlock(policyWithCount, 'business_limit_reached')
        return NextResponse.json(
          {
            error: 'Limite de contas empresariais atingido para o ciclo atual.',
            code: 'business_limit_reached',
            upgradeRequired: true,
            upgradeHref: limitBlock?.upgradeHref ?? '/planos?feature=business_limit',
          },
          { status: 403 }
        )
      }

      const { data: created, error: createError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          ...payload,
        })
        .select('id')
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      savedBusinessId = created.id
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mode')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: `Empresa salva, mas perfil não atualizado: ${profileError.message}` },
        { status: 500 }
      )
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        mode: resolveNextMode(profile.mode),
        active_business_id: savedBusinessId,
      })
      .eq('id', user.id)

    if (updateProfileError && !isMissingActiveBusinessColumnError(updateProfileError.message)) {
      return NextResponse.json(
        { error: `Empresa salva, mas perfil não atualizado: ${updateProfileError.message}` },
        { status: 500 }
      )
    }

    if (updateProfileError && isMissingActiveBusinessColumnError(updateProfileError.message)) {
      const { error: fallbackModeError } = await supabase
        .from('profiles')
        .update({
          mode: resolveNextMode(profile.mode),
        })
        .eq('id', user.id)

      if (fallbackModeError) {
        return NextResponse.json(
          { error: `Empresa salva, mas perfil não atualizado: ${fallbackModeError.message}` },
          { status: 500 }
        )
      }
    }

    const response = NextResponse.json({
      ok: true,
      businessId: savedBusinessId,
      created: !businessId,
    })

    response.cookies.set(ACTIVE_BUSINESS_COOKIE, savedBusinessId, {
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
