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

  const isPJ = pathname.startsWith('/empresa')
  const items = isPJ ? PJ_ITEMS : PF_ITEMS

  return (
    <nav
      className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 md:hidden"
      style={{ background: 'var(--surface-bg)', borderTop: '1px solid var(--panel-border)' }}
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
            className="min-w-0 rounded-[8px] px-3 py-1 flex flex-col items-center gap-1 transition-colors"
            style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-soft)' }}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
