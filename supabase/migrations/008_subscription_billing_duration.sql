-- Add billing duration to support plan capability enforcement by cycle.

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS billing_duration_months INTEGER NOT NULL DEFAULT 1
CHECK (billing_duration_months IN (1, 3, 6, 12));

UPDATE public.subscriptions
SET billing_duration_months = 1
WHERE billing_duration_months IS NULL;

