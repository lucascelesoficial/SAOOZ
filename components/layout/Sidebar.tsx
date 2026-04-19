'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowUpRight,
  BarChart2,
  Bot,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart2,
  Landmark,
  LayoutDashboard,
  LineChart,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Waves,
} from 'lucide-react'
import { SaoozLogo } from '@/components/ui/SaoozLogo'
import { OverdueBadge } from '@/components/business/OverdueBadge'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSidebar } from '@/lib/context/SidebarContext'
import {
  MODULE_SCOPE_LABEL,
  resolveModuleScopeFromPathname,
} from '@/lib/modules/_shared/scope'
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
  { href: '/central',             label: 'Central',        icon: LayoutDashboard },
  { href: '/financas',            label: 'Finanças',       icon: Briefcase       },
  { href: '/despesas',            label: 'Despesas',       icon: Receipt         },
  { href: '/reserva-emergencia',  label: 'Reserva',        icon: ShieldCheck     },
  { href: '/investimentos',       label: 'Investimentos',  icon: LineChart       },
  { href: '/bancos',              label: 'Bancos',         icon: Landmark        },
  { href: '/inteligencia',        label: 'Inteligência',   icon: BarChart2       },
  { href: '/assistente',          label: 'Assistente',     icon: Bot             },
  { href: '/planos',              label: 'Planos',         icon: CreditCard      },
  { href: '/configuracoes',       label: 'Configurações',  icon: Settings        },
]

const PJ_NAV = [
  { href: '/empresa',                   label: 'Empresa',        icon: Building2        },
  { href: '/empresa/financas',          label: 'Finanças',       icon: TrendingUp       },
  { href: '/empresa/despesas',          label: 'Despesas',       icon: TrendingDown     },
  { href: '/empresa/bancos',            label: 'Bancos',         icon: Landmark         },
  { href: '/empresa/clientes',          label: 'Clientes',       icon: Users            },
  { href: '/empresa/fornecedores',      label: 'Fornecedores',   icon: Truck            },
  { href: '/empresa/reserva-emergencia',label: 'Reserva',        icon: ShieldCheck      },
  { href: '/empresa/investimentos',     label: 'Investimentos',  icon: LineChart        },
  { href: '/empresa/impostos',          label: 'Impostos',       icon: Receipt          },
  { href: '/empresa/dre',               label: 'DRE',            icon: FileBarChart2    },
  { href: '/empresa/fluxo-de-caixa',    label: 'Fluxo de Caixa', icon: Waves           },
  { href: '/empresa/orcamento',         label: 'Orçamento',      icon: SlidersHorizontal},
  { href: '/empresa/relatorio',         label: 'Relatório',      icon: Table2           },
  { href: '/empresa/funcionarios',      label: 'Funcionários',   icon: Users            },
  { href: '/empresa/pro-labore',        label: 'Pró-labore',     icon: ArrowUpRight     },
  { href: '/empresa/inteligencia',      label: 'Inteligência',   icon: BarChart2        },
  { href: '/empresa/assistente',        label: 'Assistente',     icon: Bot              },
  { href: '/planos',                    label: 'Planos',         icon: CreditCard       },
  { href: '/empresa/configuracoes',     label: 'Configurações',  icon: Settings         },
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
  const { collapsed, toggle } = useSidebar()

  const currentScope       = resolveModuleScopeFromPathname(pathname)
  const isBusinessScope    = currentScope === 'business'
  const mode               = profile?.mode ?? 'pf'
  const hasBusinessContext = mode === 'pj' || mode === 'both'
  const canToggleMode      = hasBusinessContext && canAccessPersonalModule && canAccessBusinessModule
  const navItems           = hasBusinessContext && isBusinessScope ? PJ_NAV : PF_NAV

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-full flex-col md:flex overflow-visible"
      style={{
        width:       sidebarWidth,
        background:  'var(--surface-bg)',
        borderRight: '1px solid var(--panel-border)',
        transition:  'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center border-b overflow-hidden shrink-0"
        style={{
          borderColor: 'var(--panel-border)',
          height:       64,
          padding:      collapsed ? '0 0 0 20px' : '0 20px',
          transition:   'padding 300ms ease',
        }}
      >
        <SaoozLogo size="md" />
        <span
          className="ml-3 text-lg font-extrabold tracking-tight text-app whitespace-nowrap"
          style={{
            opacity:    collapsed ? 0 : 1,
            maxWidth:   collapsed ? 0 : 120,
            overflow:   'hidden',
            transition: 'opacity 200ms ease, max-width 300ms ease',
          }}
        >
          SAOOZ
        </span>
      </div>

      {/* ── PF / PJ toggle ───────────────────────────────────────────────── */}
      {canToggleMode && !collapsed && (
        <div className="px-3 pt-3 shrink-0">
          <div
            className="flex overflow-hidden rounded-[8px] p-0.5"
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
          >
            <Link
              href="/central"
              className="flex-1 rounded-[6px] py-1.5 text-center text-xs font-bold transition-all"
              style={
                !isBusinessScope
                  ? { background: 'color-mix(in oklab, var(--accent-blue) 20%, transparent)', color: 'var(--accent-blue)' }
                  : { color: 'var(--text-soft)' }
              }
            >
              {MODULE_SCOPE_LABEL.personal}
            </Link>
            <Link
              href="/empresa"
              className="flex-1 rounded-[6px] py-1.5 text-center text-xs font-bold transition-all"
              style={
                isBusinessScope
                  ? { background: 'color-mix(in oklab, var(--accent-blue) 20%, transparent)', color: 'var(--accent-blue)' }
                  : { color: 'var(--text-soft)' }
              }
            >
              {MODULE_SCOPE_LABEL.business}
            </Link>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5"
        style={{ padding: collapsed ? '12px 0' : '12px 12px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/central'
              ? pathname === '/central'
              : href === '/empresa'
                ? pathname === '/empresa'
                : pathname === href || pathname.startsWith(`${href}/`)

          const showOverdueBadge =
            href === '/empresa/fluxo-de-caixa' &&
            isBusinessScope &&
            !!profile?.active_business_id

          return (
            <div key={href} className="relative group/nav">
              <Link
                href={href}
                className={`relative flex items-center rounded-[8px] text-sm font-medium transition-all duration-150 ${
                  isActive ? 'text-app' : 'text-app-base hover:text-app'
                }`}
                style={{
                  padding:    collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  ...(isActive
                    ? {
                        background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)',
                        boxShadow:  collapsed ? undefined : 'inset 3px 0 0 var(--accent-blue)',
                      }
                    : {}),
                }}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  style={{ color: isActive ? 'var(--accent-blue)' : undefined }}
                  aria-hidden
                />

                {/* Label — fades out when collapsed */}
                <span
                  className="ml-3 whitespace-nowrap"
                  style={{
                    opacity:    collapsed ? 0 : 1,
                    maxWidth:   collapsed ? 0 : 160,
                    overflow:   'hidden',
                    transition: 'opacity 150ms ease, max-width 300ms ease',
                    flex:       1,
                  }}
                >
                  {label}
                </span>

                {!collapsed && showOverdueBadge && (
                  <OverdueBadge businessId={profile!.active_business_id!} />
                )}
                {!collapsed && isActive && !showOverdueBadge && (
                  <span className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--accent-blue)' }} />
                )}
              </Link>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[7px] px-2.5 py-1.5 text-xs font-semibold opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150"
                  style={{
                    background: 'var(--surface-bg)',
                    border:     '1px solid var(--panel-border)',
                    color:      'var(--text-strong)',
                    boxShadow:  '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 border-t overflow-hidden"
        style={{ borderColor: 'var(--panel-border)', padding: collapsed ? '12px 0' : '12px 12px' }}
      >
        {/* Plan badge — hidden when collapsed */}
        {!collapsed && (
          <div className="panel-card flex items-center justify-between rounded-[8px] px-3 py-1.5 mb-3">
            <div>
              <span className="text-xs text-app-soft">Plano</span>
              <p className="text-[11px] text-app-soft">{planStatusLabel}</p>
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--accent-blue)' }}>
              {planLabel}
            </span>
          </div>
        )}

        {/* Avatar row */}
        <div
          className="flex items-center gap-3"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0' : '0 8px' }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{profile?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
            )}
          </div>

          {/* Name + email — hidden when collapsed */}
          <div
            className="min-w-0 flex-1"
            style={{
              opacity:    collapsed ? 0 : 1,
              maxWidth:   collapsed ? 0 : 200,
              overflow:   'hidden',
              transition: 'opacity 150ms ease, max-width 300ms ease',
            }}
          >
            <p className="truncate text-sm font-medium text-app">{profile?.name ?? 'Usuário'}</p>
            <p className="truncate text-xs text-app-soft">{profile?.email ?? ''}</p>
          </div>

          {!collapsed && (
            <button onClick={signOut} className="text-app-soft transition-colors hover:text-app shrink-0" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Toggle tab — always visible, sticks out from the right edge ─── */}
      <button
        onClick={toggle}
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute top-[72px] z-50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          right:        -14,
          width:        28,
          height:       28,
          borderRadius: '50%',
          background:   'var(--surface-bg)',
          border:       '1px solid var(--panel-border)',
          boxShadow:    '0 2px 8px rgba(0,0,0,0.35)',
          color:        'var(--text-soft)',
        }}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />
        }
      </button>
    </aside>
  )
}
