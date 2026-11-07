-- =============================================================================
-- SHOTHIK AI — SUPABASE AUTH PROFILES & STARTER CREDIT PROVISIONING TRIGGER
-- Migration: 20261107000000_supabase_auth_profiles_trigger.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  country TEXT NOT NULL DEFAULT 'BD',
  credits INTEGER NOT NULL DEFAULT 500,
  tier TEXT NOT NULL DEFAULT 'starter',
  auth_provider TEXT NOT NULL DEFAULT 'supabase',
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles (LOWER(email));

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Automatically provision public.user_profiles, public.user_credits, and public.user_subscriptions
-- whenever a user signs up via Supabase Auth (auth.users).
CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_country TEXT;
  v_email TEXT;
BEGIN
  v_email := LOWER(COALESCE(NEW.email, NEW.id::text || '@shothik.local'));
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(v_email, '@', 1)
  );
  v_country := COALESCE(NEW.raw_user_meta_data->>'country', 'BD');

  INSERT INTO public.user_profiles (
    id, email, name, role, country, credits, tier, auth_provider, created_at, updated_at
  ) VALUES (
    NEW.id::text, v_email, v_name, 'user', v_country, 500, 'starter', 'supabase', now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.user_profiles.name),
    updated_at = now();

  -- Provision starter credits if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_credits'
  ) THEN
    INSERT INTO public.user_credits (user_id, balance, lifetime_earned, lifetime_spent)
    VALUES (NEW.id::text, 500, 500, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Provision starter subscription if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions'
  ) THEN
    INSERT INTO public.user_subscriptions (user_id, tier, status)
    VALUES (NEW.id::text, 'starter', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_supabase_user();
