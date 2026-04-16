'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { ArrowRightLeft, Building2, ChevronLeft, ChevronRight, LogOut, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useAppState } from '@/lib/context/AppStateContext'
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

  function isFuture(year: number, monthIndex: number) {
    return year > today.getFullYear() || (year === today.getFullYear() && monthIndex > today.getMonth())
  }

  function isSelected(year: number, monthIndex: number) {
    return year === currentMonth.getFullYear() && monthIndex === currentMonth.getMonth()
  }

  function isToday(year: number, monthIndex: number) {
    return year === today.getFullYear() && monthIndex === today.getMonth()
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full mt-2 z-50 rounded-[14px] border p-3 shadow-2xl"
      style={{
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
        minWidth: '220px',
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
          disabled={pickerYear >= today.getFullYear()}
          className="rounded-[6px] p-1 text-app-soft transition-colors hover:text-app disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próximo ano"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTH_SHORT.map((label, index) => {
          const future = isFuture(pickerYear, index)
          const selected = isSelected(pickerYear, index)
          const todayMonth = isToday(pickerYear, index)

          return (
            <button
              key={label}
              disabled={future}
              onClick={() => {
                onSelect(new Date(pickerYear, index, 1))
                onClose()
              }}
              className="rounded-[8px] px-1 py-2 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={
                selected
                  ? {
                      background: 'color-mix(in oklab, var(--accent-blue) 18%, transparent)',
                      color: 'var(--accent-blue)',
                      border: '1px solid color-mix(in oklab, var(--accent-blue) 40%, transparent)',
                    }
                  : todayMonth
                  ? {
                      background: 'var(--panel-bg-soft)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--panel-border)',
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
}

const FULL_TEXT = 'NÚCLEO FINANCEIRO ATIVADO'

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
    <span className="hidden items-center gap-0.5 font-mono text-xs tracking-widest text-app-soft md:inline-flex">
      <span
        className="mr-1"
        style={{ color: 'color-mix(in oklab, var(--accent-blue) 60%, transparent)' }}
      >
        {'>'}
      </span>
      {displayed}
      <span
        className="ml-0.5 inline-block h-[12px] w-[2px]"
        style={{
          background: 'var(--accent-blue)',
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
}: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentMonth, setMonth, prevMonth, nextMonth, isCurrentMonth } = useAppState()
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

  const businessActionHref = canCreateBusiness
    ? '/onboarding/empresa'
    : businessLimitReached
      ? '/planos?feature=business_limit'
      : '/planos?feature=business'

  const businessActionLabel = canCreateBusiness
    ? isBusinessPath
      ? 'Nova empresa'
      : 'Adicionar empresa'
    : businessLimitReached
      ? 'Aumentar limite'
      : 'Liberar PJ'

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
      className="panel-surface sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md md:px-6"
      style={{ borderColor: 'var(--panel-border)' }}
    >
      <div className="min-w-0 flex items-center gap-3">
        <TypewriterText />
        <span className="truncate text-sm font-semibold text-app md:hidden">SAOOZ</span>
      </div>

      <div className="flex items-center gap-0.5 relative">
        <button
          onClick={prevMonth}
          className="rounded-[6px] p-1.5 text-app-soft transition-colors hover:text-app"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="min-w-[90px] md:min-w-[110px] rounded-[6px] px-2 py-1 text-center text-xs md:text-sm font-medium capitalize text-app transition-colors hover:bg-[color-mix(in_oklab,var(--accent-blue)_8%,transparent)]"
          aria-label="Selecionar mês"
          title="Clique para escolher o mês"
        >
          {formatMonth(currentMonth)}
        </button>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="rounded-[6px] p-1.5 text-app-soft transition-colors hover:text-app disabled:cursor-not-allowed disabled:opacity-30"
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
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border px-3 text-sm font-medium text-app transition-colors hover:opacity-90"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: 'var(--panel-border)',
            }}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{modeSwitchLabel}</span>
          </Link>
        )}

        {isBusinessPath && canAccessBusinessModule && businesses.length > 1 && (
          <label className="hidden items-center gap-2 sm:flex">
            <Building2 className="h-4 w-4 text-app-soft" />
            <select
              value={activeBusinessId}
              onChange={(event) => void handleBusinessChange(event.target.value)}
              disabled={isSwitchingBusiness}
              className="h-9 min-w-[160px] rounded-[8px] border px-3 text-sm outline-none transition-colors disabled:opacity-60"
              style={{
                background: 'var(--panel-bg-soft)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-strong)',
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

        {/* Only show business action when user actually has access (can create or hit limit) */}
        {(canCreateBusiness || businessLimitReached) && (
          <Link
            href={businessActionHref}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border px-3 text-sm font-medium text-app transition-colors hover:opacity-90"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: 'var(--panel-border)',
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">{businessActionLabel}</span>
          </Link>
        )}

        <ThemeToggle />

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              boxShadow: '0 0 0 2px color-mix(in oklab, var(--accent-blue) 16%, transparent)',
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
