'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, KeyRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const G = '#026648'
const G_DARK = '#015038'

export default function AcessoEquipePage() {
  const router = useRouter()
  const [step, setStep]       = useState<'email' | 'code'>('email')
  const [email, setEmail]     = useState('')
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Insira um e-mail válido'); return
    }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) {
        setError('Não foi possível enviar o código. Tente novamente.')
        return
      }
      setStep('code')
    } catch {
      setError('Erro de conexão. Verifique sua internet.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 6) { setError('Digite o código de 6 dígitos'); return }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'email',
      })

      if (verifyError || !data.user) {
        setError('Código inválido ou expirado. Solicite um novo código.')
        return
      }

      // Accept all pending team invites for this email.
      // Types are cast because accept_pending_team_invites was added in migration 028
      // and the generated types haven't been regenerated yet.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: memberships } = await (supabase as any).rpc('accept_pending_team_invites') as {
        data: Array<{ business_id: string; owner_user_id: string }> | null
      }

      if (!memberships || memberships.length === 0) {
        // No invite found — sign out and show error
        await supabase.auth.signOut()
        setError('Nenhum convite ativo encontrado para este e-mail. Verifique com quem te convidou.')
        setStep('email')
        setCode('')
        return
      }

      // Configure profile for team member access.
      // is_team_member is cast because it was added in migration 028.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any)
        .update({
          is_team_member: true,
          mode: 'both',
          active_business_id: memberships[0].business_id,
        })
        .eq('id', data.user.id)

      // Go straight to the business module
      router.push('/empresa')

    } catch {
      setError('Erro ao confirmar acesso. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060d07',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image
            src="/pearfy-logo.svg"
            alt="PearFy"
            width={130}
            height={44}
            style={{ height: '44px', width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Card */}
        <div style={{
          background: '#0d1f10',
          border: '1px solid #1a3320',
          borderRadius: '16px',
          padding: '32px',
        }}>
          {/* Icon */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(2,102,72,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <Users style={{ width: '22px', height: '22px', color: '#4ade80' }} />
          </div>

          {step === 'email' ? (
            <form onSubmit={e => { void handleSendCode(e) }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                Acesso de Equipe
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
                Digite o e-mail que recebeu o convite. Enviaremos um código de acesso.
              </p>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Mail style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#64748b',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#060d07', border: '1px solid #1a3320',
                    borderRadius: '10px', padding: '11px 12px 11px 38px',
                    color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Enviar código de acesso
              </button>
            </form>

          ) : (
            <form onSubmit={e => { void handleVerifyCode(e) }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                Confirmar acesso
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
                Digite o código de 6 dígitos enviado para{' '}
                <strong style={{ color: '#e2e8f0' }}>{email}</strong>.
              </p>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <KeyRound style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#64748b',
                }} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#060d07', border: '1px solid #1a3320',
                    borderRadius: '10px', padding: '14px 12px 14px 38px',
                    color: '#f1f5f9', fontSize: '22px', fontWeight: 700,
                    letterSpacing: '10px', outline: 'none', textAlign: 'center',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 600,
                  cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer',
                  opacity: (loading || code.length < 6) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Confirmar e acessar empresa
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                style={{
                  width: '100%', background: 'transparent',
                  color: '#64748b', border: 'none', padding: '10px',
                  fontSize: '13px', cursor: 'pointer', marginTop: '6px',
                }}
              >
                ← Voltar e trocar e-mail
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '20px' }}>
          Este acesso é exclusivo para membros convidados.{' '}
          <a href="/login" style={{ color: '#64748b', textDecoration: 'underline' }}>
            Entrar com sua conta
          </a>
        </p>
      </div>
    </div>
  )
}
