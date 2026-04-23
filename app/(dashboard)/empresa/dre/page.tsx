'use client'

import { useMemo } from 'react'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import { ExportPDFButton } from '@/components/pdf/ExportPDFButton'
import { ExportCSVButton } from '@/components/csv/ExportCSVButton'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { regimeLabel } from '@/lib/utils/taxes'
import type { BusinessExpCategory } from '@/types/database.types'

// ── Category grouping ──────────────────────────────────────────────────────────

const EXP_LABELS: Record<BusinessExpCategory, string> = {
  fixo_aluguel: 'Aluguel',
  fixo_salarios: 'Salários',
  fixo_prolabore: 'Pró-labore',
  fixo_contador: 'Contador',
  fixo_software: 'Software',
  fixo_internet: 'Internet',
  fixo_outros: 'Outros fixos',
  variavel_comissao: 'Comissão',
  variavel_frete: 'Frete',
  variavel_embalagem: 'Embalagem',
  variavel_trafego: 'Tráfego pago',
  variavel_taxas: 'Taxas',
  variavel_outros: 'Outros variáveis',
  operacional_marketing: 'Marketing',
  operacional_admin: 'Administrativo',
  operacional_juridico: 'Jurídico',
  operacional_manutencao: 'Manutenção',
  operacional_viagem: 'Viagens',
  operacional_outros: 'Outros operacionais',
  investimento_equipamento: 'Equipamentos',
  investimento_estoque: 'Estoque',
  investimento_expansao: 'Expansão',
  investimento_contratacao: 'Contratação',
  investimento_outros: 'Outros investimentos',
}

const REV_LABELS: Record<string, string> = {
  servico: 'Prestação de Serviços',
  produto: 'Venda de Produtos',
  recorrente: 'Receita Recorrente',
  comissao: 'Comissões',
  outro: 'Outras Receitas',
}

function isFixo(cat: string) { return cat.startsWith('fixo_') }
function isVariavel(cat: string) { return cat.startsWith('variavel_') }
function isOperacional(cat: string) { return cat.startsWith('operacional_') }
function isInvestimento(cat: string) { return cat.startsWith('investimento_') }

// ── UI helpers ─────────────────────────────────────────────────────────────────

function DRELine({
  label,
  value,
  indent = 0,
  bold = false,
  color,
  separator = false,
  pct,
}: {
  label: string
  value: number
  indent?: number
  bold?: boolean
  color?: string
  separator?: boolean
  pct?: number
}) {
  return (
    <>
      {separator && (
        <div className="border-t" style={{ borderColor: 'var(--panel-border)' }} />
      )}
      <div
        className={`flex items-center justify-between py-2 text-sm ${bold ? 'font-bold' : 'font-normal'}`}
        style={{ paddingLeft: `${(indent + 1) * 12}px`, paddingRight: '12px' }}
      >
        <span className={bold ? 'text-app' : 'text-app-base'}>{label}</span>
        <div className="flex items-center gap-4">
          {pct !== undefined && (
            <span className="w-12 text-right text-xs text-app-soft">{pct.toFixed(1)}%</span>
          )}
          <span
            className={`w-28 text-right tabular-nums ${bold ? 'text-app' : 'text-app-base'}`}
            style={color ? { color } : {}}
          >
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    </>
  )
}

function DRESection({ title, color }: { title: string; color: string }) {
  return (
    <div
      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
      style={{
        background: `color-mix(in oklab, ${color} 8%, transparent)`,
        color,
        borderTop: `1px solid color-mix(in oklab, ${color} 20%, transparent)`,
      }}
    >
      {title}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DREPage() {
  const { revenues, expenses, totals, taxEstimate, business, currentMonth } = useBusinessData()

  const dre = useMemo(() => {
    // ── Receitas ──────────────────────────────────────────────────────
    const revByCategory = revenues.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + r.amount
      return acc
    }, {})

    const receitaBruta = totals.totalRevenue

    // ── Impostos ──────────────────────────────────────────────────────
    const impostos = totals.taxAmount

    // ── Receita Líquida ───────────────────────────────────────────────
    const receitaLiquida = receitaBruta - impostos

    // ── Expense groups ────────────────────────────────────────────────
    const expByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {})

    const custosVariaveis = Object.entries(expByCategory)
      .filter(([cat]) => isVariavel(cat))
      .reduce((sum, [, v]) => sum + v, 0)

    const custosFixos = Object.entries(expByCategory)
      .filter(([cat]) => isFixo(cat))
      .reduce((sum, [, v]) => sum + v, 0)

    const despesasOperacionais = Object.entries(expByCategory)
      .filter(([cat]) => isOperacional(cat))
      .reduce((sum, [, v]) => sum + v, 0)

    const investimentos = Object.entries(expByCategory)
      .filter(([cat]) => isInvestimento(cat))
      .reduce((sum, [, v]) => sum + v, 0)

    // ── Subtotais ─────────────────────────────────────────────────────
    const margemContribuicao = receitaLiquida - custosVariaveis
    const ebitda = margemContribuicao - custosFixos
    const resultadoOperacional = ebitda - despesasOperacionais
    const resultadoLiquido = resultadoOperacional - investimentos

    return {
      revByCategory,
      expByCategory,
      receitaBruta,
      impostos,
      receitaLiquida,
      custosVariaveis,
      custosFixos,
      despesasOperacionais,
      investimentos,
      margemContribuicao,
      ebitda,
      resultadoOperacional,
      resultadoLiquido,
    }
  }, [revenues, expenses, totals])

  const pct = (value: number) =>
    dre.receitaBruta > 0 ? (value / dre.receitaBruta) * 100 : 0

  function resultColor(v: number) {
    if (v > 0) return '#026648'
    if (v < 0) return '#f87171'
    return undefined
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">DRE</h1>
          <p className="mt-1 text-sm text-app-base">
            Demonstrativo de Resultado — {formatMonth(currentMonth)}
          </p>
          {business && (
            <p className="mt-0.5 text-xs text-app-soft">
              {business.name} · {regimeLabel(business.tax_regime ?? '')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton
            headers={['Linha DRE', 'Valor (R$)', '% Receita Bruta']}
            rows={[
              { 'Linha DRE': 'Receita Bruta',          'Valor (R$)': dre.receitaBruta.toFixed(2),         '% Receita Bruta': pct(dre.receitaBruta).toFixed(1) },
              { 'Linha DRE': '(-) Impostos',            'Valor (R$)': (-dre.impostos).toFixed(2),          '% Receita Bruta': pct(dre.impostos).toFixed(1) },
              { 'Linha DRE': 'Receita Líquida',         'Valor (R$)': dre.receitaLiquida.toFixed(2),       '% Receita Bruta': pct(dre.receitaLiquida).toFixed(1) },
              { 'Linha DRE': '(-) Custos Variáveis',    'Valor (R$)': (-dre.custosVariaveis).toFixed(2),   '% Receita Bruta': pct(dre.custosVariaveis).toFixed(1) },
              { 'Linha DRE': 'Margem de Contribuição',  'Valor (R$)': dre.margemContribuicao.toFixed(2),   '% Receita Bruta': pct(dre.margemContribuicao).toFixed(1) },
              { 'Linha DRE': '(-) Custos Fixos',        'Valor (R$)': (-dre.custosFixos).toFixed(2),       '% Receita Bruta': pct(dre.custosFixos).toFixed(1) },
              { 'Linha DRE': 'EBITDA',                  'Valor (R$)': dre.ebitda.toFixed(2),               '% Receita Bruta': pct(dre.ebitda).toFixed(1) },
              { 'Linha DRE': '(-) Desp. Operacionais',  'Valor (R$)': (-dre.despesasOperacionais).toFixed(2), '% Receita Bruta': pct(dre.despesasOperacionais).toFixed(1) },
              { 'Linha DRE': '(-) Investimentos',       'Valor (R$)': (-dre.investimentos).toFixed(2),     '% Receita Bruta': pct(dre.investimentos).toFixed(1) },
              { 'Linha DRE': 'Resultado Líquido',       'Valor (R$)': dre.resultadoLiquido.toFixed(2),     '% Receita Bruta': pct(dre.resultadoLiquido).toFixed(1) },
            ]}
            fileName={`saooz-dre-${currentMonth.toISOString().slice(0, 7)}.csv`}
          />
          <ExportPDFButton
            data={{
              title: 'DRE — Demonstrativo de Resultado',
            subtitle: business?.name ?? 'Módulo Empresarial',
            month: formatMonth(currentMonth),
            totalIncome: dre.receitaBruta,
            totalExpenses: totals.totalExpenses,
            balance: dre.resultadoLiquido,
            taxAmount: dre.impostos,
            netProfit: dre.resultadoLiquido,
            profitMargin: dre.receitaBruta > 0
              ? `${((dre.resultadoLiquido / dre.receitaBruta) * 100).toFixed(1)}%`
              : '0%',
            businessName: business?.name,
            taxRegime: business?.tax_regime ? regimeLabel(business.tax_regime) : undefined,
            sections: [
              {
                title: 'Demonstrativo de Resultado',
                rows: [
                  { label: 'Receita Bruta',          value: formatCurrency(dre.receitaBruta),          color: 'green', bold: true },
                  { label: '(-) Impostos',            value: formatCurrency(dre.impostos),              color: 'yellow' },
                  { label: 'Receita Líquida',         value: formatCurrency(dre.receitaLiquida),        color: 'blue',  bold: true, divider: true },
                  { label: '(-) Custos Variáveis',    value: formatCurrency(dre.custosVariaveis),       color: 'red' },
                  { label: 'Margem de Contribuição',  value: formatCurrency(dre.margemContribuicao),    bold: true, divider: true },
                  { label: '(-) Custos Fixos',        value: formatCurrency(dre.custosFixos),           color: 'red' },
                  { label: 'EBITDA',                  value: formatCurrency(dre.ebitda),                bold: true, divider: true },
                  { label: '(-) Desp. Operacionais',  value: formatCurrency(dre.despesasOperacionais),  color: 'red' },
                  { label: '(-) Investimentos',       value: formatCurrency(dre.investimentos),         color: 'red' },
                  {
                    label: 'Resultado Líquido',
                    value: formatCurrency(dre.resultadoLiquido),
                    color: dre.resultadoLiquido >= 0 ? 'green' : 'red',
                    bold: true,
                    divider: true,
                  },
                ],
              },
            ],
          }}
          fileName={`saooz-dre-${currentMonth.toISOString().slice(0, 7)}.pdf`}
        />
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Receita Bruta', value: dre.receitaBruta, color: '#026648' },
          { label: 'Impostos', value: dre.impostos, color: '#f59e0b' },
          { label: 'Despesas', value: totals.totalExpenses, color: '#f87171' },
          {
            label: 'Resultado Líquido',
            value: dre.resultadoLiquido,
            color: resultColor(dre.resultadoLiquido) ?? 'var(--text-strong)',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="panel-card p-4">
            <p className="text-xs text-app-soft">{kpi.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: kpi.color }}>
              {formatCurrency(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* DRE Table */}
      <div className="panel-card overflow-hidden">
        {/* Column headers */}
        <div
          className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-app-soft"
          style={{ borderBottom: '1px solid var(--panel-border)' }}
        >
          <span>Descrição</span>
          <div className="flex items-center gap-4">
            <span className="w-12 text-right">%</span>
            <span className="w-28 text-right">Valor</span>
          </div>
        </div>

        {/* ── RECEITAS ── */}
        <DRESection title="Receitas" color="#026648" />
        {Object.entries(dre.revByCategory).map(([cat, val]) => (
          <DRELine
            key={cat}
            label={REV_LABELS[cat] ?? cat}
            value={val}
            indent={1}
            pct={pct(val)}
          />
        ))}
        {dre.receitaBruta === 0 && (
          <DRELine label="Nenhuma receita lançada" value={0} indent={1} />
        )}
        <DRELine
          label="(=) RECEITA BRUTA"
          value={dre.receitaBruta}
          bold
          color="#026648"
          separator
          pct={100}
        />

        {/* ── IMPOSTOS ── */}
        <DRESection title="Deduções" color="#f59e0b" />
        <DRELine
          label={`Impostos estimados (${taxEstimate ? (taxEstimate.rate * 100).toFixed(1) : 0}%)`}
          value={-dre.impostos}
          indent={1}
          pct={pct(dre.impostos)}
          color="#f59e0b"
        />
        <DRELine
          label="(=) RECEITA LÍQUIDA"
          value={dre.receitaLiquida}
          bold
          color={resultColor(dre.receitaLiquida)}
          separator
          pct={pct(dre.receitaLiquida)}
        />

        {/* ── CUSTOS VARIÁVEIS ── */}
        {dre.custosVariaveis > 0 && (
          <>
            <DRESection title="Custos Variáveis" color="#f87171" />
            {Object.entries(dre.expByCategory)
              .filter(([cat]) => isVariavel(cat))
              .map(([cat, val]) => (
                <DRELine
                  key={cat}
                  label={EXP_LABELS[cat as BusinessExpCategory] ?? cat}
                  value={-val}
                  indent={1}
                  pct={pct(val)}
                  color="#f87171"
                />
              ))}
            <DRELine
              label="(=) MARGEM DE CONTRIBUIÇÃO"
              value={dre.margemContribuicao}
              bold
              color={resultColor(dre.margemContribuicao)}
              separator
              pct={pct(dre.margemContribuicao)}
            />
          </>
        )}

        {/* ── CUSTOS FIXOS ── */}
        {dre.custosFixos > 0 && (
          <>
            <DRESection title="Custos Fixos" color="#fb923c" />
            {Object.entries(dre.expByCategory)
              .filter(([cat]) => isFixo(cat))
              .map(([cat, val]) => (
                <DRELine
                  key={cat}
                  label={EXP_LABELS[cat as BusinessExpCategory] ?? cat}
                  value={-val}
                  indent={1}
                  pct={pct(val)}
                  color="#fb923c"
                />
              ))}
            <DRELine
              label="(=) EBITDA"
              value={dre.ebitda}
              bold
              color={resultColor(dre.ebitda)}
              separator
              pct={pct(dre.ebitda)}
            />
          </>
        )}

        {/* ── DESPESAS OPERACIONAIS ── */}
        {dre.despesasOperacionais > 0 && (
          <>
            <DRESection title="Despesas Operacionais" color="#026648" />
            {Object.entries(dre.expByCategory)
              .filter(([cat]) => isOperacional(cat))
              .map(([cat, val]) => (
                <DRELine
                  key={cat}
                  label={EXP_LABELS[cat as BusinessExpCategory] ?? cat}
                  value={-val}
                  indent={1}
                  pct={pct(val)}
                  color="#026648"
                />
              ))}
            <DRELine
              label="(=) RESULTADO OPERACIONAL"
              value={dre.resultadoOperacional}
              bold
              color={resultColor(dre.resultadoOperacional)}
              separator
              pct={pct(dre.resultadoOperacional)}
            />
          </>
        )}

        {/* ── INVESTIMENTOS ── */}
        {dre.investimentos > 0 && (
          <>
            <DRESection title="Investimentos" color="#026648" />
            {Object.entries(dre.expByCategory)
              .filter(([cat]) => isInvestimento(cat))
              .map(([cat, val]) => (
                <DRELine
                  key={cat}
                  label={EXP_LABELS[cat as BusinessExpCategory] ?? cat}
                  value={-val}
                  indent={1}
                  pct={pct(val)}
                  color="#026648"
                />
              ))}
          </>
        )}

        {/* ── RESULTADO LÍQUIDO ── */}
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{
            borderTop: '2px solid var(--panel-border)',
            background: dre.resultadoLiquido >= 0
              ? 'color-mix(in oklab, #026648 6%, transparent)'
              : 'color-mix(in oklab, #f87171 6%, transparent)',
          }}
        >
          <span className="text-sm font-extrabold text-app">RESULTADO LÍQUIDO DO PERÍODO</span>
          <div className="flex items-center gap-4">
            <span className="w-12 text-right text-xs text-app-soft">
              {pct(dre.resultadoLiquido).toFixed(1)}%
            </span>
            <span
              className="w-28 text-right text-lg font-extrabold tabular-nums"
              style={{ color: resultColor(dre.resultadoLiquido) ?? 'var(--text-strong)' }}
            >
              {formatCurrency(dre.resultadoLiquido)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      {dre.receitaBruta > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Margem líquida',
              value: `${pct(dre.resultadoLiquido).toFixed(1)}%`,
              color: dre.resultadoLiquido >= 0 ? '#026648' : '#f87171',
            },
            {
              label: 'Carga tributária',
              value: `${pct(dre.impostos).toFixed(1)}%`,
              color: '#f59e0b',
            },
            {
              label: 'Índice de despesas',
              value: `${pct(totals.totalExpenses).toFixed(1)}%`,
              color: '#f87171',
            },
          ].map((m) => (
            <div key={m.label} className="panel-card p-4 text-center">
              <p className="text-xs text-app-soft">{m.label}</p>
              <p className="mt-1 text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
