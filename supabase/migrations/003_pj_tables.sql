-- ============================================================
-- PJ MODE + BUSINESS TABLES
-- ============================================================

-- Add mode column to profiles (pf | pj | both | null = not set yet)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mode TEXT CHECK (mode IN ('pf', 'pj', 'both')) DEFAULT NULL;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE business_tax_regime AS ENUM ('mei', 'simples', 'presumido', 'real');
CREATE TYPE business_activity   AS ENUM ('servico', 'comercio', 'industria', 'misto');
CREATE TYPE business_rev_category AS ENUM ('servico', 'produto', 'recorrente', 'comissao', 'outro');
CREATE TYPE business_exp_category AS ENUM (
  'fixo_aluguel', 'fixo_salarios', 'fixo_prolabore', 'fixo_contador',
  'fixo_software', 'fixo_internet', 'fixo_outros',
  'variavel_comissao', 'variavel_frete', 'variavel_embalagem',
  'variavel_trafego', 'variavel_taxas', 'variavel_outros',
  'operacional_marketing', 'operacional_admin', 'operacional_juridico',
  'operacional_manutencao', 'operacional_viagem', 'operacional_outros',
  'investimento_equipamento', 'investimento_estoque',
  'investimento_expansao', 'investimento_contratacao', 'investimento_outros'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.business_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  cnpj        TEXT,
  tax_regime  business_tax_regime NOT NULL DEFAULT 'simples',
  activity    business_activity NOT NULL DEFAULT 'servico',
  description TEXT,
  city        TEXT,
  state       TEXT,
  founded_at  DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revenue (faturamento) — month by month
CREATE TABLE public.business_revenues (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  description TEXT,
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  month       DATE NOT NULL,
  category    business_rev_category NOT NULL DEFAULT 'servico',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses (despesas da empresa) — month by month
CREATE TABLE public.business_expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  description TEXT,
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  month       DATE NOT NULL,
  category    business_exp_category NOT NULL DEFAULT 'fixo_outros',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_business_profiles_user ON public.business_profiles(user_id);
CREATE INDEX idx_business_revenues_user_month ON public.business_revenues(user_id, month);
CREATE INDEX idx_business_revenues_biz_month  ON public.business_revenues(business_id, month);
CREATE INDEX idx_business_expenses_user_month ON public.business_expenses(user_id, month);
CREATE INDEX idx_business_expenses_biz_month  ON public.business_expenses(business_id, month);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biz_profiles_select_own" ON public.business_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "biz_profiles_insert_own" ON public.business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_profiles_update_own" ON public.business_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_profiles_delete_own" ON public.business_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "biz_revenues_select_own" ON public.business_revenues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "biz_revenues_insert_own" ON public.business_revenues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_revenues_update_own" ON public.business_revenues FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_revenues_delete_own" ON public.business_revenues FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "biz_expenses_select_own" ON public.business_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "biz_expenses_insert_own" ON public.business_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_expenses_update_own" ON public.business_expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_expenses_delete_own" ON public.business_expenses FOR DELETE USING (auth.uid() = user_id);
