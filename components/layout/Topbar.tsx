'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { MAX_FORECAST_MONTHS, useAppState } from '@/lib/context/AppStateContext'
import { resolveModuleScopeFromPathname } from '@/lib/modules/_shared/scope'
import { formatMonth } from '@/lib/utils/formatters'
import type { Database } from '@/types/database.types'

// ── Month Picker ──────────────────────────────────────────────────────────────

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function MonthPicker({
  currentMonth,
  onSelect,
  onClose,
}: {
  currentMonth: Date
  onSelect: (date: Date) => void
  onClose: () => void
}) {
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const maxYear = todayYear + 1
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function isBeyondCap(year: number, monthIndex: number) {
    const targetMs = new Date(year, monthIndex, 1).getTime()
    const capDate = new Date(todayYear, todayMonth + MAX_FORECAST_MONTHS, 1)
    return targetMs >= capDate.getTime()
  }

  function isForecast(year: number, monthIndex: number) {
    if (year > todayYear) return true
    if (year === todayYear && monthIndex > todayMonth) return true
    return false
  }

  function isSelected(year: number, monthIndex: number) {
    return year === currentMonth.getFullYear() && monthIndex === currentMonth.getMonth()
  }

  function isToday(year: number, monthIndex: number) {
    return year === todayYear && monthIndex === todayMonth
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full mt-2 z-50 rounded-[14px] border p-3 shadow-2xl"
      style={{
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
        minWidth: '236px',
        right: 0,
        boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="rounded-[6px] p-1 text-app-soft transition-colors hover:text-app"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-app select-none">{pickerYear}</span>
        <button
          onClick={() => setPickerYear((y) => y + 1)}
          disabled={pickerYear >= maxYear}
          className="rounded-[6px] p-1 text-app-soft transition-colors hover:text-app disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {MONTH_SHORT.map((label, index) => {
          const beyond = isBeyondCap(pickerYear, index)
          const forecast = isForecast(pickerYear, index)
          const selected = isSelected(pickerYear, index)
          const todayMth = isToday(pickerYear, index)

          return (
            <button
              key={label}
              disabled={beyond}
              onClick={() => {
                onSelect(new Date(pickerYear, index, 1))
                onClose()
              }}
              className="rounded-[8px] px-1 py-2 text-xs font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={
                selected
                  ? forecast
                    ? { background: 'color-mix(in oklab, #f59e0b 18%, transparent)', color: '#f59e0b', border: '1px solid color-mix(in oklab, #f59e0b 40%, transparent)' }
                    : { background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)', color: 'var(--accent-blue)', border: '1px solid color-mix(in oklab, var(--accent-blue) 40%, transparent)' }
                  : todayMth
                    ? { background: 'var(--panel-bg-soft)', color: 'var(--accent-blue)', border: '1px solid var(--panel-border)' }
                    : forecast
                      ? { background: 'transparent', color: '#f59e0b', opacity: 0.7, border: '1px dashed color-mix(in oklab, #f59e0b 30%, transparent)' }
                      : { background: 'transparent', color: 'var(--text-soft)', border: '1px solid transparent' }
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t flex items-center gap-3 px-1" style={{ borderColor: 'var(--panel-border)' }}>
        <span className="flex items-center gap-1 text-[10px] text-app-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-blue)' }} />
          Atual
        </span>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#f59e0b' }}>
          <span className="h-2 w-2 rounded-full" style={{ background: '#f59e0b' }} />
          Previsão
        </span>
      </div>
    </div>
  )
}

// ── Main Topbar ───────────────────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']

interface TopbarProps {
  profile: Profile | null
  businesses: Pick<Database['public']['Tables']['business_profiles']['Row'], 'id' | 'name'>[]
  canAccessPersonalModule: boolean
  canAccessBusinessModule: boolean
  canCreateBusiness: boolean
  businessLimitReached: boolean
  isTrial: boolean
  planType: 'pf' | 'pj' | 'pro'
}

export function Topbar({ profile, businesses, canAccessPersonalModule, canAccessBusinessModule, canCreateBusiness, businessLimitReached, isTrial, planType }: TopbarProps) {
  // These props are kept for API compatibility — future use
  void businesses; void canCreateBusiness; void businessLimitReached; void isTrial; void planType
  void canAccessPersonalModule; void canAccessBusinessModule

  const pathname = usePathname()
  const router = useRouter()
  const { currentMonth, prevMonth, nextMonth, setMonth, isFutureMonth, isMaxFutureMonth } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentScope = resolveModuleScopeFromPathname(pathname)
  const accountHref = currentScope === 'business' ? '/empresa/configuracoes' : '/configuracoes'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'auth.logout' }),
    }).catch(() => undefined)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="sticky top-0 z-20 flex h-12 items-center border-b px-4 md:px-6"
      style={{
        background: 'linear-gradient(135deg, #026648 0%, #014d37 60%, #013d2c 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
        position: 'relative',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 2px 12px rgba(1,61,44,0.35)',
      }}
    >
      {/* Left: empty spacer to balance right side */}
      <div className="flex-1" />

      {/* Center: month navigation — absolutely centered */}
      <div className="absolute left-1/2 -translate-x-1/2">
      <div className="relative flex items-center gap-0.5">
        <button
          onClick={prevMonth}
          className="rounded-[6px] p-1.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff', e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)', e.currentTarget.style.background = 'transparent')}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex flex-col items-center rounded-[8px] px-3 py-1 transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Selecionar mês"
        >
          <span
            className="text-sm font-semibold capitalize"
            style={{ minWidth: 90, textAlign: 'center', color: '#ffffff' }}
          >
            {formatMonth(currentMonth)}
          </span>
          {isFutureMonth && (
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#fcd34d' }}>
              previsão
            </span>
          )}
        </button>

        <button
          onClick={nextMonth}
          disabled={isMaxFutureMonth}
          className="rounded-[6px] p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff', e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)', e.currentTarget.style.background = 'transparent')}
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {pickerOpen && (
          <MonthPicker
            currentMonth={currentMonth}
            onSelect={setMonth}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
      </div>

      {/* Right: notifications + theme + user */}
      <div className="flex-1 flex items-center justify-end gap-1.5">
        {/* Notification bell (decorative for now) */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff', e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)', e.currentTarget.style.background = 'transparent')}
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {/* User avatar + dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #04a372, #026648)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.30)',
            }}
            aria-label="Menu do usuário"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{profile?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-50 min-w-[200px] rounded-[12px] border p-1.5 shadow-xl"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
            >
              {profile?.name && (
                <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs font-semibold text-app truncate">{profile.name}</p>
                  <p className="text-[11px] text-app-soft truncate">{profile.email}</p>
                </div>
              )}
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm text-app transition-colors hover:bg-[color-mix(in_oklab,var(--accent-blue)_8%,transparent)]"
              >
                <Settings className="h-4 w-4 text-app-soft" />
                Configurações
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm text-[#f87171] transition-colors hover:bg-[#f8717110]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
