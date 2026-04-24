'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2,
  Bot,
  Briefcase,
  Building2,
  LayoutDashboard,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { resolveModuleScopeFromPathname } from '@/lib/modules/_shared/scope'

const PF_ITEMS = [
  { href: '/central', label: 'Central', icon: LayoutDashboard },
  { href: '/financas', label: 'Finanças', icon: Briefcase },
  { href: '/despesas', label: 'Despesas', icon: Receipt },
  { href: '/inteligencia', label: 'Inteligência', icon: BarChart2 },
  { href: '/assistente', label: 'Assistente', icon: Bot },
]

const PJ_ITEMS = [
  { href: '/empresa', label: 'Empresa', icon: Building2 },
  { href: '/empresa/financas', label: 'Finanças', icon: TrendingUp },
  { href: '/empresa/despesas', label: 'Despesas', icon: TrendingDown },
  { href: '/empresa/inteligencia', label: 'Inteligência', icon: BarChart2 },
  { href: '/empresa/assistente', label: 'Assistente', icon: Bot },
]

export function BottomNav() {
  const pathname = usePathname()

  const scope = resolveModuleScopeFromPathname(pathname)
  const items = scope === 'business' ? PJ_ITEMS : PF_ITEMS

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 md:hidden"
      style={{
        background: 'color-mix(in oklab, var(--surface-bg) 94%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--panel-border)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingTop: '6px',
      }}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/empresa' || href === '/central'
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            className="relative min-w-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[12px] transition-all duration-200 active:scale-90"
            style={{
              color: isActive ? '#026648' : 'var(--text-soft)',
              background: isActive ? 'rgba(2,102,72,0.10)' : 'transparent',
              minWidth: 52,
            }}
          >
            {/* Active indicator line */}
            {isActive && (
              <span
                className="absolute -top-[7px] left-1/2 -translate-x-1/2 rounded-b-full"
                style={{
                  width: 24,
                  height: 3,
                  background: 'linear-gradient(90deg, #026648, #04a372)',
                  boxShadow: '0 0 6px rgba(2,102,72,0.55)',
                }}
              />
            )}
            <Icon
              className="shrink-0 transition-all duration-200"
              style={{
                width: isActive ? 22 : 20,
                height: isActive ? 22 : 20,
                strokeWidth: isActive ? 2.2 : 1.8,
              }}
              aria-hidden
            />
            <span
              className="truncate transition-all duration-200"
              style={{
                fontSize: isActive ? 10.5 : 10,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: isActive ? '-0.01em' : '0',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
