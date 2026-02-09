-- Enable real-time for items table so inbox auto-refreshes
-- when items are added from desktop app, web capture bar, or any other source
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- Full replica identity needed for UPDATE/DELETE events to include old row data
ALTER TABLE public.items REPLICA IDENTITY FULL;
