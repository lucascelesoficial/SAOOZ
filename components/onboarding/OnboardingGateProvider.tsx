'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, X } from 'lucide-react'

/**
 * OnboardingGate (client)
 *
 * Quando o usuário pula o cadastro, `profiles.onboarding_completed_at` fica
 * NULL. Qualquer ação de mutação (criar transação, salvar empresa, etc.)
 * precisa passar por este gate antes de executar.
 *
 * Uso:
 *   const gate = useOnboardingGate()
 *   gate.guard(() => createTransaction(...))   // executa ou bloqueia
 *
 * Também expõe `required` (boolean) — páginas podem mostrar UX específico.
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
  required: boolean                  // onboarding_completed_at IS NULL
  nextHref: string                   // /onboarding/pf or /onboarding/empresa
  children: React.ReactNode
}

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
  // Server-side rotas de mutação retornam 403 + header `X-Onboarding-Required`
  // quando o cadastro está pendente. Aqui detectamos e abrimos o modal — isso
  // cobre qualquer fetch (formulários, context providers, componentes que não
  // usaram guard() explicitamente).
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

      {/* Persistent top banner — sempre visível quando cadastro pendente */}
      {required && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          style={{
            background: 'linear-gradient(90deg, #f59e0b20, #f59e0b10)',
            borderBottom: '1px solid #f59e0b40',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#f59e0b' }} />
            <span className="truncate text-app">
              <strong className="font-semibold">Cadastro pendente.</strong>{' '}
              <span className="text-app-soft">Finalize para liberar todas as funções.</span>
            </span>
          </div>
          <a
            href={nextHref}
            className="shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-white transition-colors"
            style={{ background: '#f59e0b' }}
          >
            Finalizar
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Blocking modal — appears when guard() is triggered */}
      {open && required && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={hide}
        >
          <div
            className="panel-card w-full max-w-sm rounded-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in oklab, #f59e0b 15%, transparent)',
                  border: '1px solid color-mix(in oklab, #f59e0b 30%, transparent)',
                }}
              >
                <AlertCircle className="h-5 w-5" style={{ color: '#f59e0b' }} />
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
              <p className="text-sm text-app-soft">
                Pra criar, atualizar ou operar seu painel, precisamos que você complete
                o cadastro de PF ou PJ. Leva menos de 2 minutos.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={hide}
                className="flex-1 h-10 rounded-[10px] text-sm font-medium text-app-soft transition-colors hover:text-app"
                style={{ border: '1px solid var(--panel-border)', background: 'transparent' }}
              >
                Agora não
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
