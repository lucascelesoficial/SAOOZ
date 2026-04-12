-- Foundation schema for next financial modules (data layer only).
-- Scope:
-- 1) Reserva de Emergencia (PF/PJ)
-- 2) Cartao de Credito (PF/PJ)
-- 3) Investimentos (PF/PJ)
-- 4) Fornecedores e Clientes (PJ)
--
-- No UI, no business engine, no billing changes.

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'financial_module_scope'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.financial_module_scope AS ENUM ('personal', 'business');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'reserve_entry_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.reserve_entry_type AS ENUM ('aporte', 'resgate', 'ajuste');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'credit_card_transaction_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.credit_card_transaction_type AS ENUM (
      'compra',
      'pagamento',
      'tarifa',
      'juros',
      'estorno',
      'ajuste'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'investment_account_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.investment_account_type AS ENUM (
      'corretora',
      'banco',
      'previdencia',
      'cripto',
      'outra'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'investment_asset_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.investment_asset_type AS ENUM (
      'acao',
      'fii',
      'etf',
      'renda_fixa',
      'cripto',
      'fundo',
      'internacional',
      'outro'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'investment_movement_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.investment_movement_type AS ENUM (
      'compra',
      'venda',
      'dividendo',
      'juros',
      'aporte',
      'resgate',
      'taxa',
      'ajuste'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'counterparty_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.counterparty_type AS ENUM ('fornecedor', 'cliente', 'ambos');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- TABLES: RESERVA DE EMERGENCIA (PF/PJ)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_reserves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Reserva de Emergencia',
  target_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
  initial_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (initial_amount >= 0),
  monthly_target_contribution NUMERIC(14, 2) CHECK (monthly_target_contribution >= 0),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT financial_reserves_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT financial_reserves_id_user_unique UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.financial_reserve_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserve_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  entry_type public.reserve_entry_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  happened_on DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT financial_reserve_entries_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT financial_reserve_entries_reserve_user_fk
    FOREIGN KEY (reserve_id, user_id)
    REFERENCES public.financial_reserves(id, user_id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- TABLES: CARTAO DE CREDITO (PF/PJ)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  brand TEXT,
  last_four TEXT CHECK (last_four IS NULL OR last_four ~ '^[0-9]{4}$'),
  credit_limit NUMERIC(14, 2) CHECK (credit_limit IS NULL OR credit_limit >= 0),
  closing_day SMALLINT CHECK (closing_day IS NULL OR (closing_day BETWEEN 1 AND 31)),
  due_day SMALLINT CHECK (due_day IS NULL OR (due_day BETWEEN 1 AND 31)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_cards_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT credit_cards_id_user_unique UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.credit_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  transaction_type public.credit_card_transaction_type NOT NULL DEFAULT 'compra',
  description TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  installment_total SMALLINT NOT NULL DEFAULT 1 CHECK (installment_total >= 1),
  installment_number SMALLINT NOT NULL DEFAULT 1 CHECK (installment_number >= 1),
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  posted_month DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT credit_card_transactions_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT credit_card_transactions_installments_check
    CHECK (installment_number <= installment_total),
  CONSTRAINT credit_card_transactions_posted_month_check
    CHECK (posted_month = date_trunc('month', posted_month)::date),
  CONSTRAINT credit_card_transactions_card_user_fk
    FOREIGN KEY (card_id, user_id)
    REFERENCES public.credit_cards(id, user_id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- TABLES: INVESTIMENTOS (PF/PJ)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  account_type public.investment_account_type NOT NULL DEFAULT 'corretora',
  currency TEXT NOT NULL DEFAULT 'BRL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT investment_accounts_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT investment_accounts_id_user_unique UNIQUE (id, user_id)
);

CREATE TABLE IF NOT EXISTS public.investment_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  asset_type public.investment_asset_type NOT NULL DEFAULT 'outro',
  quantity NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  average_price NUMERIC(14, 4) NOT NULL DEFAULT 0 CHECK (average_price >= 0),
  target_allocation_pct NUMERIC(5, 2) CHECK (
    target_allocation_pct IS NULL OR (target_allocation_pct >= 0 AND target_allocation_pct <= 100)
  ),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT investment_assets_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT investment_assets_account_symbol_unique UNIQUE (account_id, symbol),
  CONSTRAINT investment_assets_id_user_unique UNIQUE (id, user_id),
  CONSTRAINT investment_assets_account_user_fk
    FOREIGN KEY (account_id, user_id)
    REFERENCES public.investment_accounts(id, user_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.investment_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  asset_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.financial_module_scope NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  movement_type public.investment_movement_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  quantity NUMERIC(20, 8) CHECK (quantity IS NULL OR quantity >= 0),
  unit_price NUMERIC(14, 4) CHECK (unit_price IS NULL OR unit_price >= 0),
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT investment_movements_scope_business_check CHECK (
    (scope = 'personal' AND business_id IS NULL)
    OR
    (scope = 'business' AND business_id IS NOT NULL)
  ),
  CONSTRAINT investment_movements_account_user_fk
    FOREIGN KEY (account_id, user_id)
    REFERENCES public.investment_accounts(id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT investment_movements_asset_user_fk
    FOREIGN KEY (asset_id, user_id)
    REFERENCES public.investment_assets(id, user_id)
    ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- TABLE: FORNECEDORES E CLIENTES (PJ)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_counterparties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  type public.counterparty_type NOT NULL DEFAULT 'cliente',
  name TEXT NOT NULL,
  legal_name TEXT,
  document TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_financial_reserves_user_scope
  ON public.financial_reserves(user_id, scope, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_reserves_business
  ON public.financial_reserves(business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_reserve_entries_reserve
  ON public.financial_reserve_entries(reserve_id, happened_on DESC);

CREATE INDEX IF NOT EXISTS idx_financial_reserve_entries_user_scope
  ON public.financial_reserve_entries(user_id, scope, happened_on DESC);

CREATE INDEX IF NOT EXISTS idx_financial_reserve_entries_business
  ON public.financial_reserve_entries(business_id, happened_on DESC)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_scope_active
  ON public.credit_cards(user_id, scope, is_active);

CREATE INDEX IF NOT EXISTS idx_credit_cards_business
  ON public.credit_cards(business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_card_month
  ON public.credit_card_transactions(card_id, posted_month DESC);

CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_user_scope_month
  ON public.credit_card_transactions(user_id, scope, posted_month DESC);

CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_business_month
  ON public.credit_card_transactions(business_id, posted_month DESC)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_scope_active
  ON public.investment_accounts(user_id, scope, is_active);

CREATE INDEX IF NOT EXISTS idx_investment_accounts_business
  ON public.investment_accounts(business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investment_assets_account
  ON public.investment_assets(account_id);

CREATE INDEX IF NOT EXISTS idx_investment_assets_user_scope
  ON public.investment_assets(user_id, scope, is_active);

CREATE INDEX IF NOT EXISTS idx_investment_assets_business
  ON public.investment_assets(business_id)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investment_movements_account_date
  ON public.investment_movements(account_id, occurred_on DESC);

CREATE INDEX IF NOT EXISTS idx_investment_movements_user_scope_date
  ON public.investment_movements(user_id, scope, occurred_on DESC);

CREATE INDEX IF NOT EXISTS idx_investment_movements_business_date
  ON public.investment_movements(business_id, occurred_on DESC)
  WHERE business_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_counterparties_business_type_active
  ON public.business_counterparties(business_id, type, is_active);

CREATE INDEX IF NOT EXISTS idx_business_counterparties_user_business
  ON public.business_counterparties(user_id, business_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_counterparties_document_unique
  ON public.business_counterparties(business_id, document)
  WHERE document IS NOT NULL;

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS financial_reserves_touch_updated_at ON public.financial_reserves;
CREATE TRIGGER financial_reserves_touch_updated_at
  BEFORE UPDATE ON public.financial_reserves
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS credit_cards_touch_updated_at ON public.credit_cards;
CREATE TRIGGER credit_cards_touch_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS investment_accounts_touch_updated_at ON public.investment_accounts;
CREATE TRIGGER investment_accounts_touch_updated_at
  BEFORE UPDATE ON public.investment_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS investment_assets_touch_updated_at ON public.investment_assets;
CREATE TRIGGER investment_assets_touch_updated_at
  BEFORE UPDATE ON public.investment_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS business_counterparties_touch_updated_at ON public.business_counterparties;
CREATE TRIGGER business_counterparties_touch_updated_at
  BEFORE UPDATE ON public.business_counterparties
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.financial_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reserve_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_counterparties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_reserves_select_own" ON public.financial_reserves;
CREATE POLICY "financial_reserves_select_own" ON public.financial_reserves
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserves.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserves_insert_own" ON public.financial_reserves;
CREATE POLICY "financial_reserves_insert_own" ON public.financial_reserves
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserves.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserves_update_own" ON public.financial_reserves;
CREATE POLICY "financial_reserves_update_own" ON public.financial_reserves
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserves.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserves_delete_own" ON public.financial_reserves;
CREATE POLICY "financial_reserves_delete_own" ON public.financial_reserves
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "financial_reserve_entries_select_own" ON public.financial_reserve_entries;
CREATE POLICY "financial_reserve_entries_select_own" ON public.financial_reserve_entries
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserve_entries.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserve_entries_insert_own" ON public.financial_reserve_entries;
CREATE POLICY "financial_reserve_entries_insert_own" ON public.financial_reserve_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserve_entries.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserve_entries_update_own" ON public.financial_reserve_entries;
CREATE POLICY "financial_reserve_entries_update_own" ON public.financial_reserve_entries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = financial_reserve_entries.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "financial_reserve_entries_delete_own" ON public.financial_reserve_entries;
CREATE POLICY "financial_reserve_entries_delete_own" ON public.financial_reserve_entries
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_cards_select_own" ON public.credit_cards;
CREATE POLICY "credit_cards_select_own" ON public.credit_cards
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_cards.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_cards_insert_own" ON public.credit_cards;
CREATE POLICY "credit_cards_insert_own" ON public.credit_cards
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_cards.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_cards_update_own" ON public.credit_cards;
CREATE POLICY "credit_cards_update_own" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_cards.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_cards_delete_own" ON public.credit_cards;
CREATE POLICY "credit_cards_delete_own" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_card_transactions_select_own" ON public.credit_card_transactions;
CREATE POLICY "credit_card_transactions_select_own" ON public.credit_card_transactions
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_card_transactions.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_card_transactions_insert_own" ON public.credit_card_transactions;
CREATE POLICY "credit_card_transactions_insert_own" ON public.credit_card_transactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_card_transactions.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_card_transactions_update_own" ON public.credit_card_transactions;
CREATE POLICY "credit_card_transactions_update_own" ON public.credit_card_transactions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = credit_card_transactions.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "credit_card_transactions_delete_own" ON public.credit_card_transactions;
CREATE POLICY "credit_card_transactions_delete_own" ON public.credit_card_transactions
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "investment_accounts_select_own" ON public.investment_accounts;
CREATE POLICY "investment_accounts_select_own" ON public.investment_accounts
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_accounts.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_accounts_insert_own" ON public.investment_accounts;
CREATE POLICY "investment_accounts_insert_own" ON public.investment_accounts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_accounts.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_accounts_update_own" ON public.investment_accounts;
CREATE POLICY "investment_accounts_update_own" ON public.investment_accounts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_accounts.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_accounts_delete_own" ON public.investment_accounts;
CREATE POLICY "investment_accounts_delete_own" ON public.investment_accounts
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "investment_assets_select_own" ON public.investment_assets;
CREATE POLICY "investment_assets_select_own" ON public.investment_assets
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_assets.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_assets_insert_own" ON public.investment_assets;
CREATE POLICY "investment_assets_insert_own" ON public.investment_assets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_assets.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_assets_update_own" ON public.investment_assets;
CREATE POLICY "investment_assets_update_own" ON public.investment_assets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_assets.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_assets_delete_own" ON public.investment_assets;
CREATE POLICY "investment_assets_delete_own" ON public.investment_assets
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "investment_movements_select_own" ON public.investment_movements;
CREATE POLICY "investment_movements_select_own" ON public.investment_movements
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_movements.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_movements_insert_own" ON public.investment_movements;
CREATE POLICY "investment_movements_insert_own" ON public.investment_movements
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_movements.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_movements_update_own" ON public.investment_movements;
CREATE POLICY "investment_movements_update_own" ON public.investment_movements
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (scope = 'personal' AND business_id IS NULL)
      OR (
        scope = 'business'
        AND business_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.business_profiles b
          WHERE b.id = investment_movements.business_id
            AND b.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "investment_movements_delete_own" ON public.investment_movements;
CREATE POLICY "investment_movements_delete_own" ON public.investment_movements
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "business_counterparties_select_own" ON public.business_counterparties;
CREATE POLICY "business_counterparties_select_own" ON public.business_counterparties
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.business_profiles b
      WHERE b.id = business_counterparties.business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_counterparties_insert_own" ON public.business_counterparties;
CREATE POLICY "business_counterparties_insert_own" ON public.business_counterparties
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.business_profiles b
      WHERE b.id = business_counterparties.business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_counterparties_update_own" ON public.business_counterparties;
CREATE POLICY "business_counterparties_update_own" ON public.business_counterparties
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.business_profiles b
      WHERE b.id = business_counterparties.business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_counterparties_delete_own" ON public.business_counterparties;
CREATE POLICY "business_counterparties_delete_own" ON public.business_counterparties
  FOR DELETE USING (auth.uid() = user_id);
