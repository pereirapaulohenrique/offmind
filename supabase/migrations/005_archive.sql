-- Add archived_at column to items for soft-archive support
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_items_archived ON public.items(user_id, archived_at)
  WHERE archived_at IS NOT NULL;
