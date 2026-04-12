'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, FileText, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// ─── Validators ───────────────────────────────────────────────────────────────

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

function validateCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, '')
  if (cnpj.length !== 14 || /^(.)\1+$/.test(cnpj)) return false
  const calc = (cnpj: string, len: number) => {
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(cnpj[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return calc(cnpj, 12) === parseInt(cnpj[12]) && calc(cnpj, 13) === parseInt(cnpj[13])
}

function maskCPF(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)
}

function maskCNPJ(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2').slice(0, 18)
}

// ─── Client component ─────────────────────────────────────────────────────────

export function DocumentoClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'pf'
  const redirectTo = searchParams.get('redirect') ?? (plan === 'pj' ? '/empresa' : '/central')

  const isPJ = plan === 'pj'
  const label = isPJ ? 'CNPJ' : 'CPF'

  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [alreadyFilled, setAlreadyFilled] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('cpf')
        .eq('id', data.user.id)
        .single()

      if (isPJ) {
        const { data: biz } = await supabase
          .from('business_profiles')
          .select('cnpj')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (biz?.cnpj) setAlreadyFilled(true)
      } else {
        if (profile?.cpf) setAlreadyFilled(true)
      }
    })
  }, [isPJ])

  const isValid = isPJ ? validateCNPJ(value) : validateCPF(value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !isValid) return

    setSaving(true)
    const supabase = createClient()

    if (isPJ) {
      const { data: biz } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (biz) {
        const { error } = await supabase
          .from('business_profiles')
          .update({ cnpj: value.replace(/\D/g, '') })
          .eq('id', biz.id)
        if (error) { toast.error('Erro ao salvar CNPJ'); setSaving(false); return }
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({ cpf: value.replace(/\D/g, '') })
        .eq('id', userId)
      if (error) { toast.error('Erro ao salvar CPF'); setSaving(false); return }
    }

    toast.success(`${label} salvo com sucesso!`)
    router.push(redirectTo)
  }

  if (alreadyFilled) {
    router.push(redirectTo)
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-[16px] mb-4"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-app">Último passo!</h1>
          <p className="mt-2 text-sm text-app-soft">
            Informe seu {label} para ativar o acesso completo à plataforma.
          </p>
        </div>

        <div className="panel-card rounded-[16px] p-6 space-y-5" style={{ border: '1px solid var(--panel-border)' }}>
          <div className="flex items-center gap-3 p-3 rounded-[10px]" style={{ background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-blue) 20%, transparent)' }}>
            <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-xs text-app-soft">
              Seus dados são armazenados com criptografia e nunca compartilhados com terceiros.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-app-soft uppercase tracking-wider">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(isPJ ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
                placeholder={isPJ ? '00.000.000/0001-00' : '000.000.000-00'}
                className="theme-input w-full h-11 px-4 rounded-[10px] text-sm font-mono tracking-wide"
                style={value && !isValid ? { border: '1px solid #f87171' } : undefined}
                autoFocus
              />
              {value && !isValid && (
                <p className="text-xs text-[#f87171]">{label} inválido. Verifique os números.</p>
              )}
              {isValid && (
                <div className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {label} válido
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !isValid}
              className="w-full h-11 rounded-[10px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : `Salvar ${label} e continuar`}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
