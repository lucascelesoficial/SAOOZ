'use client'

import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Brain, Building2,
  CheckCircle2, ChevronRight, Layers,
  Lock, Mail, Shield, Star, TrendingUp, User, Zap,
} from 'lucide-react'
import { PricingSection } from '@/components/marketing/PricingSection'

const G    = '#026648'
const GLit = '#04a372'
const GDim = 'rgba(2,102,72,0.10)'
const GBd  = 'rgba(2,102,72,0.30)'

function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 32, width: 'auto', display: 'block' }} />
  )
}

// ─── Dashboard Mockup (redesigned to reflect PearFy product) ─────────────────
function DashboardMockup() {
  const bars = [32, 48, 38, 68, 44, 58, 76, 52, 70, 82, 46, 90]

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      background: '#080808',
      width: '100%',
      position: 'relative',
    }}>
      {/* Scan line animation */}
      <div className="dash-scan" aria-hidden />

      {/* Chrome bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#101010', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <div style={{ marginLeft: 12, flex: 1, maxWidth: 280, borderRadius: 6, padding: '5px 12px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield style={{ width: 9, height: 9, color: GLit, flexShrink: 0 }} />
          app.pearfy.com/dashboard
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 9, color: '#374151', background: '#1a1a1a', padding: '3px 8px', borderRadius: 4 }}>Abril 2025</div>
        </div>
      </div>

      {/* App Layout */}
      <div style={{ display: 'flex', height: 380 }}>

        {/* Sidebar */}
        <div style={{ width: 140, background: '#0c0c0c', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '14px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 20, width: 'auto' }} />
          </div>

          {/* PF/PJ Toggle */}
          <div style={{ margin: '0 10px 12px', background: '#1a1a1a', borderRadius: 8, padding: 3, display: 'flex', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '5px 0', borderRadius: 6, background: G, fontSize: 10, fontWeight: 700, color: '#fff' }}>PF</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '5px 0', borderRadius: 6, fontSize: 10, fontWeight: 500, color: '#4b5563' }}>PJ</div>
          </div>

          {[
            ['Resumo', true],
            ['Movimentações', false],
            ['Contas', false],
            ['Categorias', false],
            ['Metas', false],
            ['Relatórios', false],
            ['IA / Insights', false],
            ['Configurações', false],
          ].map(([lbl, active]) => (
            <div key={lbl as string} style={{
              padding: '6px 14px', fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? GLit : '#4b5563',
              background: active ? GDim : 'transparent',
              borderLeft: `2px solid ${active ? G : 'transparent'}`,
              marginBottom: 2,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>{lbl as string}</div>
          ))}

          {/* AI status */}
          <div style={{ marginTop: 'auto', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${G}60` }}>
                <Brain style={{ width: 11, height: 11, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af' }}>IA ativa</div>
                <div style={{ fontSize: 8, color: GLit }}>● online</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '16px 18px', background: '#080808', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Resumo Pessoal</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 1 }}>Modo PF · Abril 2025</div>
            </div>
            <div style={{ fontSize: 9, color: '#4b5563', background: '#111', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: GLit, display: 'inline-block' }} />
              Atualizado agora
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { lbl: 'SALDO',     val: 'R$ 24.430', chg: '+18,4%', up: true },
              { lbl: 'RECEITAS',  val: 'R$ 52.480', chg: '+22,7%', up: true },
              { lbl: 'DESPESAS',  val: 'R$ 28.250', chg: '+9,2%',  up: false },
              { lbl: 'RESULTADO', val: 'R$ 24.230', chg: '+36,8%', up: true },
            ].map(m => (
              <div key={m.lbl} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '10px 12px', borderTop: m.up ? `2px solid ${G}` : '2px solid #7f1d1d' }}>
                <div style={{ fontSize: 8, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{m.lbl}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: m.up ? '#f1f5f9' : '#f87171', lineHeight: 1.1 }}>{m.val}</div>
                <div style={{ fontSize: 9, color: m.up ? GLit : '#f87171', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span>{m.up ? '↑' : '↑'}</span>{m.chg}
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 8, flex: 1 }}>
            {/* Bar chart */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af' }}>Fluxo de caixa — 2025</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 9, color: '#4b5563', background: '#1a1a1a', padding: '2px 7px', borderRadius: 4 }}>Mensal ▾</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, flex: 1, paddingBottom: 4 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', borderRadius: '3px 3px 0 0', height: `${h}%`,
                      background: i === bars.length - 1
                        ? `linear-gradient(180deg, ${GLit}, ${G})`
                        : `rgba(2,102,72,${0.12 + h / 350})`,
                      boxShadow: i === bars.length - 1 ? `0 0 10px ${G}80, 0 -4px 12px ${G}40` : 'none',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m => (
                  <span key={m} style={{ fontSize: 7.5, color: '#374151', flex: 1, textAlign: 'center' }}>{m}</span>
                ))}
              </div>
            </div>

            {/* AI chat snippet */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain style={{ width: 11, height: 11, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>Assistente IA</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
                <div style={{ background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 8px 8px 8px', padding: '8px 10px', fontSize: 10, color: '#9ca3af', lineHeight: 1.5 }}>
                  Abril 12% acima. Alimentação subiu R$ 340. Quero ajustar sua meta?
                </div>
                <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px 0 8px 8px', padding: '8px 10px', fontSize: 10, color: '#6b7280', alignSelf: 'flex-end' }}>
                  Sim, ajuste.
                </div>
                <div style={{ background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 8px 8px 8px', padding: '8px 10px', fontSize: 10, color: '#9ca3af', lineHeight: 1.5 }}>
                  ✓ Meta ajustada para R$ 3.800 em alimentação.
                </div>
              </div>
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
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 12, background: GDim, color: GLit, padding: '4px 12px', borderRadius: 100, border: `1px solid ${GBd}`, fontWeight: 500 }}>Simples Nacional</span>
      </div>
      {[
        { label: 'Faturamento Bruto', value: 'R$ 28.500', color: GLit,    border: `1px solid ${GBd}` },
        { label: 'Total Despesas',    value: '– R$ 11.200', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' },
        { label: 'Imposto Estimado',  value: '– R$ 1.425',  color: '#9ca3af', border: '1px solid rgba(255,255,255,0.06)' },
        { label: 'Lucro Líquido',     value: 'R$ 15.875',  color: GLit,    border: `2px solid ${G}` },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#161616', borderRadius: 10, border: row.border, marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>{row.label}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: row.color, letterSpacing: '-0.02em' }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function VisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
      {[
        { label: 'Pessoal · PF',  mode: 'PF', items: [{ k: 'Saldo líquido', v: 'R$ 8.420', up: true }, { k: 'Saídas do mês', v: 'R$ 4.380', up: false }] },
        { label: 'Empresa · PJ',  mode: 'PJ', items: [{ k: 'Faturamento', v: 'R$ 28.5k', up: true }, { k: 'Lucro líquido', v: 'R$ 15.8k', up: true }] },
      ].map(p => (
        <div key={p.label} style={{ background: '#0f0f0f', border: `1px solid ${GBd}`, borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{p.mode}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.label}</span>
            </div>
            <span style={{ fontSize: 11, background: GDim, color: GLit, padding: '3px 10px', borderRadius: 6 }}>Abr 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {p.items.map(item => (
              <div key={item.k} style={{ background: '#000', borderRadius: 10, padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, fontWeight: 300 }}>{item.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.up ? '#fff' : '#f87171', letterSpacing: '-0.03em' }}>{item.v}</div>
                <div style={{ fontSize: 11, color: item.up ? GLit : '#f87171', marginTop: 4 }}>{item.up ? '↑' : '↓'} vs. Mar</div>
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
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 24px ${G}70` }}>
          <Brain style={{ width: 18, height: 18, color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Assistente PearFy</div>
          <div style={{ fontSize: 12, color: GLit, fontWeight: 300, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GLit, display: 'inline-block' }} />
            online · acessa seus dados reais
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 14px 14px 14px', padding: '13px 16px', fontSize: 14, color: '#d1d5db', lineHeight: 1.6, fontWeight: 400 }}>
          Abril ficou 12% acima de março. Alimentação +R$ 340 e assinaturas +R$ 180. Ajusto a meta?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '55%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px 0 14px 14px', padding: '13px 16px', fontSize: 14, color: '#6b7280', fontWeight: 300 }}>
          Sim, ajuste.
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 14px 14px 14px', padding: '13px 16px', fontSize: 14, color: '#d1d5db', lineHeight: 1.6, fontWeight: 400 }}>
          ✓ Meta de alimentação ajustada para R$ 3.800. Você tem R$ 420 de margem neste mês.
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
  { q: 'O que é a garantia de 7 dias?',                   a: 'Se assinar qualquer plano e não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntas, sem formulário de retenção.' },
  { q: 'Quando começa a cobrança?',                       a: 'Imediatamente após a confirmação do pagamento. Cancelamentos nos primeiros 7 dias têm reembolso integral. Sem fidelidade, sem multa.' },
  { q: 'Posso usar pessoal e empresarial no mesmo plano?', a: 'Sim. O plano Comando acessa os dois módulos em uma única conta.' },
  { q: 'Em quanto tempo configuro a PearFy?',             a: 'Menos de 5 minutos. No mesmo dia você já registra, analisa e decide com base em dados reais.' },
  { q: 'O assistente IA usa meus dados reais?',           a: 'Sim. Ele conhece seu histórico e entrega análises sobre você — não respostas genéricas.' },
  { q: 'Como funciona o cancelamento?',                   a: 'Você cancela pelo painel. O acesso permanece até o fim do período pago. Sem multa, sem aviso prévio.' },
]

// ─── SalesLanding ─────────────────────────────────────────────────────────────
export function SalesLanding() {
  return (
    <>
      <style>{`
        .pl { background: #000; color: #9ca3af; }
        .pl a { text-decoration: none; }

        /* Nav links */
        .pl-nl { color: #6b7280; font-size: 15px; font-weight: 400; transition: color .15s; }
        .pl-nl:hover { color: #fff; }

        /* Buttons */
        .pl-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          height: 42px; padding: 0 20px; border-radius: 9px;
          font-size: 14px; font-weight: 400; color: #6b7280;
          border: 1px solid rgba(255,255,255,0.09); transition: all .15s;
        }
        .pl-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .pl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          height: 52px; padding: 0 32px; border-radius: 11px;
          font-size: 15px; font-weight: 600; color: #fff;
          background: ${G}; letter-spacing: -0.01em;
          transition: opacity .15s;
        }
        .pl-btn:hover { opacity: .82; }
        .pl-btn-sm { height: 42px; padding: 0 22px; font-size: 14px; border-radius: 8px; }

        /* Eyebrow badge */
        .pl-badge {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 9px 18px; border-radius: 100px;
          border: 1px solid ${GBd};
          background: ${GDim};
          animation: badge-glow 3s ease-in-out infinite;
        }
        .pl-dot {
          width: 7px; height: 7px; border-radius: 50%; background: ${GLit};
          animation: dot-pulse 2.5s ease-in-out infinite;
        }

        /* Dashboard 3D float */
        .dash-wrap {
          animation: dash-float 6s ease-in-out infinite;
          transform-origin: center bottom;
        }

        /* Scan line */
        .dash-scan {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${G}60, transparent);
          animation: scan-line 4s linear infinite;
          pointer-events: none; z-index: 10;
        }

        /* CTA pulse */
        .cta-pulse { animation: cta-glow 2.5s ease-in-out infinite; }

        /* Background orbs */
        .orb1 { animation: orb-drift1 12s ease-in-out infinite; }
        .orb2 { animation: orb-drift2 16s ease-in-out infinite; }
        .orb3 { animation: orb-drift3 20s ease-in-out infinite; }

        /* Grid bg */
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* Keyframes */
        @keyframes badge-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(2,102,72,0); }
          50% { box-shadow: 0 0 22px 2px rgba(2,102,72,0.22); }
        }
        @keyframes dot-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes dash-float {
          0%,100% { transform: perspective(1600px) rotateX(7deg) rotateY(-1deg) translateY(0px); }
          50% { transform: perspective(1600px) rotateX(5.5deg) rotateY(-0.5deg) translateY(-10px); }
        }
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.7; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes cta-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(2,102,72,0), 0 8px 32px rgba(2,102,72,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(2,102,72,0.08), 0 8px 48px rgba(2,102,72,0.45); }
        }
        @keyframes orb-drift1 {
          0%,100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes orb-drift2 {
          0%,100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-80px, 60px) scale(1.15); }
          70% { transform: translate(50px, -20px) scale(0.85); }
        }
        @keyframes orb-drift3 {
          0%,100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 50px) scale(1.2); }
        }

        /* FAQ */
        .pl-faq summary::-webkit-details-marker { display: none; }
        .pl-faq[open] .pl-chv { transform: rotate(90deg); }
        .pl-chv { transition: transform .22s; }

        /* Responsive */
        @media (max-width: 920px) {
          .pl-hide { display: none !important; }
          .pl-2col { grid-template-columns: 1fr !important; }
          .pl-3col { grid-template-columns: 1fr !important; }
          .pl-4col { grid-template-columns: 1fr 1fr !important; }
          .pl-ord1 { order: 1 !important; }
          .pl-ord2 { order: 2 !important; }
        }
        @media (max-width: 560px) {
          .pl-4col { grid-template-columns: 1fr !important; }
          .pl-ftcols { grid-template-columns: 1fr !important; }
          .pl-hbtns { flex-direction: column !important; }
        }
      `}</style>

      <div className="pl relative min-h-screen overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Wordmark />
            <nav className="pl-hide" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                <a key={h} href={h} className="pl-nl">{l}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" className="pl-ghost">Entrar</Link>
              <Link href="/cadastro" className="pl-btn pl-btn-sm cta-pulse" style={{ background: G }}>
                Começar <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          </div>
        </header>

        <main>

          {/* ══ HERO ══ */}
          <section className="grid-bg" style={{ background: '#000', padding: '100px 32px 0', position: 'relative', overflow: 'hidden' }}>
            {/* Animated orbs */}
            <div className="orb1" aria-hidden style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 700, background: `radial-gradient(ellipse, ${G}16, transparent 65%)`, pointerEvents: 'none', filter: 'blur(20px)' }} />
            <div className="orb2" aria-hidden style={{ position: 'absolute', top: '30%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(255,255,255,0.018), transparent 65%)', pointerEvents: 'none', filter: 'blur(30px)' }} />
            <div className="orb3" aria-hidden style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, background: `radial-gradient(ellipse, ${G}10, transparent 65%)`, pointerEvents: 'none', filter: 'blur(40px)' }} />

            <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>

              {/* Eyebrow — glowing badge */}
              <div style={{ marginBottom: 36 }}>
                <div className="pl-badge" style={{ width: 'fit-content' }}>
                  <span className="pl-dot" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: GLit, letterSpacing: '0.04em' }}>
                    Gestão financeira — PF &amp; PJ com IA
                  </span>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 300 }}>Novo</span>
                </div>
              </div>

              {/* Headline */}
              <h1 style={{ margin: '0 0 28px', maxWidth: 900 }}>
                <span style={{ display: 'block', fontSize: 'clamp(3.4rem, 7.5vw, 6.4rem)', fontWeight: 800, lineHeight: 0.92, color: '#fff', letterSpacing: '-0.045em' }}>
                  Clareza total.
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', fontWeight: 300, lineHeight: 1.2, color: '#9ca3af', letterSpacing: '-0.025em', fontStyle: 'italic', marginTop: 10 }}>
                  Pessoal e empresa no mesmo lugar.
                </span>
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.75, color: '#6b7280', fontWeight: 400, margin: '0 0 44px', maxWidth: 540 }}>
                O PearFy organiza seu dinheiro pessoal e empresarial com IA — sem planilha, sem improviso.
              </p>

              <div className="pl-hbtns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 56, padding: '0 40px', fontSize: 16, borderRadius: 13 }}>
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 18, height: 18 }} />
                </Link>
                <a href="#como-funciona" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 56, padding: '0 32px', borderRadius: 13,
                  fontSize: 16, fontWeight: 400, color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}>Ver como funciona</a>
              </div>

              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 14, color: '#4b5563', fontWeight: 300, marginBottom: 80 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: G, flexShrink: 0 }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* 3D Dashboard */}
            <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
              <div aria-hidden style={{
                position: 'absolute', bottom: -60, left: '10%', right: '10%', height: 220,
                background: `radial-gradient(ellipse, ${G}35, transparent 70%)`,
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
              }} />
              <div className="dash-wrap" style={{
                position: 'relative', zIndex: 1,
                borderRadius: 16,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
              }}>
                <DashboardMockup />
              </div>
              <div aria-hidden style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
                background: 'linear-gradient(to top, #000 30%, transparent 100%)',
                pointerEvents: 'none', zIndex: 2,
              }} />
            </div>
          </section>

          {/* ══ STATEMENT ══ */}
          <section style={{ background: '#000', padding: '100px 32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <p style={{ fontSize: 'clamp(2rem, 4.8vw, 3.6rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', letterSpacing: '-0.035em', margin: '0 0 24px', maxWidth: 900 }}>
                O dinheiro não some.{' '}
                <em style={{ color: '#374151', fontWeight: 300 }}>Ele vai pra onde você não está olhando.</em>
              </p>
              <p style={{ fontSize: 18, color: '#6b7280', fontWeight: 400, maxWidth: 600, lineHeight: 1.8, margin: 0 }}>
                Você trabalha, fatura, paga contas — e no fim do mês o número nunca fecha. O PearFy te dá visão real sobre cada centavo, separado por PF e PJ.
              </p>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section id="como-funciona" style={{ background: '#070707', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 32px' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ marginBottom: 64 }}>
                <p style={{ fontSize: 13, fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', color: GLit, margin: '0 0 16px' }}>O mecanismo</p>
                <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
                  Não é um app a mais.
                  <br />
                  <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#4b5563' }}>É estrutura de comando.</span>
                </h2>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                  { n: '01', title: 'Centraliza',  body: 'Pessoal e empresarial no mesmo sistema. Uma plataforma, tudo visível. Sem ferramentas paralelas, sem retrabalho.' },
                  { n: '02', title: 'Separa',      body: 'PF de um lado. PJ do outro. Um clique muda o contexto. Cada lado com sua lógica e análise própria.' },
                  { n: '03', title: 'Interpreta',  body: 'A IA lê os dados, detecta padrões e entrega análise antes que o problema apareça.' },
                ].map((p, i) => (
                  <div key={p.n} style={{
                    background: i === 1 ? '#111' : '#0b0b0b',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '48px 40px', position: 'relative', overflow: 'hidden',
                    borderTop: i === 1 ? `2px solid ${G}` : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span aria-hidden style={{ position: 'absolute', bottom: -24, right: -12, fontSize: 140, fontWeight: 900, color: G, opacity: 0.035, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.05em' }}>{p.n}</span>
                    <div style={{ fontSize: 12, fontWeight: 300, letterSpacing: '0.12em', color: GLit, textTransform: 'uppercase', marginBottom: 20 }}>{p.n}</div>
                    <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>{p.title}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ STATS ══ */}
          <section style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                  { n: '< 5',  unit: 'min',     label: 'para configurar e começar' },
                  { n: '16',   unit: 'categ.',   label: 'de despesa PF analisadas' },
                  { n: '3',    unit: 'CNPJs',    label: 'no plano Gestão anual'    },
                  { n: '7',    unit: 'dias',     label: 'de garantia total'        },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '52px 36px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>{s.n}</span>
                      <span style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 300, color: GLit }}>{s.unit}</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FEATURES ══ */}
          <section id="recursos" style={{ background: '#000' }}>

            {/* PF + PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 32px' }}>
              <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Módulo PF + PJ</span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.08, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      Pessoal e empresa.<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#4b5563' }}>Sem misturar nada.</em>
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você enxerga cada lado com clareza real.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Painéis PF e PJ totalmente independentes','Troca de modo com um clique — sem recarregar','Saldo, entradas e saídas em tempo real','Histórico mês a mês sem perda de dados'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 19, height: 19, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 32px', background: '#060606' }}>
              <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div className="pl-ord2"><VisualDRE /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="pl-ord1">
                    <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Módulo Empresarial · PJ</span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.08, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      O que só o contador sabia,<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#4b5563' }}>você vê no mesmo dia.</em>
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>DRE, fluxo de caixa e imposto estimado calculados pelo regime correto, atualizados a cada lançamento.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Imposto por regime: MEI, Simples, Presumido, Real','DRE mensal gerado automaticamente','Fluxo de caixa com projeção e vencimentos','Pró-labore, distribuição de lucros e sócios'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 19, height: 19, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 32px' }}>
              <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit }}>Inteligência Artificial</span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.08, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      Uma IA que conhece<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#4b5563' }}>seus números.</em>
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>Diferente do ChatGPT, o assistente da PearFy acessa seu histórico real. A resposta é sobre você — não sobre o usuário médio.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Acessa seu histórico real — não exemplos da internet','Registra lançamentos por linguagem natural ou voz','Compara meses, detecta desvios, sugere metas','Plano Comando: IA ilimitada · demais: 60 ações/mês'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 19, height: 19, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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

          {/* ══ SECURITY ══ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>Seus dados pertencem a você.</h2>
                <p style={{ fontSize: 15, color: '#4b5563', fontWeight: 300, margin: 0 }}>Padrão de segurança dos bancos digitais.</p>
              </div>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {[
                  { Icon: Shield,       title: 'AES-256',           desc: 'Criptografia de nível bancário. Dados protegidos em trânsito e em repouso.' },
                  { Icon: Lock,         title: 'Sem senha bancária', desc: 'Nunca pedimos nem armazenamos credenciais de banco. Sempre.' },
                  { Icon: CheckCircle2, title: 'Só leitura',         desc: 'A IA analisa seus dados. Nenhuma transação é executada sem você.' },
                  { Icon: Zap,          title: 'Exclusão total',     desc: 'Apague tudo a qualquer momento. Sem formulário, sem espera.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: GDim, border: `1px solid ${GBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 20, height: 20, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.72, color: '#6b7280', fontWeight: 300, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FOR WHO ══ */}
          <section style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ marginBottom: 52 }}>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 12px' }}>Para quem a PearFy foi construída</h2>
                <p style={{ fontSize: 16, color: '#4b5563', fontWeight: 300, margin: 0 }}>Não para todo mundo. Para quem está cansado de improvisar.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                  { Icon: User,      title: 'Profissional com renda variável', desc: 'Freelancers, consultores e autônomos que precisam de previsibilidade — sem depender de contador para entender o básico do próprio dinheiro.' },
                  { Icon: Building2, title: 'Empresário com operação PJ',      desc: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto e fechar o mês sem planilha paralela.' },
                  { Icon: Layers,    title: 'Quem tem PF + PJ ao mesmo tempo', desc: 'Renda pessoal e empresarial simultâneas, precisando de visão total em um único sistema — sem retrabalho, sem confusão.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '38px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: GDim, border: `1px solid ${GBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 22, height: 22, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#6b7280', fontWeight: 400, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ TESTIMONIALS ══ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ marginBottom: 52 }}>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 12px' }}>Quem já usa, fala.</h2>
                <p style={{ fontSize: 16, color: '#4b5563', fontWeight: 300, margin: 0 }}>Resultados reais de quem saiu do improviso.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {TESTIMONIALS.map(t => (
                  <div key={t.name} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', padding: '36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: t.stars }).map((_, i) => <Star key={i} style={{ width: 15, height: 15, color: GLit, fill: GLit }} />)}
                    </div>
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: '#9ca3af', fontWeight: 400, margin: 0 }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: `0 0 16px ${G}50` }}>{t.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 13, color: '#4b5563', fontWeight: 300, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PRICING ══ */}
          <section id="precos" style={{ background: '#000', '--text-strong': '#ffffff', '--text-soft': '#6b7280', '--panel-bg': '#0d0d0d', '--panel-border': 'rgba(255,255,255,0.06)', '--accent-main': G, '--accent-alt': '#026749' } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ══ GUARANTEE ══ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '90px 32px' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: GDim, border: `1px solid ${GBd}`, marginBottom: 32, boxShadow: `0 0 30px ${G}30` }}>
                <Shield style={{ width: 26, height: 26, color: GLit }} />
              </div>
              <h2 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.045em', margin: '0 0 20px', lineHeight: 0.95 }}>
                7 dias de garantia.<br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#4b5563' }}>Ponto.</span>
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: '0 0 14px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor — sem formulário, sem e-mail de retenção.
              </p>
              <p style={{ fontSize: 15, color: '#374151', fontWeight: 300, margin: '0 0 40px' }}>Não é trial. É compra com segurança real.</p>
              <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 56, padding: '0 44px', fontSize: 16, borderRadius: 13 }}>
                Assinar agora <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section id="faq" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 32px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 48px' }}>
                Perguntas frequentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {FAQ_ITEMS.map(item => (
                  <details key={item.q} className="pl-faq" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', fontSize: 16, fontWeight: 500, color: '#e5e7eb', userSelect: 'none', letterSpacing: '-0.01em' }}>
                      {item.q}
                      <ChevronRight className="pl-chv" style={{ width: 17, height: 17, color: '#374151', flexShrink: 0 }} />
                    </summary>
                    <div style={{ padding: '0 26px 22px' }}>
                      <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 400, margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p style={{ marginTop: 36, fontSize: 14, color: '#374151', fontWeight: 300 }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: GLit, fontWeight: 500 }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ══ CTA FINAL ══ */}
          <section className="grid-bg" style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '110px 32px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 500, background: `radial-gradient(ellipse, ${G}12, transparent 65%)`, pointerEvents: 'none', filter: 'blur(30px)' }} />
            <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.92, margin: '0 0 28px' }}>
                Chega de achar<br />que sobrou.
                <br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#374151' }}>Veja a realidade.</span>
              </h2>
              <p style={{ fontSize: 18, color: '#6b7280', fontWeight: 400, maxWidth: 540, lineHeight: 1.8, margin: '0 0 48px' }}>
                Assine agora e tenha visão real sobre pessoal e empresa — sem planilha, sem feeling, sem surpresa no fim do mês.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
                <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 58, padding: '0 48px', fontSize: 17, borderRadius: 14 }}>
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 19, height: 19 }} />
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 14, color: '#374151', fontWeight: 300 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 14, height: 14, color: G }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 32px 36px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div className="pl-ftcols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <Wordmark />
                <p style={{ fontSize: 14, color: '#374151', fontWeight: 300, margin: '18px 0 18px', lineHeight: 1.7, maxWidth: 300 }}>
                  Gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
                <a href="mailto:suporte@pearfy.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 14, color: '#4b5563', fontWeight: 300 }}>
                  <Mail style={{ width: 16, height: 16, color: G }} /> suporte@pearfy.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 18px' }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([h, l]) => (
                    <Link key={h} href={h} style={{ fontSize: 14, color: '#4b5563', fontWeight: 300 }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 18px' }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 14, color: '#4b5563', fontWeight: 300 }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#374151', fontWeight: 300 }}>
              <span>© 2026 PearFy · Todos os direitos reservados</span>
              <div style={{ display: 'flex', gap: 20 }}>
                {[['Pessoal · PF', User],['Empresarial · PJ', Building2],['IA Integrada', TrendingUp]].map(([l, Icon]) => (
                  <span key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151' }}>
                    {/* @ts-ignore */}
                    <Icon style={{ width: 13, height: 13, color: G }} />{l as string}
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
