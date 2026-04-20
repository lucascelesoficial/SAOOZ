// ── CSV generation utilities ──────────────────────────────────────────────────

export type CsvRow = Record<string, string | number | null | undefined>

function escapeCsv(value: unknown): string {
  const str = String(value ?? '')
  // Wrap in quotes when the value contains commas, newlines, or double-quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Builds a CSV string from an ordered list of column headers and row data.
 * Values are escaped per RFC 4180.
 */
export function buildCsvContent(headers: string[], rows: CsvRow[]): string {
  const headerLine = headers.map(escapeCsv).join(',')
  const rowLines = rows.map((row) =>
    headers.map((h) => escapeCsv(row[h])).join(',')
  )
  return [headerLine, ...rowLines].join('\r\n')
}

/**
 * Triggers a browser download of a CSV file.
 * Prepends BOM (U+FEFF) for Excel UTF-8 compatibility with Portuguese characters.
 */
export function downloadCsv(content: string, filename: string): void {
  const bom = '\ufeff'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  // Delay cleanup so the browser has time to initiate the download
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 200)
}
