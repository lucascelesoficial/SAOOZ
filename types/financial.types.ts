import type { ExpenseCategory, IncomeType } from './database.types'

export type { ExpenseCategory, IncomeType }

export interface FinancialTotals {
  totalIncome: number
  totalExpenses: number
  balance: number
  consumptionRate: number // 0–100 percentage
}

export interface CategorySummary {
  category: ExpenseCategory
  total: number
  percentage: number
  label: string
  color: string
}

export interface MonthlySnapshot {
  month: string // ISO date string, first of month
  totalIncome: number
  totalExpenses: number
  balance: number
  byCategory: CategorySummary[]
}

export interface FinancialInsight {
  message: string
  type: 'positive' | 'warning' | 'danger' | 'info'
}

export interface IncomeSourceDisplay {
  id: string
  name: string
  amount: number
  type: IncomeType
  active: boolean
  percentage: number
}

// Category metadata
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  assinaturas: 'Assinaturas',
  vestuario: 'Vestuário',
  beleza: 'Beleza',
  pets: 'Pets',
  dividas: 'Dívidas',
  investimentos: 'Investimentos',
  familia: 'Família',
  religiao: 'Religião',
  variaveis: 'Variáveis',
  outros: 'Outros',
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  moradia: '#3b82f6',
  alimentacao: '#22c55e',
  transporte: '#f59e0b',
  saude: '#ec4899',
  educacao: '#8b5cf6',
  lazer: '#06b6d4',
  assinaturas: '#6366f1',
  vestuario: '#f97316',
  beleza: '#e879f9',
  pets: '#84cc16',
  dividas: '#f87171',
  investimentos: '#10b981',
  familia: '#fb923c',
  religiao: '#a78bfa',
  variaveis: '#94a3b8',
  outros: '#4a6080',
}

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salario: 'Salário CLT',
  freela: 'Freela / Projeto',
  negocio: 'Negócio Próprio',
  aluguel: 'Aluguel Recebido',
  investimento: 'Investimentos',
  pensao: 'Pensão / Benefício',
  outro: 'Outro',
}

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'moradia', 'alimentacao', 'transporte', 'saude', 'educacao',
  'lazer', 'assinaturas', 'vestuario', 'beleza', 'pets',
  'dividas', 'investimentos', 'familia', 'religiao', 'variaveis', 'outros',
]
