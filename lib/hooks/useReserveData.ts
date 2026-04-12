'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppState } from '@/lib/context/AppStateContext'
import { toMonthQueryDate } from '@/lib/modules/_shared/month'
import type {
  ReserveModuleSnapshot,
  ReserveScope,
} from '@/lib/modules/reserve/service'
import type { ReserveEntryType } from '@/types/database.types'

interface UseReserveDataOptions {
  scope: ReserveScope
  businessId?: string | null
  enabled?: boolean
  reserveId?: string
}

interface UpdateReserveTargetInput {
  targetAmount?: number
  initialAmount?: number
  monthlyTargetContribution?: number | null
  name?: string | null
  notes?: string | null
}

interface CreateReserveMovementInput {
  entryType: ReserveEntryType
  amount: number
  happenedOn?: string
  description?: string | null
}

interface ReserveApiErrorPayload {
  error?: string
}

export interface ActiveReserveItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

function buildReserveQuery(input: {
  scope: ReserveScope
  month: string
  businessId?: string | null
  reserveId?: string
}) {
  const params = new URLSearchParams({
    scope: input.scope,
    month: input.month,
  })

  if (input.businessId) {
    params.set('businessId', input.businessId)
  }

  if (input.reserveId) {
    params.set('reserveId', input.reserveId)
  }

  return params.toString()
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as ReserveApiErrorPayload | null
  return payload?.error ?? fallbackMessage
}

export function useReserveData(options: UseReserveDataOptions) {
  const { currentMonth } = useAppState()
  const selectedMonth = useMemo(() => toMonthQueryDate(currentMonth), [currentMonth])
  const isBusinessWithoutSelection = options.scope === 'business' && !options.businessId
  const isEnabled = options.enabled ?? !isBusinessWithoutSelection

  const [snapshot, setSnapshot] = useState<ReserveModuleSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingTarget, setIsSavingTarget] = useState(false)
  const [isSavingMovement, setIsSavingMovement] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allReserves, setAllReserves] = useState<ActiveReserveItem[]>([])

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
      const query = buildReserveQuery({
        scope: options.scope,
        month: selectedMonth,
        businessId: options.businessId,
        reserveId: options.reserveId,
      })
      const response = await fetch(`/api/reserve/movements?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Falha ao carregar a reserva.'))
      }

      const payload = (await response.json()) as { snapshot?: ReserveModuleSnapshot }
      setSnapshot(payload.snapshot ?? null)
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Falha ao carregar a reserva.'
      setError(message)
      setSnapshot(null)
    } finally {
      setIsLoading(false)
    }
  }, [isEnabled, options.businessId, options.scope, options.reserveId, selectedMonth])

  const refreshReserveList = useCallback(async () => {
    try {
      const params = new URLSearchParams({ scope: options.scope })
      if (options.businessId) params.set('businessId', options.businessId)
      const response = await fetch(`/api/reserve/reserves?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })
      if (!response.ok) return
      const payload = (await response.json()) as { reserves?: ActiveReserveItem[] }
      setAllReserves(payload.reserves ?? [])
    } catch {
      // silently fail — list is not critical
    }
  }, [options.businessId, options.scope])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    void refreshReserveList()
  }, [refreshReserveList])

  const updateTarget = useCallback(
    async (input: UpdateReserveTargetInput) => {
      if (!isEnabled) {
        throw new Error('Reserve indisponivel para este escopo.')
      }

      setIsSavingTarget(true)
      setError(null)

      try {
        const query = buildReserveQuery({
          scope: options.scope,
          month: selectedMonth,
          businessId: options.businessId,
          reserveId: options.reserveId,
        })

        const response = await fetch(`/api/reserve/targets?${query}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scope: options.scope,
            businessId: options.businessId ?? undefined,
            ...input,
          }),
        })

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, 'Falha ao salvar configuracao da reserva.')
          )
        }

        await refresh()
      } finally {
        setIsSavingTarget(false)
      }
    },
    [isEnabled, options.businessId, options.scope, options.reserveId, refresh, selectedMonth]
  )

  const addMovement = useCallback(
    async (input: CreateReserveMovementInput) => {
      if (!isEnabled) {
        throw new Error('Reserve indisponivel para este escopo.')
      }

      setIsSavingMovement(true)
      setError(null)

      try {
        const query = buildReserveQuery({
          scope: options.scope,
          month: selectedMonth,
          businessId: options.businessId,
          reserveId: options.reserveId,
        })

        const response = await fetch(`/api/reserve/movements?${query}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scope: options.scope,
            businessId: options.businessId ?? undefined,
            ...input,
          }),
        })

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, 'Falha ao registrar movimentacao da reserva.')
          )
        }

        const payload = (await response.json()) as {
          snapshot?: ReserveModuleSnapshot
        }

        if (payload.snapshot) {
          setSnapshot(payload.snapshot)
        } else {
          await refresh()
        }
      } finally {
        setIsSavingMovement(false)
      }
    },
    [isEnabled, options.businessId, options.scope, options.reserveId, refresh, selectedMonth]
  )

  const createReserve = useCallback(
    async (input: { scope: ReserveScope; name: string; businessId?: string | null }) => {
      const response = await fetch('/api/reserve/reserves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: input.scope,
          businessId: input.businessId ?? null,
          name: input.name,
        }),
      })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Falha ao criar reserva.'))
      }
      const payload = (await response.json()) as { reserve?: { id: string } }
      await refreshReserveList()
      return payload.reserve ?? null
    },
    [refreshReserveList]
  )

  const deleteReserve = useCallback(
    async (reserveId: string) => {
      const response = await fetch(`/api/reserve/reserves?id=${reserveId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Falha ao excluir reserva.'))
      }
      await refreshReserveList()
    },
    [refreshReserveList]
  )

  return {
    selectedMonth,
    snapshot,
    reserve: snapshot?.reserve ?? null,
    metrics: snapshot?.metrics ?? null,
    suggestedTargets: snapshot?.suggestedTargets ?? null,
    movements: snapshot?.movements ?? [],
    isLoading,
    isSavingTarget,
    isSavingMovement,
    error,
    refresh,
    updateTarget,
    addMovement,
    allReserves,
    refreshReserveList,
    createReserve,
    deleteReserve,
  }
}
