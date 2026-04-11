'use client'

import { useState } from 'react'
import { User, Briefcase, Layers, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UserMode } from '@/types/database.types'

interface ModeOption {
  id: UserMode
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  glow: string
}

const OPTIONS: ModeOption[] = [
  {
    id: 'pf',
    icon: User,
    title: 'Pessoa Física',
    subtitle: 'Controle de renda, gastos, metas e saúde financeira pessoal.',
    color: '#3b82f6',
    glow: '#3b82f640',
  },
  {
    id: 'pj',
    icon: Briefcase,
    title: 'Pessoa Jurídica',
    subtitle: 'Faturamento, despesas, impostos, lucro e pró-labore da empresa.',
    color: '#0ea5e9',
    glow: '#0ea5e940',
  },
  {
    id: 'both',
    icon: Layers,
    title: 'Ambos',
    subtitle: 'Gerencie suas finanças pessoais e empresariais no mesmo lugar.',
    color: '#22c55e',
    glow: '#22c55e40',
  },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<UserMode | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error } = await supabase
      .from('profiles')
      .update({ mode: selected })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar preferência')
      setLoading(false)
      return
    }

    // Hard navigation bypasses Next.js Router Cache entirely
    // so (dashboard)/layout.tsx always reads fresh DB data
    if (selected === 'pj' || selected === 'both') {
      window.location.href = '/onboarding/empresa'
    } else {
      window.location.href = '/central'
    }
  }

  return (
    <div className="panel-card rounded-2xl p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-app">
          Como você vai usar o SAOOZ?
        </h1>
        <p className="text-sm text-app-soft">
          Isso personaliza toda a sua experiência. Você pode mudar depois nas configurações.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className="w-full text-left rounded-[14px] p-4 transition-all duration-200 flex items-center gap-4"
              style={{
                background: isSelected ? `${opt.color}12` : 'var(--panel-bg-soft)',
                border: isSelected ? `1.5px solid ${opt.color}` : '1.5px solid var(--panel-border)',
                boxShadow: isSelected ? `0 0 20px ${opt.glow}` : 'none',
              }}
            >
              {/* Icon bubble */}
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: isSelected ? `${opt.color}20` : 'var(--panel-border)',
                  border: `1px solid ${isSelected ? opt.color : 'var(--panel-border-strong)'}`,
                }}>
                <Icon className="h-5 w-5" style={{ color: isSelected ? opt.color : 'var(--text-soft)' }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-app text-sm">{opt.title}</p>
                <p className="text-xs text-app-soft mt-0.5 leading-relaxed">{opt.subtitle}</p>
              </div>

              {/* Check */}
              <div className="h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: isSelected ? opt.color : 'var(--panel-border-strong)',
                  background: isSelected ? opt.color : 'transparent',
                }}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full h-12 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: selected ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' : 'var(--panel-border)',
          boxShadow: selected ? '0 4px 20px color-mix(in oklab, var(--accent-blue) 25%, transparent)' : 'none',
        }}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <>Continuar <ChevronRight className="h-4 w-4" /></>
        }
      </button>
    </div>
  )
}
