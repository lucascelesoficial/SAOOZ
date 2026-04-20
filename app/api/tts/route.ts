import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireUser } from '@/lib/server/request-guard'
import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'
import {
  requireSameOrigin,
  requireJsonContentType,
  rejectLargeBody,
  withSecurityHeaders,
} from '@/lib/server/security'

export const dynamic = 'force-dynamic'

const DEFAULT_VOICE_ID = 'dtSEyYGNJqjrtBArPCVZ'

export async function POST(req: NextRequest) {
  // ── CSRF / Content-Type / body-size guards ──────────────────────────────
  const originCheck = requireSameOrigin(req)
  if (originCheck) return withSecurityHeaders(originCheck)

  const ctCheck = requireJsonContentType(req)
  if (ctCheck) return withSecurityHeaders(ctCheck)

  const bodyCheck = rejectLargeBody(req, 4_096)  // 4 KB — text payloads
  if (bodyCheck) return withSecurityHeaders(bodyCheck)

  const auth = await requireUser()
  if (!auth.ok) return withSecurityHeaders(auth.response)

  const gate = await requireCompletedOnboarding(auth.user.id)
  if (!gate.ok) return withSecurityHeaders(gate.response)

  const rate = await enforceRateLimit({
    scope: 'tts',
    user: auth.user,
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (!rate.ok) return withSecurityHeaders(rate.response)

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    return withSecurityHeaders(NextResponse.json({ error: 'Serviço de voz temporariamente indisponível.' }, { status: 501 }))
  }

  const { text } = await req.json()
  if (!text?.trim()) {
    return withSecurityHeaders(NextResponse.json({ error: 'Texto não fornecido.' }, { status: 400 }))
  }
  if (text.trim().length > 1200) {
    return withSecurityHeaders(NextResponse.json({ error: 'Texto muito longo.' }, { status: 400 }))
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
    {
      method: 'POST',
      headers: {
        'Accept':       'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key':   key,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability:         0.30,  // baixo = mais expressivo, variação natural na voz
          similarity_boost:  0.85,  // mantém o caráter da voz
          style:             0.40,  // personalidade marcante — estilo JARVIS
          use_speaker_boost: true,
          speed:             0.97,  // ligeiramente mais devagar = mais peso nas palavras
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('ElevenLabs error:', res.status, err)
    return withSecurityHeaders(NextResponse.json({ error: 'Erro ao sintetizar voz.' }, { status: res.status }))
  }

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: {
      'Content-Type':        'audio/mpeg',
      'Cache-Control':       'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options':    'DENY',
      'Referrer-Policy':    'no-referrer',
    },
  })
}
