'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ArrowRight, Lock, X } from 'lucide-react'

/**
 * OnboardingGate (client)
 *
 * Quando o usuário pula o cadastro, `profiles.onboarding_completed_at` fica
 * NULL. O dashboard fica visível mas completamente bloqueado para interação:
 *
 *  1. Glass pane invisível sobre todo o conteúdo — qualquer clique abre o modal
 *  2. Banner persistente no topo com CTA "Finalizar"
 *  3. API routes retornam 403 + X-Onboarding-Required → interceptor mostra modal
 *  4. guard() para wrap explícito em callbacks
 */

interface OnboardingGateContext {
  required: boolean
  guard: <T>(fn: () => T | Promise<T>) => T | Promise<T> | undefined
  show: () => void
  hide: () => void
}

const Ctx = createContext<OnboardingGateContext>({
  required: false,
  guard: (fn) => fn(),
  show: () => {},
  hide: () => {},
})

export function useOnboardingGate() {
  return useContext(Ctx)
}

interface ProviderProps {
  required: boolean       // onboarding_completed_at IS NULL
  nextHref: string        // /onboarding/pf or /onboarding/empresa
  children: React.ReactNode
}

// Altura do banner de aviso (px) — usada para posicionar o glass pane
const BANNER_HEIGHT = 44

export function OnboardingGateProvider({
  required,
  nextHref,
  children,
}: ProviderProps) {
  const [open, setOpen] = useState(false)
  const patchedRef = useRef(false)

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])

  // ── Global fetch interceptor ──────────────────────────────────────────────
  // API routes de mutação retornam 403 + X-Onboarding-Required quando o
  // cadastro está pendente. Capturamos aqui para cobrir qualquer fetch que
  // não usou guard() explicitamente.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (patchedRef.current) return
    patchedRef.current = true

    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const res = await originalFetch(...args)
      try {
        if (res.status === 403 && res.headers.get('x-onboarding-required') === '1') {
          setOpen(true)
        }
      } catch { /* noop */ }
      return res
    }

    return () => {
      window.fetch = originalFetch
      patchedRef.current = false
    }
  }, [])

  const guard = useCallback(
    <T,>(fn: () => T | Promise<T>): T | Promise<T> | undefined => {
      if (required) {
        setOpen(true)
        return undefined
      }
      return fn()
    },
    [required]
  )

  return (
    <Ctx.Provider value={{ required, guard, show, hide }}>
      {children}

      {/* ── Banner persistente ─────────────────────────────────────────────
          Sempre visível no topo quando cadastro pendente. z-40 para ficar
          acima do glass pane (z-[38]) e do modal (z-[90] quando aberto).   */}
      {required && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          style={{
            background: 'linear-gradient(90deg, #f59e0b22, #f59e0b0e)',
            borderBottom: '1px solid #f59e0b40',
            backdropFilter: 'blur(10px)',
            height: `${BANNER_HEIGHT}px`,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="h-4 w-4 shrink-0" style={{ color: '#f59e0b' }} />
            <span className="truncate text-app">
              <strong className="font-semibold">Cadastro pendente.</strong>{' '}
              <span className="text-app-soft">Finalize para liberar todas as funções.</span>
            </span>
          </div>
          <a
            href={nextHref}
            className="shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#f59e0b' }}
          >
            Finalizar
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* ── Glass pane ─────────────────────────────────────────────────────
          Camada invisível sobre o conteúdo do dashboard que captura TODOS
          os cliques quando o cadastro está pendente. Fica abaixo do banner
          (z-40) mas acima de qualquer conteúdo normal (z < 38).
          Ao clicar em qualquer lugar do dashboard → abre o modal.           */}
      {required && !open && (
        <div
          aria-hidden="true"
          onClick={show}
          style={{
            position: 'fixed',
            top: `${BANNER_HEIGHT}px`,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 38,
            cursor: 'not-allowed',
            // totalmente transparente — só captura eventos
            background: 'transparent',
          }}
        />
      )}

      {/* ── Modal de bloqueio ──────────────────────────────────────────────
          Abre quando guard() é chamado, quando o glass pane é clicado, ou
          quando uma API route retorna 403 + X-Onboarding-Required.          */}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)' }}
          onClick={hide}
        >
          <div
            className="panel-card w-full max-w-sm rounded-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'color-mix(in oklab, #f59e0b 15%, transparent)',
                  border: '1px solid color-mix(in oklab, #f59e0b 30%, transparent)',
                }}
              >
                <Lock className="h-5 w-5" style={{ color: '#f59e0b' }} />
              </div>
              <button
                onClick={hide}
                className="text-app-soft hover:text-app transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-extrabold text-app">
                Finalize seu cadastro primeiro
              </h2>
              <p className="text-sm text-app-soft leading-relaxed">
                O painel está bloqueado até você completar o cadastro. Leva menos de 2 minutos e libera tudo: despesas, receitas, investimentos e IA.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={hide}
                className="flex-1 h-10 rounded-[10px] text-sm font-medium text-app-soft transition-colors hover:text-app"
                style={{ border: '1px solid var(--panel-border)', background: 'transparent' }}
              >
                Ver o painel
              </button>
              <a
                href={nextHref}
                className="flex-1 h-10 rounded-[10px] text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  boxShadow: '0 4px 20px color-mix(in oklab, #f59e0b 25%, transparent)',
                }}
              >
                Finalizar cadastro
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
