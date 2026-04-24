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

        .al-root {
          display: flex;
          min-height: 100svh;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #000;
        }

        /* ─── LEFT: white form panel ─── */
        .al-left {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100svh;
          background: #ffffff;
        }
        .al-left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 36px 24px;
        }
        .al-left-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }
        .al-left-foot {
          padding: 0 36px 28px;
        }

        /* ─── RIGHT: dark visual panel ─── */
        .al-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 56%;
          min-height: 100svh;
          overflow: hidden;
          background: #060d07;
        }
        .al-art {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
          pointer-events: none;
          user-select: none;
        }

        @media (max-width: 480px) {
          .al-left-body { padding: 32px 22px 20px; }
          .al-left-foot { padding: 0 22px 24px; }
          .al-logo-wrap { margin-bottom: 28px !important; }
        }
        @media (min-width: 1024px) {
          .al-right     { display: block; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 64px 48px 32px; }
          .al-left-inner { margin: 0 auto; max-width: 400px; }
          .al-left-foot { padding: 0 48px 40px; }
        }
        @media (min-width: 1280px) {
          .al-right     { width: 56%; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 72px 72px 32px; }
          .al-left-foot { padding: 0 72px 44px; }
        }
        @media (min-width: 1440px) {
          .al-left-body { padding: 80px 88px 32px; }
          .al-left-foot { padding: 0 88px 48px; }
        }
      `}</style>

      <div className="al-root">

        {/* ── LEFT ── */}
        <div className="al-left">
          <div className="al-left-body">
            <div className="al-left-inner">

              {/* Logo — full green logo */}
              <div className="al-logo-wrap" style={{ marginBottom: 44, display: 'flex', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pearfy-logo.svg"
                  alt="PearFy"
                  style={{ height: 52, width: 'auto', display: 'block' }}
                />
              </div>

              {children}

            </div>
          </div>

          <div className="al-left-foot">
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              © 2026 PearFy · Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="al-right">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-art.svg"
            alt="PearFy — Unifique PF e PJ em um só lugar"
            className="al-art"
          />
        </div>

      </div>
    </>
  )
}
