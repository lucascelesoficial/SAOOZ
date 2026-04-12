import type { SupabaseClient } from '@supabase/supabase-js'
import {
  normalizeActiveMonth,
  shiftActiveMonth,
  toMonthQueryDate,
} from '@/lib/modules/_shared/month'
import type {
  BusinessExpCategory,
  Database,
  ExpenseCategory,
  FinancialModuleScope,
  ReserveEntryType,
} from '@/types/database.types'

type ReserveRow = Database['public']['Tables']['financial_reserves']['Row']
type ReserveEntryRow = Database['public']['Tables']['financial_reserve_entries']['Row']

export type ReserveScope = FinancialModuleScope
export type ReserveStatus = 'critico' | 'atencao' | 'saudavel' | 'forte'

export interface ReserveStatusInfo {
  code: ReserveStatus
  label: string
}

export interface ReserveMovementView {
  id: string
  entryType: ReserveEntryType
  description: string | null
  amount: number
  signedAmount: number
  happenedOn: string
  createdAt: string
}

export interface ReserveTargetSnapshot {
  scope: ReserveScope
  businessId: string | null
  selectedMonth: string
  reserve: {
    id: string
    name: string
    targetAmount: number
    initialAmount: number
    monthlyTargetContribution: number | null
    notes: string | null
  } | null
}

export interface ReserveModuleSnapshot {
  scope: ReserveScope
  businessId: string | null
  selectedMonth: string
  reserve: {
    id: string
    name: string
    targetAmount: number
    initialAmount: number
    monthlyTargetContribution: number | null
    notes: string | null
  } | null
  metrics: {
    essentialMonthlyAverage: number
    reserveCurrentAmount: number
    coverageMonths: number
    targetAmount: number
    remainingToTarget: number
    projectedMonthsToTarget: number | null
    monthlyContributionEstimated: number
    monthlyContributionManual: number | null
    monthlyContributionUsed: number
    status: ReserveStatusInfo | null
  }
  suggestedTargets: {
    m3: number
    m6: number
    m12: number
  } | null
  movements: ReserveMovementView[]
}

export interface UpsertReserveTargetInput {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId?: string
  reserveId?: string
  targetAmount?: number
  initialAmount?: number
  monthlyTargetContribution?: number | null
  name?: string | null
  notes?: string | null
}

export interface CreateReserveMovementInput {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId?: string
  reserveId?: string
  entryType: ReserveEntryType
  amount: number
  happenedOn?: string
  description?: string | null
}

const PERSONAL_ESSENTIAL_CATEGORIES: ExpenseCategory[] = [
  'moradia',
  'alimentacao',
  'transporte',
  'saude',
]

const BUSINESS_ESSENTIAL_CATEGORIES: BusinessExpCategory[] = [
  'fixo_aluguel',
  'fixo_salarios',
  'fixo_prolabore',
  'fixo_contador',
  'fixo_software',
  'fixo_internet',
  'fixo_outros',
  'operacional_admin',
  'operacional_juridico',
  'operacional_manutencao',
  'operacional_outros',
  'variavel_taxas',
]

export class ReserveServiceError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ReserveServiceError'
    this.status = status
    this.code = code
  }
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthEndIso(month: Date): string {
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  return toIsoDate(monthEnd)
}

export function resolveSelectedMonth(monthIso?: string | null) {
  if (!monthIso) {
    return normalizeActiveMonth(new Date())
  }

  const [year, month] = monthIso.split('-').map(Number)
  if (!year || !month) {
    return normalizeActiveMonth(new Date())
  }

  return normalizeActiveMonth(new Date(year, month - 1, 1))
}

export function buildMonthWindow(selectedMonth: Date, size: number) {
  const months: string[] = []
  for (let offset = size - 1; offset >= 0; offset -= 1) {
    months.push(toMonthQueryDate(shiftActiveMonth(selectedMonth, -offset)))
  }
  return months
}

export function signedReserveEntryAmount(type: ReserveEntryType, amount: number) {
  if (type === 'resgate') {
    return -Math.abs(amount)
  }

  return Math.abs(amount)
}

export function calculateReserveCurrentAmount(input: {
  initialAmount: number
  entries: Array<Pick<ReserveEntryRow, 'entry_type' | 'amount' | 'happened_on'>>
  monthEndInclusive: string
}) {
  const net = input.entries
    .filter((entry) => entry.happened_on <= input.monthEndInclusive)
    .reduce(
      (sum, entry) => sum + signedReserveEntryAmount(entry.entry_type, entry.amount),
      0
    )

  return roundCurrency(Math.max(input.initialAmount + net, 0))
}

export function calculateCoverageMonths(reserveAmount: number, essentialMonthlyAverage: number) {
  if (essentialMonthlyAverage <= 0) {
    return 0
  }

  return roundCurrency(reserveAmount / essentialMonthlyAverage)
}

export function classifyReserveStatus(coverageMonths: number): ReserveStatusInfo {
  if (coverageMonths < 1) {
    return { code: 'critico', label: 'Crítico' }
  }

  if (coverageMonths < 3) {
    return { code: 'atencao', label: 'Atenção' }
  }

  if (coverageMonths < 6) {
    return { code: 'saudavel', label: 'Saudável' }
  }

  return { code: 'forte', label: 'Forte' }
}

export function calculateProjectedMonthsToTarget(
  remainingToTarget: number,
  monthlyContribution: number
) {
  if (remainingToTarget <= 0) {
    return 0
  }

  if (monthlyContribution <= 0) {
    return null
  }

  return Math.ceil(remainingToTarget / monthlyContribution)
}

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2))
}

function normalizeSupabaseError(message: string, fallback: string): ReserveServiceError {
  const normalized = message.toLowerCase()
  const schemaMissing =
    normalized.includes("could not find the table 'public.financial_reserves'") ||
    normalized.includes("could not find the table 'public.financial_reserve_entries'") ||
    normalized.includes('relation "public.financial_reserves" does not exist') ||
    normalized.includes('relation "public.financial_reserve_entries" does not exist')

  if (schemaMissing) {
    return new ReserveServiceError(
      500,
      'reserve_schema_missing',
      'Estrutura de Reserva não encontrada no banco. Aplique a migration 014.'
    )
  }

  return new ReserveServiceError(500, 'reserve_query_failed', fallback)
}

async function resolveBusinessIdForScope(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId?: string
}) {
  if (input.scope === 'personal') {
    return null
  }

  if (!input.businessId) {
    throw new ReserveServiceError(
      400,
      'business_id_required',
      'businessId é obrigatório para escopo empresarial.'
    )
  }

  const { data, error } = await input.supabase
    .from('business_profiles')
    .select('id')
    .eq('id', input.businessId)
    .eq('user_id', input.userId)
    .maybeSingle()

  if (error) {
    throw normalizeSupabaseError(
      error.message,
      'Falha ao validar a empresa ativa para o módulo de reserva.'
    )
  }

  if (!data?.id) {
    throw new ReserveServiceError(404, 'business_not_found', 'Empresa não encontrada.')
  }

  return data.id
}

async function getActiveReserve(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId: string | null
  reserveId?: string
}) {
  if (input.reserveId) {
    const { data, error } = await input.supabase
      .from('financial_reserves')
      .select('*')
      .eq('id', input.reserveId)
      .eq('user_id', input.userId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      throw normalizeSupabaseError(error.message, 'Falha ao carregar configuração da reserva.')
    }

    return data ?? null
  }

  let query = input.supabase
    .from('financial_reserves')
    .select('*')
    .eq('user_id', input.userId)
    .eq('scope', input.scope)
    .eq('is_active', true)

  if (input.scope === 'business') {
    query = query.eq('business_id', input.businessId as string)
  } else {
    query = query.is('business_id', null)
  }

  const { data, error } = await query.order('updated_at', { ascending: false }).limit(1)

  if (error) {
    throw normalizeSupabaseError(error.message, 'Falha ao carregar configuração da reserva.')
  }

  return data?.[0] ?? null
}

async function getReserveEntries(input: {
  supabase: SupabaseClient<Database>
  reserveId: string
}) {
  const { data, error } = await input.supabase
    .from('financial_reserve_entries')
    .select('*')
    .eq('reserve_id', input.reserveId)
    .order('happened_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    throw normalizeSupabaseError(error.message, 'Falha ao carregar movimentações da reserva.')
  }

  return data ?? []
}

async function calculateEssentialMonthlyAverage(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId: string | null
  monthWindow: string[]
}) {
  if (input.scope === 'personal') {
    const { data, error } = await input.supabase
      .from('expenses')
      .select('amount, month')
      .eq('user_id', input.userId)
      .in('month', input.monthWindow)
      .in('category', PERSONAL_ESSENTIAL_CATEGORIES)

    if (error) {
      throw normalizeSupabaseError(
        error.message,
        'Falha ao calcular gasto essencial médio do módulo pessoal.'
      )
    }

    const monthTotals = new Map<string, number>()
    for (const month of input.monthWindow) {
      monthTotals.set(month, 0)
    }

    for (const row of data ?? []) {
      const month = row.month?.slice(0, 10)
      if (!monthTotals.has(month)) {
        continue
      }

      monthTotals.set(month, (monthTotals.get(month) ?? 0) + row.amount)
    }

    return roundCurrency(average(Array.from(monthTotals.values())))
  }

  const { data, error } = await input.supabase
    .from('business_expenses')
    .select('amount, month')
    .eq('user_id', input.userId)
    .eq('business_id', input.businessId as string)
    .in('month', input.monthWindow)
    .in('category', BUSINESS_ESSENTIAL_CATEGORIES)

  if (error) {
    throw normalizeSupabaseError(
      error.message,
      'Falha ao calcular custo operacional essencial do módulo empresarial.'
    )
  }

  const monthTotals = new Map<string, number>()
  for (const month of input.monthWindow) {
    monthTotals.set(month, 0)
  }

  for (const row of data ?? []) {
    const month = row.month?.slice(0, 10)
    if (!monthTotals.has(month)) {
      continue
    }

    monthTotals.set(month, (monthTotals.get(month) ?? 0) + row.amount)
  }

  return roundCurrency(average(Array.from(monthTotals.values())))
}

function estimateMonthlyContribution(input: {
  entries: ReserveEntryRow[]
  selectedMonth: Date
  monthsWindow: number
}) {
  const monthList = buildMonthWindow(input.selectedMonth, input.monthsWindow)
  const totals = new Map<string, number>()

  for (const month of monthList) {
    totals.set(month, 0)
  }

  for (const entry of input.entries) {
    const month = entry.happened_on.slice(0, 7)
    const monthIso = `${month}-01`
    if (!totals.has(monthIso)) {
      continue
    }

    totals.set(
      monthIso,
      (totals.get(monthIso) ?? 0) + signedReserveEntryAmount(entry.entry_type, entry.amount)
    )
  }

  const value = average(Array.from(totals.values()))
  return roundCurrency(Math.max(value, 0))
}

function mapTargetSnapshot(reserve: ReserveRow | null) {
  if (!reserve) {
    return null
  }

  return {
    id: reserve.id,
    name: reserve.name,
    targetAmount: reserve.target_amount,
    initialAmount: reserve.initial_amount,
    monthlyTargetContribution: reserve.monthly_target_contribution,
    notes: reserve.notes,
  }
}

function mapMovementView(entry: ReserveEntryRow): ReserveMovementView {
  return {
    id: entry.id,
    entryType: entry.entry_type,
    description: entry.description,
    amount: entry.amount,
    signedAmount: signedReserveEntryAmount(entry.entry_type, entry.amount),
    happenedOn: entry.happened_on,
    createdAt: entry.created_at,
  }
}

function buildSuggestedTargets(essentialMonthlyAverage: number) {
  return {
    m3: roundCurrency(essentialMonthlyAverage * 3),
    m6: roundCurrency(essentialMonthlyAverage * 6),
    m12: roundCurrency(essentialMonthlyAverage * 12),
  }
}

export async function getReserveTargetSnapshot(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  monthIso?: string
  businessId?: string
}): Promise<ReserveTargetSnapshot> {
  const selectedMonth = resolveSelectedMonth(input.monthIso)
  const businessId = await resolveBusinessIdForScope({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId: input.businessId,
  })
  const reserve = await getActiveReserve({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId,
  })

  return {
    scope: input.scope,
    businessId,
    selectedMonth: toMonthQueryDate(selectedMonth),
    reserve: mapTargetSnapshot(reserve),
  }
}

export async function getReserveModuleSnapshot(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  monthIso?: string
  businessId?: string
  reserveId?: string
}): Promise<ReserveModuleSnapshot> {
  const selectedMonth = resolveSelectedMonth(input.monthIso)
  const selectedMonthIso = toMonthQueryDate(selectedMonth)
  const selectedMonthEndIso = monthEndIso(selectedMonth)
  const monthWindow = buildMonthWindow(selectedMonth, 3)

  const businessId = await resolveBusinessIdForScope({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId: input.businessId,
  })

  const reserve = await getActiveReserve({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId,
    reserveId: input.reserveId,
  })

  const entries = reserve
    ? await getReserveEntries({
        supabase: input.supabase,
        reserveId: reserve.id,
      })
    : []

  const essentialMonthlyAverage = await calculateEssentialMonthlyAverage({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId,
    monthWindow,
  })

  const reserveCurrentAmount = calculateReserveCurrentAmount({
    initialAmount: reserve?.initial_amount ?? 0,
    entries,
    monthEndInclusive: selectedMonthEndIso,
  })
  const coverageMonths = calculateCoverageMonths(reserveCurrentAmount, essentialMonthlyAverage)
  const suggestedTargets = buildSuggestedTargets(essentialMonthlyAverage)
  const targetAmount =
    reserve?.target_amount && reserve.target_amount > 0
      ? reserve.target_amount
      : input.scope === 'personal'
        ? suggestedTargets.m6
        : 0
  const remainingToTarget = roundCurrency(Math.max(targetAmount - reserveCurrentAmount, 0))
  const monthlyContributionEstimated = estimateMonthlyContribution({
    entries,
    selectedMonth,
    monthsWindow: 3,
  })
  const monthlyContributionManual =
    reserve?.monthly_target_contribution !== null
      ? reserve?.monthly_target_contribution ?? null
      : null
  const monthlyContributionUsed =
    monthlyContributionManual && monthlyContributionManual > 0
      ? monthlyContributionManual
      : monthlyContributionEstimated
  const projectedMonthsToTarget = calculateProjectedMonthsToTarget(
    remainingToTarget,
    monthlyContributionUsed
  )

  const monthMovements = entries
    .filter(
      (entry) =>
        entry.happened_on >= selectedMonthIso && entry.happened_on <= selectedMonthEndIso
    )
    .map(mapMovementView)

  return {
    scope: input.scope,
    businessId,
    selectedMonth: selectedMonthIso,
    reserve: mapTargetSnapshot(reserve),
    metrics: {
      essentialMonthlyAverage,
      reserveCurrentAmount,
      coverageMonths,
      targetAmount,
      remainingToTarget,
      projectedMonthsToTarget,
      monthlyContributionEstimated,
      monthlyContributionManual,
      monthlyContributionUsed,
      status: input.scope === 'business' ? classifyReserveStatus(coverageMonths) : null,
    },
    suggestedTargets: input.scope === 'personal' ? suggestedTargets : null,
    movements: monthMovements,
  }
}

export async function upsertReserveTarget(input: UpsertReserveTargetInput) {
  const businessId = await resolveBusinessIdForScope({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId: input.businessId,
  })
  const currentReserve = await getActiveReserve({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId,
    reserveId: input.reserveId,
  })

  if (currentReserve) {
    const { data, error } = await input.supabase
      .from('financial_reserves')
      .update({
        target_amount: input.targetAmount ?? currentReserve.target_amount,
        initial_amount: input.initialAmount ?? currentReserve.initial_amount,
        monthly_target_contribution:
          input.monthlyTargetContribution !== undefined
            ? input.monthlyTargetContribution
            : currentReserve.monthly_target_contribution,
        name:
          input.name !== undefined
            ? input.name ?? currentReserve.name
            : currentReserve.name,
        notes:
          input.notes !== undefined
            ? input.notes
            : currentReserve.notes,
      })
      .eq('id', currentReserve.id)
      .select('*')
      .single()

    if (error) {
      throw normalizeSupabaseError(error.message, 'Falha ao atualizar meta da reserva.')
    }

    return data
  }

  const { data, error } = await input.supabase
    .from('financial_reserves')
    .insert({
      user_id: input.userId,
      scope: input.scope,
      business_id: businessId,
      name: input.name ?? (input.scope === 'personal' ? 'Reserva PF' : 'Reserva PJ'),
      target_amount: input.targetAmount ?? 0,
      initial_amount: input.initialAmount ?? 0,
      monthly_target_contribution:
        input.monthlyTargetContribution !== undefined ? input.monthlyTargetContribution : null,
      notes: input.notes ?? null,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) {
    throw normalizeSupabaseError(error.message, 'Falha ao criar meta da reserva.')
  }

  return data
}

export async function createReserveMovement(input: CreateReserveMovementInput) {
  const businessId = await resolveBusinessIdForScope({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId: input.businessId,
  })

  let reserve = await getActiveReserve({
    supabase: input.supabase,
    userId: input.userId,
    scope: input.scope,
    businessId,
    reserveId: input.reserveId,
  })

  if (!reserve) {
    const { data, error } = await input.supabase
      .from('financial_reserves')
      .insert({
        user_id: input.userId,
        scope: input.scope,
        business_id: businessId,
        name: input.scope === 'personal' ? 'Reserva PF' : 'Reserva PJ',
        is_active: true,
      })
      .select('*')
      .single()

    if (error) {
      throw normalizeSupabaseError(error.message, 'Falha ao iniciar reserva para nova movimentação.')
    }

    reserve = data
  }

  const { data, error } = await input.supabase
    .from('financial_reserve_entries')
    .insert({
      reserve_id: reserve.id,
      user_id: input.userId,
      scope: input.scope,
      business_id: businessId,
      entry_type: input.entryType,
      amount: roundCurrency(Math.abs(input.amount)),
      happened_on: input.happenedOn ?? toIsoDate(new Date()),
      description: input.description ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw normalizeSupabaseError(error.message, 'Falha ao registrar movimentação da reserva.')
  }

  return data
}

export interface ActiveReserveItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

export async function listActiveReserves(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId: string | null
}): Promise<ActiveReserveItem[]> {
  let query = input.supabase
    .from('financial_reserves')
    .select('*')
    .eq('user_id', input.userId)
    .eq('scope', input.scope)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (input.scope === 'business') {
    query = query.eq('business_id', input.businessId as string)
  } else {
    query = query.is('business_id', null)
  }

  const { data, error } = await query
  if (error) throw normalizeSupabaseError(error.message, 'Falha ao listar reservas.')
  if (!data || data.length === 0) return []

  const results = await Promise.all(
    data.map(async (reserve) => {
      const entries = await getReserveEntries({ supabase: input.supabase, reserveId: reserve.id })
      const currentAmount = Math.max(
        0,
        reserve.initial_amount +
          entries.reduce((sum, e) => sum + signedReserveEntryAmount(e.entry_type, e.amount), 0)
      )
      return { id: reserve.id, name: reserve.name, targetAmount: reserve.target_amount, currentAmount }
    })
  )
  return results
}

export async function createNewReserve(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: ReserveScope
  businessId: string | null
  name: string
}) {
  const { data, error } = await input.supabase
    .from('financial_reserves')
    .insert({
      user_id: input.userId,
      scope: input.scope,
      business_id: input.businessId,
      name: input.name,
      target_amount: 0,
      initial_amount: 0,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) throw normalizeSupabaseError(error.message, 'Falha ao criar reserva.')
  return data
}

export async function deactivateReserve(input: {
  supabase: SupabaseClient<Database>
  userId: string
  reserveId: string
}) {
  const { error } = await input.supabase
    .from('financial_reserves')
    .update({ is_active: false })
    .eq('id', input.reserveId)
    .eq('user_id', input.userId)

  if (error) throw normalizeSupabaseError(error.message, 'Falha ao excluir reserva.')
}
