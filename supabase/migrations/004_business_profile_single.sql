-- Ensure a single business profile per user.
-- If duplicates exist, keep the newest profile and re-point child rows.

WITH ranked AS (
  SELECT
    id,
    user_id,
    FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS keep_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.business_profiles
)
UPDATE public.business_revenues br
SET business_id = ranked.keep_id
FROM ranked
WHERE ranked.rn > 1
  AND br.business_id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    user_id,
    FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS keep_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.business_profiles
)
UPDATE public.business_expenses be
SET business_id = ranked.keep_id
FROM ranked
WHERE ranked.rn > 1
  AND be.business_id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.business_profiles
)
DELETE FROM public.business_profiles bp
USING ranked
WHERE bp.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_profiles_user_unique
  ON public.business_profiles(user_id);
