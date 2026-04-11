// ── State ─────────────────────────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null
let elAvailable: boolean | null = null   // null = untested, true/false = cached result
let primed = false

// ── Helpers ───────────────────────────────────────────────────────────────────
function clean(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FFFF}\u{2700}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[✅⚠️👋🚀💡📊🎙️🔴🟢🔵]/g, '')
    .replace(/\*\*/g, '').replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/^[-•]\s+/gm, '')
    .replace(/R\$\s?([\d.,]+)/g, (_, n) => `${n} reais`)
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bestVoice(lang: string): SpeechSynthesisVoice | null {
  const all  = window.speechSynthesis.getVoices()
  const base = lang.split('-')[0]
  return (
    all.find(v => v.lang === lang && v.name.toLowerCase().includes('google')) ||
    all.find(v => v.lang === lang) ||
    all.find(v => v.lang.startsWith(base) && v.name.toLowerCase().includes('google')) ||
    all.find(v => v.lang.startsWith(base)) ||
    null
  )
}

// ── primeTTS — unlock Web Speech on first user gesture ────────────────────────
export function primeTTS() {
  if (primed || typeof window === 'undefined' || !window.speechSynthesis) return
  primed = true
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0; u.rate = 10
  window.speechSynthesis.speak(u)
}

// ── stopSpeaking — cancels ElevenLabs or Web Speech ──────────────────────────
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

// ── Web Speech fallback ───────────────────────────────────────────────────────
function webSpeak(phrase: string, lang: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return }

  window.speechSynthesis.cancel()
  setTimeout(() => {
    const utt     = new SpeechSynthesisUtterance(phrase)
    utt.lang      = lang
    utt.rate      = 0.92
    utt.pitch     = 1.05
    utt.volume    = 1.0
    utt.onstart   = () => onStart?.()
    utt.onend     = () => onEnd?.()
    utt.onerror   = () => onEnd?.()

    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        const v = bestVoice(lang)
        if (v) utt.voice = v
        window.speechSynthesis.speak(utt)
      }
    } else {
      const v = bestVoice(lang)
      if (v) utt.voice = v
      window.speechSynthesis.speak(utt)
    }
  }, 100)
}

// ── speak — ElevenLabs first, Web Speech fallback ─────────────────────────────
export interface SpeakOptions {
  lang?:    string
  onStart?: () => void
  onEnd?:   () => void
}

export async function speak(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined') return

  const { lang = 'pt-BR', onStart, onEnd } = options
  const phrase = clean(text)
  if (!phrase) { onEnd?.(); return }

  stopSpeaking()

  // ── Try ElevenLabs ────────────────────────────────────────────────────────
  // Skip if we already know it's not configured (cached false)
  if (elAvailable !== false) {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: phrase }),
      })

      if (res.status === 501) {
        // API key not configured — cache and fall through
        elAvailable = false
      } else if (res.ok) {
        elAvailable = true
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)
        const audio = new Audio(url)
        currentAudio = audio

        audio.onplay  = () => onStart?.()
        audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.() }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          currentAudio = null
          webSpeak(phrase, lang, onStart, onEnd)
        }

        await audio.play()
        return
      }
      // other error → fall through to Web Speech
    } catch {
      // network error → fall through
    }
  }

  // ── Fallback: Web Speech API ───────────────────────────────────────────────
  webSpeak(phrase, lang, onStart, onEnd)
}
