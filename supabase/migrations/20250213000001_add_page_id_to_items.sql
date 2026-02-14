-- Add page_id column to items table for directed capture to pages
ALTER TABLE public.items
  ADD COLUMN page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;

-- Partial index for querying items captured to a specific page
CREATE INDEX IF NOT EXISTS idx_items_page_capture_queue ON public.items(page_id, layer)
  WHERE page_id IS NOT NULL AND layer = 'capture' AND archived_at IS NULL;
