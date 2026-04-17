import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { canAccessScope, resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  listActiveReserves,
  createNewReserve,
  deactivateReserve,
  ReserveServiceError,
} from '@/lib/modules/reserve/service'
import { requireSameOrigin, requireJsonContentType, rejectLargeBody, withSecurityHeaders } from '@/lib/server/security'
import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'

export const dynamic = 'force-dynamic'

function err(e: unknown, fallback: string) {
  if (e instanceof ReserveServiceError) {
    return withSecurityHeaders(NextResponse.json({ error: e.message }, { status: e.status }))
  }
  return withSecurityHeaders(
    NextResponse.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 })
  )
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const scope = (url.searchParams.get('scope') ?? 'personal') as 'personal' | 'business'
    const businessId = url.searchParams.get('businessId') ?? null
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, scope)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Sem acesso.' }, { status: 403 }))
    }
    const reserves = await listActiveReserves({ supabase, userId: user.id, scope, businessId })
    return withSecurityHeaders(NextResponse.json({ reserves }))
  } catch (e) { return err(e, 'Falha ao listar reservas.') }
}

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(request)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(request, 4096)
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  try {
    const body = await request.json().catch(() => null)
    const parsed = z.object({
      scope: z.enum(['personal', 'business']),
      businessId: z.string().uuid().nullable().optional(),
      name: z.string().min(1).max(80),
    }).safeParse(body)
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 }))
    }
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }
    const gate = await requireCompletedOnboarding(user.id)
    if (!gate.ok) return withSecurityHeaders(gate.response)
    const reserve = await createNewReserve({
      supabase, userId: user.id,
      scope: parsed.data.scope,
      businessId: parsed.data.businessId ?? null,
      name: parsed.data.name,
    })
    return withSecurityHeaders(NextResponse.json({ reserve }, { status: 201 }))
  } catch (e) { return err(e, 'Falha ao criar reserva.') }
}

export async function DELETE(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  try {
    const url = new URL(request.url)
    const reserveId = url.searchParams.get('id')
    if (!reserveId) {
      return withSecurityHeaders(NextResponse.json({ error: 'ID inválido.' }, { status: 400 }))
    }
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return withSecurityHeaders(NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }))
    }
    const gate = await requireCompletedOnboarding(user.id)
    if (!gate.ok) return withSecurityHeaders(gate.response)
    await deactivateReserve({ supabase, userId: user.id, reserveId })
    return withSecurityHeaders(NextResponse.json({ ok: true }))
  } catch (e) { return err(e, 'Falha ao excluir reserva.') }
}
