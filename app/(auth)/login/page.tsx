'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const G = '#026648'

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

  /* ── Input style helpers ── */
  const base: React.CSSProperties = {
    height: 48,
    width: '100%',
    borderRadius: 10,
    padding: '0 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    fontWeight: 400,
    outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    color: '#0f172a',
    display: 'block',
    boxSizing: 'border-box' as const,
  }
  const err: React.CSSProperties = {
    ...base,
    border: '1.5px solid #fca5a5',
    background: '#fff5f5',
  }

  return (
    <>
      <style>{`
        .li::placeholder { color: #94a3b8; }
        .li:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3px rgba(2,102,72,0.10) !important;
          background: #fff !important;
        }
        .li.err:focus {
          border-color: #f87171 !important;
          box-shadow: 0 0 0 3px rgba(248,113,113,0.10) !important;
        }
        .lbtn {
          height: 50px;
          width: 100%;
          border: none;
          border-radius: 11px;
          background: ${G};
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: -0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .15s, transform .12s, box-shadow .15s;
          box-shadow: 0 2px 8px rgba(2,102,72,0.20);
        }
        .lbtn:hover:not(:disabled) {
          background: #01553b;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2,102,72,0.28);
        }
        .lbtn:active:not(:disabled) { transform: translateY(0); }
        .lbtn:disabled { opacity: 0.50; cursor: not-allowed; }
        @keyframes lspin { to { transform: rotate(360deg); } }
        .lspin { animation: lspin 0.85s linear infinite; }

        .llink { color: #64748b; font-size: 13px; text-decoration: none; transition: color .15s; }
        .llink:hover { color: ${G}; }
        .llink-g { color: ${G}; font-size: 14px; font-weight: 600; text-decoration: none; transition: color .15s; }
        .llink-g:hover { color: #014d35; }
      `}</style>

      {/* Heading */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          Entrar na sua conta
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55, fontWeight: 400 }}>
          Insira seus dados para continuar sua jornada na PearFy
        </p>
      </div>

      {/* Auth error */}
      {errors.auth && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 14,
          color: '#dc2626',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          lineHeight: 1.5,
        }}>
          {errors.auth}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Email */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#374151',
            marginBottom: 7,
          }}>
            E-mail
          </label>
          <input
            className={`li${errors.email || errors.auth ? ' err' : ''}`}
            style={errors.email || errors.auth ? err : base}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '', email: '' })) }}
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Senha</label>
            <Link href="/esqueci-senha" className="llink">Esqueci a senha</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className={`li${errors.password || errors.auth ? ' err' : ''}`}
              style={{
                ...(errors.password || errors.auth ? err : base),
                paddingRight: 50,
              }}
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '', password: '' })) }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPass(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: '#9ca3af', display: 'flex', alignItems: 'center',
                transition: 'color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#475569')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>{errors.password}</p>
          )}
        </div>

        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        {/* Submit */}
        <button className="lbtn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
          {loading
            ? <Loader2 className="lspin" style={{ width: 18, height: 18 }} />
            : 'Entrar'}
        </button>
      </form>

      {/* Footer */}
      <div style={{
        marginTop: 28,
        paddingTop: 24,
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="llink-g">Criar conta</Link>
        </p>
      </div>
    </>
  )
}
