import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import {
  canAccessBillingObservability,
  getBillingObservabilityAdminEmails,
} from '@/lib/billing/observability-access'
import { readBillingObservabilityData } from '@/lib/billing/observability'
import { BillingObservabilityView } from './BillingObservabilityView'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin — Billing' }

interface SearchParamsInput {
  [key: string]: string | string[] | undefined
}

function parseFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? undefined
  }

  return value
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

export default async function BillingObservabilityPage({
  searchParams,
}: {
  searchParams: SearchParamsInput
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!canAccessBillingObservability(user.email)) {
    redirect('/central')
  }

  const admin = createOptionalAdminClient()
  if (!admin) {
    return (
      <div className="panel-card rounded-[14px] p-5">
        <h1 className="text-xl font-semibold text-app">Observabilidade Billing</h1>
        <p className="mt-2 text-sm text-app-soft">
          Credenciais admin do Supabase nao estao configuradas.
          {' '}
          Defina
          {' '}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>
          {' '}
          para habilitar esta area.
        </p>
      </div>
    )
  }

  const selectedUserId = parseFirst(searchParams.userId)
  const webhookPage = parsePositiveInt(parseFirst(searchParams.eventsPage), 1)
  const paymentsPage = parsePositiveInt(parseFirst(searchParams.paymentsPage), 1)

  const data = await readBillingObservabilityData(admin, {
    selectedUserId,
    webhookPagination: { page: webhookPage },
    paymentsPagination: { page: paymentsPage },
  })

  const adminEmailsConfigured = getBillingObservabilityAdminEmails().size > 0

  return (
    <BillingObservabilityView
      data={data}
      selectedUserId={data.selectedUserId}
      webhookPage={webhookPage}
      paymentsPage={paymentsPage}
      adminEmailsConfigured={adminEmailsConfigured}
    />
  )
}
