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
        setErrors({ auth: 'Verificação de segurança falhou. Recarregue e tente novamente.' })
        return
      }
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErrors({ auth: 'E-mail ou senha incorretos.' })
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
    } catch {
      setErrors({ auth: 'Erro de conexão. Verifique sua internet.' })
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .auth-input {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border 0.15s, box-shadow 0.15s, background 0.15s;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          color: #fff;
          font-family: inherit;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input:focus {
          background: rgba(255,255,255,0.07);
          border-color: ${G};
          box-shadow: 0 0 0 3px rgba(2,102,72,0.18);
        }
        .auth-input.err {
          background: rgba(127,29,29,0.18);
          border-color: rgba(248,113,113,0.45);
        }
        .auth-input.err:focus {
          box-shadow: 0 0 0 3px rgba(248,113,113,0.12);
        }
        .auth-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
          margin-bottom: 8px;
        }
        .auth-submit {
          height: 50px;
          width: 100%;
          border: none;
          border-radius: 13px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, ${GLit} 0%, ${G} 100%);
          box-shadow: 0 4px 20px rgba(2,102,72,0.30), 0 1px 0 rgba(255,255,255,0.08) inset;
          transition: opacity 0.15s, box-shadow 0.15s, transform 0.12s;
          font-family: inherit;
        }
        .auth-submit:hover:not(:disabled) {
          opacity: 0.88;
          box-shadow: 0 6px 28px rgba(2,102,72,0.42);
          transform: translateY(-1px);
        }
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-spin { animation: auth-spin 0.9s linear infinite; }
        .auth-link {
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          transition: color 0.15s;
          text-decoration: none;
        }
        .auth-link:hover { color: #fff; }
        .auth-link-green {
          color: ${GLit};
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.15s;
        }
        .auth-link-green:hover { color: #fff; }
        .auth-divider {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 8px 0;
        }
      `}</style>

      {/* Title */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.03em',
          margin: '0 0 8px',
        }}>
          Bem-vindo de volta
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.40)', margin: 0, fontWeight: 400 }}>
          Entre na sua conta PearFy
        </p>
      </div>

      {/* Auth error */}
      {errors.auth && (
        <div style={{
          marginBottom: 24,
          padding: '12px 16px',
          borderRadius: 11,
          fontSize: 14,
          color: '#fca5a5',
          background: 'rgba(127,29,29,0.25)',
          border: '1px solid rgba(248,113,113,0.22)',
        }}>
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Email */}
        <div>
          <label className="auth-label">E-mail</label>
          <input
            className={`auth-input${errors.email || errors.auth ? ' err' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '', email: '' })) }}
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="auth-label" style={{ marginBottom: 0 }}>Senha</span>
            <Link href="/esqueci-senha" className="auth-link">Esqueci a senha</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className={`auth-input${errors.password || errors.auth ? ' err' : ''}`}
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ paddingRight: 48 }}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '', password: '' })) }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPass(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.30)', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', padding: 0,
                transition: 'color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
            >
              {showPass
                ? <EyeOff style={{ width: 16, height: 16 }} />
                : <Eye     style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{errors.password}</p>
          )}
        </div>

        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading
            ? <Loader2 className="auth-spin" style={{ width: 18, height: 18 }} />
            : 'Entrar'}
        </button>
      </form>

      {/* Footer */}
      <div className="auth-divider" style={{ marginTop: 32 }} />
      <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: '20px 0 0' }}>
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="auth-link-green">Criar conta</Link>
      </p>
    </>
  )
}
