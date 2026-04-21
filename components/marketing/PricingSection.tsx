'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Minus, Sparkles } from 'lucide-react'

type Duration = 1 | 3 | 6 | 12

const DURATIONS: { value: Duration; label: string; discount: number; badge?: string }[] = [
  { value: 1,  label: 'Mensal',   discount: 0                    },
  { value: 3,  label: '3 meses',  discount: 0                    },
  { value: 6,  label: '6 meses',  discount: 15, badge: 'Popular' },
  { value: 12, label: 'Anual',    discount: 25, badge: '-25%'    },
]

const PLANS = [
  {
    code: 'clareza',
    name: 'Clareza',
    monthlyPrice: 37,
    subtitle: 'Sua vida financeira com visão clara, rotina organizada e IA assistida.',
    highlight: false,
    color: '#2563EB',
    features: [
      'Dashboard financeiro pessoal',
      'Receitas, despesas e saldo mensal',
      'Categorização inteligente',
      'Planejamento e orçamento',
      'Insights automáticos',
      'IA com 60 ações/mês',
      'Relatórios exportáveis',
      'Alertas e digest mensal',
    ],
    missing: ['Módulo empresarial'],
    iaLabel: '60 ações/mês',
    capacidade: (_d: Duration) => 'Sem módulo empresarial',
  },
  {
    code: 'gestao',
    name: 'Gestão',
    monthlyPrice: 97,
    subtitle: 'Controle financeiro empresarial com leitura operacional, estrutura e clareza do negócio.',
    highlight: false,
    color: '#60A5FA',
    features: [
      'Dashboard empresarial',
      'DRE em tempo real',
      'Fluxo de caixa',
      'Receitas e despesas',
      'Clientes e fornecedores',
      'Impostos por regime tributário',
      'Fechamento por lançamento',
      'IA com 60 ações/mês',
      'Relatórios exportáveis',
      'Alertas e digest',
    ],
    missing: ['Módulo pessoal', 'IA ilimitada'],
    iaLabel: '60 ações/mês',
    capacidade: (d: Duration) => {
      const map: Record<Duration, string> = {
        1: '1 empresa', 3: '1 empresa', 6: '2 empresas', 12: '3 empresas',
      }
      return map[d]
    },
  },
  {
    code: 'comando',
    name: 'Comando',
    monthlyPrice: 147,
    subtitle: 'Acesso total ao ecossistema SAOOZ — visão completa, inteligência sem limite, operação com poder.',
    highlight: true,
    color: '#1D4ED8',
    features: [
      'Tudo do Clareza + tudo do Gestão',
      'Visão unificada PF + PJ',
      'IA sem limite de uso',
      'Análises cruzadas e recomendações avançadas',
      'Relatórios premium',
      'Compartilhamento e acesso para equipe',
      'Suporte prioritário',
    ],
    missing: [],
    iaLabel: 'Ilimitada',
    capacidade: (d: Duration) => {
      const map: Record<Duration, string> = {
        1: 'pessoal + 1 empresa',
        3: 'pessoal + 2 empresas',
        6: 'pessoal + 3 empresas',
        12: 'pessoal + 5 empresas',
      }
      return map[d]
    },
  },
]

function calcPrice(base: number, duration: Duration, discount: number) {
  const monthly = base * (1 - discount / 100)
  const total   = monthly * duration
  return { monthly, total }
}

export function PricingSection() {
  const [duration, setDuration] = useState<Duration>(1)
  const disc = DURATIONS.find(d => d.value === duration)!.discount

  return (
    <section id="planos" style={{ borderTop: '1px solid var(--panel-border)' }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-soft)' }}>
            Planos
          </p>
          <h2 className="text-3xl font-black md:text-4xl" style={{ color: 'var(--text-strong)' }}>
            Escolha o plano certo para o seu momento
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-soft)' }}>
            7 dias de garantia em qualquer plano · reembolso total se não estiver satisfeito · cancele quando quiser
          </p>
        </div>

        {/* Duration tabs */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex rounded-[14px] p-1 gap-1"
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className="relative flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-semibold transition-all"
                style={
                  duration === d.value
                    ? {
                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                        color: '#fff',
                        boxShadow: '0 4px 16px color-mix(in oklab, var(--accent-blue) 30%, transparent)',
                      }
                    : { color: 'var(--text-soft)' }
                }
              >
                {d.label}
                {d.badge && duration !== d.value && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: '#22c55e20', color: '#22c55e' }}
                  >
                    {d.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Savings notice */}
        {disc > 0 && (
          <div className="mb-8 text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{ background: '#22c55e12', border: '1px solid #22c55e30', color: '#22c55e' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Você economiza {disc}% — cobrado a cada {duration === 3 ? '3 meses' : duration === 6 ? '6 meses' : 'ano'}
            </span>
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const { monthly, total } = calcPrice(plan.monthlyPrice, duration, disc)

            return (
              <article
                key={plan.code}
                className="panel-card relative overflow-hidden rounded-[20px] p-6 flex flex-col gap-5"
                style={
                  plan.highlight
                    ? {
                        borderColor: 'color-mix(in oklab, var(--accent-blue) 50%, transparent)',
                        boxShadow: '0 16px 48px color-mix(in oklab, var(--accent-blue) 15%, transparent)',
                      }
                    : {}
                }
              >
                {plan.highlight && (
                  <>
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25"
                      style={{ background: `radial-gradient(circle, ${plan.color}, transparent)`, filter: 'blur(40px)' }}
                    />
                    <span
                      className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                        color: 'var(--accent-blue)',
                        border: '1px solid color-mix(in oklab, var(--accent-blue) 30%, transparent)',
                      }}
                    >
                      Mais escolhido
                    </span>
                  </>
                )}

                {/* Nome + preço */}
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ background: `color-mix(in oklab, ${plan.color} 14%, transparent)`, color: plan.color }}
                  >
                    {plan.name}
                  </span>
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-strong)' }}>
                      R${monthly.toFixed(0)}
                    </span>
                    <span className="mb-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>/mês</span>
                    {disc > 0 && (
                      <span className="mb-1.5 text-xs font-semibold line-through" style={{ color: 'var(--text-muted)' }}>
                        R${plan.monthlyPrice}
                      </span>
                    )}
                  </div>
                  {duration > 1 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>
                      Total:{' '}
                      <span className="font-semibold" style={{ color: plan.color }}>
                        R${total.toFixed(0)}
                      </span>{' '}
                      a cada {duration === 3 ? '3 meses' : duration === 6 ? '6 meses' : 'ano'}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                    {plan.subtitle}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
                      <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {f}
                    </div>
                  ))}
                  {plan.missing.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-sm opacity-30" style={{ color: 'var(--text-soft)' }}>
                      <Minus className="h-4 w-4 shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>

                {/* Capacidade operacional */}
                <div
                  className="rounded-[12px] px-4 py-3 space-y-1.5"
                  style={{ background: `color-mix(in oklab, ${plan.color} 7%, transparent)`, border: `1px solid color-mix(in oklab, ${plan.color} 18%, transparent)` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: plan.color }}>
                    Capacidade por ciclo
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-base)' }}>
                    {plan.capacidade(duration)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-soft)' }}>
                    IA: {plan.iaLabel}
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-2">
                  <Link
                    href="/cadastro"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{
                      background: plan.highlight
                        ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                        : `linear-gradient(135deg, color-mix(in oklab, ${plan.color} 80%, #000), color-mix(in oklab, ${plan.color} 60%, #000))`,
                      boxShadow: plan.highlight
                        ? '0 4px 20px color-mix(in oklab, var(--accent-blue) 30%, transparent)'
                        : `0 4px 16px color-mix(in oklab, ${plan.color} 20%, transparent)`,
                    }}
                  >
                    Assinar {plan.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-center text-xs" style={{ color: 'var(--text-soft)' }}>
                    7 dias de garantia — ou seu dinheiro de volta
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-soft)' }}>
          Todos os planos incluem garantia de 7 dias · reembolso total se não estiver satisfeito · cancele quando quiser
        </p>
      </div>
    </section>
  )
}
