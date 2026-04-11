import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type AdminClient = SupabaseClient<Database>

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type UsageRow = Database['public']['Tables']['usage_limits']['Row']
type PaymentRow = Database['public']['Tables']['payments']['Row']
type WebhookEventRow = Database['public']['Tables']['billing_webhook_events']['Row']

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50
const RECENT_ITEMS_LIMIT = 8

export interface PaginationInput {
  page: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BillingUserObservabilityView {
  profile: ProfileRow | null
  subscription: SubscriptionRow | null
  usage: UsageRow | null
  businessCount: number
  recentPayments: PaymentRow[]
  recentWebhookEvents: WebhookEventRow[]
}

export interface BillingObservabilityData {
  users: Pick<ProfileRow, 'id' | 'name' | 'email' | 'created_at'>[]
  selectedUserId: string | null
  selectedUserView: BillingUserObservabilityView | null
  webhookEvents: PaginatedResult<WebhookEventRow>
  payments: PaginatedResult<PaymentRow>
}

interface BillingObservabilityQueryInput {
  selectedUserId?: string | null
  webhookPagination: PaginationInput
  paymentsPagination: PaginationInput
}

function normalizePage(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1
  }

  return Math.floor(value)
}

function normalizePageSize(value: number | undefined) {
  if (!value || !Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(value)))
}

function computeRange(pagination: PaginationInput) {
  const page = normalizePage(pagination.page)
  const pageSize = normalizePageSize(pagination.pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  return { from, to, page, pageSize }
}

function toPaginatedResult<T>(
  items: T[] | null,
  totalCount: number | null,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    items: items ?? [],
    total,
    page,
    pageSize,
    totalPages,
  }
}

async function listUsers(admin: AdminClient) {
  const { data, error } = await admin
    .from('profiles')
    .select('id,name,email,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function readSelectedUserView(
  admin: AdminClient,
  userId: string
): Promise<BillingUserObservabilityView | null> {
  const [profileResult, subscriptionResult, usageResult, businessCountResult, paymentsResult, eventsResult] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
      admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      admin.from('usage_limits').select('*').eq('user_id', userId).maybeSingle(),
      admin
        .from('business_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      admin
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(RECENT_ITEMS_LIMIT),
      admin
        .from('billing_webhook_events')
        .select('*')
        .eq('related_user_id', userId)
        .order('received_at', { ascending: false })
        .limit(RECENT_ITEMS_LIMIT),
    ])

  if (profileResult.error) throw new Error(profileResult.error.message)
  if (subscriptionResult.error) throw new Error(subscriptionResult.error.message)
  if (usageResult.error) throw new Error(usageResult.error.message)
  if (businessCountResult.error) throw new Error(businessCountResult.error.message)
  if (paymentsResult.error) throw new Error(paymentsResult.error.message)
  if (eventsResult.error) throw new Error(eventsResult.error.message)

  if (!profileResult.data) {
    return null
  }

  return {
    profile: profileResult.data,
    subscription: subscriptionResult.data ?? null,
    usage: usageResult.data ?? null,
    businessCount: businessCountResult.count ?? 0,
    recentPayments: paymentsResult.data ?? [],
    recentWebhookEvents: eventsResult.data ?? [],
  }
}

async function listWebhookEvents(
  admin: AdminClient,
  pagination: PaginationInput
): Promise<PaginatedResult<WebhookEventRow>> {
  const { from, to, page, pageSize } = computeRange(pagination)
  const { data, error, count } = await admin
    .from('billing_webhook_events')
    .select('*', { count: 'exact' })
    .order('received_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return toPaginatedResult(data, count, page, pageSize)
}

async function listPayments(
  admin: AdminClient,
  pagination: PaginationInput
): Promise<PaginatedResult<PaymentRow>> {
  const { from, to, page, pageSize } = computeRange(pagination)
  const { data, error, count } = await admin
    .from('payments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return toPaginatedResult(data, count, page, pageSize)
}

export async function readBillingObservabilityData(
  admin: AdminClient,
  input: BillingObservabilityQueryInput
): Promise<BillingObservabilityData> {
  const users = await listUsers(admin)

  const selectedUserId = input.selectedUserId ?? users[0]?.id ?? null

  const [selectedUserView, webhookEvents, payments] = await Promise.all([
    selectedUserId ? readSelectedUserView(admin, selectedUserId) : Promise.resolve(null),
    listWebhookEvents(admin, input.webhookPagination),
    listPayments(admin, input.paymentsPagination),
  ])

  return {
    users,
    selectedUserId,
    selectedUserView,
    webhookEvents,
    payments,
  }
}
