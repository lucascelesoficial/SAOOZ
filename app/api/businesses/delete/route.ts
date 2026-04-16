import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSameOrigin, withSecurityHeaders } from '@/lib/server/security'
import { logAuditEvent, getClientIp } from '@/lib/server/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request)
  if (originCheck) return withSecurityHeaders(originCheck)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
      )
    }

    const body = await request.json() as { businessId?: string }
    const { businessId } = body

    if (!businessId) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'businessId é obrigatório.' }, { status: 400 })
      )
    }

    // Verify the business belongs to this user and is not already deleted
    const { data: business, error: fetchError } = await supabase
      .from('business_profiles')
      .select('id, name, user_id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !business) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
      )
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()

    // ── Soft delete — preserve all data, set tombstone ─────────────────────
    const { error: deleteError } = await admin
      .from('business_profiles')
      .update({
        deleted_at: now,
        deleted_by: user.id,
      })
      .eq('id', businessId)

    if (deleteError) {
      return withSecurityHeaders(
        NextResponse.json({ error: deleteError.message }, { status: 500 })
      )
    }

    // ── Audit log ──────────────────────────────────────────────────────────
    await logAuditEvent({
      userId: user.id,
      actorType: 'user',
      actionType: 'business.deleted',
      resourceType: 'business_profile',
      resourceId: businessId,
      metadata: {
        business_name: business.name,
        soft_deleted: true,
        ip: getClientIp(request),
      },
    })

    // Check if user has other active businesses
    const { data: remainingBusinesses } = await admin
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const hasOtherBusiness = (remainingBusinesses?.length ?? 0) > 0
    const nextActiveId = hasOtherBusiness ? remainingBusinesses![0].id : null

    // Update profile: clear active_business_id if it was the deleted one
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_business_id, mode')
      .eq('id', user.id)
      .single()

    if (profile) {
      const wasActive = profile.active_business_id === businessId
      const newMode = hasOtherBusiness ? profile.mode : 'pf'

      await admin
        .from('profiles')
        .update({
          active_business_id: wasActive ? nextActiveId : profile.active_business_id,
          mode: newMode,
        })
        .eq('id', user.id)
    }

    return withSecurityHeaders(
      NextResponse.json({
        ok: true,
        redirectTo: hasOtherBusiness ? '/empresa' : '/central',
      })
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 500 })
    )
  }
}
