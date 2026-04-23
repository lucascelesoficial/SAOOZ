'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronRight, Shield } from 'lucide-react'
import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Palette ──────────────────────────────────────────────────────────────────
// bg:    #000000  #0a0a0a  #111111
// green: #026648  #026749
// text:  #ffffff  #9ca3af  #4b5563
// ──────────────────────────────────────────────────────────────────────────────

const G = '#026648'
const G2 = '#026749'

function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 32, width: 'auto', display: 'block' }} />
  )
}

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?', a: 'Se assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntas.' },
  { q: 'Posso usar pessoal e empresarial no mesmo plano?', a: 'Sim. O plano Comando acessa os dois módulos em uma única conta.' },
  { q: 'Quando começa a cobrança?', a: 'Imediatamente após a confirmação do pagamento. Cancelamentos nos primeiros 7 dias têm reembolso integral.' },
  { q: 'Como funciona o cancelamento?', a: 'Você cancela pelo painel, sem precisar falar com ninguém. O acesso permanece até o fim do período pago.' },
  { q: 'O assistente IA usa meus dados reais?', a: 'Sim. O assistente conhece seu contexto — renda, gastos e operação — e entrega análises sobre você, não respostas genéricas.' },
]

export function SalesLanding() {
  return (
    <>
      <style>{`
        .pl {
          background: #000;
          color: #9ca3af;
          font-family: inherit;
        }
        .pl a { text-decoration: none; }
        .pl-link { color: #9ca3af; font-size: 14px; font-weight: 300; transition: color .15s; }
        .pl-link:hover { color: #fff; }
        .pl-btn-ghost {
          display: inline-flex; align-items: center;
          height: 40px; padding: 0 18px; border-radius: 8px;
          font-size: 13px; font-weight: 400; color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color .15s, color .15s;
        }
        .pl-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.25); }
        .pl-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          height: 48px; padding: 0 28px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #fff;
          background: ${G};
          transition: opacity .15s;
        }
        .pl-btn-primary:hover { opacity: .88; }
        .pl-btn-lg {
          height: 52px; padding: 0 36px; border-radius: 12px;
          font-size: 15px; font-weight: 500;
        }
        .pl-faq summary::-webkit-details-marker { display: none; }
        .pl-faq[open] .pl-chev { transform: rotate(90deg); }
        .pl-chev { transition: transform .2s; }
        @media (max-width: 768px) {
          .pl-nav-links { display: none !important; }
          .pl-hero-cols { grid-template-columns: 1fr !important; }
          .pl-feat-cols { grid-template-columns: 1fr !important; }
          .pl-footer-cols { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .pl-footer-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="pl relative min-h-screen overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Wordmark />
            <nav className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {[['#recursos', 'Recursos'], ['#precos', 'Preços'], ['#faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} className="pl-link">{label}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" className="pl-btn-ghost">Entrar</Link>
              <Link href="/cadastro" className="pl-btn-primary" style={{ height: 40, padding: '0 20px', fontSize: 13, borderRadius: 8 }}>
                Começar <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ── HERO ── */}
          <section style={{ background: '#000', padding: '96px 24px 80px' }}>
            {/* subtle center glow */}
            <div aria-hidden style={{
              position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
              width: 600, height: 300,
              background: `radial-gradient(ellipse, ${G}22, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
              <p style={{ fontSize: 12, fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: G, marginBottom: 24, margin: '0 0 24px' }}>
                Gestão financeira pessoal e empresarial
              </p>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                fontWeight: 300,
                lineHeight: 1.12,
                color: '#fff',
                letterSpacing: '-0.025em',
                margin: '0 0 24px',
              }}>
                Clareza total sobre<br />
                <span style={{ color: '#fff', fontWeight: 500 }}>seu dinheiro.</span>
              </h1>

              <p style={{ fontSize: 16, lineHeight: 1.8, color: '#9ca3af', fontWeight: 300, margin: '0 0 40px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
                PF e PJ em um único sistema. Controle, IA e relatórios — sem planilha, sem improviso.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href="/cadastro" className="pl-btn-primary pl-btn-lg">
                  Assinar — 7 dias de garantia <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <a href="#precos" style={{
                  display: 'inline-flex', alignItems: 'center',
                  height: 52, padding: '0 28px', borderRadius: 12,
                  fontSize: 15, fontWeight: 300, color: '#9ca3af',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  Ver planos
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', fontSize: 12, color: '#4b5563', fontWeight: 300 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: G, flexShrink: 0 }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section id="recursos" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                  Um sistema. Duas realidades.
                </h2>
                <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 300, margin: 0 }}>
                  Vida pessoal separada da empresa. Um clique muda o contexto.
                </p>
              </div>

              <div className="pl-feat-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[
                  {
                    label: 'PF + PJ',
                    title: 'Pessoal e empresa separados',
                    body: 'Dois módulos independentes, uma conta. Alterne entre pessoal e empresarial sem perder o fio.',
                  },
                  {
                    label: 'Relatórios',
                    title: 'DRE, fluxo e imposto',
                    body: 'Dados financeiros calculados automaticamente por regime tributário. Sem esperar o contador.',
                  },
                  {
                    label: 'IA',
                    title: 'Assistente que conhece você',
                    body: 'Acessa seu histórico real. Detecta desvios, compara meses e entrega análise antes que vire problema.',
                  },
                ].map((f) => (
                  <div key={f.label} style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: G,
                    }}>{f.label}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 400, color: '#fff', lineHeight: 1.3, margin: 0 }}>{f.title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: '#6b7280', fontWeight: 300, margin: 0 }}>{f.body}</p>
                  </div>
                ))}
              </div>

              {/* 3 secondary points */}
              <div className="pl-feat-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginTop: 1 }}>
                {[
                  { label: 'Categorias', body: '16 categorias de despesa com análise de tendência e alertas automáticos.' },
                  { label: 'Segurança', body: 'Criptografia AES-256. Sem acesso a senhas bancárias. Seus dados, só seus.' },
                  { label: 'Configuração', body: 'Menos de 5 minutos para começar. No mesmo dia você já registra e analisa.' },
                ].map((f) => (
                  <div key={f.label} style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '28px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4b5563' }}>{f.label}</span>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: '#6b7280', fontWeight: 300, margin: 0 }}>{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precos" style={{
            background: '#000',
            '--text-strong': '#ffffff',
            '--text-soft': '#6b7280',
            '--panel-bg': '#111111',
            '--panel-border': 'rgba(255,255,255,0.06)',
            '--accent-main': G,
            '--accent-alt': G2,
          } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ── GUARANTEE ── */}
          <section style={{
            background: '#0a0a0a',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            padding: '72px 24px',
          }}>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: '50%',
                background: `${G}15`,
                border: `1px solid ${G}30`,
                marginBottom: 28,
              }}>
                <Shield style={{ width: 22, height: 22, color: G }} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                7 dias de garantia. Ponto.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#9ca3af', fontWeight: 300, margin: '0 0 32px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor — sem formulário, sem pergunta sobre o motivo.
              </p>
              <Link href="/cadastro" className="pl-btn-primary pl-btn-lg">
                Assinar agora <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" style={{ background: '#000', padding: '72px 24px' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 48px', textAlign: 'center' }}>
                Perguntas frequentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {FAQ_ITEMS.map((item) => (
                  <details key={item.q} className="pl-faq" style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                    <summary style={{
                      display: 'flex', cursor: 'pointer', listStyle: 'none',
                      alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px',
                      fontSize: 14, fontWeight: 400, color: '#e5e7eb',
                      userSelect: 'none',
                    }}>
                      {item.q}
                      <ChevronRight className="pl-chev" style={{ width: 15, height: 15, color: '#4b5563', flexShrink: 0 }} />
                    </summary>
                    <div style={{ padding: '0 20px 18px' }}>
                      <p style={{ fontSize: 13, lineHeight: 1.78, color: '#6b7280', fontWeight: 300, margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: '#4b5563', fontWeight: 300 }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: G, fontWeight: 400 }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 20px', lineHeight: 1.15 }}>
                Comece hoje.
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 300, margin: '0 0 36px', lineHeight: 1.8 }}>
                Menos de 5 minutos para configurar. 7 dias para decidir.
              </p>
              <Link href="/cadastro" className="pl-btn-primary pl-btn-lg">
                Assinar com 7 dias de garantia <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="pl-footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
              <div>
                <Wordmark />
                <p style={{ fontSize: 13, color: '#4b5563', fontWeight: 300, margin: '16px 0 0', lineHeight: 1.65, maxWidth: 260 }}>
                  Gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4b5563', margin: '0 0 14px' }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['/termos', 'Termos'], ['/privacidade', 'Privacidade'], ['/suporte', 'Suporte']].map(([href, label]) => (
                    <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', fontWeight: 300 }}>{label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4b5563', margin: '0 0 14px' }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['#recursos', 'Recursos'], ['#precos', 'Preços'], ['#faq', 'FAQ']].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13, color: '#6b7280', fontWeight: 300 }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 300 }}>© 2026 PearFy</span>
              <a href="mailto:suporte@pearfy.com" style={{ fontSize: 12, color: '#4b5563', fontWeight: 300 }}>suporte@pearfy.com</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
