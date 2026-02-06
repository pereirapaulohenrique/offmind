-- =============================================================================
-- OffMind Database Schema
-- Version: 1.0
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users (extended from Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, canceled, past_due
  plan TEXT NOT NULL DEFAULT 'trial', -- trial, monthly, annual, lifetime
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Destinations (both default and custom)
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- backlog, reference, incubating, someday, questions, waiting, trash, or custom
  icon TEXT DEFAULT '📋', -- emoji
  color TEXT DEFAULT 'gray', -- tailwind color name
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- true for trash, cannot be deleted
  sort_order INTEGER DEFAULT 0,
  custom_fields JSONB DEFAULT '[]', -- array of field definitions
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Spaces (life areas)
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT 'indigo',
  status TEXT DEFAULT 'active', -- active, completed, archived
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Items (core entity)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  notes TEXT, -- markdown content

  -- Location
  layer TEXT NOT NULL DEFAULT 'capture', -- capture, process, commit
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,

  -- Scheduling (for commit layer)
  scheduled_at TIMESTAMPTZ, -- date/time when scheduled
  duration_minutes INTEGER, -- optional duration
  is_all_day BOOLEAN DEFAULT false,

  -- Organization
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- Custom field values (keyed by field id from destination)
  custom_values JSONB DEFAULT '{}',

  -- Waiting for (when destination is 'waiting')
  waiting_for TEXT, -- person/context
  waiting_since TIMESTAMPTZ,

  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Metadata
  source TEXT DEFAULT 'web', -- web, telegram, extension, api
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pages (rich documents)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Tiptap JSON format

  -- Organization
  space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL, -- optional link to item

  -- Metadata
  icon TEXT DEFAULT '📄',
  cover_image TEXT,
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Processing Log (for debugging and cost tracking)
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,

  action TEXT NOT NULL, -- suggest_destination, expand_note, extract_date, merge_suggest
  model TEXT NOT NULL, -- claude-3-haiku, gpt-4o-mini
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10, 6),

  request JSONB,
  response JSONB,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Telegram Connections
CREATE TABLE IF NOT EXISTS public.telegram_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(telegram_user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_user_layer ON public.items(user_id, layer);
CREATE INDEX IF NOT EXISTS idx_items_user_destination ON public.items(user_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_items_user_scheduled ON public.items(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_user_space ON public.items(user_id, space_id);
CREATE INDEX IF NOT EXISTS idx_items_user_project ON public.items(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_items_created ON public.items(created_at DESC);

-- Pages indexes
CREATE INDEX IF NOT EXISTS idx_pages_user ON public.pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_project ON public.pages(project_id);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_items_search ON public.items
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')));
CREATE INDEX IF NOT EXISTS idx_pages_search ON public.pages
  USING gin(to_tsvector('english', title));

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;

-- Policies (user can only access their own data)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own destinations" ON public.destinations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spaces" ON public.spaces
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own items" ON public.items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pages" ON public.pages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI logs" ON public.ai_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert AI logs" ON public.ai_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage telegram connections" ON public.telegram_connections
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_spaces_updated_at ON public.spaces;
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- SEED DEFAULT DESTINATIONS (triggered on profile creation)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_default_destinations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.destinations (user_id, name, slug, icon, color, is_default, is_system, sort_order)
  VALUES
    (NEW.id, 'Backlog', 'backlog', '📋', 'blue', true, false, 1),
    (NEW.id, 'Reference', 'reference', '📚', 'purple', true, false, 2),
    (NEW.id, 'Incubating', 'incubating', '💡', 'yellow', true, false, 3),
    (NEW.id, 'Someday', 'someday', '🌙', 'gray', true, false, 4),
    (NEW.id, 'Questions', 'questions', '❓', 'pink', true, false, 5),
    (NEW.id, 'Waiting', 'waiting', '⏳', 'orange', true, false, 6),
    (NEW.id, 'Trash', 'trash', '🗑️', 'red', true, true, 99);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_destinations ON public.profiles;
CREATE TRIGGER on_profile_created_destinations
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_destinations();

-- =============================================================================
-- CREATE TRIAL SUBSCRIPTION (triggered on profile creation)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, plan, trial_ends_at)
  VALUES (NEW.id, 'trialing', 'trial', now() + interval '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_trial_subscription();

-- =============================================================================
-- HANDLE NEW USER (create profile from auth.users)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger must be created in the auth schema
-- Run this separately with appropriate permissions:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- GRANT PERMISSIONS (for Supabase)
-- =============================================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all on tables to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limited access to anon users (for public data if any)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
