'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {met ? <Check className="h-3 w-3 text-[#22c55e]" /> : <X className="h-3 w-3 text-[#2a3860]" />}
      <span className={met ? 'text-[#22c55e]' : 'text-[#4a6080]'}>{label}</span>
    </span>
  )
}

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const hasLength = password.length >= 8
  const hasNumber = /[0-9]/.test(password)
  const hasUpper  = /[A-Z]/.test(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!hasLength || !hasNumber || !hasUpper) {
      setError('A senha não atende aos requisitos mínimos.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    toast.success('Senha redefinida!', { description: 'Você já pode entrar com sua nova senha.' })
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Nova senha</h1>
        <p className="mt-1.5 text-sm text-[#4a6080]">
          Escolha uma senha forte para proteger sua conta.
        </p>
      </div>

      {error && (
        <div className="rounded-[10px] px-4 py-3 text-sm text-[#f87171]"
          style={{ background: '#f8717110', border: '1px solid #f8717130' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nova senha */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-[#8899bb] uppercase tracking-wider">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm text-white placeholder:text-[#2a3860] outline-none transition-all"
              style={{
                background: '#0d1021',
                border: error ? '1px solid #f87171' : '1px solid #1e2847',
              }}
              onFocus={(e) => { if (!error) { e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' } }}
              onBlur={(e)  => { if (!error) { e.currentTarget.style.border = '1px solid #1e2847'; e.currentTarget.style.boxShadow = 'none' } }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6080] hover:text-[#8899bb] transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {password && (
          <div className="flex gap-4 flex-wrap px-1">
            <Req met={hasLength} label="8 caracteres" />
            <Req met={hasNumber} label="1 número" />
            <Req met={hasUpper}  label="1 maiúscula" />
          </div>
        )}

        {/* Confirmar */}
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-xs font-semibold text-[#8899bb] uppercase tracking-wider">
            Confirmar senha
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError('') }}
              className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm text-white placeholder:text-[#2a3860] outline-none transition-all"
              style={{
                background: '#0d1021',
                border: error ? '1px solid #f87171' : '1px solid #1e2847',
              }}
              onFocus={(e) => { if (!error) { e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #3b82f620' } }}
              onBlur={(e)  => { if (!error) { e.currentTarget.style.border = '1px solid #1e2847'; e.currentTarget.style.boxShadow = 'none' } }}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6080] hover:text-[#8899bb] transition-colors">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-[10px] text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 20px #3b82f640' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}
