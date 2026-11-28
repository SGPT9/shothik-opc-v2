-- =============================================================================
-- Migration: 20261107040000_deeptech_rls_pgvector_hnsw_realtime.sql
-- Purpose:
--   1. Zero-Trust RLS Policy Hardening (Service-Role vs Tenant-Scoped Isolation)
--   2. Native pgvector(384) HNSW Index + FTS GIN Index + Hybrid RRF Search RPC
--   3. Supabase Realtime Publication for Collaborative Tables
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ZERO-TRUST ROW-LEVEL SECURITY HARDENING
-- -----------------------------------------------------------------------------

-- Tier A: Backend Service-Role Only Tables (Block direct PostgREST anon/authenticated access)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'second_me_key_custody',
    'idempotency_keys',
    'background_jobs',
    'saga_executions',
    'audit_journal_entries',
    'protected_action_audit',
    'mfs_transactions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_access_policy', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_service_role_only', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')',
      t || '_service_role_only',
      t
    );
  END LOOP;
END $$;

-- Tier B: Strict User-Tenant Isolated Tables (user_id matches authenticated JWT sub or service_role)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_subscriptions',
    'tool_usage',
    'llm_usage',
    'writing_autosave',
    'nilkhet_orders',
    'parcels',
    'document_embeddings',
    'semantic_memory_vectors',
    'second_me_writing_profiles',
    'companies'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_access_policy', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant_isolation', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (user_id = COALESCE(auth.uid()::text, current_setting(''request.jwt.claim.sub'', true)) OR auth.role() = ''service_role'') WITH CHECK (user_id = COALESCE(auth.uid()::text, current_setting(''request.jwt.claim.sub'', true)) OR auth.role() = ''service_role'')',
      t || '_tenant_isolation',
      t
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. NATIVE PGVECTOR(384) HNSW INDEX + FTS GIN INDEX + HYBRID RRF SEARCH RPC
-- -----------------------------------------------------------------------------
ALTER TABLE public.rag_chunks
  ADD COLUMN IF NOT EXISTS embedding_vec vector(384);

ALTER TABLE public.rag_chunks
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding_hnsw
  ON public.rag_chunks USING hnsw (embedding_vec vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_fts_gin
  ON public.rag_chunks USING gin (fts);

-- Trigger to auto-sync JSONB embedding array (384 dims) into native pgvector column
CREATE OR REPLACE FUNCTION public.sync_rag_chunk_embedding_vec()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.embedding IS NOT NULL
     AND jsonb_typeof(NEW.embedding) = 'array'
     AND jsonb_array_length(NEW.embedding) = 384 THEN
    BEGIN
      NEW.embedding_vec := (NEW.embedding::text)::vector(384);
    EXCEPTION WHEN OTHERS THEN
      NEW.embedding_vec := NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_rag_chunk_embedding_vec ON public.rag_chunks;
CREATE TRIGGER trg_sync_rag_chunk_embedding_vec
  BEFORE INSERT OR UPDATE OF embedding ON public.rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_rag_chunk_embedding_vec();

-- Backfill any existing 384-dim rows in public.rag_chunks
UPDATE public.rag_chunks
SET embedding_vec = (embedding::text)::vector(384)
WHERE embedding_vec IS NULL
  AND jsonb_typeof(embedding) = 'array'
  AND jsonb_array_length(embedding) = 384;

-- Hybrid Reciprocal Rank Fusion (RRF) Search RPC over HNSW Vector + FTS BM25
CREATE OR REPLACE FUNCTION public.hybrid_search_rag_chunks(
  p_user_id TEXT,
  p_query_text TEXT,
  p_query_embedding TEXT,
  p_match_count INTEGER DEFAULT 5,
  p_rrf_k INTEGER DEFAULT 60
)
RETURNS TABLE (
  id TEXT,
  doc_id TEXT,
  user_id TEXT,
  title TEXT,
  content TEXT,
  chunk_index INTEGER,
  tokens INTEGER,
  metadata JSONB,
  vector_score DOUBLE PRECISION,
  keyword_score DOUBLE PRECISION,
  rrf_score DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_vec vector(384);
  v_tsq tsquery;
BEGIN
  BEGIN
    v_vec := p_query_embedding::vector(384);
  EXCEPTION WHEN OTHERS THEN
    v_vec := NULL;
  END;

  v_tsq := plainto_tsquery('simple', coalesce(p_query_text, ''));

  RETURN QUERY
  WITH accessible_chunks AS (
    SELECT c.*
    FROM public.rag_chunks c
    WHERE c.user_id IN (p_user_id, 'global', 'usr_default')
  ),
  vector_ranked AS (
    SELECT
      ac.id,
      (1.0 - (ac.embedding_vec <=> v_vec))::double precision AS v_score,
      ROW_NUMBER() OVER (ORDER BY ac.embedding_vec <=> v_vec ASC) AS v_rank
    FROM accessible_chunks ac
    WHERE v_vec IS NOT NULL AND ac.embedding_vec IS NOT NULL
    ORDER BY ac.embedding_vec <=> v_vec ASC
    LIMIT GREATEST(p_match_count * 4, 20)
  ),
  keyword_ranked AS (
    SELECT
      ac.id,
      ts_rank_cd(ac.fts, v_tsq)::double precision AS k_score,
      ROW_NUMBER() OVER (ORDER BY ts_rank_cd(ac.fts, v_tsq) DESC) AS k_rank
    FROM accessible_chunks ac
    WHERE v_tsq <> ''::tsquery AND ac.fts @@ v_tsq
    ORDER BY ts_rank_cd(ac.fts, v_tsq) DESC
    LIMIT GREATEST(p_match_count * 4, 20)
  ),
  fused AS (
    SELECT
      COALESCE(vr.id, kr.id) AS chunk_id,
      COALESCE(vr.v_score, 0.0) AS v_score,
      COALESCE(kr.k_score, 0.0) AS k_score,
      (
        COALESCE(1.0 / (p_rrf_k + vr.v_rank), 0.0) +
        COALESCE(1.0 / (p_rrf_k + kr.k_rank), 0.0)
      )::double precision AS combined_rrf
    FROM vector_ranked vr
    FULL OUTER JOIN keyword_ranked kr ON vr.id = kr.id
  )
  SELECT
    ac.id,
    ac.doc_id,
    ac.user_id,
    ac.title,
    ac.content,
    ac.chunk_index,
    ac.tokens,
    ac.metadata,
    f.v_score AS vector_score,
    f.k_score AS keyword_score,
    f.combined_rrf AS rrf_score
  FROM fused f
  JOIN accessible_chunks ac ON ac.id = f.chunk_id
  ORDER BY f.combined_rrf DESC, f.v_score DESC
  LIMIT p_match_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. SUPABASE REALTIME PUBLICATION FOR LIVE COLLABORATIVE TABLES
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  rt_table TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH rt_table IN ARRAY ARRAY[
      'opc_tasks',
      'twin_tasks',
      'twin_approvals',
      'twin_activity_logs',
      'chat_conversations',
      'chat_messages',
      'book_suite_manifests',
      'publishing_books',
      'posts',
      'comments',
      'engine_kv_snapshots'
    ] LOOP
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', rt_table);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
      END;
    END LOOP;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. RECORD MIGRATION VERSION
-- -----------------------------------------------------------------------------
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20261107040000', 'deeptech_rls_pgvector_hnsw_realtime')
ON CONFLICT (version) DO NOTHING;
