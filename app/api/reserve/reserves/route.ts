import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { canAccessScope, resolveUserAccessPolicy } from '@/lib/billing/policy'
import {
  listActiveReserves,
  createNewReserve,
  deactivateReserve,
  ReserveServiceError,
} from '@/lib/modules/reserve/service'

export const dynamic = 'force-dynamic'

function err(e: unknown, fallback: string) {
  if (e instanceof ReserveServiceError) return NextResponse.json({ error: e.message }, { status: e.status })
  return NextResponse.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 })
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const scope = (url.searchParams.get('scope') ?? 'personal') as 'personal' | 'business'
    const businessId = url.searchParams.get('businessId') ?? null
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    const policy = await resolveUserAccessPolicy(user.id)
    if (!canAccessScope(policy, scope)) return NextResponse.json({ error: 'Sem acesso.' }, { status: 403 })
    const reserves = await listActiveReserves({ supabase, userId: user.id, scope, businessId })
    return NextResponse.json({ reserves })
  } catch (e) { return err(e, 'Falha ao listar reservas.') }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = z.object({
      scope: z.enum(['personal', 'business']),
      businessId: z.string().uuid().nullable().optional(),
      name: z.string().min(1).max(80),
    }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    const reserve = await createNewReserve({
      supabase, userId: user.id,
      scope: parsed.data.scope,
      businessId: parsed.data.businessId ?? null,
      name: parsed.data.name,
    })
    return NextResponse.json({ reserve }, { status: 201 })
  } catch (e) { return err(e, 'Falha ao criar reserva.') }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const reserveId = url.searchParams.get('id')
    if (!reserveId) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    await deactivateReserve({ supabase, userId: user.id, reserveId })
    return NextResponse.json({ ok: true })
  } catch (e) { return err(e, 'Falha ao excluir reserva.') }
}
