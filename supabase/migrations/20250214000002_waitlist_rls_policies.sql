-- Add permissive RLS policies so anon key can insert/read waitlist
-- (service role key may not be configured on all deployments)

CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read waitlist count" ON public.waitlist
  FOR SELECT USING (true);
