'use client'

/**
 * useSessionTimeout — idle session auto-logout
 *
 * Monitors user activity (mouse, keyboard, touch, scroll).
 * If the user is idle for longer than `timeoutMs`, calls `onTimeout`.
 * A warning fires at `warningMs` before the timeout so the UI can show a banner.
 *
 * Defaults: 30 minutes timeout, 5 minute warning.
 *
 * Usage:
 *   useSessionTimeout({
 *     onTimeout: signOut,
 *     onWarning: () => setShowTimeoutWarning(true),
 *     onActivity: () => setShowTimeoutWarning(false),
 *   })
 */

import { useCallback, useEffect, useRef } from 'react'

interface SessionTimeoutOptions {
  /** Called when the idle timeout expires — should sign the user out */
  onTimeout: () => void
  /** Called when idle time reaches (timeout - warningMs) — show warning UI */
  onWarning?: () => void
  /** Called on any user activity — dismiss warning UI */
  onActivity?: () => void
  /** Total idle time before logout (ms). Default: 30 minutes */
  timeoutMs?: number
  /** How early to fire the warning before logout (ms). Default: 5 minutes */
  warningMs?: number
  /** Whether the hook is active. Pass `false` to disable (e.g. on auth pages) */
  enabled?: boolean
}

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel',
]

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes
const DEFAULT_WARNING_MS = 5  * 60 * 1000   // 5 minutes before timeout

export function useSessionTimeout({
  onTimeout,
  onWarning,
  onActivity,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = DEFAULT_WARNING_MS,
  enabled = true,
}: SessionTimeoutOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  const onWarningRef = useRef(onWarning)
  const onActivityRef = useRef(onActivity)

  // Keep refs in sync with latest callbacks (avoids stale closures)
  useEffect(() => { onTimeoutRef.current = onTimeout }, [onTimeout])
  useEffect(() => { onWarningRef.current = onWarning }, [onWarning])
  useEffect(() => { onActivityRef.current = onActivity }, [onActivity])

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  const resetTimers = useCallback(() => {
    clearTimers()
    // Schedule warning
    const warnDelay = timeoutMs - warningMs
    if (warnDelay > 0) {
      warningRef.current = setTimeout(() => {
        onWarningRef.current?.()
      }, warnDelay)
    }
    // Schedule logout
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current()
    }, timeoutMs)
  }, [clearTimers, timeoutMs, warningMs])

  const handleActivity = useCallback(() => {
    onActivityRef.current?.()
    resetTimers()
  }, [resetTimers])

  useEffect(() => {
    if (!enabled) return

    // Start the idle clock immediately
    resetTimers()

    // Listen for activity on document (passive listeners don't block the main thread)
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    )

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      )
    }
  }, [enabled, resetTimers, handleActivity, clearTimers])
}
