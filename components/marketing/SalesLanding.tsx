import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain,
  Building2, CheckCircle2, ChevronRight,
  Layers, Mail, Shield, Star, User,
} from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Lucas M.',
    role: 'Designer · MEI',
    quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.',
    stars: 5,
  },
  {
    name: 'Fernanda C.',
    role: 'Consultora PJ',
    quote: 'O módulo de impostos me economiza tempo toda semana. Antes abria 3 ferramentas diferentes só para montar o número básico.',
    stars: 5,
  },
  {
    name: 'Rafael S.',
    role: 'Gestor de tráfego · Autônomo',
    quote: 'A IA identifica onde está o vazamento antes do fim do mês. Muda completamente como tomo decisão sobre investimento e gasto.',
    stars: 5,
  },
]

const FAQ_ITEMS = [
  {
    q: 'O que é a garantia de 7 dias?',
    a: 'Se você assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas, sem e-mail de retenção, sem formulário longo.',
  },
  {
    q: 'Quando começa a cobrança?',
    a: 'Imediatamente após a confirmação do pagamento. Se decidir cancelar nos primeiros 7 dias, reembolsamos o valor integral. Sem fidelidade, sem multa de saída.',
  },
  {
    q: 'Posso usar PF e PJ no mesmo plano?',
    a: 'Sim, com o plano PRO você acessa os dois módulos em uma única conta. Se precisar só de um, os planos PF ou PJ são mais indicados e mais acessíveis.',
  },
  {
    q: 'Consigo ter mais de uma empresa cadastrada?',
    a: 'Sim. O plano PJ suporta até 3 empresas e o PRO até 5. Ideal para quem opera mais de um CNPJ ou tem diferentes frentes de negócio.',
  },
  {
    q: 'Em quanto tempo configuro o SAOOZ?',
    a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.',
  },
  {
    q: 'O assistente IA usa meus dados financeiros reais?',
    a: 'Sim. O assistente conhece seu contexto real — renda, gastos, categorias e operação PF/PJ — e entrega análises orientadas ao seu momento, não respostas genéricas.',
  },
  {
    q: 'Posso migrar de plano depois?',
    a: 'Sim. Você pode trocar de plano a qualquer momento pelo painel de configurações. Sem perda de dados, sem burocracia.',
  },
  {
    q: 'Como funciona o cancelamento?',
    a: 'Você cancela pelo painel, sem precisar falar com ninguém. O acesso permanece até o fim do período pago. Sem multa, sem período de aviso prévio.',
  },
]

// ─── Dashboard Mockup — light ─────────────────────────────────────────────────

function DashboardMockup() {
  const bars = [35, 55, 42, 70, 48, 65, 82, 58, 72, 88, 45, 90]
  const cats = [
    { name: 'Moradia',     pct: 32, color: '#3b82f6' },
    { name: 'Alimentação', pct: 22, color: '#60a5fa' },
    { name: 'Transporte',  pct: 15, color: '#4ade80' },
    { name: 'Assinaturas', pct: 9,  color: '#a78bfa' },
  ]
  return (
    <div className="relative mx-auto mt-16" style={{ maxWidth: 860, perspective: '1200px' }}>
      {/* Glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: '-20px 40px', bottom: -40,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.15), transparent 70%)',
        filter: 'blur(40px)', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        transform: 'rotateX(5deg) rotateY(-1deg)',
        transformOrigin: 'center top',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid #CBD5E1',
        boxShadow: '0 24px 80px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
      }}>
        {/* Browser chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: '#F1F5F9',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <div style={{
            marginLeft: 12, flex: 1, borderRadius: 6, padding: '4px 12px',
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            fontSize: 11, color: '#94A3B8',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Shield style={{ width: 9, height: 9, color: '#4ade80', flexShrink: 0 }} />
            app.saooz.com/central
          </div>
        </div>

        {/* Dashboard body */}
        <div style={{ background: '#FFFFFF', display: 'grid', gridTemplateColumns: '52px 1fr' }}>
          {/* Sidebar */}
          <div style={{
            background: '#F8FAFC', borderRight: '1px solid #E2E8F0',
            padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            {['#3b82f6','#60a5fa','#4ade80','#a78bfa','#f59e0b'].map((c, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 8,
                background: i === 0 ? 'rgba(59,130,246,0.12)' : '#F1F5F9',
                border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.3)' : '#E2E8F0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: i === 0 ? '50%' : 2, background: i === 0 ? c : '#CBD5E1', opacity: i === 0 ? 1 : 0.7 }} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '14px 16px', minHeight: 300 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Central financeira</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Abril 2026</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['PF','PJ'].map((t, i) => (
                  <span key={t} style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: i === 0 ? 'rgba(59,130,246,0.10)' : '#F1F5F9',
                    color: i === 0 ? '#2563eb' : '#94A3B8',
                    border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.25)' : '#E2E8F0'}`,
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Saldo disponível', value: 'R$ 8.420',  color: '#16a34a',  delta: '+12%'  },
                { label: 'Entradas do mês',  value: 'R$ 12.800', color: '#2563eb',  delta: 'estável' },
                { label: 'Saídas do mês',    value: 'R$ 4.380',  color: '#dc2626',  delta: '-8%'   },
                { label: 'Consumo mensal',   value: '34%',        color: '#7c3aed',  delta: 'ideal' },
              ].map((m) => (
                <div key={m.label} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '9px 11px' }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 9, marginTop: 2, padding: '1px 5px', borderRadius: 4, background: '#F1F5F9', display: 'inline-block', color: m.color }}>{m.delta}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 8, marginBottom: 10 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fluxo de caixa — 2026</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
                  {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h}%`, background: i >= 10 ? 'rgba(59,130,246,0.15)' : `rgba(59,130,246,${0.25 + h / 280})`, border: i === 11 ? '1px solid rgba(59,130,246,0.4)' : 'none' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {['Jan','Fev','Mar','Abr'].map(m => <span key={m} style={{ fontSize: 8, color: '#CBD5E1' }}>{m}</span>)}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorias</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cats.map((c) => (
                    <div key={c.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 9, color: '#64748B' }}>{c.name}</span>
                        <span style={{ fontSize: 9, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: '#E2E8F0' }}>
                        <div style={{ height: '100%', borderRadius: 2, width: `${c.pct}%`, background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI preview */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistente IA · SAOOZ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                  Alimentação subiu 18% em abril. Quer revisar a meta?
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px 0 8px 8px', padding: '6px 10px', fontSize: 10, color: '#475569' }}>
                  Sim — qual seria o valor ideal?
                </div>
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
                  Com base no histórico, R$ 1.100/mês mantém o padrão sem pressão no caixa.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to top, #FFFFFF, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
    </div>
  )
}

// ─── Feature Visuals — light ──────────────────────────────────────────────────

function FeatureVisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>Pessoal · PF</span>
          <span style={{ fontSize: 10, background: '#EFF6FF', color: '#2563eb', padding: '2px 7px', borderRadius: 6, border: '1px solid #BFDBFE' }}>Abril 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4 }}>Saldo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>R$ 8.420</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4 }}>Saídas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>R$ 4.380</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>Empresa · PJ</span>
          <span style={{ fontSize: 10, background: '#EFF6FF', color: '#3b82f6', padding: '2px 7px', borderRadius: 6, border: '1px solid #BFDBFE' }}>Abril 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4 }}>Faturamento</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>R$ 28.5k</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4 }}>Lucro</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>R$ 15.8k</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {['PF', 'PJ', 'Ambos'].map((t, i) => (
          <span key={t} style={{
            fontSize: 11, padding: '4px 14px', borderRadius: 20, fontWeight: 600,
            background: i === 0 ? '#EFF6FF' : '#F8FAFC',
            color: i === 0 ? '#2563eb' : '#94A3B8',
            border: `1px solid ${i === 0 ? '#BFDBFE' : '#E2E8F0'}`,
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function FeatureVisualCategories() {
  const cats = [
    { name: 'Moradia',     pct: 32, color: '#3b82f6' },
    { name: 'Alimentação', pct: 22, color: '#ef4444' },
    { name: 'Transporte',  pct: 15, color: '#16a34a' },
    { name: 'Lazer',       pct: 9,  color: '#f59e0b' },
  ]
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '22px 24px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Gastos por categoria</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {cats.map((c) => (
          <div key={c.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#F1F5F9' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${c.pct * 2.8}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>⚠</span>
        <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Alimentação +18% — acima do padrão</span>
      </div>
    </div>
  )
}

function FeatureVisualDRE() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '22px 24px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 10, background: '#EFF6FF', color: '#2563eb', padding: '3px 9px', borderRadius: 6, border: '1px solid #BFDBFE', fontWeight: 600 }}>Simples Nacional</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Faturamento', value: 'R$ 28.500', color: '#16a34a' },
          { label: 'Despesas',    value: 'R$ 11.200', color: '#dc2626' },
          { label: 'Imposto',     value: 'R$ 1.425',  color: '#d97706' },
          { label: 'Lucro',       value: 'R$ 15.875', color: '#2563eb' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureVisualChat() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '22px 24px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Brain style={{ width: 14, height: 14, color: '#fff' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Assistente IA · SAOOZ</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#1E293B', lineHeight: 1.55 }}>
          Em abril você gastou R$ 4.380 — 12% acima de março. Quer ver onde aumentou?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '12px 0 12px 12px', padding: '10px 13px', fontSize: 12, color: '#475569' }}>
          Sim, onde foi?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#1E293B', lineHeight: 1.55 }}>
          Alimentação +R$ 340 e assinaturas +R$ 180. Posso sugerir um ajuste de meta?
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesLanding() {
  return (
    <>
      <style>{`
        @keyframes saooz-orbit1  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit2  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit2r { to { transform: rotate(-360deg); } }
        @keyframes saooz-orbit3  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit3r { to { transform: rotate(-360deg); } }

        .saooz-landing { background: #FFFFFF; color: #475569; }
        .saooz-nav-link { color: #64748B; font-size: 14px; font-weight: 500; transition: color 0.15s; text-decoration: none; }
        .saooz-nav-link:hover { color: #0F172A; }

        .saooz-details summary::-webkit-details-marker { display: none; }
        .saooz-details[open] .saooz-chevron { transform: rotate(90deg); }
        .saooz-chevron { transition: transform 0.2s; }

        @media (max-width: 768px) {
          .md-grid-2 { grid-template-columns: 1fr !important; }
          .md-order-1 { order: 1 !important; }
          .md-order-2 { order: 2 !important; }
          .md-hidden { display: none !important; }
          .sm-grid-1 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="saooz-landing force-light relative min-h-screen overflow-x-hidden">

        {/* ══════════════════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════════════════ */}
        <header className="relative z-20 sticky top-0" style={{
          borderBottom: '1px solid #E2E8F0',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
        }}>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <SaoozWordmark size="sm" />
            <nav className="md-hidden hidden items-center gap-7 md:flex">
              {[
                ['#visao', 'Como funciona'],
                ['#recursos', 'Recursos'],
                ['#precos', 'Preços'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="saooz-nav-link">{label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-medium transition-colors"
                style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-semibold text-white"
                style={{ background: '#1d4ed8' }}
              >
                Assinar agora <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ══════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════ */}
          <section className="relative mx-auto w-full max-w-6xl px-4 pt-20 pb-0 md:px-6 md:pt-28">
            {/* Background glow */}
            <div aria-hidden style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 800, height: 400,
              background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.08), transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Orbital rings */}
            <div aria-hidden className="pointer-events-none select-none" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <svg viewBox="0 0 800 800" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -55%)',
                width: 'min(900px, 130vw)', height: 'min(900px, 130vw)',
                opacity: 0.12,
              }}>
                <circle cx="400" cy="400" r="340" fill="none" stroke="url(#hr3)" strokeWidth="1" strokeDasharray="4 14" />
                <circle cx="400" cy="400" r="240" fill="none" stroke="url(#hr2)" strokeWidth="1" strokeDasharray="5 18" />
                <circle cx="400" cy="400" r="150" fill="none" stroke="url(#hr1)" strokeWidth="1" strokeDasharray="3 12" />
                <defs>
                  <linearGradient id="hr1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="hr2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="hr3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" /><stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mx-auto max-w-4xl text-center relative" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Tag */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 16px', borderRadius: 100,
                  background: '#EFF6FF', border: '1px solid #BFDBFE',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#2563eb',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px 2px rgba(59,130,246,0.4)', display: 'inline-block' }} />
                  Sistema de Gestão Financeira Premium
                </span>
              </div>

              {/* H1 */}
              <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.08, color: '#0F172A', margin: 0 }}>
                Quem vive sem visão financeira{' '}
                <br className="hidden md:block" />
                <span style={{ color: '#1d4ed8' }}>opera no improviso — e paga caro.</span>
              </h1>

              {/* Sub */}
              <p className="mx-auto max-w-2xl" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', lineHeight: 1.75, color: '#475569', margin: 0 }}>
                O SAOOZ foi construído para devolver comando sobre a vida financeira e o negócio. Pessoal e empresarial em um único sistema — com inteligência que lê seus dados reais e entrega clareza antes que o problema apareça.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 font-bold text-white"
                  style={{
                    height: 52, padding: '0 32px', borderRadius: 12, fontSize: 16,
                    background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                    boxShadow: '0 8px 32px rgba(29,78,216,0.25)',
                  }}
                >
                  Assumir o controle <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#visao"
                  className="inline-flex items-center gap-2 font-medium"
                  style={{
                    height: 52, padding: '0 28px', borderRadius: 12, fontSize: 15,
                    border: '1px solid #E2E8F0', color: '#475569', background: 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  Ver como funciona
                </a>
              </div>

              {/* Sub-CTA */}
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                7 dias de garantia · Cancele quando quiser · Sem fidelidade
              </p>
            </div>

            {/* Dashboard Mockup */}
            <DashboardMockup />
          </section>

          {/* ══════════════════════════════════════════════════════════
              VERDADE INCÔMODA
          ══════════════════════════════════════════════════════════ */}
          <section id="visao" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
              <div className="mb-16 text-center" style={{ maxWidth: 680, margin: '0 auto 64px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 16 }}>
                  A verdade que ninguém quer nomear
                </p>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: '0 0 20px' }}>
                  A maioria não está sem dinheiro.
                  <br />Está sem visão.
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#64748B', margin: 0 }}>
                  Trabalhar, faturar e pagar contas não é o mesmo que ter clareza financeira. O caos pode existir mesmo com renda boa — e quase sempre existe.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="md-grid-2">
                {[
                  {
                    icon: '◎',
                    title: 'Você não sabe o que sobra de verdade.',
                    body: 'Saldo na conta não é sobra. Impostos, despesas recorrentes e gastos invisíveis comem a margem antes de você perceber. No fim do mês, o número nunca fecha onde você esperava.',
                  },
                  {
                    icon: '⊗',
                    title: 'Pessoal e empresa misturados destroem a clareza.',
                    body: 'Misturar PF e PJ é impossível de analisar, impossível de separar e caro de descobrir tarde. Você não sabe quanto o negócio realmente gerou — e quanto entrou só porque você era a conta disponível.',
                  },
                  {
                    icon: '◻',
                    title: 'Planilha não é controle. É anotação.',
                    body: 'Planilha não tem análise automática, não detecta desvio, não separa PF de PJ, não calcula imposto, não projeta caixa. É uma promessa de organização que depende de você nunca errar e nunca esquecer.',
                  },
                  {
                    icon: '↑',
                    title: 'Ganhar mais sem visão só aumenta o caos.',
                    body: 'Aumentar faturamento sem clareza sobre para onde vai o dinheiro não resolve o problema. Mantém o mesmo descontrole em volume maior. O improviso escala junto com a receita.',
                  },
                ].map((card) => (
                  <div key={card.title} style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px 30px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <span style={{ fontSize: 22, color: '#CBD5E1', lineHeight: 1 }}>{card.icon}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: 0 }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748B', margin: 0 }}>
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              MECANISMO — O QUE O SAOOZ FAZ
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
              <div className="text-center mb-16" style={{ maxWidth: 700, margin: '0 auto 64px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 16 }}>
                  O que o SAOOZ faz de verdade
                </p>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: '0 0 20px' }}>
                  Não é mais um app financeiro.
                  <br />É estrutura de comando.
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#64748B', margin: 0 }}>
                  O SAOOZ centraliza, separa, organiza e interpreta — para você decidir com base em dados reais, não no feeling de quanto acha que sobrou.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="sm-grid-1">
                {[
                  {
                    num: '01',
                    title: 'Centraliza',
                    color: '#2563eb',
                    body: 'PF e PJ no mesmo sistema. Sem ferramentas paralelas, sem retrabalho, sem informação espalhada. Um lugar, toda a visão.',
                  },
                  {
                    num: '02',
                    title: 'Separa',
                    color: '#3b82f6',
                    body: 'Pessoal de um lado. Empresa do outro. Um clique muda o contexto. Nada se mistura. Cada lado tem sua própria lógica, categorias e análise.',
                  },
                  {
                    num: '03',
                    title: 'Interpreta',
                    color: '#7c3aed',
                    body: 'A IA lê os dados, identifica padrões, detecta desvios e entrega análises antes que o problema apareça. Dados soltos se tornam visão acionável.',
                  },
                ].map((p) => (
                  <div key={p.num} style={{
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '32px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 20, right: 20,
                      fontSize: 48, fontWeight: 900, color: p.color, opacity: 0.06, lineHeight: 1,
                    }}>{p.num}</div>
                    <div style={{ marginBottom: 20 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: p.color, padding: '4px 12px', borderRadius: 100,
                        background: '#EFF6FF', border: `1px solid #BFDBFE`,
                      }}>{p.num}</span>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 12, lineHeight: 1 }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748B', margin: 0 }}>
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FEATURE SECTIONS
          ══════════════════════════════════════════════════════════ */}
          <section id="recursos" style={{ background: '#FFFFFF' }}>

            {/* Feature 1 — PF + PJ */}
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 14px', borderRadius: 100, fontSize: 11,
                    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563eb',
                    width: 'fit-content',
                  }}>
                    Visão geral · PF + PJ
                  </span>
                  <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: 0 }}>
                    Pessoal e empresa no mesmo lugar — sem misturar nada.
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: '#475569', margin: 0 }}>
                    Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você vê cada lado com a clareza que ele merece. Dados corretos, contexto correto, decisão correta.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                    {[
                      'Painel PF e painel PJ totalmente independentes',
                      'Troca de modo com um clique — sem recarregar',
                      'Saldo, entradas e saídas sempre em tempo real',
                      'Histórico mês a mês sem perda de dados',
                    ].map((b) => (
                      <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#475569' }}>
                        <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{
                    height: 46, padding: '0 24px', borderRadius: 11, fontSize: 14, width: 'fit-content',
                    background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                  }}>
                    Criar minha conta <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="md-order-1">
                  <FeatureVisualPanels />
                </div>
              </div>
            </div>

            {/* Feature 2 — PJ Módulo */}
            <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div className="md-order-2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <FeatureVisualDRE />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="md-order-1">
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 100, fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563eb',
                      width: 'fit-content',
                    }}>
                      Módulo Empresarial · PJ
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: 0 }}>
                      O que só o contador sabia, agora você vê no mesmo dia.
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#475569', margin: 0 }}>
                      DRE, fluxo de caixa e imposto estimado — calculados pelo regime tributário correto, atualizados com cada lançamento. Você fecha o mês com o número real. Sem esperar ninguém.
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {[
                        'Imposto calculado por regime: MEI, Simples, Presumido, Real',
                        'DRE mensal gerado automaticamente com cada lançamento',
                        'Fluxo de caixa com projeção e datas de vencimento',
                        'Pró-labore, distribuição de lucros e gestão de sócios',
                      ].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#475569' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{
                      height: 46, padding: '0 24px', borderRadius: 11, fontSize: 14, width: 'fit-content',
                      background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                    }}>
                      Gerenciar minha empresa <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 — PF Módulo */}
            <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 100, fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563eb',
                      width: 'fit-content',
                    }}>
                      Módulo Pessoal · PF
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: 0 }}>
                      Visão pessoal que você nunca teve — e precisava.
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#475569', margin: 0 }}>
                      Do saldo real ao breakdown de cada categoria. A IA acompanha o padrão dos seus gastos e avisa quando algo sobe fora do normal — antes de virar problema no fechamento do mês.
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {[
                        'Despesas com 16 categorias e análise de tendência',
                        'Alerta automático quando um gasto sobe além do padrão',
                        'Reserva de emergência com meta, progresso e recomendação',
                        'Carteira de investimentos pessoal com histórico de movimentações',
                      ].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#475569' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{
                      height: 46, padding: '0 24px', borderRadius: 11, fontSize: 14, width: 'fit-content',
                      background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                    }}>
                      Ver meus gastos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <FeatureVisualCategories />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 — IA */}
            <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="md-grid-2">
                  <div className="md-order-2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <FeatureVisualChat />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="md-order-1">
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 100, fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563eb',
                      width: 'fit-content',
                    }}>
                      Inteligência Artificial
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', margin: 0 }}>
                      Uma IA que conhece seus números.
                      <br />Não uma IA genérica.
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#475569', margin: 0 }}>
                      Diferente do ChatGPT, o assistente do SAOOZ acessa seu histórico real de entradas, saídas, categorias e operação PF/PJ. A resposta é sobre você — não sobre &ldquo;o usuário médio&rdquo;. Registre um gasto em linguagem natural. Pergunte o que quiser sobre seus dados. Ouça a análise em áudio.
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                      {[
                        'Acessa seu histórico real — não exemplos genéricos',
                        'Registra lançamentos por linguagem natural ou voz',
                        'Compara meses, detecta desvios, sugere ajustes de meta',
                        'Plano PRO: IA ilimitada — PF/PJ: 60 ações por mês',
                      ].map((b) => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#475569' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{
                      height: 46, padding: '0 24px', borderRadius: 11, fontSize: 14, width: 'fit-content',
                      background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                    }}>
                      Conversar com a IA <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* ══════════════════════════════════════════════════════════
              SEGURANÇA
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="text-center mb-12" style={{ maxWidth: 580, margin: '0 auto 48px' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
                  Seus dados pertencem a você.
                </h2>
                <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
                  Construído com os padrões de segurança dos bancos digitais.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="sm-grid-1">
                {[
                  { Icon: Shield,       title: 'Criptografia AES-256',    desc: 'Os mesmos padrões usados por bancos digitais. Seus dados em trânsito e em repouso são protegidos.' },
                  { Icon: CheckCircle2, title: 'Sem senha bancária',       desc: 'Nunca pedimos e nunca armazenamos credenciais bancárias. Integrações são feitas por tokens de leitura.' },
                  { Icon: BadgeCheck,   title: 'Somente leitura',         desc: 'A IA analisa seus dados mas não executa nenhuma transação. Você tem controle total sobre cada ação.' },
                  { Icon: Shield,       title: 'Exclusão sob demanda',     desc: 'Apague todos os seus dados a qualquer momento. Sem burocracia, sem formulário, sem espera de 30 dias.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon className="h-5 w-5" style={{ color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: '#64748B', margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PARA QUEM É
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="text-center mb-12" style={{ margin: '0 auto 48px' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
                  Para quem o SAOOZ foi construído
                </h2>
                <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
                  Não para todo mundo. Para quem precisa de visão real e está cansado de improvisar.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="sm-grid-1">
                {[
                  {
                    Icon: User,
                    title: 'Profissional com renda variável',
                    description: 'Freelancers, consultores e autônomos que precisam de previsibilidade e método — sem depender de contador para entender o básico do próprio dinheiro.',
                  },
                  {
                    Icon: Building2,
                    title: 'Empresário com operação PJ',
                    description: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto corretamente e fechar o mês sem planilha paralela ou ferramenta adicional.',
                  },
                  {
                    Icon: Layers,
                    title: 'Quem tem PF + PJ ao mesmo tempo',
                    description: 'Renda pessoal e empresarial ao mesmo tempo, precisando de visão total em um único sistema — sem retrabalho, sem confusão, sem mistura.',
                  },
                ].map(({ Icon, title, description }) => (
                  <div key={title} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon className="h-5 w-5" style={{ color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748B', margin: 0 }}>{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              DEPOIMENTOS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="text-center mb-12" style={{ margin: '0 auto 48px' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
                  Quem já usa, fala.
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="sm-grid-1">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: '#475569', margin: 0, fontStyle: 'italic' }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PREÇOS
          ══════════════════════════════════════════════════════════ */}
          <section id="precos" style={{ background: '#F8FAFC' }}>
            <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-4 md:px-6 text-center">
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 16 }}>
                Planos
              </p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
                Sem enrolação. Escolha o plano.
              </h2>
              <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
                Cada plano com 7 dias de garantia — reembolso total se não for o que esperava.
              </p>
            </div>
            <PricingSection />
          </section>

          {/* ══════════════════════════════════════════════════════════
              GARANTIA
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#EFF6FF', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
            <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6 text-center">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#DBEAFE', border: '1px solid #BFDBFE', marginBottom: 28 }}>
                <Shield className="h-7 w-7" style={{ color: '#1d4ed8' }} />
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 20px', lineHeight: 1.15 }}>
                7 dias de garantia. Ponto.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: '#475569', margin: '0 0 16px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor pago. Sem formulário longo, sem e-mail de retenção, sem pergunta sobre o motivo.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#64748B', margin: '0 0 36px' }}>
                Não é trial. É a compra com segurança de que você não está apostando no escuro.
              </p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold text-white" style={{
                height: 52, padding: '0 32px', borderRadius: 12, fontSize: 15,
                background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                boxShadow: '0 8px 32px rgba(29,78,216,0.2)',
              }}>
                Assinar com garantia <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FAQ
          ══════════════════════════════════════════════════════════ */}
          <section id="faq" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6">
              <div className="text-center mb-12">
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, color: '#0F172A', margin: '0 0 12px' }}>
                  Perguntas diretas. Respostas diretas.
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQ_ITEMS.map((item) => (
                  <details key={item.q} className="saooz-details" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', fontSize: 14, fontWeight: 600, color: '#0F172A', userSelect: 'none' }}>
                      {item.q}
                      <ChevronRight className="saooz-chevron h-4 w-4 shrink-0" style={{ color: '#94A3B8' }} />
                    </summary>
                    <div style={{ padding: '0 20px 18px' }}>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748B', margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p className="mt-8 text-center" style={{ fontSize: 13, color: '#94A3B8' }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                  Fale com o suporte
                </a>
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              CTA FINAL — dark accent section (contraste intencional)
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#0F172A', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 700, height: 400,
              background: 'radial-gradient(ellipse at center, rgba(29,78,216,0.18), transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div className="mx-auto w-full max-w-5xl px-4 py-28 md:px-6 text-center relative" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa', margin: 0 }}>
                Chega de improvisar
              </p>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, lineHeight: 1.1, color: '#F1F5F9', margin: 0 }}>
                Você já passou tempo suficiente
                <br />no escuro financeiro.
              </h2>
              <p className="mx-auto" style={{ fontSize: 16, lineHeight: 1.75, color: '#64748B', maxWidth: 560, margin: 0 }}>
                Assine agora e tenha visão, separação e controle sobre a vida financeira e o negócio — sem planilha, sem feeling, sem esperar o fim do mês para entender onde foi o dinheiro.
              </p>
              <Link href="/cadastro" className="inline-flex items-center gap-2 font-bold" style={{
                height: 56, padding: '0 40px', borderRadius: 14, fontSize: 16,
                background: '#FFFFFF', color: '#0F172A',
                boxShadow: '0 8px 40px rgba(255,255,255,0.12)',
              }}>
                Assumir o controle agora <ArrowRight className="h-5 w-5" />
              </Link>
              <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                7 dias de garantia · Cancele quando quiser · Sem fidelidade
              </p>
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48 }} className="sm-grid-1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SaoozWordmark size="sm" />
                <p style={{ fontSize: 13, lineHeight: 1.65, color: '#64748B', maxWidth: 260, margin: 0 }}>
                  Sistema de gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
                <a href="mailto:suporte@saooz.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
                  <Mail className="h-4 w-4" style={{ color: '#2563eb' }} /> suporte@saooz.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 16 }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([href, label]) => (
                    <Link key={href} href={href} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 16 }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['#visao','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: 12, color: '#CBD5E1' }}>
              © 2025 SAOOZ · Todos os direitos reservados
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
