import type { BusinessTaxRegime, BusinessActivity } from '@/types/database.types'

export interface TaxEstimate {
  amount: number       // R$ estimated tax for the month
  rate: number         // effective rate as decimal (e.g. 0.065 = 6.5%)
  ratePct: string      // formatted "6,5%"
  regime: string       // human-readable regime name
  breakdown: TaxBreakdown[]
}

export interface TaxBreakdown {
  label: string
  amount: number
  rate: number
}

// ── Simples Nacional: Anexo III (Services) bands (annual revenue) ─────────────
const SIMPLES_SERVICO: Array<{ limit: number; rate: number }> = [
  { limit: 180_000,   rate: 0.060 },
  { limit: 360_000,   rate: 0.112 },
  { limit: 720_000,   rate: 0.135 },
  { limit: 1_800_000, rate: 0.160 },
  { limit: 3_600_000, rate: 0.210 },
  { limit: 4_800_000, rate: 0.330 },
]

// ── Simples Nacional: Anexo I (Commerce) bands ────────────────────────────────
const SIMPLES_COMERCIO: Array<{ limit: number; rate: number }> = [
  { limit: 180_000,   rate: 0.040 },
  { limit: 360_000,   rate: 0.073 },
  { limit: 720_000,   rate: 0.095 },
  { limit: 1_800_000, rate: 0.107 },
  { limit: 3_600_000, rate: 0.143 },
  { limit: 4_800_000, rate: 0.190 },
]

function getSimplesBand(annualRevenue: number, activity: BusinessActivity): number {
  const table = activity === 'comercio' ? SIMPLES_COMERCIO : SIMPLES_SERVICO
  for (const band of table) {
    if (annualRevenue <= band.limit) return band.rate
  }
  return table[table.length - 1].rate
}

// ── Main estimator ─────────────────────────────────────────────────────────────
export function estimateTax(
  monthlyRevenue: number,
  regime: BusinessTaxRegime,
  activity: BusinessActivity = 'servico',
  annualRevenueEstimate?: number, // if not provided, assumes 12x monthly
): TaxEstimate {
  if (monthlyRevenue <= 0) {
    return { amount: 0, rate: 0, ratePct: '0%', regime: regimeLabel(regime), breakdown: [] }
  }

  const annualRev = annualRevenueEstimate ?? monthlyRevenue * 12

  switch (regime) {
    case 'mei':   return estimateMei(monthlyRevenue, activity)
    case 'simples': return estimateSimples(monthlyRevenue, annualRev, activity)
    case 'presumido': return estimatePresumido(monthlyRevenue, activity)
    case 'real':  return estimateReal(monthlyRevenue, activity)
  }
}

// ── MEI ────────────────────────────────────────────────────────────────────────
// Fixed DAS amount (2026 values). Effective rate shown as % of revenue.
function estimateMei(monthlyRevenue: number, activity: BusinessActivity): TaxEstimate {
  // DAS-MEI 2026: comércio/indústria = R$76,90 | serviço = R$80,90 | misto = R$86,90
  const das = activity === 'servico' ? 80.90 : activity === 'comercio' ? 76.90 : 86.90
  const rate = das / monthlyRevenue

  return {
    amount: das,
    rate,
    ratePct: fmtPct(rate),
    regime: 'MEI',
    breakdown: [
      { label: 'DAS-MEI (fixo)', amount: das, rate },
    ],
  }
}

// ── Simples Nacional ───────────────────────────────────────────────────────────
function estimateSimples(
  monthlyRevenue: number,
  annualRevenue: number,
  activity: BusinessActivity,
): TaxEstimate {
  const rate = getSimplesBand(annualRevenue, activity)
  const amount = monthlyRevenue * rate

  return {
    amount,
    rate,
    ratePct: fmtPct(rate),
    regime: 'Simples Nacional',
    breakdown: [
      {
        label: activity === 'comercio'
          ? 'DAS Simples — Anexo I (Comércio)'
          : 'DAS Simples — Anexo III (Serviço)',
        amount,
        rate,
      },
    ],
  }
}

// ── Lucro Presumido ────────────────────────────────────────────────────────────
function estimatePresumido(monthlyRevenue: number, activity: BusinessActivity): TaxEstimate {
  const isService = activity === 'servico' || activity === 'misto'

  // Presumed profit bases
  const irpjBase = isService ? 0.32 : 0.08    // 32% service / 8% commerce
  const csllBase = isService ? 0.32 : 0.12

  const irpj   = monthlyRevenue * irpjBase * 0.15
  const csll   = monthlyRevenue * csllBase * 0.09
  const pis    = monthlyRevenue * 0.0065
  const cofins = monthlyRevenue * 0.03
  const iss    = isService ? monthlyRevenue * 0.05 : 0
  const icms   = !isService ? monthlyRevenue * 0.12 : 0

  const total = irpj + csll + pis + cofins + iss + icms
  const rate  = total / monthlyRevenue

  return {
    amount: total,
    rate,
    ratePct: fmtPct(rate),
    regime: 'Lucro Presumido',
    breakdown: [
      { label: 'IRPJ',   amount: irpj,   rate: irpj   / monthlyRevenue },
      { label: 'CSLL',   amount: csll,   rate: csll   / monthlyRevenue },
      { label: 'PIS',    amount: pis,    rate: 0.0065 },
      { label: 'COFINS', amount: cofins, rate: 0.03 },
      ...(iss  > 0 ? [{ label: 'ISS',  amount: iss,  rate: 0.05 }] : []),
      ...(icms > 0 ? [{ label: 'ICMS', amount: icms, rate: 0.12 }] : []),
    ],
  }
}

// ── Lucro Real ─────────────────────────────────────────────────────────────────
// Uses a conservative profit margin estimate. Real calculation requires actual P&L.
function estimateReal(monthlyRevenue: number, activity: BusinessActivity): TaxEstimate {
  const isService = activity === 'servico' || activity === 'misto'

  // Conservative profit margin assumption for estimation: 25% service / 15% commerce
  const profitMargin = isService ? 0.25 : 0.15
  const profit = monthlyRevenue * profitMargin

  const irpj   = profit * 0.15 + Math.max(0, profit - 20_000) * 0.10
  const csll   = profit * 0.09
  const pis    = monthlyRevenue * 0.0165
  const cofins = monthlyRevenue * 0.076

  const total = irpj + csll + pis + cofins
  const rate  = total / monthlyRevenue

  return {
    amount: total,
    rate,
    ratePct: fmtPct(rate),
    regime: 'Lucro Real',
    breakdown: [
      { label: 'IRPJ (estimado)',   amount: irpj,   rate: irpj   / monthlyRevenue },
      { label: 'CSLL',              amount: csll,   rate: csll   / monthlyRevenue },
      { label: 'PIS  (não-cumulat.)',amount: pis,   rate: 0.0165 },
      { label: 'COFINS (não-cumu.)', amount: cofins, rate: 0.076 },
    ],
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtPct(rate: number): string {
  return `${(rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function regimeLabel(regime: BusinessTaxRegime): string {
  const map: Record<BusinessTaxRegime, string> = {
    mei:       'MEI',
    simples:   'Simples Nacional',
    presumido: 'Lucro Presumido',
    real:      'Lucro Real',
  }
  return map[regime]
}

export function activityLabel(activity: BusinessActivity): string {
  const map: Record<BusinessActivity, string> = {
    servico:   'Serviço',
    comercio:  'Comércio',
    industria: 'Indústria',
    misto:     'Misto',
  }
  return map[activity]
}

// ── Pró-labore suggestion ──────────────────────────────────────────────────────
export interface ProLaboreResult {
  conservative: number  // safe floor
  balanced:     number  // recommended
  aggressive:   number  // upper limit
  reason:       string
}

export function suggestProLabore(
  monthlyRevenue: number,
  totalExpenses: number,
  taxAmount: number,
): ProLaboreResult {
  const operationalProfit = monthlyRevenue - totalExpenses - taxAmount
  const freeFloat = operationalProfit

  if (freeFloat <= 0) {
    return {
      conservative: 0,
      balanced: 0,
      aggressive: 0,
      reason: 'Empresa sem margem livre este mês. Não recomendado retirar pró-labore.',
    }
  }

  // Keep at least 30% as operational reserve
  const maxSafe = freeFloat * 0.7

  return {
    conservative: Math.floor(maxSafe * 0.5 / 100) * 100,
    balanced:     Math.floor(maxSafe * 0.65 / 100) * 100,
    aggressive:   Math.floor(maxSafe * 0.8 / 100) * 100,
    reason: `Baseado no lucro disponível de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freeFloat)}, mantendo reserva operacional mínima de 30%.`,
  }
}
