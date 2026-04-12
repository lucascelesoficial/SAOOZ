'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  BusinessActivity,
  BusinessTaxRegime,
  Database,
} from '@/types/database.types'

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']

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
      setCnpj(business.cnpj ?? '')
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
        cnpj: cnpj.trim() || null,
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

    toast.success(isEditing ? 'Empresa atualizada' : 'Empresa cadastrada', {
      description: 'A empresa ativa foi atualizada no seu painel.',
    })

    router.refresh()
    window.location.href = '/empresa'
  }

  return (
    <div className="panel-card rounded-2xl p-8">
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

        <FieldWrap label="CNPJ (opcional)">
          <input
            type="text"
            placeholder="00.000.000/0001-00"
            value={cnpj}
            onChange={(event) => setCnpj(event.target.value)}
            className="h-11 w-full rounded-[10px] px-4 text-sm placeholder:text-app-soft"
            style={INPUT_STYLE}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
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
