'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAppState } from '@/lib/context/AppStateContext'
import { toMonthQueryDate } from '@/lib/modules/_shared/month'
import { createClient } from '@/lib/supabase/client'
import { calculateTotals, groupByCategory } from '@/lib/utils/calculations'
import type { Database } from '@/types/database.types'
import type { CategorySummary, FinancialTotals } from '@/types/financial.types'

type Income = Database['public']['Tables']['income_sources']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

interface FinancialDataContextValue {
  incomes: Income[]
  expenses: Expense[]
  totals: FinancialTotals
  categoryData: CategorySummary[]
  currentMonth: Date
  setMonth: (date: Date) => void
  refresh: () => Promise<void>
  isLoading: boolean
}

const defaultTotals: FinancialTotals = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  consumptionRate: 0,
}

const FinancialDataContext = createContext<FinancialDataContextValue>({
  incomes: [],
  expenses: [],
  totals: defaultTotals,
  categoryData: [],
  currentMonth: new Date(),
  setMonth: () => {},
  refresh: async () => {},
  isLoading: true,
})

export function useFinancialContext() {
  return useContext(FinancialDataContext)
}

interface ProviderProps {
  userId: string
  children: React.ReactNode
}

export function FinancialDataProvider({ userId, children }: ProviderProps) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentMonth, setMonth } = useAppState()
  const monthCache = useRef<Map<string, { incomes: Income[]; expenses: Expense[] }>>(new Map())

  const fetchData = useCallback(async (options?: { force?: boolean }) => {
    const monthStr = toMonthQueryDate(currentMonth)
    const cacheKey = `${userId}:${monthStr}`
    const cached = monthCache.current.get(cacheKey)

    if (cached && !options?.force) {
      setIncomes(cached.incomes)
      setExpenses(cached.expenses)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const prevDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const prevMonthStr = toMonthQueryDate(prevDate)

    const [incomesRes, expensesRes, prevIncomesRes, prevExpensesRes] = await Promise.all([
      supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
        .eq('month', monthStr)
        .order('amount', { ascending: false }),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('month', monthStr)
        .order('amount', { ascending: false }),
      supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
        .eq('month', prevMonthStr)
        .eq('is_recurring', true),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('month', prevMonthStr)
        .eq('is_recurring', true),
    ])

    let currentIncomes = incomesRes.data ?? []
    let currentExpenses = expensesRes.data ?? []

    // Auto-carry recurring items from previous month if they don't exist yet
    const recurringIncomes = prevIncomesRes.data ?? []
    const recurringExpenses = prevExpensesRes.data ?? []

    const newIncomes = recurringIncomes.filter(
      (prev) => !currentIncomes.some((cur) => cur.name === prev.name && cur.type === prev.type)
    )
    const newExpenses = recurringExpenses.filter(
      (prev) => !currentExpenses.some((cur) => cur.category === prev.category && cur.description === prev.description)
    )

    if (newIncomes.length > 0) {
      const { data: inserted } = await supabase.from('income_sources').insert(
        newIncomes.map(({ name, type, amount, active }) => ({
          user_id: userId, name, type, amount, active, month: monthStr, is_recurring: true,
        }))
      ).select()
      if (inserted) currentIncomes = [...currentIncomes, ...inserted].sort((a, b) => b.amount - a.amount)
    }

    if (newExpenses.length > 0) {
      const { data: inserted } = await supabase.from('expenses').insert(
        newExpenses.map(({ category, description, amount }) => ({
          user_id: userId, category, description, amount, month: monthStr, is_recurring: true,
        }))
      ).select()
      if (inserted) currentExpenses = [...currentExpenses, ...inserted].sort((a, b) => b.amount - a.amount)
    }

    const nextState = {
      incomes: currentIncomes,
      expenses: currentExpenses,
    }

    monthCache.current.set(cacheKey, nextState)

    setIncomes(nextState.incomes)
    setExpenses(nextState.expenses)
    setIsLoading(false)
  }, [currentMonth, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totals = calculateTotals(incomes, expenses)
  const categoryData = groupByCategory(expenses)

  return (
    <FinancialDataContext.Provider
      value={{
        incomes,
        expenses,
        totals,
        categoryData,
        currentMonth,
        setMonth,
        refresh: () => fetchData({ force: true }),
        isLoading,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  )
}
