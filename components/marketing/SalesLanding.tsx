import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Briefcase, Building2,
  Clock3, CreditCard, Layers,
  Shield, TrendingUp, User, Zap, CircleAlert, BarChart3,
  CheckCircle2, Star,
  Mail, ChevronRight,
} from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: CircleAlert,
    title: 'Fim de mês no escuro',
    description: 'Você fecha o mês sem saber para onde o dinheiro foi — e já é tarde para corrigir qualquer coisa.',
  },
  {
    icon: Briefcase,
    title: 'PF e PJ misturados',
    description: 'Conta pessoal e empresarial se confundem. Qualquer decisão vira tentativa e erro.',
  },
  {
    icon: BarChart3,
    title: 'Planilha que não fecha',
    description: 'A planilha paralela nunca está atualizada. Você não confia nos números porque sabe que estão errados.',
  },
  {
    icon: Brain,
    title: 'IA que não entende seu contexto',
    description: 'Ferramentas genéricas não conhecem seu histórico real. As respostas não se aplicam ao seu momento.',
  },
]

const STEPS = [
  {
    num: '01',
    icon: User,
    title: 'Crie sua conta',
    description: 'Cadastro em menos de 2 minutos. Nome, e-mail e senha — sem burocracia.',
  },
  {
    num: '02',
    icon: Layers,
    title: 'Configure seu modo',
    description: 'Escolha PF, PJ ou ambos. O sistema monta o painel certo para o seu contexto automaticamente.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Opere com clareza',
    description: 'Registre, analise e decida com base em dados reais — sem planilha paralela.',
  },
]

const FEATURES = [
  {
    id: 'pf',
    tag: 'Módulo PF',
    tagColor: '#3b82f6',
    icon: User,
    title: 'Controle financeiro pessoal com método real',
    description:
      'Painel centralizado com visão de caixa, categorias de gastos, metas de reserva e inteligência IA para identificar onde o dinheiro some antes do fim do mês.',
    bullets: [
      'Dashboard com saldo, renda e gastos do mês',
      'Categorias de despesas inteligentes (16 tipos)',
      'Módulo de investimentos com carteira e posições',
      'Reserva de emergência com meta e progresso',
      'Assistente IA com contexto financeiro real',
    ],
  },
  {
    id: 'pj',
    tag: 'Módulo PJ',
    tagColor: '#0ea5e9',
    icon: Building2,
    title: 'Operação financeira empresarial enxuta',
    description:
      'Faturamento, despesas, impostos e pró-labore em um único painel. Suporte a múltiplas empresas com separação real entre pessoal e empresarial.',
    bullets: [
      'Painel de receita × despesa empresarial',
      'Cálculo de impostos (MEI, Simples, Presumido, Real)',
      'Gestão de pró-labore por período',
      'Suporte a até 5 empresas (plano PRO)',
      'Investimentos e reserva empresarial separados',
    ],
  },
  {
    id: 'ia',
    tag: 'Assistente IA',
    tagColor: '#a855f7',
    icon: Brain,
    title: 'IA que conhece o seu financeiro de verdade',
    description:
      'O assistente acessa seus dados reais — renda, gastos, categorias e contexto PF/PJ — e entrega análises orientadas à decisão, não respostas genéricas.',
    bullets: [
      'Análise de padrões de gasto e desvios',
      'Recomendações de corte e priorização',
      'Ação direta: registra despesas por comando de voz ou texto',
      'Insights semanais e alertas de anomalia',
      'Resposta em voz com Text-to-Speech (ElevenLabs)',
    ],
  },
]

const FOR_WHOM = [
  {
    icon: User,
    color: '#3b82f6',
    title: 'Profissional com renda variável',
    description:
      'Freelancers, consultores e autônomos que precisam de previsibilidade e método sem depender de contador para entender o básico.',
  },
  {
    icon: Building2,
    color: '#0ea5e9',
    title: 'Empresário com operação PJ',
    description:
      'MEIs e pequenas empresas que precisam separar pessoa e empresa sem planilha paralela ou ferramenta adicional.',
  },
  {
    icon: Layers,
    color: '#22c55e',
    title: 'Operação PF + PJ unificada',
    description:
      'Quem tem renda pessoal e empresarial e precisa de visão total do dinheiro em um único sistema, sem retrabalho.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Lucas M.',
    role: 'Designer · MEI',
    quote:
      'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.',
    stars: 5,
  },
  {
    name: 'Fernanda C.',
    role: 'Consultora PJ',
    quote:
      'O módulo de impostos me economiza tempo toda semana. Antes abria 3 ferramentas diferentes só para montar o número básico.',
    stars: 5,
  },
  {
    name: 'Rafael S.',
    role: 'Gestor de tráfego · Autônomo',
    quote:
      'A IA identifica onde está o vazamento antes do fim do mês. Muda completamente como tomo decisão sobre investimento e gasto.',
    stars: 5,
  },
]

const PLANS = [
  {
    code: 'pf',
    name: 'PF',
    price: 47,
    subtitle: 'Controle financeiro pessoal completo',
    highlight: false,
    features: [
      'Dashboard financeiro pessoal',
      'Despesas e rendas (16 categorias)',
      'Módulo de investimentos',
      'Reserva de emergência',
      'Assistente IA (60 ações/mês)',
      'Export PDF',
    ],
    missing: ['Módulo PJ', 'Multi-empresa'],
  },
  {
    code: 'pj',
    name: 'PJ',
    price: 67,
    subtitle: 'Operação empresarial com clareza real',
    highlight: false,
    features: [
      'Dashboard financeiro empresarial',
      'Receita, despesa e impostos',
      'Pró-labore e fluxo de caixa',
      'Até 3 empresas',
      'Investimentos PJ',
      'Assistente IA (60 ações/mês)',
    ],
    missing: ['Módulo PF pessoal'],
  },
  {
    code: 'pro',
    name: 'PRO',
    price: 97,
    subtitle: 'Visão total — PF + PJ no mesmo sistema',
    highlight: true,
    features: [
      'Módulo PF completo',
      'Módulo PJ completo',
      'Até 5 empresas',
      'Inteligência avançada',
      'IA sem limite de ações',
      'Suporte prioritário',
    ],
    missing: [],
  },
]

const FAQ_ITEMS = [
  {
    q: 'O cartão é obrigatório para ativar o trial?',
    a: 'Sim. O cartão é necessário para ativar os 7 dias gratuitos. Nenhuma cobrança é feita durante o período — a assinatura começa somente depois, caso você não cancele antes.',
  },
  {
    q: 'Quando começa a cobrança?',
    a: 'Somente após o encerramento dos 7 dias de trial. Cancele antes do vencimento e não paga nada. Sem fidelidade, sem multa de saída.',
  },
  {
    q: 'Posso usar PF e PJ no mesmo plano?',
    a: 'Sim, com o plano PRO você tem acesso aos dois módulos em uma única conta. Se precisar só de um, os planos PF ou PJ são mais indicados e mais baratos.',
  },
  {
    q: 'Consigo ter mais de uma empresa cadastrada?',
    a: 'Sim. O plano PJ suporta até 3 empresas e o PRO até 5. Ideal para quem opera mais de um CNPJ ou tem diferentes frentes de negócio.',
  },
  {
    q: 'Em quanto tempo configuro o SAOOZ?',
    a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.',
  },
  {
    q: 'O assistente IA usa meus dados reais?',
    a: 'Sim. O assistente conhece seu contexto financeiro real — renda, gastos, categorias e operação PF/PJ — e entrega análises orientadas ao seu momento, não respostas genéricas de ChatGPT.',
  },
  {
    q: 'Posso migrar de plano depois?',
    a: 'Sim. Você pode trocar de plano a qualquer momento pelo painel de configurações. Sem perda de dados, sem burocracia.',
  },
]

const RESULTS = [
  {
    icon: Clock3,
    metric: 'Horas',
    label: 'para fechar o mês',
    description: 'Em vez de dias de planilha e retrabalho.',
    color: '#3b82f6',
  },
  {
    icon: TrendingUp,
    metric: 'Tempo real',
    label: 'de visibilidade de caixa',
    description: 'Sem esperar o fim do mês para saber o saldo.',
    color: '#22c55e',
  },
  {
    icon: Brain,
    metric: 'Antes do impacto',
    label: 'detecção de desvio',
    description: 'A IA identifica o problema antes que vire crise.',
    color: '#a855f7',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesLanding() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-app">

      {/* ── Background glow ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(900px 500px at 15% -5%, color-mix(in oklab, var(--accent-blue) 18%, transparent), transparent 60%), radial-gradient(800px 450px at 85% 5%, color-mix(in oklab, var(--accent-cyan) 12%, transparent), transparent 60%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-20 sticky top-0" style={{ borderBottom: '1px solid color-mix(in oklab, var(--panel-border) 60%, transparent)', backdropFilter: 'blur(16px)', background: 'color-mix(in oklab, var(--app-bg) 80%, transparent)' }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <SaoozWordmark size="sm" />

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#como-funciona" className="text-sm text-app-soft transition-colors hover:text-app">Como funciona</Link>
            <Link href="#funcionalidades" className="text-sm text-app-soft transition-colors hover:text-app">Funcionalidades</Link>
            <Link href="#planos" className="text-sm text-app-soft transition-colors hover:text-app">Planos</Link>
            <Link href="#faq" className="text-sm text-app-soft transition-colors hover:text-app">FAQ</Link>
            <a href="https://instagram.com/saoozia" target="_blank" rel="noopener noreferrer" className="text-sm text-app-soft transition-colors hover:text-app flex items-center gap-1">
              @SAOOZIA
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="theme-outline-button hidden md:inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-medium">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              Testar 7 dias grátis
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ═══════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-12 md:px-6 md:pt-24">
          <div className="mx-auto max-w-4xl text-center space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
                background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
                color: 'var(--accent-blue)',
              }}>
              <Zap className="h-3 w-3" />
              Sistema financeiro premium com IA · PF e PJ
            </div>

            {/* H1 */}
            <h1 className="text-4xl font-black leading-[1.1] text-app md:text-6xl">
              Seu financeiro pessoal e<br />
              empresarial,{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                finalmente sob controle.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-app-base md:text-lg">
              O SAOOZ unifica PF e PJ em um único sistema inteligente. Você para de apagar incêndio financeiro e começa a operar com previsibilidade real.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center gap-2 rounded-[12px] px-6 text-base font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', boxShadow: '0 8px 32px color-mix(in oklab, var(--accent-blue) 35%, transparent)' }}
              >
                Testar gratuitamente por 7 dias
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planos"
                className="theme-outline-button inline-flex h-12 items-center gap-2 rounded-[12px] px-6 text-base font-medium"
              >
                Ver planos
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-app-soft pt-1">
              <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Cartão obrigatório · cobrança só após o trial</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Cancele quando quiser</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Sem fidelidade</span>
            </div>
          </div>

          {/* Dashboard preview mockup */}
          <div className="mt-14 relative">
            <div
              className="mx-auto max-w-4xl rounded-[20px] overflow-hidden"
              style={{
                border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)',
                boxShadow: '0 32px 80px color-mix(in oklab, var(--accent-blue) 15%, transparent), 0 0 0 1px color-mix(in oklab, var(--panel-border) 50%, transparent)',
              }}
            >
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'color-mix(in oklab, var(--panel-bg) 90%, transparent)', borderBottom: '1px solid var(--panel-border)' }}>
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex-1 rounded-md px-3 py-1 text-xs text-app-soft" style={{ background: 'var(--panel-bg-soft)' }}>
                  app.saooz.com/central
                </span>
              </div>

              {/* Mock dashboard */}
              <div className="grid gap-0" style={{ background: 'var(--app-bg)' }}>
                {/* Top metrics row */}
                <div className="grid grid-cols-3 gap-px p-5 md:grid-cols-4" style={{ background: 'var(--panel-border)' }}>
                  {[
                    { label: 'Saldo disponível', value: 'R$ 8.420', color: '#22c55e' },
                    { label: 'Entradas do mês', value: 'R$ 12.800', color: '#3b82f6' },
                    { label: 'Saídas do mês', value: 'R$ 4.380', color: '#f87171' },
                    { label: 'Taxa de consumo', value: '34%', color: '#a855f7' },
                  ].map((m) => (
                    <div key={m.label} className="p-4" style={{ background: 'var(--app-bg)' }}>
                      <p className="text-xs text-app-soft mb-1">{m.label}</p>
                      <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chart row placeholder */}
                <div className="grid md:grid-cols-2 gap-px" style={{ background: 'var(--panel-border)' }}>
                  <div className="p-5" style={{ background: 'var(--app-bg)' }}>
                    <p className="text-xs text-app-soft mb-3">Fluxo de caixa — Abril</p>
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 9 ? 'color-mix(in oklab, var(--accent-blue) 30%, transparent)' : 'color-mix(in oklab, var(--accent-blue) 70%, transparent)' }} />
                      ))}
                    </div>
                  </div>
                  <div className="p-5" style={{ background: 'var(--app-bg)' }}>
                    <p className="text-xs text-app-soft mb-3">IA Assistente</p>
                    <div className="space-y-2">
                      <div className="rounded-[8px] p-2.5 text-xs" style={{ background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-blue) 20%, transparent)' }}>
                        <span style={{ color: 'var(--accent-blue)' }}>Saooz:</span>{' '}
                        <span className="text-app-soft">Seus gastos com alimentação subiram 18% vs. mês anterior. Deseja ajustar a meta?</span>
                      </div>
                      <div className="rounded-[8px] p-2.5 text-xs text-right" style={{ background: 'var(--panel-bg-soft)' }}>
                        <span className="text-app">Sim, revise e sugira um valor.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient fade bottom */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
              style={{ background: 'linear-gradient(to top, var(--app-bg), transparent)' }}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-y" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { value: '7 dias', label: 'de trial gratuito', accent: 'var(--accent-blue)' },
                { value: 'PF + PJ', label: 'em um único sistema', accent: 'var(--accent-cyan)' },
                { value: '3 planos', label: 'sem fidelidade', accent: '#22c55e' },
                { value: 'IA real', label: 'com contexto financeiro', accent: '#a855f7' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black md:text-3xl" style={{ color: stat.accent }}>{stat.value}</p>
                  <p className="mt-1 text-xs text-app-soft">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            PAIN — "Você se identifica?"
        ═══════════════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">O problema</p>
            <h2 className="text-3xl font-black text-app md:text-4xl">Você se identifica com algum disso?</h2>
            <p className="mt-3 text-sm text-app-soft">Se sim, você precisa de um sistema. Não de mais uma planilha.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAIN_POINTS.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="panel-card rounded-[16px] p-5 space-y-3">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
                    style={{
                      background: 'color-mix(in oklab, #f87171 10%, transparent)',
                      border: '1px solid color-mix(in oklab, #f87171 20%, transparent)',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: '#f87171' }} />
                  </div>
                  <h3 className="font-semibold text-app text-sm">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-app-soft">{item.description}</p>
                </article>
              )
            })}
          </div>

          {/* Transition line */}
          <div className="mt-12 text-center">
            <div
              className="inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-semibold"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
                background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)',
                color: 'var(--accent-blue)',
              }}
            >
              O SAOOZ foi criado para resolver exatamente isso.
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════════════ */}
        <section id="como-funciona" className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">Como funciona</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Em 3 passos você já opera com controle real</h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connector line (desktop) */}
              <div
                className="absolute top-8 left-1/4 right-1/4 hidden h-px md:block"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)' }}
              />

              {STEPS.map((step) => {
                const Icon = step.icon
                return (
                  <article key={step.num} className="panel-card relative rounded-[18px] p-6 text-center space-y-4">
                    <div
                      className="mx-auto h-14 w-14 rounded-[14px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                        boxShadow: '0 8px 24px color-mix(in oklab, var(--accent-blue) 30%, transparent)',
                      }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className="absolute top-5 right-5 text-4xl font-black opacity-10"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      {step.num}
                    </span>
                    <h3 className="text-base font-bold text-app">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-app-soft">{step.description}</p>
                  </article>
                )
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Começar agora — 7 dias grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FEATURES
        ═══════════════════════════════════════════════════════════ */}
        <section id="funcionalidades" className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 space-y-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">Funcionalidades</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Tudo que você precisa em um único sistema</h2>
            </div>

            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              const isReversed = i % 2 !== 0
              return (
                <article
                  key={feat.id}
                  className={`panel-card rounded-[20px] overflow-hidden grid md:grid-cols-2 gap-0 ${isReversed ? 'md:[direction:rtl]' : ''}`}
                >
                  {/* Text side */}
                  <div className={`p-7 md:p-10 space-y-5 ${isReversed ? 'md:[direction:ltr]' : ''}`}>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{
                        background: `color-mix(in oklab, ${feat.tagColor} 12%, transparent)`,
                        border: `1px solid color-mix(in oklab, ${feat.tagColor} 25%, transparent)`,
                        color: feat.tagColor,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {feat.tag}
                    </span>
                    <h3 className="text-xl font-bold text-app md:text-2xl">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-app-soft">{feat.description}</p>
                    <ul className="space-y-2">
                      {feat.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-app-base">
                          <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: feat.tagColor }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/cadastro"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ color: feat.tagColor }}
                    >
                      Testar este módulo <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Visual side */}
                  <div
                    className={`relative flex items-center justify-center p-6 min-h-[240px] ${isReversed ? 'md:[direction:ltr]' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, color-mix(in oklab, ${feat.tagColor} 8%, transparent), color-mix(in oklab, ${feat.tagColor} 3%, transparent))`,
                      borderLeft: isReversed ? 'none' : `1px solid var(--panel-border)`,
                      borderRight: isReversed ? `1px solid var(--panel-border)` : 'none',
                    }}
                  >
                    {/* Glow */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ background: `radial-gradient(400px at 50% 50%, color-mix(in oklab, ${feat.tagColor} 15%, transparent), transparent)` }}
                    />
                    {/* Mini mockup card */}
                    <div className="relative w-full max-w-xs space-y-3">
                      {feat.id === 'pf' && (
                        <>
                          {[
                            { label: 'Saldo mensal', val: 'R$ 8.420', color: '#22c55e' },
                            { label: 'Maior gasto', val: 'Moradia · 32%', color: feat.tagColor },
                            { label: 'Reserva', val: '68% da meta', color: '#f59e0b' },
                          ].map((row) => (
                            <div key={row.label} className="panel-card rounded-[10px] flex items-center justify-between px-4 py-3">
                              <span className="text-xs text-app-soft">{row.label}</span>
                              <span className="text-sm font-bold" style={{ color: row.color }}>{row.val}</span>
                            </div>
                          ))}
                        </>
                      )}
                      {feat.id === 'pj' && (
                        <>
                          {[
                            { label: 'Faturamento', val: 'R$ 28.500', color: feat.tagColor },
                            { label: 'Despesas PJ', val: 'R$ 11.200', color: '#f87171' },
                            { label: 'Imposto estimado', val: 'R$ 1.425 · Simples', color: '#f59e0b' },
                            { label: 'Lucro líquido', val: 'R$ 15.875', color: '#22c55e' },
                          ].map((row) => (
                            <div key={row.label} className="panel-card rounded-[10px] flex items-center justify-between px-4 py-3">
                              <span className="text-xs text-app-soft">{row.label}</span>
                              <span className="text-sm font-bold" style={{ color: row.color }}>{row.val}</span>
                            </div>
                          ))}
                        </>
                      )}
                      {feat.id === 'ia' && (
                        <div className="panel-card rounded-[14px] p-4 space-y-3">
                          <div className="rounded-[8px] p-3" style={{ background: `color-mix(in oklab, ${feat.tagColor} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${feat.tagColor} 20%, transparent)` }}>
                            <p className="text-xs mb-1 font-semibold" style={{ color: feat.tagColor }}>Saooz</p>
                            <p className="text-xs text-app-soft leading-relaxed">Seus gastos com alimentação subiram 18% em abril. Deseja revisar a meta da categoria?</p>
                          </div>
                          <div className="rounded-[8px] p-3 text-right" style={{ background: 'var(--panel-bg-soft)' }}>
                            <p className="text-xs text-app">Sim — sugira um valor realista.</p>
                          </div>
                          <div className="rounded-[8px] p-3" style={{ background: `color-mix(in oklab, ${feat.tagColor} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${feat.tagColor} 20%, transparent)` }}>
                            <p className="text-xs mb-1 font-semibold" style={{ color: feat.tagColor }}>Saooz</p>
                            <p className="text-xs text-app-soft leading-relaxed">Com base no histórico, R$ 1.100/mês mantém o padrão sem pressão no caixa.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FOR WHOM
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">Para quem é</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">O SAOOZ é para você se…</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {FOR_WHOM.map((profile) => {
                const Icon = profile.icon
                return (
                  <article
                    key={profile.title}
                    className="panel-card rounded-[18px] p-6 space-y-4"
                    style={{
                      borderColor: `color-mix(in oklab, ${profile.color} 20%, transparent)`,
                    }}
                  >
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-[12px]"
                      style={{
                        background: `color-mix(in oklab, ${profile.color} 14%, transparent)`,
                        border: `1px solid color-mix(in oklab, ${profile.color} 25%, transparent)`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: profile.color }} />
                    </div>
                    <h3 className="text-base font-bold text-app">{profile.title}</h3>
                    <p className="text-sm leading-relaxed text-app-soft">{profile.description}</p>
                    <Link
                      href="/cadastro"
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: profile.color }}
                    >
                      Testar agora <ArrowRight className="h-3 w-3" />
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            RESULTS
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-t" style={{ borderColor: 'var(--panel-border)', background: 'color-mix(in oklab, var(--accent-blue) 3%, transparent)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">O que você vai notar</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Impacto real nos primeiros 30 dias</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {RESULTS.map((r) => {
                const Icon = r.icon
                return (
                  <article key={r.label} className="panel-card rounded-[18px] p-6 text-center space-y-3">
                    <div
                      className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[12px]"
                      style={{
                        background: `color-mix(in oklab, ${r.color} 14%, transparent)`,
                        border: `1px solid color-mix(in oklab, ${r.color} 25%, transparent)`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: r.color }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: r.color }}>{r.metric}</p>
                    <p className="text-sm font-semibold text-app">{r.label}</p>
                    <p className="text-xs text-app-soft">{r.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">O que dizem os usuários</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Quem usa não volta para planilha</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <article key={t.name} className="panel-card rounded-[18px] p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-app-base">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-1">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-app">{t.name}</p>
                      <p className="text-xs text-app-soft">{t.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            PLANS
        ═══════════════════════════════════════════════════════════ */}
        <section id="planos" className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">Planos</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Escolha o plano certo para o seu momento</h2>
              <p className="mt-3 text-sm text-app-soft">7 dias gratuitos em qualquer plano · sem compromisso · cancele quando quiser</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.code}
                  className="panel-card relative overflow-hidden rounded-[20px] p-6 flex flex-col gap-5"
                  style={plan.highlight ? {
                    borderColor: 'color-mix(in oklab, var(--accent-blue) 50%, transparent)',
                    boxShadow: '0 16px 48px color-mix(in oklab, var(--accent-blue) 15%, transparent)',
                  } : {}}
                >
                  {plan.highlight && (
                    <>
                      <div
                        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(circle, var(--accent-blue), transparent)', filter: 'blur(40px)' }}
                      />
                      <span
                        className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                          color: 'var(--accent-blue)',
                        }}
                      >
                        Mais escolhido
                      </span>
                    </>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-app-soft">{plan.name}</p>
                    <div className="mt-1.5 flex items-end gap-1">
                      <span className="text-4xl font-black text-app">R${plan.price}</span>
                      <span className="mb-1 text-sm text-app-soft">/mês</span>
                    </div>
                    <p className="mt-1 text-xs text-app-soft">{plan.subtitle}</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-app">
                        <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-blue)' }} />
                        {f}
                      </div>
                    ))}
                    {plan.missing.map((m) => (
                      <div key={m} className="flex items-center gap-2 text-sm text-app-soft opacity-50">
                        <div className="h-4 w-4 shrink-0 rounded-full border" style={{ borderColor: 'var(--panel-border)' }} />
                        {m}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/cadastro"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white transition-all"
                    style={{
                      background: plan.highlight
                        ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                        : 'linear-gradient(135deg, #334155, #1e293b)',
                    }}
                  >
                    Testar {plan.name} por 7 dias
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-app-soft">
              Planos disponíveis também em ciclos trimestrais (−10%), semestrais (−15%) e anuais (−25%).
              Selecionados na etapa de ativação do trial.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════════════════════ */}
        <section id="faq" className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-app-soft mb-2">FAQ</p>
              <h2 className="text-3xl font-black text-app md:text-4xl">Perguntas frequentes</h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="panel-card group rounded-[14px] overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-app select-none">
                    {item.q}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-app-soft transition-transform duration-200 group-open:rotate-90"
                    />
                  </summary>
                  <div className="px-5 pb-4 pt-0">
                    <p className="text-sm leading-relaxed text-app-soft">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-app-soft">
              Ainda tem dúvida?{' '}
              <a href="mailto:suporte@saooz.com" className="font-semibold transition-colors hover:text-app" style={{ color: 'var(--accent-blue)' }}>
                Fale com o suporte
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════ */}
        <section className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
            <div
              className="relative overflow-hidden rounded-[24px] px-8 py-14 text-center md:px-14"
              style={{
                background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent-blue) 18%, transparent), color-mix(in oklab, var(--accent-cyan) 12%, transparent))',
                border: '1px solid color-mix(in oklab, var(--accent-blue) 35%, transparent)',
              }}
            >
              {/* BG glow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(700px at 50% 100%, color-mix(in oklab, var(--accent-blue) 20%, transparent), transparent)' }}
              />

              <div className="relative space-y-5">
                <p className="text-xs font-bold uppercase tracking-widest text-app-soft">Comece agora</p>
                <h2 className="text-3xl font-black text-app md:text-4xl">
                  Seu financeiro pode virar vantagem competitiva<br className="hidden md:block" /> nos próximos 7 dias.
                </h2>
                <p className="mx-auto max-w-xl text-sm text-app-base md:text-base">
                  Quanto mais você adia, mais dinheiro invisível continua saindo sem controle. Ative agora — sem risco.
                </p>
                <p className="text-xs text-app-soft">
                  Trial gratuito · cartão obrigatório · cobrança só após o período · cancele quando quiser.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    href="/cadastro"
                    className="inline-flex h-12 items-center gap-2 rounded-[12px] px-7 text-base font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', boxShadow: '0 8px 32px color-mix(in oklab, var(--accent-blue) 40%, transparent)' }}
                  >
                    Ativar meu trial grátis agora
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="#planos"
                    className="theme-outline-button inline-flex h-12 items-center rounded-[12px] px-7 text-base font-medium"
                  >
                    Ver planos detalhados
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2 space-y-3">
              <SaoozWordmark size="sm" />
              <p className="text-sm text-app-soft max-w-xs leading-relaxed">
                Sistema financeiro premium com IA para PF e PJ. Controle, clareza e previsibilidade em um único lugar.
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                <a
                  href="https://instagram.com/saoozia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-app-soft transition-colors hover:text-app"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                  @SAOOZIA
                </a>
                <a
                  href="mailto:suporte@saooz.com"
                  className="inline-flex items-center gap-2 text-sm text-app-soft transition-colors hover:text-app"
                >
                  <Mail className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                  suporte@saooz.com
                </a>
              </div>
            </div>

            {/* Produto */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-app-soft">Produto</p>
              <nav className="space-y-2 text-sm">
                <Link href="#como-funciona" className="block text-app-soft transition-colors hover:text-app">Como funciona</Link>
                <Link href="#funcionalidades" className="block text-app-soft transition-colors hover:text-app">Funcionalidades</Link>
                <Link href="#planos" className="block text-app-soft transition-colors hover:text-app">Planos</Link>
                <Link href="#faq" className="block text-app-soft transition-colors hover:text-app">FAQ</Link>
              </nav>
            </div>

            {/* Suporte */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-app-soft">Suporte</p>
              <nav className="space-y-2 text-sm">
                <Link href="/contato" className="block text-app-soft transition-colors hover:text-app">Contato</Link>
                <Link href="/suporte" className="block text-app-soft transition-colors hover:text-app">Central de ajuda</Link>
                <Link href="/login" className="block text-app-soft transition-colors hover:text-app">Entrar</Link>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-1 font-semibold transition-colors"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  Criar conta <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-app-soft md:flex-row"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <p>© {new Date().getFullYear()} SAOOZ. Todos os direitos reservados.</p>
            <p>Pagamentos processados com segurança via Stripe.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
