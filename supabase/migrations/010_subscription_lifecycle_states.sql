-- Subscription lifecycle hardening:
-- Adds new operational statuses and keeps usage guard aligned with lifecycle access.

DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT con.conname
  INTO v_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'subscriptions'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%status%';

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.subscriptions DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_status_check
CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired', 'inactive'));

-- Normalize stale lifecycle rows to the new states.
UPDATE public.subscriptions
SET
  status = 'inactive',
  ended_at = COALESCE(ended_at, NOW()),
  cancel_at_period_end = FALSE
WHERE status = 'trialing'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at < NOW();

UPDATE public.subscriptions
SET
  status = 'expired',
  ended_at = COALESCE(ended_at, NOW()),
  cancel_at_period_end = FALSE
WHERE status = 'canceled'
  AND current_period_end IS NOT NULL
  AND current_period_end <= NOW();

UPDATE public.subscriptions
SET
  status = 'inactive',
  ended_at = COALESCE(ended_at, NOW())
WHERE status = 'past_due'
  AND current_period_end IS NOT NULL
  AND current_period_end <= NOW();

CREATE OR REPLACE FUNCTION public.enforce_transaction_usage_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(NEW.user_id, auth.uid());
  v_role TEXT := current_setting('request.jwt.claim.role', true);
  v_subscription public.subscriptions;
  v_usage public.usage_limits;
  v_has_paid_access BOOLEAN := FALSE;
BEGIN
  IF v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = v_user_id;

  v_usage := public.reset_usage_limits_if_needed(v_user_id);

  IF v_subscription.status = 'active' THEN
    v_has_paid_access := TRUE;
  ELSIF v_subscription.status = 'canceled'
        AND v_subscription.current_period_end IS NOT NULL
        AND v_subscription.current_period_end >= NOW()
        AND (v_subscription.ended_at IS NULL OR v_subscription.ended_at > NOW()) THEN
    v_has_paid_access := TRUE;
  END IF;

  IF NOT v_has_paid_access
     AND v_usage.transactions_used >= 20 THEN
    RAISE EXCEPTION 'transaction_limit_reached';
  END IF;

  UPDATE public.usage_limits
  SET
    transactions_used = transactions_used + 1,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  RETURN NEW;
END;
$$;
