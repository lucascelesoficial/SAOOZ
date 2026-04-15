-- ── 018_business_budget.sql ─────────────────────────────────────────────────
-- PJ budget tracking: planned amounts per expense category per month.
-- Separate from PF budgets (which use user_id only).

create table if not exists public.business_budgets (
  id           uuid        primary key default gen_random_uuid(),
  business_id  uuid        not null references public.business_profiles(id) on delete cascade,
  month        date        not null,                         -- always YYYY-MM-01
  category     text        not null,                         -- BusinessExpCategory value
  planned_amount numeric(12, 2) not null default 0 check (planned_amount >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (business_id, month, category)
);

-- RLS
alter table public.business_budgets enable row level security;

create policy "business_budgets_select_own" on public.business_budgets
  for select using (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

create policy "business_budgets_insert_own" on public.business_budgets
  for insert with check (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

create policy "business_budgets_update_own" on public.business_budgets
  for update using (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

create policy "business_budgets_delete_own" on public.business_budgets
  for delete using (
    business_id in (
      select id from public.business_profiles where user_id = auth.uid()
    )
  );

-- Auto-update updated_at
create trigger touch_business_budgets_updated_at
  before update on public.business_budgets
  for each row execute function public.touch_updated_at();

-- Index for fast monthly lookup
create index if not exists idx_business_budgets_month
  on public.business_budgets (business_id, month);
