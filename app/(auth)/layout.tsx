import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'PearFy',
    template: 'PearFy | %s',
  },
  description: 'Gestão financeira pessoal e empresarial com inteligência artificial.',
}

const G    = '#026648'
const GLit = '#04a372'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>

      {/* ── LEFT — Banner image ── */}
      <div
        className="auth-banner"
        style={{
          position: 'relative',
          width: '52%',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner-login.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        {/* Subtle left-edge vignette to blend into dark form side */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0,
            width: 80,
            background: 'linear-gradient(to right, transparent, #000)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── RIGHT — Dark form panel ── */}
      <div
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px 32px',
          position: 'relative',
          overflow: 'hidden',
          /* grid bg */
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
          backgroundColor: '#000',
        }}
      >
        {/* Ambient green glow — top-right */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-12%', right: '-8%',
            width: 560, height: 560,
            background: `radial-gradient(ellipse, ${G}18, transparent 65%)`,
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient green glow — bottom-left */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-10%', left: '-6%',
            width: 400, height: 400,
            background: `radial-gradient(ellipse, ${G}0e, transparent 65%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo above form */}
        <div style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pearfy-wordmark.svg"
            alt="PearFy"
            style={{ height: 38, width: 'auto', display: 'block' }}
          />
        </div>

        {/* Form card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 420,
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 22,
            padding: '44px 40px',
            boxShadow: [
              '0 32px 80px rgba(0,0,0,0.85)',
              `0 0 0 1px rgba(2,102,72,0.10)`,
              'inset 0 1px 0 rgba(255,255,255,0.06)',
            ].join(', '),
          }}
        >
          {children}
        </div>

        {/* Bottom wordmark */}
        <p
          style={{
            position: 'absolute',
            bottom: 28,
            fontSize: 11,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 500,
          }}
        >
          PearFy · Finanças com inteligência
        </p>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-banner { display: block !important; }
        }
      `}</style>
    </div>
  )
}
