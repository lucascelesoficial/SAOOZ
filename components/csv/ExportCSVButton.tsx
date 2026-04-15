'use client'

import { Download } from 'lucide-react'
import { buildCsvContent, downloadCsv } from '@/lib/utils/csv'
import type { CsvRow } from '@/lib/utils/csv'

interface ExportCSVButtonProps {
  /** Ordered column headers */
  headers: string[]
  /** Row data — keys must match headers */
  rows: CsvRow[]
  /** Downloaded file name, e.g. "relatorio-6m-2026-04.csv" */
  fileName: string
  /** Button label (default "CSV") */
  label?: string
}

/**
 * One-click CSV download button.
 * Styled to sit alongside ExportPDFButton without competing for attention.
 */
export function ExportCSVButton({
  headers,
  rows,
  fileName,
  label = 'CSV',
}: ExportCSVButtonProps) {
  function handleExport() {
    const content = buildCsvContent(headers, rows)
    downloadCsv(content, fileName)
  }

  return (
    <button
      onClick={handleExport}
      title="Exportar como CSV"
      className="flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
      style={{
        background: 'var(--panel-bg-soft)',
        border: '1px solid var(--panel-border)',
        color: 'var(--text-soft)',
      }}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
