/**
 * SAOOZ — Pluggy → SAOOZ Category Mapper
 *
 * Maps Pluggy transaction categories to SAOOZ ExpenseCategory and BusinessExpCategory.
 * Pluggy categories are in English; SAOOZ uses Portuguese slugs.
 */

import type { ExpenseCategory, BusinessExpCategory, BusinessRevCategory } from '@/types/database.types'

// ── Personal expense category mapping ────────────────────────────────────────

const EXPENSE_CATEGORY_MAP: Array<{ patterns: string[]; category: ExpenseCategory }> = [
  {
    patterns: ['food', 'drink', 'restaurant', 'delivery', 'groceries', 'supermarket', 'alimenta'],
    category: 'alimentacao',
  },
  {
    patterns: ['transport', 'taxi', 'uber', 'gas', 'fuel', 'parking', 'transit', 'toll'],
    category: 'transporte',
  },
  {
    patterns: ['health', 'medical', 'pharmacy', 'hospital', 'clinic', 'dental', 'saude'],
    category: 'saude',
  },
  {
    patterns: ['education', 'school', 'university', 'course', 'book', 'educacao'],
    category: 'educacao',
  },
  {
    patterns: ['entertainment', 'leisure', 'sport', 'gym', 'cinema', 'theater', 'streaming', 'lazer'],
    category: 'lazer',
  },
  {
    patterns: ['shopping', 'clothing', 'apparel', 'fashion', 'vestuario', 'roupa'],
    category: 'vestuario',
  },
  {
    patterns: ['beauty', 'salon', 'spa', 'cosmetic', 'beleza'],
    category: 'beleza',
  },
  {
    patterns: ['pet', 'veterinary', 'veterinarian'],
    category: 'pets',
  },
  {
    patterns: ['housing', 'rent', 'utilities', 'electricity', 'water', 'gas bill', 'condominium', 'moradia'],
    category: 'moradia',
  },
  {
    patterns: ['subscription', 'telecom', 'internet', 'phone', 'mobile', 'assinatura'],
    category: 'assinaturas',
  },
  {
    patterns: ['loan', 'credit', 'debt', 'financing', 'installment', 'divida'],
    category: 'dividas',
  },
  {
    patterns: ['investment', 'savings', 'brokerage', 'investimento'],
    category: 'investimentos',
  },
  {
    patterns: ['family', 'children', 'daycare', 'familia'],
    category: 'familia',
  },
  {
    patterns: ['religion', 'church', 'tithe', 'religiao'],
    category: 'religiao',
  },
]

/**
 * Maps a Pluggy category string to a SAOOZ ExpenseCategory (personal).
 * Falls back to 'outros' if no match is found.
 */
export function mapPluggyCategoryToExpenseCategory(
  pluggyCategory: string | null | undefined
): ExpenseCategory {
  if (!pluggyCategory) return 'outros'
  const lower = pluggyCategory.toLowerCase()
  for (const { patterns, category } of EXPENSE_CATEGORY_MAP) {
    if (patterns.some((p) => lower.includes(p))) return category
  }
  return 'outros'
}

// ── Business expense category mapping ────────────────────────────────────────

const BUSINESS_EXP_MAP: Array<{ patterns: string[]; category: BusinessExpCategory }> = [
  {
    patterns: ['rent', 'aluguel', 'lease', 'office'],
    category: 'fixo_aluguel',
  },
  {
    patterns: ['salary', 'payroll', 'salario', 'folha', 'employee'],
    category: 'fixo_salarios',
  },
  {
    patterns: ['accounting', 'contador', 'accountant'],
    category: 'fixo_contador',
  },
  {
    patterns: ['software', 'saas', 'license', 'subscription', 'licenca'],
    category: 'fixo_software',
  },
  {
    patterns: ['internet', 'telecom', 'phone', 'mobile', 'broadband'],
    category: 'fixo_internet',
  },
  {
    patterns: ['commission', 'comissao', 'affiliate'],
    category: 'variavel_comissao',
  },
  {
    patterns: ['freight', 'frete', 'shipping', 'delivery', 'logistics', 'logistica'],
    category: 'variavel_frete',
  },
  {
    patterns: ['packaging', 'embalagem', 'package'],
    category: 'variavel_embalagem',
  },
  {
    patterns: ['ads', 'trafego', 'traffic', 'adwords', 'meta ads', 'google ads', 'facebook'],
    category: 'variavel_trafego',
  },
  {
    patterns: ['fee', 'taxa', 'tax', 'tarifa', 'bank fee', 'banking fee', 'iof', 'ir '],
    category: 'variavel_taxas',
  },
  {
    patterns: ['marketing', 'publicidade', 'advertising', 'branding', 'seo', 'content'],
    category: 'operacional_marketing',
  },
  {
    patterns: ['legal', 'juridico', 'lawyer', 'attorney', 'notary'],
    category: 'operacional_juridico',
  },
  {
    patterns: ['maintenance', 'manutencao', 'repair', 'conserto'],
    category: 'operacional_manutencao',
  },
  {
    patterns: ['travel', 'viagem', 'hotel', 'flight', 'voo', 'airfare'],
    category: 'operacional_viagem',
  },
  {
    patterns: ['equipment', 'equipamento', 'hardware', 'machine'],
    category: 'investimento_equipamento',
  },
  {
    patterns: ['stock', 'estoque', 'inventory', 'purchase', 'supply'],
    category: 'investimento_estoque',
  },
  {
    patterns: ['hiring', 'contratacao', 'recruitment', 'headhunter'],
    category: 'investimento_contratacao',
  },
]

/**
 * Maps a Pluggy category string to a SAOOZ BusinessExpCategory.
 * Falls back to 'variavel_outros' if no match is found.
 */
export function mapPluggyCategoryToBusinessExpCategory(
  pluggyCategory: string | null | undefined
): BusinessExpCategory {
  if (!pluggyCategory) return 'variavel_outros'
  const lower = pluggyCategory.toLowerCase()
  for (const { patterns, category } of BUSINESS_EXP_MAP) {
    if (patterns.some((p) => lower.includes(p))) return category
  }
  return 'variavel_outros'
}

// ── Business revenue category mapping ────────────────────────────────────────

const BUSINESS_REV_MAP: Array<{ patterns: string[]; category: BusinessRevCategory }> = [
  {
    patterns: ['service', 'servico', 'consulting', 'consultoria', 'freelance'],
    category: 'servico',
  },
  {
    patterns: ['product', 'produto', 'sale', 'venda', 'goods'],
    category: 'produto',
  },
  {
    patterns: ['recurring', 'recorrente', 'subscription', 'mensalidade', 'assinatura'],
    category: 'recorrente',
  },
  {
    patterns: ['commission', 'comissao', 'affiliate', 'referral'],
    category: 'comissao',
  },
]

/**
 * Maps a Pluggy category string to a SAOOZ BusinessRevCategory.
 * Falls back to 'outro' if no match is found.
 */
export function mapPluggyCategoryToBusinessRevCategory(
  pluggyCategory: string | null | undefined
): BusinessRevCategory {
  if (!pluggyCategory) return 'outro'
  const lower = pluggyCategory.toLowerCase()
  for (const { patterns, category } of BUSINESS_REV_MAP) {
    if (patterns.some((p) => lower.includes(p))) return category
  }
  return 'outro'
}

// ── Utility helpers ───────────────────────────────────────────────────────────

/**
 * Human-readable label for a bank account type.
 */
export function accountTypeLabel(type: string): string {
  switch (type.toUpperCase()) {
    case 'BANK':
      return 'Conta Bancária'
    case 'CREDIT':
      return 'Cartão de Crédito'
    case 'INVESTMENT':
      return 'Investimento'
    default:
      return type
  }
}

/**
 * Maps a Pluggy item status string to a lowercase internal status.
 */
export function normalizeItemStatus(
  status: string
): 'updated' | 'updating' | 'waiting_user_input' | 'error' {
  switch (status.toUpperCase()) {
    case 'UPDATED':
      return 'updated'
    case 'UPDATING':
      return 'updating'
    case 'WAITING_USER_INPUT':
      return 'waiting_user_input'
    default:
      return 'error'
  }
}
