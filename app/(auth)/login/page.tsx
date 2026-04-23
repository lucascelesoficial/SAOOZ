'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Insira um e-mail válido'
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
    } catch {
      setErrors({ auth: 'Erro de conexão. Verifique sua internet e tente novamente.' })
      setLoading(false)
    }
  }

  const hasErr = (field: string) => !!(errors[field] || errors.auth)

  return (
    <>
      <style>{`
        /* ─ Inputs ─ */
        .lf-input {
          height: 52px;
          width: 100%;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 15px;
          font-family: inherit;
          font-weight: 400;
          outline: none;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          color: #0f172a;
          display: block;
          box-sizing: border-box;
          transition: border-color .15s, background .15s, box-shadow .15s;
          -webkit-appearance: none;
        }
        .lf-input::placeholder { color: #94a3b8; }
        .lf-input:hover:not(:focus) { border-color: #cbd5e1; }
        .lf-input:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3.5px rgba(2,102,72,0.12) !important;
          background: #fff !important;
        }
        .lf-input.lf-err {
          border-color: #fca5a5 !important;
          background: #fff8f8 !important;
        }
        .lf-input.lf-err:focus {
          border-color: #f87171 !important;
          box-shadow: 0 0 0 3.5px rgba(248,113,113,0.12) !important;
        }

        /* ─ Label ─ */
        .lf-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        /* ─ Submit button ─ */
        .lf-btn {
          height: 52px;
          width: 100%;
          border: none;
          border-radius: 12px;
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
          box-shadow: 0 4px 18px rgba(2,102,72,0.30), 0 1px 3px rgba(2,102,72,0.15);
          position: relative;
          overflow: hidden;
        }
        .lf-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%);
          pointer-events: none;
        }
        .lf-btn:hover:not(:disabled) {
          background: #01553b;
          transform: translateY(-1.5px);
          box-shadow: 0 8px 28px rgba(2,102,72,0.35), 0 2px 6px rgba(2,102,72,0.20);
        }
        .lf-btn:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 0 3px 12px rgba(2,102,72,0.25);
        }
        .lf-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

        /* ─ Spinner ─ */
        @keyframes lf-spin { to { transform: rotate(360deg); } }
        .lf-spin { animation: lf-spin 0.8s linear infinite; }

        /* ─ Links ─ */
        .lf-link-sm {
          font-size: 13px;
          color: #64748b;
          text-decoration: none;
          transition: color .15s;
          font-weight: 500;
        }
        .lf-link-sm:hover { color: ${G}; }
        .lf-link-accent {
          color: ${G};
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: color .15s;
        }
        .lf-link-accent:hover { color: #014d35; }

        /* ─ Error message ─ */
        .lf-field-err {
          font-size: 12px;
          color: #ef4444;
          margin-top: 6px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ─ Eye toggle ─ */
        .lf-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          transition: color .15s;
          border-radius: 6px;
        }
        .lf-eye:hover { color: #475569; background: rgba(0,0,0,0.04); }

        /* ─ Divider ─ */
        .lf-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .lf-divider-line {
          flex: 1;
          height: 1px;
          background: #f1f5f9;
        }
      `}</style>

      {/* ── Welcome badge ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(2,102,72,0.07)',
          border: `1px solid rgba(2,102,72,0.18)`,
          borderRadius: 20,
          padding: '5px 13px 5px 10px',
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: GLit,
            display: 'inline-block',
            boxShadow: `0 0 7px ${GLit}`,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: G,
            letterSpacing: '0.02em',
          }}>
            Bem-vindo de volta
          </span>
        </div>
      </div>

      {/* ── Heading ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 'clamp(24px, 3.5vw, 30px)',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.035em',
          lineHeight: 1.18,
          marginBottom: 10,
        }}>
          Acesse sua conta
        </h1>
        <p style={{
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.6,
          fontWeight: 400,
        }}>
          Continue gerenciando suas finanças com inteligência
        </p>
      </div>

      {/* ── Auth error banner ── */}
      {errors.auth && (
        <div style={{
          marginBottom: 24,
          padding: '13px 16px',
          borderRadius: 12,
          fontSize: 13.5,
          fontWeight: 500,
          color: '#b91c1c',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span>{errors.auth}</span>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Email */}
        <div>
          <label className="lf-label" htmlFor="lf-email">E-mail</label>
          <input
            id="lf-email"
            className={`lf-input${hasErr('email') ? ' lf-err' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '', email: '' })) }}
          />
          {errors.email && (
            <p className="lf-field-err">
              <span>•</span> {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <label className="lf-label" htmlFor="lf-pass" style={{ marginBottom: 0 }}>
              Senha
            </label>
            <Link href="/esqueci-senha" className="lf-link-sm">
              Esqueci a senha
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="lf-pass"
              className={`lf-input${hasErr('password') ? ' lf-err' : ''}`}
              style={{ paddingRight: 50 }}
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '', password: '' })) }}
            />
            <button
              type="button"
              tabIndex={-1}
              className="lf-eye"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPass
                ? <EyeOff style={{ width: 15, height: 15 }} />
                : <Eye    style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {errors.password && (
            <p className="lf-field-err">
              <span>•</span> {errors.password}
            </p>
          )}
        </div>

        {/* Turnstile */}
        <TurnstileWidget
          onVerify={setCfToken}
          onError={() => setCfToken('')}
          onExpire={() => setCfToken('')}
        />

        {/* Submit */}
        <button
          className="lf-btn"
          type="submit"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <Loader2 className="lf-spin" style={{ width: 18, height: 18 }} />
          ) : (
            <>
              Acessar conta
              <ArrowRight style={{ width: 16, height: 16, opacity: 0.85 }} />
            </>
          )}
        </button>
      </form>

      {/* ── Trust badge ── */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
          <path d="M8 1L2 3.5V8C2 11.5 5 14.5 8 15.5C11 14.5 14 11.5 14 8V3.5L8 1Z" stroke="#374151" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M5.5 8L7 9.5L10.5 6" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.01em' }}>
          Conexão criptografada com SSL 256-bit
        </span>
      </div>

      {/* ── Divider + Footer ── */}
      <div style={{ marginTop: 28 }}>
        <div className="lf-divider">
          <div className="lf-divider-line" />
        </div>
      </div>

      <div style={{
        marginTop: 24,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="lf-link-accent">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </>
  )
}
