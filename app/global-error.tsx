'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global error handler for React rendering errors in the App Router.
 * Required by Sentry to capture errors that occur during React rendering.
 * Without this file, rendering errors are NOT reported to Sentry.
 *
 * Must be a Client Component with `error` and `reset` props.
 * See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06080f',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 400 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 28,
            }}
          >
            ⚡
          </div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            Um erro inesperado ocorreu. Nossa equipe foi notificada automaticamente.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
