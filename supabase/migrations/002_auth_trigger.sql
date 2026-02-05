-- =============================================================================
-- Auth Trigger for New User Profile Creation
-- RUN THIS SEPARATELY IN SUPABASE SQL EDITOR
-- This requires access to the auth schema
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
