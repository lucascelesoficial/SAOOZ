-- ── 017_recurring_transactions.sql ──────────────────────────────────────────
-- Adds is_recurring flag to business revenues and expenses.
-- Recurring transactions are automatically suggested when a new month begins.

alter table public.business_revenues
  add column if not exists is_recurring boolean not null default false;

alter table public.business_expenses
  add column if not exists is_recurring boolean not null default false;

-- Index for quick lookup of recurring templates (used by auto-populate logic)
create index if not exists idx_business_revenues_recurring
  on public.business_revenues (business_id, is_recurring)
  where is_recurring = true;

create index if not exists idx_business_expenses_recurring
  on public.business_expenses (business_id, is_recurring)
  where is_recurring = true;
