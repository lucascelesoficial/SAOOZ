'use client'

import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Building2,
  CheckCircle2, ChevronRight, Layers,
  Lock, Mail, Shield, Star, TrendingUp, User, Users, Zap,
} from 'lucide-react'
import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Palette ──────────────────────────────────────────────────────────────────
const G      = '#026648'   // primary brand green
const G2     = '#026749'   // subtle variant
const GDim   = 'rgba(2,102,72,0.12)'
const GBord  = 'rgba(2,102,72,0.28)'
const GLit   = '#04a372'   // readable on dark for small labels
// ──────────────────────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 32, width: 'auto', display: 'block' }} />
  )
}

// ─── Dashboard Mockup ────────────────────────────────────────────────────────
function DashboardMockup() {
  const bars = [28, 44, 32, 60, 40, 52, 70, 48, 64, 76, 40, 84]
  const categories = [
    { name: 'Clientes / Vendas',   pct: 45, value: 'R$ 23.616' },
    { name: 'Salário / Pró-labore',pct: 20, value: 'R$ 10.496' },
    { name: 'Marketing',           pct: 12, value: 'R$ 6.296'  },
  ]
  const accounts = [
    { name: 'Conta Principal',  value: 'R$ 18.420',  pos: true },
    { name: 'Conta PJ',         value: 'R$ 4.890',   pos: true },
    { name: 'Cartão de Crédito',value: '-R$ 2.150',  pos: false },
  ]

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.09)',
      background: '#0a0a0a',
      boxShadow: `0 48px 96px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), 0 0 100px ${G}20`,
      width: '100%',
    }}>
      {/* Browser bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
        <div style={{ marginLeft: 8, flex: 1, borderRadius: 5, padding: '4px 10px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Shield style={{ width: 8, height: 8, color: GLit, flexShrink: 0 }} />
          app.pearfy.com/dashboard
        </div>
      </div>

      {/* App body */}
      <div style={{ display: 'flex', minHeight: 340 }}>
        {/* Sidebar */}
        <div style={{ width: 130, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '10px 0', flexShrink: 0 }}>
          <div style={{ padding: '2px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 18, width: 'auto' }} />
          </div>
          {[['Resumo', true],['Movimentações', false],['Contas', false],['Categorias', false],['Metas', false],['Relatórios', false],['Insights (IA)', false],['Configurações', false]].map(([lbl, active]) => (
            <div key={lbl as string} style={{
              padding: '5px 10px', fontSize: 9, fontWeight: active ? 600 : 400,
              color: active ? GLit : '#4b5563',
              background: active ? GDim : 'transparent',
              borderLeft: `2px solid ${active ? G : 'transparent'}`,
              marginBottom: 1,
            }}>{lbl as string}</div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '12px 14px', background: '#0a0a0a', minWidth: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Resumo do mês</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 4 }}>Abril 2025 <span style={{ fontSize: 8, color: '#6b7280' }}>▾</span></div>
            </div>
            <div style={{ fontSize: 8, color: '#4b5563', background: '#111', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>Atualizado há 2 min</div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { lbl: 'SALDO TOTAL', val: 'R$ 24.430', chg: '↑ 18,4%', up: true },
              { lbl: 'RECEITAS',    val: 'R$ 52.480', chg: '↑ 22,7%', up: true },
              { lbl: 'DESPESAS',   val: 'R$ 28.250', chg: '↑ 9,2%',  up: false },
              { lbl: 'RESULTADO',  val: 'R$ 24.230', chg: '↑ 36,8%', up: true },
            ].map(m => (
              <div key={m.lbl} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '8px 10px' }}>
                <div style={{ fontSize: 7, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.lbl}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: m.up ? GLit : '#f87171', lineHeight: 1.2 }}>{m.val}</div>
                <div style={{ fontSize: 7, color: m.up ? GBord : '#f87171', marginTop: 3 }}>{m.chg}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 6, marginBottom: 8 }}>
            {/* Bar chart */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px 10px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Fluxo de caixa</span>
                <span style={{ fontSize: 7, color: '#4b5563', background: '#1a1a1a', padding: '2px 6px', borderRadius: 3 }}>Mensal ▾</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 44 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <div style={{
                      width: '100%', borderRadius: '2px 2px 0 0', height: `${h}%`,
                      background: i === bars.length - 1 ? G : `rgba(2,102,72,${0.15 + h / 280})`,
                      boxShadow: i === bars.length - 1 ? `0 0 6px ${G}60` : 'none',
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Receitas vs. Despesas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 52, height: 52, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(55,65,81,0.6)" strokeWidth="5.5" />
                    <circle cx="18" cy="18" r="13" fill="none" stroke={G} strokeWidth="5.5" strokeDasharray={`${65 * 0.817} 100`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 6.5, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.1 }}>R$24.230</span>
                    <span style={{ fontSize: 5.5, color: '#6b7280' }}>Resultado</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[{ lbl: 'Receitas', pct: 65, color: GLit }, { lbl: 'Despesas', pct: 35, color: '#374151' }].map(item => (
                    <div key={item.lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 7, color: '#9ca3af', minWidth: 46 }}>{item.lbl}</span>
                      <span style={{ fontSize: 7.5, color: '#f1f5f9', fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Categorias</span>
                <span style={{ fontSize: 7, color: GLit }}>Ver todas</span>
              </div>
              {categories.map(c => (
                <div key={c.name} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                    <span style={{ fontSize: 7, color: '#9ca3af' }}>{c.name}</span>
                    <span style={{ fontSize: 7, color: '#6b7280' }}>{c.value}</span>
                  </div>
                  <div style={{ height: 3.5, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${c.pct * 2}%`, background: `linear-gradient(90deg, ${G2}, ${GLit})` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Contas</span>
                <span style={{ fontSize: 7, color: GLit }}>Ver todas</span>
              </div>
              {accounts.map(a => (
                <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 7, color: '#9ca3af' }}>{a.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: a.pos ? '#f1f5f9' : '#f87171' }}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature visuals ─────────────────────────────────────────────────────────
function VisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
      {[
        { label: 'Pessoal · PF', color: GLit, bg: GDim, items: [{ k: 'Saldo', v: 'R$ 8.420', c: GLit }, { k: 'Saídas', v: 'R$ 4.380', c: '#f87171' }] },
        { label: 'Empresa · PJ', color: GLit, bg: 'rgba(2,102,72,0.07)', items: [{ k: 'Faturamento', v: 'R$ 28.5k', c: GLit }, { k: 'Lucro', v: 'R$ 15.8k', c: GLit }] },
      ].map(p => (
        <div key={p.label} style={{ background: '#141414', border: `1px solid ${GBord}`, borderRadius: 16, padding: '16px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.label}</span>
            <span style={{ fontSize: 10, background: p.bg, color: p.color, padding: '2px 7px', borderRadius: 6, border: `1px solid ${GBord}` }}>Abril 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {p.items.map(item => (
              <div key={item.k} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>{item.k}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.c }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function VisualDRE() {
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px 24px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 10, background: GDim, color: GLit, padding: '3px 9px', borderRadius: 6, border: `1px solid ${GBord}`, fontWeight: 500 }}>Simples Nacional</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Faturamento', value: 'R$ 28.500', color: GLit },
          { label: 'Despesas',    value: 'R$ 11.200', color: '#f87171' },
          { label: 'Imposto',     value: 'R$ 1.425',  color: '#9ca3af' },
          { label: 'Lucro',       value: 'R$ 15.875', color: GLit },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualChat() {
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px 24px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px ${G}60` }}>
          <Brain style={{ width: 14, height: 14, color: '#fff' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#f1f5f9' }}>Assistente IA · PearFy</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBord}`, borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#9ca3af', lineHeight: 1.55 }}>
          Em abril você gastou R$ 4.380 — 12% acima de março. Quer ver onde aumentou?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 0 12px 12px', padding: '10px 13px', fontSize: 12, color: '#6b7280' }}>
          Sim, onde foi?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBord}`, borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#9ca3af', lineHeight: 1.55 }}>
          Alimentação +R$ 340 e assinaturas +R$ 180. Posso sugerir um ajuste de meta?
        </div>
      </div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Lucas M.',   role: 'Designer · MEI',              quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo.', stars: 5 },
  { name: 'Fernanda C.',role: 'Consultora PJ',               quote: 'O módulo de impostos me economiza horas toda semana. Antes precisava de três ferramentas para montar um número.', stars: 5 },
  { name: 'Rafael S.',  role: 'Gestor de tráfego · Autônomo',quote: 'A IA identifica o vazamento antes do fim do mês. Mudou como tomo decisão sobre investimento.', stars: 5 },
]

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?',                 a: 'Se assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntas, sem formulário de retenção.' },
  { q: 'Quando começa a cobrança?',                     a: 'Imediatamente após a confirmação do pagamento. Cancelamentos nos primeiros 7 dias têm reembolso integral. Sem fidelidade, sem multa.' },
  { q: 'Posso usar pessoal e empresarial no mesmo plano?',a: 'Sim. O plano Comando acessa os dois módulos em uma única conta. Se precisar só de um, os planos Clareza (PF) ou Gestão (PJ) são mais indicados.' },
  { q: 'Em quanto tempo configuro a PearFy?',           a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já registra, analisa e decide com base em dados reais.' },
  { q: 'O assistente IA usa meus dados financeiros reais?', a: 'Sim. O assistente conhece seu contexto — renda, gastos e operação — e entrega análises sobre você, não respostas genéricas de internet.' },
  { q: 'Como funciona o cancelamento?',                 a: 'Você cancela pelo painel, sem precisar falar com ninguém. O acesso permanece até o fim do período pago. Sem multa, sem aviso prévio.' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SalesLanding() {
  return (
    <>
      <style>{`
        .pl { background: #000; color: #9ca3af; font-family: inherit; }
        .pl a { text-decoration: none; }
        .pl-navlink { color: #6b7280; font-size: 14px; font-weight: 300; transition: color .15s; }
        .pl-navlink:hover { color: #fff; }
        .pl-ghost {
          display: inline-flex; align-items: center;
          height: 40px; padding: 0 18px; border-radius: 8px;
          font-size: 13px; font-weight: 400; color: #6b7280;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all .15s;
        }
        .pl-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.18); }
        .pl-primary {
          display: inline-flex; align-items: center; gap: 7px;
          height: 48px; padding: 0 28px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #fff;
          background: ${G};
          transition: opacity .15s;
        }
        .pl-primary:hover { opacity: .85; }
        .pl-primary-lg { height: 54px; padding: 0 40px; border-radius: 13px; font-size: 16px; }
        .pl-faq summary::-webkit-details-marker { display: none; }
        .pl-faq[open] .pl-chv { transform: rotate(90deg); }
        .pl-chv { transition: transform .2s; }
        @media (max-width: 860px) {
          .pl-nav-links { display: none !important; }
          .pl-2col { grid-template-columns: 1fr !important; }
          .pl-3col { grid-template-columns: 1fr !important; }
          .pl-4col { grid-template-columns: 1fr 1fr !important; }
          .pl-order-1 { order: 1 !important; }
          .pl-order-2 { order: 2 !important; }
        }
        @media (max-width: 520px) {
          .pl-4col { grid-template-columns: 1fr !important; }
          .pl-footer-cols { grid-template-columns: 1fr !important; }
          .pl-hero-btns { flex-direction: column; align-items: stretch !important; }
        }
      `}</style>

      <div className="pl relative min-h-screen overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Wordmark />
            <nav className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
              {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                <a key={h} href={h} className="pl-navlink">{l}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" className="pl-ghost">Entrar</Link>
              <Link href="/cadastro" className="pl-primary" style={{ height: 40, padding: '0 20px', fontSize: 13, borderRadius: 8 }}>
                Começar <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ── HERO ── */}
          <section style={{ background: '#000', padding: '88px 24px 0', position: 'relative', overflow: 'hidden' }}>
            {/* top center glow */}
            <div aria-hidden style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: `radial-gradient(ellipse, ${G}18, transparent 65%)`, pointerEvents: 'none' }} />

            {/* ── Text block — centered ── */}
            <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit, margin: '0 0 24px' }}>
                Gestão financeira pessoal e empresarial
              </p>

              <h1 style={{
                fontSize: 'clamp(2.6rem, 5.8vw, 4.2rem)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: '#fff',
                letterSpacing: '-0.03em',
                margin: '0 0 24px',
              }}>
                Clareza total sobre<br />
                <span style={{ fontWeight: 500 }}>o seu dinheiro.</span>
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: '0 0 40px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                PF e PJ em um único sistema. Controle, IA e relatórios — sem planilha, sem improviso.
              </p>

              <div className="pl-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                <Link href="/cadastro" className="pl-primary pl-primary-lg">
                  Assinar — 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
                </Link>
                <a href="#como-funciona" style={{
                  display: 'inline-flex', alignItems: 'center',
                  height: 54, padding: '0 32px', borderRadius: 13,
                  fontSize: 15, fontWeight: 300, color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  Ver como funciona
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', fontSize: 12, color: '#374151', fontWeight: 300, marginBottom: 64 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: G, flexShrink: 0 }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── 3D Dashboard ── */}
            <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
              {/* Glow behind mockup */}
              <div aria-hidden style={{
                position: 'absolute', bottom: 0, left: '10%', right: '10%',
                height: 200,
                background: `radial-gradient(ellipse, ${G}28, transparent 70%)`,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />

              {/* 3D wrapper */}
              <div style={{
                transform: 'perspective(1400px) rotateX(7deg)',
                transformOrigin: 'center bottom',
                position: 'relative',
                zIndex: 1,
                borderRadius: 14,
                // top ring highlight
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.05)`,
              }}>
                <DashboardMockup />
              </div>

              {/* Gradient fade to next section */}
              <div aria-hidden style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
                background: 'linear-gradient(to top, #000 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 2,
                borderRadius: '0 0 14px 14px',
              }} />
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="como-funciona" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
              <div style={{ maxWidth: 600, margin: '0 auto 64px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', color: GLit, fontWeight: 400, margin: '0 0 18px' }}>O que a PearFy faz</p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 18px', lineHeight: 1.15 }}>
                  Não é mais um app financeiro.<br /><span style={{ fontWeight: 500 }}>É estrutura de comando.</span>
                </h2>
                <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 300, margin: 0 }}>Centraliza, separa, organiza e interpreta — para você decidir com dados reais.</p>
              </div>

              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[
                  { num: '01', title: 'Centraliza', body: 'Pessoal e empresarial no mesmo sistema. Uma plataforma, tudo visível. Sem ferramentas paralelas, sem retrabalho.' },
                  { num: '02', title: 'Separa',     body: 'Pessoal de um lado. Empresa do outro. Um clique muda o contexto. Cada lado com sua lógica e análise própria.' },
                  { num: '03', title: 'Interpreta', body: 'A IA lê os dados, detecta padrões e entrega análise antes que o problema apareça. Dado bruto vira visão acionável.' },
                ].map((p, i) => (
                  <div key={p.num} style={{
                    background: i === 1 ? '#0f0f0f' : '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '40px 36px',
                    position: 'relative', overflow: 'hidden',
                    transform: i === 1 ? 'translateY(-6px)' : 'none',
                    borderTop: i === 1 ? `1px solid ${GBord}` : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, fontSize: 96, fontWeight: 800, color: G, opacity: 0.04, lineHeight: 1, userSelect: 'none', transform: 'translate(8px, -8px)' }}>{p.num}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', color: GLit, marginBottom: 16, textTransform: 'uppercase' }}>{p.num}</div>
                    <h3 style={{ fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 14, margin: '0 0 14px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.78, color: '#6b7280', fontWeight: 300, margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section id="recursos" style={{ background: '#000' }}>

            {/* Feature 1 — PF+PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 24px' }}>
              <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', background: GDim, border: `1px solid ${GBord}`, color: GLit, padding: '4px 14px', borderRadius: 100, width: 'fit-content' }}>PF + PJ</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 300, lineHeight: 1.12, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>
                      Pessoal e empresa.<br /><span style={{ fontWeight: 500 }}>Sem misturar nada.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você enxerga cada lado com clareza.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 13, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Painel PF e PJ totalmente independentes','Troca de modo com um clique','Saldo, entradas e saídas em tempo real','Histórico mês a mês sem perda de dados'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#9ca3af', fontWeight: 300 }}>
                          <BadgeCheck style={{ width: 17, height: 17, color: G, flexShrink: 0, marginTop: 2 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-primary" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="pl-order-1"><VisualPanels /></div>
                </div>
              </div>
            </div>

            {/* Feature 2 — PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 24px', background: '#050505' }}>
              <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                  <div className="pl-order-2" style={{ display: 'flex', justifyContent: 'flex-start' }}><VisualDRE /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }} className="pl-order-1">
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', background: GDim, border: `1px solid ${GBord}`, color: GLit, padding: '4px 14px', borderRadius: 100, width: 'fit-content' }}>Módulo Empresarial · PJ</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 300, lineHeight: 1.12, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>
                      O que só o contador sabia,<br /><span style={{ fontWeight: 500 }}>você vê no mesmo dia.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>DRE, fluxo de caixa e imposto estimado calculados automaticamente por regime tributário. Você fecha o mês com o número real.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 13, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Imposto por regime: MEI, Simples, Presumido, Real','DRE mensal gerado automaticamente','Fluxo de caixa com projeção e vencimentos','Pró-labore, distribuição de lucros e sócios'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#9ca3af', fontWeight: 300 }}>
                          <BadgeCheck style={{ width: 17, height: 17, color: G, flexShrink: 0, marginTop: 2 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-primary" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 — IA */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 24px' }}>
              <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', background: GDim, border: `1px solid ${GBord}`, color: GLit, padding: '4px 14px', borderRadius: 100, width: 'fit-content' }}>Inteligência Artificial</span>
                    <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 300, lineHeight: 1.12, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>
                      Uma IA que conhece<br /><span style={{ fontWeight: 500 }}>seus números.</span>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>Diferente do ChatGPT, o assistente da PearFy acessa seu histórico real. A resposta é sobre você — não sobre o &ldquo;usuário médio&rdquo;.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 13, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Acessa seu histórico real — não exemplos da internet','Registra lançamentos por linguagem natural ou voz','Compara meses, detecta desvios, sugere metas','Plano Comando: IA ilimitada'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#9ca3af', fontWeight: 300 }}>
                          <BadgeCheck style={{ width: 17, height: 17, color: G, flexShrink: 0, marginTop: 2 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-primary" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}><VisualChat /></div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SEGURANÇA ── */}
          <section style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
              <div style={{ maxWidth: 560, margin: '0 auto 52px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Seus dados pertencem a você.</h2>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, margin: 0 }}>Construído com os padrões de segurança dos bancos digitais.</p>
              </div>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {[
                  { Icon: Shield,       title: 'AES-256',          desc: 'Criptografia de nível bancário. Dados protegidos em trânsito e em repouso.' },
                  { Icon: Lock,         title: 'Sem senha bancária',desc: 'Nunca pedimos nem armazenamos credenciais de banco. Sempre.' },
                  { Icon: CheckCircle2, title: 'Só leitura',        desc: 'A IA analisa seus dados. Nenhuma transação é executada sem você.' },
                  { Icon: Zap,          title: 'Exclusão total',    desc: 'Apague tudo a qualquer momento. Sem formulário, sem espera.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: GDim, border: `1px solid ${GBord}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 18, height: 18, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9', margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6b7280', fontWeight: 300, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PARA QUEM ── */}
          <section style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
              <div style={{ maxWidth: 600, margin: '0 auto 52px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Para quem a PearFy foi construída</h2>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, margin: 0 }}>Não para todo mundo. Para quem está cansado de improvisar.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[
                  { Icon: User,      title: 'Profissional com renda variável', desc: 'Freelancers, consultores e autônomos que precisam de previsibilidade — sem depender de contador para entender o básico do próprio dinheiro.' },
                  { Icon: Building2, title: 'Empresário com operação PJ',      desc: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto e fechar o mês sem planilha paralela.' },
                  { Icon: Layers,    title: 'Quem tem PF + PJ ao mesmo tempo', desc: 'Renda pessoal e empresarial simultâneas, precisando de visão total em um único sistema — sem retrabalho, sem confusão.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: GDim, border: `1px solid ${GBord}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 19, height: 19, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 400, color: '#f1f5f9', lineHeight: 1.35, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: '#6b7280', fontWeight: 300, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── DEPOIMENTOS ── */}
          <section style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
              <div style={{ maxWidth: 480, margin: '0 auto 52px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Quem já usa, fala.</h2>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, margin: 0 }}>Resultados reais de quem saiu do improviso.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {TESTIMONIALS.map(t => (
                  <div key={t.name} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: t.stars }).map((_, i) => <Star key={i} style={{ width: 13, height: 13, color: GLit, fill: GLit }} />)}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: '#9ca3af', fontWeight: 300, margin: 0, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{t.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: '#4b5563', fontWeight: 300, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precos" style={{ background: '#000', '--text-strong': '#ffffff', '--text-soft': '#6b7280', '--panel-bg': '#0f0f0f', '--panel-border': 'rgba(255,255,255,0.06)', '--accent-main': G, '--accent-alt': G2 } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ── GUARANTEE ── */}
          <section style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: GDim, border: `1px solid ${GBord}`, marginBottom: 28 }}>
                <Shield style={{ width: 22, height: 22, color: GLit }} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 18px', lineHeight: 1.1 }}>
                7 dias de garantia. Ponto.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: '0 0 14px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor — sem formulário, sem e-mail de retenção, sem pergunta sobre o motivo.
              </p>
              <p style={{ fontSize: 14, color: '#374151', fontWeight: 300, margin: '0 0 36px' }}>Não é trial. É compra com segurança.</p>
              <Link href="/cadastro" className="pl-primary pl-primary-lg">
                Assinar agora <ArrowRight style={{ width: 17, height: 17 }} />
              </Link>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 24px' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 48px', textAlign: 'center' }}>
                Perguntas frequentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {FAQ_ITEMS.map(item => (
                  <details key={item.q} className="pl-faq" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '19px 22px', fontSize: 14, fontWeight: 400, color: '#e5e7eb', userSelect: 'none' }}>
                      {item.q}
                      <ChevronRight className="pl-chv" style={{ width: 15, height: 15, color: '#374151', flexShrink: 0 }} />
                    </summary>
                    <div style={{ padding: '0 22px 18px' }}>
                      <p style={{ fontSize: 13, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: '#374151', fontWeight: 300 }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: GLit, fontWeight: 400 }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: `radial-gradient(ellipse, ${G}12, transparent 65%)`, pointerEvents: 'none' }} />
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit, margin: 0 }}>Chega de improvisar</p>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 300, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
                Você já passou tempo suficiente<br /><span style={{ fontWeight: 500 }}>gerenciando no escuro.</span>
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', fontWeight: 300, maxWidth: 480, margin: 0, lineHeight: 1.8 }}>
                Assine agora e tenha visão, separação e controle real — sem planilha, sem feeling.
              </p>
              <Link href="/cadastro" className="pl-primary pl-primary-lg">
                Assinar com 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
              </Link>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', fontSize: 12, color: '#374151', fontWeight: 300 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: G }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '52px 24px 32px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div className="pl-footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
              <div>
                <Wordmark />
                <p style={{ fontSize: 13, color: '#4b5563', fontWeight: 300, margin: '16px 0 16px', lineHeight: 1.65, maxWidth: 260 }}>
                  Gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
                <a href="mailto:suporte@pearfy.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', fontWeight: 300 }}>
                  <Mail style={{ width: 15, height: 15, color: G }} /> suporte@pearfy.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 16px' }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([h, l]) => (
                    <Link key={h} href={h} style={{ fontSize: 13, color: '#4b5563', fontWeight: 300 }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 16px' }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 13, color: '#4b5563', fontWeight: 300 }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12, color: '#374151', fontWeight: 300 }}>
              <span>© 2026 PearFy · Todos os direitos reservados</span>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['Pessoal', Users], ['Empresarial', Building2], ['IA', TrendingUp]].map(([l, Icon]) => (
                  <span key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151' }}>
                    {/* @ts-ignore */}
                    <Icon style={{ width: 12, height: 12, color: G }} />{l as string}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
