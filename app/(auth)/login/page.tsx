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
        /* ── Inputs ── */
        .li {
          display: block;
          height: 52px;
          width: 100%;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 0 18px;
          font-size: 15px;
          font-weight: 400;
          color: #fff;
          outline: none;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
        }
        .li::placeholder { color: rgba(255,255,255,0.20); }
        .li:focus {
          background: rgba(255,255,255,0.07);
          border-color: rgba(2,102,72,0.75);
          box-shadow: 0 0 0 4px rgba(2,102,72,0.14);
        }
        .li.e {
          background: rgba(153,27,27,0.14);
          border-color: rgba(248,113,113,0.40);
        }
        .li.e:focus { box-shadow: 0 0 0 4px rgba(248,113,113,0.10); }

        /* ── Label ── */
        .ll {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.42);
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }

        /* ── Submit button ── */
        .lb {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 52px;
          width: 100%;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
          cursor: pointer;
          overflow: hidden;
          font-family: inherit;
          background: ${G};
          /* Gloss top highlight */
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.14),
            0 1px 3px rgba(0,0,0,0.40),
            0 6px 20px rgba(2,102,72,0.32);
          transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .lb:hover:not(:disabled) {
          opacity: 0.90;
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.14),
            0 2px 4px rgba(0,0,0,0.40),
            0 10px 28px rgba(2,102,72,0.42);
        }
        .lb:active:not(:disabled) { transform: translateY(0); }
        .lb:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Helper link ── */
        .la {
          color: rgba(255,255,255,0.35);
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          transition: color 0.15s;
        }
        .la:hover { color: rgba(255,255,255,0.75); }

        /* ── Signup link ── */
        .lg {
          color: ${GLit};
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lg:hover { color: #fff; }

        @keyframes li-spin { to { transform: rotate(360deg); } }
        .li-spin { animation: li-spin 0.85s linear infinite; }
      `}</style>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
          margin: '0 0 10px',
        }}>
          Bem-vindo de volta
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.38)',
          margin: 0,
          lineHeight: 1.55,
          fontWeight: 400,
        }}>
          Entre na sua conta para continuar
        </p>
      </div>

      {/* Auth error banner */}
      {errors.auth && (
        <div style={{
          marginBottom: 24,
          padding: '13px 18px',
          borderRadius: 12,
          fontSize: 14,
          color: '#fca5a5',
          background: 'rgba(127,29,29,0.22)',
          border: '1px solid rgba(248,113,113,0.20)',
          lineHeight: 1.5,
        }}>
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 20 }}>
          <label className="ll">E-mail</label>
          <input
            className={`li${errors.email || errors.auth ? ' e' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '', email: '' })) }}
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: '#f87171', margin: '6px 0 0' }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="ll" style={{ marginBottom: 0 }}>Senha</span>
            <Link href="/esqueci-senha" className="la">Esqueci a senha</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className={`li${errors.password || errors.auth ? ' e' : ''}`}
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ paddingRight: 52 }}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '', password: '' })) }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPass(v => !v)}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center',
                transition: 'color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
            >
              {showPass
                ? <EyeOff style={{ width: 16, height: 16 }} />
                : <Eye     style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: '#f87171', margin: '6px 0 0' }}>{errors.password}</p>
          )}
        </div>

        {/* Turnstile */}
        <div style={{ marginBottom: 4 }}>
          <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />
        </div>

        {/* Submit */}
        <button className="lb" type="submit" disabled={loading} style={{ marginTop: 28 }}>
          {loading
            ? <Loader2 className="li-spin" style={{ width: 18, height: 18 }} />
            : 'Entrar'}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        margin: '32px 0',
        height: 1,
        background: 'rgba(255,255,255,0.06)',
      }} />

      {/* Sign up */}
      <p style={{
        textAlign: 'center',
        fontSize: 14,
        color: 'rgba(255,255,255,0.32)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        Não tem uma conta?{' '}
        <Link href="/cadastro" className="lg">Criar conta grátis</Link>
      </p>
    </>
  )
}
