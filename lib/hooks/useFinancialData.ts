'use client'

import { useFinancialContext } from '@/lib/context/FinancialDataContext'

export function useFinancialData() {
  return useFinancialContext()
}
