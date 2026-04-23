'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Rocket,
  Sparkles,
} from 'lucide-react'
import { useOnboardingProgress } from '@/lib/hooks/useOnboardingProgress'
import { trackEvent, EVENTS } from '@/lib/posthog/client'

interface OnboardingChecklistProps {
  scope:             'pf' | 'pj'
  userId:            string
  activeBusinessId?: string | null
}

export function OnboardingChecklist({
  scope,
  userId,
  activeBusinessId,
}: OnboardingChecklistProps) {
  const {
    steps,
    loading,
    dismissed,
    dismiss,
    completed,
    total,
    allDone,
    percentage,
  } = useOnboardingProgress({ scope, userId, activeBusinessId })

  // Track when checklist is completed
  useEffect(() => {
    if (allDone) {
      trackEvent(EVENTS.ONBOARDING_DONE, { scope })
    }
  }, [allDone, scope])

  // Don't render if dismissed, loading, or no steps
  if (dismissed || loading || total === 0) return null

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-[14px]"
      style={{
        background:  'var(--panel-bg)',
        border:      '1px solid var(--panel-border)',
        boxShadow:   '0 2px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Animated gradient top bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg,
            var(--accent-blue) 0%,
            var(--accent-cyan) ${percentage}%,
            var(--panel-border) ${percentage}%
          )`,
          transition: 'background 600ms ease',
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: 'color-mix(in oklab, var(--accent-blue) 15%, transparent)' }}
            >
              {allDone
                ? <Sparkles className="h-4.5 w-4.5" style={{ color: 'var(--accent-blue)' }} />
                : <Rocket   className="h-4.5 w-4.5" style={{ color: 'var(--accent-blue)' }} />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-app">
                {allDone
                  ? 'Setup completo! 🎉'
                  : 'Primeiros passos'}
              </p>
              <p className="text-xs text-app-soft">
                {allDone
                  ? 'Você configurou tudo. O Pearfy está trabalhando para você.'
                  : `${completed} de ${total} etapas concluídas`}
              </p>
            </div>
          </div>

          {/* Progress ring + dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Circular progress */}
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="var(--panel-border)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="var(--accent-blue)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 0.88} 88`}
                  style={{ transition: 'stroke-dasharray 600ms ease' }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
                style={{ color: 'var(--accent-blue)' }}
              >
                {percentage}%
              </span>
            </div>

            <button
              onClick={() => {
                trackEvent('onboarding_checklist_dismissed', { scope })
                dismiss()
              }}
              className="rounded-full p-1 text-app-soft transition-colors hover:text-app"
              aria-label="Fechar checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid gap-2 sm:grid-cols-2">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.href}
              onClick={() => {
                if (!step.completed) {
                  trackEvent(EVENTS.ONBOARDING_STEP, {
                    step:  step.id,
                    scope,
                  })
                }
              }}
              className="group flex items-center gap-3 rounded-[10px] p-3 transition-all"
              style={{
                background: step.completed
                  ? 'color-mix(in oklab, var(--accent-green, #026648) 6%, transparent)'
                  : 'color-mix(in oklab, var(--accent-blue) 5%, transparent)',
                border: `1px solid ${
                  step.completed
                    ? 'color-mix(in oklab, var(--accent-green, #026648) 20%, transparent)'
                    : 'var(--panel-border)'
                }`,
              }}
            >
              {step.completed ? (
                <CheckCircle2
                  className="h-5 w-5 shrink-0"
                  style={{ color: 'var(--accent-green, #026648)' }}
                />
              ) : (
                <Circle
                  className="h-5 w-5 shrink-0 transition-colors group-hover:text-[#026648]"
                  style={{ color: 'var(--text-muted, #4a6080)' }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-semibold truncate"
                  style={{
                    color: step.completed
                      ? 'var(--accent-green, #026648)'
                      : 'var(--text-strong)',
                    textDecoration: step.completed ? 'line-through' : 'none',
                    opacity: step.completed ? 0.7 : 1,
                  }}
                >
                  {step.label}
                </p>
                {!step.completed && (
                  <p className="text-[11px] text-app-soft truncate mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
              {!step.completed && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-app-soft transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
          ))}
        </div>

        {/* All done CTA */}
        {allDone && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={dismiss}
              className="text-xs font-semibold transition-colors"
              style={{ color: 'var(--accent-blue)' }}
            >
              Fechar este painel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
