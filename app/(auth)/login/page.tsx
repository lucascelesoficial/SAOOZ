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
  const [loading, setLoading]       = useState(false)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [cfToken, setCfToken]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs: Record<string, string> = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido'
    if (!password || password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setErrors({ auth: 'Email ou senha incorretos. Verifique e tente novamente.' })
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      identifyUser(userData.user.id, { email })
      trackEvent(EVENTS.USER_LOGIN, { method: 'email' })
      // Fire-and-forget audit log — never await in the auth critical path
      fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'auth.login', metadata: { method: 'email' } }),
      }).catch(() => undefined)
    }

    router.refresh()
    router.push('/central')
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Bem-vindo de volta!</h1>
        <p className="mt-1.5 text-sm text-[#6B6B6B]">
          Entre com seu e-mail e senha para começar.
        </p>
      </div>

      {/* Auth error banner */}
      {errors.auth && (
        <div className="rounded-[10px] px-4 py-3 text-sm text-[#f87171]"
          style={{ background: '#f8717110', border: '1px solid #f8717130' }}>
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '' })) }}
            className="w-full h-11 px-4 rounded-[10px] text-sm text-white placeholder:text-[#4A4A4A] outline-none transition-all"
            style={{
              background: '#1E1E1E',
              border: (errors.email || errors.auth) ? '1px solid #f87171' : '1px solid #383838',
              boxShadow: (errors.email || errors.auth) ? '0 0 0 3px #f8717120' : undefined,
            }}
            onFocus={(e) => { if (!errors.email) e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' }}
            onBlur={(e)  => { if (!errors.email) e.currentTarget.style.border = '1px solid #383838'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.email && <p className="text-[#f87171] text-xs">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
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
              className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm text-white placeholder:text-[#4A4A4A] outline-none transition-all"
              style={{
                background: '#1E1E1E',
                border: (errors.password || errors.auth) ? '1px solid #f87171' : '1px solid #383838',
                boxShadow: (errors.password || errors.auth) ? '0 0 0 3px #f8717120' : undefined,
              }}
              onFocus={(e) => { if (!errors.password) e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' }}
              onBlur={(e)  => { if (!errors.password) e.currentTarget.style.border = '1px solid #383838'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#B3B3B3] transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[#f87171] text-xs">{errors.password}</p>}
        </div>

        {/* Turnstile — invisible, fires onVerify when ready */}
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
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 4px 20px #3b82f640',
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </button>
      </form>

      {/* Links */}
      <div className="space-y-3 text-center text-sm text-[#6B6B6B]">
        <p>
          <Link href="/esqueci-senha" className="text-[#B3B3B3] hover:text-white transition-colors">
            Esqueci minha senha
          </Link>
        </p>
        <p>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-[#60a5fa] hover:text-white font-semibold transition-colors">
            Cadastrar agora
          </Link>
        </p>
      </div>
    </div>
  )
}
