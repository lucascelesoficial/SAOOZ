-- Migration 021: Database-backed rate limiting buckets
-- Replaces in-memory Map which resets on every serverless cold start.
-- Each row = one sliding window bucket per (scope, user).

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key         TEXT        NOT NULL,
  count       INTEGER     NOT NULL DEFAULT 1,
  reset_at    TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rate_limit_buckets_pkey PRIMARY KEY (key)
);

-- Auto-clean expired buckets (optional, run via cron or pg_cron)
-- Just delete rows where reset_at < now() periodically.

-- No RLS needed — only accessed via service role key from server
ALTER TABLE public.rate_limit_buckets DISABLE ROW LEVEL SECURITY;

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_reset_at
  ON public.rate_limit_buckets (reset_at);

COMMENT ON TABLE public.rate_limit_buckets IS
  'Persistent rate limit buckets. key = scope:user_id. Survives serverless restarts.';
