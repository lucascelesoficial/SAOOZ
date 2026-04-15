-- ============================================================
-- MÓDULO DE FUNCIONÁRIOS (PJ)
-- Cadastro de colaboradores com custo de trabalho estimado.
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
    CREATE TYPE public.employee_status AS ENUM (
      'active',      -- ativo
      'on_leave',    -- afastado
      'terminated'   -- demitido / encerrado
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.business_employees (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id       UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  cpf               TEXT,
  role              TEXT,
  monthly_salary    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  hire_date         DATE,
  termination_date  DATE,
  status            public.employee_status NOT NULL DEFAULT 'active',
  email             TEXT,
  phone             TEXT,
  notes             TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_employees_business_status
  ON public.business_employees(business_id, status)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_business_employees_user_business
  ON public.business_employees(user_id, business_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS business_employees_touch_updated_at ON public.business_employees;
CREATE TRIGGER business_employees_touch_updated_at
  BEFORE UPDATE ON public.business_employees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.business_employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_employees_select_own" ON public.business_employees;
CREATE POLICY "business_employees_select_own" ON public.business_employees
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "business_employees_insert_own" ON public.business_employees;
CREATE POLICY "business_employees_insert_own" ON public.business_employees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "business_employees_update_own" ON public.business_employees;
CREATE POLICY "business_employees_update_own" ON public.business_employees
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "business_employees_delete_own" ON public.business_employees;
CREATE POLICY "business_employees_delete_own" ON public.business_employees
  FOR DELETE USING (auth.uid() = user_id);
