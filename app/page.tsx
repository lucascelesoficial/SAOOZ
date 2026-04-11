import Link from 'next/link'
import { ArrowRight, BadgeCheck, Bot, Building2, Sparkles, Wallet } from 'lucide-react'
import { redirect } from 'next/navigation'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { createClient } from '@/lib/supabase/server'

const PILLARS = [
  {
    title: 'Financas',
    description: 'Centralize receitas, despesas e saldo com leitura imediata por mes.',
    icon: Wallet,
  },
  {
    title: 'Empresa',
    description: 'Gerencie operacao PJ com foco em margem, impostos e crescimento.',
    icon: Building2,
  },
  {
    title: 'Inteligencia',
    description: 'Use IA para encontrar desvios, priorizar acao e reduzir desperdicios.',
    icon: Bot,
  },
]

const PLANS = [
  {
    code: 'PF',
    value: 'R$47',
    tagline: 'Pessoal com controle diario',
    features: ['Painel pessoal', 'Despesas mensais', 'IA com limite'],
  },
  {
    code: 'PJ',
    value: 'R$67',
    tagline: 'Operacao empresarial enxuta',
    features: ['Painel empresarial', 'Impostos e pro-labore', 'IA com limite'],
  },
  {
    code: 'PRO',
    value: 'R$97',
    tagline: 'PF + PJ com estrategia completa',
    features: ['Operacao unificada', 'IA sem limite', 'Insights avancados'],
    highlight: true,
  },
]

const STEPS = [
  {
    title: 'Crie sua conta',
    description: 'Configure seu acesso em menos de 1 minuto.',
  },
  {
    title: 'Ative PF e/ou PJ',
    description: 'Comece no modo que faz sentido agora e evolua depois.',
  },
  {
    title: 'Execute com previsibilidade',
    description: 'Registre, analise e ajuste sua operacao com apoio da IA.',
  },
]

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-app">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(1000px 500px at 15% -10%, color-mix(in oklab, var(--accent-blue) 18%, transparent), transparent 60%), radial-gradient(900px 450px at 85% 0%, color-mix(in oklab, var(--accent-cyan) 14%, transparent), transparent 62%)',
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <SaoozWordmark size="sm" />

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="theme-outline-button inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <section className="grid gap-8 py-6 md:grid-cols-[1.2fr_0.8fr] md:py-10">
          <div className="space-y-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
                background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                color: 'var(--accent-blue)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Financial Operating System
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-app md:text-5xl">
                SAOOZ para quem quer operar PF e PJ com clareza real.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-app-base md:text-lg">
                Controle financeiro premium com IA aplicada a decisao: acompanhe o mes, reduza
                desvios e cresca com previsibilidade.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planos-section"
                className="theme-outline-button inline-flex h-11 items-center rounded-[11px] px-5 text-sm font-medium"
              >
                Ver planos
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {['PF + PJ no mesmo produto', 'Trial de 7 dias', 'Arquitetura pronta para SaaS'].map((item) => (
                <div key={item} className="panel-card-soft rounded-[10px] px-3 py-2 text-xs text-app-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card relative overflow-hidden rounded-[16px] p-5">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-52 w-52 rounded-full"
              style={{ background: 'color-mix(in oklab, var(--accent-blue) 25%, transparent)', filter: 'blur(42px)' }}
            />
            <div className="relative space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-app-soft">Cockpit financeiro</p>
                <p className="mt-2 text-2xl font-bold text-app">Visao em segundos</p>
              </div>

              <div className="space-y-3">
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Saldo projetado</p>
                  <p className="mt-1 text-lg font-bold text-[#22c55e]">R$ 12.840,00</p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Desvio do mes</p>
                  <p className="mt-1 text-lg font-bold text-[#f59e0b]">+8,4% acima do planejado</p>
                </div>
              </div>

              <div className="space-y-2">
                {[72, 55, 81, 64, 78].map((value, index) => (
                  <div key={index} className="h-2 overflow-hidden rounded-full bg-[var(--panel-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value}%`,
                        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon

            return (
              <article key={pillar.title} className="panel-card p-5">
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--accent-blue) 24%, transparent)',
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h2 className="text-lg font-semibold text-app">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-app-soft">{pillar.description}</p>
              </article>
            )
          })}
        </section>

        <section id="planos-section" className="py-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-app">Planos com diferenca real de operacao</h2>
            <p className="mt-2 text-sm text-app-soft">
              Nao e apenas preco. Cada plano desbloqueia capacidade concreta para escalar.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.code}
                className="panel-card relative overflow-hidden p-5"
                style={
                  plan.highlight
                    ? {
                        borderColor: 'color-mix(in oklab, var(--accent-blue) 45%, transparent)',
                        boxShadow: '0 14px 36px color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                      }
                    : {}
                }
              >
                {plan.highlight && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                    style={{
                      background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    Recomendado
                  </span>
                )}

                <p className="text-sm font-semibold text-app-soft">{plan.code}</p>
                <p className="mt-2 text-3xl font-black text-app">{plan.value}</p>
                <p className="text-xs text-app-soft">por mes</p>
                <p className="mt-3 text-sm text-app-base">{plan.tagline}</p>

                <div className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <p key={feature} className="flex items-center gap-2 text-sm text-app">
                      <BadgeCheck className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                      {feature}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="panel-card p-6">
            <h2 className="text-2xl font-bold text-app">Implementacao simples para entrar no ar rapido</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-blue)' }}>
                    Etapa {index + 1}
                  </p>
                  <p className="mt-2 text-base font-semibold text-app">{step.title}</p>
                  <p className="mt-1 text-sm text-app-soft">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div
            className="rounded-[18px] border p-6 text-center md:p-8"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
              background:
                'linear-gradient(135deg, color-mix(in oklab, var(--accent-blue) 12%, transparent), color-mix(in oklab, var(--accent-cyan) 10%, transparent))',
            }}
          >
            <h2 className="text-2xl font-black text-app md:text-3xl">
              Pronto para fechar o lancamento do SAOOZ?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-app-base md:text-base">
              Ative sua conta e comece com a estrutura que ja esta preparada para crescer em producao.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="theme-outline-button inline-flex h-11 items-center rounded-[11px] px-5 text-sm font-medium"
              >
                Ja tenho acesso
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
