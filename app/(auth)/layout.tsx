import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'PearFy', template: 'PearFy | %s' },
  description: 'Gestão financeira pessoal e empresarial com inteligência artificial.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .auth-root {
          display: flex;
          min-height: 100vh;
          background: #000;
        }

        /* ── Left: form column ── */
        .auth-form-col {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 56px 32px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .auth-form-col::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
        }
        .auth-form-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Right: visual panel ── */
        .auth-visual-col {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 54%;
          overflow: hidden;
          background: #040606;
        }
        .auth-visual-col::before {
          content: '';
          position: absolute;
          top: -20%; right: -10%;
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.13) 0%, transparent 65%);
          filter: blur(40px);
          pointer-events: none;
        }
        .auth-visual-col::after {
          content: '';
          position: absolute;
          bottom: -15%; left: -5%;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(2,102,72,0.08) 0%, transparent 65%);
          filter: blur(50px);
          pointer-events: none;
        }
        /* Left-edge fade so it blends cleanly into the form column */
        .auth-visual-fade {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 120px;
          background: linear-gradient(to right, #000, transparent);
          z-index: 2;
          pointer-events: none;
        }
        .auth-visual-body {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 64px 56px 64px 80px;
          gap: 36px;
        }
        .auth-banner-img {
          width: 100%;
          max-width: 480px;
          max-height: 60vh;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 32px 64px rgba(0,0,0,0.70));
        }
        .auth-visual-quote {
          text-align: center;
          max-width: 380px;
        }

        @media (min-width: 1024px) {
          .auth-visual-col { display: flex; flex-direction: column; }
          .auth-form-col { width: 46%; }
        }
        @media (min-width: 1280px) {
          .auth-visual-col { width: 56%; }
          .auth-form-col { width: 44%; }
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT: Form ── */}
        <div className="auth-form-col">
          {/* Green glow behind form */}
          <div aria-hidden style={{
            position: 'absolute', bottom: '-5%', right: '-5%',
            width: 380, height: 380,
            background: 'radial-gradient(ellipse, rgba(2,102,72,0.10) 0%, transparent 65%)',
            filter: 'blur(36px)', pointerEvents: 'none',
          }} />

          <div className="auth-form-inner">
            {/* Logo */}
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pearfy-wordmark.svg"
                alt="PearFy"
                style={{ height: 34, width: 'auto', display: 'block' }}
              />
            </div>

            {/* Page content (form) */}
            {children}

            {/* Footer */}
            <p style={{
              marginTop: 40,
              textAlign: 'center',
              fontSize: 12,
              color: 'rgba(255,255,255,0.20)',
              letterSpacing: '0.08em',
            }}>
              © 2026 PearFy · Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* ── RIGHT: Visual ── */}
        <div className="auth-visual-col">
          <div className="auth-visual-fade" />
          <div className="auth-visual-body">
            {/* Banner as contained illustration */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banner-login.svg"
              alt=""
              aria-hidden
              className="auth-banner-img"
            />

            {/* Brand statement */}
            <div className="auth-visual-quote">
              <p style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.025em',
                lineHeight: 1.35,
                margin: '0 0 10px',
              }}>
                Controle total.<br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.50)' }}>
                  PF e PJ no mesmo lugar.
                </span>
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.06em', margin: 0 }}>
                Nº 1 do Brasil em gestão financeira com IA
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
