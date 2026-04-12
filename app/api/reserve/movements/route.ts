import { NextResponse } from 'next/server'
import { canAccessScope, getPolicyBlock, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { reserveMovementMutationSchema, reserveQuerySchema } from '@/lib/modules/reserve/schema'
import {
  createReserveMovement,
  getReserveModuleSnapshot,
  ReserveServiceError,
} from '@/lib/modules/reserve/service'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function normalizeReserveError(error: unknown, fallbackMessage: string) {
  if (error instanceof ReserveServiceError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    )
  }

  const message = error instanceof Error ? error.message : fallbackMessage
  return NextResponse.json({ error: message }, { status: 500 })
}

function parseQuery(request: Request) {
  const url = new URL(request.url)
  return reserveQuerySchema.safeParse({
    scope: url.searchParams.get('scope'),
    month: url.searchParams.get('month') ?? undefined,
    businessId: url.searchParams.get('businessId') ?? undefined,
    reserveId: url.searchParams.get('reserveId') ?? undefined,
  })
}

export async function GET(request: Request) {
  try {
    const queryResult = parseQuery(request)
    if (!queryResult.success) {
      return NextResponse.json({ error: 'Parametros invalidos para reserva.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
    }

    const { scope, month, businessId, reserveId } = queryResult.data
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, scope)) {
      const block = getPolicyBlock(policy, scope === 'business' ? 'business_module_locked' : 'personal_module_locked')

      return NextResponse.json(
        {
          error: block?.message ?? 'Seu plano atual nao libera este modulo.',
          code: block?.code ?? 'scope_locked',
          upgradeRequired: true,
          upgradeHref: block?.upgradeHref ?? '/planos',
        },
        { status: 403 }
      )
    }

    const snapshot = await getReserveModuleSnapshot({
      supabase,
      userId: user.id,
      scope,
      monthIso: month,
      businessId,
      reserveId,
    })

    return NextResponse.json({ snapshot })
  } catch (error) {
    return normalizeReserveError(error, 'Falha ao carregar a reserva de emergencia.')
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const month = url.searchParams.get('month') ?? undefined
    const body = await request.json().catch(() => null)
    const payloadResult = reserveMovementMutationSchema.safeParse(body)

    if (!payloadResult.success) {
      return NextResponse.json({ error: 'Dados invalidos para movimentacao da reserva.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
    }

    const payload = payloadResult.data
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, payload.scope)) {
      const block = getPolicyBlock(policy, payload.scope === 'business' ? 'business_module_locked' : 'personal_module_locked')

      return NextResponse.json(
        {
          error: block?.message ?? 'Seu plano atual nao libera este modulo.',
          code: block?.code ?? 'scope_locked',
          upgradeRequired: true,
          upgradeHref: block?.upgradeHref ?? '/planos',
        },
        { status: 403 }
      )
    }

    const postReserveId = url.searchParams.get('reserveId') ?? undefined

    const movement = await createReserveMovement({
      supabase,
      userId: user.id,
      scope: payload.scope,
      businessId: payload.businessId,
      reserveId: postReserveId,
      entryType: payload.entryType,
      amount: payload.amount,
      happenedOn: payload.happenedOn,
      description: payload.description,
    })

    const snapshot = await getReserveModuleSnapshot({
      supabase,
      userId: user.id,
      scope: payload.scope,
      monthIso: month,
      businessId: payload.businessId,
      reserveId: postReserveId,
    })

    return NextResponse.json({ movement, snapshot })
  } catch (error) {
    return normalizeReserveError(error, 'Falha ao registrar movimentacao da reserva.')
  }
}
