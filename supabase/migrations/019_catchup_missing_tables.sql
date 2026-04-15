-- ── 019_catchup_missing_tables.sql ─────────────────────────────────────────
-- Catch-up: applies pieces of migrations 014, 015, 016 that were skipped
-- because the Supabase project was at 013 when 017+018 were first applied.
--
-- This migration is idempotent (IF NOT EXISTS everywhere).
-- Safe to run multiple times.

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'counterparty_type') THEN
    CREATE TYPE public.counterparty_type AS ENUM ('fornecedor', 'cliente', 'ambos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_card_transaction_type') THEN
    CREATE TYPE public.credit_card_transaction_type AS ENUM (
      'compra', 'pagamento', 'tarifa', 'juros', 'estorno', 'ajuste'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_revenue_status') THEN
    CREATE TYPE public.business_revenue_status AS ENUM (
      'pending', 'received', 'overdue', 'canceled'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_expense_status') THEN
    CREATE TYPE public.business_expense_status AS ENUM (
      'pending', 'paid', 'overdue', 'canceled'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
    CREATE TYPE public.employee_status AS ENUM ('active', 'on_leave', 'terminated');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- TABLE: credit_cards (from 014)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.credit_cards (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope        public.financial_module_scope NOT NULL,
  business_id  UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  issuer       TEXT,
  brand        TEXT,
  last_four    TEXT CHECK (last_four IS NULL OR last_four ~ '^[0-9]{4}$'),
  credit_limit NUMERIC(14, 2) CHECK (credit_limit IS NULL OR credit_limit >= 0),
  closing_day  SMALLINT CHECK (closing_day IS NULL OR (closing_day BETWEEN 1 AND 31)),
  due_day      SMALLINT CHECK (due_day IS NULL OR (due_day BETWEEN 1 AND 31)),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_cards_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT credit_cards_id_user_unique UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.credit_card_transactions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id            UUID NOT NULL,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope              public.financial_module_scope NOT NULL,
  business_id        UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  transaction_type   public.credit_card_transaction_type NOT NULL DEFAULT 'compra',
  description        TEXT NOT NULL,
  amount             NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  installment_total  SMALLINT NOT NULL DEFAULT 1 CHECK (installment_total >= 1),
  installment_number SMALLINT NOT NULL DEFAULT 1 CHECK (installment_number >= 1),
  occurred_on        DATE NOT NULL DEFAULT CURRENT_DATE,
  posted_month       DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_card_transactions_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT credit_card_transactions_installments_check
    CHECK (installment_number <= installment_total),
  CONSTRAINT credit_card_transactions_posted_month_check
    CHECK (posted_month = date_trunc('month', posted_month)::date),
  CONSTRAINT credit_card_transactions_card_user_fk
    FOREIGN KEY (card_id, user_id) REFERENCES public.credit_cards(id, user_id) ON DELETE CASCADE
);

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_cards_select_own ON public.credit_cards;
CREATE POLICY credit_cards_select_own ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_cards_insert_own ON public.credit_cards;
CREATE POLICY credit_cards_insert_own ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_cards_update_own ON public.credit_cards;
CREATE POLICY credit_cards_update_own ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_cards_delete_own ON public.credit_cards;
CREATE POLICY credit_cards_delete_own ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS credit_card_transactions_select_own ON public.credit_card_transactions;
CREATE POLICY credit_card_transactions_select_own ON public.credit_card_transactions
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_card_transactions_insert_own ON public.credit_card_transactions;
CREATE POLICY credit_card_transactions_insert_own ON public.credit_card_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_card_transactions_update_own ON public.credit_card_transactions;
CREATE POLICY credit_card_transactions_update_own ON public.credit_card_transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS credit_card_transactions_delete_own ON public.credit_card_transactions;
CREATE POLICY credit_card_transactions_delete_own ON public.credit_card_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- TABLE: business_counterparties (from 014)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_counterparties (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  type       public.counterparty_type NOT NULL DEFAULT 'cliente',
  name       TEXT NOT NULL,
  legal_name TEXT,
  document   TEXT,
  email      TEXT,
  phone      TEXT,
  city       TEXT,
  state      TEXT,
  notes      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_counterparties_business_type_active
  ON public.business_counterparties(business_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_business_counterparties_user_business
  ON public.business_counterparties(user_id, business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_counterparties_document_unique
  ON public.business_counterparties(business_id, document)
  WHERE document IS NOT NULL;

DROP TRIGGER IF EXISTS business_counterparties_touch_updated_at ON public.business_counterparties;
CREATE TRIGGER business_counterparties_touch_updated_at
  BEFORE UPDATE ON public.business_counterparties
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.business_counterparties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_counterparties_select_own ON public.business_counterparties;
CREATE POLICY business_counterparties_select_own ON public.business_counterparties
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS business_counterparties_insert_own ON public.business_counterparties;
CREATE POLICY business_counterparties_insert_own ON public.business_counterparties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS business_counterparties_update_own ON public.business_counterparties;
CREATE POLICY business_counterparties_update_own ON public.business_counterparties
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS business_counterparties_delete_own ON public.business_counterparties;
CREATE POLICY business_counterparties_delete_own ON public.business_counterparties
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- COLUMNS: status, due_date, paid_at, counterparty_id (from 015)
-- ---------------------------------------------------------------------------

ALTER TABLE public.business_revenues
  ADD COLUMN IF NOT EXISTS status        public.business_revenue_status NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS due_date      date,
  ADD COLUMN IF NOT EXISTS paid_at       date,
  ADD COLUMN IF NOT EXISTS counterparty_id uuid REFERENCES public.business_counterparties(id) ON DELETE SET NULL;

ALTER TABLE public.business_expenses
  ADD COLUMN IF NOT EXISTS status        public.business_expense_status NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS due_date      date,
  ADD COLUMN IF NOT EXISTS paid_at       date,
  ADD COLUMN IF NOT EXISTS counterparty_id uuid REFERENCES public.business_counterparties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_business_revenues_status
  ON public.business_revenues(business_id, status);
CREATE INDEX IF NOT EXISTS idx_business_revenues_due_date
  ON public.business_revenues(business_id, due_date)
  WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_expenses_status
  ON public.business_expenses(business_id, status);
CREATE INDEX IF NOT EXISTS idx_business_expenses_due_date
  ON public.business_expenses(business_id, due_date)
  WHERE due_date IS NOT NULL;

-- ---------------------------------------------------------------------------
-- TABLE: business_employees (from 016)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_employees (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id      UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  cpf              TEXT,
  role             TEXT,
  monthly_salary   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  hire_date        DATE,
  termination_date DATE,
  status           public.employee_status NOT NULL DEFAULT 'active',
  email            TEXT,
  phone            TEXT,
  notes            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_employees_business_status
  ON public.business_employees(business_id, status)
  WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_business_employees_user_business
  ON public.business_employees(user_id, business_id);

DROP TRIGGER IF EXISTS business_employees_touch_updated_at ON public.business_employees;
CREATE TRIGGER business_employees_touch_updated_at
  BEFORE UPDATE ON public.business_employees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.business_employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_employees_select_own ON public.business_employees;
CREATE POLICY business_employees_select_own ON public.business_employees
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS business_employees_insert_own ON public.business_employees;
CREATE POLICY business_employees_insert_own ON public.business_employees
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS business_employees_update_own ON public.business_employees;
CREATE POLICY business_employees_update_own ON public.business_employees
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS business_employees_delete_own ON public.business_employees;
CREATE POLICY business_employees_delete_own ON public.business_employees
  FOR DELETE USING (auth.uid() = user_id);
