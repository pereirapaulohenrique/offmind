-- Item Activities: ATS-style lifecycle log for items
-- Tracks every significant action (created, routed, completed, archived, etc.) with optional notes
CREATE TABLE public.item_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'created', 'routed', 'scheduled', 'completed', 'uncompleted', 'archived', 'unarchived', 'field_changed', 'note_added'
  note TEXT,             -- Optional user-provided note (routing notes, etc.)
  metadata JSONB,        -- Action-specific data: { from_destination, to_destination, field_name, old_value, new_value, ... }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_item_activities_item ON public.item_activities(item_id);
CREATE INDEX idx_item_activities_user ON public.item_activities(user_id);
CREATE INDEX idx_item_activities_created ON public.item_activities(created_at DESC);

ALTER TABLE public.item_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own item activities" ON public.item_activities FOR ALL USING (auth.uid() = user_id);
