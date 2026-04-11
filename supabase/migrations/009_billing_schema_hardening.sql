-- Billing schema hardening for production SaaS operations.
-- Adds lifecycle/provider tracing fields while keeping backward compatibility.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- subscriptions: provider + lifecycle traceability
-- ---------------------------------------------------------------------------
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS gateway_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS gateway_event_id TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_billing_error TEXT,
  ADD COLUMN IF NOT EXISTS provider_reference TEXT;

-- Keep historical records coherent after new fields are added.
UPDATE public.subscriptions
SET started_at = COALESCE(started_at, created_at)
WHERE started_at IS NULL
  AND status IN ('trialing', 'active', 'past_due');

-- ---------------------------------------------------------------------------
-- payments: settlement + provider traceability
-- ---------------------------------------------------------------------------
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS provider_event_id TEXT,
  ADD COLUMN IF NOT EXISTS raw_reference TEXT;

UPDATE public.payments
SET paid_at = COALESCE(paid_at, created_at)
WHERE status = 'paid'
  AND paid_at IS NULL;

UPDATE public.payments
SET failed_at = COALESCE(failed_at, created_at)
WHERE status = 'failed'
  AND failed_at IS NULL;

-- ---------------------------------------------------------------------------
-- billing_webhook_events: raw event intake + processing trail
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT,
  event_type TEXT,
  event_status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL
);

ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

-- No authenticated policy by default: this table is intended for server/service usage.

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_gateway_subscription_id
  ON public.subscriptions(gateway_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id
  ON public.payments(gateway_payment_id);

-- Unique(provider, event_id) requirement + lookup index in one structure.
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_webhook_events_provider_event_id
  ON public.billing_webhook_events(provider, event_id);

