-- Atomic monthly expense replacement for PF profile form.
-- The whole function runs in a single transaction.

CREATE OR REPLACE FUNCTION public.replace_monthly_expenses(
  p_month DATE,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM public.expenses
  WHERE user_id = v_user_id
    AND month = p_month;

  INSERT INTO public.expenses (user_id, category, amount, month, description)
  SELECT
    v_user_id,
    (item->>'category')::expense_category,
    (item->>'amount')::numeric(12,2),
    p_month,
    NULL
  FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) AS item
  WHERE (item->>'amount')::numeric > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_monthly_expenses(DATE, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_monthly_expenses(DATE, JSONB) TO authenticated;
