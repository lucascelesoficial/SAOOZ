'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="h-8 w-8 rounded-[8px] flex items-center justify-center"
        style={onDark ? { color: 'rgba(255,255,255,0.75)' } : { border: '1px solid var(--panel-border)', color: 'var(--text-soft)' }}
        aria-label="Alternar tema"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  const isDark = resolvedTheme !== 'light'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors"
      style={onDark
        ? { background: 'transparent', color: 'rgba(255,255,255,0.65)' }
        : { border: '1px solid var(--panel-border)', color: 'var(--text-base)' }
      }
      onMouseEnter={e => {
        if (onDark) {
          e.currentTarget.style.color = '#ffffff'
          e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
        }
      }}
      onMouseLeave={e => {
        if (onDark) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
