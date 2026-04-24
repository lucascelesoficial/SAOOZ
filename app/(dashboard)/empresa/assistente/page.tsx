'use client'

import { SaoozAIPJ } from '@/components/dashboard/SaoozAIPJ'

export default function EmpresaAssistentePage() {
  return (
    <div className="flex flex-col gap-4 pb-4" style={{ height: 'calc(100dvh - 100px)' }}>
      <div>
        <h1 className="text-2xl font-bold text-app">Assistente Empresarial</h1>
        <p className="mt-0.5 text-sm text-app-soft">
          IA para operação financeira da empresa — sugere e executa com sua confirmação.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <SaoozAIPJ userId="self" mode="page" />
      </div>
    </div>
  )
}
