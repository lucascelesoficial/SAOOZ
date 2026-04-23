'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const G     = '#026648'
const G_DARK = '#015038'
const G_RGB  = '2,102,72'

function ReqItem({ met, label }: { met: boolean; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {met
        ? <Check style={{ width: 12, height: 12, color: G, flexShrink: 0 }} />
        : <X     style={{ width: 12, height: 12, color: '#cbd5e1', flexShrink: 0 }} />}
      <span style={{ fontSize: 12.5, color: met ? G : '#94a3b8', fontWeight: met ? 600 : 400 }}>
        {label}
      </span>
    </span>
  )
}

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading]         = useState(false)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [cfToken, setCfToken]         = useState('')

  const hasLength = password.length >= 8
  const hasNumber = /[0-9]/.test(password)
  const hasUpper  = /[A-Z]/.test(password)

  function clearErr(field: string) {
    setErrors(p => ({ ...p, [field]: '', auth: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!name || name.trim().length < 2)  errs.name    = 'Nome deve ter ao menos 2 caracteres'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!hasLength)                        errs.password = 'Mínimo 8 caracteres'
    else if (!hasNumber)                   errs.password = 'Inclua ao menos 1 número'
    else if (!hasUpper)                    errs.password = 'Inclua ao menos 1 letra maiúscula'
    if (password !== confirmPassword)      errs.confirm  = 'As senhas não coincidem'

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
        toast.error('Verificação de segurança falhou', { description: 'Recarregue a página e tente novamente.' })
        return
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/plano`,
      },
    })

    setLoading(false)

    if (error) {
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('rate limit') || msg.includes('too many') || error.status === 429) {
        toast.error('Muitas tentativas', { description: 'Aguarde alguns minutos e tente novamente.' })
      } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
        toast.error('E-mail já cadastrado', { description: 'Este e-mail já possui uma conta. Faça login ou use outro e-mail.' })
      } else if (msg.includes('invalid email') || msg.includes('unable to validate')) {
        toast.error('E-mail inválido', { description: 'Verifique o endereço de e-mail e tente novamente.' })
      } else if (msg.includes('signup') && msg.includes('disabled')) {
        toast.error('Cadastro indisponível', { description: 'Temporariamente desativado. Tente novamente mais tarde.' })
      } else {
        toast.error('Erro ao criar conta', { description: 'Verifique os dados e tente novamente.' })
      }
      return
    }

    if (data.user && !data.session) {
      identifyUser(data.user.id, { name, email })
      trackEvent(EVENTS.USER_SIGNUP, { method: 'email', confirmed: false })
      fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'auth.signup', metadata: { method: 'email', confirmed: false } }),
      }).catch(() => undefined)
      router.push(`/cadastro/confirmar?email=${encodeURIComponent(email)}`)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, email })
      identifyUser(data.user.id, { name, email })
      trackEvent(EVENTS.USER_SIGNUP, { method: 'email' })
      fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'auth.signup', metadata: { method: 'email' } }),
      }).catch(() => undefined)
    }

    toast.success('Conta criada!', { description: 'Bem-vindo à Pearfy.' })
    router.refresh()
    router.push('/onboarding/plano')
  }

  return (
    <>
      <style>{`
        .cp-inp {
          height: 54px;
          width: 100%;
          border-radius: 13px;
          padding: 0 18px;
          font-size: 15.5px;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
        .cp-inp::placeholder { color: #b8c4ce; }
        .cp-inp:hover:not(:focus) { border-color: #d0dae4; background: #f4f7fa; }
        .cp-inp:focus {
          border-color: ${G} !important;
          box-shadow: 0 0 0 3px rgba(${G_RGB},0.11) !important;
          background: #fff !important;
        }
        .cp-inp.err {
          border-color: #fca5a5 !important;
          background: #fff8f8 !important;
        }
        .cp-inp.err:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important;
        }
        .cp-lbl {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
          font-family: var(--font-inter), -apple-system, sans-serif;
        }
        .cp-btn {
          height: 56px;
          width: 100%;
          border: none;
          border-radius: 14px;
          background: ${G};
          color: #fff;
          font-size: 15.5px;
          font-weight: 700;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background .15s, transform .12s, box-shadow .15s;
          box-shadow: 0 4px 20px rgba(${G_RGB},0.30);
          position: relative;
          overflow: hidden;
        }
        .cp-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.11) 0%, transparent 60%);
          pointer-events: none;
        }
        .cp-btn:hover:not(:disabled) {
          background: ${G_DARK};
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(${G_RGB},0.36);
        }
        .cp-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 3px 12px rgba(${G_RGB},0.22);
        }
        .cp-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
        @keyframes cp-spin { to { transform: rotate(360deg); } }
        .cp-spin { animation: cp-spin 0.8s linear infinite; }
        .cp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 6px;
          color: #94a3b8; display: flex; align-items: center;
          border-radius: 8px; transition: color .15s, background .15s;
        }
        .cp-eye:hover { color: #475569; background: rgba(0,0,0,0.04); }
        .cp-ferr { font-size: 12.5px; color: #ef4444; font-weight: 500; margin-top: 6px; }
        .cp-link-g { color: ${G}; font-weight: 700; text-decoration: none; transition: color .15s; }
        .cp-link-g:hover { color: ${G_DARK}; }
      `}</style>

      {/* Heading */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontSize: 'clamp(24px, 2.8vw, 28px)',
          fontWeight: 800,
          color: '#0a1628',
          letterSpacing: '-0.04em',
          lineHeight: 1.2,
          marginBottom: 10,
        }}>
          Criar sua conta
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.55, fontWeight: 400 }}>
          Comece em minutos e organize sua vida financeira com clareza.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Nome */}
        <div>
          <label className="cp-lbl" htmlFor="cp-name">Nome completo</label>
          <input
            id="cp-name"
            className={`cp-inp${errors.name ? ' err' : ''}`}
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={e => { setName(e.target.value); clearErr('name') }}
          />
          {errors.name && <p className="cp-ferr">{errors.name}</p>}
        </div>

        {/* E-mail */}
        <div>
          <label className="cp-lbl" htmlFor="cp-email">E-mail</label>
          <input
            id="cp-email"
            className={`cp-inp${errors.email ? ' err' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); clearErr('email') }}
          />
          {errors.email && <p className="cp-ferr">{errors.email}</p>}
        </div>

        {/* Senha */}
        <div>
          <label className="cp-lbl" htmlFor="cp-pass">Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              id="cp-pass"
              className={`cp-inp${errors.password ? ' err' : ''}`}
              style={{ paddingRight: 50 }}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); clearErr('password') }}
            />
            <button type="button" tabIndex={-1} className="cp-eye" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && <p className="cp-ferr">{errors.password}</p>}

          {/* Password strength */}
          {password && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e8eef4' }}>
              <ReqItem met={hasLength} label="8 caracteres" />
              <ReqItem met={hasNumber} label="1 número" />
              <ReqItem met={hasUpper}  label="1 maiúscula" />
            </div>
          )}
        </div>

        {/* Confirmar senha */}
        <div>
          <label className="cp-lbl" htmlFor="cp-confirm">Confirmar senha</label>
          <div style={{ position: 'relative' }}>
            <input
              id="cp-confirm"
              className={`cp-inp${errors.confirm ? ' err' : ''}`}
              style={{ paddingRight: 50 }}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => { setConfirm(e.target.value); clearErr('confirm') }}
            />
            <button type="button" tabIndex={-1} className="cp-eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
              {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.confirm && <p className="cp-ferr">{errors.confirm}</p>}
        </div>

        {/* Turnstile */}
        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        {/* Submit */}
        <button className="cp-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading
            ? <Loader2 className="cp-spin" style={{ width: 18, height: 18 }} />
            : 'Criar minha conta'}
        </button>
      </form>

      {/* Trust */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <svg width="11" height="12" viewBox="0 0 12 14" fill="none">
          <path d="M6 1L1 3.2V7C1 10.2 3.6 13 6 13.8C8.4 13 11 10.2 11 7V3.2L6 1Z" stroke="#94a3b8" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M4 7L5.5 8.5L8.5 5.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.01em' }}>
          Criptografia SSL 256-bit
        </span>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #f0f4f8', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#64748b' }}>
          Já tem uma conta?{' '}
          <Link href="/login" className="cp-link-g">Entrar</Link>
        </p>
      </div>
    </>
  )
}
