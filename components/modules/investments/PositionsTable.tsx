'use client'

import { ChevronDown, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  ACCOUNT_TYPE_LABELS,
  ASSET_TYPE_COLORS,
  ASSET_TYPE_LABELS,
} from '@/lib/modules/investments/service'
import type { InvestmentAccountView } from '@/lib/modules/investments/service'

interface PositionsTableProps {
  accounts: InvestmentAccountView[]
  onAddAsset?: (accountId: string, accountName: string) => void
  onAddMovement?: (accountId: string, accountName: string) => void
  onDeleteAsset?: (assetId: string) => Promise<void>
  onDeleteAccount?: (accountId: string) => Promise<void>
}

function AssetRow({ asset, onDelete }: { asset: InvestmentAccountView['assets'][number]; onDelete?: (id: string) => Promise<void> }) {
  const typeColor = ASSET_TYPE_COLORS[asset.assetType]
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Remover ativo ${asset.symbol}?`)) return
    setDeleting(true)
    await onDelete?.(asset.id)
    setDeleting(false)
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
            style={{
              background: `color-mix(in oklab, ${typeColor} 15%, transparent)`,
              color: typeColor,
            }}
          >
            {asset.symbol}
          </span>
          {asset.name && (
            <span className="truncate text-xs text-app-soft">{asset.name}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-app-soft">
          <span>{ASSET_TYPE_LABELS[asset.assetType]}</span>
          {asset.quantity > 0 && (
            <>
              <span>·</span>
              <span>{asset.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} un.</span>
              <span>·</span>
              <span>PM {formatCurrency(asset.averagePrice)}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold tabular-nums text-app">{formatCurrency(asset.currentValue)}</p>
        {asset.targetAllocationPct !== null && (
          <p className="text-xs text-app-soft">meta {asset.targetAllocationPct}%</p>
        )}
      </div>
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors"
          aria-label="Remover ativo"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}

function AccountCard({
  account,
  onAddAsset,
  onAddMovement,
  onDeleteAsset,
  onDeleteAccount,
}: {
  account: InvestmentAccountView
  onAddAsset?: (accountId: string, accountName: string) => void
  onAddMovement?: (accountId: string, accountName: string) => void
  onDeleteAsset?: (assetId: string) => Promise<void>
  onDeleteAccount?: (accountId: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(true)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    await onDeleteAccount?.(account.id)
    setDeletingAccount(false)
  }

  return (
    <div className="panel-card overflow-hidden">
      {/* Header da conta */}
      <div
        className="flex w-full items-center gap-3 px-4 py-3"
        style={{ borderBottom: expanded ? '1px solid var(--panel-border)' : undefined }}
      >
        <button onClick={() => setExpanded((v) => !v)} className="flex flex-1 items-center gap-3 text-left transition-colors hover:opacity-90 min-w-0">
          <ChevronIcon className="h-4 w-4 shrink-0 text-app-soft" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-app">{account.name}</p>
            <p className="text-xs text-app-soft">
              {ACCOUNT_TYPE_LABELS[account.accountType]}
              {account.institution ? ` · ${account.institution}` : ''}
              {account.currency !== 'BRL' ? ` · ${account.currency}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right mr-2">
            <p className="font-bold tabular-nums" style={{ color: 'var(--accent-blue)' }}>
              {formatCurrency(account.totalValue)}
            </p>
            <p className="text-xs text-app-soft">
              {account.assets.length} {account.assets.length === 1 ? 'ativo' : 'ativos'}
            </p>
          </div>
        </button>
        {onDeleteAccount && (
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="shrink-0 rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors"
            aria-label="Remover conta"
          >
            {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Ativos */}
      {expanded && (
        <>
          {account.assets.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-app-soft">Nenhum ativo cadastrado nesta conta.</p>
              {onAddAsset && (
                <button
                  onClick={() => onAddAsset(account.id, account.name)}
                  className="mt-2 text-xs font-medium"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  + Adicionar ativo
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--panel-border)' }}>
              {account.assets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} onDelete={onDeleteAsset} />
              ))}
            </div>
          )}

          {/* Ações da conta */}
          <div
            className="flex items-center gap-3 border-t px-4 py-2.5"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            {onAddAsset && (
              <button
                onClick={() => onAddAsset(account.id, account.name)}
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent-blue)' }}
              >
                + Ativo
              </button>
            )}
            {onAddMovement && (
              <button
                onClick={() => onAddMovement(account.id, account.name)}
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent-blue)' }}
              >
                + Movimentação
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function PositionsTable({ accounts, onAddAsset, onAddMovement, onDeleteAsset, onDeleteAccount }: PositionsTableProps) {
  if (!accounts.length) {
    return (
      <div className="panel-card p-5 text-center">
        <p className="text-sm font-semibold text-app">Nenhuma conta cadastrada</p>
        <p className="mt-1 text-xs text-app-soft">
          Crie uma conta de investimento para começar a registrar seus ativos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onAddAsset={onAddAsset}
          onAddMovement={onAddMovement}
          onDeleteAsset={onDeleteAsset}
          onDeleteAccount={onDeleteAccount}
        />
      ))}
    </div>
  )
}
