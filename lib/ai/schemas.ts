import { z } from 'zod'

const personalExpenseCategorySchema = z.enum([
  'moradia',
  'alimentacao',
  'transporte',
  'saude',
  'educacao',
  'lazer',
  'assinaturas',
  'vestuario',
  'beleza',
  'pets',
  'dividas',
  'investimentos',
  'familia',
  'religiao',
  'variaveis',
  'outros',
])

const incomeTypeSchema = z.enum([
  'salario',
  'freela',
  'negocio',
  'aluguel',
  'investimento',
  'pensao',
  'outro',
])

const businessRevenueCategorySchema = z.enum([
  'servico',
  'produto',
  'recorrente',
  'comissao',
  'outro',
])

const businessExpenseCategorySchema = z.enum([
  'fixo_aluguel',
  'fixo_salarios',
  'fixo_prolabore',
  'fixo_contador',
  'fixo_software',
  'fixo_internet',
  'fixo_outros',
  'variavel_comissao',
  'variavel_frete',
  'variavel_embalagem',
  'variavel_trafego',
  'variavel_taxas',
  'variavel_outros',
  'operacional_marketing',
  'operacional_admin',
  'operacional_juridico',
  'operacional_manutencao',
  'operacional_viagem',
  'operacional_outros',
  'investimento_equipamento',
  'investimento_estoque',
  'investimento_expansao',
  'investimento_contratacao',
  'investimento_outros',
])

const baseActionSchema = z.object({
  message: z.string().trim().min(1).max(280),
})

export const aiReadOnlySchema = baseActionSchema.extend({
  action: z.literal('read_only'),
})

export const aiAddExpenseSchema = baseActionSchema
  .extend({
    action: z.literal('add_expense'),
    scope: z.enum(['personal', 'business']).default('personal'),
    amount: z.coerce.number().positive().max(1_000_000),
    category: z.string().trim().min(1),
    description: z.string().trim().max(160).optional(),
  })
  .superRefine((value, context) => {
    const schema =
      value.scope === 'business'
        ? businessExpenseCategorySchema
        : personalExpenseCategorySchema

    const result = schema.safeParse(value.category)
    if (!result.success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid expense category for the selected scope.',
        path: ['category'],
      })
    }
  })

export const aiAddIncomeSchema = baseActionSchema
  .extend({
    action: z.literal('add_income'),
    scope: z.enum(['personal', 'business']).default('personal'),
    amount: z.coerce.number().positive().max(1_000_000),
    type: z.string().trim().optional(),
    category: z.string().trim().optional(),
    name: z.string().trim().max(160).optional(),
    description: z.string().trim().max(160).optional(),
  })
  .superRefine((value, context) => {
    if (value.scope === 'personal') {
      const typeResult = incomeTypeSchema.safeParse(value.type)
      if (!typeResult.success) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid income type for personal scope.',
          path: ['type'],
        })
      }

      if (!value.name) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Income name is required for personal scope.',
          path: ['name'],
        })
      }

      return
    }

    const categoryResult = businessRevenueCategorySchema.safeParse(value.category)
    if (!categoryResult.success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid revenue category for business scope.',
        path: ['category'],
      })
    }
  })

export const aiActionSchema = z.discriminatedUnion('action', [
  aiReadOnlySchema,
  aiAddExpenseSchema,
  aiAddIncomeSchema,
])

export const aiActionExecutionSchema = z.object({
  proposal: z.union([aiAddExpenseSchema, aiAddIncomeSchema]),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type AIAction = z.infer<typeof aiActionSchema>
export type AIExecutableAction = z.infer<typeof aiAddExpenseSchema> | z.infer<typeof aiAddIncomeSchema>
export type AIActionExecutionInput = z.infer<typeof aiActionExecutionSchema>
