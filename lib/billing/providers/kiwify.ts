import type {
  CheckoutInput,
  CheckoutResult,
  ParsedProviderWebhookEvent,
  PaymentProvider,
  ProviderWebhookInput,
  ResolvePaymentReferencesInput,
  ProviderPaymentReferences,
} from './types'

export class KiwifyProvider implements PaymentProvider {
  gateway = 'kiwify' as const

  isConfigured() {
    return !!process.env.KIWIFY_API_KEY
  }

  supportsPaymentMethod(method: 'card' | 'pix') {
    return method === 'card' || method === 'pix'
  }

  resolvePaymentReferences(input: ResolvePaymentReferencesInput): ProviderPaymentReferences {
    return {
      checkoutSessionId: input.checkoutSessionId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      providerPaymentId: input.providerPaymentId ?? null,
      providerCustomerId: input.providerCustomerId ?? null,
      providerReference: input.providerReference ?? input.checkoutSessionId ?? null,
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    void input
    throw new Error('Kiwify provider is not integrated yet.')
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId
    throw new Error('Kiwify provider is not integrated yet.')
  }

  async parseWebhookEvent(input: ProviderWebhookInput): Promise<ParsedProviderWebhookEvent | null> {
    const hasKiwifyHeaders =
      !!input.headers.get('x-kiwify-signature') ||
      !!input.headers.get('x-kiwify-event-id') ||
      !!input.headers.get('x-kiwify-event')

    if (!hasKiwifyHeaders) {
      return null
    }

    throw new Error('Kiwify webhook received, but integration is not implemented yet.')
  }
}
