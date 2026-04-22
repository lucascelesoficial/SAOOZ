import type { Metadata } from 'next'
import Image from 'next/image'
import { LineChart, Shield, Sparkles, Wallet } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'Pear Finance',
    template: 'Pear Finance | %s',
  },
  description: 'Finanças inteligentes para um futuro mais brilhante.',
}

const FEATURES = [
  { icon: Wallet, text: 'Controle suas finanças PF e PJ no mesmo painel' },
  { icon: LineChart, text: 'Visualize tendências e evolução do seu caixa' },
  { icon: Shield, text: 'Segurança de nível bancário para seus dados' },
  { icon: Sparkles, text: 'IA financeira para decisões rápidas e claras' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="force-light flex min-h-screen bg-white">
      <div
        className="relative hidden overflow-hidden p-12 lg:flex lg:w-[52%] lg:flex-col lg:items-center lg:justify-center xl:w-[56%]"
        style={{ background: 'linear-gradient(155deg, #1C3B22 0%, #3D7634 45%, #74A93D 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-36 -right-20 h-[420px] w-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(217,249,157,0.28) 0%, rgba(217,249,157,0) 68%)' }}
          />
          <div
            className="absolute -bottom-36 -left-20 h-[420px] w-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(91,150,55,0.34) 0%, rgba(91,150,55,0) 72%)' }}
          />
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <pattern id="pear-grid-auth" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pear-grid-auth)" />
          </svg>
        </div>

        <div className="relative mb-12 flex flex-col items-center gap-5 text-center">
          <div
            className="inline-flex overflow-hidden rounded-[24px]"
            style={{ boxShadow: '0 10px 36px rgba(3, 8, 18, 0.55), 0 0 0 1px rgba(255,255,255,0.16)' }}
          >
            <Image
              src="/pear-finance-logo.svg"
              alt="Logotipo da Pear Finance"
              width={88}
              height={88}
              priority
              style={{ display: 'block', height: 88, width: 88, objectFit: 'contain' }}
            />
          </div>

          <div>
            <p className="text-3xl font-extrabold tracking-tight">
              <span style={{ color: '#85BD4A' }}>Pear </span>
              <span style={{ color: '#FFFFFF' }}>Finance</span>
            </p>
            <p className="mt-1.5 text-sm font-medium uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.76)' }}>
              Finanças inteligentes para um futuro mais brilhante
            </p>
          </div>
        </div>

        <ul className="relative w-full max-w-sm space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                style={{
                  background: 'rgba(133,189,74,0.16)',
                  border: '1px solid rgba(133,189,74,0.32)',
                }}
              >
                <Icon className="h-4 w-4" style={{ color: '#D9F99D' }} aria-hidden />
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
                {text}
              </span>
            </li>
          ))}
        </ul>

        <p className="absolute bottom-8 text-xs tracking-[0.24em]" style={{ color: 'rgba(255,255,255,0.42)' }}>
          PEAR FINANCE · SISTEMA FINANCEIRO INTELIGENTE
        </p>
      </div>

      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="mb-10 flex flex-col items-center gap-3 lg:hidden">
          <div
            className="inline-flex overflow-hidden rounded-[16px]"
            style={{ boxShadow: '0 4px 14px rgba(2, 6, 23, 0.14), 0 0 0 1px rgba(15, 23, 42, 0.06)' }}
          >
            <Image
              src="/pear-finance-logo.svg"
              alt="Logotipo da Pear Finance"
              width={52}
              height={52}
              priority
              style={{ display: 'block', height: 52, width: 52, objectFit: 'contain' }}
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold tracking-tight">
              <span style={{ color: '#74A93D' }}>Pear </span>
              <span className="text-slate-900">Finance</span>
            </p>
            <p className="mt-0.5 text-xs tracking-wide text-slate-500">Finanças inteligentes para um futuro mais brilhante</p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
