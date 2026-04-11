'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { parseMonth, toMonthISO } from '@/lib/utils/formatters'

interface AppStateContextValue {
  currentMonth: Date
  setMonth: (date: Date) => void
  prevMonth: () => void
  nextMonth: () => void
  isCurrentMonth: boolean
}

const STORAGE_KEY = 'saooz.current-month'

function normalizeMonth(date: Date) {
  const normalized = new Date(date)
  normalized.setDate(1)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const AppStateContext = createContext<AppStateContextValue>({
  currentMonth: normalizeMonth(new Date()),
  setMonth: () => {},
  prevMonth: () => {},
  nextMonth: () => {},
  isCurrentMonth: true,
})

export function useAppState() {
  return useContext(AppStateContext)
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => normalizeMonth(new Date()))

  useEffect(() => {
    const storedMonth = window.localStorage.getItem(STORAGE_KEY)
    if (!storedMonth) {
      return
    }

    try {
      setCurrentMonth(normalizeMonth(parseMonth(storedMonth)))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, toMonthISO(currentMonth))
  }, [currentMonth])

  const setMonth = useCallback((date: Date) => {
    setCurrentMonth(normalizeMonth(date))
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentMonth((previous) => {
      const next = new Date(previous)
      next.setMonth(next.getMonth() - 1)
      return normalizeMonth(next)
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth((previous) => {
      const next = new Date(previous)
      next.setMonth(next.getMonth() + 1)
      return normalizeMonth(next)
    })
  }, [])

  const currentDate = normalizeMonth(new Date())
  const isCurrentMonth =
    currentMonth.getMonth() === currentDate.getMonth() &&
    currentMonth.getFullYear() === currentDate.getFullYear()

  const value = useMemo(
    () => ({
      currentMonth,
      setMonth,
      prevMonth,
      nextMonth,
      isCurrentMonth,
    }),
    [currentMonth, isCurrentMonth, nextMonth, prevMonth, setMonth]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
