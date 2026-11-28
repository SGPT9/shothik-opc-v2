-- =============================================================================
-- SHOTHIK AI — IN-MEMORY & JSON DISK ENGINES TO SUPABASE POSTGRESQL MIGRATION
-- Migration: 20261107020000_in_memory_engines_to_supabase.sql
-- =============================================================================

-- 1. Twin Memory v2: Direction Layer & Episodic Task Memos (from twin-memory-v2.json)
CREATE TABLE IF NOT EXISTS public.twin_directions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_slug TEXT NOT NULL DEFAULT 'default',
  kind TEXT NOT NULL,
  content TEXT NOT NULL,
  supersedes_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_twin_directions_user_company ON public.twin_directions (user_id, company_slug);

CREATE TABLE IF NOT EXISTS public.twin_task_memos (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  company_slug TEXT NOT NULL DEFAULT 'default',
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scope_path TEXT NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL,
  execution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  output_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  quality_score NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  invalidation_reason TEXT,
  is_invalidated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_twin_task_memos_user_company ON public.twin_task_memos (user_id, company_slug);

-- 2. Memori Semantic Memory Store (from memori-semantic-store.json)
CREATE TABLE IF NOT EXISTS public.semantic_memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fact',
  content TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_score NUMERIC(5, 3),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_semantic_memories_user_id ON public.semantic_memories (user_id);

-- 3. RAG Knowledge Engine Documents & Chunks (from rag-store.json)
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'text',
  source_url TEXT,
  total_length INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_documents_user_id ON public.rag_documents (user_id);

CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  embedding JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_user ON public.rag_chunks (doc_id, user_id);

-- 4. DSH Execution Trace Runtime Sessions (from dsh-execution-traces.json)
CREATE TABLE IF NOT EXISTS public.dsh_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  forked_from_session_id TEXT,
  forked_at_event_index INTEGER,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsh_sessions_user_id ON public.dsh_sessions (user_id);

-- 5. Nightshift CEO Morning Digests (from nightshift-digests.json)
CREATE TABLE IF NOT EXISTS public.nightshift_digests (
  id TEXT PRIMARY KEY,
  cycle_timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  skills_executed JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_health_score INTEGER NOT NULL DEFAULT 100,
  top_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  markdown_report TEXT NOT NULL DEFAULT '',
  execution_duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Universal Engine State & Route Map Snapshots (Companies, Teams, Papermark, POS, Mushak, Novel Modules)
CREATE TABLE IF NOT EXISTS public.engine_kv_snapshots (
  namespace TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_engine_kv_snapshots_namespace_user ON public.engine_kv_snapshots (namespace, user_id);

-- Enable RLS across all migrated memory tables
ALTER TABLE public.twin_directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_task_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semantic_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsh_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nightshift_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_kv_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'twin_directions', 'twin_task_memos', 'semantic_memories',
    'rag_documents', 'rag_chunks', 'dsh_sessions',
    'nightshift_digests', 'engine_kv_snapshots'
  ] LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "Allow authenticated and service access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END;
$$;
