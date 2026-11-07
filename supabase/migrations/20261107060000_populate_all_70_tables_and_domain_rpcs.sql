-- =============================================================================
-- SHOTHIK AI — COMPLETE 70-TABLE POPULATION & DOMAIN RPC FUNCTIONS
-- Migration: 20261107060000_populate_all_70_tables_and_domain_rpcs.sql
-- Ensures 100% of the 70 public tables have live, canonical seed rows on both
-- Local and Remote Supabase, normalizes twin_tasks.id to TEXT across environments,
-- and registers atomic domain RPC functions.
-- =============================================================================

-- 0. Normalize twin_tasks.id to TEXT and unify column parity across Local & Remote
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'twin_tasks'
      AND column_name = 'id'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.twin_tasks ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.twin_tasks ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.twin_tasks ALTER COLUMN id SET DEFAULT ('task_' || replace(gen_random_uuid()::text, '-', ''));
  END IF;
END $$;

ALTER TABLE public.nilkhet_orders
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.semantic_memory_vectors
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'context',
  ADD COLUMN IF NOT EXISTS keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS access_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS chunk_id TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS genre TEXT;

ALTER TABLE public.tool_usage
  ADD COLUMN IF NOT EXISTS tool_name TEXT,
  ADD COLUMN IF NOT EXISTS cost_credits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

ALTER TABLE public.twin_seeds
  ADD COLUMN IF NOT EXISTS seed JSONB DEFAULT '{}'::jsonb;

-- 1. Ensure anchor rows exist in organizations, workspaces, projects, channels, and publishing_books
INSERT INTO public.organizations (id, name, slug, owner_id, tier, credits_pool, mfs_phone)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Shothik Sovereign Labs', 'shothik-sovereign-labs', 'usr_default', 'ENTERPRISE', 25000, '+8801700000000')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, description, is_private, created_by)
SELECT 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', o.id, 'Flagship Neural Workspace', 'Primary workspace for Bangla-first agentic operations and publishing.', false, 'usr_default'
FROM public.organizations o
WHERE o.slug = 'shothik-sovereign-labs'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, user_id, title, type, template, description, content, word_count, progress, starred, access_mode, branch_name)
VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা (Golden Bengal & AI)', 'book', 'ekushey-novel', 'Flagship Bangla non-fiction manuscript on sovereign AI transformation.', '# অধ্যায় ১: সূচনা\n\nবাংলাদেশের প্রযুক্তির নতুন দিগন্ত...', 4250, 35, true, 'private', 'main'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'usr_default', 'Dhaka FinTech Market Intelligence 2027', 'research', 'market-report', 'Deep research brief on MFS, bKash/Nagad velocity, and SME factoring.', '# Executive Summary\n\nMobile Financial Services in Bangladesh...', 2890, 80, true, 'private', 'main')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.channels (id, name, description, participant_type, category, status)
VALUES ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'bangla-ai-builders', 'Flagship channel for Bangla AI builders, authors, and OPC founders.', 'both', 'technology', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.publishing_books (id, user_id, project_id, title, subtitle, description, language, category, list_price, currency, status, target_word_count, author_name, genre, page_count, credit_price, cover_preset, rating, rating_count, synopsis)
VALUES ('book_ekushey_01', 'usr_default', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা', 'সার্বভৌম প্রযুক্তির ভবিষ্যৎ', 'বাংলাদেশের শিল্প, সাহিত্য ও বাণিজ্যে এআই বিপ্লবের পূর্ণাঙ্গ রূপরেখা।', 'bn', 'Technology', '350', 'BDT', 'published', 45000, 'ড. আরিফ রহমান', 'Non-Fiction', 210, 120, 'ekushey', 4.9, 42, 'একুশে বইমেলা বিশেষ সংস্করণ।')
ON CONFLICT (id) DO NOTHING;

-- 2. Organization Members (Domain 9: Account & Multi-Tenant Governance)
INSERT INTO public.organization_members (id, organization_id, user_id, role)
SELECT 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', o.id, 'usr_default', 'OWNER'
FROM public.organizations o
WHERE o.slug = 'shothik-sovereign-labs'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Community: Posts, Comments, Votes (Domain 7: Community)
INSERT INTO public.posts (id, channel_id, author_id, agent_id, title, content, upvotes, downvotes)
VALUES (
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'usr_default',
  'agent_ekushey_editor',
  'একুশে বইমেলা ২০২৭: এআই-সহায়তায় বাংলা পাণ্ডুলিপি সম্পাদনার নতুন মানদণ্ড',
  'আমরা সঠিক এআই রাইটিং স্টুডিওতে সাধু ও চলিত রীতির স্বয়ংক্রিয় সামঞ্জস্য এবং বানান নিরীক্ষার নতুন ইঞ্জিন যুক্ত করেছি। আপনাদের মতামত জানান!',
  24,
  1
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (id, post_id, author_id, content, upvotes, downvotes)
VALUES (
  '22eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  'usr_default',
  'অসাধারণ উদ্যোগ! বিশেষ করে যুক্তাক্ষর ও ফনেটিক টিউনার ফিচারটি অডিওবুক নির্মাণে দারুণ কাজ করছে।',
  9,
  0
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.votes (id, user_id, entity_type, entity_id, vote_type)
VALUES (
  '33eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
  'usr_default',
  'post',
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  1
)
ON CONFLICT (id) DO NOTHING;

-- 4. Emporium & Royalties: Author Earnings, Payout Accounts, Payouts, Nilkhet Orders (Domain 8: Emporium)
INSERT INTO public.author_earnings (user_id, total_earnings, total_units_sold, lifetime_revenue, available_balance, total_paid_out, pending_payouts, published_books_count, monthly_breakdown, per_book_earnings)
VALUES (
  'usr_default',
  48500,
  165,
  54000,
  18500,
  30000,
  0,
  4,
  '[{"month":"2026-10","earningsBdt":22500,"units":75},{"month":"2026-11","earningsBdt":26000,"units":90}]'::jsonb,
  '[{"bookId":"book_ekushey_01","title":"সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা","units":95,"royaltyBdt":28500}]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  total_earnings = EXCLUDED.total_earnings,
  total_units_sold = EXCLUDED.total_units_sold,
  available_balance = EXCLUDED.available_balance,
  updated_at = NOW();

INSERT INTO public.author_payout_accounts (id, user_id, method, account_name, account_number, bank_name, routing_number, is_default)
VALUES (
  'acct_seed_bkash_01',
  'usr_default',
  'bKash',
  'Shothik Sovereign Author',
  '+8801700000000',
  'bKash Merchant Plus',
  'BKASH-BD-DHA',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.author_payouts (id, user_id, amount, method, status, period_start, period_end)
VALUES (
  'pay_seed_202610_01',
  'usr_default',
  30000,
  'bKash',
  'completed',
  '2026-10-01',
  '2026-10-31'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.nilkhet_orders (id, user_id, invoice_number, book_title, page_count, copy_count, paper_type, binding_type, total_price_bdt, status, courier_provider, tracking_code, metadata)
VALUES (
  1,
  'usr_default',
  'NLK-202611-0001',
  'সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা',
  210,
  50,
  '80gsm_cream_offset',
  'hardcover_matt_spot_uv',
  '14500',
  'READY_FOR_DISPATCH',
  'steadfast',
  'SF-BD-889201',
  '{"pressHub":"Nilkhet Print Cooperative #4","qualityCheck":"PASSED"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 5. Writing Suite & Studio: Authorship Certificates, Chapter Attempts, Suite Manifests, Plagiarism Scans, RAG & Embeddings, Usage (Domains 5 & 6)
INSERT INTO public.authorship_certificates (certificate_id, project_id, author_id, title, content_hash_sha256, merkle_root, tamper_proof_signature, word_count, status)
VALUES (
  'cert_shothik_ekushey_01',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'usr_default',
  'সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা (Golden Bengal & AI)',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  'ed25519:shothik_notary_sig_20261107_verified',
  4250,
  'verified'
)
ON CONFLICT (certificate_id) DO NOTHING;

INSERT INTO public.book_chapter_attempts (id, book_id, chapter_index, attempt_number, content, passed_validation, validation_report)
VALUES (
  'att_ekushey_ch1_v1',
  'book_ekushey_01',
  1,
  1,
  '# অধ্যায় ১: সূচনা\n\nবাংলাদেশের প্রযুক্তির নতুন দিগন্তে কৃত্রিম বুদ্ধিমত্তা এক যুগান্তকারী পরিবর্তন এনেছে।',
  true,
  '{"orthographyScore":99.4,"styleConsistency":"চলিত রীতি (Standard Colloquial)","passedGate":true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.book_suite_manifests (id, project_id, user_id, module_type, state, version)
VALUES
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'story_bible', '{"characters":[{"name":"আরিফ","role":"গবেষক"}],"worldRules":["সার্বভৌম ডেটা নীতি ২০২৭"]}'::jsonb, 1),
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'voice_casting', '{"narrator":"bn-BD-PradeepNeural","emotionProfile":"warm_documentary"}'::jsonb, 1)
ON CONFLICT (project_id, module_type) DO NOTHING;

INSERT INTO public.plagiarism_scans (id, scan_id, document_title, author_name, total_words, similarity_score_percent, ugc_compliant, audit_seal_sha256)
VALUES (
  1,
  'scan_ugc_20261107_01',
  'সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা (Golden Bengal & AI)',
  'ড. আরিফ রহমান',
  4250,
  2.4,
  'true',
  'sha256:7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rag_documents (id, user_id, title, source_type, source_url, total_length, chunk_count)
VALUES (
  'rdoc_seed_ekushey_01',
  'usr_default',
  'Bangladesh National AI & Sovereign Cloud Reference 2027',
  'markdown',
  'https://shothik.ai/docs/sovereign-ai-bd-2027',
  1840,
  2
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rag_chunks (id, doc_id, user_id, title, content, chunk_index, tokens, embedding, metadata)
VALUES
  (
    'rchunk_seed_ekushey_01_0',
    'rdoc_seed_ekushey_01',
    'usr_default',
    'Bangladesh National AI & Sovereign Cloud Reference 2027',
    'Shothik AI provides a zero-trust, Bangla-first sovereign knowledge engine with hybrid pgvector HNSW and Full-Text Search Reciprocal Rank Fusion.',
    0,
    28,
    (SELECT jsonb_agg(round((sin(i * 0.17) * 0.05)::numeric, 6)) FROM generate_series(1, 384) AS s(i)),
    '{"section":"Architecture","language":"en"}'::jsonb
  ),
  (
    'rchunk_seed_ekushey_01_1',
    'rdoc_seed_ekushey_01',
    'usr_default',
    'Bangladesh National AI & Sovereign Cloud Reference 2027',
    'বাংলা ভাষা ও সাহিত্যের জন্য সঠিক এআই-এর হাইব্রিড র‍্যাগ ইঞ্জিন লেখক ও গবেষকদের তাৎক্ষণিক তথ্যসূত্র যাচাইয়ে সহায়তা করে।',
    1,
    24,
    (SELECT jsonb_agg(round((cos(i * 0.13) * 0.05)::numeric, 6)) FROM generate_series(1, 384) AS s(i)),
    '{"section":"Bangla Literature","language":"bn"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.document_embeddings (id, user_id, project_id, repo, file_path, content, metadata)
VALUES (
  '55eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'usr_default',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'shothik-sovereign-manuscripts',
  'chapters/01-intro.md',
  'বাংলাদেশের প্রযুক্তির নতুন দিগন্তে কৃত্রিম বুদ্ধিমত্তা ও সার্বভৌম ক্লাউড অবকাঠামো।',
  '{"chapter":1,"indexedBy":"pgvector-384"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tool_usage (id, user_id, tool, tool_name, count, cost_credits, success, duration_ms)
VALUES (1, 'usr_default', 'paraphraser_bangla_pro', 'paraphraser_bangla_pro', 14, 2, true, 420)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.llm_usage (id, user_id, tool, provider, tokens, input_tokens, output_tokens, cost_usd)
VALUES (1, 'usr_default', 'writing_studio_draft', 'anthropic:claude-sonnet-4-5', 3400, 1200, 2200, 0.0412)
ON CONFLICT (id) DO NOTHING;

-- 6. Chat, Canvas, Reports & DSH Sessions (Domain 1: Chat)
INSERT INTO public.canvas_artifacts (id, organization_id, workspace_id, type, title, content, version, is_public, created_by)
VALUES (
  '66eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'doc',
  'Ekushey Book Fair Launch Blueprint',
  '{"blocks":[{"type":"heading","text":"একুশে বইমেলা প্রকাশনা পরিকল্পনা"},{"type":"checklist","items":["প্রচ্ছদ চূড়ান্তকরণ","আইএসবিএন নিবন্ধন","নীলক্ষেত প্রিন্ট অর্ডার"]}]}'::jsonb,
  2,
  false,
  'usr_default'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.saved_reports (id, user_id, title, type, snippet, content, chat_id, metadata)
VALUES (
  'rep_seed_fintech_2027',
  'usr_default',
  'Bangladesh SME Factoring & MFS Liquidity Report 2027',
  'markdown',
  'Comprehensive analysis of bKash/Nagad merchant settlement cycles and invoice factoring yields.',
  '# Bangladesh SME Factoring & MFS Liquidity Report 2027\n\n## Key Findings\n1. Instant MFS settlement reduces working capital gaps by 42%.\n2. Mushak-6.3 automated VAT challans streamline NBR compliance.',
  'conv_seed_flagship_01',
  '{"citations":6,"verifiedBy":"shothik-deep-research"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.dsh_sessions (id, user_id, title, status, events, metrics)
VALUES (
  'dsh_seed_session_01',
  'usr_default',
  'Autonomous Book Research & Citation Verification Harness',
  'completed',
  '[{"index":0,"type":"plan","summary":"Verify 12 Bangla economic citations"},{"index":1,"type":"execute","summary":"All 12 citations verified via Hybrid RAG"}]'::jsonb,
  '{"durationMs":4820,"tokensUsed":2940,"stepsCompleted":2}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.engine_kv_snapshots (namespace, entity_id, user_id, payload)
VALUES (
  'story_bible',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'usr_default',
  '{"protagonist":"ড. আরিফ রহমান","setting":"ঢাকা ২০৩৫","themes":["সার্বভৌম এআই","বাংলা ভাষা প্রযুক্তি"]}'::jsonb
)
ON CONFLICT (namespace, entity_id) DO NOTHING;

-- 7. Twin & Autonomous Operations (Domain 2: Twin)
ALTER TABLE public.twin_tasks ALTER COLUMN result DROP NOT NULL;

INSERT INTO public.twin_tasks (id, twin_id, user_id, title, description, task_type, status, result, completed_at)
VALUES
  ('ttask_seed_01', 'twin_seed_founder_01', 'usr_default', 'Audit Q4 Mushak-6.3 VAT Challans', 'Cross-check all issued VAT challans against bKash merchant settlements.', 'finance_audit', 'completed', '100% of Q4 challans reconciled with zero variance.', NOW()),
  ('ttask_seed_02', 'twin_seed_editor_02', 'usr_default', 'Proofread Chapter 3 Bangla Orthography', 'Normalize Sadhu/Cholit mixing and verify compound conjuncts.', 'editorial', 'in_progress', 'In progress: 82% of Chapter 3 scanned.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.nightshift_digests (id, cycle_timestamp, date, status, skills_executed, overall_health_score, top_action_items, markdown_report, execution_duration_ms)
VALUES (
  'digest_seed_20261107',
  '2026-11-07T02:00:00Z',
  '2026-11-07',
  'completed',
  '["mfs_reconciliation","manuscript_orthography_guard","rto_shield_ivr_scan"]'::jsonb,
  98,
  '[{"priority":"high","action":"Approve Steadfast batch dispatch for 50 Nilkhet hardcover copies"}]'::jsonb,
  '# Nightshift Autonomous Digest (2026-11-07)\n- **Health Score**: 98/100\n- **MFS Ledger**: Balanced\n- **Editorial Queue**: 3 chapters verified.',
  3420
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.semantic_memories (id, user_id, category, content, keywords, relevance_score, metadata)
VALUES (
  'smem_seed_01',
  'usr_default',
  'preference',
  'Author prefers standard colloquial Bangla (প্রমিত চলিত রীতি) with English technical terms retained in parentheses on first mention.',
  '["চলিত রীতি","style-guide","bangla-orthography"]'::jsonb,
  0.98,
  '{"source":"SecondMe Writing Profile"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_id_type TEXT;
BEGIN
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'semantic_memory_vectors'
    AND column_name = 'id';

  IF v_id_type = 'text' THEN
    INSERT INTO public.semantic_memory_vectors (id, user_id, chunk_id, document_name, content, category, keywords, embedding, confidence, access_count)
    VALUES (
      'smvec_seed_01',
      'usr_default',
      'chunk_finance_01',
      'Sovereign Royalty & MFS Settlement Policy',
      'Preferred royalty payout rail is bKash Merchant Plus (+8801700000000) settled on the 1st of every month.',
      'finance',
      '["bKash","royalty","payout"]'::jsonb,
      '[0.021, -0.044, 0.089, 0.012, -0.031, 0.067, 0.054, -0.019]'::jsonb,
      0.99,
      5
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.semantic_memory_vectors (id, user_id, chunk_id, document_name, content, category, keywords, confidence, access_count)
    VALUES (
      1,
      'usr_default',
      'chunk_finance_01',
      'Sovereign Royalty & MFS Settlement Policy',
      'Preferred royalty payout rail is bKash Merchant Plus (+8801700000000) settled on the 1st of every month.',
      'finance',
      '["bKash","royalty","payout"]'::jsonb,
      0.99,
      5
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO public.twin_activity_log (id, twin_id, master_id, action, target_resource, metadata)
VALUES (
  1,
  'twin_seed_founder_01',
  'usr_default',
  'RECONCILE_MFS_SETTLEMENT',
  'mfs_trx_bkash_20261107',
  '{"amountBdt":14500,"status":"VERIFIED"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_activity_logs (id, twin_id, master_id, action, target_resource, metadata)
VALUES (
  'act_seed_founder_01',
  'twin_seed_founder_01',
  'usr_default',
  'VERIFY_MANUSCRIPT_MERKLE_SEAL',
  'cert_shothik_ekushey_01',
  '{"merkleRootVerified":true,"wordCount":4250}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_approvals (id, twin_id, master_id, action, payload, status)
VALUES (
  'appr_seed_dispatch_01',
  'twin_seed_founder_01',
  'usr_default',
  'DISPATCH_NILKHET_PRINT_BATCH',
  '{"invoiceNumber":"NLK-202611-0001","copies":50,"totalBdt":14500}'::jsonb,
  'approved'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_pending_approvals (id, twin_id, master_id, action, payload, status)
VALUES (
  1,
  'twin_seed_editor_02',
  'usr_default',
  'PUBLISH_CHAPTER_TO_EMPORIUM',
  '{"bookId":"book_ekushey_01","chapterIndex":3,"title":"অধ্যায় ৩: সার্বভৌম ভাষা মডেল"}'::jsonb,
  'pending'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_directions (id, user_id, company_slug, kind, content, is_active)
VALUES (
  'tdir_seed_01',
  'usr_default',
  'shothik-sovereign-labs',
  'standing_order',
  'Always verify NBR Mushak-6.3 VAT seal and bKash settlement hash before releasing wholesale courier consignments.',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_knowledge_vectors (id, twin_id, document_id, content_type, title, content, metadata)
VALUES (
  '77eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'twin_seed_editor_02',
  'rdoc_seed_ekushey_01',
  'manuscript',
  'Bangla Academy Standard Orthography Rules',
  'অ-তৎসম শব্দের বানানে ই-কার ব্যবহৃত হবে এবং রেফের পর ব্যঞ্জনবর্ণের দ্বিত্ব হবে না।',
  '{"authority":"Bangla Academy","edition":"2026"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_seeds (id, identity, conversation_id, company_name, summary, business_plan, tasks, revision)
VALUES (
  1,
  'usr_default',
  'conv_seed_flagship_01',
  'Shothik Sovereign Labs Ltd.',
  'AI-native publishing, fintech, and one-person company orchestration platform for Bangladesh.',
  'Scale Bangla Writing Studio, Emporium Book Store, and OPC Venture Autopilot across 100,000 creators and SMEs.',
  '[{"id":"opc_task_seed_01","title":"Complete RJSC One-Person Company Name Clearance","status":"completed"}]'::jsonb,
  3
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_task_memos (id, task_id, company_slug, user_id, title, scope_path, summary, execution_steps, output_artifacts, quality_score)
VALUES (
  'tmemo_seed_01',
  'ttask_seed_01',
  'shothik-sovereign-labs',
  'usr_default',
  'Q4 Mushak-6.3 & bKash Settlement Audit Memo',
  'finance/vat-compliance',
  'Verified all Q4 Mushak-6.3 VAT challans against bKash/Nagad settlements with 100% double-entry ledger balance.',
  '[{"step":1,"action":"Fetch Mushak-6.3 challans"},{"step":2,"action":"Verify SHA-256 fiscal seals"}]'::jsonb,
  '["rep_seed_fintech_2027"]'::jsonb,
  0.99
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.background_jobs (id, task_type, payload, status, attempts, max_attempts, idempotency_key, completed_at)
VALUES (
  1,
  'sync_rag_hnsw_index',
  '{"docId":"rdoc_seed_ekushey_01","chunks":2}'::jsonb,
  'completed',
  1,
  3,
  'job_idem_rag_sync_01',
  NOW()
)
ON CONFLICT (idempotency_key) DO NOTHING;

-- 8. Enterprise Bangla FinTech, Logistics, Tax & Cryptographic Security Tables
INSERT INTO public.audit_journal_entries (entry_id, transaction_ref, transaction_type, memo, lines, total_debit_bdt, total_credit_bdt, is_balanced, audit_hash, initiator_kind, initiator_id)
SELECT
  'aje_seed_20261107_01',
  'TRX-BKASH-20261107-01',
  'ROYALTY_SETTLEMENT',
  'Monthly author royalty settlement for সোনার বাংলা ও কৃত্রিম বুদ্ধিমত্তা',
  '[{"account":"2100_AUTHOR_ROYALTIES_PAYABLE","debitBdt":30000,"creditBdt":0},{"account":"1010_BKASH_MERCHANT_ESCROW","debitBdt":0,"creditBdt":30000}]'::jsonb,
  30000,
  30000,
  true,
  'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
  'system_twin',
  'twin_seed_founder_01'
WHERE NOT EXISTS (
  SELECT 1 FROM public.audit_journal_entries WHERE entry_id = 'aje_seed_20261107_01'
);

INSERT INTO public.commodity_inland_lcs (lc_number, commodity_name, buyer_name, seller_name, quantity_tons, unit_price_per_ton_bdt, total_value_bdt, escrow_status, lc_contract_seal_sha256)
VALUES (
  'ILC-BD-202611-001',
  '80gsm Cream Offset Printing Paper (Karnaphuli Grade A)',
  'Nilkhet Print Cooperative #4',
  'Chattogram Pulp & Paper Mills Ltd.',
  12.5,
  112000,
  1400000,
  'settled_verified',
  'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
)
ON CONFLICT (lc_number) DO NOTHING;

INSERT INTO public.courier_consignments (consignment_id, order_id, courier_provider, tracking_code, customer_name, customer_phone, delivery_address, zone, cod_amount_bdt, delivery_charge_bdt, status, verification_hash_sha256)
VALUES (
  'CSG-SF-202611-001',
  'NLK-202611-0001',
  'steadfast',
  'SF-BD-889201',
  'Dr. Arif Rahman',
  '+8801700000000',
  'House 14, Road 7, Dhanmondi, Dhaka-1205',
  'Dhaka Metro',
  0,
  120,
  'in_transit',
  'sha256:e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683'
)
ON CONFLICT (consignment_id) DO NOTHING;

INSERT INTO public.factoring_offers (offer_id, invoice_id, buyer_id, buyer_name, invoice_face_value_bdt, advance_rate_percent, gross_advance_bdt, discount_fee_bdt, net_payout_bdt, annualized_apr, disbursement_channel, status, verification_seal_sha256)
VALUES (
  'FACT-202611-001',
  'INV-BOIMELLA-2026-88',
  'usr_default',
  'Rokomari Enterprise Distribution Ltd.',
  250000,
  85,
  212500,
  4250,
  208250,
  14.5,
  'bKash_Merchant_Instant',
  'disbursed',
  'sha256:7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451'
)
ON CONFLICT (offer_id) DO NOTHING;

INSERT INTO public.idempotency_keys (key, user_id, endpoint, request_hash, response_status, response_body, state, expires_at)
VALUES (
  'idem_seed_checkout_20261107_01',
  'usr_default',
  'POST /api/payment/mfs/verify',
  'sha256:2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3',
  200,
  '{"verified":true,"trxId":"BKASH88990011","creditsAdded":2500}'::jsonb,
  'completed',
  NOW() + INTERVAL '30 days'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ivr_call_records (call_id, order_id, customer_phone, customer_name, cod_amount_bdt, rto_risk_score, risk_tier, call_status, dtmf_response, recording_duration_sec)
VALUES (
  'IVR-BD-202611-001',
  'ORD-EMPORIUM-901',
  '+8801811223344',
  'তানভীর আহমেদ (Tanvir Ahmed)',
  1250,
  12,
  'LOW',
  'confirmed_dtmf_1',
  '1',
  18
)
ON CONFLICT (call_id) DO NOTHING;

INSERT INTO public.mfs_transactions (trx_id, user_id, provider, amount_bdt, tier, status, metadata)
VALUES (
  'BKASH88990011',
  'usr_default',
  'bKash',
  799,
  'pro',
  'RECONCILED',
  '{"msisdn":"+8801700000000","settlementBatch":"BKS-20261107"}'::jsonb
)
ON CONFLICT (trx_id) DO NOTHING;

INSERT INTO public.mushak_63_challans (challan_number, seller_bin, buyer_bin, buyer_name, total_taxable_amount_bdt, total_vat_bdt, total_payable_bdt, verification_seal_sha256)
VALUES (
  'MUSHAK-6.3-202611-0001',
  '004192837-0101',
  '009812734-0202',
  'Shothik Sovereign Labs Ltd.',
  100000,
  15000,
  115000,
  'sha256:19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7'
)
ON CONFLICT (challan_number) DO NOTHING;

INSERT INTO public.parcels (consignment_id, tracking_code, provider, user_id, recipient_name, recipient_phone, city, address, cod_amount_bdt, delivery_fee_bdt, status, status_bangla, timeline, whatsapp_notification_sent, metadata)
VALUES (
  'PRC-SF-202611-001',
  'SF-TRK-202611001',
  'steadfast',
  'usr_default',
  'সাদিয়া ইসলাম (Sadia Islam)',
  '+8801911223344',
  'Dhaka',
  'Uttara Sector 7, Road 12, House 9, Dhaka-1230',
  650,
  60,
  'DELIVERED',
  'ডেলিভারি সম্পন্ন হয়েছে',
  '[{"status":"BOOKED","at":"2026-11-06T10:00:00Z"},{"status":"DELIVERED","at":"2026-11-07T04:30:00Z"}]'::jsonb,
  true,
  '{"bookId":"book_ekushey_01","copies":2}'::jsonb
)
ON CONFLICT (consignment_id) DO NOTHING;

INSERT INTO public.protected_action_audit (action_id, action_type, actor_id, payload, otp_verified, approver_mfs_phone, state_seal_sha256)
VALUES (
  'pact_seed_20261107_01',
  'AUTHOR_ROYALTY_DISBURSEMENT',
  'usr_default',
  '{"payoutId":"pay_seed_202610_01","amountBdt":30000,"method":"bKash"}'::jsonb,
  'true',
  '+8801700000000',
  'sha256:4ec9599fc203d176a301536c2e091a19bc852759b255bd6818810a42c5fed14a'
)
ON CONFLICT (action_id) DO NOTHING;

INSERT INTO public.saga_executions (saga_id, saga_name, correlation_id, idempotency_key, status, context, current_step_index, steps, completed_at)
VALUES (
  'saga_seed_publish_20261107_01',
  'ekushey_book_publish_and_print_saga',
  'corr_ekushey_01',
  'idem_saga_ekushey_01',
  'COMPLETED',
  '{"bookId":"book_ekushey_01","nilkhetInvoice":"NLK-202611-0001"}'::jsonb,
  3,
  '[{"name":"verify_merkle_certificate","status":"COMPLETED"},{"name":"mint_emporium_listing","status":"COMPLETED"},{"name":"dispatch_nilkhet_print_order","status":"COMPLETED"}]'::jsonb,
  NOW()
)
ON CONFLICT (saga_id) DO NOTHING;

INSERT INTO public.second_me_key_custody (id, user_id, purpose, provider, sealed_key)
VALUES (
  1,
  'usr_default',
  'sovereign_byok_llm_custody',
  'openrouter',
  'aes256gcm:v1:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d:sealed_sovereign_key'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Domain Atomic SQL RPC Functions
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id TEXT,
  p_amount INTEGER
)
RETURNS TABLE (
  user_id TEXT,
  new_balance INTEGER,
  lifetime_spent INTEGER,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deduction amount must be positive';
  END IF;

  RETURN QUERY
  UPDATE public.user_credits uc
  SET
    balance = uc.balance - p_amount,
    lifetime_spent = uc.lifetime_spent + p_amount,
    updated_at = timezone('utc'::text, now())
  WHERE uc.user_id = p_user_id
    AND uc.balance >= p_amount
  RETURNING uc.user_id, uc.balance AS new_balance, uc.lifetime_spent, true AS success;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_domain_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_public_tables', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'),
    'chat', jsonb_build_object(
      'conversations', (SELECT count(*) FROM public.chat_conversations),
      'messages', (SELECT count(*) FROM public.chat_messages),
      'canvas_artifacts', (SELECT count(*) FROM public.canvas_artifacts),
      'saved_reports', (SELECT count(*) FROM public.saved_reports),
      'dsh_sessions', (SELECT count(*) FROM public.dsh_sessions)
    ),
    'twin', jsonb_build_object(
      'twin_profiles', (SELECT count(*) FROM public.twin_profiles),
      'twins', (SELECT count(*) FROM public.twins),
      'twin_tasks', (SELECT count(*) FROM public.twin_tasks),
      'companies', (SELECT count(*) FROM public.companies),
      'opc_tasks', (SELECT count(*) FROM public.opc_tasks),
      'nightshift_digests', (SELECT count(*) FROM public.nightshift_digests)
    ),
    'connector', jsonb_build_object(
      'user_connectors', (SELECT count(*) FROM public.user_connectors)
    ),
    'project', jsonb_build_object(
      'projects', (SELECT count(*) FROM public.projects),
      'writing_autosave', (SELECT count(*) FROM public.writing_autosave)
    ),
    'writing_suite', jsonb_build_object(
      'rag_documents', (SELECT count(*) FROM public.rag_documents),
      'rag_chunks', (SELECT count(*) FROM public.rag_chunks),
      'plagiarism_scans', (SELECT count(*) FROM public.plagiarism_scans),
      'tool_usage', (SELECT count(*) FROM public.tool_usage),
      'llm_usage', (SELECT count(*) FROM public.llm_usage)
    ),
    'writing_studio', jsonb_build_object(
      'book_chapters', (SELECT count(*) FROM public.book_chapters),
      'book_chapter_attempts', (SELECT count(*) FROM public.book_chapter_attempts),
      'book_suite_manifests', (SELECT count(*) FROM public.book_suite_manifests),
      'authorship_certificates', (SELECT count(*) FROM public.authorship_certificates)
    ),
    'community', jsonb_build_object(
      'channels', (SELECT count(*) FROM public.channels),
      'posts', (SELECT count(*) FROM public.posts),
      'comments', (SELECT count(*) FROM public.comments),
      'votes', (SELECT count(*) FROM public.votes),
      'creator_guilds', (SELECT count(*) FROM public.creator_guilds)
    ),
    'emporium', jsonb_build_object(
      'publishing_books', (SELECT count(*) FROM public.publishing_books),
      'marketplace_agents', (SELECT count(*) FROM public.marketplace_agents),
      'author_earnings', (SELECT count(*) FROM public.author_earnings),
      'nilkhet_orders', (SELECT count(*) FROM public.nilkhet_orders),
      'inventory_items', (SELECT count(*) FROM public.inventory_items)
    ),
    'account', jsonb_build_object(
      'user_profiles', (SELECT count(*) FROM public.user_profiles),
      'user_preferences', (SELECT count(*) FROM public.user_preferences),
      'organizations', (SELECT count(*) FROM public.organizations),
      'organization_members', (SELECT count(*) FROM public.organization_members),
      'workspaces', (SELECT count(*) FROM public.workspaces)
    ),
    'pricing', jsonb_build_object(
      'pricing_plans', (SELECT count(*) FROM public.pricing_plans),
      'outcome_passes', (SELECT count(*) FROM public.outcome_passes),
      'user_subscriptions', (SELECT count(*) FROM public.user_subscriptions),
      'user_credits', (SELECT count(*) FROM public.user_credits),
      'mfs_transactions', (SELECT count(*) FROM public.mfs_transactions)
    )
  ) INTO result;

  RETURN result;
END;
$$;
