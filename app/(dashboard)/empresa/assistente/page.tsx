'use client'

import { SaoozAIPJ } from '@/components/dashboard/SaoozAIPJ'

export default function EmpresaAssistentePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-6">
      <div className="panel-card p-5">
        <h1 className="text-xl font-bold text-app">Assistente Empresarial</h1>
        <p className="mt-1 text-sm text-app-soft">
          IA para operacao financeira da empresa com confirmacao antes de executar.
        </p>
      </div>

      <SaoozAIPJ userId="self" />
    </div>
  )
}
