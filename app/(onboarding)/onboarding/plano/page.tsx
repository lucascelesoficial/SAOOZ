'use client'

import { useState } from 'react'
import {
  Loader2, Check, X, Zap, Shield, Building2,
  TrendingUp, Bot, BarChart3, Receipt, PiggyBank,
  LineChart, Briefcase, Sparkles, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PLAN_CATALOG,
  TRIAL_DAYS,
  DURATION_DISCOUNTS,
  getPlanPriceForDuration,
} from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FeatureStatus = true | false | string

interface FeatureGroup {
  icon: React.ElementType
  label: string
  features: { name: string; pf: FeatureStatus; pj: FeatureStatus; pro: FeatureStatus }[]
}

// ── Dados dos planos ──────────────────────────────────────────────────────────

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    icon: TrendingUp,
    label: 'Finanças Pessoais',
    features: [
      { name: 'Dashboard financeiro pessoal',             pf: true,        pj: false,       pro: true        },
      { name: 'Lançamento de rendas e despesas',          pf: true,        pj: false,       pro: true        },
      { name: 'Categorização automática',                 pf: true,        pj: false,       pro: true        },
      { name: 'Relatórios e exportação PDF',              pf: true,        pj: false,       pro: true        },
      { name: 'Histórico financeiro completo',            pf: true,        pj: false,       pro: true        },
    ],
  },
  {
    icon: Shield,
    label: 'Reserva de Emergência',
    features: [
      { name: 'Múltiplas reservas por objetivo',         pf: true,        pj: true,        pro: true        },
      { name: 'Simulação de cobertura em meses',         pf: true,        pj: true,        pro: true        },
      { name: 'Reserva operacional empresarial',         pf: false,       pj: true,        pro: true        },
    ],
  },
  {
    icon: LineChart,
    label: 'Investimentos',
    features: [
      { name: 'Carteira pessoal (ações, FIIs, cripto…)', pf: true,        pj: false,       pro: true        },
      { name: 'Preço médio e rentabilidade',             pf: true,        pj: false,       pro: true        },
      { name: 'Carteira empresarial',                    pf: false,       pj: true,        pro: true        },
      { name: 'Análise de alocação por ativo',           pf: true,        pj: true,        pro: true        },
    ],
  },
  {
    icon: Building2,
    label: 'Gestão Empresarial',
    features: [
      { name: 'Dashboard empresarial',                   pf: false,       pj: true,        pro: true        },
      { name: 'Faturamento e receitas',                  pf: false,       pj: true,        pro: true        },
      { name: 'Despesas operacionais',                   pf: false,       pj: true,        pro: true        },
      { name: 'Número de empresas',                      pf: false,       pj: 'até 3',     pro: 'até 5'     },
      { name: 'Visão cruzada PF × PJ',                  pf: false,       pj: false,       pro: true        },
    ],
  },
  {
    icon: Receipt,
    label: 'Fiscal & Tributário',
    features: [
      { name: 'Estimativa de impostos (MEI/Simples)',    pf: false,       pj: true,        pro: true        },
      { name: 'Controle de pró-labore',                  pf: false,       pj: true,        pro: true        },
      { name: 'Distribuição de lucros',                  pf: false,       pj: true,        pro: true        },
    ],
  },
  {
    icon: Bot,
    label: 'Assistente por IA',
    features: [
      { name: 'Chat financeiro inteligente',             pf: '60/mês',    pj: '60/mês',   pro: 'Ilimitado' },
      { name: 'Análise de saúde financeira',             pf: true,        pj: true,        pro: true        },
      { name: 'Insights preditivos',                     pf: false,       pj: false,       pro: true        },
      { name: 'Recomendações personalizadas avançadas',  pf: false,       pj: false,       pro: true        },
    ],
  },
  {
    icon: BarChart3,
    label: 'Inteligência & Relatórios',
    features: [
      { name: 'Painel de inteligência financeira',       pf: 'Básico',    pj: 'Básico',   pro: 'Avançado'  },
      { name: 'Comparativo entre períodos',              pf: true,        pj: true,        pro: true        },
      { name: 'Análise de tendências e padrões',         pf: false,       pj: false,       pro: true        },
      { name: 'Alertas inteligentes automáticos',        pf: false,       pj: false,       pro: true        },
    ],
  },
  {
    icon: Sparkles,
    label: 'Suporte & Acesso',
    features: [
      { name: 'Suporte via chat',                        pf: true,        pj: true,        pro: true        },
      { name: 'Suporte prioritário',                     pf: false,       pj: false,       pro: true        },
      { name: 'Acesso antecipado a novidades',           pf: false,       pj: false,       pro: true        },
    ],
  },
]

const PLANS = [
  {
    code: 'pf'  as const,
    icon: PiggyBank,
    label: 'Pessoa Física',
    tag: 'PF',
    subtitle: 'Finanças pessoais com IA assistida',
    color: '#3b82f6',
    accent: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
    highlight: false,
    badge: null as string | null,
  },
  {
    code: 'pro' as const,
    icon: Layers,
    label: 'PRO',
    tag: 'PRO',
    subtitle: 'Pessoal + empresarial sem limites',
    color: '#a855f7',
    accent: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.45)',
    highlight: true,
    badge: 'Mais popular' as string | null,
  },
  {
    code: 'pj'  as const,
    icon: Briefcase,
    label: 'Pessoa Jurídica',
    tag: 'PJ',
    subtitle: 'Controle empresarial completo',
    color: '#06b6d4',
    accent: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.25)',
    highlight: false,
    badge: null as string | null,
  },
]

const DURATION_OPTIONS: { value: BillingDuration; label: string; shortLabel: string }[] = [
  { value: 1,  label: 'Mensal',     shortLabel: 'Mês'  },
  { value: 3,  label: 'Trimestral', shortLabel: '3M'   },
  { value: 6,  label: 'Semestral',  shortLabel: '6M'   },
  { value: 12, label: 'Anual',      shortLabel: 'Ano'  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function Cell({ value, color }: { value: FeatureStatus; color: string }) {
  if (value === false) return <X className="h-[15px] w-[15px] mx-auto opacity-25 text-white" />
  if (value === true)  return <Check className="h-[15px] w-[15px] mx-auto" style={{ color }} />
  return <span className="text-[11px] font-bold" style={{ color }}>{value}</span>
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function OnboardingPlanoPage() {
  const [duration, setDuration]   = useState<BillingDuration>(1)
  const [loading, setLoading]     = useState<string | null>(null)

  const discount = DURATION_DISCOUNTS[duration]

  async function handleSelect(planCode: 'pf' | 'pj' | 'pro') {
    setLoading(planCode)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planCode, duration, paymentMethod: 'card', trialDays: TRIAL_DAYS }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error ?? 'Falha ao iniciar checkout.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      toast.error('Erro ao iniciar plano', { description: err instanceof Error ? err.message : 'Tente novamente.' })
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#080a12', zIndex: 100 }}
    >
      {/* Purple glow top */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-[0.18]"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #9333ea 0%, transparent 65%)' }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 pt-12 pb-24">

        {/* ── Logo ── */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">SAOOZ</span>
          </div>
        </div>

        {/* ── Headline ── */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7] animate-pulse inline-block" />
            {TRIAL_DAYS} dias grátis — sem cobranças agora
          </div>
          <h1 className="text-4xl sm:text-[52px] font-black text-white leading-[1.1] mb-4 tracking-tight">
            Controle total das suas finanças.<br />
            <span style={{
              backgroundImage: 'linear-gradient(90deg, #60a5fa, #a855f7 50%, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Do jeito que você merece.
            </span>
          </h1>
          <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: '#6b7280' }}>
            Escolha o plano ideal para sua realidade. Comece grátis por {TRIAL_DAYS} dias,
            cancele a qualquer momento, sem burocracia.
          </p>
        </div>

        {/* ── Seletor de período ── */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex p-1 gap-1 rounded-[14px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {DURATION_OPTIONS.map((opt) => {
              const disc = DURATION_DISCOUNTS[opt.value]
              const active = duration === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className="relative px-5 py-2 rounded-[10px] text-sm font-semibold transition-all"
                  style={{
                    background: active ? 'rgba(168,85,247,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                    color: active ? '#e9d5ff' : '#6b7280',
                  }}
                >
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.shortLabel}</span>
                  {disc > 0 && (
                    <span
                      className="absolute -top-2.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
                    >
                      -{Math.round(disc * 100)}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Cards + Tabela lado a lado ── */}
        <div
          className="rounded-[24px] overflow-hidden mb-10"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
        >
          {/* Header dos planos */}
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr]">
            <div className="px-6 py-6 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#4b5563' }}>Funcionalidade</p>
              <p className="text-[11px]" style={{ color: '#374151' }}>Compare os planos e escolha o seu</p>
            </div>

            {PLANS.map((plan) => {
              const catalog  = PLAN_CATALOG[plan.code]
              const pricing  = getPlanPriceForDuration(plan.code, duration)
              const Icon     = plan.icon
              const isLoading = loading === plan.code

              return (
                <div
                  key={plan.code}
                  className="px-5 py-5 border-b border-r last:border-r-0 flex flex-col relative"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: plan.highlight ? 'rgba(168,85,247,0.06)' : 'transparent',
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: '#fff' }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Top accent */}
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }} />
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="h-8 w-8 rounded-[9px] flex items-center justify-center shrink-0"
                      style={{ background: plan.accent, border: `1px solid ${plan.border}` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white leading-none">{plan.label}</p>
                      <p className="text-[10px] mt-0.5 leading-tight hidden lg:block" style={{ color: '#6b7280' }}>
                        {plan.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="mb-3">
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black text-white tabular-nums">
                        R${pricing.effectiveMonthly.toFixed(0)}
                      </span>
                      <span className="text-xs pb-0.5" style={{ color: '#6b7280' }}>/mês</span>
                    </div>
                    {discount > 0 ? (
                      <p className="text-[10px] mt-0.5" style={{ color: '#22c55e' }}>
                        Economize R${((catalog.priceMonthly - pricing.effectiveMonthly) * duration).toFixed(0)} em {duration}m
                      </p>
                    ) : (
                      <p className="text-[10px] mt-0.5" style={{ color: '#374151' }}>Cobrado mensalmente</p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelect(plan.code)}
                    disabled={!!loading}
                    className="w-full py-2.5 rounded-[10px] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                    style={{
                      background: plan.highlight
                        ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                        : `${plan.color}cc`,
                      boxShadow: plan.highlight ? '0 4px 20px rgba(168,85,247,0.3)' : `0 4px 12px ${plan.color}25`,
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      `Testar ${TRIAL_DAYS} dias grátis`
                    )}
                  </button>
                  <p className="text-[9px] text-center mt-1.5" style={{ color: '#374151' }}>
                    Sem cobrança por {TRIAL_DAYS} dias
                  </p>
                </div>
              )
            })}
          </div>

          {/* ── Tabela de features inline ── */}
          {FEATURE_GROUPS.map((group, gi) => (
            <div key={group.label}>
              {/* Group header */}
              <div
                className="grid grid-cols-[1.8fr_1fr_1fr_1fr] border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="px-6 py-2.5 flex items-center gap-2 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <group.icon className="h-3.5 w-3.5 shrink-0" style={{ color: '#6b7280' }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                    {group.label}
                  </span>
                </div>
                {PLANS.map((p) => (
                  <div key={p.code} className="border-r last:border-r-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>

              {/* Feature rows */}
              {group.features.map((feat, fi) => (
                <div
                  key={feat.name}
                  className="grid grid-cols-[1.8fr_1fr_1fr_1fr] border-t"
                  style={{
                    borderColor: 'rgba(255,255,255,0.04)',
                    background: fi % 2 === 1 ? 'rgba(255,255,255,0.008)' : 'transparent',
                  }}
                >
                  <div className="px-6 py-3 border-r flex items-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[13px]" style={{ color: '#9ca3af' }}>{feat.name}</span>
                  </div>
                  {[
                    { code: 'pf',  val: feat.pf,  color: PLANS[0].color },
                    { code: 'pro', val: feat.pro, color: PLANS[1].color },
                    { code: 'pj',  val: feat.pj,  color: PLANS[2].color },
                  ].map(({ code, val, color }) => (
                    <div
                      key={code}
                      className="border-r last:border-r-0 flex items-center justify-center py-3"
                      style={{
                        borderColor: 'rgba(255,255,255,0.04)',
                        background: code === 'pro' ? 'rgba(168,85,247,0.04)' : 'transparent',
                      }}
                    >
                      <Cell value={val} color={color} />
                    </div>
                  ))}
                </div>
              ))}

              {/* Spacer between last group and bottom */}
              {gi === FEATURE_GROUPS.length - 1 && (
                <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr] border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="px-6 py-5 border-r" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                  {PLANS.map((plan) => {
                    const isLoading = loading === plan.code
                    return (
                      <div
                        key={plan.code}
                        className="px-4 py-5 border-r last:border-r-0 flex items-center justify-center"
                        style={{
                          borderColor: 'rgba(255,255,255,0.04)',
                          background: plan.highlight ? 'rgba(168,85,247,0.04)' : 'transparent',
                        }}
                      >
                        <button
                          onClick={() => handleSelect(plan.code)}
                          disabled={!!loading}
                          className="w-full py-2.5 rounded-[10px] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                          style={{
                            background: plan.highlight
                              ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                              : `${plan.color}cc`,
                          }}
                        >
                          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Testar ${TRIAL_DAYS} dias`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Trust bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🔒', title: 'Dados protegidos', sub: 'Criptografia de ponta a ponta' },
            { icon: '⚡', title: 'Ativação imediata', sub: 'Acesso em segundos' },
            { icon: '↩️', title: 'Cancele quando quiser', sub: 'Sem fidelidade nem taxa' },
            { icon: '💳', title: 'Pagamento seguro', sub: 'Stripe PCI-DSS certificado' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-[14px] px-4 py-3.5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white">{item.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {[
            {
              q: 'O cartão é cobrado agora?',
              a: `Não. Você usa tudo por ${TRIAL_DAYS} dias sem pagar nada. A cobrança só ocorre após o período de teste, se você decidir continuar.`,
            },
            {
              q: 'Posso mudar de plano depois?',
              a: 'Sim. Upgrade ou downgrade podem ser feitos a qualquer momento diretamente pelas configurações da sua conta.',
            },
            {
              q: 'O que acontece com meus dados ao cancelar?',
              a: 'Seus dados são armazenados por 90 dias após o cancelamento. Você pode reativar e recuperar tudo dentro desse período.',
            },
            {
              q: 'Funciona no celular?',
              a: 'Sim. O SAOOZ é 100% responsivo e funciona perfeitamente no navegador do celular.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-[14px] px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-sm font-semibold text-white mb-1.5">{item.q}</p>
              <p className="text-[13px] leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-[11px]" style={{ color: '#374151' }}>
          Nenhuma cobrança durante os {TRIAL_DAYS} dias de teste · Cancele a qualquer momento
        </p>

      </div>
    </div>
  )
}
