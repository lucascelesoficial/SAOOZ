'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'

const inputBase = { background: '#F8FAFC', border: '1px solid #DDE3ED', color: '#0F172A' }
const inputError = { background: '#FFF5F5', border: '1px solid #FCA5A5', boxShadow: '0 0 0 3px #FEE2E220', color: '#0F172A' }
const inputFocusOk = { border: '1px solid #6CA33A', boxShadow: '0 0 0 3px #84CC1624' }
const inputFocusErr = { border: '1px solid #F87171', boxShadow: '0 0 0 3px #FEE2E220' }

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {met ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-slate-300" />}
      <span className={met ? 'text-emerald-600' : 'text-slate-400'}>{label}</span>
    </span>
  )
}

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  children,
}: {
  id: string
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-[10px] px-4 pr-11 text-sm outline-none transition-all placeholder:text-slate-400"
          style={error ? inputError : inputBase}
          onFocus={(e) => Object.assign(e.currentTarget.style, error ? inputFocusErr : inputFocusOk)}
          onBlur={(e) => Object.assign(e.currentTarget.style, error ? inputError : inputBase)}
        />
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cfToken, setCfToken] = useState('')

  const hasLength = password.length >= 8
  const hasNumber = /[0-9]/.test(password)
  const hasUpper = /[A-Z]/.test(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!name || name.trim().length < 2) errs.name = 'Nome deve ter ao menos 2 caracteres'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido'
    if (!hasLength) errs.password = 'Mínimo 8 caracteres'
    else if (!hasNumber) errs.password = 'Inclua ao menos 1 número'
    else if (!hasUpper) errs.password = 'Inclua ao menos 1 letra maiúscula'
    if (password !== confirmPassword) errs.confirm = 'As senhas não coincidem'

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

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
      email,
      password,
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
        toast.error('Muitas tentativas', {
          description: 'Limite de cadastros atingido. Aguarde alguns minutos e tente novamente.',
        })
      } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
        toast.error('E-mail já cadastrado', {
          description: 'Este e-mail já possui uma conta. Faça login ou use outro e-mail.',
        })
      } else if (msg.includes('invalid email') || msg.includes('unable to validate')) {
        toast.error('E-mail inválido', {
          description: 'Verifique o endereço de e-mail e tente novamente.',
        })
      } else if (msg.includes('signup') && msg.includes('disabled')) {
        toast.error('Cadastro indisponível', {
          description: 'O cadastro está temporariamente desativado. Tente novamente mais tarde.',
        })
      } else {
        toast.error('Erro ao criar conta', {
          description: 'Verifique os dados e tente novamente.',
        })
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

    toast.success('Conta criada!', { description: 'Bem-vindo à Pear Finance.' })
    router.refresh()
    router.push('/onboarding/plano')
  }

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Criar conta na Pear Finance</h1>
        <p className="mt-1.5 text-sm text-slate-500">Comece em minutos e organize sua vida financeira com clareza.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="name" label="Nome completo" placeholder="Seu nome completo" value={name} onChange={setName} error={errors.name} />

        <Field id="email" label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} error={errors.email} />

        <Field
          id="password"
          label="Senha"
          type={showPass ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
        >
          <EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />
        </Field>

        {password && (
          <div className="flex flex-wrap gap-4 px-1">
            <Req met={hasLength} label="8 caracteres" />
            <Req met={hasNumber} label="1 número" />
            <Req met={hasUpper} label="1 maiúscula" />
          </div>
        )}

        <Field
          id="confirm"
          label="Confirmar senha"
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={setConfirm}
          error={errors.confirm}
        >
          <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
        </Field>

        <TurnstileWidget onVerify={setCfToken} onError={() => setCfToken('')} onExpire={() => setCfToken('')} />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #7AAE3A 0%, #5B9637 38%, #1F4E8C 100%)',
            boxShadow: '0 6px 18px rgba(22, 101, 52, 0.24)',
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-semibold text-[#5A9638] transition-colors hover:text-[#45772C]">
          Entrar
        </Link>
      </p>
    </div>
  )
}
