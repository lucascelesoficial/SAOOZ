import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    default: 'SAOOZ',
    template: 'SAOOZ | %s',
  },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="force-light min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#F8FAFC' }}
    >
      {/* Grid de pontos azuis sutis */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #2563EB18 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Logo */}
      <div className="mb-10 relative z-10 flex flex-col items-center gap-3">
        <div style={{
          borderRadius: 18,
          boxShadow: '0 2px 12px rgba(37,99,235,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'inline-flex',
        }}>
          <Image
            src="/saooz-logo.svg"
            alt="SAOOZ"
            width={56}
            height={56}
            priority
            style={{ width: 56, height: 56, objectFit: 'contain', display: 'block' }}
          />
        </div>
        <p className="text-lg font-extrabold text-slate-900 tracking-tight" style={{ letterSpacing: '0.05em' }}>
          SAOOZ
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}
