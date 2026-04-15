-- ============================================================
-- AR/AP STATUS TRACKING FIELDS
-- Adds financial status, due date, paid date, and counterparty
-- linkage to business_revenues and business_expenses.
-- ============================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_revenue_status') THEN
    CREATE TYPE public.business_revenue_status AS ENUM (
      'pending',   -- aguardando recebimento
      'received',  -- recebido
      'overdue',   -- atrasado
      'canceled'   -- cancelado
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_expense_status') THEN
    CREATE TYPE public.business_expense_status AS ENUM (
      'pending',   -- a pagar
      'paid',      -- pago
      'overdue',   -- atrasado
      'canceled'   -- cancelado
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- business_revenues — add status, due_date, paid_at, counterparty_id
-- ---------------------------------------------------------------------------

ALTER TABLE public.business_revenues
  ADD COLUMN IF NOT EXISTS status public.business_revenue_status NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS paid_at date,
  ADD COLUMN IF NOT EXISTS counterparty_id uuid REFERENCES public.business_counterparties(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- business_expenses — add status, due_date, paid_at, counterparty_id
-- ---------------------------------------------------------------------------

ALTER TABLE public.business_expenses
  ADD COLUMN IF NOT EXISTS status public.business_expense_status NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS paid_at date,
  ADD COLUMN IF NOT EXISTS counterparty_id uuid REFERENCES public.business_counterparties(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

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
