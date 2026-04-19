'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  CreditCard,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  pluggy_account_id: string
  name: string
  type: string
  subtype: string | null
  number: string | null
  balance: number
  currency_code: string
  last_synced_at: string | null
}

interface BankItem {
  id: string
  pluggy_item_id: string
  connector_name: string
  status: 'updated' | 'updating' | 'waiting_user_input' | 'error'
  last_updated_at: string | null
  error_message: string | null
  created_at: string
  bank_accounts: BankAccount[]
}

// ── Pluggy widget typings ─────────────────────────────────────────────────────

declare global {
  interface Window {
    PluggyConnect: new (options: {
      connectToken: string
      onSuccess: (data: { item: { id: string } }) => void
      onError: (error: { message: string }) => void
      onClose?: () => void
    }) => { open: () => void; close: () => void }
  }
}

// ── Script loader — carrega sob demanda, com retry automático ─────────────────

function loadPluggyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Já carregado
    if (window.PluggyConnect) return resolve()

    // Remove script com erro anterior para permitir retry
    const old = document.getElementById('pluggy-connect-script')
    if (old && old.getAttribute('data-error') === '1') old.remove()

    // Já existe e está carregando — aguarda evento
    const existing = document.getElementById('pluggy-connect-script')
    if (existing) {
      const tid = setTimeout(
        () => reject(new Error('Timeout: widget demorou demais para carregar.')),
        15_000
      )
      existing.addEventListener('load', () => { clearTimeout(tid); resolve() }, { once: true })
      existing.addEventListener('error', () => { clearTimeout(tid); reject(new Error('Falha ao carregar widget.')) }, { once: true })
      return
    }

    // Injeta novo script
    const script = document.createElement('script')
    script.id = 'pluggy-connect-script'
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      script.setAttribute('data-error', '1')
      reject(new Error(
        'Não foi possível carregar o widget bancário. ' +
        'Verifique sua conexão ou desative extensões de bloqueio de anúncios.'
      ))
    }
    document.head.appendChild(script)
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function accountTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case 'CREDIT': return CreditCard
    case 'INVESTMENT': return TrendingUp
    default: return Banknote
  }
}

function statusBadge(status: BankItem['status']) {
  switch (status) {
    case 'updated':        return { icon: CheckCircle2, label: 'Atualizado',     color: '#22c55e' }
    case 'updating':       return { icon: RefreshCw,    label: 'Atualizando…',   color: 'var(--accent-blue)' }
    case 'waiting_user_input': return { icon: Clock,    label: 'Aguardando ação',color: '#f59e0b' }
    case 'error':          return { icon: AlertCircle,  label: 'Erro',           color: '#f87171' }
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BancosClient() {
  const [items, setItems] = useState<BankItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingBank, setConnectingBank] = useState(false)
  const [syncingItem, setSyncingItem] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/banking/items')
      if (!res.ok) throw new Error('Falha ao carregar bancos.')
      const data = await res.json()
      setItems(data.items ?? [])
    } catch {
      toast.error('Falha ao carregar bancos conectados.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  async function handleConnectBank() {
    // Clique enquanto conectando = cancelar
    if (connectingBank) {
      setConnectingBank(false)
      return
    }

    setConnectingBank(true)
    const safetyTimer = setTimeout(() => setConnectingBank(false), 5 * 60 * 1000)

    try {
      // Carrega o script se ainda não carregou
      await loadPluggyScript()

      if (!window.PluggyConnect) {
        throw new Error('Widget não disponível. Desative extensões de bloqueio e tente novamente.')
      }

      const res = await fetch('/api/banking/connect-token')
      if (!res.ok) throw new Error('Falha ao obter token de conexão.')
      const { connectToken } = await res.json()

      const widget = new window.PluggyConnect({
        connectToken,
        onSuccess: async ({ item }) => {
          clearTimeout(safetyTimer)
          toast.loading('Registrando banco…', { id: 'bank-register' })
          try {
            const postRes = await fetch('/api/banking/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pluggyItemId: item.id }),
            })
            if (!postRes.ok) {
              const errData = await postRes.json().catch(() => ({}))
              throw new Error(errData.error ?? 'Falha ao registrar banco.')
            }
            toast.success('Banco conectado!', { id: 'bank-register' })
            await loadItems()
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : 'Erro ao conectar banco.',
              { id: 'bank-register' }
            )
          }
        },
        onError: (err) => {
          clearTimeout(safetyTimer)
          toast.error(`Erro na conexão: ${err.message}`)
          setConnectingBank(false)
        },
        onClose: () => {
          clearTimeout(safetyTimer)
          setConnectingBank(false)
        },
      })

      widget.open()
    } catch (err) {
      clearTimeout(safetyTimer)
      toast.error(err instanceof Error ? err.message : 'Erro ao conectar banco.')
      setConnectingBank(false)
    }
  }

  async function handleSync(itemId: string) {
    setSyncingItem(itemId)
    toast.loading('Sincronizando transações…', { id: `sync-${itemId}` })
    try {
      const res = await fetch('/api/banking/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, months: 3 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Falha ao sincronizar.')
      toast.success(
        `Sincronizado! ${data.imported} transações importadas, ${data.skipped} ignoradas.`,
        { id: `sync-${itemId}` }
      )
      await loadItems()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao sincronizar.',
        { id: `sync-${itemId}` }
      )
    } finally {
      setSyncingItem(null)
    }
  }

  async function handleDelete(itemId: string, connectorName: string) {
    if (!confirm(`Desconectar ${connectorName}? As despesas já importadas serão mantidas.`)) return
    setDeletingItem(itemId)
    try {
      const res = await fetch(`/api/banking/items?id=${itemId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Falha ao desconectar.')
      }
      toast.success(`${connectorName} desconectado.`)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desconectar banco.')
    } finally {
      setDeletingItem(null)
    }
  }

  const totalBalance = items
    .flatMap((i) => i.bank_accounts)
    .filter((a) => a.type === 'BANK')
    .reduce((sum, a) => sum + a.balance, 0)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Bancos</h1>
          <p className="mt-1 text-sm text-app-base">Conexão automática via Open Finance</p>
        </div>
        <Button
          onClick={handleConnectBank}
          size="sm"
          className="rounded-[8px] text-white gap-1.5"
          style={{
            background: connectingBank
              ? 'linear-gradient(135deg, #6b7280, #4b5563)'
              : 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          }}
        >
          {connectingBank
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Plus className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {connectingBank ? 'Cancelar' : 'Conectar banco'}
          </span>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* Empty state */}
          {items.length === 0 && (
            <div
              className="rounded-[12px] p-8 text-center"
              style={{
                background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
                border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)',
              }}
            >
              <Landmark className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--accent-blue)' }} />
              <p className="font-semibold text-app">Nenhum banco conectado</p>
              <p className="mt-1 text-sm text-app-soft">
                Conecte sua conta bancária para importar despesas automaticamente.
              </p>
              <Button
                onClick={handleConnectBank}
                className="mt-4 rounded-[8px] text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Conectar banco
              </Button>
            </div>
          )}

          {/* Summary card */}
          {items.length > 0 && (
            <div
              className="panel-card rounded-[12px] p-5"
              style={{ background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent-blue) 10%, transparent), color-mix(in oklab, var(--accent-cyan) 8%, transparent))' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-app-soft">
                Saldo total em conta corrente
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums" style={{ color: 'var(--text-strong)' }}>
                {formatCurrency(totalBalance)}
              </p>
              <p className="mt-1 text-xs text-app-soft">
                {items.length} {items.length === 1 ? 'banco conectado' : 'bancos conectados'}
              </p>
            </div>
          )}

          {/* Bank items */}
          {items.map((item) => {
            const badge = statusBadge(item.status)
            const StatusIcon = badge.icon

            return (
              <div key={item.id} className="panel-card rounded-[12px] overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: 'color-mix(in oklab, var(--accent-blue) 15%, transparent)' }}
                    >
                      <Landmark className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-app truncate">{item.connector_name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StatusIcon className="h-3 w-3 shrink-0" style={{ color: badge.color }} />
                        <span className="text-xs" style={{ color: badge.color }}>{badge.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(item.id)}
                      disabled={syncingItem === item.id}
                      className="rounded-[7px] gap-1.5 h-8 text-xs"
                    >
                      {syncingItem === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RefreshCw className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">Sincronizar</span>
                    </Button>

                    <button
                      onClick={() => handleDelete(item.id, item.connector_name)}
                      disabled={deletingItem === item.id}
                      className="rounded-[7px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors"
                      title="Desconectar banco"
                    >
                      {deletingItem === item.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {item.last_updated_at && (
                  <div
                    className="px-4 py-1.5 text-xs text-app-soft border-b"
                    style={{ borderColor: 'var(--panel-border)', background: 'var(--panel-bg-soft)' }}
                  >
                    Última atualização: {formatDate(item.last_updated_at)}
                  </div>
                )}

                {item.status === 'error' && item.error_message && (
                  <div
                    className="px-4 py-2 text-xs"
                    style={{ background: 'color-mix(in oklab, #f87171 8%, transparent)', color: '#f87171' }}
                  >
                    {item.error_message}
                  </div>
                )}

                {item.bank_accounts.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-app-soft text-center">Nenhuma conta encontrada</div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--panel-border)' }}>
                    {item.bank_accounts.map((account) => {
                      const AccIcon = accountTypeIcon(account.type)
                      const isCredit = account.type === 'CREDIT'
                      return (
                        <div key={account.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AccIcon className="h-4 w-4 shrink-0 text-app-soft" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-app truncate">{account.name}</p>
                              {account.number && (
                                <p className="text-xs text-app-soft">
                                  {account.subtype ?? account.type} · {account.number}
                                </p>
                              )}
                              {!account.number && account.subtype && (
                                <p className="text-xs text-app-soft">{account.subtype}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p
                              className="text-sm font-semibold tabular-nums"
                              style={{ color: isCredit ? '#f87171' : 'var(--text-strong)' }}
                            >
                              {formatCurrency(account.balance)}
                            </p>
                            {account.last_synced_at && (
                              <p className="text-[10px] text-app-soft mt-0.5">
                                Sinc. {new Date(account.last_synced_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {items.length > 0 && (
            <div
              className="rounded-[10px] px-4 py-3 text-xs text-app-soft"
              style={{
                background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)',
                border: '1px solid color-mix(in oklab, var(--accent-blue) 20%, transparent)',
              }}
            >
              <p className="font-semibold text-app mb-1">Como funciona a sincronização?</p>
              <p>
                Ao clicar em &quot;Sincronizar&quot;, os últimos 3 meses de transações são importados.
                Débitos e cartão de crédito viram <strong>despesas</strong>.
                Transações já importadas não são duplicadas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
