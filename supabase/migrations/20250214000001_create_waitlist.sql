-- Waitlist table for landing page signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Allow the service role to insert (API uses createServiceClient)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- No authenticated user policies needed — only service role inserts via API route
-- Service role bypasses RLS by default
