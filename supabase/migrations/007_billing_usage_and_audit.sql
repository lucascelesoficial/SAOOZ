-- Billing foundation, usage tracking and AI audit trail.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pf', 'pj', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payment_method TEXT NOT NULL DEFAULT 'none' CHECK (payment_method IN ('card', 'pix', 'none')),
  gateway TEXT CHECK (gateway IN ('stripe', 'kiwify', 'cakto') OR gateway IS NULL),
  gateway_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'pix')),
  gateway TEXT CHECK (gateway IN ('stripe', 'kiwify', 'cakto') OR gateway IS NULL),
  gateway_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  transactions_used INTEGER NOT NULL DEFAULT 0,
  ai_actions_used INTEGER NOT NULL DEFAULT 0,
  reset_date DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'ai')),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_subscription
  ON public.payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
  ON public.audit_logs(user_id, created_at DESC);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_limits_select_own" ON public.usage_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS subscriptions_touch_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_touch_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS usage_limits_touch_updated_at ON public.usage_limits;
CREATE TRIGGER usage_limits_touch_updated_at
  BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.ensure_usage_limits_row(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usage_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_usage_limits_if_needed(p_user_id UUID)
RETURNS public.usage_limits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_start DATE := date_trunc('month', CURRENT_DATE)::date;
  v_usage public.usage_limits;
BEGIN
  PERFORM public.ensure_usage_limits_row(p_user_id);

  UPDATE public.usage_limits
  SET
    transactions_used = CASE WHEN reset_date <> v_month_start THEN 0 ELSE transactions_used END,
    ai_actions_used = CASE WHEN reset_date <> v_month_start THEN 0 ELSE ai_actions_used END,
    reset_date = v_month_start,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  SELECT *
  INTO v_usage
  FROM public.usage_limits
  WHERE user_id = p_user_id;

  RETURN v_usage;
END;
$$;

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

  IF COALESCE(v_subscription.status, 'canceled') <> 'active'
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

DROP TRIGGER IF EXISTS income_sources_usage_guard ON public.income_sources;
CREATE TRIGGER income_sources_usage_guard
  BEFORE INSERT ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_transaction_usage_limit();

DROP TRIGGER IF EXISTS expenses_usage_guard ON public.expenses;
CREATE TRIGGER expenses_usage_guard
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_transaction_usage_limit();

DROP TRIGGER IF EXISTS business_revenues_usage_guard ON public.business_revenues;
CREATE TRIGGER business_revenues_usage_guard
  BEFORE INSERT ON public.business_revenues
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_transaction_usage_limit();

DROP TRIGGER IF EXISTS business_expenses_usage_guard ON public.business_expenses;
CREATE TRIGGER business_expenses_usage_guard
  BEFORE INSERT ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_transaction_usage_limit();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (
    user_id,
    plan_type,
    status,
    trial_ends_at,
    current_period_end,
    payment_method
  )
  VALUES (
    NEW.id,
    'pf',
    'trialing',
    v_now + INTERVAL '7 days',
    v_now + INTERVAL '7 days',
    'none'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.usage_limits (user_id, reset_date)
  VALUES (NEW.id, date_trunc('month', v_now)::date)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.subscriptions (
  user_id,
  plan_type,
  status,
  trial_ends_at,
  current_period_end,
  payment_method
)
SELECT
  p.id,
  CASE
    WHEN p.mode = 'pj' THEN 'pj'
    WHEN p.mode = 'both' THEN 'pro'
    ELSE 'pf'
  END,
  'trialing',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days',
  'none'
FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.usage_limits (user_id, reset_date)
SELECT
  p.id,
  date_trunc('month', CURRENT_DATE)::date
FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;
