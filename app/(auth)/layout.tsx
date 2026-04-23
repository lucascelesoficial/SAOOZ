import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'PearFy', template: 'PearFy | %s' },
  description: 'Gestão financeira pessoal e empresarial com inteligência artificial.',
}

const G    = '#026648'
const GLit = '#04a372'

/* ─── Compact 3-D bar chart ─── */
const BAR_DATA = [
  { h: 32, mo: 'Out' },
  { h: 54, mo: 'Nov' },
  { h: 43, mo: 'Dez' },
  { h: 70, mo: 'Jan' },
  { h: 48, mo: 'Fev' },
  { h: 92, mo: 'Mar' },
  { h: 65, mo: 'Abr' },
]

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
          padding: 56px 40px 32px;
        }
        .al-left-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }
        .al-left-foot {
          padding: 0 40px 40px;
        }

        /* ─── RIGHT: dark visual panel ─── */
        .al-right {
          display: none;
          position: relative;
          flex-shrink: 0;
          width: 56%;
          min-height: 100svh;
          overflow: hidden;
          background: #07100a;
        }

        /* Multi-layer dark gradient background */
        .al-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 90% 55% at 60% 12%, rgba(2,102,72,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 80% 40% at 50% 88%, rgba(2,102,72,0.16) 0%, transparent 58%),
            linear-gradient(168deg, #0b1d12 0%, #07110a 30%, #050d07 60%, #020705 100%);
          z-index: 0;
        }

        /* Subtle grain */
        .al-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
        }

        /* Car + mascot image — fills most of the panel */
        .al-car-img {
          position: absolute;
          top: 0; left: 0; right: 0;
          bottom: 40%;        /* image lives in top 60% */
          object-fit: contain;
          object-position: center bottom;
          width: 100%;
          height: 60%;
          display: block;
          z-index: 2;
        }

        /* Strong gradient fade to make bottom content readable */
        .al-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 65%;
          background: linear-gradient(to top,
            rgba(5,10,7,0.99) 0%,
            rgba(5,10,7,0.96) 20%,
            rgba(5,10,7,0.85) 38%,
            rgba(5,10,7,0.55) 55%,
            transparent 100%
          );
          z-index: 3;
        }

        /* Top accent line */
        .al-accent-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(2,102,72,0.6) 30%,
            rgba(4,163,114,0.95) 50%,
            rgba(2,102,72,0.6) 70%,
            transparent 100%
          );
          z-index: 10;
        }

        /* Content block at bottom */
        .al-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 52px 52px;
          z-index: 4;
        }

        /* 3D chart card */
        .al-chart {
          background: rgba(255,255,255,0.055);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 18px 20px 14px;
          margin-top: 22px;
          transform: perspective(900px) rotateX(3deg);
          box-shadow: 0 24px 64px rgba(0,0,0,0.50);
        }

        @media (min-width: 1024px) {
          .al-right          { display: block; }
          .al-left           { width: 44%; }
          .al-left-body      { padding: 64px 68px 32px; }
          .al-left-inner     { margin: 0; }
          .al-left-foot      { padding: 0 68px 48px; }
        }
        @media (min-width: 1280px) {
          .al-right          { width: 56%; }
          .al-left           { width: 44%; }
          .al-left-body      { padding: 72px 80px 32px; }
          .al-left-foot      { padding: 0 80px 52px; }
        }
        @media (min-width: 1440px) {
          .al-left-body      { padding: 80px 96px 32px; }
          .al-left-foot      { padding: 0 96px 56px; }
          .al-content        { padding: 0 60px 60px; }
        }
      `}</style>

      <div className="al-root">

        {/* ── LEFT ── */}
        <div className="al-left">
          <div className="al-left-body">
            <div className="al-left-inner">

              {/* Logo — B&W version works directly on white */}
              <div style={{ marginBottom: 48 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pearfy-logo-dark.png"
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
          <div className="al-accent-line" />
          <div className="al-bg" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lamborghini-mascot.png"
            alt=""
            aria-hidden
            className="al-car-img"
          />

          <div className="al-fade" />

          <div className="al-content">

            {/* Green accent line */}
            <div style={{
              width: 40,
              height: 2,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${G}, ${GLit})`,
              marginBottom: 18,
            }} />

            {/* Headline */}
            <p style={{
              fontSize: 'clamp(17px, 1.6vw, 22px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1.35,
              maxWidth: 400,
            }}>
              A primeira plataforma do Brasil a unificar
              {' '}<span style={{ color: GLit }}>PF e PJ</span> em um só lugar.
            </p>

            {/* 3D Chart Card */}
            <div className="al-chart">

              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.38)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.10em',
                    marginBottom: 4,
                  }}>
                    Patrimônio total
                  </p>
                  <p style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}>
                    R$&nbsp;47.290
                  </p>
                </div>

                {/* Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(2,102,72,0.22)',
                  border: `1px solid rgba(4,163,114,0.28)`,
                  borderRadius: 20,
                  padding: '4px 10px',
                }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M4.5 1.5L7 4.5H2L4.5 1.5Z" fill={GLit}/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: GLit }}>+18,4%</span>
                </div>
              </div>

              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 58 }}>
                {BAR_DATA.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%',
                      height: `${b.h}%`,
                      borderRadius: '4px 4px 2px 2px',
                      background: i === 5
                        ? `linear-gradient(180deg, ${GLit} 0%, ${G} 100%)`
                        : 'rgba(255,255,255,0.11)',
                      boxShadow: i === 5 ? `0 0 14px rgba(4,163,114,0.45)` : 'none',
                    }} />
                  </div>
                ))}
              </div>

              {/* Month labels */}
              <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                {BAR_DATA.map((b, i) => (
                  <div key={i} style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 9,
                    fontWeight: i === 5 ? 700 : 400,
                    color: i === 5 ? GLit : 'rgba(255,255,255,0.28)',
                  }}>
                    {b.mo}
                  </div>
                ))}
              </div>

              {/* Bottom stats row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}>
                {[
                  { label: 'PF', value: 'R$ 28.100' },
                  { label: 'PJ', value: 'R$ 19.190' },
                  { label: 'Rendimento', value: '+R$ 730' },
                ].map((s, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: 3 }}>{s.label}</p>
                    <p style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: s.label === 'Rendimento' ? GLit : 'rgba(255,255,255,0.82)',
                      letterSpacing: '-0.02em',
                    }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
