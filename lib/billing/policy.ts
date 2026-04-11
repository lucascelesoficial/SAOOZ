import { getBillingAccess, getUpgradeHref } from '@/lib/billing/access'
import { getPlanDefinition } from '@/lib/billing/plans'
import { getBillingSnapshot } from '@/lib/billing/server'
import type { BillingSnapshot } from '@/lib/billing/server'

type ModuleScope = 'personal' | 'business'

export type PlanPolicyBlockCode =
  | 'subscription_inactive'
  | 'payment_pending'
  | 'personal_module_locked'
  | 'business_module_locked'
  | 'business_limit_reached'
  | 'ai_limit_reached'
  | 'transaction_limit_reached'

export interface PlanPolicyBlock {
  code: PlanPolicyBlockCode
  message: string
  upgradeHref?: string
}

export interface UserAccessPolicy {
  userId: string
  subscriptionStatus: BillingSnapshot['subscription']['status']
  lifecycleStatus: BillingSnapshot['lifecycleStatus']
  planType: BillingSnapshot['subscription']['plan_type']
  hasProductAccess: boolean
  modules: {
    personal: boolean
    business: boolean
  }
  maxBusinessAccounts: number
  premiumPermissions: {
    advancedInsights: boolean
    unlimitedAi: boolean
  }
  limits: {
    aiActions: number | null
    transactions: number | null
  }
  usage: {
    aiActionsUsed: number
    transactionsUsed: number
  }
  canCreateBusiness: boolean
  businessLimitReached: boolean
  blocks: PlanPolicyBlock[]
  snapshot: BillingSnapshot
}

interface BuildPolicyOptions {
  businessCount?: number
}

function buildPlanPolicy(
  userId: string,
  snapshot: BillingSnapshot,
  options?: BuildPolicyOptions
): UserAccessPolicy {
  const access = getBillingAccess(snapshot)
  const plan = getPlanDefinition(snapshot.subscription.plan_type)
  const businessCount = options?.businessCount ?? 0
  const businessLimitReached =
    access.businessModule &&
    access.maxBusinessAccounts > 0 &&
    businessCount >= access.maxBusinessAccounts

  const blocks: PlanPolicyBlock[] = []

  if (snapshot.lifecycleStatus === 'past_due') {
    blocks.push({
      code: 'payment_pending',
      message: 'Seu pagamento esta pendente. Atualize o plano para liberar todos os recursos.',
      upgradeHref: '/planos',
    })
  } else if (snapshot.lifecycleStatus === 'inactive' || snapshot.lifecycleStatus === 'expired') {
    blocks.push({
      code: 'subscription_inactive',
      message: 'Sua assinatura esta inativa. Atualize o plano para voltar ao acesso completo.',
      upgradeHref: '/planos',
    })
  }

  if (!access.personalModule) {
    blocks.push({
      code: 'personal_module_locked',
      message: 'Seu plano atual nao libera o modulo PF.',
      upgradeHref: getUpgradeHref('personal'),
    })
  }

  if (!access.businessModule) {
    blocks.push({
      code: 'business_module_locked',
      message: 'Seu plano atual nao libera o modulo PJ.',
      upgradeHref: getUpgradeHref('business'),
    })
  }

  if (businessLimitReached) {
    blocks.push({
      code: 'business_limit_reached',
      message: 'Limite de contas empresariais atingido para seu ciclo atual.',
      upgradeHref: getUpgradeHref('business_limit'),
    })
  }

  if (snapshot.aiActionsLimit !== null && snapshot.usage.ai_actions_used >= snapshot.aiActionsLimit) {
    blocks.push({
      code: 'ai_limit_reached',
      message: 'Voce atingiu o limite mensal de acoes de IA do seu plano.',
      upgradeHref: '/planos',
    })
  }

  if (
    snapshot.transactionsLimit !== null &&
    snapshot.usage.transactions_used >= snapshot.transactionsLimit
  ) {
    blocks.push({
      code: 'transaction_limit_reached',
      message: 'Voce atingiu o limite mensal de lancamentos do seu plano atual.',
      upgradeHref: '/planos',
    })
  }

  return {
    userId,
    subscriptionStatus: snapshot.subscription.status,
    lifecycleStatus: snapshot.lifecycleStatus,
    planType: snapshot.subscription.plan_type,
    hasProductAccess: snapshot.premiumAccess,
    modules: {
      personal: access.personalModule,
      business: access.businessModule,
    },
    maxBusinessAccounts: access.maxBusinessAccounts,
    premiumPermissions: {
      advancedInsights: access.advancedInsights,
      unlimitedAi: plan.aiActionsLimit === null,
    },
    limits: {
      aiActions: snapshot.aiActionsLimit,
      transactions: snapshot.transactionsLimit,
    },
    usage: {
      aiActionsUsed: snapshot.usage.ai_actions_used,
      transactionsUsed: snapshot.usage.transactions_used,
    },
    canCreateBusiness: access.canCreateBusiness && !businessLimitReached,
    businessLimitReached,
    blocks,
    snapshot,
  }
}

export async function resolveUserAccessPolicy(
  userId: string,
  options?: BuildPolicyOptions
): Promise<UserAccessPolicy> {
  const snapshot = await getBillingSnapshot(userId)
  return buildPlanPolicy(userId, snapshot, options)
}

export function resolveUserAccessPolicyFromSnapshot(
  userId: string,
  snapshot: BillingSnapshot,
  options?: BuildPolicyOptions
) {
  return buildPlanPolicy(userId, snapshot, options)
}

export function getPolicyBlock(
  policy: UserAccessPolicy,
  code: PlanPolicyBlockCode
) {
  return policy.blocks.find((block) => block.code === code) ?? null
}

export function canAccessScope(policy: UserAccessPolicy, scope: ModuleScope) {
  if (scope === 'business') {
    return policy.modules.business
  }

  return policy.modules.personal
}
