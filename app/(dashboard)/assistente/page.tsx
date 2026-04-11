'use client'

import { SaoozAI } from '@/components/dashboard/SaoozAI'
import { useFinancialData } from '@/lib/hooks/useFinancialData'

export default function AssistentePage() {
  const { totals, categoryData } = useFinancialData()

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-6">
      <div className="panel-card p-5">
        <h1 className="text-xl font-bold text-app">Assistente</h1>
        <p className="mt-1 text-sm text-app-soft">
          Copiloto financeiro para analisar o mes e preparar lancamentos com seguranca.
        </p>
      </div>

      <SaoozAI userId="self" totals={totals} categoryData={categoryData} />
    </div>
  )
}
