import type {
  Json,
  BillingGateway,
  PaymentMethod,
  SubscriptionPlanType,
} from '@/types/database.types'

export type BillingDurationMonths = 1 | 3 | 6 | 12

export interface CheckoutInput {
  userId: string
  userEmail: string | null
  planType: SubscriptionPlanType
  durationMonths: BillingDurationMonths
  paymentMethod: PaymentMethod
  amountCents: number
  currency: string
  productName: string
  successUrl: string
  cancelUrl: string
}

export interface ProviderPaymentReferences {
  // checkoutSessionId is the checkout artifact (e.g. Stripe Checkout Session).
  // providerSubscriptionId is the recurring subscription artifact (when available).
  // providerPaymentId is the payment artifact (e.g. payment intent / charge / order).
  // providerCustomerId is the provider customer artifact when available.
  checkoutSessionId: string | null
  providerSubscriptionId: string | null
  providerPaymentId: string | null
  providerCustomerId: string | null
  providerReference: string | null
}

export interface CheckoutResult {
  gateway: BillingGateway
  checkoutUrl: string
  references: ProviderPaymentReferences
}

export interface ProviderWebhookInput {
  rawBody: string
  headers: Headers
}

export interface ProviderExternalEvent {
  provider: BillingGateway
  eventId: string
  eventType: string
  payload: Json
}

export interface BillingActivationDomainPayload {
  userId: string
  planType: SubscriptionPlanType
  durationMonths: BillingDurationMonths
  paymentMethod: PaymentMethod
  gateway: BillingGateway | null
  providerEventId: string
  providerEventType: string
  providerSubscriptionId: string | null
  providerPaymentId: string | null
  providerCustomerId: string | null
  providerReference: string | null
  amount: number
}

export type BillingDomainEvent =
  | { kind: 'activate_subscription'; payload: BillingActivationDomainPayload }
  | { kind: 'noop'; reason: string }

export interface ParsedProviderWebhookEvent {
  externalEvent: ProviderExternalEvent
  domainEvent: BillingDomainEvent
  relatedUserId: string | null
}

export interface ResolvePaymentReferencesInput {
  checkoutSessionId?: string | null
  providerSubscriptionId?: string | null
  providerPaymentId?: string | null
  providerCustomerId?: string | null
  providerReference?: string | null
}

export interface PaymentProvider {
  gateway: BillingGateway
  isConfigured(): boolean
  supportsPaymentMethod(method: PaymentMethod): boolean
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>
  cancelSubscription(subscriptionId: string): Promise<void>
  parseWebhookEvent(input: ProviderWebhookInput): Promise<ParsedProviderWebhookEvent | null>
  resolvePaymentReferences(input: ResolvePaymentReferencesInput): ProviderPaymentReferences
}
