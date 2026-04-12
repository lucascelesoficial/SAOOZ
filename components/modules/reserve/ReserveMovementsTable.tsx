'use client'

import { ArrowDownCircle, ArrowUpCircle, Loader2, PencilLine, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ReserveMovementView } from '@/lib/modules/reserve/service'

interface ReserveMovementsTableProps {
  movements: ReserveMovementView[]
  onDelete?: (id: string) => Promise<void>
}

const ENTRY_TYPE_LABEL: Record<ReserveMovementView['entryType'], string> = {
  aporte: 'Aporte',
  resgate: 'Resgate',
  ajuste: 'Ajuste',
}

function formatDate(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateIso
  return date.toLocaleDateString('pt-BR')
}

function signedAmountColor(value: number) {
  return value < 0 ? '#f87171' : '#22c55e'
}

function entryIcon(entryType: ReserveMovementView['entryType']) {
  if (entryType === 'resgate') return ArrowDownCircle
  if (entryType === 'aporte') return ArrowUpCircle
  return PencilLine
}

export function ReserveMovementsTable({ movements, onDelete }: ReserveMovementsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remover este registro?')) return
    setDeleting(id)
    await onDelete?.(id)
    setDeleting(null)
  }

  if (!movements.length) {
    return (
      <div className="panel-card p-5 text-center">
        <p className="text-sm font-semibold text-app">Sem movimentacoes no periodo</p>
        <p className="mt-1 text-xs text-app-soft">
          Registre aportes, resgates ou ajustes para acompanhar a reserva.
        </p>
      </div>
    )
  }

  return (
    <div className="panel-card overflow-hidden">
      <div
        className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-3 border-b px-4 py-3 text-xs uppercase tracking-wider text-app-soft"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <span>Movimentacao</span>
        <span className="text-right">Data</span>
        <span className="text-right">Valor</span>
        <span />
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--panel-border)' }}>
        {movements.map((movement) => {
          const Icon = entryIcon(movement.entryType)

          return (
            <div
              key={movement.id}
              className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: signedAmountColor(movement.signedAmount) }}
                  />
                  <span className="truncate font-medium text-app">
                    {movement.description || ENTRY_TYPE_LABEL[movement.entryType]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-app-soft">{ENTRY_TYPE_LABEL[movement.entryType]}</p>
              </div>

              <div className="text-right text-xs text-app-soft">
                {formatDate(movement.happenedOn)}
              </div>

              <div
                className="text-right font-semibold tabular-nums"
                style={{ color: signedAmountColor(movement.signedAmount) }}
              >
                {movement.signedAmount < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(movement.signedAmount))}
              </div>

              {onDelete && (
                <button
                  onClick={() => handleDelete(movement.id)}
                  disabled={deleting === movement.id}
                  className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors"
                  aria-label="Remover"
                >
                  {deleting === movement.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
