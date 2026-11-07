-- =============================================================================
-- Migration: 20261107030000_sync_missing_drizzle_tables_and_rls.sql
-- Purpose: Achieve 100% schema parity between Local Supabase (127.0.0.1:54322),
--          Remote Supabase Cloud (xgnzsikvguswhtozvokx), and Drizzle ORM
--          (@workspace/db), enable pgvector, and close all RLS policy gaps.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- 1. SUBSCRIPTIONS, TOOL USAGE & LLM TOKEN USAGE (lib/db/src/schema/subscriptions.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  interval TEXT NOT NULL DEFAULT 'month',
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP NOT NULL DEFAULT now(),
  period_end TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tool_usage_user_tool_idx ON public.tool_usage (user_id, tool);

CREATE TABLE IF NOT EXISTS public.llm_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  provider TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. BACKGROUND JOBS, PARCELS & IDEMPOTENCY KEYS (lib/db/src/schema/jobs-and-idempotency.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.background_jobs (
  id SERIAL PRIMARY KEY,
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  idempotency_key TEXT UNIQUE,
  locked_at TIMESTAMP,
  locked_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.parcels (
  id SERIAL PRIMARY KEY,
  consignment_id TEXT NOT NULL UNIQUE,
  tracking_code TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'steadfast',
  user_id TEXT NOT NULL DEFAULT 'usr_default',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  cod_amount_bdt INTEGER NOT NULL DEFAULT 0,
  delivery_fee_bdt INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'BOOKED',
  status_bangla TEXT NOT NULL DEFAULT 'বুকিং সম্পন্ন হয়েছে',
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_notification_sent BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  state TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. SAGAS, AUDIT JOURNAL & MFS TRANSACTIONS (lib/db/src/schema/sagas-and-audit.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saga_executions (
  id SERIAL PRIMARY KEY,
  saga_id TEXT NOT NULL UNIQUE,
  saga_name TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  idempotency_key TEXT,
  status TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_step_index INTEGER NOT NULL DEFAULT 0,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  error TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT now(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_journal_entries (
  id SERIAL PRIMARY KEY,
  entry_id TEXT NOT NULL UNIQUE,
  transaction_ref TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  memo TEXT NOT NULL,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_debit_bdt NUMERIC(14, 2) NOT NULL,
  total_credit_bdt NUMERIC(14, 2) NOT NULL,
  is_balanced BOOLEAN NOT NULL DEFAULT true,
  audit_hash TEXT NOT NULL,
  initiator_kind TEXT,
  initiator_id TEXT,
  posted_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mfs_transactions (
  id SERIAL PRIMARY KEY,
  trx_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL DEFAULT 'usr_default',
  provider TEXT NOT NULL,
  amount_bdt NUMERIC(12, 2) NOT NULL,
  tier TEXT,
  status TEXT NOT NULL DEFAULT 'RECONCILED',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  reconciled_at TIMESTAMP NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. NILKHET ORDERS & WRITING AUTOSAVE (nilkhet-orders.ts & writing-autosave.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nilkhet_orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  book_title TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  copy_count INTEGER NOT NULL,
  paper_type TEXT NOT NULL,
  binding_type TEXT NOT NULL,
  total_price_bdt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSING_PRINT',
  courier_provider TEXT DEFAULT 'steadfast',
  tracking_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_autosave (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  local_project_id TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  saved_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS writing_autosave_user_project_idx ON public.writing_autosave (user_id, local_project_id);

-- -----------------------------------------------------------------------------
-- 5. TWINS, COMPANIES, TWIN SEEDS & SECOND-ME (lib/db/src/schema/twin.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.twins (
  id SERIAL PRIMARY KEY,
  master_id TEXT,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT 'General',
  persona TEXT NOT NULL DEFAULT '',
  expertise_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  communication_style TEXT NOT NULL DEFAULT 'professional',
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '["bn","en"]'::jsonb,
  bio TEXT NOT NULL DEFAULT '',
  source_platform TEXT NOT NULL DEFAULT 'shothik',
  training_status TEXT NOT NULL DEFAULT 'ready',
  knowledge_score INTEGER NOT NULL DEFAULT 0,
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
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_activity_log (
  id SERIAL PRIMARY KEY,
  twin_id TEXT NOT NULL,
  master_id TEXT,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_pending_approvals (
  id SERIAL PRIMARY KEY,
  twin_id TEXT NOT NULL,
  master_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'usr_default',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL DEFAULT 'Technology',
  business_model TEXT NOT NULL DEFAULT 'SaaS',
  business_type TEXT DEFAULT 'Digital Venture',
  problem_statement TEXT DEFAULT '',
  domain TEXT NOT NULL,
  email TEXT NOT NULL,
  revenue_bdt INTEGER NOT NULL DEFAULT 0,
  visitor_count INTEGER NOT NULL DEFAULT 1,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  feed JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twin_seeds (
  id SERIAL PRIMARY KEY,
  identity TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  business_plan TEXT NOT NULL DEFAULT '',
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  revision BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS twin_seeds_identity_conversation_idx ON public.twin_seeds (identity, conversation_id);

CREATE TABLE IF NOT EXISTS public.second_me_key_custody (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  provider TEXT,
  sealed_key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS key_custody_user_purpose_idx ON public.second_me_key_custody (user_id, purpose);

CREATE TABLE IF NOT EXISTS public.second_me_writing_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  letta_agent_id TEXT NOT NULL,
  block_label TEXT NOT NULL DEFAULT 'WRITING.md',
  model_handle TEXT,
  last_content_length INTEGER NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 6. COMMERCE OPS & TAX TABLES (lib/db/src/schema/commerce-ops.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_stock INTEGER NOT NULL DEFAULT 0,
  daraz_stock INTEGER NOT NULL DEFAULT 0,
  shopify_stock INTEGER NOT NULL DEFAULT 0,
  woocommerce_stock INTEGER NOT NULL DEFAULT 0,
  whatsapp_stock INTEGER NOT NULL DEFAULT 0,
  dark_hub_reserve INTEGER NOT NULL DEFAULT 0,
  unit_cost_bdt NUMERIC(12, 2) NOT NULL,
  unit_price_bdt NUMERIC(12, 2) NOT NULL,
  supplier_name TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.factoring_offers (
  id SERIAL PRIMARY KEY,
  offer_id TEXT NOT NULL UNIQUE,
  invoice_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  invoice_face_value_bdt NUMERIC(12, 2) NOT NULL,
  advance_rate_percent INTEGER NOT NULL,
  gross_advance_bdt NUMERIC(12, 2) NOT NULL,
  discount_fee_bdt NUMERIC(12, 2) NOT NULL,
  net_payout_bdt NUMERIC(12, 2) NOT NULL,
  annualized_apr NUMERIC(5, 2) NOT NULL,
  disbursement_channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offered',
  verification_seal_sha256 TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ivr_call_records (
  id SERIAL PRIMARY KEY,
  call_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  cod_amount_bdt NUMERIC(12, 2) NOT NULL,
  rto_risk_score INTEGER NOT NULL DEFAULT 0,
  risk_tier TEXT NOT NULL DEFAULT 'LOW',
  call_status TEXT NOT NULL DEFAULT 'scheduled',
  dtmf_response TEXT,
  recording_duration_sec INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courier_consignments (
  id SERIAL PRIMARY KEY,
  consignment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  courier_provider TEXT NOT NULL,
  tracking_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  zone TEXT NOT NULL,
  cod_amount_bdt NUMERIC(12, 2) NOT NULL,
  delivery_charge_bdt NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked_ready_for_pickup',
  verification_hash_sha256 TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.protected_action_audit (
  id SERIAL PRIMARY KEY,
  action_id TEXT NOT NULL UNIQUE,
  action_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  otp_verified TEXT NOT NULL DEFAULT 'false',
  approver_mfs_phone TEXT,
  state_seal_sha256 TEXT NOT NULL,
  executed_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mushak_63_challans (
  id SERIAL PRIMARY KEY,
  challan_number TEXT NOT NULL UNIQUE,
  seller_bin TEXT NOT NULL,
  buyer_bin TEXT,
  buyer_name TEXT NOT NULL,
  total_taxable_amount_bdt NUMERIC(14, 2) NOT NULL,
  total_vat_bdt NUMERIC(14, 2) NOT NULL,
  total_payable_bdt NUMERIC(14, 2) NOT NULL,
  verification_seal_sha256 TEXT NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commodity_inland_lcs (
  id SERIAL PRIMARY KEY,
  lc_number TEXT NOT NULL UNIQUE,
  commodity_name TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  quantity_tons NUMERIC(10, 2) NOT NULL,
  unit_price_per_ton_bdt NUMERIC(12, 2) NOT NULL,
  total_value_bdt NUMERIC(14, 2) NOT NULL,
  escrow_status TEXT NOT NULL DEFAULT 'opened',
  lc_contract_seal_sha256 TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 7. DOCUMENT EMBEDDINGS & SEMANTIC MEMORY VECTORS (embeddings.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id UUID,
  repo TEXT,
  file_path TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.semantic_memory_vectors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'context',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  access_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & POLICIES FOR ALL TABLES MISSING POLICIES
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_subscriptions', 'tool_usage', 'llm_usage',
    'background_jobs', 'parcels', 'idempotency_keys',
    'saga_executions', 'audit_journal_entries', 'mfs_transactions',
    'nilkhet_orders', 'writing_autosave',
    'twins', 'twin_activity_log', 'twin_pending_approvals',
    'companies', 'twin_seeds', 'second_me_key_custody', 'second_me_writing_profiles',
    'inventory_items', 'factoring_offers', 'ivr_call_records',
    'courier_consignments', 'protected_action_audit', 'mushak_63_challans',
    'commodity_inland_lcs', 'document_embeddings', 'semantic_memory_vectors',
    'plagiarism_scans', 'chat_messages', 'votes'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        t || '_access_policy',
        t
      );
    END IF;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 9. SUPABASE MIGRATION TRACKING TABLE SYNC
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  statements TEXT[],
  name TEXT
);

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('20261101000000', 'supabase_deeptech_schema'),
  ('20261106000000', 'unified_deeptech_domains'),
  ('20261107000000', 'supabase_auth_profiles_trigger'),
  ('20261107010000', 'convex_insforge_to_supabase_migration'),
  ('20261107020000', 'in_memory_engines_to_supabase'),
  ('20261107030000', 'sync_missing_drizzle_tables_and_rls')
ON CONFLICT (version) DO NOTHING;
