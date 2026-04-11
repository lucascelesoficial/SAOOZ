import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { Shield, TrendingUp, BarChart2, Zap } from 'lucide-react'

const FEATURES = [
  { icon: TrendingUp, text: 'Acompanhe renda e gastos em tempo real' },
  { icon: BarChart2,  text: 'Visualize seu ritmo financeiro com gráficos' },
  { icon: Shield,     text: 'Dados protegidos com criptografia de ponta' },
  { icon: Zap,        text: 'Insights automáticos sobre seus hábitos' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#121212]">

      {/* ── Left panel — branding ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[56%] relative flex-col justify-center items-center p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0B0B0B 0%, #121212 55%, #0B0B0B 100%)',
          borderRight: '1px solid #2A2A2A',
        }}
      >
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Purple glow behind the logo area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, #7c3aed0a 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, #3b82f610 0%, transparent 60%)' }} />
          {/* Corner glows */}
          <div className="absolute -bottom-20 -right-20 w-[350px] h-[350px] rounded-full"
            style={{ background: 'radial-gradient(circle, #3b82f606 0%, transparent 70%)' }} />
          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* ── HERO: wordmark ── */}
        <div className="relative flex flex-col items-center text-center gap-6 mb-14">
          <SaoozWordmark size="xl" />
          <p
            className="text-lg text-[#B3B3B3] font-medium max-w-xs leading-relaxed"
            style={{ textShadow: '0 0 30px #3b82f620' }}
          >
            O núcleo da sua vida financeira.
          </p>
        </div>

        {/* ── Features ── */}
        <ul className="relative space-y-3 w-full max-w-xs">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.18)',
                }}
              >
                <Icon className="h-4 w-4 text-[#3b82f6]" aria-hidden />
              </span>
              <span className="text-sm text-[#B3B3B3]">{text}</span>
            </li>
          ))}
        </ul>

        {/* Bottom tag */}
        <p className="absolute bottom-8 text-xs text-[#383838] font-mono tracking-widest">
          SAOOZ · NÚCLEO FINANCEIRO PESSOAL
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen"
        style={{ background: 'linear-gradient(180deg, #121212 0%, #0B0B0B 100%)' }}
      >
        {/* Mobile: wordmark centered */}
        <div className="lg:hidden flex flex-col items-center mb-10 gap-3">
          <SaoozWordmark size="md" />
          <p className="text-xs text-[#6B6B6B]">O núcleo da sua vida financeira.</p>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  )
}
