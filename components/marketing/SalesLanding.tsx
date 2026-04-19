import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Building2,
  CheckCircle2, ChevronRight, Landmark, Layers,
  Mail, MessageCircle, Shield, Star, User, Zap,
} from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOR_WHOM = [
  { icon: User,      color: '#2563EB', title: 'Profissional com renda variável',    description: 'Freelancers, consultores e autônomos que precisam de previsibilidade e método sem depender de contador para entender o básico.' },
  { icon: Building2, color: '#1D4ED8', title: 'Empresário com operação PJ',         description: 'MEIs e pequenas empresas que precisam separar pessoa e empresa sem planilha paralela ou ferramenta adicional.' },
  { icon: Layers,    color: '#2563EB', title: 'Operação PF + PJ unificada',         description: 'Quem tem renda pessoal e empresarial e precisa de visão total do dinheiro em um único sistema, sem retrabalho.' },
]

const TESTIMONIALS = [
  { name: 'Lucas M.',    role: 'Designer · MEI',               quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.', stars: 5 },
  { name: 'Fernanda C.', role: 'Consultora PJ',                quote: 'O módulo de impostos me economiza tempo toda semana. Antes abria 3 ferramentas diferentes só para montar o número básico.', stars: 5 },
  { name: 'Rafael S.',   role: 'Gestor de tráfego · Autônomo', quote: 'A IA identifica onde está o vazamento antes do fim do mês. Muda completamente como tomo decisão sobre investimento e gasto.', stars: 5 },
]

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?',                a: 'Se você assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas, sem burocracia.' },
  { q: 'Quando começa a cobrança?',                     a: 'Imediatamente após a confirmação do pagamento. Se decidir cancelar nos primeiros 7 dias, reembolsamos o valor integral. Sem fidelidade, sem multa de saída.' },
  { q: 'Posso usar PF e PJ no mesmo plano?',           a: 'Sim, com o plano PRO você tem acesso aos dois módulos em uma única conta. Se precisar só de um, os planos PF ou PJ são mais indicados e mais baratos.' },
  { q: 'Consigo ter mais de uma empresa cadastrada?',  a: 'Sim. O plano PJ suporta até 3 empresas e o PRO até 5. Ideal para quem opera mais de um CNPJ ou tem diferentes frentes de negócio.' },
  { q: 'Em quanto tempo configuro o SAOOZ?',           a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.' },
  { q: 'O assistente IA usa meus dados reais?',        a: 'Sim. O assistente conhece seu contexto financeiro real — renda, gastos, categorias e operação PF/PJ — e entrega análises orientadas ao seu momento, não respostas genéricas de ChatGPT.' },
  { q: 'Posso migrar de plano depois?',                a: 'Sim. Você pode trocar de plano a qualquer momento pelo painel de configurações. Sem perda de dados, sem burocracia.' },
]

// ─── Orbital Ring System (pure SVG + CSS) ────────────────────────────────────

function OrbitalSystem() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {/* Rotating rings via SVG */}
      <svg
        viewBox="0 0 800 800"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          width: 'min(900px, 130vw)',
          height: 'min(900px, 130vw)',
          opacity: 0.35,
        }}
      >
        {/* Outer ring */}
        <circle cx="400" cy="400" r="340" fill="none" stroke="url(#ring3)" strokeWidth="1" strokeDasharray="4 12" />
        {/* Middle ring */}
        <circle cx="400" cy="400" r="240" fill="none" stroke="url(#ring2)" strokeWidth="1" strokeDasharray="6 16" />
        {/* Inner ring */}
        <circle cx="400" cy="400" r="150" fill="none" stroke="url(#ring1)" strokeWidth="1" strokeDasharray="3 10" />
        {/* Center glow */}
        <circle cx="400" cy="400" r="60" fill="url(#center)" opacity="0.6" />
        <circle cx="400" cy="400" r="20" fill="url(#centerDot)" />

        <defs>
          <radialGradient id="center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerDot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#2563EB" />
          </radialGradient>
          <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="ring2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="ring3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting dots — CSS animations */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          width: 'min(900px, 130vw)',
          height: 'min(900px, 130vw)',
        }}
      >
        {/* Dot 1 — inner ring */}
        <div style={{ position: 'absolute', inset: 0, animation: 'saooz-orbit1 10s linear infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: '#2563EB', boxShadow: '0 0 10px 3px #2563EB60', transform: 'translate(-50%, calc(-50% - min(168px, 18.7vw)))' }} />
        </div>
        {/* Dot 2 — middle ring */}
        <div style={{ position: 'absolute', inset: 0, animation: 'saooz-orbit2 16s linear infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 10, height: 10, borderRadius: '50%', background: '#1D4ED8', boxShadow: '0 0 14px 4px #1D4ED860', transform: 'translate(-50%, calc(-50% - min(270px, 30vw)))' }} />
        </div>
        {/* Dot 3 — middle ring counter */}
        <div style={{ position: 'absolute', inset: 0, animation: 'saooz-orbit2r 22s linear infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px 3px #22c55e60', transform: 'translate(-50%, calc(-50% - min(270px, 30vw)))' }} />
        </div>
        {/* Dot 4 — outer ring */}
        <div style={{ position: 'absolute', inset: 0, animation: 'saooz-orbit3 28s linear infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 16px 5px #60A5FA40', transform: 'translate(-50%, calc(-50% - min(383px, 42.5vw)))' }} />
        </div>
        {/* Dot 5 — outer ring offset */}
        <div style={{ position: 'absolute', inset: 0, animation: 'saooz-orbit3r 20s linear infinite' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 12px 4px #f59e0b50', transform: 'translate(-50%, calc(-50% - min(383px, 42.5vw)))' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Mockup (detailed, realistic) ──────────────────────────────────

function DashboardMockup() {
  const bars = [35, 55, 42, 70, 48, 65, 82, 58, 72, 88, 45, 90]
  const cats = [
    { name: 'Moradia',     pct: 32, val: 'R$ 1.400', color: '#2563EB' },
    { name: 'Alimentação', pct: 22, val: 'R$ 963',   color: '#60A5FA' },
    { name: 'Transporte',  pct: 15, val: 'R$ 656',   color: '#22c55e' },
    { name: 'Assinaturas', pct: 9,  val: 'R$ 394',   color: '#1D4ED8' },
    { name: 'Outros',      pct: 22, val: 'R$ 963',   color: '#f59e0b' },
  ]
  return (
    <div
      className="relative mx-auto mt-16"
      style={{ maxWidth: 900, perspective: '1200px' }}
    >
      {/* Glow under the card */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: '-20px 40px', bottom: -40,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(37,99,235,0.18), transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          transform: 'rotateX(6deg) rotateY(-1deg)',
          transformOrigin: 'center top',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(37,99,235,0.25)',
          boxShadow: '0 40px 100px rgba(37,99,235,0.14), 0 0 0 1px rgba(226,232,240,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <div
            style={{
              marginLeft: 12, flex: 1, borderRadius: 6, padding: '4px 12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              fontSize: 11, color: '#94A3B8',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Shield style={{ width: 10, height: 10, color: '#22c55e' }} />
            app.saooz.com/central
          </div>
        </div>

        {/* Dashboard body */}
        <div style={{ background: '#FFFFFF', padding: 0 }}>

          {/* Sidebar + content */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr' }}>

            {/* Mini sidebar */}
            <div
              style={{
                background: '#F8FAFC',
                borderRight: '1px solid #E2E8F0',
                padding: '12px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}
            >
              {['#2563EB','#60A5FA','#22c55e','#1D4ED8','#f59e0b'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? `rgba(37,99,235,0.15)` : '#F1F5F9', border: `1px solid ${i === 0 ? 'rgba(37,99,235,0.3)' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: i === 0 ? '50%' : 2, background: i === 0 ? c : '#CBD5E1', opacity: i === 0 ? 1 : 0.6 }} />
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ padding: '14px 16px', minHeight: 320 }}>

              {/* Top header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Central financeira</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Abril 2026</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['PF','PJ'].map((t, i) => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: i === 0 ? 'rgba(37,99,235,0.12)' : '#F1F5F9', color: i === 0 ? '#2563EB' : '#64748B', border: `1px solid ${i === 0 ? 'rgba(37,99,235,0.25)' : '#E2E8F0'}` }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Saldo disponível', value: 'R$ 8.420', color: '#22c55e', delta: '+12%' },
                  { label: 'Entradas do mês',  value: 'R$ 12.800', color: '#2563EB', delta: 'estável' },
                  { label: 'Saídas do mês',    value: 'R$ 4.380',  color: '#f87171', delta: '-8%' },
                  { label: 'Consumo mensal',   value: '34%',       color: '#1D4ED8', delta: 'ideal' },
                ].map((m) => (
                  <div key={m.label} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 9, marginTop: 3, padding: '1px 5px', borderRadius: 4, background: `rgba(0,0,0,0.05)`, display: 'inline-block', color: m.color }}>{m.delta}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 8, marginBottom: 12 }}>

                {/* Bar chart */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fluxo de caixa — 2026</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
                    {bars.map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h}%`, background: i >= 10 ? `rgba(37,99,235,0.25)` : `rgba(37,99,235,${0.4 + h / 200})`, border: i === 11 ? '1px solid rgba(37,99,235,0.5)' : 'none' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {['Jan','Fev','Mar','Abr'].map(m => (
                      <span key={m} style={{ fontSize: 8, color: '#CBD5E1' }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Category breakdown */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorias</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {cats.slice(0, 4).map((c) => (
                      <div key={c.name} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: '#475569' }}>{c.name}</span>
                          <span style={{ fontSize: 9, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: '#F1F5F9' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI chat preview */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistente IA · Saooz</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '75%', background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.15)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
                    Seus gastos com alimentação subiram 18% em abril. Deseja revisar a meta da categoria?
                  </div>
                  <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: '#F1F5F9', borderRadius: '8px 0 8px 8px', padding: '6px 10px', fontSize: 10, color: '#334155' }}>
                    Sim — sugira um valor realista.
                  </div>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.15)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
                    Com base no histórico, R$ 1.100/mês mantém o padrão sem pressão no caixa.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(to top, #FFFFFF, transparent)',
          pointerEvents: 'none', zIndex: 2,
        }}
      />
    </div>
  )
}

// ─── Feature Visual Cards ──────────────────────────────────────────────────────

function FeatureVisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
      {/* PF Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>Pessoal (PF)</span>
          <span style={{ fontSize: 10, background: 'rgba(37,99,235,0.1)', color: '#2563EB', padding: '2px 7px', borderRadius: 6, border: '1px solid rgba(37,99,235,0.2)' }}>Abril 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 3 }}>Saldo</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e' }}>R$ 8.420</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 3 }}>Saídas</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f87171' }}>R$ 4.380</div>
          </div>
        </div>
      </div>
      {/* PJ Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>Empresa (PJ)</span>
          <span style={{ fontSize: 10, background: 'rgba(29,78,216,0.1)', color: '#1D4ED8', padding: '2px 7px', borderRadius: 6, border: '1px solid rgba(29,78,216,0.2)' }}>Abril 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 3 }}>Faturamento</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1D4ED8' }}>R$ 28.5k</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 3 }}>Lucro</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e' }}>R$ 15.8k</div>
          </div>
        </div>
      </div>
      {/* Toggle hint */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, background: 'rgba(37,99,235,0.1)', color: '#2563EB', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(37,99,235,0.2)', fontWeight: 600 }}>PF</span>
        <span style={{ fontSize: 11, background: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0', fontWeight: 600 }}>PJ</span>
        <span style={{ fontSize: 11, background: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0', fontWeight: 600 }}>Ambos</span>
      </div>
    </div>
  )
}

function FeatureVisualCategories() {
  const cats = [
    { name: 'Moradia',     pct: 32, color: '#2563EB' },
    { name: 'Alimentação', pct: 22, color: '#f87171' },
    { name: 'Transporte',  pct: 15, color: '#22c55e' },
    { name: 'Lazer',       pct: 9,  color: '#f59e0b' },
  ]
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '20px 22px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(30,58,138,0.10)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Gastos por categoria</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cats.map((c) => (
          <div key={c.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: '#F1F5F9' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${c.pct * 2.8}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
      {/* Alert chip */}
      <div style={{ marginTop: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>⚠</span>
        <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>↑ Alimentação +18% este mês</span>
      </div>
    </div>
  )
}

function FeatureVisualDRE() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '20px 22px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(30,58,138,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 10, background: 'rgba(37,99,235,0.1)', color: '#2563EB', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(37,99,235,0.2)', fontWeight: 600 }}>Simples Nacional</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Faturamento', value: 'R$ 28.500', color: '#22c55e' },
          { label: 'Despesas',    value: 'R$ 11.200', color: '#f87171' },
          { label: 'Imposto',     value: 'R$ 1.425',  color: '#f59e0b' },
          { label: 'Lucro',       value: 'R$ 15.875', color: '#2563EB' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureVisualChat() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '20px 22px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(30,58,138,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain style={{ width: 14, height: 14, color: '#fff' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Assistente IA · SAOOZ</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.15)', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
          Em abril você gastou R$ 4.380, 12% mais que março. Quer ver onde subiu?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: '#F1F5F9', borderRadius: '12px 0 12px 12px', padding: '10px 13px', fontSize: 12, color: '#334155' }}>
          Sim, onde foi?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.15)', borderRadius: '0 12px 12px 12px', padding: '10px 13px', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
          Alimentação +R$ 340 e assinaturas +R$ 180. Posso sugerir ajuste?
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesLanding() {
  return (
    <>
      {/* ── Keyframe animations injected once ── */}
      <style>{`
        @keyframes saooz-orbit1  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit2  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit2r { to { transform: rotate(-360deg); } }
        @keyframes saooz-orbit3  { to { transform: rotate(360deg); } }
        @keyframes saooz-orbit3r { to { transform: rotate(-360deg); } }
        @keyframes saooz-float   { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-24px); } }
        @keyframes saooz-pulse   { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes saooz-shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
        @keyframes saooz-spin-slow { to { transform: rotate(360deg); } }
        @keyframes saooz-grid-fade { 0%,100%{opacity:0.04} 50%{opacity:0.08} }
      `}</style>

      <div className="force-light relative min-h-screen overflow-x-hidden" style={{ background: '#FFFFFF', color: '#334155' }}>

        {/* ══════════════════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════════════════ */}
        <header
          className="relative z-20 sticky top-0"
          style={{
            borderBottom: '1px solid #E2E8F0',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 1px 8px rgba(30,58,138,0.06)',
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <SaoozWordmark size="sm" />
            <nav className="hidden items-center gap-6 md:flex">
              {[
                ['#como-funciona', 'Como funciona'],
                ['#recursos', 'Recursos'],
                ['#precos', 'Preços'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium transition-colors hover:text-[#1E3A8A]"
                  style={{ color: '#475569' }}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-medium transition-colors"
                style={{ color: '#475569', border: '2px solid #E2E8F0' }}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}
              >
                Começar grátis <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ══════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════ */}
          <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-0 md:px-6 md:pt-24">
            {/* Orbital system behind hero */}
            <OrbitalSystem />

            <div className="mx-auto max-w-4xl text-center space-y-6 relative">
              {/* Pill tag */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                Controle financeiro pessoal e empresarial
              </div>

              {/* H1 */}
              <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.75rem)', fontWeight: 900, lineHeight: 1.1, color: '#0F172A' }}>
                Você sabe quanto entrou.
                <br />
                <span style={{ color: '#1D4ED8' }}>Mas sabe onde foi?</span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: '#64748B' }}>
                O SAOOZ conecta sua conta bancária via Open Finance, categoriza tudo automaticamente e mostra — antes do fim do mês — o que precisa da sua atenção. Para pessoa física, empresa ou os dois.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/cadastro"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] px-7 text-base font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)', boxShadow: '0 8px 32px rgba(30,58,138,0.3)' }}
                >
                  Começar agora — é grátis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] px-7 text-base font-medium"
                  style={{ border: '2px solid #1E3A8A', color: '#1E3A8A', background: '#FFFFFF' }}
                >
                  Ver como funciona
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: '#94A3B8' }}>
                <span className="flex items-center gap-1.5">
                  <span style={{ color: '#f59e0b', fontSize: 16 }}>★★★★★</span>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Avaliado 5 estrelas pelos usuários</span>
                </span>
                <span style={{ color: '#E2E8F0' }}>·</span>
                <span style={{ color: '#64748B' }}>Open Finance · regulamentado pelo Banco Central</span>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <DashboardMockup />
          </section>

          {/* ══════════════════════════════════════════════════════════
              TRUST BAR / LOGOS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
              <p className="text-center text-sm font-medium mb-8" style={{ color: '#94A3B8' }}>
                Construído com os padrões que você espera de um banco
              </p>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { Icon: Shield,      label: 'Criptografia AES-256' },
                  { Icon: BadgeCheck,  label: 'Open Finance oficial' },
                  { Icon: Zap,         label: 'IA com seus dados reais' },
                  { Icon: CheckCircle2, label: 'Cancele quando quiser' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
                      style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <Icon className="h-5 w-5" style={{ color: '#1E3A8A' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#475569' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              COMO FUNCIONA
          ══════════════════════════════════════════════════════════ */}
          <section id="como-funciona" style={{ background: '#FFFFFF' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-14 text-center">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                  Simples de começar, poderoso para usar
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  { num: '1', title: 'Crie sua conta',                  desc: 'Dois minutos. Nome, e-mail, senha. Sem cartão de crédito agora.' },
                  { num: '2', title: 'Conecte seu banco',               desc: 'Via Open Finance, regulamentado pelo Banco Central. As transações entram sozinhas.' },
                  { num: '3', title: 'Feche o mês sabendo tudo',        desc: 'A IA organiza, categoriza e avisa antes que o problema apareça.' },
                ].map((step) => (
                  <div key={step.num} className="relative text-center space-y-4 p-8 rounded-[18px]"
                    style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                    <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center text-2xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                      {step.num}
                    </div>
                    <h3 className="text-base font-bold" style={{ color: '#0F172A' }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FEATURE SECTIONS (alternadas, estilo Pierre)
          ══════════════════════════════════════════════════════════ */}
          <section id="recursos" style={{ background: '#F8FAFC' }}>

            {/* Feature 1 — texto esquerda, visual direita */}
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                {/* Texto */}
                <div className="space-y-6">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                    Visão geral
                  </span>
                  <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                    Pessoal e empresa no mesmo lugar — sem misturar
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                    Um painel para o seu financeiro pessoal. Outro para a empresa. Um clique separa os dois. Você vê cada lado com clareza — e ainda consegue comparar quando quiser.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Painel PF e painel PJ independentes',
                      'Troca de modo com um clique no topo',
                      'Saldo, entradas e saídas sempre atualizados',
                      'Histórico mês a mês sem perder nenhum dado',
                    ].map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                        <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: '#1E3A8A' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                    Criar minha conta <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {/* Visual */}
                <div className="flex justify-center md:justify-end">
                  <div style={{ borderRadius: 20, padding: 24, background: '#FFFFFF', boxShadow: '0 20px 60px rgba(30,58,138,0.12)', border: '1px solid #E2E8F0', width: '100%', maxWidth: 400 }}>
                    <FeatureVisualPanels />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 — texto direita, visual esquerda */}
            <div style={{ background: '#FFFFFF' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                  {/* Visual (esquerda) */}
                  <div className="flex justify-center md:justify-start order-2 md:order-1">
                    <FeatureVisualCategories />
                  </div>
                  {/* Texto (direita) */}
                  <div className="space-y-6 order-1 md:order-2">
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                      Controle pessoal
                    </span>
                    <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                      Nada some sem você saber
                    </h2>
                    <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                      Cada transação que entra pelo banco já chega categorizada. A IA acompanha o padrão dos seus gastos e avisa quando algo sobe fora do normal — antes de virar problema no fim do mês.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Categorização automática das transações',
                        'Alerta quando um gasto sobe além do padrão',
                        'Reserva de emergência com meta e progresso',
                        'Registro por texto, voz ou WhatsApp',
                      ].map((b) => (
                        <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: '#1E3A8A' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                      Controlar meus gastos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 — texto esquerda, visual direita */}
            <div style={{ background: '#F8FAFC' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                  {/* Texto */}
                  <div className="space-y-6">
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                      Módulo Empresarial
                    </span>
                    <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                      O que só contador sabia, agora você vê sozinho
                    </h2>
                    <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                      DRE, fluxo de caixa e imposto calculados automaticamente conforme o seu regime — MEI, Simples, Lucro Presumido ou Real. Você fecha o mês com o número certo, sem esperar ninguém.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Imposto calculado pelo regime tributário certo',
                        'DRE mensal gerado automaticamente',
                        'Fluxo de caixa com o que vence esta semana',
                        'Até 5 empresas no mesmo plano PRO',
                      ].map((b) => (
                        <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: '#1E3A8A' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                      Gerenciar minha empresa <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  {/* Visual */}
                  <div className="flex justify-center md:justify-end">
                    <FeatureVisualDRE />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 — texto direita, visual esquerda */}
            <div style={{ background: '#FFFFFF' }}>
              <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                  {/* Visual (esquerda) */}
                  <div className="flex justify-center md:justify-start order-2 md:order-1">
                    <FeatureVisualChat />
                  </div>
                  {/* Texto (direita) */}
                  <div className="space-y-6 order-1 md:order-2">
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                      Assistente IA
                    </span>
                    <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                      Uma IA que sabe o que entrou e o que saiu
                    </h2>
                    <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                      Diferente de um ChatGPT genérico, o assistente do SAOOZ conhece seu histórico real. Pergunta qualquer coisa &mdash; &ldquo;quanto sobrou em março?&rdquo;, &ldquo;onde estou gastando mais?&rdquo; &mdash; e a resposta vem dos seus dados, não de exemplo.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Acessa seu histórico real de entradas e saídas',
                        'Registra gastos por texto, voz ou WhatsApp',
                        'Compara meses e detecta mudanças de padrão',
                        'Funciona para PF e PJ ao mesmo tempo',
                      ].map((b) => (
                        <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                          <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: '#1E3A8A' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                      Falar com a IA <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* ══════════════════════════════════════════════════════════
              OPEN FINANCE
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                {/* Texto */}
                <div className="space-y-6">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                    Open Finance
                  </span>
                  <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                    Seu banco entra sozinho.<br />Você não digita nada.
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                    Via Open Finance — tecnologia regulamentada pelo Banco Central — suas transações chegam automaticamente no SAOOZ. Sem exportar planilha, sem copiar extrato, sem lançamento manual.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Conexão segura, sem compartilhar senha',
                      'Transações importadas e já categorizadas',
                      'Regulamentado pelo Banco Central do Brasil',
                      'Compatível com os principais bancos e fintechs',
                    ].map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                        <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: '#1E3A8A' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                    Conectar meu banco <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {/* Visual */}
                <div className="flex justify-center md:justify-end">
                  <div style={{ borderRadius: 20, padding: 28, background: '#FFFFFF', boxShadow: '0 20px 60px rgba(30,58,138,0.10)', border: '1px solid #E2E8F0', width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                        Bancos compatíveis
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {[
                          { name: 'Nubank',    color: '#820AD1' },
                          { name: 'Itaú',      color: '#EC7000' },
                          { name: 'Bradesco',  color: '#CC092F' },
                          { name: 'Santander', color: '#EC0000' },
                          { name: 'Inter',     color: '#FF7A00' },
                          { name: 'C6 Bank',   color: '#2D2D2D' },
                        ].map((bank) => (
                          <div key={bank.name} style={{ borderRadius: 10, padding: '10px 8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: bank.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{bank.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderRadius: 12, padding: '14px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Landmark style={{ width: 18, height: 18, color: '#FFFFFF' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>Conta conectada com sucesso</p>
                        <p style={{ fontSize: 11, color: '#4ADE80', marginTop: 2 }}>47 transações importadas · hoje às 09:12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              WHATSAPP
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                {/* Visual (esquerda) */}
                <div className="flex justify-center md:justify-start order-2 md:order-1">
                  <div style={{ borderRadius: 20, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 20px 60px rgba(30,58,138,0.10)', border: '1px solid #E2E8F0', width: '100%', maxWidth: 360 }}>
                    {/* Header do WhatsApp */}
                    <div style={{ background: '#25D366', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#25D366' }}>S</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>SAOOZ</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>online</p>
                      </div>
                    </div>
                    {/* Mensagens */}
                    <div style={{ padding: '16px 14px', background: '#ECE5DD', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                      <div style={{ alignSelf: 'flex-end', background: '#DCF8C6', borderRadius: '12px 0 12px 12px', padding: '8px 12px', maxWidth: '80%' }}>
                        <p style={{ fontSize: 13, color: '#1A1A1A' }}>Paguei R$ 80 de farmácia agora</p>
                        <p style={{ fontSize: 10, color: '#8B8B8B', marginTop: 2, textAlign: 'right' }}>14:32 ✓✓</p>
                      </div>
                      <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', borderRadius: '0 12px 12px 12px', padding: '8px 12px', maxWidth: '85%' }}>
                        <p style={{ fontSize: 13, color: '#1A1A1A' }}>✅ Lançado! R$ 80 em <strong>Saúde</strong> — {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                        <p style={{ fontSize: 10, color: '#8B8B8B', marginTop: 2 }}>14:32</p>
                      </div>
                      <div style={{ alignSelf: 'flex-end', background: '#DCF8C6', borderRadius: '12px 0 12px 12px', padding: '8px 12px', maxWidth: '80%' }}>
                        <p style={{ fontSize: 13, color: '#1A1A1A' }}>Qual meu saldo hoje?</p>
                        <p style={{ fontSize: 10, color: '#8B8B8B', marginTop: 2, textAlign: 'right' }}>14:33 ✓✓</p>
                      </div>
                      <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', borderRadius: '0 12px 12px 12px', padding: '8px 12px', maxWidth: '85%' }}>
                        <p style={{ fontSize: 13, color: '#1A1A1A' }}>Saldo disponível: <strong style={{ color: '#22c55e' }}>R$ 3.240</strong>. Você gastou R$ 1.890 este mês — 18% a mais que abril.</p>
                        <p style={{ fontSize: 10, color: '#8B8B8B', marginTop: 2 }}>14:33</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Texto (direita) */}
                <div className="space-y-6 order-1 md:order-2">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                    WhatsApp
                  </span>
                  <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                    Registrar um gasto<br />leva 10 segundos
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
                    Manda uma mensagem no WhatsApp: &ldquo;Paguei R$ 80 de farmácia&rdquo;. O SAOOZ lança, categoriza e atualiza o painel. Sem abrir app, sem parar o que estava fazendo.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Registro por mensagem de texto ou áudio',
                      'Categorização automática pelo contexto',
                      'Pergunte o saldo, o gasto do mês, o que vence',
                      'Funciona para PF e PJ',
                    ].map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm" style={{ color: '#334155' }}>
                        <MessageCircle className="h-5 w-5 shrink-0" style={{ color: '#25D366' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                    Começar agora <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              SEGURANÇA
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-12 text-center space-y-3">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                  Seus dados só são seus
                </h2>
                <p className="text-base" style={{ color: '#64748B' }}>
                  Construído com os mesmos padrões de segurança dos bancos digitais.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { Icon: Shield,       title: 'Criptografia ponta a ponta', desc: 'Seus dados são protegidos com AES-256, o mesmo padrão usado por bancos.' },
                  { Icon: Shield,       title: 'Sem acesso a senhas',         desc: 'Conectamos via integrações seguras. Nunca pedimos e nunca armazenamos sua senha bancária.' },
                  { Icon: BadgeCheck,   title: 'Somente leitura',             desc: 'A IA analisa seus dados mas não realiza transações. Você tem controle total.' },
                  { Icon: CheckCircle2, title: 'Você controla tudo',          desc: 'Apague seus dados quando quiser. Sem burocracia, sem multa de saída.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="p-6 rounded-[16px] space-y-4"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16 }}>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                      style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <Icon className="h-6 w-6" style={{ color: '#1E3A8A' }} />
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PARA QUEM É
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#FFFFFF' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                  Para quem o SAOOZ foi feito
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {FOR_WHOM.map((profile) => {
                  const Icon = profile.icon
                  return (
                    <div key={profile.title} className="p-6 rounded-[16px] space-y-4"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16 }}>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                        <Icon className="h-6 w-6" style={{ color: '#1E3A8A' }} />
                      </div>
                      <h3 className="text-base font-bold" style={{ color: '#0F172A' }}>{profile.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{profile.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              DEPOIMENTOS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                  O que dizem quem já usa
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} className="p-6 rounded-[16px] space-y-4"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16 }}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{t.name}</p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              RESULTADOS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: '#1E3A8A' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#FFFFFF' }}>
                  O que muda quando você tem controle de verdade
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  { metric: '10 seg',   label: 'para registrar um gasto pelo WhatsApp', desc: 'Sem abrir app. Só mandar a mensagem.' },
                  { metric: 'Zero',     label: 'planilhas paralelas',                    desc: 'Tudo no mesmo lugar, atualizado em tempo real.' },
                  { metric: 'Antes',    label: 'de virar problema',                      desc: 'A IA detecta o desvio antes do fim do mês.' },
                ].map((r) => (
                  <div key={r.label} className="text-center space-y-2">
                    <p className="text-4xl font-black md:text-5xl" style={{ color: '#FFFFFF' }}>{r.metric}</p>
                    <p className="text-base font-semibold" style={{ color: '#93C5FD' }}>{r.label}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PREÇOS
          ══════════════════════════════════════════════════════════ */}
          <section id="precos" style={{ background: '#FFFFFF' }}>
            <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-4 md:px-6 text-center space-y-3">
              <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                Escolha o plano certo para você
              </h2>
              <p className="text-base" style={{ color: '#64748B' }}>
                Comece grátis por 7 dias. Cancele quando quiser, sem multa.
              </p>
            </div>
            <PricingSection />
          </section>

          {/* ══════════════════════════════════════════════════════════
              FAQ
          ══════════════════════════════════════════════════════════ */}
          <section id="faq" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0F172A' }}>
                  Perguntas frequentes
                </h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.q} className="group" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                    <summary
                      className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold select-none"
                      style={{ color: '#0F172A' }}
                    >
                      {item.q}
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-90" style={{ color: '#94A3B8' }} />
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-8 text-center text-sm" style={{ color: '#94A3B8' }}>
                Ainda tem dúvida?{' '}
                <a href="/suporte" className="font-semibold" style={{ color: '#1E3A8A' }}>
                  Fale com o suporte
                </a>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              CTA FINAL
          ══════════════════════════════════════════════════════════ */}
          <section style={{ background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8, #2563EB)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6 text-center space-y-6">
              <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#FFFFFF' }}>
                Feche o mês sabendo exatamente onde você está
              </h2>
              <p className="mx-auto max-w-xl text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Dois minutos para criar a conta. Seu banco conecta sozinho. A IA faz o resto.
              </p>
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center gap-2 rounded-[12px] px-7 text-base font-bold"
                style={{ background: '#FFFFFF', color: '#1E3A8A' }}
              >
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                7 dias grátis · Cancela quando quiser · Sem cartão de crédito agora
              </p>
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2 space-y-3">
                <SaoozWordmark size="sm" />
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#64748B' }}>
                  Seu sistema financeiro pessoal e empresarial
                </p>
                <a href="mailto:suporte@saooz.com" className="inline-flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                  <Mail className="h-4 w-4" style={{ color: '#1E3A8A' }} /> suporte@saooz.com
                </a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#94A3B8' }}>Legal</p>
                <div className="space-y-2">
                  {[
                    ['/termos', 'Termos'],
                    ['/privacidade', 'Privacidade'],
                    ['/suporte', 'Suporte'],
                    ['/contato', 'Contato'],
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="block text-sm transition-colors" style={{ color: '#64748B' }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#94A3B8' }}>Produto</p>
                <div className="space-y-2">
                  {[
                    ['#como-funciona', 'Como funciona'],
                    ['#recursos', 'Recursos'],
                    ['#precos', 'Preços'],
                    ['#faq', 'FAQ'],
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="block text-sm transition-colors" style={{ color: '#64748B' }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: '1px solid #E2E8F0', color: '#CBD5E1' }}>
              © 2025 SAOOZ · Todos os direitos reservados
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
