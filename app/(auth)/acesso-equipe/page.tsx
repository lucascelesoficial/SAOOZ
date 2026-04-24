'use client'

import { useState } from 'react'
import { Loader2, Mail, Users, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const G      = '#026648'
const G_DARK = '#015038'

export default function AcessoEquipePage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Insira um e-mail válido')
      return
    }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // No emailRedirectTo — use the site URL configured in Supabase dashboard.
          // The /auth/callback route automatically accepts team invites and redirects to /empresa.
        },
      })
      if (otpError) {
        setError('Não foi possível enviar o link. Tente novamente.')
        return
      }
      setSent(true)
    } catch {
      setError('Erro de conexão. Verifique sua internet.')
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
            {sent
              ? <CheckCircle2 style={{ width: '24px', height: '24px', color: '#4ade80' }} />
              : <Users style={{ width: '22px', height: '22px', color: '#4ade80' }} />
            }
          </div>

          {!sent ? (
            /* ── Step 1: Enter email ── */
            <form onSubmit={e => { void handleSubmit(e) }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                Acesso de Equipe
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
                Digite o e-mail que recebeu o convite. Enviaremos um link de acesso direto para a empresa.
              </p>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Mail style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#64748b',
                  pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#060d07',
                    border: `1px solid ${error ? '#f87171' : '#1a3320'}`,
                    borderRadius: '10px',
                    padding: '11px 12px 11px 38px',
                    color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '13px', margin: '-8px 0 12px' }}>{error}</p>
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
                  transition: 'opacity 0.15s',
                }}
              >
                {loading && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                {loading ? 'Enviando…' : 'Enviar link de acesso'}
              </button>
            </form>

          ) : (
            /* ── Step 2: Link sent ── */
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
                Link enviado!
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.5 }}>
                Enviamos um link de acesso para{' '}
                <strong style={{ color: '#e2e8f0' }}>{email}</strong>.
                Abra o email e clique no link para entrar na empresa.
              </p>

              {/* Visual hint */}
              <div style={{
                background: 'rgba(2,102,72,0.08)',
                border: '1px solid rgba(2,102,72,0.25)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
              }}>
                <p style={{ color: '#86efac', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  💡 O link expira em <strong>1 hora</strong>. Verifique também a pasta de spam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); setError('') }}
                style={{
                  width: '100%', background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #1a3320',
                  borderRadius: '10px',
                  padding: '11px', fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Usar outro e-mail
              </button>
            </div>
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
