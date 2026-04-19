/**
 * SAOOZ — Pluggy API Client
 *
 * Wraps Pluggy's REST API with typed responses and an in-memory token cache.
 * The API key expires after 2 hours; we cache it for 55 minutes to be safe.
 */

const BASE_URL = 'https://api.pluggy.ai'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PluggyConnector {
  id: number
  name: string
  imageUrl: string | null
}

export interface PluggyItem {
  id: string
  connector: PluggyConnector
  status: 'UPDATED' | 'UPDATING' | 'WAITING_USER_INPUT' | 'LOGIN_ERROR' | 'OUTDATED' | 'ERROR'
  statusDetail: string | null
  lastUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  error: { code: string; message: string } | null
}

export interface PluggyAccount {
  id: string
  itemId: string
  name: string
  type: 'BANK' | 'CREDIT' | 'INVESTMENT'
  subtype: string | null
  number: string | null
  balance: number
  currencyCode: string
  owner: string | null
  taxNumber: string | null
}

export interface PluggyTransaction {
  id: string
  accountId: string
  description: string | null
  descriptionRaw: string | null
  currencyCode: string
  amount: number
  amountInAccountCurrency: number | null
  date: string          // ISO date string
  balance: number | null
  category: string | null
  categoryId: string | null
  type: 'DEBIT' | 'CREDIT'
  status: 'POSTED' | 'PENDING'
  paymentData: unknown | null
}

interface PluggyTransactionPage {
  total: number
  totalPages: number
  page: number
  results: PluggyTransaction[]
}

// ── In-memory token cache ─────────────────────────────────────────────────────

interface TokenCache {
  apiKey: string
  expiresAt: number
}

let _tokenCache: TokenCache | null = null
const TOKEN_TTL_MS = 55 * 60 * 1000 // 55 minutes (Pluggy tokens live 2h)

// ── Internal fetch helper ─────────────────────────────────────────────────────

async function pluggyFetch<T>(
  path: string,
  options: RequestInit & { apiKey?: string } = {}
): Promise<T> {
  const { apiKey, ...fetchOptions } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  }

  if (apiKey) {
    headers['X-API-KEY'] = apiKey
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Pluggy API ${path} → ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Authenticate with Pluggy and return a cached API key.
 */
export async function getApiKey(): Promise<string> {
  const now = Date.now()

  if (_tokenCache && _tokenCache.expiresAt > now) {
    return _tokenCache.apiKey
  }

  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET not configured.')
  }

  const data = await pluggyFetch<{ apiKey: string }>('/auth', {
    method: 'POST',
    body: JSON.stringify({ clientId, clientSecret }),
  })

  _tokenCache = { apiKey: data.apiKey, expiresAt: now + TOKEN_TTL_MS }

  return data.apiKey
}

/**
 * Get a short-lived connect token for the Pluggy Connect widget.
 * If itemId is provided, the widget opens in "update" mode for that item.
 */
export async function getConnectToken(itemId?: string): Promise<string> {
  const apiKey = await getApiKey()

  const body: Record<string, string> = {}
  if (itemId) body.itemId = itemId

  const data = await pluggyFetch<{ accessToken: string }>('/connect_token', {
    method: 'POST',
    apiKey,
    body: JSON.stringify(body),
  })

  return data.accessToken
}

/**
 * List all items (connected banks) for the authenticated API key.
 * Note: Pluggy items are scoped to the API credentials, not the end-user,
 * so we filter by the user's stored pluggy_item_ids from Supabase.
 */
export async function getItem(apiKey: string, itemId: string): Promise<PluggyItem> {
  return pluggyFetch<PluggyItem>(`/items/${itemId}`, { apiKey })
}

/**
 * Delete an item from Pluggy.
 */
export async function deleteItem(apiKey: string, itemId: string): Promise<void> {
  await pluggyFetch<void>(`/items/${itemId}`, { method: 'DELETE', apiKey })
}

/**
 * List accounts for a given item.
 */
export async function getAccounts(apiKey: string, itemId: string): Promise<PluggyAccount[]> {
  const data = await pluggyFetch<{ total: number; results: PluggyAccount[] }>(
    `/accounts?itemId=${itemId}`,
    { apiKey }
  )
  return data.results
}

/**
 * Fetch all transactions for an account within a date range.
 * Handles pagination automatically (up to 500 transactions per request).
 */
export async function getTransactions(
  apiKey: string,
  accountId: string,
  from: string,
  to: string
): Promise<PluggyTransaction[]> {
  const all: PluggyTransaction[] = []
  let page = 1

  while (true) {
    const params = new URLSearchParams({
      accountId,
      from,
      to,
      pageSize: '500',
      page: String(page),
    })

    const data = await pluggyFetch<PluggyTransactionPage>(
      `/transactions?${params.toString()}`,
      { apiKey }
    )

    all.push(...data.results)

    if (page >= data.totalPages) break
    page++
  }

  return all
}
