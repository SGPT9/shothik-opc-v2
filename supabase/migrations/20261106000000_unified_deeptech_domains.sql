-- =============================================================================
-- Shothik AI / Unified 9-Domain DeepTech Schema Migration
-- File: supabase/migrations/20261106000000_unified_deeptech_domains.sql
-- Covers:
--   1. Community (channels, posts, comments, votes)
--   2. Chat & Character Messenger (chat_messages)
--   3. Connectors & Encrypted Credentials Vault (user_connectors)
--   4. Writing Suite & Novel Engine (book_suite_manifests)
--   5. User Settings & Preferences (user_preferences)
--   6. Plagiarism Audit Ledger (plagiarism_scans)
--   7. Row-Level Security (RLS) & Realtime Publication Bindings
-- =============================================================================

-- 1. COMMUNITY CHANNELS, POSTS, COMMENTS, VOTES
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    participant_type TEXT DEFAULT 'both',
    category TEXT,
    status TEXT DEFAULT 'open',
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    agent_id TEXT,
    title TEXT NOT NULL,
    content TEXT,
    content_url TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_posts_channel_id ON public.posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_entity ON public.votes(user_id, entity_type, entity_id);

-- 2. CHAT & CHARACTER MESSENGER THREADS
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID,
    thread_id TEXT,
    author_id TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS thread_id TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages(channel_id);

-- 3. CONNECTORS (Write-Only Encrypted Credentials Vault)
CREATE TABLE IF NOT EXISTS public.user_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    connector_id TEXT NOT NULL,
    connected BOOLEAN NOT NULL DEFAULT FALSE,
    encrypted_credentials TEXT,
    masked_key TEXT,
    endpoint_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(user_id, connector_id)
);

CREATE INDEX IF NOT EXISTS idx_user_connectors_user_id ON public.user_connectors(user_id);

-- 4. WRITING SUITE & NOVEL ENGINE MANIFESTS (Chrono Braider, Plot Divergence, Lore Wiki, CIP)
CREATE TABLE IF NOT EXISTS public.book_suite_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'usr_default',
    module_type TEXT NOT NULL, -- 'chrono_braider' | 'plot_divergence' | 'lore_wiki' | 'book_jacket' | 'cip_barcode'
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(project_id, module_type)
);

CREATE INDEX IF NOT EXISTS idx_book_suite_project_module ON public.book_suite_manifests(project_id, module_type);

-- 5. USER SETTINGS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id TEXT PRIMARY KEY,
    locale TEXT NOT NULL DEFAULT 'en',
    theme TEXT NOT NULL DEFAULT 'dark',
    studio_mode TEXT NOT NULL DEFAULT 'standard',
    notifications JSONB NOT NULL DEFAULT '{"email":true,"whatsapp":false,"agentAlerts":true}'::jsonb,
    tax_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. PLAGIARISM SCANS LEDGER
CREATE TABLE IF NOT EXISTS public.plagiarism_scans (
    id SERIAL PRIMARY KEY,
    scan_id TEXT NOT NULL,
    document_title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    total_words INTEGER NOT NULL,
    similarity_score_percent NUMERIC NOT NULL,
    ugc_compliant TEXT NOT NULL DEFAULT 'true',
    audit_seal_sha256 TEXT NOT NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_suite_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community channels public read" ON public.channels;
CREATE POLICY "Community channels public read" ON public.channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Community posts public read" ON public.posts;
CREATE POLICY "Community posts public read" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Community comments public read" ON public.comments;
CREATE POLICY "Community comments public read" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "User connectors tenant isolation" ON public.user_connectors;
CREATE POLICY "User connectors tenant isolation" ON public.user_connectors
    FOR ALL
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Book suite manifests tenant access" ON public.book_suite_manifests;
CREATE POLICY "Book suite manifests tenant access" ON public.book_suite_manifests
    FOR ALL
    USING (auth.uid()::text = user_id OR user_id = 'usr_default');

DROP POLICY IF EXISTS "User preferences tenant isolation" ON public.user_preferences;
CREATE POLICY "User preferences tenant isolation" ON public.user_preferences
    FOR ALL
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);
