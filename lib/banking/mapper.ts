/**
 * SAOOZ — Pluggy → SAOOZ Category Mapper
 *
 * Maps Pluggy transaction categories to SAOOZ ExpenseCategory enum values.
 * Pluggy categories are in English; SAOOZ uses Portuguese slugs.
 */

import type { ExpenseCategory } from '@/types/database.types'

/**
 * Map from Pluggy category strings (case-insensitive prefix match)
 * to SAOOZ ExpenseCategory values.
 */
const CATEGORY_MAP: Array<{ patterns: string[]; category: ExpenseCategory }> = [
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
 * Maps a Pluggy category string to a SAOOZ ExpenseCategory.
 * Falls back to 'outros' if no match is found.
 */
export function mapPluggyCategoryToExpenseCategory(
  pluggyCategory: string | null | undefined
): ExpenseCategory {
  if (!pluggyCategory) return 'outros'

  const lower = pluggyCategory.toLowerCase()

  for (const { patterns, category } of CATEGORY_MAP) {
    if (patterns.some((p) => lower.includes(p))) {
      return category
    }
  }

  return 'outros'
}

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
