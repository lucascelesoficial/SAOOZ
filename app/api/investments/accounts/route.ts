import { NextResponse } from 'next/server'
import { canAccessScope, getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { investmentAccountMutationSchema, investmentQuerySchema } from '@/lib/modules/investments/schema'
import {
  createInvestmentAccount,
  getInvestmentModuleSnapshot,
  InvestmentServiceError,
} from '@/lib/modules/investments/service'
import { createClient } from '@/lib/supabase/server'
import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'

export const dynamic = 'force-dynamic'

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof InvestmentServiceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
  }
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status: 500 })
}

function parseQuery(request: Request) {
  const url = new URL(request.url)
  return investmentQuerySchema.safeParse({
    scope: url.searchParams.get('scope'),
    businessId: url.searchParams.get('businessId') ?? undefined,
  })
}

export async function GET(request: Request) {
  try {
    const queryResult = parseQuery(request)
    if (!queryResult.success) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }


    const gate = await requireCompletedOnboarding(user.id)
    if (!gate.ok) return gate.response
    const { scope, businessId } = queryResult.data
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, scope)) {
      const block = getPolicyBlock(
        policy,
        scope === 'business' ? 'business_module_locked' : 'personal_module_locked'
      )
      return NextResponse.json(
        {
          error: block?.message ?? 'Seu plano não libera este módulo.',
          code: block?.code ?? 'scope_locked',
          upgradeRequired: true,
          upgradeHref: block?.upgradeHref ?? '/planos',
        },
        { status: 403 }
      )
    }

    const snapshot = await getInvestmentModuleSnapshot({
      supabase,
      userId: user.id,
      scope,
      businessId,
    })

    return NextResponse.json({ snapshot })
  } catch (error) {
    return normalizeError(error, 'Falha ao carregar investimentos.')
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const payloadResult = investmentAccountMutationSchema.safeParse(body)
    if (!payloadResult.success) {
      return NextResponse.json({ error: 'Dados inválidos para conta de investimento.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }


    const gate = await requireCompletedOnboarding(user.id)
    if (!gate.ok) return gate.response
    const payload = payloadResult.data
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, payload.scope)) {
      const block = getPolicyBlock(
        policy,
        payload.scope === 'business' ? 'business_module_locked' : 'personal_module_locked'
      )
      return NextResponse.json(
        {
          error: block?.message ?? 'Seu plano não libera este módulo.',
          code: block?.code ?? 'scope_locked',
          upgradeRequired: true,
          upgradeHref: block?.upgradeHref ?? '/planos',
        },
        { status: 403 }
      )
    }

    await createInvestmentAccount({
      supabase,
      userId: user.id,
      scope: payload.scope,
      businessId: payload.businessId,
      name: payload.name,
      institution: payload.institution ?? null,
      accountType: payload.accountType,
      currency: payload.currency,
    })

    const snapshot = await getInvestmentModuleSnapshot({
      supabase,
      userId: user.id,
      scope: payload.scope,
      businessId: payload.businessId,
    })

    return NextResponse.json({ snapshot }, { status: 201 })
  } catch (error) {
    return normalizeError(error, 'Falha ao criar conta de investimento.')
  }
}
