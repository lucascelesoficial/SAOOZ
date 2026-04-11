import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { aiActionExecutionSchema } from '@/lib/ai/schemas'
import { canAccessScope, resolveUserAccessPolicy } from '@/lib/billing/policy'
import { consumeAiAction, BillingLimitError } from '@/lib/billing/server'
import {
  ACTIVE_BUSINESS_COOKIE,
  isMissingActiveBusinessColumnError,
} from '@/lib/business/active-business'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit, requireUser } from '@/lib/server/request-guard'
import type { Database, Json } from '@/types/database.types'

export const dynamic = 'force-dynamic'

async function writeAuditLog(input: {
  userId: string
  actionType: string
  resourceType: string
  resourceId?: string | null
  metadata: Json
}) {
  try {
    const admin = createOptionalAdminClient()
    if (!admin) {
      return
    }

    await admin.from('audit_logs').insert({
      user_id: input.userId,
      actor_type: 'ai',
      action_type: input.actionType,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      metadata: input.metadata,
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

function isTransactionLimitError(message: string) {
  return message.includes('transaction_limit_reached')
}

function isScopeLockedError(message: string) {
  return message.includes('personal_scope_locked') || message.includes('business_scope_locked')
}

async function resolveActiveBusinessId(input: {
  userId: string
  profile: { active_business_id?: string | null } | null
  supabase: Awaited<ReturnType<typeof createClient>>
}) {
  const profileActiveBusinessId = input.profile?.active_business_id ?? null

  if (profileActiveBusinessId) {
    return profileActiveBusinessId
  }

  const cookieStore = await cookies()
  const cookieBusinessId = cookieStore.get(ACTIVE_BUSINESS_COOKIE)?.value ?? null

  if (cookieBusinessId) {
    const { data: cookieBusiness } = await input.supabase
      .from('business_profiles')
      .select('id')
      .eq('id', cookieBusinessId)
      .eq('user_id', input.userId)
      .maybeSingle()

    if (cookieBusiness?.id) {
      return cookieBusiness.id
    }
  }

  const { data: firstBusiness } = await input.supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', input.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return firstBusiness?.id ?? null
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) {
    return auth.response
  }

  const rate = enforceRateLimit({
    scope: 'ai-action',
    user: auth.user,
    maxRequests: 20,
    windowMs: 60_000,
  })

  if (!rate.ok) {
    return rate.response
  }

  try {
    const body = await request.json()
    const parsed = aiActionExecutionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Proposta de ação inválida.' }, { status: 400 })
    }

    const policy = await resolveUserAccessPolicy(auth.user.id)
    const aiLimit = policy.limits.aiActions

    if (aiLimit !== null && policy.usage.aiActionsUsed >= aiLimit) {
      throw new BillingLimitError(
        'Você atingiu o limite mensal de ações de IA do seu plano atual.',
        'ai_limit_reached',
        aiLimit
      )
    }

    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.user.id)
      .single()

    if (profileError && !isMissingActiveBusinessColumnError(profileError.message)) {
      throw new Error(profileError.message)
    }

    const { proposal, month } = parsed.data

    if (proposal.scope === 'business' && !canAccessScope(policy, 'business')) {
      return NextResponse.json(
        {
          error: 'Seu plano atual não libera ações empresariais por IA.',
          code: 'business_scope_locked',
          upgradeRequired: true,
          upgradeHref: '/planos?feature=business',
        },
        { status: 403 }
      )
    }

    if (proposal.scope === 'personal' && !canAccessScope(policy, 'personal')) {
      return NextResponse.json(
        {
          error: 'Seu plano atual não libera ações pessoais por IA.',
          code: 'personal_scope_locked',
          upgradeRequired: true,
          upgradeHref: '/planos?feature=personal',
        },
        { status: 403 }
      )
    }

    const activeBusinessId = await resolveActiveBusinessId({
      userId: auth.user.id,
      profile: profile as { active_business_id?: string | null } | null,
      supabase,
    })

    let resourceType = ''
    let resourceId: string | null = null
    let label = ''
    let text = proposal.message

    if (proposal.action === 'add_expense') {
      if (proposal.scope === 'business') {
        if (!activeBusinessId) {
          return NextResponse.json(
            { error: 'Selecione uma empresa ativa antes de registrar despesas empresariais.' },
            { status: 400 }
          )
        }

        const payload: Database['public']['Tables']['business_expenses']['Insert'] = {
          user_id: auth.user.id,
          business_id: activeBusinessId,
          category:
            proposal.category as Database['public']['Tables']['business_expenses']['Insert']['category'],
          amount: proposal.amount,
          description: proposal.description ?? proposal.category,
          month,
        }

        const { data, error } = await supabase
          .from('business_expenses')
          .insert(payload)
          .select('id')
          .single()

        if (error) {
          throw new Error(error.message)
        }

        resourceType = 'business_expenses'
        resourceId = data.id
        label = `Despesa empresarial registrada: R$ ${proposal.amount.toFixed(2)}`
        text = proposal.message || 'Despesa empresarial registrada com sucesso.'
      } else {
        const payload: Database['public']['Tables']['expenses']['Insert'] = {
          user_id: auth.user.id,
          category: proposal.category as Database['public']['Tables']['expenses']['Insert']['category'],
          amount: proposal.amount,
          description: proposal.description ?? proposal.category,
          month,
        }

        const { data, error } = await supabase
          .from('expenses')
          .insert(payload)
          .select('id')
          .single()

        if (error) {
          throw new Error(error.message)
        }

        resourceType = 'expenses'
        resourceId = data.id
        label = `Despesa registrada: R$ ${proposal.amount.toFixed(2)}`
        text = proposal.message || 'Despesa registrada com sucesso.'
      }
    }

    if (proposal.action === 'add_income') {
      if (proposal.scope === 'business') {
        if (!activeBusinessId) {
          return NextResponse.json(
            { error: 'Selecione uma empresa ativa antes de registrar receitas empresariais.' },
            { status: 400 }
          )
        }

        const payload: Database['public']['Tables']['business_revenues']['Insert'] = {
          user_id: auth.user.id,
          business_id: activeBusinessId,
          category:
            proposal.category as Database['public']['Tables']['business_revenues']['Insert']['category'],
          amount: proposal.amount,
          description: proposal.description ?? proposal.category ?? 'Receita',
          month,
        }

        const { data, error } = await supabase
          .from('business_revenues')
          .insert(payload)
          .select('id')
          .single()

        if (error) {
          throw new Error(error.message)
        }

        resourceType = 'business_revenues'
        resourceId = data.id
        label = `Receita empresarial registrada: R$ ${proposal.amount.toFixed(2)}`
        text = proposal.message || 'Receita empresarial registrada com sucesso.'
      } else {
        const payload: Database['public']['Tables']['income_sources']['Insert'] = {
          user_id: auth.user.id,
          type: proposal.type as Database['public']['Tables']['income_sources']['Insert']['type'],
          amount: proposal.amount,
          name: proposal.name!,
          active: true,
          month,
        }

        const { data, error } = await supabase
          .from('income_sources')
          .insert(payload)
          .select('id')
          .single()

        if (error) {
          throw new Error(error.message)
        }

        resourceType = 'income_sources'
        resourceId = data.id
        label = `Renda registrada: R$ ${proposal.amount.toFixed(2)}`
        text = proposal.message || 'Renda registrada com sucesso.'
      }
    }

    await consumeAiAction(auth.user.id)

    await writeAuditLog({
      userId: auth.user.id,
      actionType: 'ai_action_executed',
      resourceType,
      resourceId,
      metadata: {
        month,
        proposal,
      } as Json,
    })

    return NextResponse.json({
      ok: true,
      text,
      label,
      resourceId,
      resourceType,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'

    if (error instanceof BillingLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          limit: error.limit,
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    if (isTransactionLimitError(message)) {
      return NextResponse.json(
        {
          error: 'Seu limite atual de lançamentos foi atingido. Faça upgrade para continuar registrando.',
          code: 'transaction_limit_reached',
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    if (isScopeLockedError(message)) {
      const isBusinessLock = message.includes('business_scope_locked')
      return NextResponse.json(
        {
          error: isBusinessLock
            ? 'Seu plano atual nao permite lancamentos empresariais.'
            : 'Seu plano atual nao permite lancamentos pessoais.',
          code: isBusinessLock ? 'business_scope_locked' : 'personal_scope_locked',
          upgradeRequired: true,
          upgradeHref: isBusinessLock ? '/planos?feature=business' : '/planos?feature=personal',
        },
        { status: 403 }
      )
    }

    console.error('AI action route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
