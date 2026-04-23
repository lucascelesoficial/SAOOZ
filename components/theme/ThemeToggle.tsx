'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isDark = mounted ? resolvedTheme !== 'light' : false

  const trackBg = onDark
    ? isDark
      ? 'rgba(255,255,255,0.18)'
      : 'rgba(255,255,255,0.12)'
    : isDark
      ? 'rgba(2,102,72,0.18)'
      : 'rgba(0,0,0,0.08)'

  const thumbBg = onDark
    ? '#ffffff'
    : isDark
      ? '#026648'
      : '#ffffff'

  const thumbShadow = onDark
    ? '0 1px 4px rgba(0,0,0,0.35)'
    : isDark
      ? '0 1px 4px rgba(2,102,72,0.4)'
      : '0 1px 4px rgba(0,0,0,0.18)'

  const iconColor = onDark
    ? isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.45)'
    : isDark ? '#026648' : '#94a3b8'

  return (
    <>
      <style>{`
        .theme-track {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 52px;
          height: 28px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.25s ease;
          flex-shrink: 0;
          border: none;
          padding: 0;
        }
        .theme-track:focus-visible {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
        }
        .theme-icons {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
          pointer-events: none;
        }
        .theme-thumb {
          position: absolute;
          top: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease, box-shadow 0.25s ease;
        }
      `}</style>
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="theme-track"
        style={{ background: trackBg }}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        disabled={!mounted}
      >
        {/* Icons: Sun left, Moon right */}
        <span className="theme-icons">
          <Sun
            style={{
              width: 10,
              height: 10,
              color: iconColor,
              opacity: isDark ? 0.5 : 1,
              transition: 'opacity 0.25s',
            }}
          />
          <Moon
            style={{
              width: 10,
              height: 10,
              color: iconColor,
              opacity: isDark ? 1 : 0.5,
              transition: 'opacity 0.25s',
            }}
          />
        </span>

        {/* Sliding thumb */}
        <span
          className="theme-thumb"
          style={{
            transform: isDark ? 'translateX(27px)' : 'translateX(3px)',
            background: thumbBg,
            boxShadow: thumbShadow,
          }}
        />
      </button>
    </>
  )
}
