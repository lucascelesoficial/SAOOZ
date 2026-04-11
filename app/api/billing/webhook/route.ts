import { NextRequest, NextResponse } from 'next/server'
import { createOptionalAdminClient } from '@/lib/supabase/admin'
import { resolveWebhookProviderCandidates } from '@/lib/billing/providers'
import {
  normalizeManualWebhookEvent,
  normalizeProviderWebhookEvent,
  persistBillingWebhookEventReceived,
  processBillingWebhookEvent,
  updateBillingWebhookEventStatus,
} from '@/lib/billing/webhook'

export const dynamic = 'force-dynamic'

function logWebhook(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta: Record<string, unknown>
) {
  const payload = {
    scope: 'billing.webhook',
    message,
    ...meta,
  }

  if (level === 'info') {
    console.info(payload)
    return
  }

  if (level === 'warn') {
    console.warn(payload)
    return
  }

  console.error(payload)
}

export async function POST(request: NextRequest) {
  try {
    const admin = createOptionalAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured.' }, { status: 500 })
    }

    const body = await request.text()
    const headerEventId = request.headers.get('x-webhook-event-id')
    const manualSecret = process.env.BILLING_WEBHOOK_SECRET

    let event = null

    const providerCandidates = resolveWebhookProviderCandidates(request.headers)
    for (const provider of providerCandidates) {
      try {
        const parsedEvent = await provider.parseWebhookEvent({
          rawBody: body,
          headers: request.headers,
        })

        if (!parsedEvent) {
          continue
        }

        event = normalizeProviderWebhookEvent(parsedEvent)
        break
      } catch (providerError) {
        const reason =
          providerError instanceof Error ? providerError.message : String(providerError)
        logWebhook('warn', 'provider_webhook_parse_failed', {
          provider: provider.gateway,
          reason,
        })
        return NextResponse.json({ error: reason }, { status: 400 })
      }
    }

    if (!event && manualSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${manualSecret}`) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
      }
      event = normalizeManualWebhookEvent(body, headerEventId)
    }

    if (!event) {
      return NextResponse.json({ error: 'Could not parse webhook.' }, { status: 400 })
    }

    logWebhook('info', 'event_received', {
      provider: event.externalEvent.provider,
      eventId: event.externalEvent.eventId,
      eventType: event.externalEvent.eventType,
      actionable: event.action.type === 'activate_subscription',
      relatedUserId: event.relatedUserId,
    })

    let persistedWebhookEventId: string | null = null
    const persistedEvent = await persistBillingWebhookEventReceived(admin, event)
    if (persistedEvent.duplicate) {
      logWebhook('info', 'event_duplicate_skipped', {
        provider: event.externalEvent.provider,
        eventId: event.externalEvent.eventId,
        eventType: event.externalEvent.eventType,
        existingWebhookEventId: persistedEvent.eventId,
        existingStatus: persistedEvent.status,
      })
      return NextResponse.json({ ok: true, duplicate: true })
    }

    persistedWebhookEventId = persistedEvent.eventId

    try {
      const nowIso = new Date().toISOString()
      await updateBillingWebhookEventStatus(admin, persistedEvent.eventId, {
        eventStatus: 'processing',
      })

      const result = await processBillingWebhookEvent(admin, event)

      await updateBillingWebhookEventStatus(admin, persistedEvent.eventId, {
        eventStatus: 'processed',
        processedAt: nowIso,
        relatedSubscriptionId: result.relatedSubscriptionId,
      })

      logWebhook('info', 'event_processed', {
        provider: event.externalEvent.provider,
        eventId: event.externalEvent.eventId,
        eventType: event.externalEvent.eventType,
        webhookEventId: persistedEvent.eventId,
        result: result.reason,
        relatedSubscriptionId: result.relatedSubscriptionId,
      })

      return NextResponse.json({ ok: true })
    } catch (processingError) {
      const message =
        processingError instanceof Error ? processingError.message : 'Webhook processing failed.'

      if (persistedWebhookEventId) {
        try {
          await updateBillingWebhookEventStatus(admin, persistedWebhookEventId, {
            eventStatus: 'failed',
            processedAt: new Date().toISOString(),
            errorMessage: message,
          })
        } catch (statusError) {
          logWebhook('warn', 'event_status_update_failed', {
            webhookEventId: persistedWebhookEventId,
            reason: statusError instanceof Error ? statusError.message : String(statusError),
          })
        }
      }

      logWebhook('error', 'event_failed', {
        provider: event.externalEvent.provider,
        eventId: event.externalEvent.eventId,
        eventType: event.externalEvent.eventType,
        webhookEventId: persistedWebhookEventId,
        reason: message,
      })

      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.'
    logWebhook('error', 'event_failed', {
      reason: message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
