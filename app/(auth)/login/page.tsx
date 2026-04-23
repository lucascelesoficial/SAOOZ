'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, MoveRight } from 'lucide-react'
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
        setErrors({ auth: 'Verificação de segurança falhou. Recarregue a página.' })
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

  const hasErr = (f: string) => !!(errors[f] || errors.auth)

  return (
    <>
      <style>{`
        /* ─── Inputs ─── */
        .lp-inp {
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
          -webkit-appearance: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .lp-inp::placeholder { color: #b0bec8; }
        .lp-inp:hover:not(:focus) { border-color: #cbd5e1; background: #f4f7fa; }
        .lp-inp:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3.5px rgba(2,102,72,0.11) !important;
          background: #fff !important;
        }
        .lp-inp.err {
          border-color: #fca5a5 !important;
          background: #fff8f8 !important;
        }
        .lp-inp.err:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3.5px rgba(239,68,68,0.10) !important;
        }

        /* ─── Label ─── */
        .lp-lbl {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        /* ─── Submit ─── */
        .lp-btn {
          height: 54px;
          width: 100%;
          border: none;
          border-radius: 13px;
          background: ${G};
          color: #fff;
          font-size: 15.5px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: -0.015em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: background .15s, transform .12s, box-shadow .15s;
          box-shadow: 0 4px 20px rgba(2,102,72,0.32), 0 1px 3px rgba(2,102,72,0.16);
          position: relative;
          overflow: hidden;
        }
        .lp-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%);
          pointer-events: none;
        }
        .lp-btn:hover:not(:disabled) {
          background: #01553b;
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(2,102,72,0.36), 0 2px 6px rgba(2,102,72,0.20);
        }
        .lp-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 3px 12px rgba(2,102,72,0.22);
        }
        .lp-btn:disabled { opacity: 0.52; cursor: not-allowed; transform: none !important; }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { animation: lp-spin 0.8s linear infinite; }

        /* ─── Eye toggle ─── */
        .lp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 6px;
          color: #94a3b8; display: flex; align-items: center;
          border-radius: 8px; transition: color .15s, background .15s;
        }
        .lp-eye:hover { color: #475569; background: rgba(0,0,0,0.05); }

        /* ─── Links ─── */
        .lp-link { font-size: 13px; color: #64748b; font-weight: 500; text-decoration: none; transition: color .15s; }
        .lp-link:hover { color: ${G}; }
        .lp-link-g { color: ${G}; font-weight: 700; text-decoration: none; transition: color .15s; }
        .lp-link-g:hover { color: #014d35; }

        /* ─── Field error ─── */
        .lp-ferr { font-size: 12px; color: #ef4444; font-weight: 500; margin-top: 6px; }
      `}</style>

      {/* ── Welcome badge ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(2,102,72,0.07)',
          border: '1px solid rgba(2,102,72,0.18)',
          borderRadius: 100,
          padding: '5px 13px 5px 9px',
        }}>
          <span style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: GLit,
            boxShadow: `0 0 8px ${GLit}`,
            display: 'inline-block',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: G, letterSpacing: '0.02em' }}>
            Bem-vindo de volta
          </span>
        </div>
      </div>

      {/* ── Heading ── */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontSize: 'clamp(26px, 3.5vw, 32px)',
          fontWeight: 800,
          color: '#0a1628',
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          marginBottom: 10,
        }}>
          Acesse sua conta
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
          Continue gerenciando suas finanças com inteligência
        </p>
      </div>

      {/* ── Auth error ── */}
      {errors.auth && (
        <div style={{
          marginBottom: 22,
          padding: '13px 16px',
          borderRadius: 12,
          fontSize: 13.5,
          fontWeight: 500,
          color: '#b91c1c',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
          <span>{errors.auth}</span>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* E-mail */}
        <div>
          <label className="lp-lbl" htmlFor="lp-email">E-mail</label>
          <input
            id="lp-email"
            className={`lp-inp${hasErr('email') ? ' err' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, auth: '', email: '' })) }}
          />
          {errors.email && <p className="lp-ferr">{errors.email}</p>}
        </div>

        {/* Senha */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="lp-lbl" htmlFor="lp-pass" style={{ marginBottom: 0 }}>Senha</label>
            <Link href="/esqueci-senha" className="lp-link">Esqueci a senha</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="lp-pass"
              className={`lp-inp${hasErr('password') ? ' err' : ''}`}
              style={{ paddingRight: 50 }}
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, auth: '', password: '' })) }}
            />
            <button
              type="button" tabIndex={-1} className="lp-eye"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar' : 'Mostrar'}
            >
              {showPass
                ? <EyeOff style={{ width: 15, height: 15 }} />
                : <Eye    style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {errors.password && <p className="lp-ferr">{errors.password}</p>}
        </div>

        {/* Turnstile */}
        <TurnstileWidget
          onVerify={setCfToken}
          onError={() => setCfToken('')}
          onExpire={() => setCfToken('')}
        />

        {/* Submit */}
        <button className="lp-btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
          {loading
            ? <Loader2 className="lp-spin" style={{ width: 18, height: 18 }} />
            : <>Acessar conta <MoveRight style={{ width: 16, height: 16, opacity: 0.80 }} /></>}
        </button>
      </form>

      {/* ── Trust ── */}
      <div style={{
        marginTop: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <svg width="11" height="12" viewBox="0 0 12 14" fill="none">
          <path d="M6 1L1 3.2V7C1 10.2 3.6 13 6 13.8C8.4 13 11 10.2 11 7V3.2L6 1Z" stroke="#94a3b8" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M4 7L5.5 8.5L8.5 5.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.01em' }}>
          Criptografia SSL 256-bit
        </span>
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 28,
        paddingTop: 22,
        borderTop: '1px solid #f0f4f8',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="lp-link-g">Criar conta gratuita</Link>
        </p>
      </div>
    </>
  )
}
