-- Budgets must be stored separately from real transactions.
-- This migration also removes the single-business restriction and
-- introduces an active business pointer on the user profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_business_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_business_profiles_user_unique;

WITH latest_business AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    id
  FROM public.business_profiles
  ORDER BY user_id, created_at DESC, id DESC
)
UPDATE public.profiles p
SET active_business_id = latest_business.id
FROM latest_business
WHERE latest_business.user_id = p.id
  AND p.active_business_id IS NULL;

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month)
);

CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  planned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (budget_id, category)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month
  ON public.budgets(user_id, month);

CREATE INDEX IF NOT EXISTS idx_budget_categories_budget
  ON public.budget_categories(budget_id);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select_own" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_own" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_own" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_delete_own" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "budget_categories_select_own" ON public.budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.budgets b
      WHERE b.id = budget_categories.budget_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_categories_insert_own" ON public.budget_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.budgets b
      WHERE b.id = budget_categories.budget_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_categories_update_own" ON public.budget_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.budgets b
      WHERE b.id = budget_categories.budget_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.budgets b
      WHERE b.id = budget_categories.budget_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_categories_delete_own" ON public.budget_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.budgets b
      WHERE b.id = budget_categories.budget_id
        AND b.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS budgets_touch_updated_at ON public.budgets;
CREATE TRIGGER budgets_touch_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS budget_categories_touch_updated_at ON public.budget_categories;
CREATE TRIGGER budget_categories_touch_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.upsert_monthly_budget(
  p_month DATE,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_budget_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.budgets (user_id, month)
  VALUES (v_user_id, p_month)
  ON CONFLICT (user_id, month)
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_budget_id;

  DELETE FROM public.budget_categories
  WHERE budget_id = v_budget_id;

  INSERT INTO public.budget_categories (budget_id, category, planned_amount)
  SELECT
    v_budget_id,
    (item->>'category')::expense_category,
    (item->>'amount')::NUMERIC(12, 2)
  FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) AS item
  WHERE COALESCE((item->>'amount')::NUMERIC, 0) > 0;

  RETURN v_budget_id;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_monthly_budget(DATE, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_monthly_budget(DATE, JSONB) TO authenticated;

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.replace_monthly_expenses(DATE, JSONB) FROM authenticated;
EXCEPTION
  WHEN undefined_function THEN NULL;
END;
$$;
