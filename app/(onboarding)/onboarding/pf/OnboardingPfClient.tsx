'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

function maskCPF(v: string) {
  return v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}
function validateCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  return rest === parseInt(cpf[10])
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}
function validatePhone(raw: string): boolean {
  const d = raw.replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

interface Props {
  initialName: string
  initialCpf: string
  initialPhone: string
  initialCity: string
  initialState: string
  initialBirthDate?: string
}

export function OnboardingPfClient({
  initialName,
  initialCpf,
  initialPhone,
  initialCity,
  initialState,
  initialBirthDate = '',
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const [name,       setName]       = useState(initialName)
  const [cpf,        setCpf]        = useState(initialCpf ? maskCPF(initialCpf) : '')
  const [phone,      setPhone]      = useState(initialPhone ? maskPhone(initialPhone) : '')
  const [birthDate,  setBirthDate]  = useState(initialBirthDate ? String(initialBirthDate).slice(0, 10) : '')
  const [city,       setCity]       = useState(initialCity)
  const [state,      setState]      = useState(initialState)

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2)
      e.name = 'Nome deve ter ao menos 2 caracteres'
    if (!cpf || !validateCPF(cpf))
      e.cpf = 'CPF obrigatório e deve ser válido'
    if (!birthDate)
      e.birthDate = 'Data de nascimento é obrigatória'
    if (!phone || !validatePhone(phone))
      e.phone = 'Celular obrigatório — informe DDD + número'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const basePayload = {
      name:       name.trim(),
      cpf:        cpf.replace(/\D/g, ''),
      phone:      phone.replace(/\D/g, ''),
      birth_date: birthDate,
      city:       city.trim() || null,
      state:      state || null,
    }

    // Try to set onboarding_completed_at (requires migration 023).
    // If the column doesn't exist yet, fall back to saving without it.
    const completedAt = new Date().toISOString()
    let { error } = await supabase
      .from('profiles')
      .update({ ...basePayload, onboarding_completed_at: completedAt })
      .eq('id', user.id)

    if (error && /onboarding_completed_at|column/i.test(error.message)) {
      const fallback = await supabase
        .from('profiles')
        .update(basePayload)
        .eq('id', user.id)
      error = fallback.error
    }

    if (error) {
      toast.error('Erro ao salvar perfil. Tente novamente.')
      setLoading(false)
      return
    }

    // Hard navigation clears Next.js Router Cache so layout reads fresh data
    window.location.href = '/central'
  }

  async function handleSkip() {
    setSkipping(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    await supabase
      .from('profiles')
      .update({ mode: 'pf' })
      .eq('id', user.id)

    window.location.href = '/central?cadastro=pendente'
  }

  const inp = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text-strong)',
    background: 'var(--panel-bg-soft)',
    border: `1px solid ${hasError ? '#f87171' : 'var(--panel-border)'}`,
    outline: 'none',
    boxSizing: 'border-box',
  })

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError?: boolean) => {
    if (!hasError) e.currentTarget.style.border = '1px solid #3b82f6'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError?: boolean) => {
    if (!hasError) e.currentTarget.style.border = '1px solid var(--panel-border)'
  }

  return (
    <div className="panel-card rounded-2xl p-8 space-y-7">
      {/* Header */}
      <div className="space-y-1.5">
        <div
          className="h-12 w-12 rounded-[14px] flex items-center justify-center mb-4"
          style={{ background: 'color-mix(in oklab, #3b82f6 15%, transparent)', border: '1px solid color-mix(in oklab, #3b82f6 30%, transparent)' }}
        >
          <User className="h-6 w-6" style={{ color: '#3b82f6' }} />
        </div>
        <h1 className="text-2xl font-extrabold text-app">Perfil Pessoal</h1>
        <p className="text-sm text-app-soft">
          Complete seu cadastro PF para personalizar sua experiência financeira.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
            Nome completo <span className="text-[#f87171]">*</span>
          </label>
          <input
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inp(!!errors.name)}
            onFocus={(e) => focus(e, !!errors.name)}
            onBlur={(e) => blur(e, !!errors.name)}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* CPF + Data de nascimento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
              CPF <span className="text-[#f87171]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              style={inp(!!errors.cpf)}
              onFocus={(e) => focus(e, !!errors.cpf)}
              onBlur={(e) => blur(e, !!errors.cpf)}
            />
            {errors.cpf
              ? <p className="text-xs text-red-400">{errors.cpf}</p>
              : cpf && validateCPF(cpf) && <p className="text-xs text-[#22c55e]">CPF válido ✓</p>
            }
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
              Data de nascimento <span className="text-[#f87171]">*</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={inp(!!errors.birthDate)}
              onFocus={(e) => focus(e, !!errors.birthDate)}
              onBlur={(e) => blur(e, !!errors.birthDate)}
            />
            {errors.birthDate && <p className="text-xs text-red-400">{errors.birthDate}</p>}
          </div>
        </div>

        {/* Celular */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
            Celular <span className="text-[#f87171]">*</span>
          </label>
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            style={inp(!!errors.phone)}
            onFocus={(e) => focus(e, !!errors.phone)}
            onBlur={(e) => blur(e, !!errors.phone)}
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
        </div>

        {/* Cidade + Estado (opcionais) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
              Cidade <span className="normal-case font-normal opacity-50">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Sua cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inp()}
              onFocus={(e) => focus(e)}
              onBlur={(e) => blur(e)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-app-soft">
              Estado <span className="normal-case font-normal opacity-50">(opcional)</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{ ...inp(), cursor: 'pointer' }}
              onFocus={(e) => focus(e)}
              onBlur={(e) => blur(e)}
            >
              <option value="">Selecione</option>
              {BR_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Aviso campos obrigatórios */}
        <p className="text-[11px] text-app-soft">
          Campos marcados com <span className="text-[#f87171]">*</span> são obrigatórios.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 h-11 px-4 rounded-[10px] text-sm font-medium text-app-soft transition-colors hover:text-app"
            style={{ border: '1px solid var(--panel-border)', background: 'transparent' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            type="submit"
            disabled={loading || skipping}
            className="flex-1 h-11 rounded-[10px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
              boxShadow: '0 4px 20px color-mix(in oklab, #3b82f6 30%, transparent)',
            }}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <>Finalizar cadastro <ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading || skipping}
          className="w-full text-center text-xs text-app-soft hover:text-app transition-colors pt-1 disabled:opacity-50"
        >
          {skipping ? 'Redirecionando…' : 'Pular por agora · finalizo depois'}
        </button>
      </form>
    </div>
  )
}
