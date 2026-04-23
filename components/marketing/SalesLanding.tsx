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

// ─── Solar System ─────────────────────────────────────────────────────────────
function SolarSystem() {
  return (
    <div aria-hidden className="solar-root">
      {/* Sun */}
      <div className="solar-sun" />
      {/* Orbit rings + planets */}
      <div className="s-ring s-r1"><div className="s-planet s-p1" /></div>
      <div className="s-ring s-r2"><div className="s-planet s-p2" /></div>
      <div className="s-ring s-r3"><div className="s-planet s-p3" /></div>
      <div className="s-ring s-r4"><div className="s-planet s-p4" /></div>
      {/* Asteroid belt ring - decorative only, no animation */}
      <div className="s-belt" />
    </div>
  )
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const bars = [32, 48, 38, 68, 44, 58, 76, 52, 70, 82, 46, 90]

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.13)',
      background: '#080808',
      width: '100%',
      position: 'relative',
      boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
    }}>
      {/* Scan line animation */}
      <div className="dash-scan" aria-hidden />

      {/* Chrome bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px', background: '#101010', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <div style={{ marginLeft: 14, flex: 1, maxWidth: 320, borderRadius: 7, padding: '6px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Shield style={{ width: 10, height: 10, color: GLit, flexShrink: 0 }} />
          app.pearfy.com/dashboard
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', background: '#1a1a1a', padding: '4px 10px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.06)' }}>Abril 2025</div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${G}60` }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>L</span>
          </div>
        </div>
      </div>

      {/* App Layout */}
      <div style={{ display: 'flex', height: 520 }}>

        {/* Sidebar */}
        <div style={{ width: 170, background: '#0c0c0c', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pearfy-logo.svg" alt="PearFy" style={{ height: 22, width: 'auto' }} />
          </div>

          {/* PF/PJ Toggle */}
          <div style={{ margin: '0 12px 14px', background: '#1a1a1a', borderRadius: 9, padding: 4, display: 'flex', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, background: G, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>PF</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>PJ</div>
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
              padding: '8px 16px', fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? '#fff' : '#9ca3af',
              background: active ? GDim : 'transparent',
              borderLeft: `2px solid ${active ? G : 'transparent'}`,
              marginBottom: 2,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>{lbl as string}</div>
          ))}

          {/* AI status */}
          <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px ${G}70, 0 0 28px ${G}30` }}>
                <Brain style={{ width: 14, height: 14, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>IA ativa</div>
                <div style={{ fontSize: 10, color: GLit, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="pl-dot" style={{ width: 5, height: 5 }} /> online
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '18px 22px', background: '#080808', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Resumo Pessoal</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Modo PF · Abril 2025</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', background: '#111', padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GLit, display: 'inline-block', boxShadow: `0 0 5px ${GLit}` }} />
                Atualizado agora
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', background: '#111', padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.07)' }}>
                Exportar ↗
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { lbl: 'SALDO',     val: 'R$ 24.430', chg: '+18,4%', up: true },
              { lbl: 'RECEITAS',  val: 'R$ 52.480', chg: '+22,7%', up: true },
              { lbl: 'DESPESAS',  val: 'R$ 28.250', chg: '+9,2%',  up: false },
              { lbl: 'RESULTADO', val: 'R$ 24.230', chg: '+36,8%', up: true },
            ].map(m => (
              <div key={m.lbl} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '13px 14px', borderTop: m.up ? `2px solid ${G}` : '2px solid #ef4444' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.lbl}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: m.up ? '#fff' : '#f87171', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{m.val}</div>
                <div style={{ fontSize: 11, color: m.up ? GLit : '#f87171', marginTop: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span>{m.up ? '↑' : '↓'}</span>{m.chg}
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 10, flex: 1 }}>
            {/* Bar chart */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Fluxo de caixa — 2025</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: G, display: 'inline-block' }} /> Receitas
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af', background: '#1a1a1a', padding: '3px 9px', borderRadius: 5 }}>Mensal ▾</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1, paddingBottom: 6 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0', height: `${h}%`,
                      background: i === bars.length - 1
                        ? `linear-gradient(180deg, ${GLit}, ${G})`
                        : i >= bars.length - 3
                          ? `rgba(2,102,72,${0.18 + h / 250})`
                          : `rgba(2,102,72,${0.10 + h / 400})`,
                      boxShadow: i === bars.length - 1 ? `0 0 14px ${G}90, 0 -6px 16px ${G}50` : 'none',
                      transition: 'height .3s ease',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m => (
                  <span key={m} style={{ fontSize: 9, color: '#9ca3af', flex: 1, textAlign: 'center' }}>{m}</span>
                ))}
              </div>
            </div>

            {/* AI chat snippet */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 12px ${G}60` }}>
                  <Brain style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Assistente IA</div>
                  <div style={{ fontSize: 10, color: GLit }}>acessa seus dados</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                <div style={{ background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 9px 9px 9px', padding: '9px 12px', fontSize: 12, color: '#d1d5db', lineHeight: 1.55 }}>
                  Abril 12% acima. Alimentação subiu R$ 340. Ajusto a meta?
                </div>
                <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '9px 0 9px 9px', padding: '9px 12px', fontSize: 12, color: '#9ca3af', alignSelf: 'flex-end' }}>
                  Sim, ajuste.
                </div>
                <div style={{ background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 9px 9px 9px', padding: '9px 12px', fontSize: 12, color: '#d1d5db', lineHeight: 1.55 }}>
                  ✓ Meta ajustada para R$ 3.800 em alimentação.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row — mini recent transactions */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Últimas movimentações</span>
              <span style={{ fontSize: 11, color: GLit }}>Ver todas →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { cat: 'Salário', val: '+R$ 8.500', up: true },
                { cat: 'Aluguel', val: '–R$ 2.200', up: false },
                { cat: 'Freelance', val: '+R$ 3.800', up: true },
                { cat: 'Superm.', val: '–R$ 680', up: false },
              ].map(tx => (
                <div key={tx.cat} style={{ background: '#161616', borderRadius: 7, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>{tx.cat}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tx.up ? GLit : '#f87171', letterSpacing: '-0.01em' }}>{tx.val}</div>
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
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>DRE — Abril 2026</span>
        <span style={{ fontSize: 12, background: GDim, color: GLit, padding: '5px 12px', borderRadius: 100, border: `1px solid ${GBd}`, fontWeight: 500 }}>Simples Nacional</span>
      </div>
      {[
        { label: 'Faturamento Bruto', value: 'R$ 28.500', color: GLit,    border: `1px solid ${GBd}` },
        { label: 'Total Despesas',    value: '– R$ 11.200', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' },
        { label: 'Imposto Estimado',  value: '– R$ 1.425',  color: '#d1d5db', border: '1px solid rgba(255,255,255,0.07)' },
        { label: 'Lucro Líquido',     value: 'R$ 15.875',  color: GLit,    border: `2px solid ${G}` },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#161616', borderRadius: 10, border: row.border, marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: '#d1d5db', fontWeight: 400 }}>{row.label}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: row.color, letterSpacing: '-0.02em' }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function VisualPanels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>
      {[
        { label: 'Pessoal · PF',  mode: 'PF', items: [{ k: 'Saldo líquido', v: 'R$ 8.420', up: true }, { k: 'Saídas do mês', v: 'R$ 4.380', up: false }] },
        { label: 'Empresa · PJ',  mode: 'PJ', items: [{ k: 'Faturamento', v: 'R$ 28.5k', up: true }, { k: 'Lucro líquido', v: 'R$ 15.8k', up: true }] },
      ].map(p => (
        <div key={p.label} style={{ background: '#0f0f0f', border: `1px solid ${GBd}`, borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: `0 0 12px ${G}50` }}>{p.mode}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.label}</span>
            </div>
            <span style={{ fontSize: 12, background: GDim, color: GLit, padding: '3px 10px', borderRadius: 6, border: `1px solid ${GBd}` }}>Abr 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {p.items.map(item => (
              <div key={item.k} style={{ background: '#000', borderRadius: 10, padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontWeight: 400 }}>{item.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.up ? '#fff' : '#f87171', letterSpacing: '-0.03em' }}>{item.v}</div>
                <div style={{ fontSize: 12, color: item.up ? GLit : '#f87171', marginTop: 4 }}>{item.up ? '↑' : '↓'} vs. Mar</div>
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
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 28px ${G}70` }}>
          <Brain style={{ width: 20, height: 20, color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Assistente PearFy</div>
          <div style={{ fontSize: 13, color: GLit, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GLit, display: 'inline-block', boxShadow: `0 0 6px ${GLit}` }} />
            online · acessa seus dados reais
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 14px 14px 14px', padding: '13px 16px', fontSize: 14, color: '#e5e7eb', lineHeight: 1.6, fontWeight: 400 }}>
          Abril ficou 12% acima de março. Alimentação +R$ 340 e assinaturas +R$ 180. Ajusto a meta?
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '55%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px 0 14px 14px', padding: '13px 16px', fontSize: 14, color: '#d1d5db', fontWeight: 300 }}>
          Sim, ajuste.
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: GDim, border: `1px solid ${GBd}`, borderRadius: '0 14px 14px 14px', padding: '13px 16px', fontSize: 14, color: '#e5e7eb', lineHeight: 1.6, fontWeight: 400 }}>
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
        .pl { background: #000; color: #d1d5db; }
        .pl a { text-decoration: none; }

        /* Nav links */
        .pl-nl { color: #9ca3af; font-size: 15px; font-weight: 400; transition: color .15s; }
        .pl-nl:hover { color: #fff; }

        /* Buttons */
        .pl-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          height: 42px; padding: 0 20px; border-radius: 9px;
          font-size: 14px; font-weight: 400; color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.12); transition: all .15s;
        }
        .pl-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.25); }
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
          padding: 10px 20px; border-radius: 100px;
          border: 1px solid ${GBd};
          background: ${GDim};
          animation: badge-glow 3s ease-in-out infinite;
        }
        .pl-dot {
          width: 7px; height: 7px; border-radius: 50%; background: ${GLit};
          animation: dot-pulse 2.5s ease-in-out infinite;
          display: inline-block; flex-shrink: 0;
        }

        /* Dashboard 3D float */
        .dash-wrap {
          animation: dash-float 7s ease-in-out infinite;
          transform-origin: center bottom;
        }

        /* Scan line */
        .dash-scan {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${GLit}70, transparent);
          animation: scan-line 5s linear infinite;
          pointer-events: none; z-index: 10;
        }

        /* CTA pulse */
        .cta-pulse { animation: cta-glow 2.5s ease-in-out infinite; }

        /* Background orbs */
        .orb1 { animation: orb-drift1 14s ease-in-out infinite; }
        .orb2 { animation: orb-drift2 18s ease-in-out infinite; }
        .orb3 { animation: orb-drift3 22s ease-in-out infinite; }

        /* Grid bg */
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ─── Solar System ─── */
        .solar-root {
          position: absolute;
          top: 50%; right: -80px;
          transform: translateY(-48%) perspective(700px) rotateX(52deg) rotateZ(-8deg);
          width: 720px; height: 720px;
          pointer-events: none; z-index: 0;
          opacity: 0.55;
        }
        .solar-sun {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 22px; height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, ${GLit} 50%, ${G} 100%);
          box-shadow: 0 0 16px 4px ${GLit}, 0 0 48px 8px ${G}80;
          animation: sun-pulse 3s ease-in-out infinite;
        }
        .s-ring {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(2,102,72,0.25);
          transform-origin: center center;
        }
        .s-r1 { width: 130px; height: 130px; margin: -65px 0 0 -65px; animation: solar-orbit 6s linear infinite; }
        .s-r2 { width: 240px; height: 240px; margin: -120px 0 0 -120px; animation: solar-orbit 11s linear infinite; border-color: rgba(2,102,72,0.20); }
        .s-r3 { width: 380px; height: 380px; margin: -190px 0 0 -190px; animation: solar-orbit 18s linear infinite; border-color: rgba(2,102,72,0.15); }
        .s-r4 { width: 530px; height: 530px; margin: -265px 0 0 -265px; animation: solar-orbit 28s linear infinite; border-color: rgba(2,102,72,0.10); }
        .s-belt {
          position: absolute;
          top: 50%; left: 50%;
          width: 308px; height: 308px;
          margin: -154px 0 0 -154px;
          border-radius: 50%;
          border: 6px dashed rgba(2,102,72,0.08);
          transform: translate(0,0);
        }
        .s-planet {
          position: absolute;
          border-radius: 50%;
          top: -5px; left: 50%;
          transform: translateX(-50%);
        }
        .s-p1 { width: 10px; height: 10px; background: ${GLit}; box-shadow: 0 0 10px ${GLit}; top: -5px; }
        .s-p2 { width: 7px; height: 7px; background: rgba(2,102,72,0.9); box-shadow: 0 0 8px ${G}; top: -3.5px; }
        .s-p3 { width: 13px; height: 13px; background: rgba(4,163,114,0.8); box-shadow: 0 0 14px ${GLit}80; top: -6.5px; }
        .s-p4 { width: 8px; height: 8px; background: rgba(2,102,72,0.6); box-shadow: 0 0 8px ${G}60; top: -4px; }

        /* Keyframes */
        @keyframes solar-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sun-pulse {
          0%,100% { box-shadow: 0 0 16px 4px ${GLit}, 0 0 48px 8px ${G}80; }
          50%     { box-shadow: 0 0 28px 8px ${GLit}, 0 0 72px 16px ${G}60; }
        }
        @keyframes badge-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(2,102,72,0); }
          50% { box-shadow: 0 0 24px 3px rgba(2,102,72,0.28); }
        }
        @keyframes dot-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes dash-float {
          0%,100% { transform: perspective(1800px) rotateX(7deg) rotateY(-1deg) translateY(0px); }
          50% { transform: perspective(1800px) rotateX(5.5deg) rotateY(-0.5deg) translateY(-12px); }
        }
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.7; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes cta-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(2,102,72,0), 0 8px 32px rgba(2,102,72,0.25); }
          50% { box-shadow: 0 0 0 7px rgba(2,102,72,0.09), 0 8px 52px rgba(2,102,72,0.50); }
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

        /* White section utility */
        .pl-white { background: #fff !important; }
        .pl-white * { --tw-text-opacity: 1; }

        /* Responsive */
        @media (max-width: 960px) {
          .pl-hide { display: none !important; }
          .pl-2col { grid-template-columns: 1fr !important; }
          .pl-3col { grid-template-columns: 1fr !important; }
          .pl-4col { grid-template-columns: 1fr 1fr !important; }
          .pl-ord1 { order: 1 !important; }
          .pl-ord2 { order: 2 !important; }
          .solar-root { display: none !important; }
        }
        @media (max-width: 600px) {
          .pl-4col { grid-template-columns: 1fr !important; }
          .pl-ftcols { grid-template-columns: 1fr !important; }
          .pl-hbtns { flex-direction: column !important; }
        }
      `}</style>

      <div className="pl relative min-h-screen overflow-x-hidden">

        {/* ── NAVBAR ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {/* Ambient orbs */}
            <div className="orb1" aria-hidden style={{ position: 'absolute', top: '-10%', right: '5%', width: 600, height: 600, background: `radial-gradient(ellipse, ${G}14, transparent 65%)`, pointerEvents: 'none', filter: 'blur(24px)' }} />
            <div className="orb2" aria-hidden style={{ position: 'absolute', top: '35%', left: '-8%', width: 480, height: 480, background: 'radial-gradient(ellipse, rgba(255,255,255,0.015), transparent 65%)', pointerEvents: 'none', filter: 'blur(32px)' }} />

            {/* Solar system — absolute behind content */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
              <SolarSystem />
            </div>

            {/* ── Headline block — centered ── */}
            <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>

              {/* Nº 1 badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  background: 'linear-gradient(135deg, rgba(2,102,72,0.18), rgba(4,163,114,0.10))',
                  border: '1px solid rgba(2,102,72,0.45)',
                  borderRadius: 16, padding: '10px 22px 10px 14px',
                  boxShadow: `0 0 32px rgba(2,102,72,0.25), inset 0 1px 0 rgba(255,255,255,0.07)`,
                }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>🇧🇷</span>
                  <span style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900,
                    background: `linear-gradient(135deg, #fff 0%, ${GLit} 55%, ${G} 100%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.04em', lineHeight: 1,
                    filter: `drop-shadow(0 0 14px ${GLit}80)`,
                  }}>Nº 1</span>
                </div>
              </div>

              {/* Headline */}
              <h1 style={{ margin: '0 0 56px' }}>
                <span style={{ display: 'block', fontSize: 'clamp(3rem, 7vw, 6.2rem)', fontWeight: 800, lineHeight: 0.93, color: '#fff', letterSpacing: '-0.048em' }}>
                  A primeira plataforma
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(3rem, 7vw, 6.2rem)', fontWeight: 800, lineHeight: 0.93, color: '#fff', letterSpacing: '-0.048em', marginTop: 8 }}>
                  a tirar PF e PJ do caos
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(1.8rem, 4.2vw, 3.6rem)', fontWeight: 300, lineHeight: 1.22, color: '#9ca3af', letterSpacing: '-0.026em', fontStyle: 'italic', marginTop: 18 }}>
                  e colocar tudo sob o mesmo comando.
                </span>
              </h1>
            </div>

            {/* ── 3D Dashboard ── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <div aria-hidden style={{
                position: 'absolute', bottom: -60, left: '5%', right: '5%', height: 260,
                background: `radial-gradient(ellipse, ${G}40, transparent 70%)`,
                filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
              }} />
              <div className="dash-wrap" style={{
                position: 'relative', zIndex: 1, borderRadius: 18,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.04)`,
              }}>
                <DashboardMockup />
              </div>
              {/* Fade out bottom */}
              <div aria-hidden style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
                background: 'linear-gradient(to top, #000 15%, transparent 100%)',
                pointerEvents: 'none', zIndex: 2,
              }} />
            </div>

            {/* ── CTA block — centered ── */}
            <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center', padding: '64px 0 80px' }}>
              <p style={{ fontSize: 19, lineHeight: 1.75, color: '#d1d5db', fontWeight: 400, margin: '0 auto 44px', maxWidth: 580 }}>
                O PearFy organiza seu dinheiro pessoal e empresarial com IA — sem planilha, sem improviso.
              </p>

              <div className="pl-hbtns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' }}>
                <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 58, padding: '0 42px', fontSize: 17, borderRadius: 13 }}>
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 19, height: 19 }} />
                </Link>
                <a href="#como-funciona" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 58, padding: '0 32px', borderRadius: 13,
                  fontSize: 16, fontWeight: 400, color: '#d1d5db',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>Ver como funciona</a>
              </div>

              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 14, color: '#9ca3af', fontWeight: 400, justifyContent: 'center' }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: G, flexShrink: 0 }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ══ STATEMENT — WHITE BLOCK ══ */}
          <section style={{ background: '#fff', padding: '100px 32px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <p style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.12, color: '#000', letterSpacing: '-0.04em', margin: '0 0 28px', maxWidth: 920 }}>
                O dinheiro não some.{' '}
                <em style={{ color: G, fontWeight: 700, fontStyle: 'normal' }}>Ele vai pra onde você não está olhando.</em>
              </p>
              <p style={{ fontSize: 19, color: '#374151', fontWeight: 400, maxWidth: 620, lineHeight: 1.8, margin: 0 }}>
                Você trabalha, fatura, paga contas — e no fim do mês o número nunca fecha. O PearFy te dá visão real sobre cada centavo, separado por PF e PJ.
              </p>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section id="como-funciona" style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '100px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ marginBottom: 64 }}>
                <p style={{ fontSize: 13, fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: GLit, margin: '0 0 16px' }}>O mecanismo</p>
                <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
                  Não é um app a mais.
                  <br />
                  <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>É estrutura de comando.</span>
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
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '52px 44px', position: 'relative', overflow: 'hidden',
                    borderTop: i === 1 ? `2px solid ${G}` : '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <span aria-hidden style={{ position: 'absolute', bottom: -24, right: -12, fontSize: 150, fontWeight: 900, color: G, opacity: 0.04, lineHeight: 1, userSelect: 'none', letterSpacing: '-0.05em' }}>{p.n}</span>
                    <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: '0.12em', color: GLit, textTransform: 'uppercase', marginBottom: 22 }}>{p.n}</div>
                    <h3 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.6rem)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>{p.title}</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ STATS — WHITE BLOCK ══ */}
          <section style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                  { n: '< 5',  unit: 'min',     label: 'para configurar e começar' },
                  { n: '16',   unit: 'categ.',   label: 'de despesa PF analisadas' },
                  { n: '3',    unit: 'CNPJs',    label: 'no plano Gestão anual'    },
                  { n: '7',    unit: 'dias',     label: 'de garantia total'        },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: '56px 38px', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 'clamp(3rem, 5.8vw, 4.8rem)', fontWeight: 900, color: '#000', letterSpacing: '-0.055em', lineHeight: 1 }}>{s.n}</span>
                      <span style={{ fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', fontWeight: 600, color: G }}>{s.unit}</span>
                    </div>
                    <span style={{ fontSize: 15, color: '#6b7280', fontWeight: 400, lineHeight: 1.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FEATURES ══ */}
          <section id="recursos" style={{ background: '#000' }}>

            {/* PF + PJ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '110px 32px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 88, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 13, fontWeight: 400, letterSpacing: '0.13em', textTransform: 'uppercase', color: GLit }}>Módulo PF + PJ</span>
                    <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)', fontWeight: 800, lineHeight: 1.06, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      Pessoal e empresa.<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>Sem misturar nada.</em>
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: 0 }}>Um painel para o financeiro pessoal. Outro para a empresa. Um clique separa os dois — e você enxerga cada lado com clareza real.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Painéis PF e PJ totalmente independentes','Troca de modo com um clique — sem recarregar','Saldo, entradas e saídas em tempo real','Histórico mês a mês sem perda de dados'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 16, color: '#d1d5db', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 20, height: 20, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '110px 32px', background: '#060606' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 88, alignItems: 'center' }}>
                  <div className="pl-ord2"><VisualDRE /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="pl-ord1">
                    <span style={{ fontSize: 13, fontWeight: 400, letterSpacing: '0.13em', textTransform: 'uppercase', color: GLit }}>Módulo Empresarial · PJ</span>
                    <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)', fontWeight: 800, lineHeight: 1.06, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      O que só o contador sabia,<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>você vê no mesmo dia.</em>
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: 0 }}>DRE, fluxo de caixa e imposto estimado calculados pelo regime correto, atualizados a cada lançamento.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Imposto por regime: MEI, Simples, Presumido, Real','DRE mensal gerado automaticamente','Fluxo de caixa com projeção e vencimentos','Pró-labore, distribuição de lucros e sócios'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 16, color: '#d1d5db', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 20, height: 20, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '110px 32px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="pl-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 88, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <span style={{ fontSize: 13, fontWeight: 400, letterSpacing: '0.13em', textTransform: 'uppercase', color: GLit }}>Inteligência Artificial</span>
                    <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.2rem)', fontWeight: 800, lineHeight: 1.06, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
                      Uma IA que conhece<br /><em style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>seus números.</em>
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: 0 }}>Diferente do ChatGPT, o assistente da PearFy acessa seu histórico real. A resposta é sobre você — não sobre o usuário médio.</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
                      {['Acessa seu histórico real — não exemplos da internet','Registra lançamentos por linguagem natural ou voz','Compara meses, detecta desvios, sugere metas','Plano Comando: IA ilimitada · demais: 60 ações/mês'].map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, fontSize: 16, color: '#d1d5db', fontWeight: 400 }}>
                          <BadgeCheck style={{ width: 20, height: 20, color: G, flexShrink: 0, marginTop: 1 }} />{b}
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
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>Seus dados pertencem a você.</h2>
                <p style={{ fontSize: 16, color: '#9ca3af', fontWeight: 400, margin: 0 }}>Padrão de segurança dos bancos digitais.</p>
              </div>
              <div className="pl-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {[
                  { Icon: Shield,       title: 'AES-256',           desc: 'Criptografia de nível bancário. Dados protegidos em trânsito e em repouso.' },
                  { Icon: Lock,         title: 'Sem senha bancária', desc: 'Nunca pedimos nem armazenamos credenciais de banco. Sempre.' },
                  { Icon: CheckCircle2, title: 'Só leitura',         desc: 'A IA analisa seus dados. Nenhuma transação é executada sem você.' },
                  { Icon: Zap,          title: 'Exclusão total',     desc: 'Apague tudo a qualquer momento. Sem formulário, sem espera.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: GDim, border: `1px solid ${GBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 22, height: 22, color: GLit }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#d1d5db', fontWeight: 400, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FOR WHO — WHITE BLOCK ══ */}
          <section style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '90px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ marginBottom: 56 }}>
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#000', letterSpacing: '-0.04em', margin: '0 0 14px' }}>Para quem a PearFy foi construída</h2>
                <p style={{ fontSize: 17, color: '#6b7280', fontWeight: 400, margin: 0 }}>Não para todo mundo. Para quem está cansado de improvisar.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                {[
                  { Icon: User,      title: 'Profissional com renda variável', desc: 'Freelancers, consultores e autônomos que precisam de previsibilidade — sem depender de contador para entender o básico do próprio dinheiro.' },
                  { Icon: Building2, title: 'Empresário com operação PJ',      desc: 'MEIs e pequenas empresas que precisam separar pessoa e empresa, calcular imposto e fechar o mês sem planilha paralela.' },
                  { Icon: Layers,    title: 'Quem tem PF + PJ ao mesmo tempo', desc: 'Renda pessoal e empresarial simultâneas, precisando de visão total em um único sistema — sem retrabalho, sem confusão.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '42px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: GDim, border: `1px solid ${GBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 24, height: 24, color: G }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', lineHeight: 1.3, margin: 0 }}>{title}</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: '#4b5563', fontWeight: 400, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ TESTIMONIALS ══ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ marginBottom: 56 }}>
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 14px' }}>Quem já usa, fala.</h2>
                <p style={{ fontSize: 17, color: '#9ca3af', fontWeight: 400, margin: 0 }}>Resultados reais de quem saiu do improviso.</p>
              </div>
              <div className="pl-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                {TESTIMONIALS.map(t => (
                  <div key={t.name} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', padding: '40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: t.stars }).map((_, i) => <Star key={i} style={{ width: 16, height: 16, color: GLit, fill: GLit }} />)}
                    </div>
                    <p style={{ fontSize: 17, lineHeight: 1.75, color: '#e5e7eb', fontWeight: 400, margin: 0 }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: `0 0 18px ${G}55` }}>{t.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PRICING ══ */}
          <section id="precos" style={{ background: '#000', '--text-strong': '#ffffff', '--text-soft': '#9ca3af', '--text-muted': '#6b7280', '--panel-bg': '#0d0d0d', '--panel-border': 'rgba(255,255,255,0.07)', '--accent-main': G, '--accent-alt': '#026749' } as React.CSSProperties}>
            <PricingSection />
          </section>

          {/* ══ GUARANTEE ══ */}
          <section style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '100px 32px' }}>
            <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: '50%', background: GDim, border: `1px solid ${GBd}`, marginBottom: 36, boxShadow: `0 0 36px ${G}40` }}>
                <Shield style={{ width: 28, height: 28, color: GLit }} />
              </div>
              <h2 style={{ fontSize: 'clamp(2.4rem, 5.8vw, 4.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.048em', margin: '0 0 22px', lineHeight: 0.93 }}>
                7 dias de garantia.<br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>Ponto.</span>
              </h2>
              <p style={{ fontSize: 18, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: '0 0 16px' }}>
                Assine qualquer plano. Se nos primeiros 7 dias não for o que esperava, devolvemos 100% do valor — sem formulário, sem e-mail de retenção.
              </p>
              <p style={{ fontSize: 16, color: '#9ca3af', fontWeight: 400, margin: '0 0 44px' }}>Não é trial. É compra com segurança real.</p>
              <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 58, padding: '0 48px', fontSize: 17, borderRadius: 13 }}>
                Assinar agora <ArrowRight style={{ width: 19, height: 19 }} />
              </Link>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section id="faq" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 32px' }}>
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 52px' }}>
                Perguntas frequentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {FAQ_ITEMS.map(item => (
                  <details key={item.q} className="pl-faq" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, overflow: 'hidden' }}>
                    <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', fontSize: 17, fontWeight: 500, color: '#fff', userSelect: 'none', letterSpacing: '-0.01em' }}>
                      {item.q}
                      <ChevronRight className="pl-chv" style={{ width: 18, height: 18, color: '#9ca3af', flexShrink: 0 }} />
                    </summary>
                    <div style={{ padding: '0 28px 24px' }}>
                      <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', fontWeight: 400, margin: 0 }}>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <p style={{ marginTop: 40, fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                Outra dúvida?{' '}
                <a href="/suporte" style={{ color: GLit, fontWeight: 500 }}>Fale com o suporte</a>
              </p>
            </div>
          </section>

          {/* ══ CTA FINAL ══ */}
          <section className="grid-bg" style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '120px 32px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: 600, background: `radial-gradient(ellipse, ${G}14, transparent 65%)`, pointerEvents: 'none', filter: 'blur(40px)' }} />
            <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.052em', lineHeight: 0.9, margin: '0 0 30px' }}>
                Chega de achar<br />que sobrou.
                <br />
                <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#9ca3af' }}>Veja a realidade.</span>
              </h2>
              <p style={{ fontSize: 19, color: '#d1d5db', fontWeight: 400, maxWidth: 560, lineHeight: 1.8, margin: '0 0 52px' }}>
                Assine agora e tenha visão real sobre pessoal e empresa — sem planilha, sem feeling, sem surpresa no fim do mês.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 30 }}>
                <Link href="/cadastro" className="pl-btn cta-pulse" style={{ height: 60, padding: '0 52px', fontSize: 18, borderRadius: 14 }}>
                  Assinar com 7 dias de garantia <ArrowRight style={{ width: 20, height: 20 }} />
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                {['7 dias de garantia', 'Cancele quando quiser', 'Sem fidelidade'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: G }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '60px 32px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="pl-ftcols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 52, marginBottom: 52 }}>
              <div>
                <Wordmark />
                <p style={{ fontSize: 15, color: '#9ca3af', fontWeight: 400, margin: '20px 0 20px', lineHeight: 1.75, maxWidth: 320 }}>
                  Gestão financeira pessoal e empresarial com inteligência artificial.
                </p>
                <a href="mailto:suporte@pearfy.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>
                  <Mail style={{ width: 16, height: 16, color: G }} /> suporte@pearfy.com
                </a>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 20px' }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['/termos','Termos de uso'],['/privacidade','Privacidade'],['/suporte','Suporte'],['/contato','Contato']].map(([h, l]) => (
                    <Link key={h} href={h} style={{ fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 20px' }}>Produto</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['#como-funciona','Como funciona'],['#recursos','Recursos'],['#precos','Preços'],['#faq','FAQ']].map(([h, l]) => (
                    <a key={h} href={h} style={{ fontSize: 15, color: '#9ca3af', fontWeight: 400 }}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>
              <span>© 2026 PearFy · Todos os direitos reservados</span>
              <div style={{ display: 'flex', gap: 22 }}>
                {[['Pessoal · PF', User],['Empresarial · PJ', Building2],['IA Integrada', TrendingUp]].map(([l, Icon]) => (
                  <span key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af' }}>
                    {/* @ts-expect-error – dynamic icon component */}
                    <Icon style={{ width: 14, height: 14, color: G }} />{l as string}
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
