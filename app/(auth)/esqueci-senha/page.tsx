'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
          <div className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ background: '#22c55e15', border: '1px solid #22c55e30' }}>
            <Mail className="h-7 w-7 text-[#22c55e]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Email enviado!</h1>
          <p className="mt-2 text-sm text-[#4a6080]">
            Enviamos um link de redefinição para <span className="text-[#8899bb]">{email}</span>.
            Verifique sua caixa de entrada (e a pasta de spam).
          </p>
        </div>
        <Link href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#60a5fa] hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Esqueceu sua senha?</h1>
        <p className="mt-1.5 text-sm text-[#4a6080]">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {error && (
        <div className="rounded-[10px] px-4 py-3 text-sm text-[#f87171]"
          style={{ background: '#f8717110', border: '1px solid #f8717130' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-[#8899bb] uppercase tracking-wider">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="w-full h-11 px-4 rounded-[10px] text-sm text-white placeholder:text-[#2a3860] outline-none transition-all"
            style={{
              background: '#0d1021',
              border: error ? '1px solid #f87171' : '1px solid #1e2847',
              boxShadow: error ? '0 0 0 3px #f8717120' : undefined,
            }}
            onFocus={(e) => { if (!error) { e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' } }}
            onBlur={(e)  => { if (!error) { e.currentTarget.style.border = '1px solid #1e2847'; e.currentTarget.style.boxShadow = 'none' } }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 20px #3b82f640' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de redefinição'}
        </button>
      </form>

      <div className="text-center">
        <Link href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#4a6080] hover:text-[#8899bb] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
