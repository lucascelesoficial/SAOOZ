'use client'

/**
 * SessionTimeoutGuard — mounts the idle timeout on all dashboard pages
 *
 * Shows a dismissible warning banner 5 minutes before auto-logout.
 * Included once in the dashboard layout as a client island.
 */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'

// 30-minute timeout, 5-minute warning (matching hook defaults)
const TIMEOUT_MS = 30 * 60 * 1000
const WARNING_MS =  5 * 60 * 1000

export function SessionTimeoutGuard() {
  const router = useRouter()
  const [toastId, setToastId] = useState<string | number | null>(null)

  const handleTimeout = useCallback(async () => {
    const supabase = createClient()
    // Audit log before signing out
    await fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'auth.logout', metadata: { reason: 'session_timeout' } }),
    }).catch(() => undefined)
    await supabase.auth.signOut()
    router.push('/login?reason=timeout')
    router.refresh()
  }, [router])

  const handleWarning = useCallback(() => {
    const id = toast.warning('Sessão prestes a expirar', {
      description: 'Você será desconectado em 5 minutos por inatividade. Mova o mouse para continuar.',
      duration: WARNING_MS,
      dismissible: true,
    })
    setToastId(id)
  }, [])

  const handleActivity = useCallback(() => {
    if (toastId !== null) {
      toast.dismiss(toastId)
      setToastId(null)
    }
  }, [toastId])

  useSessionTimeout({
    onTimeout: handleTimeout,
    onWarning: handleWarning,
    onActivity: handleActivity,
    timeoutMs: TIMEOUT_MS,
    warningMs: WARNING_MS,
  })

  // Renders nothing — purely behavioral
  return null
}
