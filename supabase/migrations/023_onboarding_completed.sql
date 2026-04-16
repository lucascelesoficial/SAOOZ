-- Migration 023: onboarding_completed_at
-- Prevents dashboard access before onboarding is fully completed.
-- Apply via: Supabase Dashboard → SQL Editor → Run

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Backfill: existing users who already selected a mode are considered done
UPDATE profiles
  SET onboarding_completed_at = COALESCE(created_at, NOW())
  WHERE mode IS NOT NULL
    AND onboarding_completed_at IS NULL;

COMMENT ON COLUMN profiles.onboarding_completed_at IS
  'Timestamp set when the user finishes the onboarding flow (PF setup or PJ empresa step). NULL = onboarding incomplete.';
