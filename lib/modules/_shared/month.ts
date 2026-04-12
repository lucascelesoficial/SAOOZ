import { parseMonth, toMonthISO } from '@/lib/utils/formatters'

export const ACTIVE_MONTH_STORAGE_KEY = 'saooz.current-month'

export function normalizeActiveMonth(date: Date): Date {
  const normalized = new Date(date)
  normalized.setDate(1)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export function activeMonthToStorage(date: Date): string {
  return toMonthISO(normalizeActiveMonth(date))
}

export function activeMonthFromStorage(value: string): Date {
  return normalizeActiveMonth(parseMonth(value))
}

export function toMonthQueryDate(date: Date): string {
  return activeMonthToStorage(date)
}

export function shiftActiveMonth(date: Date, deltaMonths: number): Date {
  const shifted = normalizeActiveMonth(date)
  shifted.setMonth(shifted.getMonth() + deltaMonths)
  return normalizeActiveMonth(shifted)
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear()
}
