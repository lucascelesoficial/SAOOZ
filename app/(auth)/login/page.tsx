'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const G    = '#026648'
const GLit = '#04a372'

export default function LoginPage() {
  const [loading, setLoading]   = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [cfToken, setCfToken]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs: Record<string, string> = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!password || password.length < 6) errs.password = 'Mínimo de 6 caracteres'
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

  /* ── Dark input styles ── */
  const inputBase: React.CSSProperties = {
    background: '#111',
    border: '1px solid rgba(255,255,255,0.11)',
    color: '#fff',
  }
  const inputErr: React.CSSProperties = {
    background: '#160808',
    border: '1px solid rgba(248,113,113,0.55)',
    boxShadow: '0 0 0 3px rgba(248,113,113,0.08)',
    color: '#fff',
  }
  const focusOk:  React.CSSProperties = { border: `1px solid ${G}`, boxShadow: `0 0 0 3px rgba(2,102,72,0.14)` }
  const focusErr: React.CSSProperties = { border: '1px solid rgba(248,113,113,0.65)', boxShadow: '0 0 0 3px rgba(248,113,113,0.10)' }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#9ca3af',
    marginBottom: 8,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
          Entrar na PearFy
        </h1>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Acesse sua conta para continuar seu controle financeiro.
        </p>
      </div>

      {/* Auth error */}
      {errors.auth && (
        <div
          style={{
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 14,
            color: '#fca5a5',
            background: 'rgba(127,29,29,0.30)',
            border: '1px solid rgba(248,113,113,0.25)',
          }}
        >
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Email */}
        <div>
          <label htmlFor="email" style={labelStyle}>E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, auth: '' })) }}
            style={{
              ...( errors.email || errors.auth ? inputErr : inputBase ),
              height: 46, width: '100%', borderRadius: 10,
              padding: '0 16px', fontSize: 15, outline: 'none',
              transition: 'border .15s, box-shadow .15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => Object.assign(e.currentTarget.style, errors.email ? focusErr : focusOk)}
            onBlur={(e)  => Object.assign(e.currentTarget.style, errors.email || errors.auth ? inputErr : inputBase)}
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Senha</label>
            <Link
              href="/esqueci-senha"
              style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400, transition: 'color .15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
            >
              Esqueci minha senha
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, auth: '' })) }}
              style={{
                ...( errors.password || errors.auth ? inputErr : inputBase ),
                height: 46, width: '100%', borderRadius: 10,
                padding: '0 44px 0 16px', fontSize: 15, outline: 'none',
                transition: 'border .15s, box-shadow .15s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, errors.password ? focusErr : focusOk)}
              onBlur={(e)  => Object.assign(e.currentTarget.style, errors.password || errors.auth ? inputErr : inputBase)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 0, transition: 'color .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{errors.password}</p>
          )}
        </div>

        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            height: 48,
            width: '100%',
            borderRadius: 11,
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: `linear-gradient(135deg, ${GLit} 0%, ${G} 100%)`,
            boxShadow: `0 6px 24px rgba(2,102,72,0.35)`,
            transition: 'opacity .15s, box-shadow .15s',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.opacity = '0.88') }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.opacity = '1') }}
        >
          {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Entrar'}
        </button>
      </form>

      {/* Footer links */}
      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
          Ainda não tem conta?{' '}
          <Link
            href="/cadastro"
            style={{ color: GLit, fontWeight: 600, transition: 'color .15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = GLit)}
          >
            Criar conta
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
