import type { BillingGateway, PaymentMethod } from '@/types/database.types'
import { CaktoProvider } from './cakto'
import { KiwifyProvider } from './kiwify'
import { StripeProvider } from './stripe'
import type { PaymentProvider } from './types'

const PROVIDER_ORDER: BillingGateway[] = ['stripe', 'kiwify', 'cakto']

const providers = new Map<BillingGateway, PaymentProvider>()

function instantiateProvider(providerName: BillingGateway): PaymentProvider {
  if (providerName === 'stripe') {
    return new StripeProvider()
  }

  if (providerName === 'kiwify') {
    return new KiwifyProvider()
  }

  return new CaktoProvider()
}

export function getBillingProvider(providerName: BillingGateway): PaymentProvider {
  const cached = providers.get(providerName)
  if (cached) {
    return cached
  }

  const created = instantiateProvider(providerName)
  providers.set(providerName, created)
  return created
}

export function getConfiguredBillingProviders(paymentMethod?: PaymentMethod) {
  const defaultGateway = process.env.BILLING_DEFAULT_GATEWAY as BillingGateway | undefined
  const orderedProviders = PROVIDER_ORDER.slice().sort((a, b) => {
    if (!defaultGateway) {
      return 0
    }

    if (a === defaultGateway) {
      return -1
    }

    if (b === defaultGateway) {
      return 1
    }

    return 0
  })

  return orderedProviders
    .map((providerName) => getBillingProvider(providerName))
    .filter((provider) => provider.isConfigured())
    .filter((provider) =>
      paymentMethod ? provider.supportsPaymentMethod(paymentMethod) : true
    )
}

export function resolveCheckoutProvider(input: {
  requestedProvider?: BillingGateway | null
  paymentMethod: PaymentMethod
}) {
  if (input.requestedProvider) {
    const provider = getBillingProvider(input.requestedProvider)
    if (!provider.isConfigured()) {
      return null
    }

    if (!provider.supportsPaymentMethod(input.paymentMethod)) {
      return null
    }

    return provider
  }

  const configured = getConfiguredBillingProviders(input.paymentMethod)
  return configured[0] ?? null
}

export function resolveWebhookProviderCandidates(headers: Headers) {
  if (headers.get('stripe-signature')) {
    return [getBillingProvider('stripe')]
  }

  if (
    headers.get('x-kiwify-signature') ||
    headers.get('x-kiwify-event-id') ||
    headers.get('x-kiwify-event')
  ) {
    return [getBillingProvider('kiwify')]
  }

  if (
    headers.get('x-cakto-signature') ||
    headers.get('x-cakto-event-id') ||
    headers.get('x-cakto-event')
  ) {
    return [getBillingProvider('cakto')]
  }

  // Fallback to all providers (not only configured ones) so adapters can
  // detect payload signatures from body shape as a last resort.
  return PROVIDER_ORDER.map((providerName) => getBillingProvider(providerName))
}
