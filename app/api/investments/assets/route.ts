import { NextRequest, NextResponse } from 'next/server'
import { canAccessScope, getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { investmentAssetMutationSchema } from '@/lib/modules/investments/schema'
import {
  createInvestmentAsset,
  getInvestmentModuleSnapshot,
  InvestmentServiceError,
} from '@/lib/modules/investments/service'
import { createClient } from '@/lib/supabase/server'
import { requireSameOrigin, requireJsonContentType, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof InvestmentServiceError) {
    return withSecurityHeaders(
      NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    )
  }
  const message = error instanceof Error ? error.message : fallback
  return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
}

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 8192)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const body = await request.json().catch(() => null)
    const payloadResult = investmentAssetMutationSchema.safeParse(body)
    if (!payloadResult.success) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Dados inválidos para o ativo.' }, { status: 400 })
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }

    const payload = payloadResult.data
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, payload.scope)) {
      const block = getPolicyBlock(
        policy,
        payload.scope === 'business' ? 'business_module_locked' : 'personal_module_locked'
      )
      return withSecurityHeaders(
        NextResponse.json(
          {
            error: block?.message ?? 'Seu plano não libera este módulo.',
            code: block?.code ?? 'scope_locked',
            upgradeRequired: true,
            upgradeHref: block?.upgradeHref ?? '/planos',
          },
          { status: 403 }
        )
      )
    }

    await createInvestmentAsset({
      supabase,
      userId: user.id,
      scope: payload.scope,
      businessId: payload.businessId,
      accountId: payload.accountId,
      symbol: payload.symbol,
      name: payload.name ?? null,
      assetType: payload.assetType,
      quantity: payload.quantity,
      averagePrice: payload.averagePrice,
      targetAllocationPct: payload.targetAllocationPct ?? null,
    })

    const snapshot = await getInvestmentModuleSnapshot({
      supabase,
      userId: user.id,
      scope: payload.scope,
      businessId: payload.businessId,
    })

    return withSecurityHeaders(NextResponse.json({ snapshot }, { status: 201 }))
  } catch (error) {
    return normalizeError(error, 'Falha ao cadastrar ativo.')
  }
}
