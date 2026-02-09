-- Re-add attachments column (original migration 003 was tracked but column is missing)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
