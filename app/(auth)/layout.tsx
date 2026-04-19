import type { Metadata } from 'next'
import Image from 'next/image'
import { Shield, TrendingUp, BarChart2, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'SAOOZ',
    template: 'SAOOZ | %s',
  },
  description: 'Entenda para onde vai seu dinheiro em menos de 5 segundos.',
}

const FEATURES = [
  { icon: TrendingUp, text: 'Acompanhe renda e gastos em tempo real' },
  { icon: BarChart2,  text: 'Visualize seu ritmo financeiro com gráficos' },
  { icon: Shield,     text: 'Dados protegidos com criptografia de ponta' },
  { icon: Zap,        text: 'Insights automáticos sobre seus hábitos' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    /* force-light garante branco mesmo se usuário estiver em dark mode */
    <div className="force-light min-h-screen flex bg-white">

      {/* ── Painel esquerdo — branding ────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[56%] relative flex-col justify-center items-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)' }}
      >
        {/* Pontos brancos sutis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)' }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-auth" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.10" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-auth)" />
          </svg>
        </div>

        {/* ── Hero: logo em destaque ── */}
        <div className="relative flex flex-col items-center text-center gap-5 mb-12">
          <div style={{
            borderRadius: 24,
            background: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.15)',
            overflow: 'hidden',
            display: 'inline-flex',
          }}>
            <Image
              src="/saooz-logo.svg"
              alt="SAOOZ"
              width={88}
              height={88}
              priority
              style={{ width: 88, height: 88, objectFit: 'contain', display: 'block' }}
            />
          </div>

          <div>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: '#ffffff', letterSpacing: '0.06em' }}>
              SAOOZ
            </p>
            <p className="mt-1.5 text-sm font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Centro da sua vida financeira
            </p>
          </div>
        </div>

        {/* ── Features ── */}
        <ul className="relative space-y-3 w-full max-w-xs">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Icon className="h-4 w-4" style={{ color: '#ffffff' }} aria-hidden />
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
            </li>
          ))}
        </ul>

        {/* Rodapé */}
        <p className="absolute bottom-8 text-xs font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>
          SAOOZ · SEU SISTEMA FINANCEIRO
        </p>
      </div>

      {/* ── Painel direito — formulário ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen bg-white">
        {/* Mobile: logo + nome */}
        <div className="lg:hidden flex flex-col items-center mb-10 gap-3">
          <div style={{
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            display: 'inline-flex',
          }}>
            <Image
              src="/saooz-logo.svg"
              alt="SAOOZ"
              width={52}
              height={52}
              priority
              style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-slate-900 tracking-tight" style={{ letterSpacing: '0.05em' }}>
              SAOOZ
            </p>
            <p className="text-xs text-slate-400 tracking-wide mt-0.5">Centro da sua vida financeira</p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  )
}
