'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ArrowRight, Lock, X } from 'lucide-react'

/**
 * OnboardingGate (client)
 *
 * Quando o usuário pula o cadastro o dashboard fica VISÍVEL e navegável,
 * mas qualquer ação de mutação é bloqueada:
 *
 *  1. Fetch interceptor — bloqueia ANTES da requisição sair:
 *     a) Respostas 403 + X-Onboarding-Required das API routes (/api/*)
 *     b) Chamadas de mutação diretas ao Supabase (POST/PATCH/DELETE/PUT
 *        para a URL do Supabase) — cobre páginas que usam createClient()
 *  2. guard() — wrap explícito para callbacks de submit
 *  3. Banner persistente no topo com CTA "Finalizar"
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

// Métodos HTTP que representam mutações
const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export function OnboardingGateProvider({
  required,
  nextHref,
  children,
}: ProviderProps) {
  const [open, setOpen] = useState(false)
  const patchedRef = useRef(false)
  // Referência mutável para `required` — o closure do interceptor captura
  // apenas no mount, mas precisa do valor atual em cada chamada.
  const requiredRef = useRef(required)
  useEffect(() => { requiredRef.current = required }, [required])

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (patchedRef.current) return
    patchedRef.current = true

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : null

    const originalFetch = window.fetch

    window.fetch = async (input, init, ...rest) => {
      // Detecta URL da requisição
      const url = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url ?? ''

      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()

      // ── Bloqueia mutations diretas ao Supabase ──────────────────────────
      // Quando uma página chama supabase.from('x').insert/update/delete(),
      // o SDK faz POST/PATCH/DELETE para <supabase_url>/rest/v1/*.
      // Se o cadastro está pendente, interceptamos ANTES de enviar.
      if (
        requiredRef.current &&
        MUTATION_METHODS.has(method) &&
        supabaseHost &&
        url.includes(supabaseHost) &&
        url.includes('/rest/v1/')
      ) {
        setOpen(true)
        // Retorna resposta fake de erro para que o código chamador
        // receba algo válido (não jogue exceção não tratada).
        return new Response(
          JSON.stringify({ error: 'Cadastro pendente', code: 'ONBOARDING_REQUIRED' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // ── Envia a requisição normalmente ──────────────────────────────────
      const res = await originalFetch(input, init, ...rest)

      // ── Detecta 403 das API routes do próprio servidor ──────────────────
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* ── Banner persistente ─────────────────────────────────────────── */}
      {required && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          style={{
            background: 'linear-gradient(90deg, #f59e0b22, #f59e0b0e)',
            borderBottom: '1px solid #f59e0b40',
            backdropFilter: 'blur(10px)',
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

      {/* ── Modal de bloqueio ──────────────────────────────────────────── */}
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
                Para criar, atualizar ou operar o painel, você precisa completar o cadastro. Leva menos de 2 minutos e libera tudo.
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
