'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle2, Copy, QrCode, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatters'
import { getDurationLabel } from '@/lib/billing/plans'
import type { BillingDuration } from '@/lib/billing/plans'

export function PaymentPageClient() {
  const params = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const plan = params.get('plan') ?? 'pf'
  const duration = Number(params.get('duration') ?? 1) as BillingDuration
  const method = params.get('method') ?? 'pix'
  const total = Number(params.get('total') ?? 0)
  const pixKey = params.get('pixKey') ?? null
  const pixName = params.get('pixName') ?? 'SAOOZ'

  function copyPix() {
    if (!pixKey) return
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    toast.success('Chave PIX copiada!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function confirmPayment() {
    setConfirming(true)
    toast.success('Pagamento enviado para revisão', {
      description: 'Seu plano será ativado em até 1 hora após confirmação do PIX.',
    })
    await new Promise((r) => setTimeout(r, 1500))
    const redirectTo = plan === 'pj' ? '/empresa' : '/central'
    router.push(`/onboarding/documento?plan=${plan}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/planos" className="mb-6 inline-flex items-center gap-2 text-sm text-app-soft hover:text-app">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos planos
      </Link>

      <div className="panel-card p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in oklab, var(--accent-blue) 12%, transparent)' }}>
            {method === 'pix' ? <QrCode className="h-7 w-7" style={{ color: 'var(--accent-blue)' }} /> : <CreditCard className="h-7 w-7" style={{ color: 'var(--accent-blue)' }} />}
          </div>
          <h1 className="text-xl font-bold text-app">Finalizar pagamento</h1>
          <p className="mt-1 text-sm text-app-soft">
            Plano {plan.toUpperCase()} — {getDurationLabel(duration)}
          </p>
        </div>

        <div className="mb-6 rounded-[12px] border p-4 text-center" style={{ borderColor: 'var(--panel-border)', background: 'var(--panel-bg-soft)' }}>
          <p className="text-xs uppercase tracking-wider text-app-soft">Total a pagar</p>
          <p className="mt-1 text-3xl font-bold text-app">{formatCurrency(total)}</p>
          <p className="mt-1 text-xs text-app-soft">{getDurationLabel(duration)} · pagamento único</p>
        </div>

        {method === 'pix' && (
          <div className="space-y-4">
            {pixKey ? (
              <>
                <div className="rounded-[12px] border p-4" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="mb-2 text-xs uppercase tracking-wider text-app-soft">Chave PIX</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 break-all font-mono text-sm text-app">{pixKey}</p>
                    <button
                      onClick={copyPix}
                      className="shrink-0 rounded-[6px] p-2 transition-colors"
                      style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-[#22c55e]" /> : <Copy className="h-4 w-4 text-app-soft" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-app-soft">Beneficiário: {pixName}</p>
                </div>

                <div className="space-y-2 text-sm text-app-soft">
                  <p>1. Abra o app do seu banco e acesse o PIX.</p>
                  <p>2. Copie a chave acima e insira o valor exato.</p>
                  <p>3. Confirme o pagamento e clique em &quot;Já paguei&quot;.</p>
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={confirming}
                  className="flex h-12 w-full items-center justify-center rounded-[12px] text-sm font-bold text-white transition-all disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
                >
                  {confirming ? 'Enviando confirmação...' : 'Já paguei — confirmar'}
                </button>
              </>
            ) : (
              <div className="rounded-[12px] border p-4 text-center text-sm text-app-soft" style={{ borderColor: 'var(--panel-border)' }}>
                <p>Chave PIX não configurada pelo administrador.</p>
                <p className="mt-1">Entre em contato via suporte para finalizar a ativação.</p>
              </div>
            )}
          </div>
        )}

        {method === 'card' && (
          <div className="space-y-4">
            <div className="rounded-[12px] border p-4 text-center text-sm text-app-soft" style={{ borderColor: 'var(--panel-border)' }}>
              <p>Pagamento via cartão será processado pelo gateway configurado.</p>
              <p className="mt-2">Se o checkout não abriu automaticamente, entre em contato.</p>
            </div>
            <Link
              href="/planos"
              className="flex h-12 w-full items-center justify-center rounded-[12px] text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
            >
              Voltar aos planos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
