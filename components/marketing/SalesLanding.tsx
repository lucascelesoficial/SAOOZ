import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Building2,
  CheckCircle2, ChevronRight, Layers, Lock,
  Mail, Shield, Star, TrendingUp, Users, User, Zap,
} from 'lucide-react'

import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Paleta ────────────────────────────────────────────────────────────────────
// Base: #000000 · #070707 · #0d0d0d · #111111 · #141414
// Verde puro: #22c55e · #16a34a · #4ade80
// Texto: #ffffff · #d1d5db · #9ca3af · #6b7280
// ──────────────────────────────────────────────────────────────────────────────

function LandingWordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/pearfy-logo.svg"
      alt="PearFy"
      style={{ height: 38, width: 'auto', display: 'block' }}
    />
  )
}

// ─── Dashboard Mockup (hero right column) ────────────────────────────────────
function DashboardMockup() {
  const cashflowBars = [30, 50, 35, 65, 45, 55, 75, 50, 68, 80, 42, 88]
  const categories = [
    { name: 'Clientes / Vendas', pct: 45, value: 'R$ 23.616,00' },
    { name: 'Salário / Pró-labore', pct: 20, value: 'R$ 10.496,00' },
    { name: 'Marketing', pct: 12, value: 'R$ 6.296,00' },
  ]
  const accounts = [
    { name: 'Conta Principal', value: 'R$ 18.420,00', positive: true },
    { name: 'Conta PJ', value: 'R$ 4.890,00', positive: true },
    { name: 'Cartão de Crédito', value: '-R$ 2.150,00', positive: false },
  ]

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(34,197,94,0.06)',
      background: '#0a0a0a',
      width: '100%',
    }}>
      {/* Browser chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e', display: 'block' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'block' }} />
        <div style={{
          marginLeft: 8, flex: 1, borderRadius: 5, padding: '4px 10px',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)',
          fontSize: 10, color: '#4b5563',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Shield style={{ width: 8, height: 8, color: '#22c55e', flexShrink: 0 }} />
          app.pearfy.com/dashboard
        </div>
      </div>

      {/* App body */}
      <div style={{ display: 'flex', minHeight: 340 }}>
        {/* Sidebar */}
        <div style={{
          width: 130, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '10px 0', flexShrink: 0, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '2px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 18, width: 'auto' }} />
          </div>
          {[
            ['Resumo', true],
            ['Movimentações', false],
            ['Contas', false],
            ['Categorias', false],
            ['Metas', false],
            ['Relatórios', false],
            ['Insights (IA)', false],
            ['Configurações', false],
          ].map(([label, active]) => (
            <div key={label as string} style={{
              padding: '5px 10px', fontSize: 9, fontWeight: active ? 600 : 400,
              color: active ? '#22c55e' : '#4b5563',
              background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
              borderLeft: `2px solid ${active ? '#22c55e' : 'transparent'}`,
              marginBottom: 1, cursor: 'default',
            }}>
              {label as string}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '12px 14px', background: '#0a0a0a', minWidth: 0, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Resumo do mês</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 4 }}>
                Abril 2025 <span style={{ fontSize: 8, color: '#6b7280' }}>▾</span>
              </div>
            </div>
            <div style={{ fontSize: 8, color: '#4b5563', background: '#111111', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              Atualizado agora há 2 min
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { label: 'SALDO TOTAL',  value: 'R$ 24.430,00', change: '↑ 18,4% vs. Mar', up: true },
              { label: 'RECEITAS',     value: 'R$ 52.480,00', change: '↑ 22,7% vs. Mar', up: true },
              { label: 'DESPESAS',     value: 'R$ 28.250,00', change: '↑ 9,2% vs. Mar',  up: false },
              { label: 'RESULTADO',   value: 'R$ 24.230,00', change: '↑ 36,8% vs. Mar', up: true },
            ].map((m) => (
              <div key={m.label} style={{
                background: '#111111', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 7, padding: '8px 10px',
              }}>
                <div style={{ fontSize: 7, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: m.up ? '#22c55e' : '#f87171', lineHeight: 1.2 }}>{m.value}</div>
                <div style={{ fontSize: 7, color: m.up ? '#4ade80' : '#f87171', marginTop: 3 }}>{m.change}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 6, marginBottom: 8 }}>
            {/* Cashflow bar chart */}
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px 10px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Fluxo de caixa</span>
                <span style={{ fontSize: 7, color: '#4b5563', background: '#1a1a1a', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.04)' }}>Mensal ▾</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10, marginBottom: 6 }}>
                {[{ label: 'Receitas', color: '#22c55e' }, { label: 'Despesas', color: '#374151' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: l.color }} />
                    <span style={{ fontSize: 7, color: '#6b7280' }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 44 }}>
                {cashflowBars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', borderRadius: '2px 2px 0 0',
                      height: `${h}%`,
                      background: i === cashflowBars.length - 1
                        ? '#22c55e'
                        : `rgba(34,197,94,${0.15 + h / 250})`,
                      boxShadow: i === cashflowBars.length - 1 ? '0 0 6px rgba(34,197,94,0.4)' : 'none',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['01/04', '08/04', '15/04', '22/04', '29/04'].map(d => (
                  <span key={d} style={{ fontSize: 6, color: '#374151' }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Receitas vs. Despesas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 52, height: 52, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(55,65,81,0.6)" strokeWidth="5.5" />
                    <circle cx="18" cy="18" r="13" fill="none" stroke="#22c55e" strokeWidth="5.5"
                      strokeDasharray={`${65 * 0.817} 100`} strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 6.5, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.1 }}>R$24.230</span>
                    <span style={{ fontSize: 5.5, color: '#6b7280' }}>Resultado</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[{ label: 'Receitas', pct: 65, color: '#22c55e' }, { label: 'Despesas', pct: 35, color: '#374151' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 7, color: '#9ca3af', minWidth: 46 }}>{item.label}</span>
                      <span style={{ fontSize: 7.5, color: '#f1f5f9', fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Categorias + Contas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Categorias</span>
                <span style={{ fontSize: 7, color: '#22c55e', cursor: 'pointer' }}>Ver todas</span>
              </div>
              {categories.map(c => (
                <div key={c.name} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                    <span style={{ fontSize: 7, color: '#9ca3af' }}>{c.name}</span>
                    <span style={{ fontSize: 7, color: '#6b7280' }}>{c.value}</span>
                  </div>
                  <div style={{ height: 3.5, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${c.pct * 2}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Contas</span>
                <span style={{ fontSize: 7, color: '#22c55e', cursor: 'pointer' }}>Ver todas</span>
              </div>
              {accounts.map(a => (
                <div key={a.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: 7, color: '#9ca3af' }}>{a.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: a.positive ? '#f1f5f9' : '#f87171' }}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mascot Banner Section ───────────────────────────────────────────────────
const MASCOT_FEATURES = [
  {
    Icon: Users,
    title: 'PF + PJ no mesmo sistema',
    desc: 'Gerencie sua vida pessoal e seu negócio de forma integrada e sem complicação.',
  },
  {
    Icon: Brain,
    title: 'IA que revela o que os números escondem',
    desc: 'Receba insights inteligentes e sugestões práticas para tomar decisões melhores e mais rápidas.',
  },
  {
    Icon: TrendingUp,
    title: 'Clareza total do seu caixa',
    desc: 'Visualize entradas, saídas e resultados com dashboards simples, bonitos e 100% confiáveis.',
  },
  {
    Icon: Zap,
    title: 'Gestão prática, foco no que importa',
    desc: 'Automação, categorização inteligente e relatórios que economizam seu tempo todo dia.',
  },
]

function MascotSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #040b06 0%, #060e08 40%, #000000 100%)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow esquerdo */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 700, height: 700,
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.1), transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }}>
        {/* Coluna esquerda: texto + banner SVG */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingTop: 64, paddingBottom: 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#22c55e', marginBottom: 20,
            }}>
              MUITO ALÉM DE UM APP DE CONTROLE
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1,
              color: '#ffffff', margin: '0 0 20px', letterSpacing: '-0.02em',
            }}>
              Inteligência e controle para o seu dinheiro render{' '}
              <span style={{ color: '#22c55e' }}>mais e te dar liberdade.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.75, margin: '0 0 0', maxWidth: 500 }}>
              O PearFy foi criado pra quem quer crescer com segurança, seja na vida pessoal ou no negócio.
              Tecnologia, praticidade e estratégia no mesmo sistema.
            </p>
          </div>

          {/* Banner SVG esportivo */}
          <div style={{ position: 'relative', marginLeft: -24, marginRight: -24, marginBottom: -8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pear-banner.svg"
              alt="PearFy — controle financeiro com estilo"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Coluna direita: 4 feature cards 2x2 */}
        <div style={{ paddingTop: 64, paddingBottom: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {MASCOT_FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} style={{
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '22px 20px',
              display: 'flex', flexDirection: 'column', gap: 12,
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon className="h-4.5 w-4.5" style={{ color: '#22c55e', width: 18, height: 18 }} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35, margin: 0 }}>
                {title}
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.65, color: '#6b7280', margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Demais Feature Visuals ───────────────────────────────────────────────────
function FeatureVisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
      {[
        { label: 'Pessoal · PF', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', items: [{ k: 'Saldo', v: 'R$ 8.420', c: '#4ade80' }, { k: 'Saídas', v: 'R$ 4.380', c: '#f87171' }] },
        { label: 'Empresa · PJ', color: '#86efac', bg: 'rgba(134,239,172,0.08)', items: [{ k: 'Faturamento', v: 'R$ 28.5k', c: '#86efac' }, { k: 'Lucro', v: 'R$ 15.8k', c: '#4ade80' }] },
      ].map((panel) => (
        <div key={panel.label} style={{
          background: 'linear-gradient(135deg, #141414, #1a1a1a)',
          border: `1px solid ${panel.bg}`,
          borderRadius: 16, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: panel.color }}>{panel.label}</span>
            <span style={{ fontSize: 10, background: panel.bg, color: panel.color, padding: '2px 7px', borderRadius: 6, border: `1px solid ${panel.color}30` }}>Abril 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {panel.items.map((item) => (
              <div key={item.k} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>{item.k}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.c, textShadow: `0 0 12px ${item.c}50` }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {['PF', 'PJ', 'Ambos'].map((t, i) => (
          <span key={t} style={{
            fontSize: 11, padding: '4px 14px', borderRadius: 20, fontWeight: 600,
            background: i === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
            color: i === 0 ? '#22c55e' : '#6b7280',
            border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function FeatureVisualCategories() {
  const cats = [
    { name: 'Moradia',     pct: 32, color: '#22c55e' },
    { name: 'Alimentação', pct: 22, color: '#f87171' },
    { name: 'Transporte',  pct: 15, color: '#4ade80' },
    { name: 'Lazer',       pct: 9,  color: '#f59e0b' },
  ]
  return (
    <div style={{
      background: 'linear-gradient(135deg, #141414, #1a1a1a)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
      padding: '22px 24px', width: '100%', maxWidth: 380,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Gastos por categoria</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {cats.map((c) => (
          <div key={c.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${c.pct * 2.8}%`, background: c.color, boxShadow: `0 0 6px ${c.color}80` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>⚠</span>
        <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>Alimentação +18% — acima do padrão</span>
      </div>
    </div>
  )
}

function FeatureVisualDRE() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #141414, #1a1a1a)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
      padding: '22px 24px', width: '100%', maxWidth: 380,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600 }}>Simples Nacional</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Faturamento', value: 'R$ 28.500', color: '#4ade80' },
          { label: 'Despesas',    value: 'R$ 11.200', color: '#f87171' },
          { label: 'Imposto',     value: 'R$ 1.425',  color: '#f59e0b' },
          { label: 'Lucro',       value: 'R$ 15.875', color: '#22c55e' },
        ].map((row) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 14px', background: 'rgba(0,0,0,0.4)',
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: row.color, textShadow: `0 0 10px ${row.color}50` }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureVisualChat() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #141414, #1a1a1a)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
      padding: '22px 24px', width: '100%', maxWidth: 380,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 16px rgba(34,197,94,0.4)',
        }}>
          <Brain style={{ width: 14, height: 14, color: '#fff' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Assistente IA · PearFy</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#9ca3af', lineHeight: 1.55 }}>
          Em abril você gastou R$ 4.380 — 12% acima de março. Quer ver onde aumentou?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 0 12px 12px', padding: '10px 13px', fontSize: 12, color: '#6b7280' }}>
          Sim, onde foi?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#9ca3af', lineHeight: 1.55 }}>
          Alimentação +R$ 340 e assinaturas +R$ 180. Posso sugerir um ajuste de meta?
        </div>
      </div>
    </div>
  )
}

// ─── Dados ────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Lucas M.', role: 'Designer · MEI', quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.', stars: 5 },
  { name: 'Fernanda C.', role: 'Consultora PJ', quote: 'O módulo de impostos me economiza horas toda semana. Antes abria 3 ferramentas diferentes só para montar o número básico.', stars: 5 },
  { name: 'Rafael S.', role: 'Gestor de tráfego · Autônomo', quote: 'A IA identifica onde está o vazamento antes do fim do mês. Mudou completamente como tomo decisão sobre investimento.', stars: 5 },
]

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?', a: 'Se você assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas, sem e-mail de retenção, sem formulário longo.' },
  { q: 'Quando começa a cobrança?', a: 'Imediatamente após a confirmação do pagamento. Se decidir cancelar nos primeiros 7 dias, reembolsamos o valor integral. Sem fidelidade, sem multa de saída.' },
  { q: 'Posso usar pessoal e empresarial no mesmo plano?', a: 'Sim. Com o plano Comando você acessa os dois módulos em uma única conta. Se precisar só de um, os planos Clareza (pessoal) ou Gestão (empresarial) são mais indicados e acessíveis.' },
  { q: 'Consigo ter mais de uma empresa cadastrada?', a: 'Sim. O plano Gestão suporta até 3 empresas no anual e o Comando até 5. Ideal para quem opera mais de um CNPJ ou tem diferentes frentes de negócio.' },
  { q: 'Em quanto tempo configuro a PearFy?', a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.' },
  { q: 'O assistente IA usa meus dados financeiros reais?', a: 'Sim. O assistente conhece seu contexto real — renda, gastos, categorias e operação pessoal ou empresarial — e entrega análises orientadas ao seu momento, não respostas genéricas de internet.' },
  { q: 'Posso migrar de plano depois?', a: 'Sim. Você pode trocar de plano a qualquer momento pelo painel de configurações. Sem perda de dados, sem burocracia.' },
  { q: 'Como funciona o cancelamento?', a: 'Você cancela pelo painel, sem precisar falar com ninguém. O acesso permanece até o fim do período pago. Sem multa, sem aviso prévio.' },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export function SalesLanding() {
  return (
    <>
      <style>{`
        .pearfy-landing {
          background: #000000;
          color: #9ca3af;
          font-family: inherit;
        }
        .pearfy-grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .pearfy-nav-link {
          color: #d1d5db; font-size: 14px; font-weight: 500;
          transition: color 0.15s; text-decoration: none;
        }
        .pearfy-nav-link:hover { color: #22c55e; }
        .pear-details summary::-webkit-details-marker { display: none; }
        .pear-details[open] .pear-chevron { transform: rotate(90deg); }
        .pear-chevron { transition: transform 0.2s; }
        @keyframes pearfy-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(34,197,94,0.30); }
          50%       { box-shadow: 0 8px 52px rgba(34,197,94,0.60); }
        }
        .pearfy-cta-pulse { animation: pearfy-pulse 2.5s ease-in-out infinite; }
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .mascot-grid { grid-template-columns: 1fr !important; }
          .md-grid-2   { grid-template-columns: 1fr !important; }
          .md-order-1  { order: 1 !important; }
          .md-order-2  { order: 2 !important; }
          .md-hidden   { display: none !important; }
          .sm-grid-1   { grid-template-columns: 1fr !important; }
          .sm-grid-2   { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div className="pearfy-landing relative min-h-screen overflow-x-hidden">

        {/* ══ NAVBAR ══ */}
        <header className="relative z-20 sticky top-0" style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.94)',
          backdropFilter: 'blur(20px)',
        }}>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <LandingWordmark />
            <nav className="md-hidden hidden items-center gap-7 md:flex">
              {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([href, label]) => (
                <a key={href} href={href} className="pearfy-nav-link">{label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden md:inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-medium"
                style={{ color: '#d1d5db', border: '1px solid rgba(255,255,255,0.12)' }}>
                Entrar
              </Link>
              <Link href="/cadastro" className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-semibold text-white pearfy-cta-pulse"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                Assine com 7 dias de garantia <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ══ HERO — split layout ══ */}
          <section className="pearfy-grid-bg relative overflow-hidden" style={{ background: '#000000' }}>
            {/* Glow top-right */}
            <div aria-hidden style={{
              position: 'absolute', top: '-10%', right: '-5%',
              width: 700, height: 700,
              background: 'radial-gradient(ellipse, rgba(34,197,94,0.07), transparent 65%)',
              pointerEvents: 'none',
            }} />

            <div
              className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 hero-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center' }}
            >
              {/* Texto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <h1 style={{
                  fontSize: 'clamp(2.4rem, 4.8vw, 3.6rem)',
                  fontWeight: 900, lineHeight: 1.08, margin: 0, letterSpacing: '-0.02em',
                }}>
                  <span style={{ color: '#ffffff' }}>O dinheiro não some.</span>
                  <br />
                  <span style={{ color: '#22c55e' }}>Ele vai pra onde você não está olhando.</span>
                </h1>

                <p style={{ fontSize: 16, lineHeight: 1.78, color: '#9ca3af', margin: 0, maxWidth: 460 }}>
                  Você trabalha, fatura, paga contas — e no fim do mês o número nunca fecha? Chega de achismo.
                  O PearFy te dá{' '}
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>clareza total e comando financeiro</span>
                  {' '}pra você crescer com segurança.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white pearfy-cta-pulse"
                    style={{ height: 52, padding: '0 28px', borderRadius: 12, fontSize: 15, background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                    Assine com 7 dias de garantia <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a href="#como-funciona" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 52, padding: '0 24px', borderRadius: 12, fontSize: 15,
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#e5e7eb', background: 'rgba(255,255,255,0.02)', textDecoration: 'none',
                  }}>
                    Ver como funciona
                  </a>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13, color: '#6b7280' }}>
                  {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map((t) => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#22c55e', flexShrink: 0 }} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mockup */}
              <div style={{ position: 'relative' }}>
                {/* Green glow behind mockup */}
                <div aria-hidden style={{
                  position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '0',
                  background: 'radial-gradient(ellipse, rgba(34,197,94,0.08), transparent 70%)',
                  filter: 'blur(30px)', pointerEvents: 'none',
                }} />
                <DashboardMockup />
              </div>
            </div>
          </section>

          {/* ══ MASCOT SECTION ══ */}
          <MascotSection />

          {/* ══ PAIN POINTS ══ */}
          <section id="como-funciona" style={{ background: '#070707', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
              <div style={{ maxWidth: 720, margin: '0 auto 64px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 18 }}>
                  Você se reconhece aqui?
                </p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  O caos financeiro não grita.<br />
                  <span style={{ color: '#22c55e' }}>Ele vai embora silencioso, todo mês.</span>
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="md-grid-2">
                {[
                  { n: '01', title: 'Você fatura bem. O número no fim do mês não bate.', body: 'Renda entra, conta vai embora, sobra menos do que deveria. Impostos, recorrências e gastos invisíveis comem a margem antes de você perceber. Todo mês.', accent: '#f87171' },
                  { n: '02', title: 'Empresa e vida pessoal misturadas. Impossível de analisar.', body: 'Você não sabe quanto o negócio gerou de verdade. Não sabe o quanto sobrou para você. Misturar PF com PJ é a receita perfeita para nunca entender nenhum dos dois.', accent: '#f59e0b' },
                  { n: '03', title: 'A planilha existe. O controle, não.', body: 'Planilha é anotação. Não detecta desvio, não calcula imposto, não separa PF de PJ, não projeta caixa. É uma promessa de organização que depende de você nunca errar.', accent: '#86efac' },
                  { n: '04', title: 'Mais receita, mesmo caos. O improviso escala junto.', body: 'Ganhar mais sem visão financeira só aumenta o volume do problema. O descontrole não diminui com o faturamento. Ele cresce proporcionalmente a ele.', accent: '#22c55e' },
                ].map((card) => (
                  <div key={card.n} style={{ position: 'relative', background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '30px 32px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
                    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: `linear-gradient(180deg, ${card.accent}, transparent)`, borderRadius: '18px 0 0 18px' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: card.accent, padding: '3px 10px', borderRadius: 100, background: `${card.accent}12`, border: `1px solid ${card.accent}25`, width: 'fit-content' }}>{card.n}</span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3, margin: 0 }}>{card.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.72, color: '#6b7280', margin: 0 }}>{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ MECANISMO ══ */}
          <section style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
              <div style={{ maxWidth: 720, margin: '0 auto 64px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 18 }}>O que a PearFy faz de verdade</p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.9rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Não é mais um app financeiro.<br />
                  <span style={{ color: '#22c55e' }}>É estrutura de comando.</span>
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: '#6b7280', margin: 0 }}>A PearFy centraliza, separa, organiza e interpreta — para você decidir com dados reais, não com o feeling de quanto acha que sobrou.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="sm-grid-1">
                {[
                  { num: '01', title: 'Centraliza', color: '#22c55e', body: 'Pessoal e empresarial no mesmo sistema. Uma plataforma, tudo visível. Sem ferramentas paralelas, sem retrabalho, sem dado espalhado.' },
                  { num: '02', title: 'Separa', color: '#4ade80', body: 'Pessoal de um lado. Empresa do outro. Um clique muda o contexto. Cada lado com sua lógica, categorias e análise próprias.' },
                  { num: '03', title: 'Interpreta', color: '#86efac', body: 'A IA lê os dados, detecta padrões e entrega análise antes que o problema apareça. Dado bruto vira visão acionável.' },
                ].map((p, idx) => (
                  <div key={p.num} style={{ position: 'relative', overflow: 'hidden', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '36px 32px', transform: idx === 1 ? 'translateY(-8px)' : 'none' }}>
                    <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, fontSize: 80, fontWeight: 900, color: p.color, opacity: 0.04, lineHeight: 1, userSelect: 'none', transform: 'translate(10px, -10px)' }}>{p.num}</div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 20, background: `${p.color}10`, border: `1px solid ${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.num}</span>
                    </div>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginBottom: 14, lineHeight: 1 }}>{p.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: '#6b7280', margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FEATURES ══ */}
          <section id="recursos">
            {/* Feature 1 — PF+PJ */}
            <div style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', width: 'fit-content' }}>Visão geral · PF + PJ</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.12, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                      Pessoal e empresa no mesmo lugar.<br /><span style={{ color: '#22c55e' }}>Sem misturar nada.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.78, color: '#9ca3af', margin: 0 }}>Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você enxerga cada lado com a clareza que ele merece.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Painel PF e painel PJ totalmente independentes','Troca de modo com um clique — sem recarregar','Saldo, entradas e saídas em tempo real','Histórico mês a mês sem perda de dados'].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#d1d5db' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#22c55e' }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{ height: 48, padding: '0 28px', borderRadius: 12, fontSize: 15, background: 'linear-gradient(135deg, #16a34a, #22c55e)', width: 'fit-content', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}>
                      Assine com 7 dias de garantia <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="md-order-1"><FeatureVisualPanels /></div>
                </div>
              </div>
            </div>

            {/* Feature 2 — PJ */}
            <div style={{ background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div className="md-order-2" style={{ display: 'flex', justifyContent: 'flex-start' }}><FeatureVisualDRE /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="md-order-1">
                    <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', width: 'fit-content' }}>Módulo Empresarial · PJ</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.12, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                      O que só o contador sabia,{' '}<span style={{ color: '#22c55e' }}>você vê no mesmo dia.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.78, color: '#9ca3af', margin: 0 }}>DRE, fluxo de caixa e imposto estimado — calculados pelo regime correto, atualizados a cada lançamento. Você fecha o mês com o número real. Sem esperar ninguém.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Imposto por regime: MEI, Simples, Presumido, Real','DRE mensal gerado automaticamente','Fluxo de caixa com projeção e vencimentos','Pró-labore, distribuição de lucros e sócios'].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#d1d5db' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#22c55e' }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{ height: 48, padding: '0 28px', borderRadius: 12, fontSize: 15, background: 'linear-gradient(135deg, #16a34a, #22c55e)', width: 'fit-content' }}>
                      Assine com 7 dias de garantia <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 — PF */}
            <div style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', width: 'fit-content' }}>Módulo Pessoal · PF</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.12, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                      A visão pessoal que você nunca teve.<br /><span style={{ color: '#22c55e' }}>E que precisava.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.78, color: '#9ca3af', margin: 0 }}>Do saldo real ao breakdown de cada categoria. A IA acompanha o padrão e avisa quando algo sobe fora do normal — antes de virar problema no fechamento do mês.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['16 categorias de despesas com análise de tendência','Alerta quando um gasto sobe além do padrão','Reserva de emergência com meta e progresso','Investimentos pessoais com histórico completo'].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#d1d5db' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#22c55e' }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{ height: 48, padding: '0 28px', borderRadius: 12, fontSize: 15, background: 'linear-gradient(135deg, #16a34a, #22c55e)', width: 'fit-content', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}>
                      Assine com 7 dias de garantia <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}><FeatureVisualCategories /></div>
                </div>
              </div>
            </div>

            {/* Feature 4 — IA */}
            <div style={{ background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div className="md-order-2" style={{ display: 'flex', justifyContent: 'flex-start' }}><FeatureVisualChat /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="md-order-1">
                    <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', width: 'fit-content' }}>Inteligência Artificial</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.12, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                      Uma IA que conhece seus números.<br /><span style={{ color: '#22c55e' }}>Não uma IA genérica.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.78, color: '#9ca3af', margin: 0 }}>Diferente do ChatGPT, o assistente da PearFy acessa seu histórico real. A resposta é sobre você — não sobre &ldquo;o usuário médio&rdquo;. Registre um gasto por voz. Pergunte o que quiser. Ouça a análise em áudio.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Acessa seu histórico real — não exemplos da internet','Registra lançamentos por linguagem natural ou voz','Compara meses, detecta desvios, sugere metas','Comando: IA ilimitada · Clareza/Gestão: 60 ações/mês'].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#d1d5db' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#22c55e' }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{ height: 48, padding: '0 28px', borderRadius: 12, fontSize: 15, background: 'linear-gradient(135deg, #16a34a, #22c55e)', width: 'fit-content' }}>
                      Assine com 7 dias de garantia <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ STATS ══ */}
          <section style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }} className="sm-grid-2">
                {[{ n: '< 5 min', label: 'para configurar e começar' },{ n: '3 + 5', label: 'empresas Gestão e Comando' },{ n: '16', label: 'categorias de despesa' },{ n: '7 dias', label: 'de garantia total' }].map((s) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #ffffff, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.n}</span>
                    <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ SEGURANÇA ══ */}
          <section style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div style={{ maxWidth: 580, margin: '0 auto 48px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, margin: '0 0 16px', color: '#ffffff' }}>Seus dados pertencem a você.</h2>
                <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Construído com os padrões de segurança dos bancos digitais.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="sm-grid-2">
                {[
                  { Icon: Shield, title: 'AES-256', desc: 'Criptografia de nível bancário. Dados protegidos em trânsito e em repouso.' },
                  { Icon: Lock, title: 'Sem senha bancária', desc: 'Nunca pedimos nem armazenamos credenciais de banco. Sempre.' },
                  { Icon: CheckCircle2, title: 'Só leitura', desc: 'A IA analisa seus dados. Nenhuma transação é executada sem você.' },
                  { Icon: Zap, title: 'Exclusão total', desc: 'Apague tudo a qualquer momento. Sem formulário, sem espera.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon className="h-5 w-5" style={{ color: '#22c55e' }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PARA QUEM ══ */}
          <section style={{ background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div style={{ maxWidth: 680, margin: '0 auto 52px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px' }}>Para quem a PearFy foi construída</h2>
                <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Não para todo mundo. Para quem precisa de visão real e está cansado de improvisar.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="sm-grid-1">
                {[
                  { Icon: User, accent: '#22c55e', title: 'Profissional com renda variável', desc: 'Freelancers, consultores e autônomos que precisam de previsibilidade — sem depender de contador para entender o básico do próprio dinheiro.' },
                  { Icon: Building2, accent: '#4ade80', title: 'Empresário com operação PJ', desc: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto e fechar o mês sem planilha paralela.' },
                  { Icon: Layers, accent: '#86efac', title: 'Quem tem PF + PJ ao mesmo tempo', desc: 'Renda pessoal e empresarial simultâneas, precisando de visão total em um único sistema — sem retrabalho, sem confusão.' },
                ].map(({ Icon, accent, title, desc }) => (
                  <div key={title} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: `${accent}10`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon className="h-5 w-5" style={{ color: accent }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.35, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.72, color: '#6b7280', margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ DEPOIMENTOS ══ */}
          <section style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div style={{ maxWidth: 560, margin: '0 auto 52px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, margin: '0 0 12px', color: '#ffffff' }}>Quem já usa, fala.</h2>
                <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>Nenhum depoimento genérico. Resultados reais de quem saiu do improviso.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="sm-grid-1">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />)}
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.72, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PREÇOS ══ */}
          <section id="precos" style={{ background: '#000000', '--text-strong': '#ffffff', '--text-soft': '#6b7280', '--panel-bg': '#111111', '--panel-border': 'rgba(255,255,255,0.06)', '--accent-main': '#22c55e', '--accent-alt': '#16a34a' } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ══ GARANTIA ══ */}
          <section style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.28), transparent 65%)', pointerEvents: 'none' }} />
            <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
            <div className="mx-auto w-full max-w-3xl px-4 py-24 md:px-6 text-center relative" style={{ zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 32, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
                <Shield className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>7 dias de garantia. Ponto.</h2>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor pago — sem formulário longo, sem e-mail de retenção, sem pergunta sobre o motivo.</p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 40px' }}>Não é trial. É a compra com segurança de que você não está apostando no escuro.</p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold" style={{ height: 56, padding: '0 40px', borderRadius: 14, fontSize: 16, background: '#ffffff', color: '#14532d', boxShadow: '0 8px 34px rgba(0,0,0,0.25)' }}>
                Assine com 7 dias de garantia <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section id="faq" style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6">
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, margin: '0 0 12px', color: '#ffffff' }}>Perguntas diretas. Respostas diretas.</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQ_ITEMS.map((item) => (
                  <details key={item.q} className="pear-details" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', fontSize: 14, fontWeight: 600, color: '#f1f5f9', userSelect: 'none' }}>
                      {item.q}<ChevronRight className="pear-chevron h-4 w-4 shrink-0" style={{ color: '#4b5563' }} />
                    </summary>
                    <div style={{ padding: '0 20px 18px' }}>
                      <p style={{ fontSize: 14, lineHeight: 1.72, color: '#9ca3af', margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p className="mt-8 text-center" style={{ fontSize: 13, color: '#4b5563' }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ══ CTA FINAL ══ */}
          <section className="pearfy-grid-bg" style={{ background: '#000000', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 500, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.09), transparent 65%)', pointerEvents: 'none' }} />
            <div className="mx-auto w-full max-w-5xl px-4 py-32 md:px-6 text-center relative" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', zIndex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', margin: 0 }}>Chega de improvisar</p>
              <h2 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', fontWeight: 900, lineHeight: 1.06, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Você já passou tempo suficiente<br />
                <span style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>gerenciando no escuro.</span>
              </h2>
              <p className="mx-auto" style={{ fontSize: 17, lineHeight: 1.78, color: '#9ca3af', maxWidth: 580, margin: 0 }}>
                Assine agora e tenha visão, separação e controle real sobre o seu dinheiro e o seu negócio — sem planilha, sem feeling, sem esperar o fim do mês para entender onde foi o dinheiro.
              </p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white pearfy-cta-pulse" style={{ height: 60, padding: '0 48px', borderRadius: 16, fontSize: 17, background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                Assine com 7 dias de garantia <ArrowRight className="h-5 w-5" />
              </Link>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: '#4b5563' }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#22c55e', flexShrink: 0 }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ══ FOOTER ══ */}
        <footer style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48 }} className="sm-grid-1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <LandingWordmark />
                <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', maxWidth: 260, margin: 0 }}>Sistema de gestão financeira pessoal e empresarial com inteligência artificial.</p>
                <a href="mailto:suporte@pearfy.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>
                  <Mail className="h-4 w-4" style={{ color: '#22c55e' }} /> suporte@pearfy.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22c55e', marginBottom: 16 }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([href, label]) => (
                    <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22c55e', marginBottom: 16 }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 12, color: '#374151' }}>
              © 2026 PearFy · Todos os direitos reservados
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
