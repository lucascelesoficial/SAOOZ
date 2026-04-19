'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const inputBase  = { background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A' }
const inputError = { background: '#FFF5F5', border: '1px solid #FCA5A5', boxShadow: '0 0 0 3px #FEE2E220', color: '#0F172A' }
const inputFocusOk  = { border: '1px solid #2563EB', boxShadow: '0 0 0 3px #2563EB18' }
const inputFocusErr = { border: '1px solid #F87171', boxShadow: '0 0 0 3px #FEE2E220' }

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {met
        ? <Check className="h-3 w-3 text-emerald-500" />
        : <X     className="h-3 w-3 text-slate-300" />}
      <span className={met ? 'text-emerald-600' : 'text-slate-400'}>{label}</span>
    </span>
  )
}

function Field({
  id, label, type = 'text', placeholder, value, onChange, error, children,
}: {
  id: string; label: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; error?: string
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm placeholder:text-slate-400 outline-none transition-all"
          style={error ? inputError : inputBase}
          onFocus={(e) => Object.assign(e.currentTarget.style, error ? inputFocusErr : inputFocusOk)}
          onBlur={(e)  => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
        />
        {children}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name || name.trim().length < 2)                       errs.name     = 'Nome deve ter ao menos 2 caracteres'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  errs.email    = 'Email inválido'
    if (!hasLength)                                             errs.password = 'Mínimo 8 caracteres'
    else if (!hasNumber)                                        errs.password = 'Inclua ao menos 1 número'
    else if (!hasUpper)                                         errs.password = 'Inclua ao menos 1 maiúscula'
    if (password !== confirmPassword)                           errs.confirm  = 'Senhas não coincidem'
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
        toast.error('Verificação de segurança falhou', {
          description: 'Recarregue a página e tente novamente.',
        })
        return
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/plano`,
      },
    })
    setLoading(false)

    if (error) {
      console.error('[cadastro] signUp error:', error.message, 'status:', error.status)
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('rate limit') || msg.includes('too many') || error.status === 429) {
        toast.error('Muitas tentativas', { description: 'Limite de cadastros atingido. Aguarde alguns minutos e tente novamente.' })
      } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
        toast.error('E-mail já cadastrado', { description: 'Este e-mail já possui uma conta. Faça login ou use outro e-mail.' })
      } else if (msg.includes('invalid email') || msg.includes('unable to validate')) {
        toast.error('E-mail inválido', { description: 'Verifique o endereço de e-mail e tente novamente.' })
      } else if (msg.includes('signup') && msg.includes('disabled')) {
        toast.error('Cadastro indisponível', { description: 'O cadastro está temporariamente desativado. Tente novamente mais tarde.' })
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
    toast.success('Conta criada!', { description: 'Bem-vindo ao SAOOZ.' })
    router.refresh()
    router.push('/onboarding/plano')
  }

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Crie sua conta</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Comece a entender suas finanças em minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="name"  label="Nome completo" placeholder="Seu nome completo"
          value={name}  onChange={setName}  error={errors.name} />

        <Field id="email" label="E-mail" type="email" placeholder="seu@email.com"
          value={email} onChange={setEmail} error={errors.email} />

        <Field id="password" label="Senha" type={showPass ? 'text' : 'password'} placeholder="••••••••"
          value={password} onChange={setPassword} error={errors.password}>
          <EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />
        </Field>

        {password && (
          <div className="flex gap-4 flex-wrap px-1">
            <Req met={hasLength} label="8 caracteres" />
            <Req met={hasNumber} label="1 número" />
            <Req met={hasUpper}  label="1 maiúscula" />
          </div>
        )}

        <Field id="confirm" label="Confirmar senha" type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
          value={confirmPassword} onChange={setConfirm} error={errors.confirm}>
          <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
        </Field>

        <TurnstileWidget
          onVerify={setCfToken}
          onError={() => setCfToken('')}
          onExpire={() => setCfToken('')}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            boxShadow: '0 4px 16px #2563EB30',
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors">
          Entrar agora
        </Link>
      </p>
    </div>
  )
}
