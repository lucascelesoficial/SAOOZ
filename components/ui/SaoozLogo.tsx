'use client'

import { useId } from 'react'

interface Props { size?: 'sm' | 'md' | 'lg' | 'xl' }

const ICON_PX = { sm: 28, md: 36, lg: 52, xl: 72 } as const
const WORD_H  = { sm: 26, md: 36, lg: 50, xl: 68 } as const

/* ─────────────────────────────────────────────────────────────
   SaoozIcon — ícone geométrico S do brand guide SAOOZ 2025
   Hexagonal faceted S shape, azul principal #2563EB
───────────────────────────────────────────────────────────── */
export function SaoozIcon({ size = 36, light = false }: { size?: number; light?: boolean }) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}a`} x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={light ? '#93C5FD' : '#60A5FA'} />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>

      {/* ── Topo do S: barra superior + faceta direita ── */}
      {/* Barra superior */}
      <polygon points="14,10 86,10 86,26 14,26" fill={`url(#${id}a)`} />
      {/* Faceta superior-direita (diagonal descendo) */}
      <polygon points="70,26 86,26 86,50 55,50" fill={`url(#${id}b)`} opacity="0.85" />

      {/* ── Conector central ── */}
      <polygon points="14,50 86,50 70,62 14,62" fill={`url(#${id}a)`} opacity="0.9" />

      {/* ── Base do S: faceta esquerda + barra inferior ── */}
      {/* Faceta inferior-esquerda (diagonal subindo) */}
      <polygon points="14,62 45,62 14,74" fill={`url(#${id}b)`} opacity="0.85" />
      {/* Barra inferior */}
      <polygon points="14,74 86,74 86,90 14,90" fill={`url(#${id}a)`} />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   NucleusIcon — mantido para uso no Assistente de IA
───────────────────────────────────────────────────────────── */
export function NucleusIcon({ size = 40 }: { size?: number }) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`${id}g1`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="b1"/>
          <feGaussianBlur stdDeviation="8" result="b2" in="SourceGraphic"/>
          <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${id}g2`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${id}g3`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`${id}cg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="1"/>
          <stop offset="60%" stopColor="#67e8f9" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="1" fill="none" filter={`url(#${id}g1)`} strokeDasharray="6 10">
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="18s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="30" stroke="#60a5fa" strokeWidth="1.5" fill="none" filter={`url(#${id}g2)`}>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="-360 40 40" dur="12s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="23" stroke="#818cf8" strokeWidth="2" fill="none" filter={`url(#${id}g2)`}>
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="r" values="23;24;23" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="16" stroke="#a78bfa" strokeWidth="2.5" fill="none" filter={`url(#${id}g2)`}>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="7s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="9.5" stroke="#c084fc" strokeWidth="2" fill="none" filter={`url(#${id}g2)`}>
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="7" fill={`url(#${id}cg)`} opacity="0.3" filter={`url(#${id}g3)`}>
        <animate attributeName="r" values="7;11;7" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="40" r="3.5" fill="#a5f3fc" filter={`url(#${id}g3)`}>
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#a5f3fc;#ffffff;#a5f3fc" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   NucleusOrb — state-driven animated orb (chat/assistente)
───────────────────────────────────────────────────────────── */
export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

const ORB_CFG: Record<OrbState, {
  filter: string; scale: string; glow: string
  ringColor: string; ringOpacity: number; anim: string
}> = {
  idle:      { filter: 'none', scale: '1', glow: '#a78bfa18', ringColor: 'transparent', ringOpacity: 0, anim: 'none' },
  listening: { filter: 'brightness(1.7) saturate(1.6)', scale: '1.12', glow: '#3b82f655', ringColor: '#3b82f6', ringOpacity: 0.9, anim: 'orb-ping 1s ease-out infinite' },
  thinking:  { filter: 'brightness(0.85) sepia(0.4)', scale: '1.06', glow: '#f59e0b40', ringColor: '#f59e0b', ringOpacity: 0.55, anim: 'orb-think 1.8s ease-in-out infinite' },
  speaking:  { filter: 'brightness(1.4) hue-rotate(-18deg)', scale: '1.1', glow: '#22c55e45', ringColor: '#22c55e', ringOpacity: 0.7, anim: 'orb-wave 0.7s ease-out infinite' },
}

export function NucleusOrb({ size = 64, state = 'idle' }: { size?: number; state?: OrbState }) {
  const c = ORB_CFG[state]
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <style>{`
        @keyframes orb-ping  { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(1.9);opacity:0} }
        @keyframes orb-think { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.35);opacity:.75} }
        @keyframes orb-wave  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.7);opacity:0} }
      `}</style>
      <div style={{ position: 'absolute', inset: -size * 0.25, borderRadius: '50%', background: `radial-gradient(circle, ${c.glow} 0%, transparent 65%)`, transition: 'all 0.5s ease', pointerEvents: 'none' }} />
      {state !== 'idle' && [0, 0.28, 0.56].map((delay, i) => (
        <div key={i} style={{ position: 'absolute', inset: -(4 + i * 8), borderRadius: '50%', border: `${1.8 - i * 0.4}px solid ${c.ringColor}`, opacity: c.ringOpacity * (1 - i * 0.3), animation: c.anim, animationDelay: `${delay}s`, pointerEvents: 'none' }} />
      ))}
      <div style={{ transform: `scale(${c.scale})`, filter: c.filter, transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), filter 0.45s ease', position: 'relative', zIndex: 1 }}>
        <NucleusIcon size={size} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SaoozLogo — ícone com container (sidebar, topbar)
   Fundo azul brand com ícone S branco
───────────────────────────────────────────────────────────── */
export function SaoozLogo({ size = 'md' }: Props) {
  const px = ICON_PX[size]
  const iconPx = Math.round(px * 0.68)

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: px,
        height: px,
        borderRadius: Math.round(px * 0.26),
        background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
        flexShrink: 0,
      }}
    >
      {/* S branco sobre fundo azul */}
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden
      >
        <polygon points="12,10 88,10 88,27 12,27" fill="white" opacity="0.95" />
        <polygon points="72,27 88,27 88,52 54,52" fill="white" opacity="0.75" />
        <polygon points="12,52 88,52 72,64 12,64" fill="white" opacity="0.90" />
        <polygon points="12,64 46,64 12,76" fill="white" opacity="0.75" />
        <polygon points="12,76 88,76 88,90 12,90" fill="white" opacity="0.95" />
      </svg>
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   SaoozWordmark — logo + texto "SAOOZ"
───────────────────────────────────────────────────────────── */
export function SaoozWordmark({ size = 'md' }: Props) {
  const h      = WORD_H[size]
  const fSize  = Math.round(h * 0.72)
  const iconPx = ICON_PX[size]

  return (
    <span
      className="inline-flex items-center select-none"
      style={{ gap: Math.round(h * 0.28) }}
      aria-label="SAOOZ"
    >
      <SaoozLogo size={size} />
      <span
        style={{
          fontSize:      fSize,
          fontWeight:    800,
          fontFamily:    "'Inter', system-ui, sans-serif",
          letterSpacing: '-0.02em',
          lineHeight:    1,
          color:         'var(--text-strong)',
        }}
      >
        SAOOZ
      </span>
    </span>
  )
}
