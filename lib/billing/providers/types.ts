import type {
  BillingGateway,
  PaymentMethod,
  SubscriptionPlanType,
} from '@/types/database.types'

export interface CheckoutInput {
  userId: string
  planType: SubscriptionPlanType
  durationMonths: 3 | 6 | 12
  paymentMethod: PaymentMethod
}

export interface CheckoutResult {
  checkoutUrl?: string
  externalId?: string
  qrCode?: string
  expiresAt?: string
}

export interface WebhookPayload {
  event: string
  payload: Record<string, unknown>
}

export interface PaymentProvider {
  gateway: BillingGateway
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>
  cancelSubscription(subscriptionId: string): Promise<void>
  handleWebhook(payload: WebhookPayload): Promise<void>
}
