-- Migration 025: Add PJ (business) support to bank connections
-- Adds mode ('pf' | 'pj') and business_id FK to bank_items

ALTER TABLE bank_items
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'pf'
    CONSTRAINT bank_items_mode_check CHECK (mode IN ('pf', 'pj')),
  ADD COLUMN IF NOT EXISTS business_id UUID
    REFERENCES business_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bank_items_mode_idx ON bank_items(mode);
CREATE INDEX IF NOT EXISTS bank_items_business_id_idx ON bank_items(business_id);

COMMENT ON COLUMN bank_items.mode IS 'pf = personal, pj = business account connection';
COMMENT ON COLUMN bank_items.business_id IS 'Set when mode=pj; links to the active business profile';
