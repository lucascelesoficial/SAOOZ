import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Briefcase, Building2,
  Clock3, CreditCard, Layers,
  Shield, TrendingUp, User, CircleAlert, BarChart3,
  CheckCircle2, Star,
  Mail, ChevronRight,
} from 'lucide-react'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'
import { PricingSection } from '@/components/marketing/PricingSection'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  { icon: CircleAlert, title: 'Fim de mês no escuro', description: 'Você fecha o mês sem saber para onde o dinheiro foi — e já é tarde para corrigir qualquer coisa.' },
  { icon: Briefcase,  title: 'PF e PJ misturados',    description: 'Conta pessoal e empresarial se confundem. Qualquer decisão vira tentativa e erro.' },
  { icon: BarChart3,  title: 'Planilha que não fecha', description: 'A planilha paralela nunca está atualizada. Você não confia nos números porque sabe que estão errados.' },
  { icon: Brain,      title: 'IA que não entende seu contexto', description: 'Ferramentas genéricas não conhecem seu histórico real. As respostas não se aplicam ao seu momento.' },
]

const STEPS = [
  { num: '01', icon: User,       title: 'Crie sua conta',       description: 'Cadastro em menos de 2 minutos. Nome, e-mail e senha — sem burocracia.' },
  { num: '02', icon: Layers,     title: 'Configure seu modo',   description: 'Escolha PF, PJ ou ambos. O sistema monta o painel certo para o seu contexto automaticamente.' },
  { num: '03', icon: TrendingUp, title: 'Opere com clareza',    description: 'Registre, analise e decida com base em dados reais — sem planilha paralela.' },
]

const FEATURES = [
  {
    id: 'pf', tag: 'Módulo PF', tagColor: '#2563EB', icon: User,
    title: 'Controle financeiro pessoal com método real',
    description: 'Painel centralizado com visão de caixa, categorias de gastos, metas de reserva e inteligência IA para identificar onde o dinheiro some antes do fim do mês.',
    bullets: [
      'Dashboard com saldo, renda e gastos do mês',
      'Categorias de despesas inteligentes (16 tipos)',
      'Módulo de investimentos com carteira e posições',
      'Reserva de emergência com meta e progresso',
      'Assistente IA com contexto financeiro real',
    ],
  },
  {
    id: 'pj', tag: 'Módulo PJ', tagColor: '#60A5FA', icon: Building2,
    title: 'Operação financeira empresarial enxuta',
    description: 'Faturamento, despesas, impostos e pró-labore em um único painel. Suporte a múltiplas empresas com separação real entre pessoal e empresarial.',
    bullets: [
      'Painel de receita × despesa empresarial',
      'Cálculo de impostos (MEI, Simples, Presumido, Real)',
      'Gestão de pró-labore por período',
      'Suporte a até 5 empresas (plano PRO)',
      'Investimentos e reserva empresarial separados',
    ],
  },
  {
    id: 'ia', tag: 'Assistente IA', tagColor: '#1D4ED8', icon: Brain,
    title: 'IA que conhece o seu financeiro de verdade',
    description: 'O assistente acessa seus dados reais — renda, gastos, categorias e contexto PF/PJ — e entrega análises orientadas à decisão, não respostas genéricas.',
    bullets: [
      'Análise de padrões de gasto e desvios',
      'Recomendações de corte e priorização',
      'Ação direta: registra despesas por comando de voz ou texto',
      'Insights semanais e alertas de anomalia',
      'Resposta em voz com Text-to-Speech (ElevenLabs)',
    ],
  },
]

const FOR_WHOM = [
  { icon: User,     color: '#2563EB', title: 'Profissional com renda variável',    description: 'Freelancers, consultores e autônomos que precisam de previsibilidade e método sem depender de contador para entender o básico.' },
  { icon: Building2,color: '#60A5FA', title: 'Empresário com operação PJ',         description: 'MEIs e pequenas empresas que precisam separar pessoa e empresa sem planilha paralela ou ferramenta adicional.' },
  { icon: Layers,   color: '#22c55e', title: 'Operação PF + PJ unificada',         description: 'Quem tem renda pessoal e empresarial e precisa de visão total do dinheiro em um único sistema, sem retrabalho.' },
]

const TESTIMONIALS = [
  { name: 'Lucas M.',    role: 'Designer · MEI',         quote: 'Finalmente consegui separar o pessoal do empresarial. Em uma semana já vi para onde o dinheiro estava indo todo mês.', stars: 5 },
  { name: 'Fernanda C.', role: 'Consultora PJ',          quote: 'O módulo de impostos me economiza tempo toda semana. Antes abria 3 ferramentas diferentes só para montar o número básico.', stars: 5 },
  { name: 'Rafael S.',   role: 'Gestor de tráfego · Autônomo', quote: 'A IA identifica onde está o vazamento antes do fim do mês. Muda completamente como tomo decisão sobre investimento e gasto.', stars: 5 },
]

const RESULTS = [
  { icon: Clock3,     metric: 'Horas',        label: 'para fechar o mês',        description: 'Em vez de dias de planilha e retrabalho.',               color: '#2563EB' },
  { icon: TrendingUp, metric: 'Tempo real',   label: 'de visibilidade de caixa', description: 'Sem esperar o fim do mês para saber o saldo.',           color: '#22c55e' },
  { icon: Brain,      metric: 'Antes do impacto', label: 'detecção de desvio',   description: 'A IA identifica o problema antes que vire crise.',       color: '#1D4ED8' },
]

const FAQ_ITEMS = [
  { q: 'O que é a garantia de 7 dias?',                 a: 'Se você assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas, sem burocracia.' },
  { q: 'Quando começa a cobrança?',                      a: 'Imediatamente após a confirmação do pagamento. Se decidir cancelar nos primeiros 7 dias, reembolsamos o valor integral. Sem fidelidade, sem multa de saída.' },
  { q: 'Posso usar PF e PJ no mesmo plano?',            a: 'Sim, com o plano PRO você tem acesso aos dois módulos em uma única conta. Se precisar só de um, os planos PF ou PJ são mais indicados e mais baratos.' },
  { q: 'Consigo ter mais de uma empresa cadastrada?',   a: 'Sim. O plano PJ suporta até 3 empresas e o PRO até 5. Ideal para quem opera mais de um CNPJ ou tem diferentes frentes de negócio.' },
  { q: 'Em quanto tempo configuro o SAOOZ?',            a: 'A configuração inicial leva menos de 5 minutos. No mesmo dia você já consegue registrar, analisar e decidir com base em dados reais.' },
  { q: 'O assistente IA usa meus dados reais?',         a: 'Sim. O assistente conhece seu contexto financeiro real — renda, gastos, categorias e operação PF/PJ — e entrega análises orientadas ao seu momento, não respostas genéricas de ChatGPT.' },
  { q: 'Posso migrar de plano depois?',                 a: 'Sim. Você pode trocar de plano a qualquer momento pelo painel de configurações. Sem perda de dados, sem burocracia.' },
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
    { name: 'Moradia',       pct: 32, val: 'R$ 1.400', color: '#2563EB' },
    { name: 'Alimentação',   pct: 22, val: 'R$ 963',   color: '#60A5FA' },
    { name: 'Transporte',    pct: 15, val: 'R$ 656',   color: '#22c55e' },
    { name: 'Assinaturas',   pct: 9,  val: 'R$ 394',   color: '#1D4ED8' },
    { name: 'Outros',        pct: 22, val: 'R$ 963',   color: '#f59e0b' },
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
          background: 'radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--accent-blue) 30%, transparent), transparent 70%)',
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
          border: '1px solid color-mix(in oklab, var(--accent-blue) 35%, transparent)',
          boxShadow: '0 40px 100px color-mix(in oklab, var(--accent-blue) 20%, transparent), 0 0 0 1px color-mix(in oklab, var(--panel-border) 40%, transparent), inset 0 1px 0 color-mix(in oklab, white 8%, transparent)',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'color-mix(in oklab, var(--panel-bg) 95%, transparent)',
            borderBottom: '1px solid var(--panel-border)',
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <div
            style={{
              marginLeft: 12, flex: 1, borderRadius: 6, padding: '4px 12px',
              background: 'var(--panel-bg-soft)',
              fontSize: 11, color: 'var(--text-soft)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Shield style={{ width: 10, height: 10, color: '#22c55e' }} />
            app.saooz.com/central
          </div>
        </div>

        {/* Dashboard body */}
        <div style={{ background: 'var(--app-bg)', padding: 0 }}>

          {/* Sidebar + content */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr' }}>

            {/* Mini sidebar */}
            <div
              style={{
                background: 'var(--panel-bg)',
                borderRight: '1px solid var(--panel-border)',
                padding: '12px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}
            >
              {['#2563EB','#60A5FA','#22c55e','#1D4ED8','#f59e0b'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? `color-mix(in oklab, ${c} 25%, transparent)` : 'var(--panel-bg-soft)', border: `1px solid ${i === 0 ? `color-mix(in oklab, ${c} 40%, transparent)` : 'var(--panel-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: i === 0 ? '50%' : 2, background: i === 0 ? c : 'var(--text-muted)', opacity: i === 0 ? 1 : 0.5 }} />
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ padding: '14px 16px', minHeight: 320 }}>

              {/* Top header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 2 }}>Central financeira</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Abril 2026</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['PF','PJ'].map((t, i) => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: i === 0 ? 'color-mix(in oklab, #2563EB 20%, transparent)' : 'var(--panel-bg-soft)', color: i === 0 ? '#2563EB' : 'var(--text-soft)', border: `1px solid ${i === 0 ? 'color-mix(in oklab, #2563EB 30%, transparent)' : 'var(--panel-border)'}` }}>{t}</span>
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
                  <div key={m.label} style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-soft)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 9, marginTop: 3, padding: '1px 5px', borderRadius: 4, background: `color-mix(in oklab, ${m.color} 10%, transparent)`, display: 'inline-block', color: m.color }}>{m.delta}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 8, marginBottom: 12 }}>

                {/* Bar chart */}
                <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fluxo de caixa — 2026</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
                    {bars.map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h}%`, background: i >= 10 ? `color-mix(in oklab, #2563EB 35%, transparent)` : `color-mix(in oklab, #2563EB ${50 + h / 5}%, transparent)`, border: i === 11 ? '1px solid color-mix(in oklab, #2563EB 60%, transparent)' : 'none' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {['Jan','Fev','Mar','Abr'].map(m => (
                      <span key={m} style={{ fontSize: 8, color: 'var(--text-muted)' }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Category breakdown */}
                <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorias</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {cats.slice(0, 4).map((c) => (
                      <div key={c.name} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: 'var(--text-base)' }}>{c.name}</span>
                          <span style={{ fontSize: 9, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: 'var(--panel-bg-soft)' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI chat preview */}
              <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text-soft)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistente IA · Saooz</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '75%', background: 'color-mix(in oklab, #1D4ED8 12%, transparent)', border: '1px solid color-mix(in oklab, #1D4ED8 20%, transparent)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: 'var(--text-base)', lineHeight: 1.5 }}>
                    Seus gastos com alimentação subiram 18% em abril. Deseja revisar a meta da categoria?
                  </div>
                  <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: 'var(--panel-bg-soft)', borderRadius: '8px 0 8px 8px', padding: '6px 10px', fontSize: 10, color: 'var(--text-base)' }}>
                    Sim — sugira um valor realista.
                  </div>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'color-mix(in oklab, #1D4ED8 12%, transparent)', border: '1px solid color-mix(in oklab, #1D4ED8 20%, transparent)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', fontSize: 10, color: 'var(--text-base)', lineHeight: 1.5 }}>
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
          background: 'linear-gradient(to top, var(--app-bg), transparent)',
          pointerEvents: 'none', zIndex: 2,
        }}
      />
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
        @keyframes saooz-shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
        @keyframes saooz-spin-slow { to { transform: rotate(360deg); } }
        @keyframes saooz-grid-fade { 0%,100%{opacity:0.04} 50%{opacity:0.08} }
      `}</style>

      <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--app-bg)', color: 'var(--text-base)' }}>

        {/* ══════════════════════════════════════════════════════════
            GLOBAL BG — mesh gradient + grid overlay
        ══════════════════════════════════════════════════════════ */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {/* Primary glow blobs — animated */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 800px 600px at 20% -10%, color-mix(in oklab, #2563EB 22%, transparent), transparent 60%), radial-gradient(ellipse 700px 500px at 80% 5%, color-mix(in oklab, #1D4ED8 14%, transparent), transparent 60%), radial-gradient(ellipse 600px 400px at 50% 80%, color-mix(in oklab, #60A5FA 10%, transparent), transparent 60%)',
          }} />
          {/* Floating accent blobs */}
          <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, #1D4ED8 15%, transparent), transparent)', filter: 'blur(60px)', animation: 'saooz-float 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', left: '2%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, #22c55e 10%, transparent), transparent)', filter: 'blur(50px)', animation: 'saooz-float 18s ease-in-out infinite 4s' }} />
          {/* Tech grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(color-mix(in oklab, #2563EB 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, #2563EB 6%, transparent) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'saooz-grid-fade 8s ease-in-out infinite',
          }} />
          {/* Horizontal scan line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, color-mix(in oklab, #2563EB 60%, transparent), transparent)',
            animation: 'saooz-float 6s ease-in-out infinite',
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════════
            NAV
        ══════════════════════════════════════════════════════════ */}
        <header
          className="relative z-20 sticky top-0"
          style={{
            borderBottom: '1px solid color-mix(in oklab, var(--panel-border) 60%, transparent)',
            backdropFilter: 'blur(20px)',
            background: 'color-mix(in oklab, var(--app-bg) 75%, transparent)',
          }}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <SaoozWordmark size="sm" />
            <nav className="hidden items-center gap-6 md:flex">
              {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos'],['#faq','FAQ']].map(([href,label]) => (
                <Link key={href} href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-soft)' }}>{label}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="theme-outline-button hidden md:inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-medium">Entrar</Link>
              <Link
                href="/cadastro"
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-4 text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                  boxShadow: '0 0 20px color-mix(in oklab, var(--accent-blue) 40%, transparent)',
                }}
              >
                Começar agora <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">

          {/* ══════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════ */}
          <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-0 md:px-6 md:pt-24">
            {/* Orbital system behind hero text */}
            <OrbitalSystem />

            <div className="mx-auto max-w-4xl text-center space-y-6 relative">
              {/* Social proof strip — sem badge, sem ícone, sem pill */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  { num: '1.200+', label: 'usuários ativos' },
                  { num: 'R$ 2,1 bi', label: 'em movimentações' },
                  { num: '4.8 / 5',  label: 'avaliação média' },
                ].map((s, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>{s.num}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{s.label}</span>
                    {i < 2 && <span style={{ marginLeft: 6, color: 'var(--panel-border)', fontSize: 16, lineHeight: 1 }}>·</span>}
                  </div>
                ))}
              </div>

              {/* H1 */}
              <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-strong)' }}>
                Seu financeiro pessoal e<br />
                empresarial,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-blue), #1D4ED8, var(--accent-cyan))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'saooz-shimmer 3s linear infinite',
                }}>
                  finalmente sob controle.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-base)' }}>
                O SAOOZ unifica PF e PJ em um único sistema inteligente. Você para de apagar incêndio financeiro e começa a operar com previsibilidade real.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/cadastro"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] px-6 text-base font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-blue), #1D4ED8)',
                    boxShadow: '0 8px 40px color-mix(in oklab, var(--accent-blue) 45%, transparent)',
                  }}
                >
                  Começar agora — 7 dias de garantia
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#planos" className="theme-outline-button inline-flex h-12 items-center gap-2 rounded-[12px] px-6 text-base font-medium">
                  Ver planos
                </Link>
              </div>

              {/* Trust */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1" style={{ color: 'var(--text-soft)' }}>
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 7 dias de garantia — ou seu dinheiro de volta</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Cancele quando quiser</span>
                <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Sem fidelidade</span>
              </div>
            </div>

            {/* Dashboard mockup with 3D tilt */}
            <DashboardMockup />
          </section>

          {/* ══════════════════════════════════════════════════════════
              STATS BAR
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid var(--panel-border)', borderBottom: '1px solid var(--panel-border)', background: 'color-mix(in oklab, var(--panel-bg) 60%, transparent)', backdropFilter: 'blur(8px)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { value: '7 dias',  label: 'de garantia de reembolso', accent: 'var(--accent-blue)' },
                  { value: 'PF + PJ', label: 'em um único sistema',      accent: '#60A5FA' },
                  { value: '3 planos',label: 'sem fidelidade',           accent: '#22c55e' },
                  { value: 'IA real', label: 'com contexto financeiro',  accent: '#1D4ED8' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-black md:text-3xl" style={{ color: stat.accent }}>{stat.value}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PAIN
          ══════════════════════════════════════════════════════════ */}
          <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>O problema</p>
              <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Você se identifica com algum disso?</h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-soft)' }}>Se sim, você precisa de um sistema. Não de mais uma planilha.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PAIN_POINTS.map((item) => {
                const Icon = item.icon
                return (
                  <article
                    key={item.title}
                    className="panel-card rounded-[16px] p-5 space-y-3"
                    style={{
                      background: 'color-mix(in oklab, #f87171 4%, var(--panel-bg))',
                      border: '1px solid color-mix(in oklab, #f87171 15%, var(--panel-border))',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: 'color-mix(in oklab, #f87171 12%, transparent)', border: '1px solid color-mix(in oklab, #f87171 22%, transparent)' }}>
                      <Icon className="h-5 w-5" style={{ color: '#f87171' }} />
                    </div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-strong)' }}>{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-soft)' }}>{item.description}</p>
                  </article>
                )
              })}
            </div>
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-semibold"
                style={{ borderColor: 'color-mix(in oklab, var(--accent-blue) 35%, transparent)', background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)', color: 'var(--accent-blue)' }}>
                O SAOOZ foi criado para resolver exatamente isso.
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
          <section id="como-funciona" style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>Como funciona</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Em 3 passos você já opera com controle real</h2>
              </div>
              <div className="relative grid gap-8 md:grid-cols-3">
                <div className="absolute top-8 left-1/4 right-1/4 hidden h-px md:block" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)' }} />
                {STEPS.map((step) => {
                  const Icon = step.icon
                  return (
                    <article key={step.num} className="panel-card relative rounded-[18px] p-6 text-center space-y-4"
                      style={{ background: 'color-mix(in oklab, var(--accent-blue) 3%, var(--panel-bg))' }}>
                      <div className="mx-auto h-14 w-14 rounded-[14px] flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', boxShadow: '0 8px 24px color-mix(in oklab, var(--accent-blue) 35%, transparent)' }}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="absolute top-5 right-5 text-4xl font-black opacity-8" style={{ color: 'var(--accent-blue)', opacity: 0.08 }}>{step.num}</span>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-strong)' }}>{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{step.description}</p>
                    </article>
                  )
                })}
              </div>
              <div className="mt-10 text-center">
                <Link href="/cadastro" className="inline-flex h-11 items-center gap-2 rounded-[11px] px-6 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', boxShadow: '0 4px 20px color-mix(in oklab, var(--accent-blue) 30%, transparent)' }}>
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FEATURES
          ══════════════════════════════════════════════════════════ */}
          <section id="funcionalidades" style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 space-y-6">
              <div className="text-center mb-10">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>Funcionalidades</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Tudo que você precisa em um único sistema</h2>
              </div>
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon
                const isReversed = i % 2 !== 0
                return (
                  <article key={feat.id} className={`panel-card rounded-[20px] overflow-hidden grid md:grid-cols-2 gap-0 ${isReversed ? 'md:[direction:rtl]' : ''}`}
                    style={{ border: `1px solid color-mix(in oklab, ${feat.tagColor} 18%, var(--panel-border))` }}>
                    <div className={`p-7 md:p-10 space-y-5 ${isReversed ? 'md:[direction:ltr]' : ''}`}>
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                        style={{ background: `color-mix(in oklab, ${feat.tagColor} 12%, transparent)`, border: `1px solid color-mix(in oklab, ${feat.tagColor} 25%, transparent)`, color: feat.tagColor }}>
                        <Icon className="h-3.5 w-3.5" /> {feat.tag}
                      </span>
                      <h3 className="text-xl font-bold md:text-2xl" style={{ color: 'var(--text-strong)' }}>{feat.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{feat.description}</p>
                      <ul className="space-y-2">
                        {feat.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
                            <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: feat.tagColor }} /> {b}
                          </li>
                        ))}
                      </ul>
                      <Link href="/cadastro" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: feat.tagColor }}>
                        Testar este módulo <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div
                      className={`relative flex items-center justify-center p-6 min-h-[240px] ${isReversed ? 'md:[direction:ltr]' : ''}`}
                      style={{
                        background: `linear-gradient(135deg, color-mix(in oklab, ${feat.tagColor} 10%, transparent), color-mix(in oklab, ${feat.tagColor} 4%, transparent))`,
                        borderLeft: isReversed ? 'none' : '1px solid var(--panel-border)',
                        borderRight: isReversed ? '1px solid var(--panel-border)' : 'none',
                      }}
                    >
                      <div className="absolute inset-0" style={{ background: `radial-gradient(400px at 50% 50%, color-mix(in oklab, ${feat.tagColor} 18%, transparent), transparent)` }} />
                      <div className="relative w-full max-w-xs space-y-3">
                        {feat.id === 'pf' && ['Saldo mensal — R$ 8.420','Maior gasto — Moradia 32%','Reserva — 68% da meta'].map((t, j) => (
                          <div key={t} className="panel-card rounded-[10px] px-4 py-3 text-sm" style={{ color: j === 0 ? '#22c55e' : j === 1 ? feat.tagColor : '#f59e0b', fontWeight: 700 }}>{t}</div>
                        ))}
                        {feat.id === 'pj' && ['Faturamento — R$ 28.500','Despesas PJ — R$ 11.200','Imposto — R$ 1.425 · Simples','Lucro líquido — R$ 15.875'].map((t, j) => (
                          <div key={t} className="panel-card rounded-[10px] px-4 py-3 text-sm" style={{ color: j === 0 ? feat.tagColor : j === 1 ? '#f87171' : j === 2 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>{t}</div>
                        ))}
                        {feat.id === 'ia' && (
                          <div className="panel-card rounded-[14px] p-4 space-y-3">
                            {[
                              { role: 'saooz', text: 'Alimentação subiu 18% em abril. Revisar meta?' },
                              { role: 'user',  text: 'Sim — sugira um valor realista.' },
                              { role: 'saooz', text: 'R$ 1.100/mês mantém o padrão sem pressão no caixa.' },
                            ].map((m, j) => (
                              <div key={j} className={`rounded-[8px] p-3 text-xs`} style={m.role === 'saooz' ? { background: `color-mix(in oklab, ${feat.tagColor} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${feat.tagColor} 20%, transparent)`, color: 'var(--text-base)' } : { background: 'var(--panel-bg-soft)', textAlign: 'right', color: 'var(--text-base)' }}>{m.text}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FOR WHOM
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>Para quem é</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>O SAOOZ é para você se…</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {FOR_WHOM.map((profile) => {
                  const Icon = profile.icon
                  return (
                    <article key={profile.title} className="panel-card rounded-[18px] p-6 space-y-4"
                      style={{ borderColor: `color-mix(in oklab, ${profile.color} 22%, transparent)`, background: `color-mix(in oklab, ${profile.color} 3%, var(--panel-bg))` }}>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px]"
                        style={{ background: `color-mix(in oklab, ${profile.color} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${profile.color} 28%, transparent)` }}>
                        <Icon className="h-6 w-6" style={{ color: profile.color }} />
                      </div>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-strong)' }}>{profile.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{profile.description}</p>
                      <Link href="/cadastro" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: profile.color }}>
                        Testar agora <ArrowRight className="h-3 w-3" />
                      </Link>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              RESULTS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid var(--panel-border)', background: 'color-mix(in oklab, var(--accent-blue) 3%, transparent)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>O que você vai notar</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Impacto real nos primeiros 30 dias</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {RESULTS.map((r) => {
                  const Icon = r.icon
                  return (
                    <article key={r.label} className="panel-card rounded-[18px] p-6 text-center space-y-3"
                      style={{ border: `1px solid color-mix(in oklab, ${r.color} 20%, var(--panel-border))`, background: `color-mix(in oklab, ${r.color} 4%, var(--panel-bg))` }}>
                      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-[12px]"
                        style={{ background: `color-mix(in oklab, ${r.color} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${r.color} 28%, transparent)` }}>
                        <Icon className="h-6 w-6" style={{ color: r.color }} />
                      </div>
                      <p className="text-2xl font-black" style={{ color: r.color }}>{r.metric}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{r.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{r.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              TESTIMONIALS
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>O que dizem os usuários</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Quem usa não volta para planilha</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {TESTIMONIALS.map((t) => (
                  <article key={t.name} className="panel-card rounded-[18px] p-6 space-y-4"
                    style={{ background: 'color-mix(in oklab, var(--accent-blue) 3%, var(--panel-bg))' }}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-base)' }}>&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--accent-blue), #1D4ED8)' }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{t.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              PLANS — client component with duration tabs
          ══════════════════════════════════════════════════════════ */}
          <PricingSection />

          {/* ══════════════════════════════════════════════════════════
              FAQ
          ══════════════════════════════════════════════════════════ */}
          <section id="faq" style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-3xl px-4 py-20 md:px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>FAQ</p>
                <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>Perguntas frequentes</h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.q} className="panel-card group rounded-[14px] overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold select-none" style={{ color: 'var(--text-strong)' }}>
                      {item.q}
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-90" style={{ color: 'var(--text-soft)' }} />
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-soft)' }}>
                Ainda tem dúvida?{' '}
                <a href="mailto:suporte@saooz.com" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-blue)' }}>
                  Fale com o suporte
                </a>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FINAL CTA
          ══════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: '1px solid var(--panel-border)' }}>
            <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
              <div
                className="relative overflow-hidden rounded-[24px] px-8 py-14 text-center md:px-14"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent-blue) 15%, transparent), color-mix(in oklab, #1D4ED8 10%, transparent), color-mix(in oklab, var(--accent-cyan) 10%, transparent))',
                  border: '1px solid color-mix(in oklab, var(--accent-blue) 35%, transparent)',
                }}
              >
                {/* Animated grid inside CTA */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(color-mix(in oklab, #2563EB 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, #2563EB 8%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />
                {/* Glow orb */}
                <div aria-hidden style={{ position: 'absolute', top: '-30%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, #1D4ED8 25%, transparent), transparent)', filter: 'blur(60px)', animation: 'saooz-float 10s ease-in-out infinite' }} />
                <div className="relative space-y-5">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-soft)' }}>Comece agora</p>
                  <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>
                    Seu financeiro pode virar vantagem competitiva<br className="hidden md:block" /> nos próximos 7 dias.
                  </h2>
                  <p className="mx-auto max-w-xl text-sm md:text-base" style={{ color: 'var(--text-base)' }}>
                    Quanto mais você adia, mais dinheiro invisível continua saindo sem controle. Ative agora — sem risco.
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-soft)' }}>7 dias de garantia · reembolso total se não estiver satisfeito · cancele quando quiser · sem fidelidade.</p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link
                      href="/cadastro"
                      className="inline-flex h-12 items-center gap-2 rounded-[12px] px-7 text-base font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent-blue), #1D4ED8)', boxShadow: '0 8px 32px color-mix(in oklab, var(--accent-blue) 45%, transparent)' }}
                    >
                      Assinar com garantia de 7 dias <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link href="#planos" className="theme-outline-button inline-flex h-12 items-center rounded-[12px] px-7 text-base font-medium">
                      Ver planos detalhados
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer className="relative z-10" style={{ borderTop: '1px solid var(--panel-border)' }}>
          <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2 space-y-3">
                <SaoozWordmark size="sm" />
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  Sistema financeiro premium com IA para PF e PJ. Controle, clareza e previsibilidade em um único lugar.
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <a href="https://instagram.com/saoozia" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: 'var(--text-soft)' }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                    @SAOOZIA
                  </a>
                  <a href="mailto:suporte@saooz.com" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: 'var(--text-soft)' }}>
                    <Mail className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} /> suporte@saooz.com
                  </a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-soft)' }}>Produto</p>
                <div className="space-y-2">
                  {[['#funcionalidades','Funcionalidades'],['#planos','Planos'],['#como-funciona','Como funciona'],['#faq','FAQ']].map(([h,l]) => (
                    <Link key={h} href={h} className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-soft)' }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-soft)' }}>Conta</p>
                <div className="space-y-2">
                  {[['/login','Entrar'],['/cadastro','Criar conta'],['/suporte','Suporte'],['/contato','Contato']].map(([h,l]) => (
                    <Link key={h} href={h} className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-soft)' }}>{l}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} SAOOZ. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
