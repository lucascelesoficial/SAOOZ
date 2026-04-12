import { z } from 'zod'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const numberFromUnknown = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    if (!normalized.length) return Number.NaN
    return Number(normalized)
  }
  return Number.NaN
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export const investmentScopeSchema = z.enum(['personal', 'business'])
export type InvestmentScopeInput = z.infer<typeof investmentScopeSchema>

export const investmentAccountTypeSchema = z.enum([
  'corretora',
  'banco',
  'previdencia',
  'cripto',
  'outra',
])

export const investmentAssetTypeSchema = z.enum([
  'acao',
  'fii',
  'etf',
  'renda_fixa',
  'cripto',
  'fundo',
  'internacional',
  'outro',
])

export const investmentMovementTypeSchema = z.enum([
  'compra',
  'venda',
  'dividendo',
  'juros',
  'aporte',
  'resgate',
  'taxa',
  'ajuste',
])

// ── Query schemas ──────────────────────────────────────────────────────────────

export const investmentQuerySchema = z.object({
  scope: investmentScopeSchema,
  businessId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
})

export type InvestmentQueryInput = z.infer<typeof investmentQuerySchema>

// ── Mutation schemas ───────────────────────────────────────────────────────────

export const investmentAccountMutationSchema = z.object({
  scope: investmentScopeSchema,
  businessId: z.string().uuid().optional(),
  name: z.preprocess(normalizeOptionalText, z.string().min(1).max(120)),
  institution: z.preprocess(normalizeOptionalText, z.string().max(120).nullable()).optional(),
  accountType: investmentAccountTypeSchema.optional(),
  currency: z.string().length(3).default('BRL').optional(),
})

export const investmentAssetMutationSchema = z.object({
  accountId: z.string().uuid(),
  scope: investmentScopeSchema,
  businessId: z.string().uuid().optional(),
  symbol: z.preprocess(normalizeOptionalText, z.string().min(1).max(20)),
  name: z.preprocess(normalizeOptionalText, z.string().max(120).nullable()).optional(),
  assetType: investmentAssetTypeSchema.optional(),
  quantity: z.preprocess(numberFromUnknown, z.number().min(0)).optional(),
  averagePrice: z.preprocess(numberFromUnknown, z.number().min(0)).optional(),
  targetAllocationPct: z
    .union([z.preprocess(numberFromUnknown, z.number().min(0).max(100)), z.literal(null)])
    .optional(),
})

export const investmentMovementMutationSchema = z.object({
  accountId: z.string().uuid(),
  assetId: z.string().uuid().optional(),
  scope: investmentScopeSchema,
  businessId: z.string().uuid().optional(),
  movementType: investmentMovementTypeSchema,
  amount: z.preprocess(numberFromUnknown, z.number().min(0)),
  quantity: z
    .union([z.preprocess(numberFromUnknown, z.number().min(0)), z.literal(null)])
    .optional(),
  unitPrice: z
    .union([z.preprocess(numberFromUnknown, z.number().min(0)), z.literal(null)])
    .optional(),
  occurredOn: z.string().regex(ISO_DATE_REGEX).optional(),
  description: z.preprocess(normalizeOptionalText, z.string().max(240).nullable()).optional(),
})

export type InvestmentAccountMutationInput = z.infer<typeof investmentAccountMutationSchema>
export type InvestmentAssetMutationInput = z.infer<typeof investmentAssetMutationSchema>
export type InvestmentMovementMutationInput = z.infer<typeof investmentMovementMutationSchema>
