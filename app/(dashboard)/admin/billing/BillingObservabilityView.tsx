import Link from 'next/link'
import type { BillingObservabilityData } from '@/lib/billing/observability'

interface BillingObservabilityViewProps {
  data: BillingObservabilityData
  selectedUserId: string | null
  webhookPage: number
  paymentsPage: number
  adminEmailsConfigured: boolean
}

interface QueryState {
  userId?: string
  eventsPage?: string
  paymentsPage?: string
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function formatDate(value: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(date)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function buildHref(input: QueryState) {
  const params = new URLSearchParams()

  if (input.userId) {
    params.set('userId', input.userId)
  }
  if (input.eventsPage) {
    params.set('eventsPage', input.eventsPage)
  }
  if (input.paymentsPage) {
    params.set('paymentsPage', input.paymentsPage)
  }

  const query = params.toString()
  return query ? `/admin/billing?${query}` : '/admin/billing'
}

function statusBadgeColor(status: string) {
  if (status === 'processed' || status === 'paid' || status === 'active') {
    return 'var(--accent-emerald)'
  }

  if (status === 'failed' || status === 'past_due' || status === 'inactive') {
    return 'var(--accent-red)'
  }

  if (status === 'trialing' || status === 'pending') {
    return 'var(--accent-blue)'
  }

  return 'var(--text-soft)'
}

export function BillingObservabilityView({
  data,
  selectedUserId,
  webhookPage,
  paymentsPage,
  adminEmailsConfigured,
}: BillingObservabilityViewProps) {
  const userView = data.selectedUserView
  const subscription = userView?.subscription ?? null
  const usage = userView?.usage ?? null

  return (
    <div className="space-y-6">
      <section className="panel-card rounded-[14px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-app">Observabilidade Billing</h1>
            <p className="text-sm text-app-soft">
              Area interna para acompanhamento operacional de assinaturas, pagamentos e webhooks.
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              border: '1px solid var(--panel-border)',
              background: 'color-mix(in oklab, var(--accent-blue) 15%, transparent)',
              color: 'var(--accent-blue)',
            }}
          >
            /admin/billing
          </span>
        </div>
        {!adminEmailsConfigured && (
          <div
            className="mt-4 rounded-[10px] px-3 py-2 text-xs"
            style={{
              border: '1px solid color-mix(in oklab, var(--accent-gold) 45%, transparent)',
              background: 'color-mix(in oklab, var(--accent-gold) 12%, transparent)',
              color: 'var(--text-base)',
            }}
          >
            Ambiente sem lista de admins configurada. Em producao, defina
            {' '}
            <code>BILLING_OBSERVABILITY_ADMIN_EMAILS</code>
            {' '}
            (emails separados por virgula).
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="panel-card rounded-[14px] p-4">
          <h2 className="text-base font-semibold text-app">Usuarios</h2>
          <p className="mb-3 text-xs text-app-soft">Selecione um usuario para visao detalhada.</p>
          <div className="max-h-[420px] space-y-1 overflow-auto pr-1">
            {data.users.map((user) => {
              const active = selectedUserId === user.id
              return (
                <Link
                  key={user.id}
                  href={buildHref({
                    userId: user.id,
                    eventsPage: String(webhookPage),
                    paymentsPage: String(paymentsPage),
                  })}
                  className="block rounded-[8px] px-3 py-2 transition-colors"
                  style={{
                    border: '1px solid var(--panel-border)',
                    background: active
                      ? 'color-mix(in oklab, var(--accent-blue) 15%, transparent)'
                      : 'transparent',
                  }}
                >
                  <p className="truncate text-sm font-medium text-app">{user.name || 'Sem nome'}</p>
                  <p className="truncate text-xs text-app-soft">{user.email}</p>
                </Link>
              )
            })}
            {data.users.length === 0 && (
              <p className="text-xs text-app-soft">Nenhum usuario encontrado.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel-card rounded-[14px] p-4">
            <h2 className="text-base font-semibold text-app">Visao por usuario</h2>
            {!userView ? (
              <p className="mt-2 text-sm text-app-soft">
                Selecione um usuario para carregar assinatura, uso e historico.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Plano atual</p>
                  <p className="text-sm font-semibold text-app">{subscription?.plan_type?.toUpperCase() ?? '-'}</p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Status assinatura</p>
                  <p className="text-sm font-semibold" style={{ color: statusBadgeColor(subscription?.status ?? '') }}>
                    {subscription?.status ?? '-'}
                  </p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Trial ate</p>
                  <p className="text-sm font-semibold text-app">{formatDate(subscription?.trial_ends_at ?? null)}</p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Current period end</p>
                  <p className="text-sm font-semibold text-app">
                    {formatDate(subscription?.current_period_end ?? null)}
                  </p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Empresas usadas</p>
                  <p className="text-sm font-semibold text-app">{userView.businessCount}</p>
                </div>
                <div className="rounded-[10px] border p-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <p className="text-xs text-app-soft">Consumo IA (mes)</p>
                  <p className="text-sm font-semibold text-app">
                    {usage?.ai_actions_used ?? 0}
                    {' '}
                    <span className="text-xs text-app-soft">
                      (reset:
                      {' '}
                      {usage?.reset_date ?? '-'}
                      )
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="panel-card rounded-[14px] p-4">
              <h3 className="text-sm font-semibold text-app">Ultimos pagamentos (usuario)</h3>
              <div className="mt-3 overflow-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="text-app-soft">
                      <th className="pb-2 pr-3">Amount</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3">Gateway</th>
                      <th className="pb-2 pr-3">Gateway payment id</th>
                      <th className="pb-2">Paid at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(userView?.recentPayments ?? []).map((item) => (
                      <tr key={item.id} className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
                        <td className="py-2 pr-3 text-app">{formatCurrency(item.amount)}</td>
                        <td className="py-2 pr-3">
                          <span style={{ color: statusBadgeColor(item.status) }}>{item.status}</span>
                        </td>
                        <td className="py-2 pr-3 text-app">{item.gateway ?? '-'}</td>
                        <td className="max-w-[180px] truncate py-2 pr-3 text-app-soft">{item.gateway_payment_id ?? '-'}</td>
                        <td className="py-2 text-app-soft">{formatDateTime(item.paid_at)}</td>
                      </tr>
                    ))}
                    {(userView?.recentPayments?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={5} className="py-3 text-app-soft">
                          Nenhum pagamento recente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-card rounded-[14px] p-4">
              <h3 className="text-sm font-semibold text-app">Ultimos webhooks (usuario)</h3>
              <div className="mt-3 overflow-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="text-app-soft">
                      <th className="pb-2 pr-3">Provider</th>
                      <th className="pb-2 pr-3">Event type</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3">Recebido</th>
                      <th className="pb-2">Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(userView?.recentWebhookEvents ?? []).map((item) => (
                      <tr key={item.id} className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
                        <td className="py-2 pr-3 text-app">{item.provider}</td>
                        <td className="max-w-[180px] truncate py-2 pr-3 text-app">{item.event_type ?? '-'}</td>
                        <td className="py-2 pr-3">
                          <span style={{ color: statusBadgeColor(item.event_status) }}>{item.event_status}</span>
                        </td>
                        <td className="py-2 pr-3 text-app-soft">{formatDateTime(item.received_at)}</td>
                        <td className="max-w-[180px] truncate py-2 text-app-soft">{item.error_message ?? '-'}</td>
                      </tr>
                    ))}
                    {(userView?.recentWebhookEvents?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={5} className="py-3 text-app-soft">
                          Nenhum webhook recente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[14px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-app">Eventos de webhook</h2>
          <span className="text-xs text-app-soft">
            Pagina
            {' '}
            {data.webhookEvents.page}
            {' '}
            de
            {' '}
            {data.webhookEvents.totalPages}
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="text-app-soft">
                <th className="pb-2 pr-3">Provider</th>
                <th className="pb-2 pr-3">Event type</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Recebido</th>
                <th className="pb-2 pr-3">Processado</th>
                <th className="pb-2 pr-3">User</th>
                <th className="pb-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {data.webhookEvents.items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
                  <td className="py-2 pr-3 text-app">{item.provider}</td>
                  <td className="max-w-[220px] truncate py-2 pr-3 text-app">{item.event_type ?? '-'}</td>
                  <td className="py-2 pr-3">
                    <span style={{ color: statusBadgeColor(item.event_status) }}>{item.event_status}</span>
                  </td>
                  <td className="py-2 pr-3 text-app-soft">{formatDateTime(item.received_at)}</td>
                  <td className="py-2 pr-3 text-app-soft">{formatDateTime(item.processed_at)}</td>
                  <td className="max-w-[160px] truncate py-2 pr-3 text-app-soft">{item.related_user_id ?? '-'}</td>
                  <td className="max-w-[280px] truncate py-2 text-app-soft">{item.error_message ?? '-'}</td>
                </tr>
              ))}
              {data.webhookEvents.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-app-soft">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Link
            href={buildHref({
              userId: selectedUserId ?? undefined,
              eventsPage: String(Math.max(1, webhookPage - 1)),
              paymentsPage: String(paymentsPage),
            })}
            className="rounded-[8px] border px-3 py-1 text-xs text-app"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Anterior
          </Link>
          <Link
            href={buildHref({
              userId: selectedUserId ?? undefined,
              eventsPage: String(Math.min(data.webhookEvents.totalPages, webhookPage + 1)),
              paymentsPage: String(paymentsPage),
            })}
            className="rounded-[8px] border px-3 py-1 text-xs text-app"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Proxima
          </Link>
        </div>
      </section>

      <section className="panel-card rounded-[14px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-app">Pagamentos</h2>
          <span className="text-xs text-app-soft">
            Pagina
            {' '}
            {data.payments.page}
            {' '}
            de
            {' '}
            {data.payments.totalPages}
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead>
              <tr className="text-app-soft">
                <th className="pb-2 pr-3">Amount</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Gateway</th>
                <th className="pb-2 pr-3">Gateway payment id</th>
                <th className="pb-2 pr-3">Paid at</th>
                <th className="pb-2 pr-3">Failed at</th>
                <th className="pb-2 pr-3">Failure reason</th>
                <th className="pb-2">User</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--panel-border)' }}>
                  <td className="py-2 pr-3 text-app">{formatCurrency(item.amount)}</td>
                  <td className="py-2 pr-3">
                    <span style={{ color: statusBadgeColor(item.status) }}>{item.status}</span>
                  </td>
                  <td className="py-2 pr-3 text-app">{item.gateway ?? '-'}</td>
                  <td className="max-w-[180px] truncate py-2 pr-3 text-app-soft">{item.gateway_payment_id ?? '-'}</td>
                  <td className="py-2 pr-3 text-app-soft">{formatDateTime(item.paid_at)}</td>
                  <td className="py-2 pr-3 text-app-soft">{formatDateTime(item.failed_at)}</td>
                  <td className="max-w-[220px] truncate py-2 pr-3 text-app-soft">{item.failure_reason ?? '-'}</td>
                  <td className="max-w-[160px] truncate py-2 text-app-soft">{item.user_id}</td>
                </tr>
              ))}
              {data.payments.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-3 text-app-soft">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Link
            href={buildHref({
              userId: selectedUserId ?? undefined,
              eventsPage: String(webhookPage),
              paymentsPage: String(Math.max(1, paymentsPage - 1)),
            })}
            className="rounded-[8px] border px-3 py-1 text-xs text-app"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Anterior
          </Link>
          <Link
            href={buildHref({
              userId: selectedUserId ?? undefined,
              eventsPage: String(webhookPage),
              paymentsPage: String(Math.min(data.payments.totalPages, paymentsPage + 1)),
            })}
            className="rounded-[8px] border px-3 py-1 text-xs text-app"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            Proxima
          </Link>
        </div>
      </section>
    </div>
  )
}
