import Link from 'next/link'
import { ArrowRight, BadgeCheck, CircleAlert, Clock3, PlayCircle } from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'

const PAIN_POINTS = [
  'Você fatura, mas no fim do mês não sabe para onde o dinheiro foi.',
  'PF e PJ se misturam, e qualquer decisão vira tentativa e erro.',
  'O financeiro trava seu crescimento porque tudo depende de planilha solta.',
]

const CORE_PROMISES = [
  {
    title: 'Clareza imediata',
    description: 'Veja o que entrou, o que saiu e o que tende a sobrar antes do mês acabar.',
  },
  {
    title: 'Operação PF + PJ no mesmo sistema',
    description: 'Controle pessoal e empresarial em uma rotina única, sem retrabalho.',
  },
  {
    title: 'Assistente IA orientado à ação',
    description: 'Identifique desvios, custos inflados e prioridades reais em minutos.',
  },
]

const TRUST_STRIP = [
  'Trial de 7 dias para validar o método na prática',
  'PF e PJ no mesmo fluxo operacional',
  'Infra de billing com rastreabilidade e segurança',
]

const TRANSFORMATION_BLOCKS = [
  {
    title: 'Se você está assim hoje',
    points: [
      'Fecha o mês no improviso',
      'Decide sem visibilidade de caixa',
      'Perde margem em pequenos vazamentos',
    ],
  },
  {
    title: 'Com SAOOZ você passa a',
    points: [
      'Operar com rotina única PF + PJ',
      'Antecipar risco antes do fim do mês',
      'Tomar decisão com número, não com achismo',
    ],
  },
]

const RESULTS_30_DAYS = [
  {
    title: 'Fechamento mais rápido',
    description: 'Menos retrabalho para consolidar receitas, despesas e saldo.',
  },
  {
    title: 'Prioridade financeira clara',
    description: 'Foco no que corrige desvio e melhora caixa de verdade.',
  },
  {
    title: 'Operação mais previsível',
    description: 'Menos surpresa no fim do mês e mais controle na semana.',
  },
]

const PLAN_BLOCKS = [
  {
    name: 'PF',
    price: 'R$47',
    subtitle: 'Controle pessoal com método e disciplina',
    audience: 'Para quem quer organizar a vida financeira pessoal com consistência.',
    items: ['Painel pessoal', 'Despesas e receitas', 'Despesas mensais', 'IA com limite'],
  },
  {
    name: 'PJ',
    price: 'R$67',
    subtitle: 'Operação financeira empresarial enxuta',
    audience: 'Para quem precisa controlar empresa com foco em caixa e margem.',
    items: ['Painel empresarial', 'Receita x despesa', 'Impostos e pró-labore', 'IA com limite'],
  },
  {
    name: 'PRO',
    price: 'R$97',
    subtitle: 'Flagship SAOOZ: visão total PF + PJ',
    audience: 'Para quem quer estratégia completa e comando total da operação.',
    items: ['Operação unificada', 'Inteligência avançada', 'IA sem limite', 'Maior capacidade de escala'],
    featured: true,
  },
]

const FAQ_ITEMS = [
  {
    q: 'Em quanto tempo eu consigo usar o SAOOZ de verdade?',
    a: 'A configuração inicial leva poucos minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.',
  },
  {
    q: 'O cartão é obrigatório para o trial?',
    a: 'Sim. O cartão é necessário para ativar os 7 dias gratuitos. Nenhuma cobrança é feita durante o período de teste — a assinatura só começa depois, caso você não cancele.',
  },
  {
    q: 'Quando começa a cobrança?',
    a: 'Somente após o término dos 7 dias de trial. Cancele antes do vencimento e você não paga nada. Sem fidelidade, sem multa.',
  },
  {
    q: 'Posso começar no PF e depois adicionar PJ?',
    a: 'Sim. O produto foi preparado para evolução. Você não fica travado no modo inicial.',
  },
  {
    q: 'Tem risco de perder meus dados financeiros?',
    a: 'Não. O fluxo separa planejamento de transação real para reduzir risco de sobrescrita indevida.',
  },
]

export function SalesLanding() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-app">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(960px 520px at 10% -10%, color-mix(in oklab, var(--accent-blue) 20%, transparent), transparent 62%), radial-gradient(920px 500px at 90% 0%, color-mix(in oklab, var(--accent-cyan) 16%, transparent), transparent 64%)',
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <SaoozWordmark size="sm" />

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="#oferta" className="text-sm text-app-base transition-colors hover:text-app">
            Oferta
          </Link>
          <Link href="#vsl" className="text-sm text-app-base transition-colors hover:text-app">
            VSL
          </Link>
          <Link href="#planos" className="text-sm text-app-base transition-colors hover:text-app">
            Planos
          </Link>
          <Link href="/contato" className="text-sm text-app-base transition-colors hover:text-app">
            Contato
          </Link>
          <Link href="/suporte" className="text-sm text-app-base transition-colors hover:text-app">
            Suporte
          </Link>
        </nav>

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
            Testar agora
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
        <section id="oferta" className="grid gap-8 pb-8 pt-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)',
                background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                color: 'var(--accent-blue)',
              }}
            >
              <CircleAlert className="h-3.5 w-3.5" />
              Se seu financeiro está no escuro, crescimento vira loteria
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-app md:text-5xl">
                Reduza o caos financeiro em até 7 dias e volte a decidir com clareza.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-app-base md:text-lg">
                O SAOOZ foi criado para transformar controle financeiro em rotina operacional.
                Você para de apagar incêndio e passa a operar com previsibilidade.
              </p>
            </div>

            <div className="space-y-2">
              {PAIN_POINTS.map((item) => (
                <div
                  key={item}
                  className="panel-card-soft flex items-start gap-2 rounded-[10px] px-3 py-2 text-sm text-app-base"
                >
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--accent-blue)' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Testar gratuitamente por 7 dias
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planos"
                className="theme-outline-button inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-medium"
              >
                Ver planos
                <PlayCircle className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {TRUST_STRIP.map((item) => (
                <div key={item} className="panel-card-soft rounded-[10px] px-3 py-2 text-xs text-app-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="panel-card relative overflow-hidden rounded-[16px] p-5">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-52 w-52 rounded-full"
              style={{ background: 'color-mix(in oklab, var(--accent-blue) 24%, transparent)', filter: 'blur(42px)' }}
            />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-wider text-app-soft">Impacto esperado</p>
              <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs text-app-soft">Tempo para fechamento mensal</p>
                <p className="mt-1 text-lg font-bold text-app">de dias para horas</p>
              </div>
              <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs text-app-soft">Visão de caixa projetado</p>
                <p className="mt-1 text-lg font-bold text-[#22c55e]">antes do mês virar</p>
              </div>
              <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs text-app-soft">Urgência para começar</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-bold text-app">
                  <Clock3 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                  7 dias de trial
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section id="vsl" className="py-8">
          <div className="panel-card rounded-[16px] p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-app">Assista à VSL e veja o método em ação</h2>
                <p className="mt-1 text-sm text-app-soft">Aqui você vai colocar seu vídeo de vendas principal.</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  border: '1px solid color-mix(in oklab, var(--accent-blue) 30%, transparent)',
                  background: 'color-mix(in oklab, var(--accent-blue) 10%, transparent)',
                  color: 'var(--accent-blue)',
                }}
              >
                Bloco VSL
              </span>
            </div>

            <div
              className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-dashed"
              style={{ borderColor: 'color-mix(in oklab, var(--accent-blue) 40%, transparent)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklab, var(--accent-blue) 12%, transparent), color-mix(in oklab, var(--accent-cyan) 8%, transparent))',
                }}
              />
              <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <PlayCircle className="h-12 w-12" style={{ color: 'var(--accent-blue)' }} />
                <p className="text-base font-semibold text-app">Espaço reservado para seu vídeo VSL</p>
                <p className="max-w-xl text-sm text-app-soft">
                  Substitua este bloco pelo embed do seu player (YouTube, Vimeo, Panda ou player próprio).
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <div className="panel-card-soft rounded-[10px] px-3 py-2 text-xs text-app-soft">
                O erro mais caro que trava PF e PJ no mesmo mês
              </div>
              <div className="panel-card-soft rounded-[10px] px-3 py-2 text-xs text-app-soft">
                O método simples para recuperar previsibilidade financeira
              </div>
              <div className="panel-card-soft rounded-[10px] px-3 py-2 text-xs text-app-soft">
                Como operar sem depender de planilha paralela
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Quero aplicar esse método
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planos"
                className="theme-outline-button inline-flex h-11 items-center rounded-[11px] px-5 text-sm font-medium"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="grid gap-4 md:grid-cols-2">
            {TRANSFORMATION_BLOCKS.map((block) => (
              <article key={block.title} className="panel-card p-5">
                <h2 className="text-xl font-bold text-app">{block.title}</h2>
                <div className="mt-4 space-y-2">
                  {block.points.map((point) => (
                    <p key={point} className="flex items-center gap-2 text-sm text-app-base">
                      <BadgeCheck className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                      {point}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          {CORE_PROMISES.map((item) => (
            <article key={item.title} className="panel-card p-5">
              <div
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{
                  background: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent-blue) 24%, transparent)',
                }}
              >
                <BadgeCheck className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 className="text-lg font-semibold text-app">{item.title}</h3>
              <p className="mt-2 text-sm text-app-soft">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="py-8">
          <div className="panel-card rounded-[16px] p-6">
            <h2 className="text-2xl font-bold text-app">O que você deve perceber nos primeiros 30 dias</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {RESULTS_30_DAYS.map((item) => (
                <article key={item.title} className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-base font-semibold text-app">{item.title}</p>
                  <p className="mt-1 text-sm text-app-soft">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="py-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-app">Escolha a operação certa para o seu momento</h2>
            <p className="mt-1 text-sm text-app-soft">
              Planos desenhados para diferença operacional real, não só para tabela de preço.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PLAN_BLOCKS.map((plan) => (
              <article
                key={plan.name}
                className="panel-card relative overflow-hidden p-5"
                style={
                  plan.featured
                    ? {
                        borderColor: 'color-mix(in oklab, var(--accent-blue) 46%, transparent)',
                        boxShadow: '0 14px 34px color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                      }
                    : {}
                }
              >
                {plan.featured && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                    style={{
                      background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    Mais escolhido
                  </span>
                )}

                <p className="text-sm font-semibold text-app-soft">{plan.name}</p>
                <p className="mt-2 text-3xl font-black text-app">{plan.price}</p>
                <p className="text-xs text-app-soft">por mês</p>
                <p className="mt-3 text-sm text-app-base">{plan.subtitle}</p>
                <p className="mt-1 text-xs text-app-soft">{plan.audience}</p>

                <div className="mt-4 space-y-2">
                  {plan.items.map((feature) => (
                    <p key={feature} className="flex items-center gap-2 text-sm text-app">
                      <BadgeCheck className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                      {feature}
                    </p>
                  ))}
                </div>

                <Link
                  href="/cadastro"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white"
                  style={{
                    background: plan.featured
                      ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                      : 'linear-gradient(135deg, #334155, #1e293b)',
                  }}
                >
                  Escolher {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="panel-card rounded-[16px] p-6">
            <h2 className="text-2xl font-bold text-app">Quer ajuda para escolher o plano ideal?</h2>
            <p className="mt-2 text-sm text-app-soft">
              Nosso time te ajuda a entrar rápido no ar, com a configuração mais aderente ao seu momento.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Falar com comercial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/suporte"
                className="theme-outline-button inline-flex h-11 items-center rounded-[11px] px-5 text-sm font-medium"
              >
                Ver suporte
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="panel-card rounded-[16px] p-6">
            <h2 className="text-2xl font-bold text-app">Perguntas que travam a decisão</h2>
            <div className="mt-5 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <article key={item.q} className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-sm font-semibold text-app">{item.q}</p>
                  <p className="mt-1 text-sm text-app-soft">{item.a}</p>
                </article>
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
              Seu financeiro pode virar vantagem competitiva nos próximos 7 dias
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-app-base md:text-base">
              Ative agora. Quanto mais você adia, mais dinheiro invisível continua saindo sem controle.
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-app-soft">
              Trial de 7 dias, sem fidelidade e com cancelamento simples.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                Começar meu trial agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#planos"
                className="theme-outline-button inline-flex h-11 items-center rounded-[11px] px-5 text-sm font-medium"
              >
                Ver detalhes dos planos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t px-4 py-7 md:px-6" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-app">SAOOZ</p>
            <p className="text-xs text-app-soft">Sistema financeiro premium com IA para PF e PJ.</p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs text-app-soft">
              <a
                href="https://instagram.com/saoozia"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-app"
              >
                Instagram: @SAOOZIA
              </a>
              <a
                href="mailto:suporte@saooz.com"
                className="transition-colors hover:text-app"
              >
                suporte@saooz.com
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/contato" className="text-app-base transition-colors hover:text-app">
              Contato
            </Link>
            <Link href="/suporte" className="text-app-base transition-colors hover:text-app">
              Suporte
            </Link>
            <Link href="/login" className="text-app-base transition-colors hover:text-app">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color: 'var(--accent-blue)' }}
            >
              Testar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
