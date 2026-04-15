-- Migration 020: Add closing_date to business_revenues
-- closing_date = data de fechamento/medição do serviço (pode diferir da data de vencimento)
-- Útil para empresas que medem/fecham contratos em um mês e recebem em outro.

ALTER TABLE public.business_revenues
  ADD COLUMN IF NOT EXISTS closing_date DATE NULL;

COMMENT ON COLUMN public.business_revenues.closing_date
  IS 'Data de fechamento ou medição do serviço/contrato. Opcional — diferente de due_date quando a medição e o recebimento ocorrem em meses distintos.';
