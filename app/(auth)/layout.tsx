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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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

        /* Subtle radial glow behind the car */
        .al-right::before {
          content: '';
          position: absolute;
          bottom: -10%;
          left: -5%;
          width: 110%;
          height: 70%;
          background: radial-gradient(
            ellipse at 40% 80%,
            rgba(34,197,94,0.10) 0%,
            rgba(22,163,74,0.05) 35%,
            transparent 65%
          );
          z-index: 1;
          pointer-events: none;
        }

        /* ─── Top accent line ─── */
        .al-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(34,197,94,0.5) 20%,
            #22c55e 50%,
            rgba(34,197,94,0.5) 80%,
            transparent 100%
          );
          z-index: 10;
        }

        /* ─── Lamborghini + mascot image ─── */
        .al-car {
          position: absolute;
          bottom: 80px;
          left: -8%;
          width: 116%;
          z-index: 3;
          display: block;
          pointer-events: none;
          /* Dissolve top edge into background */
          -webkit-mask-image: linear-gradient(to bottom,
            transparent 0%,
            rgba(0,0,0,0.3) 8%,
            black 18%
          );
          mask-image: linear-gradient(to bottom,
            transparent 0%,
            rgba(0,0,0,0.3) 8%,
            black 18%
          );
        }

        /* ─── Gradient overlays ─── */
        .al-grad-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60%;
          background: linear-gradient(
            to bottom,
            #060d07 0%,
            rgba(6,13,7,0.92) 30%,
            rgba(6,13,7,0.60) 55%,
            transparent 100%
          );
          z-index: 4;
          pointer-events: none;
        }
        .al-grad-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 22%;
          background: linear-gradient(
            to top,
            #060d07 0%,
            rgba(6,13,7,0.90) 50%,
            transparent 100%
          );
          z-index: 4;
          pointer-events: none;
        }

        /* ─── Top content ─── */
        .al-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 40px 48px 0;
          z-index: 6;
        }

        /* ─── Bottom badges ─── */
        .al-badges {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 44px 32px;
          z-index: 6;
          display: flex;
          gap: 8px;
        }
        .al-badge {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 11px 13px;
        }
        .al-badge-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(34,197,94,0.14);
          border: 1px solid rgba(34,197,94,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 1024px) {
          .al-right     { display: block; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 64px 60px 32px; }
          .al-left-inner { margin: 0; }
          .al-left-foot { padding: 0 60px 40px; }
        }
        @media (min-width: 1280px) {
          .al-right     { width: 56%; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 72px 72px 32px; }
          .al-left-foot { padding: 0 72px 44px; }
          .al-top       { padding: 44px 56px 0; }
          .al-badges    { padding: 0 48px 36px; }
          .al-car       { bottom: 90px; }
        }
        @media (min-width: 1440px) {
          .al-left-body { padding: 80px 88px 32px; }
          .al-left-foot { padding: 0 88px 48px; }
          .al-top       { padding: 48px 60px 0; }
          .al-badges    { padding: 0 52px 40px; }
          .al-car       { bottom: 100px; }
        }
      `}</style>

      <div className="al-root">

        {/* ── LEFT ── */}
        <div className="al-left">
          <div className="al-left-body">
            <div className="al-left-inner">

              {/* Logo — full green logo */}
              <div style={{ marginBottom: 44 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pearfy-logo-full.png"
                  alt="PearFy"
                  style={{ height: 36, width: 'auto', display: 'block' }}
                />
              </div>

              {children}

            </div>
          </div>

          <div className="al-left-foot">
            <p style={{
              fontSize: 12,
              color: '#94a3b8',
              textAlign: 'center',
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}>
              © 2026 PearFy · Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="al-right">
          <div className="al-accent" />

          {/* Lamborghini + mascot */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lamborghini-mascot.png"
            alt=""
            aria-hidden
            className="al-car"
          />

          <div className="al-grad-top" />
          <div className="al-grad-bottom" />

          {/* Top: logo pill + headline */}
          <div className="al-top">

            {/* Logo pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pearfy-logo-full.png"
                alt="PearFy"
                style={{ height: 28, width: 'auto' }}
              />
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 'clamp(30px, 2.8vw, 46px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: 18,
            }}>
              <span style={{ color: '#ffffff', display: 'block' }}>UNIFIQUE PF E PJ</span>
              <span style={{ color: '#22c55e', display: 'block' }}>EM UM SÓ LUGAR</span>
            </h2>

            <p style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 'clamp(13px, 1.0vw, 15px)',
              color: 'rgba(255,255,255,0.50)',
              lineHeight: 1.65,
              maxWidth: 340,
            }}>
              Controle suas finanças pessoais e empresariais com{' '}
              <span style={{ color: '#4ade80', fontWeight: 600 }}>inteligência</span>,{' '}
              <span style={{ color: '#4ade80', fontWeight: 600 }}>clareza</span> e{' '}
              <span style={{ color: '#4ade80', fontWeight: 600 }}>velocidade</span>.
            </p>

          </div>

          {/* Bottom badges */}
          <div className="al-badges">

            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="9" rx="1.5" fill="#22c55e"/>
                  <rect x="14" y="3" width="7" height="5" rx="1.5" fill="#22c55e" opacity=".6"/>
                  <rect x="14" y="12" width="7" height="9" rx="1.5" fill="#22c55e" opacity=".8"/>
                  <rect x="3" y="16" width="7" height="5" rx="1.5" fill="#22c55e" opacity=".5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Controle Total</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.38)', lineHeight: 1.35 }}>Visão completa PF e PJ</p>
              </div>
            </div>

            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L4 6.5V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V6.5L12 3Z" fill="#22c55e" opacity=".85"/>
                  <path d="M9 12L11 14L15 10" stroke="#060d07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Segurança</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.38)', lineHeight: 1.35 }}>Criptografia ponta a ponta</p>
              </div>
            </div>

            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9Z" stroke="#22c55e" strokeWidth="1.5" opacity=".7"/>
                  <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" fill="#22c55e" opacity=".25"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Inteligência IA</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.38)', lineHeight: 1.35 }}>Insights financeiros em tempo real</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  )
}
