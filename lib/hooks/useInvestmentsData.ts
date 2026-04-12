'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  InvestmentModuleSnapshot,
  InvestmentScope,
} from '@/lib/modules/investments/service'
import type { InvestmentAccountType, InvestmentAssetType, InvestmentMovementType } from '@/types/database.types'

interface UseInvestmentsDataOptions {
  scope: InvestmentScope
  businessId?: string | null
  enabled?: boolean
}

interface CreateAccountInput {
  name: string
  institution?: string | null
  accountType?: InvestmentAccountType
  currency?: string
}

interface CreateAssetInput {
  accountId: string
  symbol: string
  name?: string | null
  assetType?: InvestmentAssetType
  quantity?: number
  averagePrice?: number
  targetAllocationPct?: number | null
}

interface CreateMovementInput {
  accountId: string
  assetId?: string
  movementType: InvestmentMovementType
  amount: number
  quantity?: number | null
  unitPrice?: number | null
  occurredOn?: string
  description?: string | null
}

interface InvestmentsApiErrorPayload {
  error?: string
}

function buildQuery(input: { scope: InvestmentScope; businessId?: string | null }) {
  const params = new URLSearchParams({ scope: input.scope })
  if (input.businessId) params.set('businessId', input.businessId)
  return params.toString()
}

async function readErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as InvestmentsApiErrorPayload | null
  return payload?.error ?? fallback
}

export function useInvestmentsData(options: UseInvestmentsDataOptions) {
  const isBusinessWithoutSelection = options.scope === 'business' && !options.businessId
  const isEnabled = options.enabled ?? !isBusinessWithoutSelection

  const [snapshot, setSnapshot] = useState<InvestmentModuleSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isCreatingAsset, setIsCreatingAsset] = useState(false)
  const [isRecordingMovement, setIsRecordingMovement] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isEnabled) {
      setSnapshot(null)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const query = buildQuery({ scope: options.scope, businessId: options.businessId })
      const response = await fetch(`/api/investments/accounts?${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Falha ao carregar investimentos.'))
      }

      const payload = (await response.json()) as { snapshot?: InvestmentModuleSnapshot }
      setSnapshot(payload.snapshot ?? null)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Falha ao carregar investimentos.'
      setError(message)
      setSnapshot(null)
    } finally {
      setIsLoading(false)
    }
  }, [isEnabled, options.businessId, options.scope])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createAccount = useCallback(
    async (input: CreateAccountInput) => {
      if (!isEnabled) throw new Error('Investimentos indisponível para este escopo.')

      setIsCreatingAccount(true)
      try {
        const response = await fetch('/api/investments/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: options.scope,
            businessId: options.businessId ?? undefined,
            ...input,
          }),
        })

        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Falha ao criar conta de investimento.'))
        }

        await refresh()
      } finally {
        setIsCreatingAccount(false)
      }
    },
    [isEnabled, options.businessId, options.scope, refresh]
  )

  const createAsset = useCallback(
    async (input: CreateAssetInput) => {
      if (!isEnabled) throw new Error('Investimentos indisponível para este escopo.')

      setIsCreatingAsset(true)
      try {
        const response = await fetch('/api/investments/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: options.scope,
            businessId: options.businessId ?? undefined,
            ...input,
          }),
        })

        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Falha ao cadastrar ativo.'))
        }

        await refresh()
      } finally {
        setIsCreatingAsset(false)
      }
    },
    [isEnabled, options.businessId, options.scope, refresh]
  )

  const recordMovement = useCallback(
    async (input: CreateMovementInput) => {
      if (!isEnabled) throw new Error('Investimentos indisponível para este escopo.')

      setIsRecordingMovement(true)
      try {
        const response = await fetch('/api/investments/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: options.scope,
            businessId: options.businessId ?? undefined,
            ...input,
          }),
        })

        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Falha ao registrar movimentação.'))
        }

        const payload = (await response.json()) as { snapshot?: InvestmentModuleSnapshot }
        if (payload.snapshot) {
          setSnapshot(payload.snapshot)
        } else {
          await refresh()
        }
      } finally {
        setIsRecordingMovement(false)
      }
    },
    [isEnabled, options.businessId, options.scope, refresh]
  )

  return {
    snapshot,
    accounts: snapshot?.accounts ?? [],
    totalInvested: snapshot?.totalInvested ?? 0,
    allocation: snapshot?.allocation ?? [],
    recentMovements: snapshot?.recentMovements ?? [],
    summary: snapshot?.summary ?? { accountsCount: 0, activeAccountsCount: 0, assetsCount: 0 },
    isLoading,
    isCreatingAccount,
    isCreatingAsset,
    isRecordingMovement,
    error,
    refresh,
    createAccount,
    createAsset,
    recordMovement,
  }
}
