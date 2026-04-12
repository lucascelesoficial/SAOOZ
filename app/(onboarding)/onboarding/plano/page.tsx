'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Check, X, Zap, Shield, Building2, Layers,
  TrendingUp, Bot, BarChart3, Receipt, PiggyBank,
  LineChart, Briefcase, Star, ArrowRight, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PLAN_CATALOG,
  TRIAL_DAYS,
  DURATION_DISCOUNTS,
  getPlanPriceForDuration,
} from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'

// ── Dados detalhados dos planos ───────────────────────────────────────────────

type FeatureStatus = true | false | string

interface FeatureGroup {
  icon: React.ElementType
  label: string
  features: { name: string; pf: FeatureStatus; pj: FeatureStatus; pro: FeatureStatus }[]
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    icon: TrendingUp,
    label: 'Finanças Pessoais',
    features: [
      { name: 'Dashboard financeiro centralizado',         pf: true,       pj: false,      pro: true  },
      { name: 'Lançamento de rendas e despesas',           pf: true,       pj: false,      pro: true  },
      { name: 'Categorização automática de gastos',        pf: true,       pj: false,      pro: true  },
      { name: 'Relatórios em PDF exportáveis',             pf: true,       pj: false,      pro: true  },
      { name: 'Histórico financeiro completo',             pf: true,       pj: false,      pro: true  },
    ],
  },
  {
    icon: Shield,
    label: 'Reserva & Proteção',
    features: [
      { name: 'Múltiplas reservas de emergência',          pf: true,       pj: true,       pro: true  },
      { name: 'Simulação de cobertura em meses',           pf: true,       pj: true,       pro: true  },
      { name: 'Alertas de meta atingida',                  pf: true,       pj: true,       pro: true  },
      { name: 'Reserva operacional empresarial',           pf: false,      pj: true,       pro: true  },
    ],
  },
  {
    icon: LineChart,
    label: 'Investimentos',
    features: [
      { name: 'Carteira de investimentos pessoal',         pf: true,       pj: false,      pro: true  },
      { name: 'Ações, FIIs, ETFs, Renda Fixa, Cripto',    pf: true,       pj: false,      pro: true  },
      { name: 'Acompanhamento de preço médio',             pf: true,       pj: false,      pro: true  },
      { name: 'Carteira de investimentos empresarial',     pf: false,      pj: true,       pro: true  },
      { name: 'Análise de alocação por tipo de ativo',     pf: true,       pj: true,       pro: true  },
    ],
  },
  {
    icon: Building2,
    label: 'Gestão Empresarial',
    features: [
      { name: 'Dashboard empresarial completo',            pf: false,      pj: true,       pro: true  },
      { name: 'Controle de faturamento e receitas',        pf: false,      pj: true,       pro: true  },
      { name: 'Despesas operacionais e categorias',        pf: false,      pj: true,       pro: true  },
      { name: 'Fluxo de caixa simplificado',               pf: false,      pj: true,       pro: true  },
      { name: 'Número de empresas cadastradas',            pf: false,      pj: '1–3',      pro: '1–5' },
    ],
  },
  {
    icon: Receipt,
    label: 'Fiscal & Tributário',
    features: [
      { name: 'Estimativa de impostos (MEI / Simples)',    pf: false,      pj: true,       pro: true  },
      { name: 'Controle de pró-labore',                    pf: false,      pj: true,       pro: true  },
      { name: 'Distribuição de lucros',                    pf: false,      pj: true,       pro: true  },
      { name: 'Visão cruzada empresa + vida pessoal',      pf: false,      pj: false,      pro: true  },
    ],
  },
  {
    icon: Bot,
    label: 'Assistente por IA',
    features: [
      { name: 'Chat financeiro inteligente',               pf: '60/mês',   pj: '60/mês',  pro: 'Ilimitado' },
      { name: 'Análise de saúde financeira mensal',        pf: true,       pj: true,       pro: true  },
      { name: 'Insights preditivos de fluxo de caixa',     pf: false,      pj: false,      pro: true  },
      { name: 'Recomendações personalizadas avançadas',    pf: false,      pj: false,      pro: true  },
    ],
  },
  {
    icon: BarChart3,
    label: 'Inteligência & Relatórios',
    features: [
      { name: 'Painel de inteligência financeira',         pf: 'Básico',   pj: 'Básico',  pro: 'Avançado' },
      { name: 'Comparativo entre períodos',                pf: true,       pj: true,       pro: true  },
      { name: 'Análise de tendências e padrões',           pf: false,      pj: false,      pro: true  },
      { name: 'Alertas inteligentes automáticos',          pf: false,      pj: false,      pro: true  },
    ],
  },
  {
    icon: Sparkles,
    label: 'Experiência & Suporte',
    features: [
      { name: 'Acesso a todas futuras funcionalidades',    pf: true,       pj: true,       pro: true  },
      { name: 'Suporte via chat',                          pf: true,       pj: true,       pro: true  },
      { name: 'Suporte prioritário',                       pf: false,      pj: false,      pro: true  },
      { name: 'Acesso antecipado a novidades',             pf: false,      pj: false,      pro: true  },
    ],
  },
]

const PLANS = [
  {
    code: 'pf' as const,
    icon: PiggyBank,
    label: 'Pessoa Física',
    subtitle: 'Para quem quer dominar as próprias finanças',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.3)',
    highlight: false,
    badge: null,
    highlights: [
      'Dashboard pessoal completo',
      'Reservas de emergência ilimitadas',
      'Carteira de investimentos',
      'IA financeira (60 ações/mês)',
    ],
  },
  {
    code: 'pro' as const,
    icon: Layers,
    label: 'PRO',
    subtitle: 'Para quem não separa o pessoal do empresarial',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.20)',
    border: 'rgba(168,85,247,0.5)',
    highlight: true,
    badge: 'Mais completo',
    highlights: [
      'Tudo do PF + tudo do PJ',
      'IA ilimitada sem restrições',
      'Inteligência avançada com predições',
      'Visão cruzada vida pessoal × empresa',
    ],
  },
  {
    code: 'pj' as const,
    icon: Briefcase,
    label: 'Pessoa Jurídica',
    subtitle: 'Para quem precisa de controle empresarial',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.3)',
    highlight: false,
    badge: null,
    highlights: [
      'Dashboard empresarial completo',
      'Impostos, pró-labore e lucros',
      'Múltiplas empresas',
      'Reserva e investimentos da empresa',
    ],
  },
]

const DURATION_OPTIONS: { value: BillingDuration; label: string; short: string }[] = [
  { value: 1,  label: 'Mensal',     short: 'Mês'  },
  { value: 3,  label: 'Trimestral', short: '3M'   },
  { value: 6,  label: 'Semestral',  short: '6M'   },
  { value: 12, label: 'Anual',      short: 'Ano'  },
]

// ── Utilitários ───────────────────────────────────────────────────────────────

function FeatureCell({ value, color }: { value: FeatureStatus; color: string }) {
  if (value === false) return <X className="h-4 w-4 mx-auto" style={{ color: '#3a3a3a' }} />
  if (value === true)  return <Check className="h-4 w-4 mx-auto" style={{ color }} />
  return <span className="text-[11px] font-semibold" style={{ color }}>{value}</span>
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function OnboardingPlanoPage() {
  const router = useRouter()
  const [duration, setDuration] = useState<BillingDuration>(1)
  const [loading, setLoading]   = useState<string | null>(null)
  const [showTable, setShowTable] = useState(false)

  const discount = DURATION_DISCOUNTS[duration]

  async function handleSelect(planCode: 'pf' | 'pj' | 'pro') {
    setLoading(planCode)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planCode,
          duration,
          paymentMethod: 'card',
          trialDays: TRIAL_DAYS,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error ?? 'Falha ao iniciar checkout.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      toast.error('Erro ao iniciar plano', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      })
      setLoading(null)
    }
  }

  return (
    /* Full-screen overlay — escapes the onboarding layout max-w-lg */
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        background: 'linear-gradient(160deg, #06080f 0%, #0a0d1a 40%, #06080f 100%)',
        zIndex: 100,
      }}
    >
      {/* Background noise texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Glow orb top */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #a855f7 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 pb-24">

        {/* ── Topo: logo + header ── */}
        <div className="mb-4 flex justify-center">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}
            >
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">SAOOZ</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.3)',
              color: '#c084fc',
            }}
          >
            <Star className="h-3 w-3" />
            {TRIAL_DAYS} dias grátis · Sem cobrança agora
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Finalmente, controle total<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)' }}
            >
              das suas finanças
            </span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6b7280' }}>
            Escolha o plano que encaixa na sua realidade. Comece grátis,
            cancele quando quiser. Sem pegadinha.
          </p>
        </div>

        {/* ── Seletor de periodicidade ── */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex p-1 rounded-[12px] gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {DURATION_OPTIONS.map((opt) => {
              const disc = DURATION_DISCOUNTS[opt.value]
              const isActive = duration === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className="relative px-4 py-2 rounded-[9px] text-sm font-semibold transition-all"
                  style={{
                    background: isActive ? 'rgba(168,85,247,0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                    color: isActive ? '#e9d5ff' : '#6b7280',
                  }}
                >
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.short}</span>
                  {disc > 0 && (
                    <span
                      className="absolute -top-2.5 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#22c55e', color: '#fff' }}
                    >
                      -{Math.round(disc * 100)}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Cards dos planos ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {PLANS.map((plan) => {
            const catalog = PLAN_CATALOG[plan.code]
            const pricing  = getPlanPriceForDuration(plan.code, duration)
            const Icon     = plan.icon
            const isLoading = loading === plan.code

            return (
              <div
                key={plan.code}
                className="relative flex flex-col rounded-[20px] overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                style={{
                  background: plan.highlight
                    ? 'linear-gradient(160deg, #13102a 0%, #0f0d22 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${plan.border}`,
                  boxShadow: plan.highlight ? `0 0 60px ${plan.glow}` : 'none',
                }}
              >
                {/* Top glow bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: plan.highlight
                      ? `linear-gradient(90deg, transparent, ${plan.color}, transparent)`
                      : `linear-gradient(90deg, transparent, ${plan.color}80, transparent)`,
                  }}
                />

                {/* Badge "Mais completo" */}
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        color: '#fff',
                        boxShadow: '0 2px 12px rgba(168,85,247,0.4)',
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-6">
                    <div
                      className="h-11 w-11 rounded-[12px] flex items-center justify-center mb-4"
                      style={{
                        background: `${plan.color}18`,
                        border: `1px solid ${plan.color}40`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: plan.color }} />
                    </div>
                    <p className="text-lg font-extrabold text-white mb-0.5">{plan.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{plan.subtitle}</p>
                  </div>

                  {/* Preço */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-3xl font-extrabold text-white tabular-nums">
                        R$ {pricing.effectiveMonthly.toFixed(0)}
                      </span>
                      <span className="text-sm pb-1" style={{ color: '#6b7280' }}>/mês</span>
                    </div>
                    {discount > 0 ? (
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        <span className="line-through mr-1.5" style={{ color: '#4b5563' }}>
                          R$ {catalog.priceMonthly}/mês
                        </span>
                        <span style={{ color: '#22c55e' }}>
                          Economize R$ {((catalog.priceMonthly - pricing.effectiveMonthly) * duration).toFixed(0)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: '#374151' }}>
                        Cobrado mensalmente
                      </p>
                    )}
                    {duration > 1 && (
                      <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
                        Total R$ {pricing.totalPrice.toFixed(2)} a cada {duration} meses
                      </p>
                    )}
                  </div>

                  {/* Destaques */}
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm" style={{ color: '#d1d5db' }}>
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${plan.color}18` }}
                        >
                          <Check className="h-3 w-3" style={{ color: plan.color }} />
                        </div>
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelect(plan.code)}
                    disabled={!!loading}
                    className="w-full h-12 rounded-[12px] text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: plan.highlight
                        ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                        : `linear-gradient(135deg, ${plan.color}cc, ${plan.color})`,
                      boxShadow: plan.highlight ? '0 4px 24px rgba(168,85,247,0.35)' : `0 4px 16px ${plan.color}30`,
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Começar {TRIAL_DAYS} dias grátis
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] mt-2.5" style={{ color: '#374151' }}>
                    Cartão requerido · Sem cobranças por {TRIAL_DAYS} dias
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Tabela comparativa ── */}
        <div className="mb-10">
          <button
            onClick={() => setShowTable((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
            style={{ color: '#6b7280' }}
          >
            <span>{showTable ? 'Ocultar' : 'Ver'} comparação completa de funcionalidades</span>
            <span
              className="transition-transform duration-200"
              style={{ display: 'inline-block', transform: showTable ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          </button>

          {showTable && (
            <div
              className="mt-4 rounded-[16px] overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Header da tabela */}
              <div
                className="grid grid-cols-[1fr_80px_80px_80px] gap-0 px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4b5563' }}>
                  Funcionalidade
                </span>
                {PLANS.map((p) => (
                  <span
                    key={p.code}
                    className="text-center text-xs font-bold uppercase tracking-wider"
                    style={{ color: p.color }}
                  >
                    {p.code === 'pro' ? 'PRO' : p.code.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Grupos */}
              {FEATURE_GROUPS.map((group) => {
                const GroupIcon = group.icon
                return (
                  <div key={group.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Group header */}
                    <div
                      className="flex items-center gap-2 px-5 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.015)' }}
                    >
                      <GroupIcon className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                        {group.label}
                      </span>
                    </div>

                    {/* Rows */}
                    {group.features.map((feat, i) => (
                      <div
                        key={feat.name}
                        className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-0 px-5 py-3"
                        style={{
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <span className="text-sm pr-4" style={{ color: '#9ca3af' }}>{feat.name}</span>
                        <div className="text-center">
                          <FeatureCell value={feat.pf}  color={PLANS[0].color} />
                        </div>
                        <div className="text-center">
                          <FeatureCell value={feat.pro} color={PLANS[1].color} />
                        </div>
                        <div className="text-center">
                          <FeatureCell value={feat.pj}  color={PLANS[2].color} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Trust bar ── */}
        <div
          className="rounded-[16px] px-6 py-5 mb-8"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🔒', title: 'Dados protegidos', desc: 'Criptografia de ponta a ponta' },
              { icon: '⚡', title: 'Ativação imediata', desc: 'Acesso em segundos após cadastro' },
              { icon: '↩️', title: 'Cancele quando quiser', desc: 'Sem fidelidade, sem taxa' },
              { icon: '💳', title: 'Pagamento seguro', desc: 'Stripe certificado PCI-DSS' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ compacto ── */}
        <div className="mb-10 grid sm:grid-cols-2 gap-4">
          {[
            {
              q: 'O cartão é cobrado agora?',
              a: `Não. Você só é cobrado após os ${TRIAL_DAYS} dias de teste. Cancele antes disso e não paga nada.`,
            },
            {
              q: 'Posso mudar de plano depois?',
              a: 'Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelas configurações.',
            },
            {
              q: 'O que acontece com meus dados se eu cancelar?',
              a: 'Seus dados ficam salvos por 90 dias após o cancelamento. Você pode reativar quando quiser.',
            },
            {
              q: 'Posso usar no celular?',
              a: 'Sim. O SAOOZ é responsivo e funciona perfeitamente no navegador do seu celular.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-[12px] p-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-sm font-semibold text-white mb-1">{item.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* ── Skip ── */}
        <div className="text-center">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-xs transition-colors"
            style={{ color: '#374151' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
          >
            Continuar com o plano gratuito limitado →
          </button>
        </div>

      </div>
    </div>
  )
}
