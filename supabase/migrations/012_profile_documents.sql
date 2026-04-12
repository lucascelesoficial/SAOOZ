-- Add CPF to personal profiles and make CNPJ trackable per user.
-- Both fields are nullable — collected after first purchase, not at signup.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Optional: soft constraint to prevent clearly invalid formats (not full validation)
-- Full validation is enforced in application layer.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_cpf_format
  CHECK (cpf IS NULL OR (LENGTH(REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')) = 11));
