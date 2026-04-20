'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FinancialReportData } from './FinancialReportPDF'

interface ExportPDFButtonProps {
  data: FinancialReportData
  fileName?: string
  className?: string
}

export function ExportPDFButton({ data, fileName, className }: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const toastId = toast.loading('Gerando PDF…')
    try {
      // Lazy-load @react-pdf/renderer only when needed (heavy bundle)
      const { pdf } = await import('@react-pdf/renderer')
      const { FinancialReportPDF } = await import('./FinancialReportPDF')
      const React = (await import('react')).default

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(React.createElement(FinancialReportPDF, { data }) as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName ?? `saooz-relatorio-${new Date().toISOString().slice(0, 7)}.pdf`
      document.body.appendChild(a)
      a.click()
      // Delay revoke so browser can initiate the download
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 200)
      toast.success('PDF gerado!', { id: toastId })
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error(
        `Erro ao gerar PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        { id: toastId }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={className ?? 'inline-flex h-9 items-center gap-2 rounded-[8px] border px-3 text-sm font-medium text-app transition-colors hover:opacity-90 disabled:opacity-50'}
      style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)' }}
      title="Exportar relatório em PDF"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Exportar PDF</span>
    </button>
  )
}
