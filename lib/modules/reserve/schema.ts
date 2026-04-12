import { z } from 'zod'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const numberFromUnknown = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    if (!normalized.length) {
      return Number.NaN
    }
    return Number(normalized)
  }

  return Number.NaN
}

export const reserveScopeSchema = z.enum(['personal', 'business'])

export type ReserveScopeInput = z.infer<typeof reserveScopeSchema>

export const reserveQuerySchema = z.object({
  scope: reserveScopeSchema,
  month: z.string().regex(ISO_DATE_REGEX).optional(),
  businessId: z.string().uuid().optional(),
})

export const reserveTargetMutationSchema = z
  .object({
    scope: reserveScopeSchema,
    businessId: z.string().uuid().optional(),
    targetAmount: z.preprocess(numberFromUnknown, z.number().min(0)).optional(),
    initialAmount: z.preprocess(numberFromUnknown, z.number().min(0)).optional(),
    monthlyTargetContribution: z
      .union([
        z.preprocess(numberFromUnknown, z.number().min(0)),
        z.literal(null),
      ])
      .optional(),
    name: z.preprocess(normalizeOptionalText, z.string().min(2).max(120).nullable()).optional(),
    notes: z.preprocess(normalizeOptionalText, z.string().max(500).nullable()).optional(),
  })
  .refine(
    (value) =>
      value.targetAmount !== undefined ||
      value.initialAmount !== undefined ||
      value.monthlyTargetContribution !== undefined ||
      value.name !== undefined ||
      value.notes !== undefined,
    {
      message: 'Envie ao menos um campo para atualização.',
      path: ['targetAmount'],
    }
  )

export const reserveMovementMutationSchema = z.object({
  scope: reserveScopeSchema,
  businessId: z.string().uuid().optional(),
  entryType: z.enum(['aporte', 'resgate', 'ajuste']),
  amount: z.preprocess(numberFromUnknown, z.number().positive()),
  happenedOn: z.string().regex(ISO_DATE_REGEX).optional(),
  description: z.preprocess(normalizeOptionalText, z.string().max(240).nullable()).optional(),
})

export type ReserveQueryInput = z.infer<typeof reserveQuerySchema>
export type ReserveTargetMutationInput = z.infer<typeof reserveTargetMutationSchema>
export type ReserveMovementMutationInput = z.infer<typeof reserveMovementMutationSchema>
