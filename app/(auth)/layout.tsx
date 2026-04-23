import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'PearFy', template: 'PearFy | %s' },
  description: 'Gestão financeira pessoal e empresarial com inteligência artificial.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          display: flex;
          min-height: 100svh;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ─── LEFT: white form panel ─── */
        .auth-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          min-height: 100svh;
          background: #ffffff;
          padding: 56px 48px;
        }

        .auth-left-inner {
          width: 100%;
          max-width: 400px;
          /* center in the panel on desktop, left-align on mobile */
          margin: 0 auto;
        }

        /* ─── RIGHT: dark visual panel ─── */
        .auth-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 55%;
          min-height: 100svh;
          background: #080d10;
          overflow: hidden;
        }

        /* Subtle top-right ambient green glow */
        .auth-right::before {
          content: '';
          position: absolute;
          top: -10%; right: -5%;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.18) 0%, transparent 60%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 1;
        }

        .auth-right-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          z-index: 2;
        }

        /* Bottom brand overlay */
        .auth-right-brand {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 56px 48px;
          z-index: 3;
          background: linear-gradient(to top, rgba(8,13,16,0.92) 0%, transparent 100%);
          padding-top: 80px;
        }

        @media (min-width: 1024px) {
          .auth-right { display: block; }
          .auth-left  { width: 45%; padding: 64px 72px; }
          .auth-left-inner { margin: 0; }
        }
        @media (min-width: 1280px) {
          .auth-right { width: 58%; }
          .auth-left  { width: 42%; padding: 64px 80px; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT: Form ── */}
        <div className="auth-left">
          <div className="auth-left-inner">

            {/* Logo — pill with dark bg so white SVG shows on white panel */}
            <div style={{ marginBottom: 44 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#000',
                borderRadius: 10,
                padding: '7px 14px',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pearfy-wordmark.svg"
                  alt="PearFy"
                  style={{ height: 26, width: 'auto', display: 'block' }}
                />
              </div>
            </div>

            {children}

            <p style={{
              marginTop: 40,
              fontSize: 12,
              color: '#9ca3af',
              textAlign: 'center',
            }}>
              © 2026 PearFy · Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* ── RIGHT: Visual ── */}
        <div className="auth-right">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-visual.svg"
            alt=""
            aria-hidden
            className="auth-right-img"
          />
          <div className="auth-right-brand">
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              🇧🇷 &nbsp;Nº 1 do Brasil · Gestão financeira com IA
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
