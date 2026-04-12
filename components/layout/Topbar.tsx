'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { ArrowRightLeft, Building2, ChevronLeft, ChevronRight, LogOut, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useAppState } from '@/lib/context/AppStateContext'
import { formatMonth } from '@/lib/utils/formatters'
import type { Database } from '@/types/database.types'

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
  const { currentMonth, prevMonth, nextMonth, isCurrentMonth } = useAppState()
  const [isSwitchingBusiness, setIsSwitchingBusiness] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isBusinessPath = pathname.startsWith('/empresa')
  const accountHref = isBusinessPath ? '/empresa/configuracoes' : '/configuracoes'
  const activeBusinessId =
    businesses.find((business) => business.id === profile?.active_business_id)?.id ??
    businesses[0]?.id ??
    ''

  const shouldShowModeSwitch = isBusinessPath ? true : businesses.length > 0

  const modeSwitchHref = isBusinessPath
      ? canAccessPersonalModule
      ? '/central'
      : '/planos?feature=personal'
    : canAccessBusinessModule
      ? '/empresa'
      : '/planos?feature=business'

  const modeSwitchLabel = isBusinessPath
    ? canAccessPersonalModule
      ? 'PF'
      : 'Liberar PF'
    : canAccessBusinessModule
      ? 'PJ'
      : 'Liberar PJ'

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
      const message =
        error instanceof Error ? error.message : 'Não foi possível trocar a empresa ativa.'
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

      <div className="flex items-center gap-0.5">
        <button
          onClick={prevMonth}
          className="rounded-[6px] p-1.5 text-app-soft transition-colors hover:text-app"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[90px] md:min-w-[110px] text-center text-xs md:text-sm font-medium capitalize text-app">
          {formatMonth(currentMonth)}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="rounded-[6px] p-1.5 text-app-soft transition-colors hover:text-app disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
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
