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
          z-index: 1;
        }
        .al-left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 32px 24px;
        }
        .al-left-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }
        .al-left-foot {
          padding: 0 32px 28px;
        }

        /* ─── RIGHT: dark visual panel ─── */
        .al-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 56%;
          min-height: 100svh;
          overflow: hidden;
          background: #000000;
        }

        /* ─── Top accent line ─── */
        .al-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(34,197,94,0.4) 20%,
            #22c55e 50%,
            rgba(34,197,94,0.4) 80%,
            transparent 100%
          );
          z-index: 10;
        }

        /* ─── Banner image (mascot + car) ─── */
        .al-banner {
          position: absolute;
          bottom: 0;
          left: -5%;
          width: 110%;
          z-index: 2;
          display: block;
          pointer-events: none;
          /* Fade the top of the image into the background */
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 20%);
        }

        /* ─── Overlay gradients ─── */
        .al-grad-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.95) 0%,
            rgba(0,0,0,0.75) 45%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }
        .al-grad-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 30%;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.98) 0%,
            rgba(0,0,0,0.85) 40%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        /* ─── Top content ─── */
        .al-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 40px 52px 0;
          z-index: 5;
        }

        /* ─── Bottom badges ─── */
        .al-badges {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 48px 36px;
          z-index: 5;
          display: flex;
          gap: 10px;
        }
        .al-badge {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .al-badge-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 1024px) {
          .al-right     { display: block; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 64px 64px 32px; }
          .al-left-inner { margin: 0; }
          .al-left-foot { padding: 0 64px 40px; }
        }
        @media (min-width: 1280px) {
          .al-right     { width: 56%; }
          .al-left      { width: 44%; }
          .al-left-body { padding: 72px 80px 32px; }
          .al-left-foot { padding: 0 80px 44px; }
          .al-top       { padding: 44px 60px 0; }
          .al-badges    { padding: 0 52px 40px; }
        }
        @media (min-width: 1440px) {
          .al-left-body { padding: 80px 96px 32px; }
          .al-left-foot { padding: 0 96px 48px; }
          .al-top       { padding: 48px 64px 0; }
          .al-badges    { padding: 0 56px 44px; }
        }
      `}</style>

      <div className="al-root">

        {/* ── LEFT ── */}
        <div className="al-left">
          <div className="al-left-body">
            <div className="al-left-inner">

              {/* Logo */}
              <div style={{ marginBottom: 48 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pearfy-logo.svg"
                  alt="PearFy"
                  style={{ height: 30, width: 'auto', display: 'block' }}
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
          <div className="al-accent" />

          {/* Banner: mascot + car fills the bottom of the panel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pear-banner.svg"
            alt=""
            aria-hidden
            className="al-banner"
          />

          <div className="al-grad-top" />
          <div className="al-grad-bottom" />

          {/* Top content: logo + headline */}
          <div className="al-top">

            {/* Logo pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999,
              padding: '6px 14px 6px 8px',
              marginBottom: 36,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pearfy-logo.svg"
                alt=""
                aria-hidden
                style={{
                  height: 22,
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.9,
                }}
              />
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: 'clamp(28px, 2.6vw, 42px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: 16,
            }}>
              <span style={{ color: '#ffffff', display: 'block' }}>UNIFIQUE PF E PJ</span>
              <span style={{ color: '#22c55e', display: 'block' }}>EM UM SÓ LUGAR</span>
            </h2>

            <p style={{
              fontSize: 'clamp(13px, 1.1vw, 15px)',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.65,
              maxWidth: 360,
            }}>
              Controle suas finanças pessoais e empresariais com{' '}
              <span style={{ color: '#22c55e', fontWeight: 600 }}>inteligência</span>,{' '}
              <span style={{ color: '#22c55e', fontWeight: 600 }}>clareza</span> e{' '}
              <span style={{ color: '#22c55e', fontWeight: 600 }}>velocidade</span>.
            </p>

          </div>

          {/* Bottom badges */}
          <div className="al-badges">

            {/* Controle Total */}
            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="9" rx="1.5" fill="#22c55e" opacity=".9"/>
                  <rect x="14" y="3" width="7" height="5" rx="1.5" fill="#22c55e" opacity=".5"/>
                  <rect x="14" y="12" width="7" height="9" rx="1.5" fill="#22c55e" opacity=".7"/>
                  <rect x="3" y="16" width="7" height="5" rx="1.5" fill="#22c55e" opacity=".5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Controle Total</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.40)', lineHeight: 1.4 }}>Visão completa das finanças PF e PJ</p>
              </div>
            </div>

            {/* Segurança */}
            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L4 6.5V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V6.5L12 3Z" fill="#22c55e" opacity=".8"/>
                  <path d="M9 12L11 14L15 10" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Segurança</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.40)', lineHeight: 1.4 }}>Dados protegidos com criptografia</p>
              </div>
            </div>

            {/* Inteligência Financeira */}
            <div className="al-badge">
              <div className="al-badge-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="1.5" opacity=".6"/>
                  <path d="M8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 13.6 15.1 15 13.7 15.7" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="2.5" fill="#22c55e" opacity=".9"/>
                  <path d="M15 9L17 7M9 15L7 17" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>Inteligência Financeira</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.40)', lineHeight: 1.4 }}>Insights para decisões melhores</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  )
}
