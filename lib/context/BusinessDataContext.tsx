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
import { createClient } from '@/lib/supabase/client'
import { estimateTax } from '@/lib/utils/taxes'
import type {
  BusinessActivity,
  BusinessTaxRegime,
  Database,
} from '@/types/database.types'
import type { TaxEstimate } from '@/lib/utils/taxes'

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row']
type BusinessRevenue = Database['public']['Tables']['business_revenues']['Row']
type BusinessExpense = Database['public']['Tables']['business_expenses']['Row']

export interface BusinessTotals {
  totalRevenue: number
  totalExpenses: number
  taxAmount: number
  taxRate: number
  grossProfit: number
  netProfit: number
  profitMargin: number
}

interface BusinessDataContextValue {
  business: BusinessProfile | null
  revenues: BusinessRevenue[]
  expenses: BusinessExpense[]
  totals: BusinessTotals
  taxEstimate: TaxEstimate | null
  currentMonth: Date
  setMonth: (date: Date) => void
  refresh: () => Promise<void>
  isLoading: boolean
}

const defaultTotals: BusinessTotals = {
  totalRevenue: 0,
  totalExpenses: 0,
  taxAmount: 0,
  taxRate: 0,
  grossProfit: 0,
  netProfit: 0,
  profitMargin: 0,
}

const BusinessDataContext = createContext<BusinessDataContextValue>({
  business: null,
  revenues: [],
  expenses: [],
  totals: defaultTotals,
  taxEstimate: null,
  currentMonth: new Date(),
  setMonth: () => {},
  refresh: async () => {},
  isLoading: true,
})

export function useBusinessData() {
  return useContext(BusinessDataContext)
}

interface ProviderProps {
  businessId: string
  children: React.ReactNode
}

export function BusinessDataProvider({ businessId, children }: ProviderProps) {
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [revenues, setRevenues] = useState<BusinessRevenue[]>([])
  const [expenses, setExpenses] = useState<BusinessExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentMonth, setMonth } = useAppState()
  const monthCache = useRef<
    Map<
      string,
      {
        business: BusinessProfile | null
        revenues: BusinessRevenue[]
        expenses: BusinessExpense[]
      }
    >
  >(new Map())

  const fetchData = useCallback(async (options?: { force?: boolean }) => {
    const monthStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const cacheKey = `${businessId}:${monthStr}`
    const cached = monthCache.current.get(cacheKey)

    if (cached && !options?.force) {
      setBusiness(cached.business)
      setRevenues(cached.revenues)
      setExpenses(cached.expenses)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const [businessRes, revenueRes, expenseRes] = await Promise.all([
      supabase.from('business_profiles').select('*').eq('id', businessId).single(),
      supabase
        .from('business_revenues')
        .select('*')
        .eq('business_id', businessId)
        .eq('month', monthStr)
        .order('amount', { ascending: false }),
      supabase
        .from('business_expenses')
        .select('*')
        .eq('business_id', businessId)
        .eq('month', monthStr)
        .order('amount', { ascending: false }),
    ])

    const nextState = {
      business: businessRes.data ?? null,
      revenues: revenueRes.data ?? [],
      expenses: expenseRes.data ?? [],
    }

    monthCache.current.set(cacheKey, nextState)

    setBusiness(nextState.business)
    setRevenues(nextState.revenues)
    setExpenses(nextState.expenses)
    setIsLoading(false)
  }, [businessId, currentMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const taxEstimate = business
    ? estimateTax(
        totalRevenue,
        business.tax_regime as BusinessTaxRegime,
        business.activity as BusinessActivity
      )
    : null

  const taxAmount = taxEstimate?.amount ?? 0
  const grossProfit = totalRevenue - totalExpenses
  const netProfit = totalRevenue - totalExpenses - taxAmount
  const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0

  const totals: BusinessTotals = {
    totalRevenue,
    totalExpenses,
    taxAmount,
    taxRate: taxEstimate?.rate ?? 0,
    grossProfit,
    netProfit,
    profitMargin,
  }

  return (
    <BusinessDataContext.Provider
      value={{
        business,
        revenues,
        expenses,
        totals,
        taxEstimate,
        currentMonth,
        setMonth,
        refresh: () => fetchData({ force: true }),
        isLoading,
      }}
    >
      {children}
    </BusinessDataContext.Provider>
  )
}
