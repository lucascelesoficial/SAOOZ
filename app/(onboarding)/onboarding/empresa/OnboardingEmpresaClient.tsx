'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, ChevronRight, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  BusinessActivity,
  BusinessTaxRegime,
  Database,
} from '@/types/database.types'

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function maskCNPJ(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2').slice(0, 18)
}
function validateCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, '')
  if (cnpj.length !== 14 || /^(.)\1+$/.test(cnpj)) return false
  const calc = (s: string, len: number) => {
    let sum = 0; let pos = len - 7
    for (let i = len; i >= 1; i--) { sum += parseInt(s[len - i]) * pos--; if (pos < 2) pos = 9 }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return calc(cnpj, 12) === parseInt(cnpj[12]) && calc(cnpj, 13) === parseInt(cnpj[13])
}
function maskCPF(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)
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

const TAX_REGIMES: Array<{ id: BusinessTaxRegime; label: string; desc: string; porte: string; tooltip: string }> = [
  { id: 'mei', label: 'MEI', desc: 'Até R$ 81k/ano', porte: 'Porte: MEI', tooltip: 'Microempreendedor Individual. Tributação fixa mensal via DAS.' },
  { id: 'simples', label: 'Simples Nacional', desc: 'Até R$ 4,8M/ano', porte: 'Porte: ME ou EPP', tooltip: 'Regime unificado com alíquota progressiva. O mais usado por PMEs.' },
  { id: 'presumido', label: 'Lucro Presumido', desc: 'Margem presumida', porte: 'Médio/Grande porte', tooltip: 'IRPJ e CSLL sobre percentual fixo da receita bruta.' },
  { id: 'real', label: 'Lucro Real', desc: 'Lucro contábil apurado', porte: 'Grande porte', tooltip: 'Tributação sobre o lucro real. Ideal para margens baixas.' },
]

const ACTIVITIES: Array<{ id: BusinessActivity; label: string }> = [
  { id: 'servico', label: 'Servico' },
  { id: 'comercio', label: 'Comercio' },
  { id: 'industria', label: 'Industria' },
  { id: 'misto', label: 'Misto' },
]

function FieldWrap({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-app-base">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-[#f87171]">{error}</p>}
    </div>
  )
}

const INPUT_STYLE = {
  background: 'var(--panel-bg-soft)',
  border: '1.5px solid var(--panel-border)',
  outline: 'none',
  transition: 'border 0.15s, box-shadow 0.15s',
  color: 'var(--text-strong)',
} as const

interface OnboardingEmpresaClientProps {
  businessId: string | null
}

export function OnboardingEmpresaClient({
  businessId,
}: OnboardingEmpresaClientProps) {
  const router = useRouter()
  const isEditing = Boolean(businessId)

  const [loading, setLoading] = useState(false)
  const [loadingBusiness, setLoadingBusiness] = useState(Boolean(businessId))
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [regime, setRegime] = useState<BusinessTaxRegime>('simples')
  const [activity, setActivity] = useState<BusinessActivity>('servico')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sócio responsável
  const [socioCpf, setSocioCpf] = useState('')
  const [socioPhone, setSocioPhone] = useState('')
  const [socioBirthDate, setSocioBirthDate] = useState('')
  const [socioCity, setSocioCity] = useState('')
  const [socioBrazilState, setSocioBrazilState] = useState('')

  // Always load the user's existing profile data (pre-fill socio fields)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('cpf,phone,birth_date,city,state')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        if (profile.cpf) setSocioCpf(maskCPF(profile.cpf))
        if (profile.phone) setSocioPhone(maskPhone(profile.phone))
        if (profile.birth_date) setSocioBirthDate(String(profile.birth_date).slice(0, 10))
        if (profile.city) setSocioCity(profile.city)
        if (profile.state) setSocioBrazilState(profile.state)
      }
    })
  }, [])

  useEffect(() => {
    let active = true

    async function loadBusiness() {
      if (!businessId) {
        setLoadingBusiness(false)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) {
        return
      }

      if (error || !data) {
        toast.error('Não foi possível carregar a empresa selecionada.')
        setLoadingBusiness(false)
        return
      }

      const business = data as BusinessProfile
      setName(business.name)
      setCnpj(business.cnpj ? maskCNPJ(business.cnpj) : '')
      setRegime(business.tax_regime)
      setActivity(business.activity)
      setLoadingBusiness(false)
    }

    void loadBusiness()

    return () => {
      active = false
    }
  }, [businessId])

  function focusStyle(event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    event.currentTarget.style.border = '1.5px solid var(--accent-blue)'
    event.currentTarget.style.boxShadow =
      '0 0 0 3px color-mix(in oklab, var(--accent-blue) 12%, transparent)'
  }

  function blurStyle(event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    event.currentTarget.style.border = '1.5px solid var(--panel-border)'
    event.currentTarget.style.boxShadow = 'none'
  }

  const submitLabel = useMemo(() => {
    if (loadingBusiness) {
      return 'Carregando empresa'
    }

    return isEditing ? 'Salvar empresa' : 'Criar empresa'
  }, [isEditing, loadingBusiness])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}
    if (!name || name.trim().length < 2) {
      nextErrors.name = 'Nome deve ter ao menos 2 caracteres.'
    }
    if (!cnpj || !validateCNPJ(cnpj)) {
      nextErrors.cnpj = 'CNPJ obrigatório e deve ser válido.'
    }
    if (!socioCpf || !validateCPF(socioCpf)) {
      nextErrors.socioCpf = 'CPF do sócio responsável é obrigatório e deve ser válido.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const response = await fetch('/api/businesses/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: businessId ?? undefined,
        name: name.trim(),
        cnpj: cnpj.replace(/\D/g, '') || null,
        taxRegime: regime,
        activity,
      }),
    })

    const result = (await response.json().catch(() => null)) as
      | {
          error?: string
          businessId?: string
          upgradeRequired?: boolean
          upgradeHref?: string
        }
      | null

    if (!response.ok) {
      if (result?.upgradeRequired && result.upgradeHref) {
        window.location.href = result.upgradeHref
        return
      }

      toast.error(isEditing ? 'Erro ao atualizar empresa' : 'Erro ao cadastrar empresa', {
        description: result?.error ?? 'Falha inesperada ao salvar empresa.',
      })
      setLoading(false)
      return
    }

    if (!result?.businessId) {
      toast.error('Erro ao confirmar empresa salva.')
      setLoading(false)
      return
    }

    // Save responsible partner data to the user's profile
    await supabase.from('profiles').update({
      cpf: socioCpf.replace(/\D/g, '') || null,
      phone: socioPhone.replace(/\D/g, '') || null,
      birth_date: socioBirthDate || null,
      city: socioCity.trim() || null,
      state: socioBrazilState || null,
    }).eq('id', user.id)

    toast.success(isEditing ? 'Empresa atualizada' : 'Empresa cadastrada', {
      description: 'A empresa ativa foi atualizada no seu painel.',
    })

    router.refresh()
    window.location.href = '/empresa'
  }

  return (
    <div className="panel-card rounded-2xl p-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-xs font-medium text-app-soft transition-colors hover:text-app"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </button>

      <div className="mb-7 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: '#0ea5e915', border: '1px solid #0ea5e930' }}
        >
          <Building2 className="h-5 w-5 text-[#0ea5e9]" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-app">
            {isEditing ? 'Editar empresa' : 'Nova empresa'}
          </h1>
          <p className="text-xs text-app-soft">
            Cadastre ou atualize sua empresa sem perder o acesso ao módulo pessoal.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldWrap label="Nome da empresa" error={errors.name}>
          <input
            type="text"
            placeholder="Ex: Studio Criativo LTDA"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft"
            style={INPUT_STYLE}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </FieldWrap>

        <FieldWrap label="CNPJ *" error={errors.cnpj}>
          <input
            type="text"
            placeholder="00.000.000/0001-00"
            value={cnpj}
            onChange={(event) => setCnpj(maskCNPJ(event.target.value))}
            className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
            style={cnpj && !validateCNPJ(cnpj) ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          {cnpj && validateCNPJ(cnpj) && (
            <p className="text-xs text-[#22c55e] mt-1">CNPJ válido</p>
          )}
        </FieldWrap>

        <FieldWrap label="Regime tributário">
          <div className="grid grid-cols-2 gap-2">
            {TAX_REGIMES.map((taxRegime) => (
              <button
                key={taxRegime.id}
                type="button"
                title={taxRegime.tooltip}
                onClick={() => setRegime(taxRegime.id)}
                className="rounded-[10px] p-3 text-left transition-all"
                style={{
                  background: regime === taxRegime.id ? '#0ea5e915' : 'var(--panel-bg-soft)',
                  border: regime === taxRegime.id ? '1.5px solid #0ea5e9' : '1.5px solid var(--panel-border)',
                  boxShadow: regime === taxRegime.id ? '0 0 12px #0ea5e930' : 'none',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: regime === taxRegime.id ? '#0ea5e9' : 'var(--text-base)' }}>
                  {taxRegime.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-app-soft">{taxRegime.desc}</p>
                <p className="mt-0.5 text-[10px] leading-tight" style={{ color: regime === taxRegime.id ? '#0ea5e960' : 'var(--text-soft)' }}>{taxRegime.porte}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-app-soft px-0.5">Passe o mouse sobre cada opção para mais detalhes</p>
        </FieldWrap>

        <FieldWrap label="Atividade principal">
          <div className="grid grid-cols-4 gap-2">
            {ACTIVITIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivity(item.id)}
                className="rounded-[10px] py-2.5 text-xs font-semibold transition-all"
                style={{
                  background:
                    activity === item.id
                      ? 'color-mix(in oklab, var(--accent-blue) 12%, transparent)'
                      : 'var(--panel-bg-soft)',
                  border:
                    activity === item.id
                      ? '1.5px solid var(--accent-blue)'
                      : '1.5px solid var(--panel-border)',
                  color: activity === item.id ? 'var(--accent-blue)' : 'var(--text-soft)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* Sócio responsável */}
        <div className="pt-2 space-y-4" style={{ borderTop: '1px solid var(--panel-border)' }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#8b5cf615', border: '1px solid #8b5cf630' }}>
              <User className="h-3.5 w-3.5 text-[#8b5cf6]" />
            </div>
            <span className="text-sm font-bold text-app">Sócio responsável</span>
          </div>

          <FieldWrap label="CPF do sócio *" error={errors.socioCpf}>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={socioCpf}
              onChange={(e) => setSocioCpf(maskCPF(e.target.value))}
              className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
              style={socioCpf && !validateCPF(socioCpf) ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
            {socioCpf && validateCPF(socioCpf) && (
              <p className="text-xs text-[#22c55e] mt-1">CPF válido</p>
            )}
          </FieldWrap>

          <FieldWrap label="Telefone">
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={socioPhone}
              onChange={(e) => setSocioPhone(maskPhone(e.target.value))}
              className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
              style={INPUT_STYLE}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </FieldWrap>

          <FieldWrap label="Data de nascimento">
            <input
              type="date"
              value={socioBirthDate}
              onChange={(e) => setSocioBirthDate(e.target.value)}
              className="h-11 w-full rounded-[10px] px-4 text-sm"
              style={INPUT_STYLE}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </FieldWrap>

          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Cidade">
              <input
                type="text"
                placeholder="São Paulo"
                value={socioCity}
                onChange={(e) => setSocioCity(e.target.value)}
                className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft"
                style={INPUT_STYLE}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </FieldWrap>
            <FieldWrap label="Estado (UF)">
              <select
                value={socioBrazilState}
                onChange={(e) => setSocioBrazilState(e.target.value)}
                className="h-11 w-full rounded-[10px] px-4 text-sm outline-none"
                style={INPUT_STYLE}
              >
                <option value="">--</option>
                {BR_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </FieldWrap>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || loadingBusiness}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            boxShadow: '0 4px 20px #0ea5e930',
          }}
        >
          {loading || loadingBusiness ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {submitLabel}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
