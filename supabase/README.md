# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key
   - Service Role Key (keep this secret!)

## 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Run Database Migrations

### Step 1: Run the main schema migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and run it

### Step 2: Run the auth trigger migration

1. In SQL Editor, create a new query
2. Copy the contents of `migrations/002_auth_trigger.sql`
3. Paste and run it

## 4. Configure Authentication

### Enable Email Auth (Magic Link)

1. Go to Authentication → Providers
2. Email should be enabled by default
3. Configure:
   - Enable "Confirm email" = OFF (for faster sign up during development)
   - Enable "Secure email change" = ON
   - Set Site URL to your app URL (e.g., `http://localhost:3000`)
   - Add Redirect URLs: `http://localhost:3000/callback`

### Enable Google OAuth

1. Go to Authentication → Providers → Google
2. Enable Google
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project or select existing
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

## 5. Set up URL Configuration

1. Go to Authentication → URL Configuration
2. Site URL: `http://localhost:3000` (or your production URL)
3. Redirect URLs:
   - `http://localhost:3000/callback`
   - `https://your-domain.com/callback` (for production)

## 6. Verify Setup

Test that everything works:

1. Start your app: `npm run dev`
2. Try signing up with email
3. Check the `profiles` table to see if a profile was created
4. Check the `destinations` table to see if default destinations were created
5. Check the `subscriptions` table to see if trial subscription was created

## Troubleshooting

### Profile not created on signup
- Verify the `on_auth_user_created` trigger exists on `auth.users`
- Check the Supabase logs for any errors

### RLS blocking queries
- Make sure you're authenticated when making requests
- Verify the RLS policies are correctly set up

### Missing tables
- Re-run the migrations
- Check for any SQL errors in the Supabase logs
