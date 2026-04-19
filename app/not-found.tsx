import Link from 'next/link'
import { SaoozWordmark } from '@/components/ui/SaoozLogo'

export default function NotFound() {
  return (
    <div className="force-light flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-white">
      <SaoozWordmark size="md" />

      <div className="text-center">
        <p
          className="text-7xl font-black tracking-tighter"
          style={{ color: 'var(--accent-blue)' }}
        >
          404
        </p>
        <h1 className="mt-3 text-xl font-bold text-app">Página não encontrada</h1>
        <p className="mt-2 text-sm text-app-soft">
          O endereço que você acessou não existe ou foi movido.
        </p>
      </div>

      <Link
        href="/central"
        className="inline-flex h-10 items-center rounded-[10px] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
      >
        Voltar ao painel
      </Link>
    </div>
  )
}
