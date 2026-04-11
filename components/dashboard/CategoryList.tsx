'use client'

import {
  Home, ShoppingCart, Car, Heart, GraduationCap, Music,
  Tv, Shirt, Sparkles, PawPrint, CreditCard, TrendingUp,
  Users, Church, BarChart2, MoreHorizontal, Plus,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/formatters'
import type { CategorySummary } from '@/types/financial.types'
import type { ExpenseCategory } from '@/types/database.types'

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  moradia: Home,
  alimentacao: ShoppingCart,
  transporte: Car,
  saude: Heart,
  educacao: GraduationCap,
  lazer: Music,
  assinaturas: Tv,
  vestuario: Shirt,
  beleza: Sparkles,
  pets: PawPrint,
  dividas: CreditCard,
  investimentos: TrendingUp,
  familia: Users,
  religiao: Church,
  variaveis: BarChart2,
  outros: MoreHorizontal,
}

interface CategoryListProps {
  data: CategorySummary[]
  loading?: boolean
  onAddExpense?: () => void
}

export function CategoryList({ data, loading = false, onAddExpense }: CategoryListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" style={{ background: 'var(--panel-border)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" style={{ background: 'var(--panel-border)' }} />
                <Skeleton className="h-3 w-16" style={{ background: 'var(--panel-border)' }} />
              </div>
              <Skeleton className="h-1.5 w-full" style={{ background: 'var(--panel-border)' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-app-soft">Nenhum gasto neste mês.</p>
        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="mt-3 text-sm hover:underline flex items-center gap-1 mx-auto"
            style={{ color: 'var(--accent-blue)' }}
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar gasto
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map(({ category, label, total, percentage }) => {
        const Icon = CATEGORY_ICONS[category]
        return (
          <div key={category} className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0 text-app-soft" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-app font-medium truncate">{label}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-app-soft">{percentage}%</span>
                  <span className="text-xs text-app-base tabular-nums">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--panel-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: 'var(--accent-blue)' }}
                />
              </div>
            </div>
          </div>
        )
      })}

      {onAddExpense && (
        <button
          onClick={onAddExpense}
          className="w-full mt-2 py-2 rounded-[8px] border border-dashed transition-colors text-sm flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--panel-border)', color: 'var(--text-soft)' }}
        >
          <Plus className="h-4 w-4" />
          Adicionar Gasto
        </button>
      )}
    </div>
  )
}
