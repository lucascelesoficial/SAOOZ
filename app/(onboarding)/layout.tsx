import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    default: 'Pearfy',
    template: 'Pearfy | %s',
  },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="force-light min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#F2F7F5' }}
    >
      {/* Subtle green dot grid */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #02664818 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Logo */}
      <div className="mb-8 relative z-10 flex items-center gap-3">
        <div style={{
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(2,102,72,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'inline-flex',
          flexShrink: 0,
        }}>
          <Image
            src="/favicon.svg"
            alt="Pearfy"
            width={52}
            height={52}
            priority
            style={{ width: 52, height: 52, display: 'block' }}
          />
        </div>
        <span style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#026648',
          lineHeight: 1,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        }}>
          Pearfy
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}
