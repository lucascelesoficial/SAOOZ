'use client'

import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Building2,
  CheckCircle2, ChevronRight, Layers,
  Lock, Mail, Shield, Star, User, Zap,
} from 'lucide-react'
import { PricingSection } from '@/components/marketing/PricingSection'

const G     = '#026648'
const GLit  = '#04a372'
const GDim  = 'rgba(2,102,72,0.1)'
const GBord = 'rgba(2,102,72,0.25)'

function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 30, width: 'auto', display: 'block' }} />
  )
}

// ─── Dashboard Mockup ────────────────────────────────────────────────────────
function DashboardMockup() {
  const bars = [28, 44, 32, 60, 40, 52, 70, 48, 64, 76, 40, 84]
  const categories = [
    { name: 'Clientes / Vendas',    pct: 45, value: 'R$ 23.616' },
    { name: 'Salário / Pró-labore', pct: 20, value: 'R$ 10.496' },
    { name: 'Marketing',            pct: 12, value: 'R$ 6.296'  },
  ]
  const accounts = [
    { name: 'Conta Principal',   value: 'R$ 18.420', pos: true  },
    { name: 'Conta PJ',          value: 'R$ 4.890',  pos: true  },
    { name: 'Cartão de Crédito', value: '-R$ 2.150', pos: false },
  ]

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: '#0a0a0a',
      boxShadow: `0 60px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03), 0 0 120px ${G}18`,
      width: '100%',
    }}>
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
        <div style={{ marginLeft: 8, flex: 1, borderRadius: 4, padding: '4px 10px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Shield style={{ width: 8, height: 8, color: GLit, flexShrink: 0 }} />
          app.pearfy.com/dashboard
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 340 }}>
        {/* Sidebar */}
        <div style={{ width: 130, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '10px 0', flexShrink: 0 }}>
          <div style={{ padding: '2px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 18, width: 'auto' }} />
          </div>
          {[['Resumo', true],['Movimentações', false],['Contas', false],['Categorias', false],['Metas', false],['Relatórios', false],['Insights (IA)', false],['Configurações', false]].map(([lbl, active]) => (
            <div key={lbl as string} style={{ padding: '5px 10px', fontSize: 9, fontWeight: active ? 600 : 400, color: active ? GLit : '#4b5563', background: active ? GDim : 'transparent', borderLeft: `2px solid ${active ? G : 'transparent'}`, marginBottom: 1 }}>{lbl as string}</div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: '12px 14px', background: '#0a0a0a', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Resumo do mês</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 4 }}>Abril 2025 <span style={{ fontSize: 8, color: '#6b7280' }}>▾</span></div>
            </div>
            <div style={{ fontSize: 8, color: '#4b5563', background: '#111', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>Atualizado há 2 min</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { lbl: 'SALDO TOTAL', val: 'R$ 24.430', up: true },
              { lbl: 'RECEITAS',    val: 'R$ 52.480', up: true },
              { lbl: 'DESPESAS',   val: 'R$ 28.250', up: false },
              { lbl: 'RESULTADO',  val: 'R$ 24.230', up: true },
            ].map(m => (
              <div key={m.lbl} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '8px 10px' }}>
                <div style={{ fontSize: 7, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.lbl}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: m.up ? GLit : '#f87171', lineHeight: 1.2 }}>{m.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 6, marginBottom: 8 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af' }}>Fluxo de caixa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 44 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <div style={{ width: '100%', borderRadius: '2px 2px 0 0', height: `${h}%`, background: i === bars.length - 1 ? G : `rgba(2,102,72,${0.12 + h / 300})`, boxShadow: i === bars.length - 1 ? `0 0 8px ${G}80` : 'none' }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Receitas vs. Despesas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 52, height: 52, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(55,65,81,0.6)" strokeWidth="5.5" />
                    <circle cx="18" cy="18" r="13" fill="none" stroke={G} strokeWidth="5.5" strokeDasharray="53 100" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 7, fontWeight: 700, color: '#f1f5f9' }}>65%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: GLit }} /><span style={{ fontSize: 7, color: '#9ca3af' }}>Receitas 65%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: '#374151' }} /><span style={{ fontSize: 7, color: '#9ca3af' }}>Despesas 35%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: 8 }}>Categorias</span>
              {categories.map(c => (
                <div key={c.name} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                    <span style={{ fontSize: 7, color: '#9ca3af' }}>{c.name}</span>
                    <span style={{ fontSize: 7, color: '#6b7280' }}>{c.value}</span>
                  </div>
                  <div style={{ height: 3.5, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${c.pct * 2}%`, background: `linear-gradient(90deg, ${G}, ${GLit})` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, padding: '10px' }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', display: 'block', marginBottom: 8 }}>Contas</span>
              {accounts.map(a => (
                <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 7, color: '#9ca3af' }}>{a.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: a.pos ? '#f1f5f9' : '#f87171' }}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Visuals ─────────────────────────────────────────────────────────
function VisualDRE() {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px', width: '100%', maxWidth: 380 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 11, background: GDim, color: GLit, padding: '3px 10px', borderRadius: 100, border: `1px solid ${GBord}`, fontWeight: 500 }}>Simples Nacional</span>
      </div>
      {[
        { label: 'Faturamento', value: 'R$ 28.500', color: GLit },
        { label: 'Despesas',    value: 'R$ 11.200', color: '#f87171' },
        { label: 'Imposto',     value: 'R$ 1.425',  color: '#6b7280' },
        { label: 'Lucro',       value: 'R$ 15.875', color: GLit },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: '#161616', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>{row.label}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: row.color }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function VisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
      {[
        { label: 'Pessoal · PF', items: [{ k: 'Saldo líquido', v: 'R$ 8.420', c: GLit }, { k: 'Saídas do mês', v: 'R$ 4.380', c: '#f87171' }] },
        { label: 'Empresa · PJ', items: [{ k: 'Faturamento',   v: 'R$ 28.5k', c: GLit }, { k: 'Lucro líquido', v: 'R$ 15.8k', c: GLit }] },
      ].map(p => (
        <div key={p.label} style={{ background: '#0f0f0f', border: `1px solid ${GBord}`, borderRadius: 16, padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: GLit }}>{p.label}</span>
            <span style={{ fontSize: 10, background: GDim, color: GLit, padding: '2px 8px', borderRadius: 6 }}>Abril 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {p.items.map(item => (
              <div key={item.k} style={{ background: '#000', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6, fontWeight: 300 }}>{item.k}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.c }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function VisualChat() {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px', width: '100%', maxWidth: 380 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px ${G}70` }}>
          <Brain style={{ width: 16, height: 16, color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Assistente PearFy</div>
          <div style={{ fontSize: 11, color: GLit, fontWeight: 300 }}>● online</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBord}`, borderRadius: '0 12px 12px 12px', padding: '12px 14px', fontSize: 13, color: '#d1d5db', lineHeight: 1.55, fontWeight: 300 }}>
          Em abril você gastou R$ 4.380 — 12% acima de março. Quer ver onde aumentou?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 0 12px 12px', padding: '12px 14px', fontSize: 13, color: '#6b7280', fontWeight: 300 }}>
          Sim, onde foi?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBord}`, borderRadius: '0 12px 12px 12px', padding: '12px 14px', fontSize: 13, color: '#d1d5db', lineHeight: 1.55, fontWeight: 300 }}>
          Alimentação +R$ 340 e assinaturas +R$ 180. Posso sugerir um ajuste de meta?
        </div>
      </div>
    </div>
  )
}

const TESTIMONIALS = [
  { name: 'Lucas M.',    role: 'Designer · MEI',               quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.', stars: 5 },
  { name: 'Fernanda C.', role: 'Consultora PJ',                quote: 'O módulo de impostos me economiza horas toda semana. Antes abria três ferramentas só para montar o número básico.', stars: 5 },
  { name: 'Rafael S.',   role: 'Gestor de tráfego · Autônomo', quote: 'A IA identifica onde está o vazamento antes do fim do mês. Mudou como tomo decisão sobre investimento.', stars: 5 },
]

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?',                  a: 'Se assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntas, sem formulário de retenção.' },
  { q: 'Quando começa a cobrança?',                      a: 'Imediatamente após a confirmação do pagamento. Cancelamentos nos primeiros 7 dias têm reembolso integral. Sem fidelidade, sem multa.' },
  { q: 'Posso usar pessoal e empresarial no mesmo plano?',a: 'Sim. O plano Comando acessa os dois módulos em uma única conta.' },
  { q: 'Em quanto tempo configuro a PearFy?',            a: 'Menos de 5 minutos. No mesmo dia você já registra, analisa e decide com base em dados reais.' },
  { q: 'O assistente IA usa meus dados reais?',          a: 'Sim. O assistente conhece seu contexto e entrega análises sobre você — não sobre o usuário médio.' },
  { q: 'Como funciona o cancelamento?',                  a: 'Você cancela pelo painel. O acesso permanece até o fim do período pago. Sem multa, sem aviso prévio.' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SalesLanding() {
  return (
    <>
      <style>{`
        .pl { background: #000; color: #9ca3af; font-family: inherit; }
        .pl a { text-decoration: none; }
        .pl-nl { color: #6b7280; font-size: 14px; font-weight: 400; transition: color .15s; }
        .pl-nl:hover { color: #fff; }
        .pl-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          height: 40px; padding: 0 18px; border-radius: 8px;
          font-size: 13px; font-weight: 400; color: #6b7280;
          border: 1px solid rgba(255,255,255,0.08); transition: all .15s;
        }
        .pl-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.18); }
        .pl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          height: 50px; padding: 0 32px; border-radius: 10px;
          font-size: 15px; font-weight: 600; color: #fff;
          background: ${G}; letter-spacing: -0.01em;
          transition: opacity .15s;
        }
        .pl-btn:hover { opacity: .84; }
        .pl-btn-sm { height: 42px; padding: 0 22px; font-size: 14px; border-radius: 8px; font-weight: 500; }
        .pl-faq summary::-webkit-details-marker { display: none; }
        .pl-faq[open] .pl-chv { transform: rotate(90deg); }
        .pl-chv { transition: transform .2s; }
        @media (max-width: 900px) {
          .pl-hide { display: none !important; }
          .pl-2col { grid-template-columns: 1fr !important; }
          .pl-3col { grid-template-columns: 1fr !important; }
          .pl-4col { grid-template-columns: 1fr 1fr !important; }
          .pl-ord1 { order: 1 !important; }
          .pl-ord2 { order: 2 !important; }
        }
        @media (max-width: 540px) {
          .pl-4col { grid-template-columns: 1fr !important; }
          .pl-ftcols { grid-template-columns: 1fr !important; }
          .pl-hbtns { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <div className="pl relative min-h-screen overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Wordmark />
            <nav className="pl-hide" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                <a key={h} href={h} className="pl-nl">{l}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" className="pl-ghost">Entrar</Link>
              <Link href="/cadastro" className="pl-btn pl-btn-sm">
                Começar grátis <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ══════════════════════════════════════════════
              HERO — left-aligned headline + 3D dashboard
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#000', padding: '96px 32px 0', position: 'relative', overflow: 'hidden' }}>
            {/* ambient glow */}
            <div aria-hidden style={{ position: 'absolute', top: -120, right: -80, width: 800, height: 800, background: `radial-gradient(ellipse, ${G}14, transparent 60%)`, pointerEvents: 'none' }} />
            <div aria-hidden style={{ position: 'absolute', top: 200, left: -100, width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(255,255,255,0.015), transparent 60%)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>

              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <div style={{ width: 24, height: 1, background: G }} />
                <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.18em', textTransform: 'uppercase', color: GLit }}>
                  Gestão financeira — PF &amp; PJ
                </span>
              </div>

              {/* Headline — bold/thin contrast */}
              <h1 style={{ margin: '0 0 32px', maxWidth: 820 }}>
                <span style={{ display: 'block', fontSize: 'clamp(3.2rem, 7vw, 6rem)', fontWeight: 800, lineHeight: 0.95, color: '#fff', letterSpacing: '-0.04em' }}>
                  Clareza total.
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', fontWeight: 300, lineHeight: 1.15, color: '#9ca3af', letterSpacing: '-0.02em', fontStyle: 'italic', marginTop: 8 }}>
                  Pessoal e empresa no mesmo lugar.
                </span>
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.75, color: '#6b7280', fontWeight: 400, margin: '0 0 44px', maxWidth: 520 }}>
                O PearFy organiza seu dinheiro pessoal e empresarial com IA — sem planilha, sem improviso, sem achar que sobrou.
              </p>

              {/* CTAs */}
              <div className="pl-hbtns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href="/cadastro" className="pl-btn">
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
                </Link>
                <a href="#como-funciona" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 50, padding: '0 28px', borderRadius: 10,
                  fontSize: 15, fontWeight: 400, color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>Ver como funciona</a>
              </div>

              {/* Trust */}
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 13, color: '#4b5563', fontWeight: 300, marginBottom: 80 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 14, height: 14, color: G, flexShrink: 0 }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── 3D Dashboard ── */}
            <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
              {/* Green glow under mockup */}
              <div aria-hidden style={{
                position: 'absolute', bottom: -40, left: '15%', right: '15%', height: 200,
                background: `radial-gradient(ellipse, ${G}30, transparent 70%)`,
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
              }} />
              {/* 3D tilt */}
              <div style={{
                transform: 'perspective(1600px) rotateX(6deg)',
                transformOrigin: 'center bottom',
                position: 'relative', zIndex: 1,
                borderRadius: 12,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
                <DashboardMockup />
              </div>
              {/* Bottom fade */}
              <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to top, #000 0%, transparent 100%)', pointerEvents: 'none', zIndex: 2, borderRadius: '0 0 12px 12px' }} />
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              STATEMENT — full bleed, disruptive
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#000', padding: '100px 32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <p style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.2, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 28px' }}>
                O dinheiro não some.{' '}
                <span style={{ color: '#374151', fontWeight: 300, fontStyle: 'italic' }}>Ele vai pra onde você não está olhando.</span>
              </p>
              <p style={{ fontSize: 17, color: '#6b7280', fontWeight: 300, maxWidth: 600, lineHeight: 1.8, margin: 0 }}>
                Você trabalha, fatura, paga contas — e no fim do mês o número nunca fecha. Chega de achismo.
                O PearFy te dá visão real sobre cada centavo, em PF e em PJ.
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              HOW IT WORKS — 3 pillars
          ══════════════════════════════════════════════ */}
          <section id="como-funciona" style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 32px' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto' }}>
              <div style={{ marginBottom: 64 }}>
                <p style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.16em', textTransform: 'uppercase', color: GLit, margin: '0 0 16px' }}>O mecanismo</p>
                <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.035em', margin: 0, lineHeight: 1.1 }}>
                  Não é um app a mais.<br />
                  <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#6b7280' }}>É estrutura de comando.</span>
                </h2>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                  { n: '01', title: 'Centraliza',  body: 'Pessoal e empresarial no mesmo sistema. Uma plataforma. Tudo visível. Sem ferramentas paralelas.' },
                  { n: '02', title: 'Separa',      body: 'PF de um lado. PJ do outro. Um clique muda o contexto. Cada lado com sua lógica e análise própria.' },
                  { n: '03', title: 'Interpreta',  body: 'A IA lê os dados, detecta padrões e entrega análise antes que o problema apareça.' },
                ].map((p, i) => (
                  <div key={p.n} style={{ background: i === 1 ? '#111' : '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '44px 40px', position: 'relative', overflow: 'hidden', borderTop: i === 1 ? `2px solid ${G}` : '1px solid rgba(255,255,255,0.05)' }}>
                    <span aria-hidden style={{ position: 'absolute', bottom: -16, right: -8, fontSize: 120, fontWeight: 900, color: G, opacity: 0.035, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.05em' }}>{p.n}</span>
                    <div style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.1em', color: GLit, textTransform: 'uppercase', marginBottom: 20 }}>{p.n}</div>
                    <h3 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.025em' }}>{p.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              STATS BAR
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 32px' }}>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {[
                  { n: '< 5',  unit: 'min',    label: 'para configurar e começar' },
                  { n: '16',   unit: '+',       label: 'categorias de despesa PF' },
                  { n: '3',    unit: 'CNPJs',   label: 'no plano Gestão anual' },
                  { n: '7',    unit: 'dias',    label: 'de garantia total' },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '32px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</span>
                      <span style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 300, color: GLit }}>{s.unit}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 300, lineHeight: 1.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FEATURES
          ══════════════════════════════════════════════ */}
          <section id="recursos" style={{ background: '#000' }}>

            {/* PF + PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 32px' }}>
              <div style={{ maxWidth: 1160, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Módulo Pessoal + Empresarial</span>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                      Pessoal e empresa.<br /><em style={{ fontWeight: 300, color: '#6b7280' }}>Sem misturar nada.</em>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você enxerga cada lado com clareza real.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Painéis PF e PJ totalmente independentes','Troca de modo com um clique, sem recarregar','Saldo, entradas e saídas em tempo real','Histórico mês a mês sem perda de dados'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 18, height: 18, color: G, flexShrink: 0, marginTop: 1 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-btn" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="pl-ord1"><VisualPanels /></div>
                </div>
              </div>
            </div>

            {/* PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 32px', background: '#060606' }}>
              <div style={{ maxWidth: 1160, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div className="pl-ord2" style={{ display: 'flex', justifyContent: 'flex-start' }}><VisualDRE /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="pl-ord1">
                    <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Módulo Empresarial · PJ</span>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                      O que só o contador sabia,<br /><em style={{ fontWeight: 300, color: '#6b7280' }}>você vê no mesmo dia.</em>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>DRE, fluxo de caixa e imposto estimado calculados pelo regime correto, atualizados a cada lançamento.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Imposto por regime: MEI, Simples, Presumido, Real','DRE mensal gerado automaticamente','Fluxo de caixa com projeção e vencimentos','Pró-labore, distribuição de lucros e sócios'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 18, height: 18, color: G, flexShrink: 0, marginTop: 1 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-btn" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* IA */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '96px 32px' }}>
              <div style={{ maxWidth: 1160, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Inteligência Artificial</span>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                      Uma IA que conhece<br /><em style={{ fontWeight: 300, color: '#6b7280' }}>seus números.</em>
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>Diferente do ChatGPT, o assistente da PearFy acessa seu histórico real. A resposta é sobre você — não sobre o usuário médio.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Acessa seu histórico real — não exemplos da internet','Registra lançamentos por linguagem natural ou voz','Compara meses, detecta desvios, sugere metas','Plano Comando: IA ilimitada · demais: 60 ações/mês'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 18, height: 18, color: G, flexShrink: 0, marginTop: 1 }} />{b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="pl-btn" style={{ width: 'fit-content' }}>
                      Assinar com 7 dias de garantia <ArrowRight style={{ width: 17, height: 17 }} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}><VisualChat /></div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              SECURITY — horizontal strip
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '72px 32px' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Seus dados pertencem a você.</h2>
                <p style={{ fontSize: 14, color: '#4b5563', fontWeight: 300, margin: 0 }}>Padrão de segurança dos bancos digitais.</p>
              </div>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {[
                  { Icon: Shield,       title: 'AES-256',           desc: 'Criptografia de nível bancário em trânsito e em repouso.' },
                  { Icon: Lock,         title: 'Sem senha bancária', desc: 'Nunca pedimos nem armazenamos credenciais de banco.' },
                  { Icon: CheckCircle2, title: 'Só leitura',         desc: 'A IA analisa. Nenhuma transação é executada sem você.' },
                  { Icon: Zap,          title: 'Exclusão total',     desc: 'Apague tudo a qualquer momento. Sem formulário.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: GDim, border: `1px solid ${GBord}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 18, height: 18, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6b7280', fontWeight: 300, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FOR WHO — 3 profiles
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto' }}>
              <div style={{ marginBottom: 52 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Para quem a PearFy foi construída</h2>
                <p style={{ fontSize: 15, color: '#4b5563', fontWeight: 300, margin: 0 }}>Não para todo mundo. Para quem está cansado de improvisar.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                  { Icon: User,      title: 'Profissional com renda variável', desc: 'Freelancers, consultores e autônomos que precisam de previsibilidade — sem depender de contador para entender o básico do próprio dinheiro.' },
                  { Icon: Building2, title: 'Empresário com operação PJ',      desc: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto e fechar o mês sem planilha paralela.' },
                  { Icon: Layers,    title: 'Quem tem PF + PJ ao mesmo tempo', desc: 'Renda pessoal e empresarial simultâneas, precisando de visão total em um único sistema — sem retrabalho, sem confusão.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: GDim, border: `1px solid ${GBord}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 20, height: 20, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.3, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: '#6b7280', fontWeight: 300, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              TESTIMONIALS
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 1160, margin: '0 auto' }}>
              <div style={{ marginBottom: 52 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Quem já usa, fala.</h2>
                <p style={{ fontSize: 15, color: '#4b5563', fontWeight: 300, margin: 0 }}>Resultados reais de quem saiu do improviso.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {TESTIMONIALS.map(t => (
                  <div key={t.name} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: t.stars }).map((_, i) => <Star key={i} style={{ width: 14, height: 14, color: GLit, fill: GLit }} />)}
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#9ca3af', fontWeight: 400, margin: 0 }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: '#4b5563', fontWeight: 300, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              PRICING
          ══════════════════════════════════════════════ */}
          <section id="precos" style={{ background: '#000', '--text-strong': '#ffffff', '--text-soft': '#6b7280', '--panel-bg': '#0d0d0d', '--panel-border': 'rgba(255,255,255,0.06)', '--accent-main': G, '--accent-alt': '#026749' } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ══════════════════════════════════════════════
              GUARANTEE
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: GDim, border: `1px solid ${GBord}`, marginBottom: 32 }}>
                <Shield style={{ width: 24, height: 24, color: GLit }} />
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 20px', lineHeight: 1 }}>
                7 dias de garantia.<br /><span style={{ fontWeight: 300, fontStyle: 'italic', color: '#6b7280' }}>Ponto.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: '0 0 14px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor — sem formulário, sem e-mail de retenção, sem pergunta sobre o motivo.
              </p>
              <p style={{ fontSize: 14, color: '#374151', fontWeight: 300, margin: '0 0 40px' }}>Não é trial. É compra com segurança real.</p>
              <Link href="/cadastro" className="pl-btn">
                Assinar agora <ArrowRight style={{ width: 17, height: 17 }} />
              </Link>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FAQ
          ══════════════════════════════════════════════ */}
          <section id="faq" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 48px' }}>
                Perguntas frequentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {FAQ_ITEMS.map(item => (
                  <details key={item.q} className="pl-faq" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', fontSize: 15, fontWeight: 500, color: '#e5e7eb', userSelect: 'none', letterSpacing: '-0.01em' }}>
                      {item.q}
                      <ChevronRight className="pl-chv" style={{ width: 16, height: 16, color: '#374151', flexShrink: 0 }} />
                    </summary>
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#6b7280', fontWeight: 300, margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p style={{ marginTop: 36, fontSize: 13, color: '#374151', fontWeight: 300 }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: GLit, fontWeight: 500 }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              CTA FINAL
          ══════════════════════════════════════════════ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, background: `radial-gradient(ellipse, ${G}10, transparent 65%)`, pointerEvents: 'none' }} />
            <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.95, margin: '0 0 28px' }}>
                Chega de achar que sobrou.<br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#374151' }}>Veja a realidade.</span>
              </h2>
              <p style={{ fontSize: 17, color: '#6b7280', fontWeight: 400, maxWidth: 520, lineHeight: 1.8, margin: '0 0 44px' }}>
                Assine agora e tenha visão real sobre pessoal e empresa — sem planilha, sem feeling, sem surpresa no fim do mês.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href="/cadastro" className="pl-btn" style={{ height: 56, padding: '0 44px', fontSize: 16, borderRadius: 12 }}>
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 18, height: 18 }} />
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 28, fontSize: 13, color: '#374151', fontWeight: 300 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: G }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '52px 32px 32px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div className="pl-ftcols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <Wordmark />
                <p style={{ fontSize: 13, color: '#374151', fontWeight: 300, margin: '18px 0 18px', lineHeight: 1.7, maxWidth: 280 }}>
                  Gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
                <a href="mailto:suporte@pearfy.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#4b5563', fontWeight: 300 }}>
                  <Mail style={{ width: 15, height: 15, color: G }} /> suporte@pearfy.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 18px' }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([h, l]) => (
                    <Link key={h} href={h} style={{ fontSize: 13, color: '#4b5563', fontWeight: 300 }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 18px' }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 13, color: '#4b5563', fontWeight: 300 }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 300 }}>© 2026 PearFy · Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
