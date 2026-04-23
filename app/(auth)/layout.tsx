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

        html, body { height: 100%; }

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
          width: 100%;
          min-height: 100svh;
          background: #ffffff;
        }

        .auth-left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 40px 40px;
        }

        .auth-left-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }

        .auth-left-foot {
          padding: 0 40px 40px;
          max-width: calc(380px + 80px);
          margin: 0 auto;
          width: 100%;
        }

        /* ─── RIGHT: dark visual panel ─── */
        .auth-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 54%;
          min-height: 100svh;
          background: #07100a;
          overflow: hidden;
        }

        /* Gradient layered background */
        .auth-right-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 65% 20%, rgba(2,102,72,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 100% 50% at 50% 95%, rgba(2,102,72,0.18) 0%, transparent 55%),
            linear-gradient(165deg, #0a1a10 0%, #07100a 35%, #040c07 65%, #020705 100%);
          z-index: 0;
        }

        /* Subtle noise grain texture */
        .auth-right-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          z-index: 1;
          pointer-events: none;
        }

        /* Car image */
        .auth-right-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center 58%;
          display: block;
          z-index: 2;
        }

        /* Bottom gradient overlay for text legibility */
        .auth-right-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(to top,
            rgba(4,10,6,0.97) 0%,
            rgba(4,10,6,0.80) 30%,
            rgba(4,10,6,0.40) 60%,
            transparent 100%
          );
          z-index: 3;
        }

        /* Brand content */
        .auth-right-brand {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 56px 52px;
          z-index: 4;
        }

        /* Thin top accent line */
        .auth-right-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(2,102,72,0.7) 40%, rgba(4,163,114,0.9) 55%, rgba(2,102,72,0.7) 70%, transparent 100%);
          z-index: 5;
        }

        @media (min-width: 1024px) {
          .auth-right          { display: block; }
          .auth-left           { width: 46%; }
          .auth-left-body      { padding: 64px 72px 48px; }
          .auth-left-inner     { margin: 0; }
          .auth-left-foot      { padding: 0 72px 48px; margin: 0; max-width: 100%; }
        }
        @media (min-width: 1280px) {
          .auth-right          { width: 56%; }
          .auth-left           { width: 44%; }
          .auth-left-body      { padding: 72px 80px 48px; }
          .auth-left-foot      { padding: 0 80px 52px; }
        }
        @media (min-width: 1440px) {
          .auth-left-body      { padding: 80px 96px 48px; }
          .auth-left-foot      { padding: 0 96px 56px; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT: Form ── */}
        <div className="auth-left">
          <div className="auth-left-body">
            <div className="auth-left-inner">

              {/* Logo */}
              <div style={{ marginBottom: 52 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#0f172a',
                  borderRadius: 9,
                  padding: '7px 15px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pearfy-wordmark.svg"
                    alt="PearFy"
                    style={{ height: 22, width: 'auto', display: 'block' }}
                  />
                </div>
              </div>

              {children}

            </div>
          </div>

          {/* Footer */}
          <div className="auth-left-foot">
            <p style={{
              fontSize: 12,
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              © 2026 PearFy · Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* ── RIGHT: Visual ── */}
        <div className="auth-right">
          <div className="auth-right-accent" />
          <div className="auth-right-bg" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lamborghini-visual.svg"
            alt=""
            aria-hidden
            className="auth-right-img"
          />

          <div className="auth-right-overlay" />

          <div className="auth-right-brand">
            {/* Green accent line */}
            <div style={{
              width: 36,
              height: 2,
              background: 'linear-gradient(90deg, #026648, #04a372)',
              borderRadius: 2,
              marginBottom: 20,
            }} />

            <p style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.35,
              marginBottom: 10,
            }}>
              Sua vida financeira.<br />
              No próximo nível.
            </p>

            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.42)',
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 1.5,
            }}>
              🇧🇷 &nbsp;Gestão financeira com IA · PF & PJ
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
