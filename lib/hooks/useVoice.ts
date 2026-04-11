'use client'

import { useState, useRef, useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any

interface UseVoiceOptions {
  onResult: (text: string) => void
  lang?: string
}

export function useVoice({ onResult, lang = 'pt-BR' }: UseVoiceOptions) {
  const [listening, setListening] = useState(false)

  // ── Keep refs fresh so closures never go stale ──────────────
  const onResultRef     = useRef(onResult)
  const keepAliveRef    = useRef(false)
  const pausedRef       = useRef(false)
  const activeRecRef    = useRef<AnyRec>(null)

  useEffect(() => { onResultRef.current = onResult })

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // ── Create a fresh recognition instance every time ──────────
  // (reusing an ended instance causes silent Chrome errors)
  function spawnRec(): AnyRec {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR  = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR() as AnyRec
    rec.lang            = lang
    rec.continuous      = false   // more reliable — we restart manually
    rec.interimResults  = false
    rec.maxAlternatives = 1

    rec.onresult = (e: AnyRec) => {
      const text = (e.results[0][0].transcript as string).trim()
      if (text) onResultRef.current(text)
    }

    rec.onerror = (e: AnyRec) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        // normal — restart if still in keep-alive mode
        if (keepAliveRef.current && !pausedRef.current) scheduleRestart()
        return
      }
      // real error (not-allowed, network, etc) — give up
      keepAliveRef.current = false
      setListening(false)
    }

    rec.onend = () => {
      if (keepAliveRef.current && !pausedRef.current) {
        scheduleRestart()
      } else if (!keepAliveRef.current) {
        setListening(false)
      }
    }

    return rec
  }

  function scheduleRestart() {
    setTimeout(() => {
      if (!keepAliveRef.current || pausedRef.current) return
      const rec = spawnRec()
      activeRecRef.current = rec
      try { rec.start() } catch { /* ignore race */ }
    }, 200)
  }

  function startListening() {
    if (!isSupported) return
    keepAliveRef.current = true
    pausedRef.current    = false
    const rec = spawnRec()
    activeRecRef.current = rec
    setListening(true)
    rec.start()
  }

  function stopListening() {
    keepAliveRef.current = false
    pausedRef.current    = false
    try { activeRecRef.current?.abort() } catch { /* ignore */ }
    activeRecRef.current = null
    setListening(false)
  }

  // Pause mic while TTS is speaking (avoid feedback loop)
  function pauseForTTS() {
    pausedRef.current = true
    try { activeRecRef.current?.abort() } catch { /* ignore */ }
  }

  // Resume continuous listening after TTS finishes
  function resumeAfterTTS() {
    if (!keepAliveRef.current) return
    pausedRef.current = false
    scheduleRestart()
  }

  return { listening, isSupported, startListening, stopListening, pauseForTTS, resumeAfterTTS }
}
