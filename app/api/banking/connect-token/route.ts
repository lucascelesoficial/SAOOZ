import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server/request-guard'
import { getConnectToken } from '@/lib/banking/pluggy'
import { withSecurityHeaders } from '@/lib/server/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  try {
    const url = new URL(request.url)
    const itemId = url.searchParams.get('itemId') ?? undefined

    const connectToken = await getConnectToken(itemId)

    return withSecurityHeaders(NextResponse.json({ connectToken }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao gerar token de conexão.'
    return withSecurityHeaders(NextResponse.json({ error: message }, { status: 500 }))
  }
}
