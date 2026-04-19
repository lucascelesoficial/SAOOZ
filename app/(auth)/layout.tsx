import type { Metadata } from 'next'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
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
    <div className="min-h-screen flex bg-white">

      {/* ── Left panel — branding ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[56%] relative flex-col justify-center items-center p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1E3A8A 0%, #1D4ED8 45%, #2563EB 100%)',
        }}
      >
        {/* Subtle overlay shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, #ffffff08 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, #ffffff06 0%, transparent 65%)' }}
          />
          {/* Subtle dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* ── HERO: wordmark ── */}
        <div className="relative flex flex-col items-center text-center gap-5 mb-14">
          <SaoozWordmark size="xl" />
          <p className="text-base text-blue-100 font-medium max-w-xs leading-relaxed">
            CENTRO DA SUA VIDA FINANCEIRA
          </p>
        </div>

        {/* ── Features ── */}
        <ul className="relative space-y-3 w-full max-w-xs">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.20)',
                }}
              >
                <Icon className="h-4 w-4 text-white" aria-hidden />
              </span>
              <span className="text-sm text-blue-100">{text}</span>
            </li>
          ))}
        </ul>

        {/* Bottom tag */}
        <p className="absolute bottom-8 text-xs text-blue-200/50 font-mono tracking-widest">
          SAOOZ · NÚCLEO FINANCEIRO PESSOAL
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen bg-white"
      >
        {/* Mobile: wordmark centered */}
        <div className="lg:hidden flex flex-col items-center mb-10 gap-2">
          <SaoozWordmark size="md" />
          <p className="text-xs text-slate-400 tracking-wide">CENTRO DA SUA VIDA FINANCEIRA</p>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  )
}
