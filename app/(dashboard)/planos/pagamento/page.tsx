import { Suspense } from 'react'
import { PaymentPageClient } from './PaymentPageClient'

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent-blue)] border-t-transparent" /></div>}>
      <PaymentPageClient />
    </Suspense>
  )
}
