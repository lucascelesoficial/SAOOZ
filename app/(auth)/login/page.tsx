'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [cfToken, setCfToken]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs: Record<string, string> = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido'
    if (!password || password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setLoading(true)

    if (cfToken) {
      const cfRes = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cfToken }),
      }).catch(() => null)
      if (cfRes && !cfRes.ok) {
        setLoading(false)
        setErrors({ auth: 'Verificação de segurança falhou. Recarregue a página e tente novamente.' })
        return
      }
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[login] supabase error:', error.message, error.status)
        setErrors({ auth: 'Email ou senha incorretos. Verifique e tente novamente.' })
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        identifyUser(userData.user.id, { email })
        trackEvent(EVENTS.USER_LOGIN, { method: 'email' })
        fetch('/api/auth/log-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'auth.login', metadata: { method: 'email' } }),
        }).catch(() => undefined)
      }

      window.location.href = '/central'
    } catch (err) {
      console.error('[login] unexpected error:', err)
      setErrors({ auth: 'Erro de conexão. Verifique sua internet e tente novamente.' })
      setLoading(false)
    }
  }

  const inputBase = {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    color: '#0F172A',
  }
  const inputError = {
    background: '#FFF5F5',
    border: '1px solid #FCA5A5',
    boxShadow: '0 0 0 3px #FEE2E220',
    color: '#0F172A',
  }
  const inputFocusOk  = { border: '1px solid #2563EB', boxShadow: '0 0 0 3px #2563EB18' }
  const inputFocusErr = { border: '1px solid #F87171', boxShadow: '0 0 0 3px #FEE2E220' }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Bem-vindo de volta!</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Entre com seu e-mail e senha para começar.
        </p>
      </div>

      {/* Auth error banner */}
      {errors.auth && (
        <div
          className="rounded-[10px] px-4 py-3 text-sm text-red-600"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
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
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '' })) }}
            className="w-full h-11 px-4 rounded-[10px] text-sm placeholder:text-slate-400 outline-none transition-all"
            style={errors.email || errors.auth ? inputError : inputBase}
            onFocus={(e) => Object.assign(e.currentTarget.style, errors.email ? inputFocusErr : inputFocusOk)}
            onBlur={(e)  => Object.assign(e.currentTarget.style, errors.email || errors.auth ? inputError : inputBase)}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '' })) }}
              className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm placeholder:text-slate-400 outline-none transition-all"
              style={errors.password || errors.auth ? inputError : inputBase}
              onFocus={(e) => Object.assign(e.currentTarget.style, errors.password ? inputFocusErr : inputFocusOk)}
              onBlur={(e)  => Object.assign(e.currentTarget.style, errors.password || errors.auth ? inputError : inputBase)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        {/* Turnstile */}
        <TurnstileWidget
          onVerify={setCfToken}
          onError={() => setCfToken('')}
          onExpire={() => setCfToken('')}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            boxShadow: '0 4px 16px #2563EB30',
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </button>
      </form>

      {/* Links */}
      <div className="space-y-3 text-center text-sm text-slate-500">
        <p>
          <Link href="/esqueci-senha" className="text-slate-600 hover:text-slate-900 transition-colors">
            Esqueci minha senha
          </Link>
        </p>
        <p>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors">
            Cadastrar agora
          </Link>
        </p>
      </div>
    </div>
  )
}
