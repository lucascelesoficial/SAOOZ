'use client'

/**
 * TurnstileWidget — Cloudflare Turnstile invisible CAPTCHA
 *
 * Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set (dev / pre-CF).
 *
 * Usage:
 *   const [cfToken, setCfToken] = useState('')
 *   ...
 *   <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} />
 *   // then include cfToken in your form POST body as cf_turnstile_response
 */

import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

interface TurnstileWidgetProps {
  /** Called with the token when verification succeeds */
  onVerify: (token: string) => void
  /** Called when verification fails or expires */
  onError?: () => void
  /** Called when the token expires (user must re-verify) */
  onExpire?: () => void
}

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  // No site key → skip rendering (graceful degradation)
  if (!SITE_KEY) return null

  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onVerify}
      onError={onError}
      onExpire={onExpire}
      options={{
        theme: 'dark',
        size: 'invisible',
        // Appearance: invisible widget — no UI shown to users
        appearance: 'interaction-only',
      }}
    />
  )
}
