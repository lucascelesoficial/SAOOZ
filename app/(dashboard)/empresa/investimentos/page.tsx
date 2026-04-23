'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  DollarSign,
  Loader2,
  Plus,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Modal } from '@/components/ui/Modal'
import { InvestmentSummaryCards } from '@/components/modules/investments/InvestmentSummaryCards'
import { AllocationChart } from '@/components/modules/investments/AllocationChart'
import { PositionsTable } from '@/components/modules/investments/PositionsTable'
import { useInvestmentsData } from '@/lib/hooks/useInvestmentsData'
import { createClient } from '@/lib/supabase/client'
import { useBusinessData } from '@/lib/context/BusinessDataContext'
import {
  ACCOUNT_TYPE_LABELS,
  ASSET_TYPE_LABELS,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_SIGNED,
} from '@/lib/modules/investments/service'
import { formatCurrency, formatMonth } from '@/lib/utils/formatters'
import { useAppState } from '@/lib/context/AppStateContext'
import type { InvestmentAccountType, InvestmentAssetType, InvestmentMovementType } from '@/types/database.types'

// ── Formulários (idênticos ao PF, escopo PJ) ──────────────────────────────────

interface AccountFormValues {
  name: string
  institution: string
  accountType: InvestmentAccountType
  currency: string
}

interface AssetFormValues {
  symbol: string
  name: string
  assetType: InvestmentAssetType
  quantity: string
  averagePrice: string
}

interface MovementFormValues {
  accountId: string
  movementType: InvestmentMovementType
  amount: string
  quantity: string
  description: string
  occurredOn: string
}

function AccountForm({ onClose, onSave, isSaving }: { onClose: () => void; onSave: (v: AccountFormValues) => Promise<void>; isSaving: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AccountFormValues>({
    defaultValues: { name: '', institution: '', accountType: 'corretora', currency: 'BRL' },
  })
  const accountType = watch('accountType')
  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div className="space-y-2">
        <Label className="text-app-base">Nome da conta</Label>
        <Input placeholder="Ex: Conta investimentos BTG" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: errors.name ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('name', { required: 'Informe o nome' })} />
        {errors.name && <p className="text-xs text-[#f87171]">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-app-base">Tipo</Label>
        <Select onValueChange={(v) => v && setValue('accountType', v as InvestmentAccountType)} value={accountType}>
          <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}><SelectValue /></SelectTrigger>
          <SelectContent style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [InvestmentAccountType, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-app-base">Instituição — opcional</Label>
        <Input placeholder="Ex: BTG, XP, Itaú" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('institution')} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
        <Button type="submit" disabled={isSaving} className="flex-1 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </Button>
      </div>
    </form>
  )
}

function AssetForm({ onClose, onSave, isSaving, accountName }: { onClose: () => void; onSave: (v: AssetFormValues) => Promise<void>; isSaving: boolean; accountId: string; accountName: string }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AssetFormValues>({
    defaultValues: { symbol: '', name: '', assetType: 'renda_fixa', quantity: '', averagePrice: '' },
  })
  const assetType = watch('assetType')
  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div className="rounded-[8px] px-3 py-2 text-xs" style={{ background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)', color: 'var(--accent-blue)' }}>
        Adicionando em: <span className="font-semibold">{accountName}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Símbolo / Ticker</Label>
          <Input placeholder="Ex: MXRF11" className="rounded-[8px] uppercase" style={{ background: 'var(--panel-bg-soft)', borderColor: errors.symbol ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('symbol', { required: 'Obrigatório' })} />
          {errors.symbol && <p className="text-xs text-[#f87171]">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Tipo</Label>
          <Select onValueChange={(v) => v && setValue('assetType', v as InvestmentAssetType)} value={assetType}>
            <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
              {(Object.entries(ASSET_TYPE_LABELS) as [InvestmentAssetType, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-app-base">Nome completo — opcional</Label>
        <Input placeholder="Ex: Maxi Renda FII" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('name')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Quantidade</Label>
          <Input type="text" inputMode="decimal" placeholder="0" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('quantity')} />
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Preço médio (R$)</Label>
          <Input type="text" inputMode="decimal" placeholder="0,00" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('averagePrice')} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
        <Button type="submit" disabled={isSaving} className="flex-1 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cadastrar ativo'}
        </Button>
      </div>
    </form>
  )
}

function MovementForm({ onClose, onSave, isSaving, accounts, defaultAccountId }: { onClose: () => void; onSave: (v: MovementFormValues) => Promise<void>; isSaving: boolean; accounts: Array<{ id: string; name: string }>; defaultAccountId?: string }) {
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MovementFormValues>({
    defaultValues: { accountId: defaultAccountId ?? (accounts[0]?.id ?? ''), movementType: 'aporte', amount: '', quantity: '', description: '', occurredOn: today },
  })
  const movementType = watch('movementType')
  const sign = MOVEMENT_TYPE_SIGNED[movementType as InvestmentMovementType]
  const COLORS: Record<InvestmentMovementType, string> = { compra: '#3b82f6', venda: '#f87171', dividendo: '#026648', juros: '#026648', aporte: '#3b82f6', resgate: '#f87171', taxa: '#f59e0b', ajuste: '#94a3b8' }
  const ICONS: Record<InvestmentMovementType, React.ElementType> = { compra: TrendingUp, venda: ArrowDownLeft, dividendo: DollarSign, juros: Activity, aporte: ArrowUpRight, resgate: ArrowDownLeft, taxa: SlidersHorizontal, ajuste: SlidersHorizontal }

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      {accounts.length > 1 && (
        <div className="space-y-2">
          <Label className="text-app-base">Conta</Label>
          <Select onValueChange={(v) => v && setValue('accountId', v)} defaultValue={defaultAccountId ?? accounts[0]?.id}>
            <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-app-base">Tipo de movimentação</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(MOVEMENT_TYPE_LABELS) as InvestmentMovementType[]).map((key) => {
            const Icon = ICONS[key]; const color = COLORS[key]; const isSelected = movementType === key
            return (
              <button key={key} type="button" onClick={() => setValue('movementType', key)} className="flex flex-col items-center gap-1 rounded-[8px] p-2 text-[10px] font-semibold transition-all" style={{ background: isSelected ? `color-mix(in oklab, ${color} 15%, transparent)` : 'var(--panel-bg-soft)', border: `1px solid ${isSelected ? `color-mix(in oklab, ${color} 40%, transparent)` : 'var(--panel-border)'}`, color: isSelected ? color : 'var(--text-soft)' }}>
                <Icon className="h-3.5 w-3.5" />{MOVEMENT_TYPE_LABELS[key]}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Valor (R$) <span className="ml-1 text-xs" style={{ color: sign > 0 ? '#026648' : '#f87171' }}>({sign > 0 ? 'entrada' : 'saída'})</span></Label>
          <Input type="text" inputMode="decimal" placeholder="0,00" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: errors.amount ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('amount', { required: 'Informe o valor', validate: (v) => { const n = parseFloat(v.replace(',', '.')); return (!isNaN(n) && n >= 0) || 'Valor inválido' } })} />
          {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Qtd. — opcional</Label>
          <Input type="text" inputMode="decimal" placeholder="0" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('quantity')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-app-base">Data</Label>
        <Input type="date" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('occurredOn')} />
      </div>
      <div className="space-y-2">
        <Label className="text-app-base">Descrição — opcional</Label>
        <Input placeholder="Ex: Aporte reserva capital" className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }} {...register('description')} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-[8px]">Cancelar</Button>
        <Button type="submit" disabled={isSaving} className="flex-1 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

// ── Caixa operacional PJ ──────────────────────────────────────────────────────

function CashPositionBanner({
  netProfit,
  totalInvested,
  month,
}: {
  netProfit: number
  totalInvested: number
  businessName?: string
  month: Date
}) {
  const investable = Math.max(0, netProfit)
  const isPositive = netProfit >= 0

  return (
    <div className="panel-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4" style={{ color: 'var(--accent-blue)' }} />
        <p className="text-sm font-semibold text-app">Visão de caixa — {formatMonth(month)}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[8px] p-3 text-center" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
          <p className="text-xs text-app-soft">Resultado líquido</p>
          <p className="mt-1 font-bold tabular-nums" style={{ color: isPositive ? '#026648' : '#f87171', fontSize: '0.95rem' }}>
            {formatCurrency(netProfit)}
          </p>
        </div>
        <div className="rounded-[8px] p-3 text-center" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
          <p className="text-xs text-app-soft">Total investido</p>
          <p className="mt-1 font-bold tabular-nums" style={{ color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
            {formatCurrency(totalInvested)}
          </p>
        </div>
        <div className="rounded-[8px] p-3 text-center" style={{ background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)' }}>
          <p className="text-xs text-app-soft">Caixa investível</p>
          <p className="mt-1 font-bold tabular-nums" style={{ color: investable > 0 ? '#026648' : '#94a3b8', fontSize: '0.95rem' }}>
            {formatCurrency(investable)}
          </p>
        </div>
      </div>
      {!isPositive && (
        <div className="mt-3 flex items-center gap-2 rounded-[8px] px-3 py-2 text-xs" style={{ background: 'color-mix(in oklab, #f87171 10%, transparent)', border: '1px solid color-mix(in oklab, #f87171 25%, transparent)', color: '#f87171' }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Resultado negativo no mês — revise despesas antes de alocar capital.
        </div>
      )}
    </div>
  )
}

// ── Movimentações recentes ────────────────────────────────────────────────────

function RecentMovementsTable({ movements, onDelete }: { movements: Array<{ id: string; accountName: string; assetSymbol: string | null; movementType: InvestmentMovementType; signedAmount: number; occurredOn: string; description: string | null }>; onDelete: (id: string) => Promise<void> }) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remover esta movimentação?')) return
    setDeleting(id)
    await onDelete(id)
    setDeleting(null)
  }

  if (!movements.length) return (
    <div className="panel-card p-5 text-center">
      <p className="text-sm font-semibold text-app">Sem movimentações</p>
      <p className="mt-1 text-xs text-app-soft">Registre aportes, resgates ou rendimentos.</p>
    </div>
  )
  return (
    <div className="panel-card overflow-hidden">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-3 border-b px-4 py-3 text-xs uppercase tracking-wider text-app-soft" style={{ borderColor: 'var(--panel-border)' }}>
        <span>Movimentação</span><span className="text-right">Data</span><span className="text-right">Valor</span><span />
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--panel-border)' }}>
        {movements.map((mv) => {
          const isPositive = mv.signedAmount >= 0
          return (
            <div key={mv.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-app">{mv.description || MOVEMENT_TYPE_LABELS[mv.movementType]}</p>
                <p className="mt-0.5 text-xs text-app-soft">{mv.accountName}{mv.assetSymbol ? ` · ${mv.assetSymbol}` : ''}</p>
              </div>
              <div className="text-right text-xs text-app-soft">{new Date(`${mv.occurredOn}T00:00:00`).toLocaleDateString('pt-BR')}</div>
              <div className="text-right font-semibold tabular-nums" style={{ color: isPositive ? '#026648' : '#f87171' }}>
                {isPositive ? '+' : ''}{formatCurrency(mv.signedAmount)}
              </div>
              <button onClick={() => handleDelete(mv.id)} disabled={deleting === mv.id} className="rounded-[6px] p-1.5 text-app-soft hover:text-[#f87171] transition-colors">
                {deleting === mv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal (PJ) ──────────────────────────────────────────────────────

export default function InvestimentosPJPage() {
  const { currentMonth } = useAppState()
  const { business, totals, isLoading: bizLoading } = useBusinessData()
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [assetModal, setAssetModal] = useState<{ open: boolean; accountId: string; accountName: string }>({ open: false, accountId: '', accountName: '' })
  const [movementModal, setMovementModal] = useState<{ open: boolean; accountId?: string }>({ open: false })

  const businessId = business?.id ?? null
  const isEnabled = Boolean(businessId)

  const { accounts, totalInvested, allocation, recentMovements, summary, isLoading, isCreatingAccount, isCreatingAsset, isRecordingMovement, error, refresh, createAccount, createAsset, recordMovement } = useInvestmentsData({ scope: 'business', businessId, enabled: isEnabled })

  async function handleDeleteMovement(id: string) {
    const { error: err } = await createClient().from('investment_movements').delete().eq('id', id)
    if (err) { toast.error('Erro ao remover movimentação'); return }
    await refresh()
    toast.success('Movimentação removida')
  }

  async function handleDeleteAsset(id: string) {
    const { error: err } = await createClient().from('investment_assets').delete().eq('id', id)
    if (err) { toast.error('Erro ao remover ativo'); return }
    await refresh()
    toast.success('Ativo removido')
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm('Remover esta conta e todos os seus ativos?')) return
    const { error: err } = await createClient().from('investment_accounts').update({ is_active: false }).eq('id', id)
    if (err) { toast.error('Erro ao remover conta'); return }
    await refresh()
    toast.success('Conta removida')
  }

  async function handleCreateAccount(values: AccountFormValues) {
    try {
      await createAccount({ name: values.name, institution: values.institution || null, accountType: values.accountType, currency: values.currency || 'BRL' })
      toast.success('Conta criada')
      setAccountModalOpen(false)
    } catch (err) { toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha.' }) }
  }

  async function handleCreateAsset(values: AssetFormValues) {
    const p = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n }
    try {
      await createAsset({ accountId: assetModal.accountId, symbol: values.symbol, name: values.name || null, assetType: values.assetType, quantity: p(values.quantity), averagePrice: p(values.averagePrice) })
      toast.success('Ativo cadastrado')
      setAssetModal({ open: false, accountId: '', accountName: '' })
    } catch (err) { toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha.' }) }
  }

  async function handleRecordMovement(values: MovementFormValues) {
    const p = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? undefined : n }
    try {
      await recordMovement({ accountId: values.accountId, movementType: values.movementType as InvestmentMovementType, amount: p(values.amount) ?? 0, quantity: p(values.quantity) ?? null, occurredOn: values.occurredOn || undefined, description: values.description || null })
      toast.success('Movimentação registrada')
      setMovementModal({ open: false })
    } catch (err) { toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha.' }) }
  }

  if (!isEnabled) {
    return (
      <div className="mx-auto max-w-2xl pb-24 md:pb-0">
        <div className="mb-6"><h1 className="text-xl font-bold text-app">Investimentos</h1><p className="mt-1 text-sm text-app-base">Empresarial</p></div>
        <div className="rounded-[12px] p-6 text-center" style={{ background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)', border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)' }}>
          <Building2 className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--accent-blue)' }} />
          <p className="font-semibold text-app">Nenhuma empresa ativa</p>
          <p className="mt-1 text-sm text-app-soft">Configure uma empresa para acessar este módulo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Investimentos</h1>
          <p className="mt-1 text-sm text-app-base">{business?.name ?? 'Empresarial'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMovementModal({ open: true })} className="rounded-[8px] gap-1.5" disabled={accounts.length === 0}>
            <Activity className="h-4 w-4" /><span className="hidden sm:inline">Movimentação</span>
          </Button>
          <Button onClick={() => setAccountModalOpen(true)} size="sm" className="rounded-[8px] text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Conta</span>
          </Button>
        </div>
      </div>

      {(isLoading || bizLoading) && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        </div>
      )}

      {!isLoading && !bizLoading && error && (
        <div className="rounded-[10px] p-4 text-sm" style={{ background: 'color-mix(in oklab, #f87171 10%, transparent)', border: '1px solid color-mix(in oklab, #f87171 30%, transparent)', color: '#f87171' }}>{error}</div>
      )}

      {!isLoading && !bizLoading && !error && (
        <div className="space-y-6">
          {/* Visão de caixa PJ */}
          <CashPositionBanner
            netProfit={totals.netProfit}
            totalInvested={totalInvested}
            businessName={business?.name ?? ''}
            month={currentMonth}
          />

          {/* Estado vazio */}
          {accounts.length === 0 && (
            <div className="rounded-[12px] p-6 text-center" style={{ background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)', border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)' }}>
              <TrendingUp className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--accent-blue)' }} />
              <p className="font-semibold text-app">Cadastre os investimentos da empresa</p>
              <p className="mt-1 text-sm text-app-soft">Organize onde está alocado o capital empresarial.</p>
              <Button onClick={() => setAccountModalOpen(true)} className="mt-4 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>Criar conta</Button>
            </div>
          )}

          {accounts.length > 0 && (
            <>
              <InvestmentSummaryCards scope="business" totalInvested={totalInvested} summary={summary} cashPosition={totals.netProfit} />

              {allocation.length > 0 && (
                <div>
                  <p className="mb-3 px-1 text-sm font-semibold text-app">Distribuição por tipo</p>
                  <AllocationChart allocation={allocation} totalInvested={totalInvested} />
                </div>
              )}

              <div>
                <p className="mb-3 px-1 text-sm font-semibold text-app">Contas e posições</p>
                <PositionsTable accounts={accounts} onAddAsset={(id, name) => setAssetModal({ open: true, accountId: id, accountName: name })} onAddMovement={(id) => setMovementModal({ open: true, accountId: id })} onDeleteAsset={handleDeleteAsset} onDeleteAccount={handleDeleteAccount} />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-app">Movimentações recentes</p>
                  <button onClick={() => setMovementModal({ open: true })} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-blue)' }}><Plus className="h-3.5 w-3.5" />Nova</button>
                </div>
                <RecentMovementsTable movements={recentMovements} onDelete={handleDeleteMovement} />
              </div>
            </>
          )}
        </div>
      )}

      <Modal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} title="Nova conta de investimento" description="Conta para alocar capital da empresa.">
        <AccountForm onClose={() => setAccountModalOpen(false)} onSave={handleCreateAccount} isSaving={isCreatingAccount} />
      </Modal>

      <Modal open={assetModal.open} onClose={() => setAssetModal({ open: false, accountId: '', accountName: '' })} title="Cadastrar ativo" description="Adicione um ativo à conta empresarial.">
        <AssetForm onClose={() => setAssetModal({ open: false, accountId: '', accountName: '' })} onSave={handleCreateAsset} isSaving={isCreatingAsset} accountId={assetModal.accountId} accountName={assetModal.accountName} />
      </Modal>

      <Modal open={movementModal.open} onClose={() => setMovementModal({ open: false })} title="Registrar movimentação" description="Registre compras, resgates ou rendimentos da empresa.">
        {accounts.length > 0 && (
          <MovementForm onClose={() => setMovementModal({ open: false })} onSave={handleRecordMovement} isSaving={isRecordingMovement} accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} defaultAccountId={movementModal.accountId} />
        )}
      </Modal>
    </div>
  )
}
