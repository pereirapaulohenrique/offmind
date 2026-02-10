-- Subtasks table for item checklists
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subtasks_item ON public.subtasks(item_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user ON public.subtasks(user_id);

-- Row-level security
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subtasks" ON public.subtasks
  FOR ALL USING (auth.uid() = user_id);

-- Updated_at trigger (reuses existing function from initial_schema)
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON public.subtasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Grant permissions
GRANT ALL ON public.subtasks TO authenticated;
GRANT SELECT ON public.subtasks TO anon;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
