-- Migration 022: Soft delete for business_profiles
-- Replaces hard DELETE with a tombstone pattern.
-- Deleted businesses are invisible to all queries but data is preserved
-- for audit, recovery, and billing record continuity.

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS deleted_by  UUID         NULL REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.business_profiles.deleted_at
  IS 'Soft delete timestamp. NULL = active. Non-null = deleted.';
COMMENT ON COLUMN public.business_profiles.deleted_by
  IS 'User ID who triggered the deletion.';

-- Index for fast "active businesses" queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_active
  ON public.business_profiles (user_id)
  WHERE deleted_at IS NULL;

-- Update RLS policies to automatically exclude soft-deleted businesses.
-- Users should never see their own deleted businesses in normal queries.

DROP POLICY IF EXISTS "Users can view own business profiles"    ON public.business_profiles;
DROP POLICY IF EXISTS "Users can insert own business profiles"  ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update own business profiles"  ON public.business_profiles;
DROP POLICY IF EXISTS "Users can delete own business profiles"  ON public.business_profiles;

-- Re-create policies filtering out soft-deleted rows
CREATE POLICY "Users can view own active business profiles"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own business profiles"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active business profiles"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- No DELETE policy — hard deletes are blocked for normal users.
-- Soft deletes are performed via UPDATE (sets deleted_at) by the API.
-- Only the service role can physically DELETE rows (retention policy cleanup).
