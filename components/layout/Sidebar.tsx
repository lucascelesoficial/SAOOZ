'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowUpRight,
  BarChart2,
  Bot,
  Briefcase,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { SaoozLogo } from '@/components/ui/SaoozLogo'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface SidebarProps {
  profile: Profile | null
  planLabel: string
  planStatusLabel: string
  canAccessPersonalModule: boolean
  canAccessBusinessModule: boolean
}

const PF_NAV = [
  { href: '/dashboard', label: 'Central', icon: LayoutDashboard },
  { href: '/negocios', label: 'Finanças', icon: Briefcase },
  { href: '/perfil-financeiro', label: 'Despesas', icon: Receipt },
  { href: '/analise', label: 'Inteligência', icon: BarChart2 },
  { href: '/assistente', label: 'Assistente', icon: Bot },
  { href: '/planos', label: 'Planos', icon: CreditCard },
  { href: '/conta', label: 'Configurações', icon: Settings },
]

const PJ_NAV = [
  { href: '/empresa', label: 'Empresa', icon: Building2 },
  { href: '/empresa/faturamento', label: 'Finanças', icon: TrendingUp },
  { href: '/empresa/despesas', label: 'Despesas', icon: TrendingDown },
  { href: '/empresa/impostos', label: 'Impostos', icon: Receipt },
  { href: '/empresa/pro-labore', label: 'Pró-labore', icon: ArrowUpRight },
  { href: '/empresa/analise', label: 'Inteligência', icon: BarChart2 },
  { href: '/empresa/assistente', label: 'Assistente', icon: Bot },
  { href: '/planos', label: 'Planos', icon: CreditCard },
  { href: '/empresa/conta', label: 'Configurações', icon: Settings },
]

export function Sidebar({
  profile,
  planLabel,
  planStatusLabel,
  canAccessPersonalModule,
  canAccessBusinessModule,
}: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isPJPath = pathname.startsWith('/empresa')
  const mode = profile?.mode ?? 'pf'
  const hasBusinessContext = mode === 'pj' || mode === 'both'
  const canToggleMode = hasBusinessContext && canAccessPersonalModule && canAccessBusinessModule
  const navItems = hasBusinessContext && isPJPath ? PJ_NAV : PF_NAV

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-full w-[240px] flex-col md:flex"
      style={{ background: 'var(--surface-bg)', borderRight: '1px solid var(--panel-border)' }}
    >
      <div
        className="flex items-center gap-3 border-b px-5 py-5"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <SaoozLogo size="md" />
        <span className="text-lg font-extrabold tracking-tight text-app">SAOOZ</span>
      </div>

      {canToggleMode && (
        <div className="px-3 pt-3">
          <div
            className="flex overflow-hidden rounded-[8px] p-0.5"
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            <Link
              href="/dashboard"
              className="flex-1 rounded-[6px] py-1.5 text-center text-xs font-bold transition-all"
              style={
                !isPJPath
                  ? {
                      background: 'color-mix(in oklab, var(--accent-blue) 20%, transparent)',
                      color: 'var(--accent-blue)',
                    }
                  : { color: 'var(--text-soft)' }
              }
            >
              PF
            </Link>
            <Link
              href="/empresa"
              className="flex-1 rounded-[6px] py-1.5 text-center text-xs font-bold transition-all"
              style={
                isPJPath
                  ? {
                      background: 'color-mix(in oklab, var(--accent-blue) 20%, transparent)',
                      color: 'var(--accent-blue)',
                    }
                  : { color: 'var(--text-soft)' }
              }
            >
              PJ
            </Link>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : href === '/empresa'
                ? pathname === '/empresa'
                : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive ? 'text-app' : 'text-app-base hover:text-app'
              }`}
              style={
                isActive
                  ? {
                      background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                      boxShadow: 'inset 3px 0 0 var(--accent-blue)',
                    }
                  : {}
              }
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: isActive ? 'var(--accent-blue)' : undefined }}
                aria-hidden
              />
              <span>{label}</span>
              {isActive && (
                <span
                  className="absolute right-3 h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent-blue)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div
        className="space-y-3 border-t px-3 py-4"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <div className="panel-card flex items-center justify-between rounded-[8px] px-3 py-1.5">
          <div>
            <span className="text-xs text-app-soft">Plano</span>
            <p className="text-[11px] text-app-soft">{planStatusLabel}</p>
          </div>
          <span className="text-xs font-bold" style={{ color: 'var(--accent-blue)' }}>
            {planLabel}
          </span>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar do usuário" className="h-full w-full object-cover" />
            ) : (
              <span>{profile?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-app">{profile?.name ?? 'Usuário'}</p>
            <p className="truncate text-xs text-app-soft">{profile?.email ?? ''}</p>
          </div>
          <button
            onClick={signOut}
            className="text-app-soft transition-colors hover:text-app"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
