-- Add month column to income_sources so income is tracked per month
-- (entrepreneurs have variable monthly revenue, not fixed recurring)

ALTER TABLE income_sources
  ADD COLUMN IF NOT EXISTS month DATE;

-- For existing rows without a month, set to the first day of the current month
-- so they remain visible instead of disappearing
UPDATE income_sources
  SET month = date_trunc('month', CURRENT_DATE)::date
  WHERE month IS NULL;

-- Make month NOT NULL going forward
ALTER TABLE income_sources
  ALTER COLUMN month SET NOT NULL;

-- Index for fast monthly queries
CREATE INDEX IF NOT EXISTS idx_income_sources_user_month
  ON income_sources (user_id, month);
