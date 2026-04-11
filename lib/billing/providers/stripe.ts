import type { PaymentProvider, CheckoutInput, CheckoutResult, WebhookPayload } from './types'

export class StripeProvider implements PaymentProvider {
  gateway = 'stripe' as const

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    void input
    throw new Error('StripeProvider is not integrated yet.')
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId
    throw new Error('StripeProvider is not integrated yet.')
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    void payload
    throw new Error('StripeProvider is not integrated yet.')
  }
}
