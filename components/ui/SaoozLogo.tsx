'use client'

import Image from 'next/image'
import { useId } from 'react'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onDark?: boolean
}

const ICON_PX = { sm: 28, md: 40, lg: 56, xl: 80 } as const
const WORD_H = { sm: 26, md: 38, lg: 52, xl: 72 } as const

/* Legacy export name kept for compatibility across the app */
export function SaoozIcon({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/favicon.svg"
      alt="Pearfy"
      width={size}
      height={size}
      priority
      style={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        borderRadius: Math.round(size * 0.22),
        overflow: 'hidden',
      }}
    />
  )
}

/* Animated nucleus used in AI assistant */
export function NucleusIcon({ size = 40 }: { size?: number }) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`${id}g1`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="b1" />
          <feGaussianBlur stdDeviation="8" result="b2" in="SourceGraphic" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}g2`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}g3`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}cg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d0f5ec" stopOpacity="1" />
          <stop offset="60%" stopColor="#04a372" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#026648" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="40" cy="40" r="36" stroke="#026648" strokeWidth="1" fill="none" filter={`url(#${id}g1)`} strokeDasharray="6 10">
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="18s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="30" stroke="#026648" strokeWidth="1.5" fill="none" filter={`url(#${id}g2)`}>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="-360 40 40" dur="12s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="23" stroke="#04a372" strokeWidth="2" fill="none" filter={`url(#${id}g2)`}>
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="23;24;23" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="16" stroke="#04a372" strokeWidth="2.5" fill="none" filter={`url(#${id}g2)`}>
        <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="7s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="9.5" stroke="#a0dbc8" strokeWidth="2" fill="none" filter={`url(#${id}g2)`}>
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="7" fill={`url(#${id}cg)`} opacity="0.3" filter={`url(#${id}g3)`}>
        <animate attributeName="r" values="7;11;7" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="40" r="3.5" fill="#d0f5ec" filter={`url(#${id}g3)`}>
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="fill" values="#d0f5ec;#ffffff;#d0f5ec" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

const ORB_CFG: Record<
  OrbState,
  {
    filter: string
    scale: string
    glow: string
    ringColor: string
    ringOpacity: number
    anim: string
  }
> = {
  idle: {
    filter: 'none',
    scale: '1',
    glow: '#02664818',
    ringColor: 'transparent',
    ringOpacity: 0,
    anim: 'none',
  },
  listening: {
    filter: 'brightness(1.5) saturate(1.3)',
    scale: '1.12',
    glow: '#02664855',
    ringColor: '#026648',
    ringOpacity: 0.9,
    anim: 'orb-ping 1s ease-out infinite',
  },
  thinking: {
    filter: 'brightness(0.9) sepia(0.25)',
    scale: '1.06',
    glow: '#f59e0b40',
    ringColor: '#f59e0b',
    ringOpacity: 0.55,
    anim: 'orb-think 1.8s ease-in-out infinite',
  },
  speaking: {
    filter: 'brightness(1.3)',
    scale: '1.1',
    glow: '#22c55e45',
    ringColor: '#22c55e',
    ringOpacity: 0.7,
    anim: 'orb-wave 0.7s ease-out infinite',
  },
}

export function NucleusOrb({ size = 64, state = 'idle' }: { size?: number; state?: OrbState }) {
  const c = ORB_CFG[state]

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <style>{`
        @keyframes orb-ping { 0% { transform: scale(1); opacity: .8 } 100% { transform: scale(1.9); opacity: 0 } }
        @keyframes orb-think { 0%,100% { transform: scale(1); opacity: .4 } 50% { transform: scale(1.35); opacity: .75 } }
        @keyframes orb-wave { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(1.7); opacity: 0 } }
      `}</style>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.25,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.glow} 0%, transparent 65%)`,
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      {state !== 'idle' &&
        [0, 0.28, 0.56].map((delay, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: -(4 + i * 8),
              borderRadius: '50%',
              border: `${1.8 - i * 0.4}px solid ${c.ringColor}`,
              opacity: c.ringOpacity * (1 - i * 0.3),
              animation: c.anim,
              animationDelay: `${delay}s`,
              pointerEvents: 'none',
            }}
          />
        ))}
      <div
        style={{
          transform: `scale(${c.scale})`,
          filter: c.filter,
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), filter 0.45s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <NucleusIcon size={size} />
      </div>
    </div>
  )
}

export function SaoozLogo({ size = 'md' }: Props) {
  return <SaoozIcon size={ICON_PX[size]} />
}

export function SaoozWordmark({ size = 'md', onDark = false }: Props) {
  const h = WORD_H[size]
  const iconPx = Math.round(h * 1.3)
  const fSize = Math.round(h * 0.5)
  const gap = Math.round(h * 0.22)

  return (
    <span className="inline-flex items-center select-none" style={{ gap }} aria-label="Pearfy">
      <Image
        src="/favicon.svg"
        alt="Pearfy"
        width={iconPx}
        height={iconPx}
        priority
        style={{ width: iconPx, height: iconPx, display: 'block', flexShrink: 0, borderRadius: Math.round(iconPx * 0.22), overflow: 'hidden' }}
      />

      <span
        style={{
          fontSize: fSize,
          fontWeight: 800,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: onDark ? '#FFFFFF' : '#026648',
        }}
      >
        Pearfy
      </span>
    </span>
  )
}
