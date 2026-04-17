import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireUser } from '@/lib/server/request-guard'
import { requireCompletedOnboarding } from '@/lib/server/onboarding-gate'

export const dynamic = 'force-dynamic'

const DEFAULT_VOICE_ID = 'dtSEyYGNJqjrtBArPCVZ'

export async function POST(req: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  const gate = await requireCompletedOnboarding(auth.user.id)
  if (!gate.ok) return gate.response

  const rate = await enforceRateLimit({
    scope: 'tts',
    user: auth.user,
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (!rate.ok) return rate.response

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 501 })
  }

  const { text } = await req.json()
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }
  if (text.trim().length > 1200) {
    return NextResponse.json({ error: 'Text too long' }, { status: 400 })
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
    return NextResponse.json({ error: `ElevenLabs ${res.status}` }, { status: res.status })
  }

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: {
      'Content-Type':  'audio/mpeg',
      'Cache-Control': 'no-cache',
    },
  })
}
