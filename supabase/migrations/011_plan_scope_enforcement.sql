-- Harden plan enforcement at database layer for client-only flows.
-- This keeps scope checks centralized even when inserts are made directly from the browser.

CREATE OR REPLACE FUNCTION public.enforce_transaction_usage_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := COALESCE(NEW.user_id, auth.uid());
  v_role TEXT := current_setting('request.jwt.claim.role', true);
  v_scope TEXT := CASE
    WHEN TG_TABLE_NAME IN ('business_revenues', 'business_expenses') THEN 'business'
    ELSE 'personal'
  END;
  v_subscription public.subscriptions;
  v_usage public.usage_limits;
  v_has_trial_access BOOLEAN := FALSE;
  v_has_paid_access BOOLEAN := FALSE;
  v_personal_allowed BOOLEAN := FALSE;
  v_business_allowed BOOLEAN := FALSE;
BEGIN
  IF v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = v_user_id;

  v_usage := public.reset_usage_limits_if_needed(v_user_id);

  IF v_subscription.id IS NULL THEN
    -- Defensive fallback for legacy rows: free personal mode.
    v_personal_allowed := TRUE;
    v_business_allowed := FALSE;
  ELSE
    v_has_trial_access :=
      v_subscription.status = 'trialing'
      AND v_subscription.trial_ends_at IS NOT NULL
      AND v_subscription.trial_ends_at >= NOW();

    v_has_paid_access :=
      v_subscription.status = 'active'
      OR (
        v_subscription.status = 'canceled'
        AND v_subscription.current_period_end IS NOT NULL
        AND v_subscription.current_period_end >= NOW()
        AND (v_subscription.ended_at IS NULL OR v_subscription.ended_at > NOW())
      );

    IF v_has_trial_access THEN
      -- Trial keeps full product discoverability.
      v_personal_allowed := TRUE;
      v_business_allowed := TRUE;
    ELSIF v_has_paid_access THEN
      -- Paid scope follows plan_type exactly.
      IF v_subscription.plan_type = 'pf' THEN
        v_personal_allowed := TRUE;
        v_business_allowed := FALSE;
      ELSIF v_subscription.plan_type = 'pj' THEN
        v_personal_allowed := FALSE;
        v_business_allowed := TRUE;
      ELSE
        -- pro
        v_personal_allowed := TRUE;
        v_business_allowed := TRUE;
      END IF;
    ELSE
      -- Inactive/expired/past_due fallback: personal only with free limits.
      v_personal_allowed := TRUE;
      v_business_allowed := FALSE;
    END IF;
  END IF;

  IF v_scope = 'personal' AND NOT v_personal_allowed THEN
    RAISE EXCEPTION 'personal_scope_locked';
  END IF;

  IF v_scope = 'business' AND NOT v_business_allowed THEN
    RAISE EXCEPTION 'business_scope_locked';
  END IF;

  IF NOT v_has_trial_access
     AND NOT v_has_paid_access
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

CREATE OR REPLACE FUNCTION public.enforce_plan_scope_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT := current_setting('request.jwt.claim.role', true);
  v_scope TEXT := CASE
    WHEN TG_TABLE_NAME IN ('business_revenues', 'business_expenses') THEN 'business'
    ELSE 'personal'
  END;
  v_subscription public.subscriptions;
  v_has_trial_access BOOLEAN := FALSE;
  v_has_paid_access BOOLEAN := FALSE;
  v_personal_allowed BOOLEAN := FALSE;
  v_business_allowed BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := COALESCE(OLD.user_id, auth.uid());
  ELSE
    v_user_id := COALESCE(NEW.user_id, OLD.user_id, auth.uid());
  END IF;

  IF v_role = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = v_user_id;

  IF v_subscription.id IS NULL THEN
    v_personal_allowed := TRUE;
    v_business_allowed := FALSE;
  ELSE
    v_has_trial_access :=
      v_subscription.status = 'trialing'
      AND v_subscription.trial_ends_at IS NOT NULL
      AND v_subscription.trial_ends_at >= NOW();

    v_has_paid_access :=
      v_subscription.status = 'active'
      OR (
        v_subscription.status = 'canceled'
        AND v_subscription.current_period_end IS NOT NULL
        AND v_subscription.current_period_end >= NOW()
        AND (v_subscription.ended_at IS NULL OR v_subscription.ended_at > NOW())
      );

    IF v_has_trial_access THEN
      v_personal_allowed := TRUE;
      v_business_allowed := TRUE;
    ELSIF v_has_paid_access THEN
      IF v_subscription.plan_type = 'pf' THEN
        v_personal_allowed := TRUE;
        v_business_allowed := FALSE;
      ELSIF v_subscription.plan_type = 'pj' THEN
        v_personal_allowed := FALSE;
        v_business_allowed := TRUE;
      ELSE
        v_personal_allowed := TRUE;
        v_business_allowed := TRUE;
      END IF;
    ELSE
      v_personal_allowed := TRUE;
      v_business_allowed := FALSE;
    END IF;
  END IF;

  IF v_scope = 'personal' AND NOT v_personal_allowed THEN
    RAISE EXCEPTION 'personal_scope_locked';
  END IF;

  IF v_scope = 'business' AND NOT v_business_allowed THEN
    RAISE EXCEPTION 'business_scope_locked';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS income_sources_scope_guard ON public.income_sources;
CREATE TRIGGER income_sources_scope_guard
  BEFORE UPDATE OR DELETE ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_scope_mutation();

DROP TRIGGER IF EXISTS expenses_scope_guard ON public.expenses;
CREATE TRIGGER expenses_scope_guard
  BEFORE UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_scope_mutation();

DROP TRIGGER IF EXISTS business_revenues_scope_guard ON public.business_revenues;
CREATE TRIGGER business_revenues_scope_guard
  BEFORE UPDATE OR DELETE ON public.business_revenues
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_scope_mutation();

DROP TRIGGER IF EXISTS business_expenses_scope_guard ON public.business_expenses;
CREATE TRIGGER business_expenses_scope_guard
  BEFORE UPDATE OR DELETE ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_scope_mutation();
