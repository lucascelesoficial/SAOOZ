'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ACTIVE_MONTH_STORAGE_KEY,
  activeMonthFromStorage,
  activeMonthToStorage,
  isSameMonth,
  normalizeActiveMonth,
  shiftActiveMonth,
} from '@/lib/modules/_shared/month'

/** How many months ahead the user is allowed to navigate for forecasting */
export const MAX_FORECAST_MONTHS = 12

interface AppStateContextValue {
  currentMonth: Date
  setMonth: (date: Date) => void
  prevMonth: () => void
  nextMonth: () => void
  isCurrentMonth: boolean
  /** True when the selected month is in the future — used to show "Previsão" UI */
  isFutureMonth: boolean
  /** True when at the maximum allowed future month (navigation cap) */
  isMaxFutureMonth: boolean
}

const AppStateContext = createContext<AppStateContextValue>({
  currentMonth: normalizeActiveMonth(new Date()),
  setMonth: () => {},
  prevMonth: () => {},
  nextMonth: () => {},
  isCurrentMonth: true,
  isFutureMonth: false,
  isMaxFutureMonth: false,
})

export function useAppState() {
  return useContext(AppStateContext)
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => normalizeActiveMonth(new Date()))

  useEffect(() => {
    const storedMonth = window.localStorage.getItem(ACTIVE_MONTH_STORAGE_KEY)
    if (!storedMonth) {
      return
    }

    try {
      setCurrentMonth(activeMonthFromStorage(storedMonth))
    } catch {
      window.localStorage.removeItem(ACTIVE_MONTH_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_MONTH_STORAGE_KEY, activeMonthToStorage(currentMonth))
  }, [currentMonth])

  const setMonth = useCallback((date: Date) => {
    setCurrentMonth(normalizeActiveMonth(date))
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentMonth((previous) => shiftActiveMonth(previous, -1))
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth((previous) => shiftActiveMonth(previous, 1))
  }, [])

  const currentDate = normalizeActiveMonth(new Date())
  const isCurrentMonth = isSameMonth(currentMonth, currentDate)
  const isFutureMonth = currentMonth > currentDate
  const maxFutureDate = shiftActiveMonth(currentDate, MAX_FORECAST_MONTHS)
  const isMaxFutureMonth = currentMonth >= maxFutureDate

  const value = useMemo(
    () => ({
      currentMonth,
      setMonth,
      prevMonth,
      nextMonth,
      isCurrentMonth,
      isFutureMonth,
      isMaxFutureMonth,
    }),
    [currentMonth, isCurrentMonth, isFutureMonth, isMaxFutureMonth, nextMonth, prevMonth, setMonth]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
