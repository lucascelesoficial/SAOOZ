'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent, identifyUser, EVENTS } from '@/lib/posthog/client'

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {met
        ? <Check className="h-3 w-3 text-[#22c55e]" />
        : <X     className="h-3 w-3 text-[#4A4A4A]" />}
      <span className={met ? 'text-[#22c55e]' : 'text-[#6B6B6B]'}>{label}</span>
    </span>
  )
}

function Field({
  id, label, type = 'text', placeholder, value, onChange, error, onFocus, onBlur,
  children,
}: {
  id: string; label: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; error?: string
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm text-white placeholder:text-[#4A4A4A] outline-none transition-all"
          style={{
            background: '#1E1E1E',
            border: error ? '1px solid #f87171' : '1px solid #383838',
            boxShadow: error ? '0 0 0 3px #f8717120' : undefined,
          }}
          onFocus={(e) => { if (!error) { e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' } onFocus?.(e) }}
          onBlur={(e)  => { if (!error) { e.currentTarget.style.border = '1px solid #383838'; e.currentTarget.style.boxShadow = 'none' } onBlur?.(e) }}
        />
        {children}
      </div>
      {error && <p className="text-[#f87171] text-xs">{error}</p>}
    </div>
  )
}

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading]             = useState(false)
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirm]     = useState('')
  const [showPass, setShowPass]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [errors, setErrors]               = useState<Record<string, string>>({})

  const hasLength = password.length >= 8
  const hasNumber = /[0-9]/.test(password)
  const hasUpper  = /[A-Z]/.test(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name || name.trim().length < 2)                    errs.name    = 'Nome deve ter ao menos 2 caracteres'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido'
    if (!hasLength)                                          errs.password = 'Mínimo 8 caracteres'
    else if (!hasNumber)                                     errs.password = 'Inclua ao menos 1 número'
    else if (!hasUpper)                                      errs.password = 'Inclua ao menos 1 maiúscula'
    if (password !== confirmPassword)                        errs.confirm = 'Senhas não coincidem'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setLoading(true)
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
      // Never expose raw Supabase error messages — they reveal account existence
      // ("User already registered", "Email rate limit exceeded", etc.)
      toast.error('Erro ao criar conta', {
        description: 'Verifique os dados e tente novamente. Se o problema persistir, entre em contato com o suporte.',
      })
      return
    }

    // Email confirmation required (Supabase project setting)
    if (data.user && !data.session) {
      identifyUser(data.user.id, { name, email })
      trackEvent(EVENTS.USER_SIGNUP, { method: 'email', confirmed: false })
      router.push(`/cadastro/confirmar?email=${encodeURIComponent(email)}`)
      return
    }

    // Auto-confirmed (email confirmation disabled in Supabase)
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, email })
      identifyUser(data.user.id, { name, email })
      trackEvent(EVENTS.USER_SIGNUP, { method: 'email' })
    }
    toast.success('Conta criada!', { description: 'Bem-vindo ao SAOOZ.' })
    router.refresh()
    router.push('/onboarding/plano')
  }

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#B3B3B3] transition-colors">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Crie sua conta</h1>
        <p className="mt-1.5 text-sm text-[#6B6B6B]">
          Comece a entender suas finanças em minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="name" label="Nome completo" placeholder="Seu nome completo"
          value={name} onChange={setName} error={errors.name} />

        <Field id="email" label="E-mail" type="email" placeholder="seu@email.com"
          value={email} onChange={setEmail} error={errors.email} />

        <Field id="password" label="Senha" type={showPass ? 'text' : 'password'} placeholder="••••••••"
          value={password} onChange={setPassword} error={errors.password}>
          <EyeBtn show={showPass} toggle={() => setShowPass(!showPass)} />
        </Field>

        {/* Password requirements */}
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

        <button
          type="submit" disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 20px #3b82f640' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6B6B]">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#60a5fa] hover:text-white font-semibold transition-colors">
          Entrar agora
        </Link>
      </p>
    </div>
  )
}
