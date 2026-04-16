'use client'

/**
 * SAOOZ — Step-Up Authentication Dialog
 *
 * Requires the user to re-enter their password before executing a critical action.
 * This prevents session hijacking from causing irreversible damage.
 *
 * Usage:
 *   <StepUpDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirmed={() => handleDeleteAccount()}
 *     title="Confirmar exclusão de conta"
 *     description="Esta ação é irreversível. Confirme sua senha para continuar."
 *     confirmLabel="Excluir minha conta"
 *     confirmVariant="danger"
 *   />
 */

import { useState, useRef, useEffect } from 'react'
import { Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StepUpDialogProps {
  open: boolean
  onClose: () => void
  onConfirmed: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'warning'
}

export function StepUpDialog({
  open,
  onClose,
  onConfirmed,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
}: StepUpDialogProps) {
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [attempts, setAttempts]     = useState(0)
  const inputRef                    = useRef<HTMLInputElement>(null)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Lock out after 5 wrong attempts
  const isLocked = attempts >= 5

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!password || isLocked || loading) return

    setError('')
    setLoading(true)

    const supabase = createClient()

    // Get current user's email
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('Sessão inválida. Faça login novamente.')
      setLoading(false)
      return
    }

    // Re-authenticate — this is the actual verification
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })

    setLoading(false)

    if (authError) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 5) {
        setError('Muitas tentativas incorretas. Feche e tente novamente após aguardar.')
      } else {
        setError(`Senha incorreta. ${5 - newAttempts} tentativa(s) restante(s).`)
      }
      return
    }

    // Password confirmed — execute the critical action
    setPassword('')
    onClose()
    await onConfirmed()
  }

  if (!open) return null

  const confirmBg = confirmVariant === 'danger'
    ? 'linear-gradient(135deg, #dc2626, #991b1b)'
    : 'linear-gradient(135deg, #d97706, #92400e)'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stepup-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-sm rounded-[16px] border p-6 shadow-2xl"
          style={{
            background: 'var(--panel-bg)',
            borderColor: confirmVariant === 'danger'
              ? 'color-mix(in oklab, #f87171 30%, transparent)'
              : 'color-mix(in oklab, #fbbf24 30%, transparent)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: confirmVariant === 'danger' ? '#f8717115' : '#fbbf2415',
                border: `1px solid ${confirmVariant === 'danger' ? '#f8717130' : '#fbbf2430'}`,
              }}
            >
              <ShieldAlert
                className="h-4.5 w-4.5"
                style={{ color: confirmVariant === 'danger' ? '#f87171' : '#fbbf24' }}
              />
            </div>
            <div>
              <h2 id="stepup-title" className="text-base font-bold text-app">{title}</h2>
              <p className="mt-1 text-xs text-app-soft leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Lock notice */}
          {isLocked ? (
            <div
              className="rounded-[10px] px-4 py-3 text-sm text-[#f87171] mb-4"
              style={{ background: '#f8717110', border: '1px solid #f8717130' }}
            >
              Muitas tentativas. Feche este diálogo e tente novamente.
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="stepup-password" className="text-xs font-semibold uppercase tracking-wider text-app-soft">
                  Confirme sua senha
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="stepup-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    disabled={loading}
                    className="h-11 w-full rounded-[10px] px-4 pr-11 text-sm outline-none transition-all disabled:opacity-60"
                    style={{
                      background: 'var(--panel-bg-soft)',
                      border: error ? '1.5px solid #f87171' : '1.5px solid var(--panel-border)',
                      color: 'var(--text-strong)',
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-soft hover:text-app"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && <p className="text-xs text-[#f87171]">{error}</p>}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-10 rounded-[10px] text-sm font-medium text-app-soft transition-colors disabled:opacity-60"
                  style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="flex-1 h-10 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: confirmBg }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
