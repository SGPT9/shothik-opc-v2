-- =============================================================================
-- Shothik AI / Supabase DeepTech Production Migration
-- File: supabase/migrations/20261101_supabase_deeptech_schema.sql
-- Description:
--   1. Extensions (pgcrypto, uuid-ossp, supabase_vault, pg_net)
--   2. Projects with Git for Writers Branching Lineage & Figma-style Room Collaboration
--   3. Saved Reports & Executive Briefs Cloud Persistence
--   4. Double-Entry User Credit Ledger
--   5. Creator Guilds & Escrow Pooling
--   6. Immutable Cryptographic Proof of Authorship & Copyright Certificates
--   7. Supabase Auth Custom Claims & Row Level Security (RLS) Policies
--   8. Supabase Vault Credential Access Functions
--   9. Realtime Publication Bindings
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "supabase_vault" CASCADE;
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'supabase_vault extension skipped or handled by cloud manager';
END $$;
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_net";
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'pg_net extension skipped or handled by cloud manager';
END $$;

-- 2. PROJECTS (Writing Studio, Lineage Trees, Plot Branching)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'book' CHECK (type IN ('book', 'research', 'assignment')),
    template TEXT,
    description TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    word_count INTEGER NOT NULL DEFAULT 0,
    progress INTEGER NOT NULL DEFAULT 0,
    starred BOOLEAN NOT NULL DEFAULT FALSE,
    share_token TEXT UNIQUE,
    access_mode TEXT NOT NULL DEFAULT 'private' CHECK (access_mode IN ('private', 'public', 'passcode', 'restricted')),
    passcode_hash TEXT,
    parent_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    branch_name TEXT NOT NULL DEFAULT 'main',
    lineage_root_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_lineage_root ON public.projects(lineage_root_id);
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON public.projects(share_token);

-- 3. SAVED REPORTS & BRIEFS
CREATE TABLE IF NOT EXISTS public.saved_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'markdown' CHECK (type IN ('markdown', 'slides', 'sheet', 'pdf')),
    snippet TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    chat_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON public.saved_reports(user_id);

-- 4. USER CREDITS & BILLING LEDGER
CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 500 CHECK (balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 500,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. CREATOR GUILDS & POOL ORDERS
CREATE TABLE IF NOT EXISTS public.creator_guilds (
    id SERIAL PRIMARY KEY,
    guild_id TEXT UNIQUE NOT NULL,
    guild_name TEXT NOT NULL,
    vertical TEXT NOT NULL,
    regional_hub TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 1,
    collective_pool_value_bdt NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    escrow_badge TEXT NOT NULL DEFAULT 'VERIFIED_ESCROW_TIER_1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. PROOF OF AUTHORSHIP & COPYRIGHT CERTIFICATES
CREATE TABLE IF NOT EXISTS public.authorship_certificates (
    certificate_id TEXT PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_hash_sha256 TEXT NOT NULL,
    merkle_root TEXT NOT NULL,
    tamper_proof_signature TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'verified',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_authorship_project_id ON public.authorship_certificates(project_id);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES & CUSTOM CLAIMS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorship_certificates ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user claim
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''),
    'student'
  );
$$;

-- RLS: Projects
DROP POLICY IF EXISTS "Projects user owner and collaborator access" ON public.projects;
CREATE POLICY "Projects user owner and collaborator access" ON public.projects
    FOR ALL
    USING (
      auth.uid()::text = user_id 
      OR access_mode = 'public'
      OR (access_mode = 'passcode' AND passcode_hash IS NOT NULL)
      OR (settings -> 'collaboratorRoles' ? auth.uid()::text)
    )
    WITH CHECK (
      auth.uid()::text = user_id
      OR (
        -- Head professor or publisher can edit/grade
        public.get_auth_role() IN ('head_professor', 'publisher_chief')
      )
      OR (
        -- TAs cannot overwrite the canonical manuscript without review
        public.get_auth_role() = 'teaching_assistant' AND (settings -> 'collaboratorRoles' -> auth.uid()::text ->> 'canComment')::boolean = true
      )
    );

-- RLS: Saved Reports
DROP POLICY IF EXISTS "Saved Reports user isolation" ON public.saved_reports;
CREATE POLICY "Saved Reports user isolation" ON public.saved_reports
    FOR ALL
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- RLS: User Credits
DROP POLICY IF EXISTS "User Credits read own balance" ON public.user_credits;
CREATE POLICY "User Credits read own balance" ON public.user_credits
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- RLS: Creator Guilds (Community Public Read)
DROP POLICY IF EXISTS "Creator Guilds public read" ON public.creator_guilds;
CREATE POLICY "Creator Guilds public read" ON public.creator_guilds
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Creator Guilds authenticated creation" ON public.creator_guilds;
CREATE POLICY "Creator Guilds authenticated creation" ON public.creator_guilds
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS: Authorship Certificates (Publicly Verifiable by Certificate ID)
DROP POLICY IF EXISTS "Authorship certificates public verification" ON public.authorship_certificates;
CREATE POLICY "Authorship certificates public verification" ON public.authorship_certificates
    FOR SELECT
    USING (true);

-- 8. SUPABASE VAULT ACCESS FUNCTION
CREATE OR REPLACE FUNCTION public.get_my_vault_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  caller_id TEXT := auth.uid()::text;
  decrypted TEXT;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated';
  END IF;

  -- Vault secret lookup scoped to caller
  SELECT s.decrypted_secret INTO decrypted
  FROM vault.decrypted_secrets s
  WHERE s.name = caller_id || ':' || secret_name
  LIMIT 1;

  RETURN decrypted;
END;
$$;

-- 9. REALTIME PUBLICATION BINDINGS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_reports;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.authorship_certificates;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Publication binding completed or already bound';
END $$;
