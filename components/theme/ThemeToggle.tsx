'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isDark = mounted ? resolvedTheme !== 'light' : false

  /* Track */
  const trackBg = onDark
    ? isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.10)'
    : isDark ? 'rgba(2,102,72,0.15)'   : 'rgba(0,0,0,0.07)'

  const trackBorder = onDark
    ? 'rgba(255,255,255,0.20)'
    : isDark ? 'rgba(2,102,72,0.25)' : 'rgba(0,0,0,0.10)'

  /* Thumb */
  const thumbBg = isDark
    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'

  const thumbShadow = onDark
    ? '0 2px 8px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.25)'
    : isDark
      ? '0 2px 8px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.30)'
      : '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.10)'

  /* Icon inside thumb */
  const iconColor = isDark ? '#facc15' : '#f59e0b'   /* Sun: amber */
  const moonColor = '#a5b4fc'                          /* Moon: soft indigo */

  return (
    <>
      <style>{`
        .tt-track {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 50px;
          height: 26px;
          border-radius: 999px;
          cursor: pointer;
          flex-shrink: 0;
          border: none;
          padding: 0;
          transition: background 0.3s ease;
        }
        .tt-track:focus-visible {
          outline: 2px solid rgba(255,255,255,0.55);
          outline-offset: 2px;
        }
        .tt-track:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Small dots inside track (opposite side of thumb) */
        .tt-dot {
          position: absolute;
          border-radius: 50%;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* Thumb */
        .tt-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.25s ease,
                      box-shadow 0.25s ease;
          pointer-events: none;
        }
        .tt-icon {
          transition: opacity 0.2s ease, transform 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="tt-track"
        style={{
          background: trackBg,
          boxShadow: `inset 0 0 0 1px ${trackBorder}`,
        }}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        disabled={!mounted}
      >
        {/* Hint dot on the opposite end */}
        <span
          className="tt-dot"
          style={{
            width: 4,
            height: 4,
            background: isDark ? '#a5b4fc' : '#f59e0b',
            opacity: 0.55,
            right: isDark ? 'auto' : 6,
            left:  isDark ? 6 : 'auto',
            transform: 'scale(1)',
          }}
        />

        {/* Sliding thumb with icon inside */}
        <span
          className="tt-thumb"
          style={{
            transform: isDark ? 'translateX(24px)' : 'translateX(0px)',
            background: thumbBg,
            boxShadow: thumbShadow,
          }}
        >
          <span className="tt-icon">
            {isDark
              ? <Moon  style={{ width: 11, height: 11, color: moonColor, strokeWidth: 2 }} />
              : <Sun   style={{ width: 12, height: 12, color: iconColor, strokeWidth: 2.2 }} />
            }
          </span>
        </span>
      </button>
    </>
  )
}
