import { createHash, createHmac, randomUUID } from 'crypto'
import { z } from 'zod'
import type { Json, PaymentMethod, SubscriptionPlanType } from '@/types/database.types'
import type {
  BillingDurationMonths,
  CheckoutInput,
  CheckoutResult,
  ParsedProviderWebhookEvent,
  PaymentProvider,
  ProviderPaymentReferences,
  ProviderWebhookInput,
  ResolvePaymentReferencesInput,
} from './types'

const DEFAULT_CAKTO_API_URL = 'https://api.cakto.com.br'
const DEFAULT_CAKTO_CHECKOUT_BASE_URL = 'https://pay.cakto.com.br'
const CONTEXT_TOKEN_PREFIX = 'saooz_ctx:'
const CAKTO_ACTIVATION_EVENTS = new Set(['purchase_approved', 'subscription_renewed'])

const durationSchema = z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])
const paymentMethodSchema = z.enum(['card', 'pix'])
const planTypeSchema = z.enum(['pf', 'pj', 'pro'])

const caktoCheckoutContextSchema = z.object({
  v: z.literal(1),
  u: z.string().min(1),
  p: planTypeSchema,
  d: durationSchema,
  m: paymentMethodSchema,
  t: z.number().int().positive(),
  n: z.string().min(1),
})

const caktoWebhookDataSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional().nullable(),
    refId: z.string().optional().nullable(),
    amount: z.union([z.number(), z.string()]).optional().nullable(),
    status: z.string().optional().nullable(),
    paymentMethod: z.string().optional().nullable(),
    checkout: z.union([z.string(), z.number()]).optional().nullable(),
    checkoutUrl: z.string().url().optional().nullable(),
    subscription: z
      .union([
        z.string(),
        z
          .object({
            id: z.union([z.string(), z.number()]).optional().nullable(),
          })
          .passthrough(),
        z.null(),
      ])
      .optional()
      .nullable(),
    customer: z
      .object({
        id: z.union([z.string(), z.number()]).optional().nullable(),
        email: z.string().email().optional().nullable(),
      })
      .passthrough()
      .optional()
      .nullable(),
    offer: z
      .object({
        id: z.string().optional().nullable(),
      })
      .passthrough()
      .optional()
      .nullable(),
    sck: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    paidAt: z.string().optional().nullable(),
  })
  .passthrough()

const caktoWebhookPayloadSchema = z
  .object({
    event: z.string().min(1),
    secret: z.string().optional().nullable(),
    data: caktoWebhookDataSchema.optional().nullable(),
  })
  .passthrough()

const caktoTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().optional(),
})

const caktoOfferSchema = z.object({
  id: z.string().min(1),
  status: z.string().optional(),
})

const PLAN_CODES: SubscriptionPlanType[] = ['pf', 'pj', 'pro']
const BILLING_DURATIONS: BillingDurationMonths[] = [1, 3, 6, 12]
const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'card']

type CheckoutMap = Record<
  SubscriptionPlanType,
  Partial<Record<`${BillingDurationMonths}`, Partial<Record<PaymentMethod, string>>>>
>

interface ResolvedCheckoutTarget {
  checkoutUrl: string
  offerId: string | null
}

interface ParsedCheckoutContext {
  userId: string
  planType: SubscriptionPlanType
  durationMonths: BillingDurationMonths
  paymentMethod: PaymentMethod
}

let cachedCaktoAccessToken:
  | {
      value: string
      expiresAt: number
    }
  | null = null

function coerceString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim() || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function coerceAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = Number.parseFloat(value.replace(',', '.'))
    if (Number.isFinite(normalized)) {
      return normalized
    }
  }

  return null
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function parseJsonSafely(raw: string): Json | null {
  try {
    return JSON.parse(raw) as Json
  } catch {
    return null
  }
}

function parseCheckoutMapFromEnv() {
  const raw = process.env.CAKTO_CHECKOUT_MAP_JSON
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CheckoutMap
  } catch {
    throw new Error('CAKTO_CHECKOUT_MAP_JSON is not valid JSON.')
  }
}

function hasCheckoutTargetConfig() {
  if (process.env.CAKTO_CHECKOUT_MAP_JSON) {
    return true
  }

  for (const plan of PLAN_CODES) {
    for (const duration of BILLING_DURATIONS) {
      for (const method of PAYMENT_METHODS) {
        const envKey = `CAKTO_CHECKOUT_${plan.toUpperCase()}_${duration}_${method.toUpperCase()}`
        if (process.env[envKey]) {
          return true
        }
      }
    }
  }

  return false
}

function resolveCheckoutTargetFromMap(
  planType: SubscriptionPlanType,
  durationMonths: BillingDurationMonths,
  paymentMethod: PaymentMethod
) {
  const map = parseCheckoutMapFromEnv()
  const fromMap = map?.[planType]?.[String(durationMonths) as `${BillingDurationMonths}`]?.[paymentMethod]
  if (fromMap && fromMap.trim().length > 0) {
    return fromMap.trim()
  }

  const envKey = `CAKTO_CHECKOUT_${planType.toUpperCase()}_${durationMonths}_${paymentMethod.toUpperCase()}`
  const envValue = process.env[envKey]
  if (envValue && envValue.trim().length > 0) {
    return envValue.trim()
  }

  return null
}

function extractOfferIdFromCheckoutUrl(rawCheckoutUrl: string | null) {
  if (!rawCheckoutUrl) {
    return null
  }

  try {
    const url = new URL(rawCheckoutUrl)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] ?? null
  } catch {
    return null
  }
}

function normalizeCheckoutTarget(rawTarget: string): ResolvedCheckoutTarget {
  if (/^https?:\/\//i.test(rawTarget)) {
    const parsed = new URL(rawTarget)
    return {
      checkoutUrl: parsed.toString(),
      offerId: extractOfferIdFromCheckoutUrl(parsed.toString()),
    }
  }

  const offerId = rawTarget.trim()
  if (!offerId) {
    throw new Error('Cakto checkout target is empty.')
  }

  const baseCheckoutUrl = process.env.CAKTO_CHECKOUT_BASE_URL ?? DEFAULT_CAKTO_CHECKOUT_BASE_URL
  const normalizedBase = baseCheckoutUrl.endsWith('/')
    ? baseCheckoutUrl.slice(0, -1)
    : baseCheckoutUrl

  return {
    checkoutUrl: `${normalizedBase}/${offerId}`,
    offerId,
  }
}

function parsePaymentMethod(value: string | null | undefined): PaymentMethod | null {
  if (!value) {
    return null
  }

  const normalized = value.toLowerCase()
  if (normalized === 'credit_card' || normalized === 'card') {
    return 'card'
  }

  if (normalized === 'pix' || normalized === 'pix_auto') {
    return 'pix'
  }

  return null
}

function maybeExtractContextToken(data: z.infer<typeof caktoWebhookDataSchema>) {
  const sck = coerceString(data.sck)
  if (sck) {
    return sck
  }

  const utmContent = coerceString(data.utm_content)
  if (!utmContent) {
    return null
  }

  if (utmContent.startsWith(CONTEXT_TOKEN_PREFIX)) {
    return utmContent.slice(CONTEXT_TOKEN_PREFIX.length)
  }

  return utmContent
}

export class CaktoProvider implements PaymentProvider {
  gateway = 'cakto' as const

  private readonly apiUrl: string
  private readonly clientId: string | null
  private readonly clientSecret: string | null
  private readonly webhookSecret: string | null
  private readonly contextSigningSecret: string | null

  constructor(
    options?: {
      apiUrl?: string | null
      clientId?: string | null
      clientSecret?: string | null
      webhookSecret?: string | null
      contextSigningSecret?: string | null
    }
  ) {
    this.apiUrl = options?.apiUrl ?? process.env.CAKTO_API_URL ?? DEFAULT_CAKTO_API_URL
    this.clientId = options?.clientId ?? process.env.CAKTO_CLIENT_ID ?? null
    this.clientSecret = options?.clientSecret ?? process.env.CAKTO_CLIENT_SECRET ?? null
    this.webhookSecret = options?.webhookSecret ?? process.env.CAKTO_WEBHOOK_SECRET ?? null
    this.contextSigningSecret =
      options?.contextSigningSecret ??
      process.env.CAKTO_CONTEXT_SIGNING_SECRET ??
      this.webhookSecret
  }

  isConfigured() {
    return Boolean(
      this.contextSigningSecret &&
        this.webhookSecret &&
        hasCheckoutTargetConfig()
    )
  }

  supportsPaymentMethod(method: PaymentMethod) {
    return method === 'card' || method === 'pix'
  }

  resolvePaymentReferences(input: ResolvePaymentReferencesInput): ProviderPaymentReferences {
    return {
      checkoutSessionId: input.checkoutSessionId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      providerPaymentId: input.providerPaymentId ?? null,
      providerCustomerId: input.providerCustomerId ?? null,
      providerReference:
        input.providerReference ??
        input.providerPaymentId ??
        input.checkoutSessionId ??
        null,
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const target = resolveCheckoutTargetFromMap(
      input.planType,
      input.durationMonths,
      input.paymentMethod
    )

    if (!target) {
      throw new Error(
        `Cakto checkout target not configured for ${input.planType}/${input.durationMonths}/${input.paymentMethod}.`
      )
    }

    if (!this.contextSigningSecret) {
      throw new Error(
        'CAKTO context signing secret is not configured (CAKTO_CONTEXT_SIGNING_SECRET or CAKTO_WEBHOOK_SECRET).'
      )
    }

    const normalizedTarget = normalizeCheckoutTarget(target)
    if (normalizedTarget.offerId) {
      await this.ensureOfferIsAvailable(normalizedTarget.offerId)
    }

    const contextToken = this.createCheckoutContextToken({
      userId: input.userId,
      planType: input.planType,
      durationMonths: input.durationMonths,
      paymentMethod: input.paymentMethod,
    })

    const trackedCheckoutUrl = new URL(normalizedTarget.checkoutUrl)
    trackedCheckoutUrl.searchParams.set('utm_source', 'saooz')
    trackedCheckoutUrl.searchParams.set('utm_medium', 'billing')
    trackedCheckoutUrl.searchParams.set(
      'utm_campaign',
      `${input.planType}-${input.durationMonths}-${input.paymentMethod}`
    )
    trackedCheckoutUrl.searchParams.set('utm_content', `${CONTEXT_TOKEN_PREFIX}${contextToken}`)
    trackedCheckoutUrl.searchParams.set('sck', contextToken)

    if (input.userEmail && !trackedCheckoutUrl.searchParams.get('email')) {
      trackedCheckoutUrl.searchParams.set('email', input.userEmail)
    }

    return {
      gateway: this.gateway,
      checkoutUrl: trackedCheckoutUrl.toString(),
      references: this.resolvePaymentReferences({
        checkoutSessionId: normalizedTarget.offerId,
        providerReference: normalizedTarget.offerId ?? trackedCheckoutUrl.toString(),
      }),
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId
    throw new Error(
      'Cakto public API does not expose subscription cancellation endpoint in current docs. Cancellation must be handled in Cakto panel or operator workflow.'
    )
  }

  async parseWebhookEvent(input: ProviderWebhookInput): Promise<ParsedProviderWebhookEvent | null> {
    const hasCaktoHeaders =
      !!input.headers.get('x-cakto-signature') ||
      !!input.headers.get('x-cakto-event-id') ||
      !!input.headers.get('x-cakto-event')

    const parsedJson = parseJsonSafely(input.rawBody)
    const parsedPayload = caktoWebhookPayloadSchema.safeParse(parsedJson)

    const hasBodySignal =
      parsedPayload.success && !!parsedPayload.data.event && !!parsedPayload.data.data

    if (!hasCaktoHeaders && !hasBodySignal) {
      return null
    }

    if (!parsedPayload.success) {
      throw new Error(`Invalid Cakto webhook payload: ${parsedPayload.error.message}`)
    }

    if (!this.webhookSecret) {
      throw new Error('CAKTO_WEBHOOK_SECRET is not configured.')
    }

    const incomingSecret = coerceString(parsedPayload.data.secret)
    if (!incomingSecret || incomingSecret !== this.webhookSecret) {
      throw new Error('Invalid Cakto webhook secret.')
    }

    const eventType = parsedPayload.data.event
    const data = parsedPayload.data.data ?? {}
    const orderId = coerceString(data.id)
    const fallbackEventIdSeed = orderId ?? coerceString(data.refId) ?? coerceString(data.checkout)
    const headerEventId = input.headers.get('x-cakto-event-id')
    const eventId =
      coerceString(headerEventId) ??
      (fallbackEventIdSeed ? `${eventType}:${fallbackEventIdSeed}` : null) ??
      `${eventType}:${createHash('sha256').update(input.rawBody).digest('hex')}`

    const references = this.resolvePaymentReferences({
      checkoutSessionId:
        coerceString(data.checkout) ??
        data.offer?.id ??
        extractOfferIdFromCheckoutUrl(coerceString(data.checkoutUrl)),
      providerSubscriptionId:
        typeof data.subscription === 'string'
          ? data.subscription
          : coerceString(data.subscription?.id),
      providerPaymentId: orderId ?? coerceString(data.refId),
      providerCustomerId: coerceString(data.customer?.id),
      providerReference: coerceString(data.refId) ?? orderId ?? coerceString(data.checkoutUrl),
    })

    const externalEvent = {
      provider: this.gateway,
      eventId,
      eventType,
      payload: parsedPayload.data as unknown as Json,
    }

    if (!CAKTO_ACTIVATION_EVENTS.has(eventType)) {
      return {
        externalEvent,
        relatedUserId: null,
        domainEvent: {
          kind: 'noop',
          reason: `cakto_event_not_supported:${eventType}`,
        },
      }
    }

    const contextToken = maybeExtractContextToken(data)
    if (!contextToken) {
      throw new Error(
        'Cakto webhook payload is missing SAOOZ context token (sck or utm_content).'
      )
    }

    const checkoutContext = this.parseCheckoutContextToken(contextToken)
    const methodFromEvent = parsePaymentMethod(coerceString(data.paymentMethod))
    const resolvedPaymentMethod = methodFromEvent ?? checkoutContext.paymentMethod

    if (!resolvedPaymentMethod) {
      throw new Error('Cakto webhook payment method is not supported.')
    }

    const amount = coerceAmount(data.amount)
    if (amount === null) {
      throw new Error('Cakto webhook amount is missing or invalid.')
    }

    return {
      externalEvent,
      relatedUserId: checkoutContext.userId,
      domainEvent: {
        kind: 'activate_subscription',
        payload: {
          userId: checkoutContext.userId,
          planType: checkoutContext.planType,
          durationMonths: checkoutContext.durationMonths,
          paymentMethod: resolvedPaymentMethod,
          gateway: this.gateway,
          providerEventId: eventId,
          providerEventType: eventType,
          providerSubscriptionId: references.providerSubscriptionId,
          providerPaymentId: references.providerPaymentId,
          providerCustomerId: references.providerCustomerId,
          providerReference: references.providerReference,
          amount,
        },
      },
    }
  }

  private createCheckoutContextToken(input: ParsedCheckoutContext) {
    if (!this.contextSigningSecret) {
      throw new Error('Cakto context signing secret is not configured.')
    }

    const payload = {
      v: 1 as const,
      u: input.userId,
      p: input.planType,
      d: input.durationMonths,
      m: input.paymentMethod,
      t: Date.now(),
      n: randomUUID().slice(0, 8),
    }

    const encodedPayload = toBase64Url(JSON.stringify(payload))
    const signature = createHmac('sha256', this.contextSigningSecret)
      .update(encodedPayload)
      .digest('base64url')

    return `v1.${encodedPayload}.${signature}`
  }

  private parseCheckoutContextToken(token: string): ParsedCheckoutContext {
    if (!this.contextSigningSecret) {
      throw new Error('Cakto context signing secret is not configured.')
    }

    const [version, payloadPart, signaturePart] = token.split('.')

    if (version !== 'v1' || !payloadPart || !signaturePart) {
      throw new Error('Invalid Cakto context token format.')
    }

    const expectedSignature = createHmac('sha256', this.contextSigningSecret)
      .update(payloadPart)
      .digest('base64url')

    if (expectedSignature !== signaturePart) {
      throw new Error('Invalid Cakto context token signature.')
    }

    let payloadRaw = ''
    try {
      payloadRaw = fromBase64Url(payloadPart)
    } catch {
      throw new Error('Invalid Cakto context token payload.')
    }

    const parsed = caktoCheckoutContextSchema.parse(JSON.parse(payloadRaw))

    return {
      userId: parsed.u,
      planType: parsed.p,
      durationMonths: parsed.d,
      paymentMethod: parsed.m,
    }
  }

  private async ensureOfferIsAvailable(offerId: string) {
    if (!this.clientId || !this.clientSecret) {
      return
    }

    const token = await this.getCaktoAccessToken()
    const response = await fetch(`${this.apiUrl}/public_api/offers/${offerId}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(
        `Cakto offer lookup failed (${response.status}) for offer ${offerId}. ${details}`.trim()
      )
    }

    const raw = await response.json().catch(() => null)
    const parsed = caktoOfferSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`Invalid Cakto offer payload: ${parsed.error.message}`)
    }

    if (parsed.data.status && parsed.data.status !== 'active') {
      throw new Error(`Cakto offer ${offerId} is not active (status: ${parsed.data.status}).`)
    }
  }

  private async getCaktoAccessToken() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('CAKTO_CLIENT_ID/CAKTO_CLIENT_SECRET are not configured.')
    }

    const now = Date.now()
    if (cachedCaktoAccessToken && cachedCaktoAccessToken.expiresAt > now + 30_000) {
      return cachedCaktoAccessToken.value
    }

    const body = new URLSearchParams()
    body.set('client_id', this.clientId)
    body.set('client_secret', this.clientSecret)

    const response = await fetch(`${this.apiUrl}/public_api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Cakto authentication failed (${response.status}). ${details}`.trim())
    }

    const raw = await response.json().catch(() => null)
    const parsed = caktoTokenResponseSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`Invalid Cakto auth payload: ${parsed.error.message}`)
    }

    const expiresIn = parsed.data.expires_in ?? 300
    cachedCaktoAccessToken = {
      value: parsed.data.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    }

    return parsed.data.access_token
  }
}
