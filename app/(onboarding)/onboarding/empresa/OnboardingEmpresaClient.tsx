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
  const [skipping, setSkipping] = useState(false)
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
    if (!socioPhone || socioPhone.replace(/\D/g, '').length < 10) {
      nextErrors.socioPhone = 'Telefone do sócio é obrigatório — informe DDD + número.'
    }
    if (!socioBirthDate) {
      nextErrors.socioBirthDate = 'Data de nascimento do sócio é obrigatória.'
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
    // Also marks onboarding as complete — prevents dashboard bypass
    const profilePayload = {
      cpf: socioCpf.replace(/\D/g, '') || null,
      phone: socioPhone.replace(/\D/g, '') || null,
      birth_date: socioBirthDate || null,
      city: socioCity.trim() || null,
      state: socioBrazilState || null,
    }
    const completedAt = new Date().toISOString()
    const { error: profileErr } = await supabase.from('profiles').update({
      ...profilePayload,
      onboarding_completed_at: completedAt,
    }).eq('id', user.id)
    // If migration 023 not applied yet, fall back to saving without the column
    if (profileErr && /onboarding_completed_at|column/i.test(profileErr.message)) {
      await supabase.from('profiles').update(profilePayload).eq('id', user.id)
    }

    toast.success(isEditing ? 'Empresa atualizada' : 'Empresa cadastrada', {
      description: 'A empresa ativa foi atualizada no seu painel.',
    })

    router.refresh()
    window.location.href = '/empresa'
  }

  async function handleSkip() {
    if (isEditing) return // skip is only meaningful during initial onboarding

    setSkipping(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    // Mode must already be set by /onboarding router — don't overwrite it here.
    // We just skip cadastro completion; onboarding_completed_at stays NULL.
    // The dashboard banner + mutation gate will prompt the user later.
    window.location.href = '/central?cadastro=pendente'
  }

  return (
    <div className="panel-card rounded-2xl overflow-hidden">

      {/* ── Header banner ── */}
      <div className="px-8 pt-7 pb-6"
        style={{ background: 'linear-gradient(135deg, #0A1D13 0%, #163424 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>
              {isEditing ? 'Editar empresa' : 'Cadastrar empresa'}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Preencha os dados e ative o módulo empresarial completo.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--panel-border)' } as React.CSSProperties}>

          {/* ── Left: Dados da empresa ── */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-[6px] flex items-center justify-center" style={{ background: '#02664815', border: '1px solid #02664828' }}>
                <Building2 className="h-3.5 w-3.5" style={{ color: '#026648' }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#026648' }}>Dados da empresa</span>
            </div>

            <FieldWrap label="Nome da empresa" error={errors.name}>
              <input
                type="text"
                placeholder="Ex: Studio Criativo LTDA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft"
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
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                className="h-12 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
                style={cnpj && !validateCNPJ(cnpj) ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              {cnpj && validateCNPJ(cnpj) && (
                <p className="text-xs mt-1" style={{ color: '#026648' }}>CNPJ válido ✓</p>
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
                    className="rounded-[10px] p-3.5 text-left transition-all"
                    style={{
                      background: regime === taxRegime.id ? '#02664810' : 'var(--panel-bg-soft)',
                      border: regime === taxRegime.id ? '1.5px solid #026648' : '1.5px solid var(--panel-border)',
                      boxShadow: regime === taxRegime.id ? '0 0 14px #02664820' : 'none',
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: regime === taxRegime.id ? '#026648' : 'var(--text-base)' }}>
                      {taxRegime.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-app-soft">{taxRegime.desc}</p>
                    <p className="mt-0.5 text-[10px]" style={{ color: regime === taxRegime.id ? '#02664870' : 'var(--text-soft)' }}>{taxRegime.porte}</p>
                  </button>
                ))}
              </div>
            </FieldWrap>

            <FieldWrap label="Atividade principal">
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivity(item.id)}
                    className="rounded-[10px] py-3 text-sm font-semibold transition-all"
                    style={{
                      background: activity === item.id ? '#02664810' : 'var(--panel-bg-soft)',
                      border: activity === item.id ? '1.5px solid #026648' : '1.5px solid var(--panel-border)',
                      color: activity === item.id ? '#026648' : 'var(--text-soft)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </FieldWrap>
          </div>

          {/* ── Right: Sócio responsável ── */}
          <div className="p-8 space-y-6" style={{ borderTop: 'none' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-[6px] flex items-center justify-center" style={{ background: '#8b5cf615', border: '1px solid #8b5cf628' }}>
                <User className="h-3.5 w-3.5 text-[#8b5cf6]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">Sócio responsável</span>
            </div>

            <FieldWrap label="CPF *" error={errors.socioCpf}>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={socioCpf}
                onChange={(e) => setSocioCpf(maskCPF(e.target.value))}
                className="h-12 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
                style={socioCpf && !validateCPF(socioCpf) ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              {socioCpf && validateCPF(socioCpf) && (
                <p className="text-xs mt-1" style={{ color: '#026648' }}>CPF válido ✓</p>
              )}
            </FieldWrap>

            <FieldWrap label="Telefone *" error={errors.socioPhone}>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={socioPhone}
                onChange={(e) => setSocioPhone(maskPhone(e.target.value))}
                className="h-12 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft font-mono tracking-wide"
                style={errors.socioPhone ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </FieldWrap>

            <FieldWrap label="Data de nascimento *" error={errors.socioBirthDate}>
              <input
                type="date"
                value={socioBirthDate}
                onChange={(e) => setSocioBirthDate(e.target.value)}
                className="h-12 w-full rounded-[10px] px-4 text-sm"
                style={errors.socioBirthDate ? { ...INPUT_STYLE, border: '1.5px solid #f87171' } : INPUT_STYLE}
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
                  className="h-12 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft"
                  style={INPUT_STYLE}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </FieldWrap>
              <FieldWrap label="Estado (UF)">
                <select
                  value={socioBrazilState}
                  onChange={(e) => setSocioBrazilState(e.target.value)}
                  className="h-12 w-full rounded-[10px] px-4 text-sm outline-none"
                  style={INPUT_STYLE}
                >
                  <option value="">--</option>
                  {BR_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </FieldWrap>
            </div>

            <p className="text-[11px] text-app-soft">
              Campos com <span className="text-[#f87171]">*</span> são obrigatórios.
            </p>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="px-8 py-6 space-y-3" style={{ borderTop: '1px solid var(--panel-border)', background: 'var(--panel-bg-soft)' }}>
          <button
            type="submit"
            disabled={loading || loadingBusiness || skipping}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-[12px] text-base font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
            style={{
              height: 52,
              background: 'linear-gradient(135deg, #026648, #013d2c)',
              boxShadow: '0 4px 24px rgba(2,102,72,0.30)',
            }}
          >
            {loading || loadingBusiness ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {submitLabel}
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading || skipping}
              className="w-full text-center text-sm text-app-soft hover:text-app transition-colors disabled:opacity-50"
            >
              {skipping ? 'Redirecionando…' : 'Pular por agora · finalizo depois'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
