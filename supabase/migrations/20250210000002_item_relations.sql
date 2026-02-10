-- Item Relations: "Related to" (soft links) and "Blocked by / Blocks" (hard dependencies)
CREATE TABLE public.item_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  target_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('related', 'blocks')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_relation CHECK (source_item_id != target_item_id),
  CONSTRAINT unique_relation UNIQUE (source_item_id, target_item_id, relation_type)
);

CREATE INDEX idx_item_relations_source ON public.item_relations(source_item_id);
CREATE INDEX idx_item_relations_target ON public.item_relations(target_item_id);
CREATE INDEX idx_item_relations_user ON public.item_relations(user_id);

ALTER TABLE public.item_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own item relations" ON public.item_relations FOR ALL USING (auth.uid() = user_id);
