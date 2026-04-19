import { NextResponse } from 'next/server'

export const revalidate = 3600 // cache 1h no servidor

const PLUGGY_WIDGET_URL =
  'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js'

/**
 * GET /api/banking/widget-js
 *
 * Proxy do script Pluggy Connect pelo nosso domínio.
 * Isso elimina qualquer problema de CSP ou CORS com o CDN externo.
 * O script é servido com Content-Type text/javascript e cache de 1h.
 */
export async function GET() {
  try {
    const res = await fetch(PLUGGY_WIDGET_URL, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'SAOOZ/1.0' },
    })

    if (!res.ok) {
      return new NextResponse(
        `// Pluggy widget unavailable (upstream ${res.status})`,
        { status: 502, headers: { 'Content-Type': 'text/javascript' } }
      )
    }

    const js = await res.text()

    return new NextResponse(js, {
      status: 200,
      headers: {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse(
      '// Pluggy widget fetch failed',
      { status: 502, headers: { 'Content-Type': 'text/javascript' } }
    )
  }
}
