'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'

function ConfirmarContent() {
  const params = useSearchParams()
  const email  = params.get('email') ?? ''

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: '#3b82f615', border: '1px solid #3b82f630' }}>
          <Mail className="h-7 w-7 text-[#60a5fa]" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-white">Confirme seu email</h1>
        <p className="mt-2 text-sm text-[#4a6080]">
          Enviamos um link de confirmação para{' '}
          {email && <span className="text-[#8899bb]">{email}</span>}.
          Clique no link para ativar sua conta.
        </p>
        <p className="mt-3 text-xs text-[#6B6B6B]">
          Não recebeu? Verifique a pasta de spam ou{' '}
          <Link href="/cadastro" className="text-[#60a5fa] hover:text-white transition-colors">
            tente novamente
          </Link>
          .
        </p>
      </div>

      <Link href="/login"
        className="inline-block text-sm text-[#4a6080] hover:text-[#8899bb] transition-colors">
        Já confirmei → Entrar
      </Link>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <ConfirmarContent />
    </Suspense>
  )
}
