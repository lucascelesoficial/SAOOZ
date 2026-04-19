-- Migration 024: bank_connections
-- Tables for Pluggy bank integration: items, accounts, imported transactions
-- Apply via: Supabase Dashboard → SQL Editor → Run

-- bank_items: one row per connected bank (Pluggy "item")
create table if not exists bank_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pluggy_item_id text not null unique,
  connector_name text not null,        -- e.g. "Nubank", "Itaú"
  connector_id integer,
  status text not null default 'updated', -- updated | updating | waiting_user_input | error
  last_updated_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- bank_accounts: one row per account within an item
create table if not exists bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references bank_items(id) on delete cascade,
  pluggy_account_id text not null unique,
  name text not null,
  type text not null,           -- BANK, CREDIT, INVESTMENT
  subtype text,                 -- CHECKING, SAVINGS, CREDIT_CARD, etc.
  number text,
  balance numeric(14,2) not null default 0,
  currency_code text not null default 'BRL',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- bank_imported_transactions: tracks which Pluggy transactions were imported
create table if not exists bank_imported_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pluggy_transaction_id text not null unique,
  bank_account_id uuid not null references bank_accounts(id) on delete cascade,
  amount numeric(14,2) not null,
  description text,
  date date not null,
  type text not null,           -- DEBIT or CREDIT
  category text,
  pluggy_category text,
  imported_to text,             -- 'expenses' | 'business_expenses' | 'business_revenues' | 'ignored'
  imported_record_id uuid,      -- FK to the imported record
  created_at timestamptz not null default now()
);

-- RLS
alter table bank_items enable row level security;
alter table bank_accounts enable row level security;
alter table bank_imported_transactions enable row level security;

create policy "users own bank_items" on bank_items for all using (auth.uid() = user_id);
create policy "users own bank_accounts" on bank_accounts for all using (auth.uid() = user_id);
create policy "users own bank_imported_transactions" on bank_imported_transactions for all using (auth.uid() = user_id);

-- indexes
create index if not exists bank_items_user_id_idx on bank_items(user_id);
create index if not exists bank_accounts_item_id_idx on bank_accounts(item_id);
create index if not exists bank_imported_transactions_account_id_idx on bank_imported_transactions(bank_account_id);
