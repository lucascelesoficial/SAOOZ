'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Loader2,
  Plus,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  DollarSign,
  Activity,
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
import {
  ACCOUNT_TYPE_LABELS,
  ASSET_TYPE_LABELS,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_SIGNED,
} from '@/lib/modules/investments/service'
import { formatCurrency } from '@/lib/utils/formatters'
import type { InvestmentAccountType, InvestmentAssetType, InvestmentMovementType } from '@/types/database.types'

// ── Tipos de formulário ───────────────────────────────────────────────────────

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

// ── Modal: Criar conta ────────────────────────────────────────────────────────

function AccountForm({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void
  onSave: (v: AccountFormValues) => Promise<void>
  isSaving: boolean
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AccountFormValues>({
    defaultValues: { name: '', institution: '', accountType: 'corretora', currency: 'BRL' },
  })
  const accountType = watch('accountType')

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div className="space-y-2">
        <Label className="text-app-base">Nome da conta</Label>
        <Input
          placeholder="Ex: XP Investimentos"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: errors.name ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('name', { required: 'Informe o nome da conta' })}
        />
        {errors.name && <p className="text-xs text-[#f87171]">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Tipo de conta</Label>
        <Select onValueChange={(v) => v && setValue('accountType', v as InvestmentAccountType)} value={accountType}>
          <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [InvestmentAccountType, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Instituição — opcional</Label>
        <Input
          placeholder="Ex: XP, Rico, Nubank"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('institution')}
        />
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

// ── Modal: Adicionar ativo ────────────────────────────────────────────────────

function AssetForm({
  onClose,
  onSave,
  isSaving,
  accountId,
  accountName,
}: {
  onClose: () => void
  onSave: (v: AssetFormValues) => Promise<void>
  isSaving: boolean
  accountId: string
  accountName: string
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AssetFormValues>({
    defaultValues: { symbol: '', name: '', assetType: 'renda_fixa', quantity: '', averagePrice: '' },
  })
  const assetType = watch('assetType')

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      <div
        className="rounded-[8px] px-3 py-2 text-xs"
        style={{ background: 'color-mix(in oklab, var(--accent-blue) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-blue) 25%, transparent)', color: 'var(--accent-blue)' }}
      >
        Adicionando em: <span className="font-semibold">{accountName}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Símbolo / Ticker</Label>
          <Input
            placeholder="Ex: PETR4"
            className="rounded-[8px] uppercase"
            style={{ background: 'var(--panel-bg-soft)', borderColor: errors.symbol ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('symbol', { required: 'Obrigatório' })}
          />
          {errors.symbol && <p className="text-xs text-[#f87171]">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Tipo</Label>
          <Select onValueChange={(v) => v && setValue('assetType', v as InvestmentAssetType)} value={assetType}>
            <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
              {(Object.entries(ASSET_TYPE_LABELS) as [InvestmentAssetType, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Nome completo — opcional</Label>
        <Input
          placeholder="Ex: Petrobras PN"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('name')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">Quantidade</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('quantity')}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Preço médio (R$)</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('averagePrice')}
          />
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

// ── Modal: Registrar movimentação ─────────────────────────────────────────────

function MovementForm({
  onClose,
  onSave,
  isSaving,
  accounts,
  defaultAccountId,
}: {
  onClose: () => void
  onSave: (v: MovementFormValues) => Promise<void>
  isSaving: boolean
  accounts: Array<{ id: string; name: string }>
  defaultAccountId?: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MovementFormValues>({
    defaultValues: {
      accountId: defaultAccountId ?? (accounts[0]?.id ?? ''),
      movementType: 'aporte',
      amount: '',
      quantity: '',
      description: '',
      occurredOn: today,
    },
  })
  const movementType = watch('movementType')
  const sign = MOVEMENT_TYPE_SIGNED[movementType as InvestmentMovementType]

  const MOVEMENT_CONFIG: Record<InvestmentMovementType, { color: string; icon: React.ElementType }> = {
    compra: { color: '#3b82f6', icon: TrendingUp },
    venda: { color: '#f87171', icon: ArrowDownLeft },
    dividendo: { color: '#22c55e', icon: DollarSign },
    juros: { color: '#22c55e', icon: Activity },
    aporte: { color: '#3b82f6', icon: ArrowUpRight },
    resgate: { color: '#f87171', icon: ArrowDownLeft },
    taxa: { color: '#f59e0b', icon: SlidersHorizontal },
    ajuste: { color: '#94a3b8', icon: SlidersHorizontal },
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="mt-2 space-y-4">
      {accounts.length > 1 && (
        <div className="space-y-2">
          <Label className="text-app-base">Conta</Label>
          <Select onValueChange={(v) => v && setValue('accountId', v)} defaultValue={defaultAccountId ?? accounts[0]?.id}>
            <SelectTrigger className="rounded-[8px]" style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}>
              <SelectValue />
            </SelectTrigger>
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
            const { color, icon: Icon } = MOVEMENT_CONFIG[key]
            const isSelected = movementType === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setValue('movementType', key)}
                className="flex flex-col items-center gap-1 rounded-[8px] p-2 text-[10px] font-semibold transition-all"
                style={{
                  background: isSelected ? `color-mix(in oklab, ${color} 15%, transparent)` : 'var(--panel-bg-soft)',
                  border: `1px solid ${isSelected ? `color-mix(in oklab, ${color} 40%, transparent)` : 'var(--panel-border)'}`,
                  color: isSelected ? color : 'var(--text-soft)',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {MOVEMENT_TYPE_LABELS[key]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-app-base">
            Valor (R$)
            <span className="ml-1 text-xs" style={{ color: sign > 0 ? '#22c55e' : '#f87171' }}>
              ({sign > 0 ? 'entrada' : 'saída'})
            </span>
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: errors.amount ? '#f87171' : 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('amount', {
              required: 'Informe o valor',
              validate: (v) => {
                const n = parseFloat(v.replace(',', '.'))
                return (!isNaN(n) && n >= 0) || 'Valor inválido'
              },
            })}
          />
          {errors.amount && <p className="text-xs text-[#f87171]">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-app-base">Qtd. — opcional</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            className="rounded-[8px]"
            style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
            {...register('quantity')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Data</Label>
        <Input
          type="date"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('occurredOn')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-app-base">Descrição — opcional</Label>
        <Input
          placeholder="Ex: Compra mensal programada"
          className="rounded-[8px]"
          style={{ background: 'var(--panel-bg-soft)', borderColor: 'var(--panel-border)', color: 'var(--text-strong)' }}
          {...register('description')}
        />
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

// ── Tabela de movimentações recentes ─────────────────────────────────────────

function RecentMovementsTable({
  movements,
}: {
  movements: Array<{
    id: string
    accountName: string
    assetSymbol: string | null
    movementType: InvestmentMovementType
    signedAmount: number
    occurredOn: string
    description: string | null
  }>
}) {
  if (!movements.length) {
    return (
      <div className="panel-card p-5 text-center">
        <p className="text-sm font-semibold text-app">Sem movimentações</p>
        <p className="mt-1 text-xs text-app-soft">Registre aportes, resgates ou rendimentos.</p>
      </div>
    )
  }

  return (
    <div className="panel-card overflow-hidden">
      <div
        className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b px-4 py-3 text-xs uppercase tracking-wider text-app-soft"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <span>Movimentação</span>
        <span className="text-right">Data</span>
        <span className="text-right">Valor</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--panel-border)' }}>
        {movements.map((mv) => {
          const isPositive = mv.signedAmount >= 0
          return (
            <div key={mv.id} className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-app">
                  {mv.description || MOVEMENT_TYPE_LABELS[mv.movementType]}
                </p>
                <p className="mt-0.5 text-xs text-app-soft">
                  {mv.accountName}{mv.assetSymbol ? ` · ${mv.assetSymbol}` : ''}
                </p>
              </div>
              <div className="text-right text-xs text-app-soft">
                {new Date(`${mv.occurredOn}T00:00:00`).toLocaleDateString('pt-BR')}
              </div>
              <div
                className="text-right font-semibold tabular-nums"
                style={{ color: isPositive ? '#22c55e' : '#f87171' }}
              >
                {isPositive ? '+' : ''}{formatCurrency(mv.signedAmount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal (PF) ──────────────────────────────────────────────────────

export default function InvestimentosPFPage() {
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [assetModal, setAssetModal] = useState<{ open: boolean; accountId: string; accountName: string }>({ open: false, accountId: '', accountName: '' })
  const [movementModal, setMovementModal] = useState<{ open: boolean; accountId?: string; accountName?: string }>({ open: false })

  const { accounts, totalInvested, allocation, recentMovements, summary, isLoading, isCreatingAccount, isCreatingAsset, isRecordingMovement, error, createAccount, createAsset, recordMovement } = useInvestmentsData({ scope: 'personal' })

  async function handleCreateAccount(values: AccountFormValues) {
    try {
      await createAccount({ name: values.name, institution: values.institution || null, accountType: values.accountType, currency: values.currency || 'BRL' })
      toast.success('Conta criada')
      setAccountModalOpen(false)
    } catch (err) {
      toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha ao criar conta.' })
    }
  }

  async function handleCreateAsset(values: AssetFormValues) {
    const parse = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n }
    try {
      await createAsset({ accountId: assetModal.accountId, symbol: values.symbol, name: values.name || null, assetType: values.assetType, quantity: parse(values.quantity), averagePrice: parse(values.averagePrice) })
      toast.success('Ativo cadastrado')
      setAssetModal({ open: false, accountId: '', accountName: '' })
    } catch (err) {
      toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha ao cadastrar ativo.' })
    }
  }

  async function handleRecordMovement(values: MovementFormValues) {
    const parseN = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? undefined : n }
    try {
      await recordMovement({ accountId: values.accountId, movementType: values.movementType as InvestmentMovementType, amount: parseN(values.amount) ?? 0, quantity: parseN(values.quantity) ?? null, occurredOn: values.occurredOn || undefined, description: values.description || null })
      toast.success('Movimentação registrada')
      setMovementModal({ open: false })
    } catch (err) {
      toast.error('Erro', { description: err instanceof Error ? err.message : 'Falha ao registrar.' })
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app">Investimentos</h1>
          <p className="mt-1 text-sm text-app-base">Carteira pessoal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMovementModal({ open: true })} className="rounded-[8px] gap-1.5" disabled={accounts.length === 0}>
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Movimentação</span>
          </Button>
          <Button onClick={() => setAccountModalOpen(true)} size="sm" className="rounded-[8px] text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Conta</span>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[10px] p-4 text-sm" style={{ background: 'color-mix(in oklab, #f87171 10%, transparent)', border: '1px solid color-mix(in oklab, #f87171 30%, transparent)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Estado vazio */}
          {accounts.length === 0 && (
            <div
              className="rounded-[12px] p-6 text-center"
              style={{ background: 'color-mix(in oklab, var(--accent-blue) 6%, transparent)', border: '1px dashed color-mix(in oklab, var(--accent-blue) 30%, transparent)' }}
            >
              <TrendingUp className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--accent-blue)' }} />
              <p className="font-semibold text-app">Comece a acompanhar seus investimentos</p>
              <p className="mt-1 text-sm text-app-soft">
                Crie uma conta de investimento e cadastre seus ativos.
              </p>
              <Button onClick={() => setAccountModalOpen(true)} className="mt-4 rounded-[8px] text-white" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
                Criar conta
              </Button>
            </div>
          )}

          {accounts.length > 0 && (
            <>
              {/* KPIs */}
              <InvestmentSummaryCards scope="personal" totalInvested={totalInvested} summary={summary} />

              {/* Alocação */}
              {allocation.length > 0 && (
                <div>
                  <p className="mb-3 px-1 text-sm font-semibold text-app">Distribuição por tipo</p>
                  <AllocationChart allocation={allocation} totalInvested={totalInvested} />
                </div>
              )}

              {/* Posições */}
              <div>
                <p className="mb-3 px-1 text-sm font-semibold text-app">Contas e posições</p>
                <PositionsTable
                  accounts={accounts}
                  onAddAsset={(id, name) => setAssetModal({ open: true, accountId: id, accountName: name })}
                  onAddMovement={(id, name) => setMovementModal({ open: true, accountId: id, accountName: name })}
                />
              </div>

              {/* Movimentações recentes */}
              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-app">Movimentações recentes</p>
                  <button onClick={() => setMovementModal({ open: true })} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
                    <Plus className="h-3.5 w-3.5" />Nova
                  </button>
                </div>
                <RecentMovementsTable movements={recentMovements} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Modais */}
      <Modal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} title="Nova conta de investimento" description="Crie uma conta para organizar seus ativos.">
        <AccountForm onClose={() => setAccountModalOpen(false)} onSave={handleCreateAccount} isSaving={isCreatingAccount} />
      </Modal>

      <Modal open={assetModal.open} onClose={() => setAssetModal({ open: false, accountId: '', accountName: '' })} title="Cadastrar ativo" description="Adicione um ativo à sua carteira.">
        <AssetForm onClose={() => setAssetModal({ open: false, accountId: '', accountName: '' })} onSave={handleCreateAsset} isSaving={isCreatingAsset} accountId={assetModal.accountId} accountName={assetModal.accountName} />
      </Modal>

      <Modal open={movementModal.open} onClose={() => setMovementModal({ open: false })} title="Registrar movimentação" description="Registre compras, resgates, dividendos e mais.">
        {accounts.length > 0 && (
          <MovementForm onClose={() => setMovementModal({ open: false })} onSave={handleRecordMovement} isSaving={isRecordingMovement} accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} defaultAccountId={movementModal.accountId} />
        )}
      </Modal>
    </div>
  )
}
