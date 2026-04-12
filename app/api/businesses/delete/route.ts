import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const body = await request.json() as { businessId?: string }
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json({ error: 'businessId é obrigatório.' }, { status: 400 })
    }

    // Verify the business belongs to this user
    const { data: business, error: fetchError } = await supabase
      .from('business_profiles')
      .select('id, name, user_id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
    }

    const admin = createAdminClient()

    // Delete the business profile (CASCADE will remove revenues + expenses)
    const { error: deleteError } = await admin
      .from('business_profiles')
      .delete()
      .eq('id', businessId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Check if user has other businesses
    const { data: remainingBusinesses } = await admin
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)

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

    return NextResponse.json({
      ok: true,
      redirectTo: hasOtherBusiness ? '/empresa' : '/central',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
