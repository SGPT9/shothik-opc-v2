-- =============================================================================
-- SHOTHIK AI — FULL CONVEX & INSFORGE TO SUPABASE POSTGRESQL MIGRATION
-- Migration: 20261107010000_convex_insforge_to_supabase_migration.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INSFORGE MULTI-TENANT ORGANIZATIONS, WORKSPACES, CANVAS & OPC TASKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'FREE',
  credits_pool INTEGER NOT NULL DEFAULT 550,
  mfs_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.canvas_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'doc',
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opc_tasks (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL DEFAULT 'comp_verifiq',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. CONVEX & INSFORGE AI TWIN TABLES (PROFILES, TASKS, RAG VECTORS, APPROVALS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.twin_profiles (
  id TEXT PRIMARY KEY DEFAULT ('twin_' || replace(gen_random_uuid()::text, '-', '')),
  master_id TEXT,
  name TEXT NOT NULL,
  specialization TEXT DEFAULT 'General',
  persona TEXT,
  expertise_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  communication_style TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '["en", "bn"]'::jsonb,
  bio TEXT,
  source_platform TEXT NOT NULL DEFAULT 'shothik',
  training_status TEXT NOT NULL DEFAULT 'ready',
  knowledge_score INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  task_count INTEGER NOT NULL DEFAULT 0,
  lifecycle_state TEXT NOT NULL DEFAULT 'active',
  verification_badge BOOLEAN NOT NULL DEFAULT false,
  trust_score INTEGER NOT NULL DEFAULT 100,
  published_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  allowed_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocked_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_required_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  api_key_hash TEXT,
  api_key_prefix TEXT,
  registration_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_tasks (
  id TEXT PRIMARY KEY DEFAULT ('task_' || replace(gen_random_uuid()::text, '-', '')),
  twin_id TEXT,
  user_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_knowledge_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'manuscript',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_twin_knowledge_vectors_twin_id ON public.twin_knowledge_vectors (twin_id);

CREATE TABLE IF NOT EXISTS public.twin_activity_logs (
  id TEXT PRIMARY KEY DEFAULT ('act_' || replace(gen_random_uuid()::text, '-', '')),
  twin_id TEXT NOT NULL,
  master_id TEXT,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_approvals (
  id TEXT PRIMARY KEY DEFAULT ('appr_' || replace(gen_random_uuid()::text, '-', '')),
  twin_id TEXT NOT NULL,
  master_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 3. CONVEX PUBLISHING BOOKS, CHAPTERS, ADMIN REVIEW & AUTHOR EARNINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publishing_books (
  id TEXT PRIMARY KEY DEFAULT ('book_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL DEFAULT 'guest',
  project_id TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled Book',
  subtitle TEXT,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'bn',
  category TEXT,
  subcategory TEXT,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  list_price TEXT DEFAULT '250',
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'draft',
  target_word_count INTEGER NOT NULL DEFAULT 50000,
  current_run_id TEXT,
  manuscript_storage_id TEXT,
  manuscript_name TEXT,
  manuscript_size INTEGER,
  manuscript_format TEXT,
  cover_storage_id TEXT,
  cover_dimensions JSONB,
  reviewer_name TEXT,
  review_notes TEXT,
  rejection_reason TEXT,
  rejection_category TEXT,
  isbn TEXT,
  google_play_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publishing_books_user_id ON public.publishing_books (user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_books_status ON public.publishing_books (status);

CREATE TABLE IF NOT EXISTS public.book_chapters (
  id TEXT PRIMARY KEY DEFAULT ('ch_' || replace(gen_random_uuid()::text, '-', '')),
  book_id TEXT NOT NULL REFERENCES public.publishing_books(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.book_chapter_attempts (
  id TEXT PRIMARY KEY DEFAULT ('att_' || replace(gen_random_uuid()::text, '-', '')),
  book_id TEXT NOT NULL REFERENCES public.publishing_books(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  passed_validation BOOLEAN NOT NULL DEFAULT false,
  validation_report JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.author_earnings (
  user_id TEXT PRIMARY KEY,
  total_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_units_sold INTEGER NOT NULL DEFAULT 0,
  lifetime_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_paid_out NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pending_payouts NUMERIC(12, 2) NOT NULL DEFAULT 0,
  published_books_count INTEGER NOT NULL DEFAULT 0,
  monthly_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  per_book_earnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.author_payouts (
  id TEXT PRIMARY KEY DEFAULT ('pay_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'bKash',
  status TEXT NOT NULL DEFAULT 'pending',
  period_start TEXT,
  period_end TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.author_payout_accounts (
  id TEXT PRIMARY KEY DEFAULT ('acct_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'bKash',
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  routing_number TEXT,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. CONVEX CHAT CONVERSATIONS & COMMUNITY HOT POSTS RPC
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL,
  surface TEXT NOT NULL DEFAULT 'flagship',
  title TEXT NOT NULL DEFAULT 'New Conversation',
  model_handle TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  temporary BOOLEAN NOT NULL DEFAULT false,
  context_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_message_preview TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_surface ON public.chat_conversations (user_id, surface);

CREATE OR REPLACE FUNCTION public.get_hot_posts()
RETURNS SETOF public.posts
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.posts
  ORDER BY (COALESCE(upvotes, 0) - COALESCE(downvotes, 0)) DESC, created_at DESC
  LIMIT 25;
$$;

-- -----------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKETS (REPLACING CONVEX & INSFORGE STORAGE)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES
      ('artifacts', 'artifacts', true),
      ('avatars', 'avatars', true),
      ('book-covers', 'book-covers', true),
      ('book-manuscripts', 'book-manuscripts', false),
      ('documents', 'documents', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (PERMISSIVE READ/WRITE WITH AUTH FALLBACK)
-- -----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opc_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_knowledge_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapter_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations', 'organization_members', 'workspaces', 'canvas_artifacts',
    'opc_tasks', 'twin_profiles', 'twin_tasks', 'twin_knowledge_vectors',
    'twin_activity_logs', 'twin_approvals', 'publishing_books', 'book_chapters',
    'book_chapter_attempts', 'author_earnings', 'author_payouts',
    'author_payout_accounts', 'chat_conversations'
  ] LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "Allow authenticated and anon access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END;
$$;
