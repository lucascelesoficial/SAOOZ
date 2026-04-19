'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const inputBase  = { background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A' }
const inputError = { background: '#FFF5F5', border: '1px solid #FCA5A5', boxShadow: '0 0 0 3px #FEE2E220', color: '#0F172A' }
const inputFocusOk  = { border: '1px solid #2563EB', boxShadow: '0 0 0 3px #2563EB18' }

export default function EsqueciSenhaPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido')
      return
    }

    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    })
    setLoading(false)

    if (err) {
      setError('Erro ao enviar email. Tente novamente.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <Mail className="h-7 w-7 text-[#2563EB]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Verifique seu e-mail</h1>
          <p className="mt-2 text-sm text-slate-500">
            Se existe uma conta com esse endereço, você receberá um link de redefinição em breve.
            Verifique sua caixa de entrada e a pasta de spam.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Esqueceu sua senha?</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {error && (
        <div
          className="rounded-[10px] px-4 py-3 text-sm text-red-600"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="w-full h-11 px-4 rounded-[10px] text-sm placeholder:text-slate-400 outline-none transition-all"
            style={error ? inputError : inputBase}
            onFocus={(e) => { if (!error) Object.assign(e.currentTarget.style, inputFocusOk) }}
            onBlur={(e)  => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 4px 16px #2563EB30' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de redefinição'}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
