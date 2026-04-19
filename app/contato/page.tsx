import Link from 'next/link'
import { ArrowRight, Clock3, Mail, MessageCircle, Phone } from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'

export const metadata = {
  title: 'Contato | SAOOZ',
  description: 'Fale com o time SAOOZ para duvidas comerciais, parceria e implantacao.',
}

const CHANNELS = [
  {
    title: 'Comercial',
    description: 'Duvidas sobre planos, ciclos e melhor configuracao para sua operacao.',
    action: 'mailto:comercial@saooz.com',
    actionLabel: 'comercial@saooz.com',
    icon: Mail,
  },
  {
    title: 'WhatsApp',
    description: 'Atendimento rapido para pre-venda e implantacao.',
    action: 'https://wa.me/5500000000000',
    actionLabel: '+55 (00) 00000-0000',
    icon: MessageCircle,
  },
  {
    title: 'Telefone',
    description: 'Canal direto para contas com onboarding assistido.',
    action: 'tel:+5500000000000',
    actionLabel: '+55 (00) 0000-0000',
    icon: Phone,
  },
]

export default function ContatoPage() {
  return (
    <div className="force-light relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 460px at 10% -10%, color-mix(in oklab, var(--accent-blue) 20%, transparent), transparent 65%)',
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 md:px-6">
        <SaoozWordmark size="sm" />
        <div className="flex items-center gap-2">
          <Link href="/oferta" className="theme-outline-button inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium">
            Voltar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            Testar SAOOZ
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 md:px-6">
        <section className="panel-card rounded-[16px] p-6 md:p-7">
          <h1 className="text-3xl font-black text-app md:text-4xl">Contato</h1>
          <p className="mt-2 max-w-3xl text-sm text-app-base md:text-base">
            Se voce quer acelerar a implantacao do SAOOZ e escolher o plano certo para seu
            contexto, fale com nosso time.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs text-app-soft" style={{ borderColor: 'var(--panel-border)' }}>
            <Clock3 className="h-3.5 w-3.5" style={{ color: 'var(--accent-blue)' }} />
            Atendimento comercial: segunda a sexta, 9h as 18h.
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon

            return (
              <article key={channel.title} className="panel-card p-5">
                <div
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'color-mix(in oklab, var(--accent-blue) 14%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--accent-blue) 24%, transparent)',
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h2 className="text-lg font-semibold text-app">{channel.title}</h2>
                <p className="mt-2 text-sm text-app-soft">{channel.description}</p>
                <a
                  href={channel.action}
                  target={channel.action.startsWith('http') ? '_blank' : undefined}
                  rel={channel.action.startsWith('http') ? 'noreferrer' : undefined}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  {channel.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
