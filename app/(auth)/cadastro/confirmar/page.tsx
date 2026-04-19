'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'

function ConfirmarContent() {
  const params = useSearchParams()
  const email  = params.get('email') ?? ''

  const [status, setStatus]     = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [cooldown, setCooldown] = useState(0)

  async function handleResend() {
    if (status === 'sending' || cooldown > 0) return
    setStatus('sending')

    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({})) as { retryAfter?: number }

      if (res.status === 429) {
        const wait = data.retryAfter ?? 60
        setCooldown(wait)
        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(interval); return 0 }
            return prev - 1
          })
        }, 1000)
        setStatus('idle')
        return
      }

      setStatus('sent')
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
        >
          <Mail className="h-7 w-7 text-[#2563EB]" />
        </div>
      </div>

      {/* Text */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Confirme seu email</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enviamos um link de confirmação para{' '}
          {email && <span className="font-semibold text-slate-700">{email}</span>}.{' '}
          Clique no link para ativar sua conta.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Verifique também a pasta de{' '}
          <strong className="text-slate-600">spam</strong> ou lixo eletrônico.
        </p>
      </div>

      {/* Resend button */}
      {email && (
        <div className="flex flex-col items-center gap-2">
          {status === 'sent' ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Email reenviado com sucesso!
            </div>
          ) : status === 'error' ? (
            <p className="text-sm text-red-600">Erro ao reenviar. Tente novamente.</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={status === 'sending' || cooldown > 0}
              className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending'
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              {cooldown > 0
                ? `Reenviar em ${cooldown}s`
                : status === 'sending'
                  ? 'Enviando…'
                  : 'Não recebi — reenviar email'}
            </button>
          )}
        </div>
      )}

      {/* Login link */}
      <Link
        href="/login"
        className="inline-block text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        Já confirmei → Entrar
      </Link>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <ConfirmarContent />
    </Suspense>
  )
}
