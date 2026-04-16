'use client'

/**
 * MfaSection — TOTP two-factor authentication management
 *
 * States:
 *  loading   — fetching current MFA status
 *  disabled  — MFA not set up (shows Activate button)
 *  enrolling — QR code + secret displayed, waiting for user to verify OTP
 *  enabled   — MFA active (shows Disable button with StepUpDialog guard)
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2, ShieldCheck, ShieldOff, ShieldAlert, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type MfaState = 'loading' | 'disabled' | 'enrolling' | 'enabled'

export function MfaSection() {
  const [state, setState] = useState<MfaState>('loading')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [working, setWorking] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Check current MFA status ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === 'verified')
      if (verified) {
        setFactorId(verified.id)
        setState('enabled')
      } else {
        setState('disabled')
      }
    })
  }, [])

  // ── Start enrollment ──────────────────────────────────────────────────
  async function handleEnroll() {
    setWorking(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setWorking(false)
    if (error || !data) {
      toast.error('Erro ao iniciar MFA', { description: 'Tente novamente.' })
      return
    }
    setFactorId(data.id)
    setQrUrl(data.totp.qr_code)
    setSecret(data.totp.secret)
    setState('enrolling')
    setOtp('')
    setOtpError('')
  }

  // ── Verify OTP and complete enrollment ────────────────────────────────
  async function handleVerify() {
    if (!factorId) return
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Digite exatamente 6 dígitos')
      return
    }
    setOtpError('')
    setWorking(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: otp })
    setWorking(false)
    if (error) {
      setOtpError('Código incorreto. Verifique e tente novamente.')
      return
    }
    // Log audit event (fire-and-forget)
    fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'auth.mfa_enrolled' }),
    }).catch(() => undefined)
    toast.success('Autenticação em dois fatores ativada!')
    setQrUrl(null)
    setSecret(null)
    setOtp('')
    setState('enabled')
  }

  // ── Disable MFA ───────────────────────────────────────────────────────
  async function handleDisable() {
    if (!factorId) return
    setWorking(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    setWorking(false)
    if (error) {
      toast.error('Erro ao desativar MFA', { description: error.message })
      return
    }
    // Log audit event (fire-and-forget)
    fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'auth.mfa_disabled' }),
    }).catch(() => undefined)
    toast.success('Autenticação em dois fatores desativada.')
    setFactorId(null)
    setState('disabled')
  }

  // ── Cancel enrollment ─────────────────────────────────────────────────
  async function handleCancelEnroll() {
    // Unenroll the pending (unverified) factor to clean up
    if (factorId) {
      const supabase = createClient()
      await supabase.auth.mfa.unenroll({ factorId }).catch(() => undefined)
    }
    setFactorId(null)
    setQrUrl(null)
    setSecret(null)
    setOtp('')
    setOtpError('')
    setState('disabled')
  }

  async function copySecret() {
    if (!secret) return
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-app-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando status...
      </div>
    )
  }

  if (state === 'enabled') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-sm"
          style={{ background: '#22c55e10', border: '1px solid #22c55e30' }}>
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#22c55e]" />
          <span className="text-[#22c55e] font-medium">Autenticação em dois fatores ativa</span>
        </div>
        <p className="text-xs text-app-soft">
          Seu aplicativo autenticador (Google Authenticator, Authy etc.) está configurado.
          Você precisará de um código de 6 dígitos a cada login.
        </p>
        <Button
          variant="outline"
          disabled={working}
          onClick={handleDisable}
          className="w-full rounded-[8px] text-sm"
          style={{ borderColor: '#f8717140', color: '#f87171' }}
        >
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><ShieldOff className="h-4 w-4 mr-2" />Desativar 2FA</>
          )}
        </Button>
      </div>
    )
  }

  if (state === 'enrolling') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-sm"
          style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#f59e0b]" />
          <span className="text-[#f59e0b] font-medium">Configure seu aplicativo autenticador</span>
        </div>

        {/* QR Code */}
        {qrUrl && (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-[10px] p-3 bg-white inline-block">
              <Image
                src={qrUrl}
                alt="QR Code MFA"
                width={160}
                height={160}
                unoptimized
              />
            </div>
            <p className="text-xs text-app-soft text-center">
              Escaneie com Google Authenticator, Authy ou outro app compatível com TOTP.
            </p>
          </div>
        )}

        {/* Manual secret */}
        {secret && (
          <div className="space-y-1.5">
            <Label className="text-app-base text-xs">Ou insira a chave manualmente</Label>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 rounded-[8px] px-3 py-2 text-xs font-mono tracking-widest break-all"
                style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)', color: 'var(--text-strong)' }}
              >
                {secret}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="shrink-0 p-2 rounded-[8px] transition-colors"
                style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)', color: 'var(--text-base)' }}
                aria-label="Copiar chave"
              >
                {copied ? <Check className="h-4 w-4 text-[#22c55e]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* OTP verification */}
        <div className="space-y-1.5">
          <Label className="text-app-base">Código de verificação</Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError('') }}
            className="rounded-[8px] font-mono tracking-[0.5em] text-center text-lg"
            style={{
              background: 'var(--panel-bg-soft)',
              borderColor: otpError ? '#f87171' : 'var(--panel-border)',
              color: 'var(--text-strong)',
            }}
            autoComplete="one-time-code"
          />
          {otpError && <p className="text-[#f87171] text-xs">{otpError}</p>}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancelEnroll}
            disabled={working}
            className="flex-1 rounded-[8px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerify}
            disabled={working || otp.length !== 6}
            className="flex-1 text-white rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ativar 2FA'}
          </Button>
        </div>
      </div>
    )
  }

  // disabled state
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-sm"
        style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
        <ShieldOff className="h-4 w-4 shrink-0 text-app-soft" />
        <span className="text-app-base">Autenticação em dois fatores não configurada</span>
      </div>
      <p className="text-xs text-app-soft">
        Adicione uma camada extra de segurança. Após ativar, você precisará de um código
        do aplicativo autenticador a cada login.
      </p>
      <Button
        onClick={handleEnroll}
        disabled={working}
        className="w-full text-white rounded-[8px]"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
      >
        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <><ShieldCheck className="h-4 w-4 mr-2" />Ativar autenticação 2FA</>
        )}
      </Button>
    </div>
  )
}
