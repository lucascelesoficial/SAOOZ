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

function buildReserveQuery(input: {
  scope: ReserveScope
  month: string
  businessId?: string | null
}) {
  const params = new URLSearchParams({
    scope: input.scope,
    month: input.month,
  })

  if (input.businessId) {
    params.set('businessId', input.businessId)
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
  }, [isEnabled, options.businessId, options.scope, selectedMonth])

  useEffect(() => {
    void refresh()
  }, [refresh])

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
    [isEnabled, options.businessId, options.scope, refresh, selectedMonth]
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
    [isEnabled, options.businessId, options.scope, refresh, selectedMonth]
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
  }
}
