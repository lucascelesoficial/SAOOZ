'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cfToken, setCfToken] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs: Record<string, string> = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!password || password.length < 6) errs.password = 'Mínimo de 6 caracteres'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

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
        setErrors({ auth: 'E-mail ou senha incorretos. Verifique e tente novamente.' })
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
    border: '1px solid #DDE3ED',
    color: '#0F172A',
  }
  const inputError = {
    background: '#FFF5F5',
    border: '1px solid #FCA5A5',
    boxShadow: '0 0 0 3px #FEE2E220',
    color: '#0F172A',
  }
  const inputFocusOk = { border: '1px solid #6CA33A', boxShadow: '0 0 0 3px #84CC1624' }
  const inputFocusErr = { border: '1px solid #F87171', boxShadow: '0 0 0 3px #FEE2E220' }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Entrar na Pear Finance</h1>
        <p className="mt-1.5 text-sm text-slate-500">Acesse sua conta para continuar seu controle financeiro.</p>
      </div>

      {errors.auth && (
        <div className="rounded-[10px] px-4 py-3 text-sm text-red-600" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          {errors.auth}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((p) => ({ ...p, auth: '' }))
            }}
            className="h-11 w-full rounded-[10px] px-4 text-sm outline-none transition-all placeholder:text-slate-400"
            style={errors.email || errors.auth ? inputError : inputBase}
            onFocus={(e) => Object.assign(e.currentTarget.style, errors.email ? inputFocusErr : inputFocusOk)}
            onBlur={(e) => Object.assign(e.currentTarget.style, errors.email || errors.auth ? inputError : inputBase)}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((p) => ({ ...p, auth: '' }))
              }}
              className="h-11 w-full rounded-[10px] px-4 pr-11 text-sm outline-none transition-all placeholder:text-slate-400"
              style={errors.password || errors.auth ? inputError : inputBase}
              onFocus={(e) => Object.assign(e.currentTarget.style, errors.password ? inputFocusErr : inputFocusOk)}
              onBlur={(e) => Object.assign(e.currentTarget.style, errors.password || errors.auth ? inputError : inputBase)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #7AAE3A 0%, #5B9637 38%, #1F4E8C 100%)',
            boxShadow: '0 6px 18px rgba(22, 101, 52, 0.24)',
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </button>
      </form>

      <div className="space-y-3 text-center text-sm text-slate-500">
        <p>
          <Link href="/esqueci-senha" className="text-slate-600 transition-colors hover:text-slate-900">
            Esqueci minha senha
          </Link>
        </p>
        <p>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-semibold text-[#5A9638] transition-colors hover:text-[#45772C]">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
