import type { PaymentProvider, CheckoutInput, CheckoutResult, WebhookPayload } from './types'

export class KiwifyProvider implements PaymentProvider {
  gateway = 'kiwify' as const

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    void input
    throw new Error('KiwifyProvider is not integrated yet.')
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId
    throw new Error('KiwifyProvider is not integrated yet.')
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    void payload
    throw new Error('KiwifyProvider is not integrated yet.')
  }
}
