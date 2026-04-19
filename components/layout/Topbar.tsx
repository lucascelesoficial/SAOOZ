'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { ArrowRightLeft, Building2, ChevronLeft, ChevronRight, LogOut, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { MAX_FORECAST_MONTHS, useAppState } from '@/lib/context/AppStateContext'
import { getModuleErrorMessage } from '@/lib/modules/_shared/errors'
import {
  getModuleScopeRoot,
  MODULE_SCOPE_LABEL,
  resolveModuleScopeFromPathname,
} from '@/lib/modules/_shared/scope'
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
  const maxYear = todayYear + 1  // allow browsing into next year
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

  /** Month is beyond the MAX_FORECAST_MONTHS cap → disabled */
  function isBeyondCap(year: number, monthIndex: number) {
    const targetMs = new Date(year, monthIndex, 1).getTime()
    const capDate  = new Date(todayYear, todayMonth + MAX_FORECAST_MONTHS, 1)
    return targetMs >= capDate.getTime()
  }

  /** Month is in the future (but within cap) → forecast style */
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
        left: '50%',
        transform: 'translateX(-50%)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      {/* Year navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="rounded-[6px] p-1 text-app-soft transition-colors hover:text-app"
          aria-label="Ano anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-app select-none">{pickerYear}</span>
        <button
          onClick={() => setPickerYear((y) => y + 1)}
          disabled={pickerYear >= maxYear}
          className="rounded-[6px] p-1 text-app-soft transition-colors hover:text-app disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próximo ano"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTH_SHORT.map((label, index) => {
          const beyond   = isBeyondCap(pickerYear, index)
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
                    ? {
                        background: 'color-mix(in oklab, #f59e0b 18%, transparent)',
                        color: '#f59e0b',
                        border: '1px solid color-mix(in oklab, #f59e0b 40%, transparent)',
                      }
                    : {
                        background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                        color: 'var(--accent-blue)',
                        border: '1px solid color-mix(in oklab, var(--accent-blue) 40%, transparent)',
                      }
                  : todayMth
                  ? {
                      background: 'var(--panel-bg-soft)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--panel-border)',
                    }
                  : forecast
                  ? {
                      background: 'transparent',
                      color: '#f59e0b',
                      opacity: 0.7,
                      border: '1px dashed color-mix(in oklab, #f59e0b 30%, transparent)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--text-soft)',
                      border: '1px solid transparent',
                    }
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Legend */}
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

type Profile = Database['public']['Tables']['profiles']['Row']
type BusinessSummary = Pick<Database['public']['Tables']['business_profiles']['Row'], 'id' | 'name'>

interface TopbarProps {
  profile: Profile | null
  businesses: BusinessSummary[]
  canAccessPersonalModule: boolean
  canAccessBusinessModule: boolean
  canCreateBusiness: boolean
  businessLimitReached: boolean
  /** true when user is in a free trial (no paid subscription yet) */
  isTrial: boolean
  /** current subscription plan type */
  planType: 'pf' | 'pj' | 'pro'
}

const FULL_TEXT = 'SEU SISTEMA FINANCEIRO'

function TypewriterText() {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      index += 1
      setDisplayed(FULL_TEXT.slice(0, index))
      if (index >= FULL_TEXT.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, 55)

    return () => clearInterval(timer)
  }, [])

  return (
    <span className="hidden items-center gap-0.5 font-mono text-xs tracking-widest md:inline-flex" style={{ color: 'rgba(255,255,255,0.75)' }}>
      <span className="mr-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {'>'}
      </span>
      {displayed}
      <span
        className="ml-0.5 inline-block h-[12px] w-[2px]"
        style={{
          background: 'rgba(255,255,255,0.9)',
          animation: done ? 'cursor-blink 1s step-end infinite' : 'none',
        }}
      />
    </span>
  )
}

export function Topbar({
  profile,
  businesses,
  canAccessPersonalModule,
  canAccessBusinessModule,
  canCreateBusiness,
  businessLimitReached,
  isTrial,
  planType,
}: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentMonth, setMonth, prevMonth, nextMonth, isFutureMonth, isMaxFutureMonth } = useAppState()
  const [isSwitchingBusiness, setIsSwitchingBusiness] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    // Audit log before signOut so session cookie is still valid server-side
    await fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'auth.logout' }),
    }).catch(() => undefined)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentScope = resolveModuleScopeFromPathname(pathname)
  const isBusinessPath = currentScope === 'business'
  const accountHref = isBusinessPath ? '/empresa/configuracoes' : '/configuracoes'
  const activeBusinessId =
    businesses.find((business) => business.id === profile?.active_business_id)?.id ??
    businesses[0]?.id ??
    ''

  const shouldShowModeSwitch = isBusinessPath ? true : businesses.length > 0

  const modeSwitchHref = isBusinessPath
      ? canAccessPersonalModule
      ? getModuleScopeRoot('personal')
      : '/planos?feature=personal'
    : canAccessBusinessModule
      ? getModuleScopeRoot('business')
      : '/planos?feature=business'

  const modeSwitchLabel = isBusinessPath
    ? canAccessPersonalModule
      ? MODULE_SCOPE_LABEL.personal
      : `Liberar ${MODULE_SCOPE_LABEL.personal}`
    : canAccessBusinessModule
      ? MODULE_SCOPE_LABEL.business
      : `Liberar ${MODULE_SCOPE_LABEL.business}`

  // PF trial: upsell to plans page so user picks PJ/PRO first
  const isUpsell = isTrial && planType === 'pf'
  const businessActionHref = isUpsell
    ? '/planos?feature=business'
    : canCreateBusiness
      ? '/onboarding/empresa'
      : businessLimitReached
        ? '/planos?feature=business_limit'
        : '/planos?feature=business'

  const businessActionLabel = isUpsell
    ? 'Abrir conta empresarial'
    : canCreateBusiness
      ? isBusinessPath
        ? 'Nova empresa'
        : 'Adicionar empresa'
      : businessLimitReached
        ? 'Aumentar limite'
        : 'Liberar PJ'

  const showBusinessAction = isUpsell || canCreateBusiness || businessLimitReached

  async function handleBusinessChange(nextBusinessId: string) {
    if (!nextBusinessId || nextBusinessId === activeBusinessId) {
      return
    }

    setIsSwitchingBusiness(true)

    try {
      const response = await fetch('/api/businesses/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: nextBusinessId }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Não foi possível trocar a empresa ativa.')
      }

      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      const message = getModuleErrorMessage(error, 'Não foi possível trocar a empresa ativa.')
      toast.error('Falha ao alternar empresa', { description: message })
    } finally {
      setIsSwitchingBusiness(false)
    }
  }

  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md md:px-6"
      style={{
        background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)',
        borderColor: 'transparent',
      }}
    >
      <div className="min-w-0 flex items-center gap-3">
        <TypewriterText />
        <span className="truncate text-sm font-semibold text-app md:hidden">SAOOZ</span>
      </div>

      <div className="flex items-center gap-0.5 relative">
        <button
          onClick={prevMonth}
          className="rounded-[6px] p-1.5 transition-colors hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="relative flex flex-col items-center rounded-[6px] px-2 py-1 transition-colors hover:bg-white/10"
          aria-label="Selecionar mês"
          title="Clique para escolher o mês"
        >
          <span className="min-w-[90px] md:min-w-[110px] text-center text-xs md:text-sm font-medium capitalize" style={{ color: '#fff' }}>
            {formatMonth(currentMonth)}
          </span>
          {isFutureMonth && (
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#fde68a' }}>
              previsão
            </span>
          )}
        </button>

        <button
          onClick={nextMonth}
          disabled={isMaxFutureMonth}
          className="rounded-[6px] p-1.5 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: 'rgba(255,255,255,0.75)' }}
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

      <div className="flex items-center gap-2">
        {shouldShowModeSwitch && (
          <Link
            href={modeSwitchHref}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] px-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: 'transparent', color: '#ffffff' }}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{modeSwitchLabel}</span>
          </Link>
        )}

        {isBusinessPath && canAccessBusinessModule && businesses.length > 1 && (
          <label className="hidden items-center gap-2 sm:flex">
            <Building2 className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
            <select
              value={activeBusinessId}
              onChange={(event) => void handleBusinessChange(event.target.value)}
              disabled={isSwitchingBusiness}
              className="h-9 min-w-[160px] rounded-[8px] px-3 text-sm outline-none transition-opacity disabled:opacity-60 hover:opacity-70"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
              }}
              aria-label="Empresa ativa"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Business action: create, upsell, or limit upgrade */}
        {showBusinessAction && (
          <Link
            href={businessActionHref}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] px-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: 'transparent', color: '#ffffff' }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">{businessActionLabel}</span>
          </Link>
        )}

        <ThemeToggle onDark />

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.22)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.30)',
            }}
            aria-label="Menu do usuário"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar do usuário" className="h-full w-full object-cover" />
            ) : (
              <span>{profile?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-50 min-w-[180px] rounded-[12px] border p-1.5 shadow-xl"
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
