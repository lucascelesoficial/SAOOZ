'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const G = '#16a34a'

export default function LoginPage() {
  const [mode, setMode]           = useState<'magic' | 'password'>('magic')
  const [loading, setLoading]     = useState(false)
  const [sent, setSent]           = useState(false)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [cfToken, setCfToken]     = useState('')
  const [keepAuth, setKeepAuth]   = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Insira um e-mail válido' }); return
    }
    setErrors({})
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })
      if (error) {
        setErrors({ auth: 'Não foi possível enviar o link. Verifique o e-mail.' })
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setErrors({ auth: 'Erro de conexão. Verifique sua internet.' })
    } finally {
      setLoading(false)
    }
  }

  async function handlePassword(e: React.FormEvent) {
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

  return (
    <>
      <style>{`
        .lp-inp {
          height: 50px;
          width: 100%;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 15px;
          font-family: inherit;
          font-weight: 400;
          outline: none;
          background: #f8fafc;
          border: 1.5px solid #e8eef4;
          color: #0f172a;
          display: block;
          box-sizing: border-box;
          -webkit-appearance: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .lp-inp::placeholder { color: #b8c4ce; }
        .lp-inp:hover:not(:focus) { border-color: #d0dae4; background: #f4f7fa; }
        .lp-inp:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.10) !important;
          background: #fff !important;
        }
        .lp-inp.err {
          border-color: #fca5a5 !important;
          background: #fff8f8 !important;
        }
        .lp-inp.err:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important;
        }
        .lp-lbl {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 7px;
          letter-spacing: -0.01em;
        }
        .lp-btn {
          height: 52px;
          width: 100%;
          border: none;
          border-radius: 13px;
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
          gap: 10px;
          transition: background .15s, transform .12s, box-shadow .15s;
          box-shadow: 0 4px 20px rgba(22,163,74,0.30);
          position: relative;
          overflow: hidden;
        }
        .lp-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .lp-btn:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(22,163,74,0.36);
        }
        .lp-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 3px 12px rgba(22,163,74,0.22);
        }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { animation: lp-spin 0.8s linear infinite; }
        .lp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 6px;
          color: #94a3b8; display: flex; align-items: center;
          border-radius: 8px; transition: color .15s, background .15s;
        }
        .lp-eye:hover { color: #475569; background: rgba(0,0,0,0.04); }
        .lp-ferr { font-size: 12px; color: #ef4444; font-weight: 500; margin-top: 5px; }
        .lp-link { font-size: 13px; color: #64748b; font-weight: 500; text-decoration: none; transition: color .15s; }
        .lp-link:hover { color: ${G}; }
        .lp-link-g { color: ${G}; font-weight: 700; text-decoration: none; transition: color .15s; }
        .lp-link-g:hover { color: #15803d; }

        /* Tab switcher */
        .lp-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 3px;
          gap: 2px;
          margin-bottom: 28px;
        }
        .lp-tab {
          flex: 1;
          height: 38px;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .15s, color .15s, box-shadow .15s;
        }
        .lp-tab-active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 6px rgba(0,0,0,0.10);
        }
        .lp-tab-inactive {
          background: transparent;
          color: #94a3b8;
        }
        .lp-tab-inactive:hover { color: #64748b; }

        /* Checkbox */
        .lp-check-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .lp-check {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color .15s, background .15s;
          cursor: pointer;
        }
        .lp-check.checked {
          background: ${G};
          border-color: ${G};
        }
      `}</style>

      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 'clamp(22px, 2.8vw, 26px)',
          fontWeight: 800,
          color: '#0a1628',
          letterSpacing: '-0.04em',
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          Entrar na sua conta
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55, fontWeight: 400 }}>
          Acesse sua central financeira para organizar suas finanças pessoais e empresariais com clareza.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="lp-tabs">
        <button
          type="button"
          className={`lp-tab ${mode === 'magic' ? 'lp-tab-active' : 'lp-tab-inactive'}`}
          onClick={() => { setMode('magic'); setErrors({}) }}
        >
          Login sem senha
        </button>
        <button
          type="button"
          className={`lp-tab ${mode === 'password' ? 'lp-tab-active' : 'lp-tab-inactive'}`}
          onClick={() => { setMode('password'); setErrors({}) }}
        >
          Login com senha
        </button>
      </div>

      {/* Auth error */}
      {errors.auth && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          color: '#b91c1c',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ flexShrink: 0 }}>⚠</span>
          <span>{errors.auth}</span>
        </div>
      )}

      {/* ── Magic link sent ── */}
      {sent && mode === 'magic' ? (
        <div style={{
          padding: '24px 20px',
          borderRadius: 14,
          background: 'rgba(22,163,74,0.06)',
          border: '1px solid rgba(22,163,74,0.18)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            background: 'rgba(22,163,74,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke={G} strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke={G} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 6 }}>Link enviado!</p>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Verifique sua caixa de entrada em <strong style={{ color: '#0f172a' }}>{email}</strong> e clique no link para acessar.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            style={{
              marginTop: 16, fontSize: 13, color: G, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Usar outro e-mail
          </button>
        </div>
      ) : mode === 'magic' ? (

        /* ── Magic link form ── */
        <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="lp-lbl" htmlFor="lp-email">E-mail</label>
            <input
              id="lp-email"
              className={`lp-inp${errors.email ? ' err' : ''}`}
              type="email"
              autoComplete="email"
              placeholder="Digite seu e-mail para login sem senha"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '', auth: '' })) }}
            />
            {errors.email && <p className="lp-ferr">{errors.email}</p>}
          </div>

          {/* Keep auth */}
          <label className="lp-check-wrap">
            <button
              type="button"
              className={`lp-check ${keepAuth ? 'checked' : ''}`}
              onClick={() => setKeepAuth(v => !v)}
              aria-checked={keepAuth}
              role="checkbox"
            >
              {keepAuth && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>Manter conexão</span>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 1, lineHeight: 1.4 }}>
                Se você marcar esta opção, seu login será mantido até que faça logout ou limpe os dados do navegador
              </p>
            </div>
          </label>

          <button className="lp-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading
              ? <Loader2 className="lp-spin" style={{ width: 18, height: 18 }} />
              : 'Enviar Link De Acesso'}
          </button>
        </form>

      ) : (

        /* ── Password form ── */
        <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="lp-lbl" htmlFor="lp-email-pw">E-mail</label>
            <input
              id="lp-email-pw"
              className={`lp-inp${errors.email ? ' err' : ''}`}
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '', auth: '' })) }}
            />
            {errors.email && <p className="lp-ferr">{errors.email}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label className="lp-lbl" htmlFor="lp-pass" style={{ marginBottom: 0 }}>Senha</label>
              <Link href="/esqueci-senha" className="lp-link" style={{ fontSize: 12.5 }}>Esqueci a senha</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="lp-pass"
                className={`lp-inp${errors.password ? ' err' : ''}`}
                style={{ paddingRight: 50 }}
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '', auth: '' })) }}
              />
              <button
                type="button" tabIndex={-1} className="lp-eye"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
            {errors.password && <p className="lp-ferr">{errors.password}</p>}
          </div>

          <TurnstileWidget
            onVerify={setCfToken}
            onError={() => setCfToken('')}
            onExpire={() => setCfToken('')}
          />

          <button className="lp-btn" type="submit" disabled={loading} style={{ marginTop: 2 }}>
            {loading
              ? <Loader2 className="lp-spin" style={{ width: 18, height: 18 }} />
              : 'Acessar minha conta'}
          </button>
        </form>
      )}

      {/* Trust badge */}
      {!sent && (
        <div style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
        }}>
          <svg width="11" height="12" viewBox="0 0 12 14" fill="none">
            <path d="M6 1L1 3.2V7C1 10.2 3.6 13 6 13.8C8.4 13 11 10.2 11 7V3.2L6 1Z" stroke="#94a3b8" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M4 7L5.5 8.5L8.5 5.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>
            Criptografia SSL 256-bit
          </span>
        </div>
      )}

      {/* Footer link */}
      <div style={{
        marginTop: 28,
        paddingTop: 20,
        borderTop: '1px solid #f0f4f8',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="lp-link-g">Cadastre-se</Link>
        </p>
      </div>
    </>
  )
}
