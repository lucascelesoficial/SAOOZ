'use client'

import { SaoozAI } from '@/components/dashboard/SaoozAI'
import { useFinancialData } from '@/lib/hooks/useFinancialData'

export default function AssistentePage() {
  const { totals, categoryData } = useFinancialData()

  return (
    <div className="flex flex-col gap-4 pb-4" style={{ height: 'calc(100dvh - 100px)' }}>
      <div>
        <h1 className="text-2xl font-bold text-app">Assistente IA</h1>
        <p className="mt-0.5 text-sm text-app-soft">
          Copiloto financeiro — analisa, sugere e prepara lançamentos com sua confirmação.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <SaoozAI userId="self" totals={totals} categoryData={categoryData} mode="page" />
      </div>
    </div>
  )
}
