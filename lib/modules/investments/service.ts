import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  FinancialModuleScope,
  InvestmentAccountType,
  InvestmentAssetType,
  InvestmentMovementType,
} from '@/types/database.types'

type AccountRow = Database['public']['Tables']['investment_accounts']['Row']
type AssetRow = Database['public']['Tables']['investment_assets']['Row']
type MovementRow = Database['public']['Tables']['investment_movements']['Row']

export type InvestmentScope = FinancialModuleScope

// ── Labels e cores ─────────────────────────────────────────────────────────────

export const ASSET_TYPE_LABELS: Record<InvestmentAssetType, string> = {
  acao: 'Ações',
  fii: 'Fundos Imobiliários',
  etf: 'ETFs',
  renda_fixa: 'Renda Fixa',
  cripto: 'Criptomoedas',
  fundo: 'Fundos',
  internacional: 'Internacional',
  outro: 'Outros',
}

export const ASSET_TYPE_COLORS: Record<InvestmentAssetType, string> = {
  acao: '#3b82f6',
  fii: '#8b5cf6',
  etf: '#0ea5e9',
  renda_fixa: '#22c55e',
  cripto: '#f59e0b',
  fundo: '#ec4899',
  internacional: '#14b8a6',
  outro: '#94a3b8',
}

export const ACCOUNT_TYPE_LABELS: Record<InvestmentAccountType, string> = {
  corretora: 'Corretora',
  banco: 'Banco',
  previdencia: 'Previdência',
  cripto: 'Exchange Cripto',
  outra: 'Outra',
}

export const MOVEMENT_TYPE_LABELS: Record<InvestmentMovementType, string> = {
  compra: 'Compra',
  venda: 'Venda',
  dividendo: 'Dividendo',
  juros: 'Juros',
  aporte: 'Aporte',
  resgate: 'Resgate',
  taxa: 'Taxa',
  ajuste: 'Ajuste',
}

export const MOVEMENT_TYPE_SIGNED: Record<InvestmentMovementType, 1 | -1> = {
  compra: 1,
  venda: -1,
  dividendo: 1,
  juros: 1,
  aporte: 1,
  resgate: -1,
  taxa: -1,
  ajuste: 1,
}

// ── View interfaces ────────────────────────────────────────────────────────────

export interface InvestmentAssetView {
  id: string
  accountId: string
  symbol: string
  name: string | null
  assetType: InvestmentAssetType
  quantity: number
  averagePrice: number
  currentValue: number
  targetAllocationPct: number | null
  isActive: boolean
}

export interface InvestmentAccountView {
  id: string
  name: string
  institution: string | null
  accountType: InvestmentAccountType
  currency: string
  assets: InvestmentAssetView[]
  totalValue: number
  isActive: boolean
}

export interface InvestmentMovementView {
  id: string
  accountId: string
  accountName: string
  assetId: string | null
  assetSymbol: string | null
  movementType: InvestmentMovementType
  amount: number
  signedAmount: number
  quantity: number | null
  unitPrice: number | null
  occurredOn: string
  description: string | null
  createdAt: string
}

export interface InvestmentAllocationItem {
  assetType: InvestmentAssetType
  label: string
  totalValue: number
  percentage: number
  color: string
}

export interface InvestmentModuleSnapshot {
  scope: InvestmentScope
  businessId: string | null
  accounts: InvestmentAccountView[]
  totalInvested: number
  allocation: InvestmentAllocationItem[]
  recentMovements: InvestmentMovementView[]
  summary: {
    accountsCount: number
    activeAccountsCount: number
    assetsCount: number
  }
}

// ── Input interfaces ───────────────────────────────────────────────────────────

export interface CreateInvestmentAccountInput {
  supabase: SupabaseClient<Database>
  userId: string
  scope: InvestmentScope
  businessId?: string
  name: string
  institution?: string | null
  accountType?: InvestmentAccountType
  currency?: string
}

export interface CreateInvestmentAssetInput {
  supabase: SupabaseClient<Database>
  userId: string
  scope: InvestmentScope
  businessId?: string
  accountId: string
  symbol: string
  name?: string | null
  assetType?: InvestmentAssetType
  quantity?: number
  averagePrice?: number
  targetAllocationPct?: number | null
}

export interface CreateInvestmentMovementInput {
  supabase: SupabaseClient<Database>
  userId: string
  scope: InvestmentScope
  businessId?: string
  accountId: string
  assetId?: string
  movementType: InvestmentMovementType
  amount: number
  quantity?: number | null
  unitPrice?: number | null
  occurredOn?: string
  description?: string | null
}

// ── Error ──────────────────────────────────────────────────────────────────────

export class InvestmentServiceError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'InvestmentServiceError'
    this.status = status
    this.code = code
  }
}

function normalizeSupabaseError(message: string, fallback: string): InvestmentServiceError {
  const normalized = message.toLowerCase()
  if (
    normalized.includes("could not find the table 'public.investment") ||
    normalized.includes('relation "public.investment') ||
    normalized.includes('does not exist')
  ) {
    return new InvestmentServiceError(
      500,
      'investment_schema_missing',
      'Estrutura de Investimentos não encontrada no banco. Aplique a migration 014.'
    )
  }
  return new InvestmentServiceError(500, 'investment_query_failed', fallback)
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function roundCurrency(value: number): number {
  return Number(value.toFixed(2))
}

// ── Helpers de scope ───────────────────────────────────────────────────────────

async function resolveBusinessIdForScope(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: InvestmentScope
  businessId?: string
}): Promise<string | null> {
  if (input.scope === 'personal') return null

  if (!input.businessId) {
    throw new InvestmentServiceError(
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

  if (error) throw normalizeSupabaseError(error.message, 'Falha ao validar empresa.')
  if (!data?.id) throw new InvestmentServiceError(404, 'business_not_found', 'Empresa não encontrada.')

  return data.id
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapAssetView(row: AssetRow): InvestmentAssetView {
  const quantity = Number(row.quantity)
  const averagePrice = Number(row.average_price)
  return {
    id: row.id,
    accountId: row.account_id,
    symbol: row.symbol,
    name: row.name,
    assetType: row.asset_type,
    quantity,
    averagePrice,
    currentValue: roundCurrency(quantity * averagePrice),
    targetAllocationPct: row.target_allocation_pct !== null ? Number(row.target_allocation_pct) : null,
    isActive: row.is_active,
  }
}

function mapAccountView(account: AccountRow, assets: AssetView[]): InvestmentAccountView {
  const activeAssets = assets.filter((a) => a.isActive)
  const totalValue = roundCurrency(activeAssets.reduce((sum, a) => sum + a.currentValue, 0))
  return {
    id: account.id,
    name: account.name,
    institution: account.institution,
    accountType: account.account_type,
    currency: account.currency,
    assets: activeAssets,
    totalValue,
    isActive: account.is_active,
  }
}

type AssetView = InvestmentAssetView

function mapMovementView(
  movement: MovementRow,
  accountName: string,
  assetSymbol: string | null
): InvestmentMovementView {
  const amount = Number(movement.amount)
  const sign = MOVEMENT_TYPE_SIGNED[movement.movement_type]
  return {
    id: movement.id,
    accountId: movement.account_id,
    accountName,
    assetId: movement.asset_id,
    assetSymbol,
    movementType: movement.movement_type,
    amount,
    signedAmount: roundCurrency(sign * amount),
    quantity: movement.quantity !== null ? Number(movement.quantity) : null,
    unitPrice: movement.unit_price !== null ? Number(movement.unit_price) : null,
    occurredOn: movement.occurred_on,
    description: movement.description,
    createdAt: movement.created_at,
  }
}

function buildAllocation(accounts: InvestmentAccountView[], totalInvested: number): InvestmentAllocationItem[] {
  const byType = new Map<InvestmentAssetType, number>()

  for (const account of accounts) {
    for (const asset of account.assets) {
      byType.set(asset.assetType, (byType.get(asset.assetType) ?? 0) + asset.currentValue)
    }
  }

  return Array.from(byType.entries())
    .map(([assetType, totalValue]) => ({
      assetType,
      label: ASSET_TYPE_LABELS[assetType],
      totalValue: roundCurrency(totalValue),
      percentage: totalInvested > 0 ? roundCurrency((totalValue / totalInvested) * 100) : 0,
      color: ASSET_TYPE_COLORS[assetType],
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
}

// ── Main snapshot ──────────────────────────────────────────────────────────────

export async function getInvestmentModuleSnapshot(input: {
  supabase: SupabaseClient<Database>
  userId: string
  scope: InvestmentScope
  businessId?: string
}): Promise<InvestmentModuleSnapshot> {
  const businessId = await resolveBusinessIdForScope(input)

  // Accounts
  let accountsQuery = input.supabase
    .from('investment_accounts')
    .select('*')
    .eq('user_id', input.userId)
    .eq('scope', input.scope)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (input.scope === 'business') {
    accountsQuery = accountsQuery.eq('business_id', businessId)
  } else {
    accountsQuery = accountsQuery.is('business_id', null)
  }

  const { data: accountRows, error: accountsError } = await accountsQuery
  if (accountsError) throw normalizeSupabaseError(accountsError.message, 'Falha ao carregar contas de investimento.')

  const accounts = accountRows ?? []
  const accountIds = accounts.map((a) => a.id)

  // Assets
  let assetsData: AssetRow[] = []
  if (accountIds.length > 0) {
    const { data, error } = await input.supabase
      .from('investment_assets')
      .select('*')
      .in('account_id', accountIds)
      .eq('user_id', input.userId)
      .order('symbol', { ascending: true })

    if (error) throw normalizeSupabaseError(error.message, 'Falha ao carregar ativos.')
    assetsData = data ?? []
  }

  // Movements (recent 50)
  let movementsData: MovementRow[] = []
  if (accountIds.length > 0) {
    const { data, error } = await input.supabase
      .from('investment_movements')
      .select('*')
      .in('account_id', accountIds)
      .eq('user_id', input.userId)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw normalizeSupabaseError(error.message, 'Falha ao carregar movimentações.')
    movementsData = data ?? []
  }

  // Build views
  const assetsByAccount = new Map<string, AssetRow[]>()
  const assetsById = new Map<string, AssetRow>()

  for (const asset of assetsData) {
    const existing = assetsByAccount.get(asset.account_id) ?? []
    existing.push(asset)
    assetsByAccount.set(asset.account_id, existing)
    assetsById.set(asset.id, asset)
  }

  const accountViews: InvestmentAccountView[] = accounts.map((account) => {
    const assetRows = assetsByAccount.get(account.id) ?? []
    const assetViews = assetRows.map(mapAssetView)
    return mapAccountView(account, assetViews)
  })

  const totalInvested = roundCurrency(accountViews.reduce((sum, a) => sum + a.totalValue, 0))
  const allocation = buildAllocation(accountViews, totalInvested)

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]))

  const recentMovements: InvestmentMovementView[] = movementsData.map((mv) => {
    const accountName = accountNameById.get(mv.account_id) ?? 'Conta'
    const assetSymbol = mv.asset_id ? (assetsById.get(mv.asset_id)?.symbol ?? null) : null
    return mapMovementView(mv, accountName, assetSymbol)
  })

  const assetsCount = assetsData.filter((a) => a.is_active).length

  return {
    scope: input.scope,
    businessId,
    accounts: accountViews,
    totalInvested,
    allocation,
    recentMovements,
    summary: {
      accountsCount: accounts.length,
      activeAccountsCount: accounts.filter((a) => a.is_active).length,
      assetsCount,
    },
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createInvestmentAccount(input: CreateInvestmentAccountInput) {
  const businessId = await resolveBusinessIdForScope(input)

  const { data, error } = await input.supabase
    .from('investment_accounts')
    .insert({
      user_id: input.userId,
      scope: input.scope,
      business_id: businessId,
      name: input.name,
      institution: input.institution ?? null,
      account_type: input.accountType ?? 'corretora',
      currency: input.currency ?? 'BRL',
      is_active: true,
    })
    .select('*')
    .single()

  if (error) throw normalizeSupabaseError(error.message, 'Falha ao criar conta de investimento.')
  return data
}

export async function createInvestmentAsset(input: CreateInvestmentAssetInput) {
  const businessId = await resolveBusinessIdForScope(input)

  // Verify account ownership
  const { data: accountData, error: accountError } = await input.supabase
    .from('investment_accounts')
    .select('id')
    .eq('id', input.accountId)
    .eq('user_id', input.userId)
    .maybeSingle()

  if (accountError) throw normalizeSupabaseError(accountError.message, 'Falha ao verificar conta.')
  if (!accountData?.id) {
    throw new InvestmentServiceError(404, 'account_not_found', 'Conta de investimento não encontrada.')
  }

  const { data, error } = await input.supabase
    .from('investment_assets')
    .insert({
      account_id: input.accountId,
      user_id: input.userId,
      scope: input.scope,
      business_id: businessId,
      symbol: input.symbol.toUpperCase().trim(),
      name: input.name ?? null,
      asset_type: input.assetType ?? 'outro',
      quantity: input.quantity ?? 0,
      average_price: input.averagePrice ?? 0,
      target_allocation_pct: input.targetAllocationPct ?? null,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) {
    if (error.message.includes('investment_assets_account_symbol_unique')) {
      throw new InvestmentServiceError(409, 'asset_symbol_duplicate', 'Este símbolo já existe nesta conta.')
    }
    throw normalizeSupabaseError(error.message, 'Falha ao criar ativo.')
  }

  return data
}

export async function createInvestmentMovement(input: CreateInvestmentMovementInput) {
  const businessId = await resolveBusinessIdForScope(input)

  const { data: accountData, error: accountError } = await input.supabase
    .from('investment_accounts')
    .select('id')
    .eq('id', input.accountId)
    .eq('user_id', input.userId)
    .maybeSingle()

  if (accountError) throw normalizeSupabaseError(accountError.message, 'Falha ao verificar conta.')
  if (!accountData?.id) {
    throw new InvestmentServiceError(404, 'account_not_found', 'Conta de investimento não encontrada.')
  }

  const { data, error } = await input.supabase
    .from('investment_movements')
    .insert({
      account_id: input.accountId,
      asset_id: input.assetId ?? null,
      user_id: input.userId,
      scope: input.scope,
      business_id: businessId,
      movement_type: input.movementType,
      amount: roundCurrency(Math.abs(input.amount)),
      quantity: input.quantity ?? null,
      unit_price: input.unitPrice ?? null,
      occurred_on: input.occurredOn ?? toIsoDate(new Date()),
      description: input.description ?? null,
    })
    .select('*')
    .single()

  if (error) throw normalizeSupabaseError(error.message, 'Falha ao registrar movimentação.')
  return data
}
