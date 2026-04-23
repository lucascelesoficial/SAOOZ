import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'PearFy', template: 'PearFy | %s' },
  description: 'Gestão financeira pessoal e empresarial com inteligência artificial.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .auth-root {
          display: flex;
          min-height: 100svh;
          background: #000;
          font-family: var(--font-inter), -apple-system, sans-serif;
        }

        /* ─── Form side ─── */
        .auth-left {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100svh;
          padding: 64px 40px;
          overflow: hidden;
          background: #000;
        }
        /* Faint dot grid */
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        /* Ambient green bottom-right */
        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -10%; right: -8%;
          width: 480px; height: 480px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.14) 0%, transparent 65%);
          filter: blur(48px);
          pointer-events: none;
        }

        .auth-left-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
        }

        /* ─── Visual side ─── */
        .auth-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 56%;
          overflow: hidden;
          background: #040808;
          align-items: center;
          justify-content: center;
        }
        /* Top ambient glow */
        .auth-right::before {
          content: '';
          position: absolute;
          top: -15%; left: 5%;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.11) 0%, transparent 65%);
          filter: blur(56px);
          pointer-events: none;
        }
        /* Bottom ambient */
        .auth-right::after {
          content: '';
          position: absolute;
          bottom: -10%; right: -5%;
          width: 440px; height: 440px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.08) 0%, transparent 65%);
          filter: blur(44px);
          pointer-events: none;
        }
        /* Fade edge on left, melting into form side */
        .auth-right-fade {
          position: absolute;
          inset-block: 0;
          left: 0;
          width: 100px;
          background: linear-gradient(to right, #000 0%, transparent 100%);
          z-index: 5;
          pointer-events: none;
        }
        .auth-right-body {
          position: relative;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 72px 64px 72px 96px;
          gap: 40px;
        }
        .auth-visual-img {
          width: 100%;
          max-width: 500px;
          max-height: 65vh;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.65));
        }
        .auth-visual-text {
          text-align: center;
          max-width: 360px;
        }

        @media (min-width: 1024px) {
          .auth-right { display: flex; }
          .auth-left  { width: 44%; }
        }
        @media (min-width: 1280px) {
          .auth-right { width: 58%; }
          .auth-left  { width: 42%; }
        }
      `}</style>

      <div className="auth-root">

        {/* LEFT — Form */}
        <div className="auth-left">
          <div className="auth-left-inner">

            {/* Logo — mix-blend-mode:screen removes black bg from SVG */}
            <div style={{ marginBottom: 52, display: 'flex', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pearfy-wordmark.svg"
                alt="PearFy"
                style={{
                  height: 32,
                  width: 'auto',
                  display: 'block',
                  mixBlendMode: 'screen',
                  opacity: 0.92,
                }}
              />
            </div>

            {children}

            <p style={{
              marginTop: 48,
              textAlign: 'center',
              fontSize: 12,
              color: 'rgba(255,255,255,0.16)',
              letterSpacing: '0.06em',
            }}>
              © 2026 PearFy
            </p>
          </div>
        </div>

        {/* RIGHT — Visual */}
        <div className="auth-right">
          <div className="auth-right-fade" />
          <div className="auth-right-body">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/login-visual.svg"
              alt=""
              aria-hidden
              className="auth-visual-img"
            />
            <div className="auth-visual-text">
              <p style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.3,
                margin: '0 0 10px',
              }}>
                A primeira plataforma do Brasil<br />
                <em style={{ fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>
                  a colocar PF e PJ sob o mesmo comando.
                </em>
              </p>
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.04em',
                margin: 0,
              }}>
                🇧🇷 &nbsp;Nº 1 do Brasil · Gestão financeira com IA
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
