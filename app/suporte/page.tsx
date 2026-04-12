import Link from 'next/link'
import { ArrowRight, CircleHelp, Headset, LifeBuoy, Mail } from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'

export const metadata = {
  title: 'Suporte | SAOOZ',
  description: 'Centro de suporte SAOOZ para ativacao, cobranca e uso da plataforma.',
}

const SUPPORT_TOPICS = [
  {
    title: 'Acesso e conta',
    description: 'Problemas de login, troca de senha e configuracoes de perfil.',
  },
  {
    title: 'Planos e cobranca',
    description: 'Duvidas sobre assinatura, ciclo e status de pagamento.',
  },
  {
    title: 'Dados financeiros',
    description: 'Ajuda para registros PF/PJ, categorias e visualizacao no painel.',
  },
]

const QUICK_GUIDES = [
  'Confirme se seu plano está ativo em Configurações → Planos.',
  'Verifique o mês selecionado no topo da tela antes de registrar dados.',
  'Se o pagamento foi confirmado mas o plano não ativou, aguarde alguns minutos e recarregue a página.',
]

export default function SuportePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-app">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(920px 500px at 85% -10%, color-mix(in oklab, var(--accent-cyan) 18%, transparent), transparent 65%)',
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 md:px-6">
        <SaoozWordmark size="sm" />
        <div className="flex items-center gap-2">
          <Link href="/oferta" className="theme-outline-button inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium">
            Voltar
          </Link>
          <Link
            href="/contato"
            className="inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            Falar com time
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 md:px-6">
        <section className="panel-card rounded-[16px] p-6 md:p-7">
          <h1 className="text-3xl font-black text-app md:text-4xl">Suporte</h1>
          <p className="mt-2 max-w-3xl text-sm text-app-base md:text-base">
            Ajuda tecnica e operacional para manter sua rotina financeira funcionando com
            estabilidade.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {SUPPORT_TOPICS.map((topic) => (
            <article key={topic.title} className="panel-card p-5">
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
                style={{
                  background: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent-blue) 24%, transparent)',
                }}
              >
                <CircleHelp className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h2 className="text-lg font-semibold text-app">{topic.title}</h2>
              <p className="mt-2 text-sm text-app-soft">{topic.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="panel-card p-5">
            <h2 className="text-lg font-semibold text-app">Guia rapido antes de abrir chamado</h2>
            <div className="mt-3 space-y-2">
              {QUICK_GUIDES.map((item) => (
                <p key={item} className="panel-card-soft rounded-[10px] px-3 py-2 text-sm text-app-base">
                  {item}
                </p>
              ))}
            </div>
          </article>

          <article className="panel-card p-5">
            <h2 className="text-lg font-semibold text-app">Canal oficial</h2>
            <p className="mt-2 text-sm text-app-soft">
              Para resolver mais rapido, envie contexto, prints e horario do ocorrido.
            </p>

            <div className="mt-4 space-y-2">
              <a
                href="mailto:suporte@saooz.com"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--accent-blue)' }}
              >
                <Mail className="h-4 w-4" />
                suporte@saooz.com
              </a>
              <p className="inline-flex items-center gap-2 text-sm text-app-soft">
                <Headset className="h-4 w-4" />
                SLA inicial: ate 24h uteis
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-app-soft">
                <LifeBuoy className="h-4 w-4" />
                Incidentes criticos com prioridade
              </p>
            </div>

            <Link
              href="/cadastro"
              className="mt-5 inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              Ativar conta agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </section>
      </main>
    </div>
  )
}
