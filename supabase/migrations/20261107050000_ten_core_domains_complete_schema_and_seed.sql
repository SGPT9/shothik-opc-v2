-- =============================================================================
-- Migration: 20261107050000_ten_core_domains_complete_schema_and_seed.sql
-- Purpose: Ensure all 10 Core Product Domains exist with complete tables, RLS,
--          Realtime publications, and canonical seed data in Supabase:
--   1. Chat           (chat_conversations, chat_messages, canvas_artifacts, dsh_sessions, saved_reports)
--   2. Twin           (twins, twin_profiles, twin_tasks, opc_tasks, twin_approvals, twin_activity_logs, semantic_memories)
--   3. Connector      (user_connectors, second_me_key_custody, channels)
--   4. Project        (projects, workspaces, organizations, organization_members)
--   5. Writing Suite  (publishing_books, book_chapters, book_chapter_attempts, book_suite_manifests, authorship_certificates)
--   6. Writing Studio (writing_autosave, plagiarism_scans, tool_usage, second_me_writing_profiles, document_embeddings)
--   7. Community      (posts, comments, votes, creator_guilds)
--   8. Emporium       (publishing_books, nilkhet_orders, marketplace_agents, author_earnings, author_payout_accounts, author_payouts)
--   9. Account        (user_profiles, user_preferences, user_credits, companies, second_me_key_custody)
--  10. Pricing        (pricing_plans, outcome_passes, user_subscriptions, user_credits, mfs_transactions, tool_usage, llm_usage)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PRICING DOMAIN: public.pricing_plans & public.outcome_passes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_bn TEXT,
  tagline TEXT,
  price_bdt INTEGER NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'month',
  monthly_credits INTEGER NOT NULL DEFAULT 500,
  tool_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outcome_passes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_bdt INTEGER NOT NULL,
  credits_equivalent INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_core BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read pricing_plans" ON public.pricing_plans;
CREATE POLICY "Public read pricing_plans"
  ON public.pricing_plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role write pricing_plans" ON public.pricing_plans;
CREATE POLICY "Service role write pricing_plans"
  ON public.pricing_plans FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public read outcome_passes" ON public.outcome_passes;
CREATE POLICY "Public read outcome_passes"
  ON public.outcome_passes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role write outcome_passes" ON public.outcome_passes;
CREATE POLICY "Service role write outcome_passes"
  ON public.outcome_passes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 2. EMPORIUM DOMAIN: public.marketplace_agents & publishing_books extensions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT NOT NULL DEFAULT 'usr_default',
  installs_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  price_credits INTEGER NOT NULL DEFAULT 0,
  price_bdt INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT NOT NULL DEFAULT 'Bot',
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketplace_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read marketplace_agents" ON public.marketplace_agents;
CREATE POLICY "Public read marketplace_agents"
  ON public.marketplace_agents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role write marketplace_agents" ON public.marketplace_agents;
CREATE POLICY "Service role write marketplace_agents"
  ON public.marketplace_agents FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE public.publishing_books
  ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Shothik Community Author',
  ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 120,
  ADD COLUMN IF NOT EXISTS credit_price INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cover_preset TEXT DEFAULT 'ekushey',
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.9,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS synopsis TEXT,
  ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.book_chapters
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- -----------------------------------------------------------------------------
-- 3. CONNECTOR & CHAT DOMAIN EXTENSIONS
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_connectors
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'connected',
  ADD COLUMN IF NOT EXISTS items_indexed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sync_summary TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS conversation_id TEXT,
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT;

-- -----------------------------------------------------------------------------
-- 4. CANONICAL SEED DATA ACROSS ALL 10 PRODUCT DOMAINS
-- -----------------------------------------------------------------------------

-- Domain 9: Account (user_profiles, user_preferences, user_credits, companies)
INSERT INTO public.user_profiles (id, email, name, role, tier)
VALUES ('usr_default', 'founder@shothik.ai', 'Shothik Founder', 'admin', 'pro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (user_id, locale, theme, studio_mode, notifications, tax_profile)
VALUES (
  'usr_default',
  'bn-BD',
  'dark',
  'publishing_and_venture',
  '{"email":true,"whatsapp":true,"nightshiftDigest":true}'::jsonb,
  '{"tin":"TIN-8849201948","bin":"004928173-0101","vatRate":0.15}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_credits (user_id, balance, lifetime_earned, lifetime_spent)
VALUES ('usr_default', 2500, 2500, 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.companies (user_id, name, slug, industry, business_model, business_type, problem_statement, domain, email, revenue_bdt)
SELECT 'usr_default', 'Shothik AI Labs Bangladesh Ltd.', 'shothik-ai-bd', 'AI & Publishing Technology', 'B2B2C SaaS & Print-on-Demand', 'Private Limited', 'Autonomous Bangla Literary Publishing & F-Commerce Operations', 'shothik.ai', 'founder@shothik.ai', 1450000
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE slug = 'shothik-ai-bd');

-- Domain 10: Pricing (pricing_plans, outcome_passes, user_subscriptions)
INSERT INTO public.pricing_plans (id, slug, name, name_bn, tagline, price_bdt, price_usd, billing_interval, monthly_credits, tool_limits, features, is_popular, sort_order)
VALUES
  (
    'plan_free',
    'free',
    'Free Starter',
    'ফ্রি স্টার্টার',
    'Essential Bangla & English writing studio tools and daily AI chat',
    0,
    0.00,
    'month',
    500,
    '{"chat":25,"plagiarism":5,"ai-detector":5,"paraphrase":10,"grammar":20,"humanize":5,"summarize":10,"translator":20}'::jsonb,
    '["500 starter task credits","25 daily AI chat queries","Basic Bangla & English Writing Studio","Community Forum & Boi Mela Reader access"]'::jsonb,
    false,
    1
  ),
  (
    'plan_starter_pass',
    'starter-pass',
    'Student & Writer Pass',
    'স্টুডেন্ট ও লেখক পাস',
    'Built for university theses, novelists, and Ekushey Boi Mela authors',
    499,
    4.99,
    'month',
    2500,
    '{"chat":100,"plagiarism":30,"ai-detector":30,"paraphrase":50,"grammar":100,"humanize":20,"summarize":50,"translator":100}'::jsonb,
    '["2,500 monthly credits","30 Plagiarism & AI Detector scans","Full 42-Capability InkOS Writing Suite","Nilkhet 6x9 Print-on-Demand & Forme Imposition"]'::jsonb,
    false,
    2
  ),
  (
    'plan_pro_operator',
    'pro-operator',
    'Pro Operator & Author',
    'প্রো অপারেটর ও লেখক',
    'Unlimited chat, Style DNA cloning, 24kHz Audiobook Studio & Venture Twin',
    1499,
    14.99,
    'month',
    10000,
    '{"chat":-1,"plagiarism":100,"ai-detector":100,"paraphrase":200,"grammar":-1,"humanize":100,"summarize":200,"translator":-1}'::jsonb,
    '["10,000 monthly credits","Unlimited AI Chat, Grammar & Translation","24kHz Bangla Voice Casting & 3D Binaural Soundscape","Autonomous Venture Twin & Nightshift Researcher"]'::jsonb,
    true,
    3
  ),
  (
    'plan_venture_twin',
    'venture-twin',
    'Venture Twin & F-Commerce Suite',
    'ভেঞ্চার টুইন ও এফ-কমার্স স্যুট',
    '24/7 autonomous F-Commerce, Steadfast/Pathao arbitrage, bKash reconciliation & NBR Mushak-6.3',
    2999,
    29.99,
    'month',
    30000,
    '{"chat":-1,"plagiarism":-1,"ai-detector":-1,"paraphrase":-1,"grammar":-1,"humanize":-1,"summarize":-1,"translator":-1}'::jsonb,
    '["30,000 monthly credits","Unlimited Writing Studio & Publishing Suite","Autonomous bKash/Nagad + Steadfast/Pathao Operations","NBR Mushak-6.3 VAT Ledger & inland LC trade engines"]'::jsonb,
    false,
    4
  ),
  (
    'plan_agency_scale',
    'agency-scale',
    'Enterprise & Publisher Guild',
    'এন্টারপ্রাইজ ও প্রকাশনী গিল্ড',
    'Multi-seat CRDT collaboration, dedicated GPU swarm & custom BYOK vault',
    7999,
    79.99,
    'month',
    100000,
    '{"chat":-1,"plagiarism":-1,"ai-detector":-1,"paraphrase":-1,"grammar":-1,"humanize":-1,"summarize":-1,"translator":-1}'::jsonb,
    '["100,000 monthly credits","Multi-author CRDT Real-Time Showrunner Table","Dedicated Nilkhet Press Hub & Boi Mela Distribution","Zero-Trust BYOK Key Custody & SLA Priority"]'::jsonb,
    false,
    5
  )
ON CONFLICT (id) DO UPDATE SET
  price_bdt = EXCLUDED.price_bdt,
  monthly_credits = EXCLUDED.monthly_credits,
  tool_limits = EXCLUDED.tool_limits,
  features = EXCLUDED.features,
  updated_at = NOW();

INSERT INTO public.outcome_passes (id, name, price_bdt, credits_equivalent, outcome, category, is_core)
VALUES
  ('THESIS_PLAGIARISM_PASS', 'Single Thesis Plagiarism & Citation Report', 49, 50, 'Full thesis plagiarism audit report with institutional similarity scores & IEEE PDF export', 'academic', true),
  ('AUDIOBOOK_BOOKTOK_PASS', 'Audiobook & BookTok Launch Pass', 149, 150, '24kHz Multi-Cast Bangla Audiobook Chapter, 3D Binaural Soundscape, and 3 BookTok Lip-Sync Video Reels', 'publishing', false),
  ('BOI_MELA_PRINT_PASS', 'Ekushey Boi Mela Print-Ready Book Pass', 199, 200, 'Complete Ekushey Boi Mela 6x9 PDF/X-1a Nilkhet Forma Typesetting, 3D Book Jacket, National Library CIP & EAN-13 ISBN Barcode, and Legal Defamation Preflight Certificate', 'publishing', false),
  ('PROJECT_VENTURE_PASS', 'Founder Project Pass', 299, 300, 'Editable PPTX pitch deck, 3-year financial model spreadsheet, and Dokploy container deployment', 'venture', true),
  ('F_COMMERCE_MONTHLY_PASS', 'Autonomous F-Commerce Operations', 999, 1200, '24/7 autonomous Steadfast/Pathao courier tracking and customer query resolution on Messenger/WhatsApp', 'commerce', true)
ON CONFLICT (id) DO UPDATE SET
  price_bdt = EXCLUDED.price_bdt,
  credits_equivalent = EXCLUDED.credits_equivalent,
  outcome = EXCLUDED.outcome,
  updated_at = NOW();

INSERT INTO public.user_subscriptions (user_id, tier, status, interval, cancel_at_period_end)
SELECT 'usr_default', 'pro', 'active', 'month', false
WHERE NOT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = 'usr_default');

-- Domain 4: Project (organizations, workspaces, projects)
INSERT INTO public.organizations (id, name, slug, owner_id, tier, credits_pool, mfs_phone)
VALUES ('00000000-0000-4000-8000-000000000101', 'Shothik AI Studio HQ', 'shothik-hq', 'usr_default', 'pro', 10000, '01711000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, description, is_private, created_by)
VALUES ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Dhaka Deep-Tech & Literary Workspace', 'Primary workspace for Ekushey Boi Mela novels and F-Commerce operations.', true, 'usr_default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, user_id, title, type, template, description, word_count, progress, starred, sections, settings)
VALUES
  (
    '00000000-0000-4000-8000-000000000301',
    'usr_default',
    'অমর একুশে উপন্যাস: রক্তের আখরে গাঁথা (Ekushey Novel 2026)',
    'book',
    'ekushey_6x9_trade',
    'Historical & cyber-noir novel set across 1952 Curzon Hall and 2026 Dhaka.',
    11100,
    75,
    true,
    '[{"id":"sec_1","title":"অধ্যায় ১: পলাশী থেকে কার্জন হলের মিছিল","wordCount":3200},{"id":"sec_2","title":"অধ্যায় ২: নীলক্ষেতের প্রথম লিড টাইপ প্রেস","wordCount":4100},{"id":"sec_3","title":"অধ্যায় ৩: ডিজিটাল মাতৃভাষা ও ভোরের আলো","wordCount":3800}]'::jsonb,
    '{"language":"bn","trimSize":"6x9","font":"Kalpurush"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    'usr_default',
    'The Bangladeshi Tech Startup Playbook',
    'book',
    'nonfiction_playbook',
    'From Zero to $10M ARR in Emerging Markets: bKash MFS, Logistics & Autonomous Swarms.',
    13900,
    90,
    true,
    '[{"id":"sec_1","title":"Chapter 1: The Emerging Market Moat","wordCount":4200},{"id":"sec_2","title":"Chapter 2: bKash & Nagad Micro-Transactions","wordCount":5100},{"id":"sec_3","title":"Chapter 3: Autonomous Swarm Operations","wordCount":4600}]'::jsonb,
    '{"language":"en","trimSize":"6x9","font":"Merriweather"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Domain 5 & 8: Writing Suite & Emporium (publishing_books, book_chapters, marketplace_agents)
INSERT INTO public.publishing_books (
  id, user_id, author_name, title, subtitle, description, synopsis, language, category, genre,
  keywords, isbn, cover_preset, page_count, target_word_count, list_price, currency, credit_price,
  rating, rating_count, status, published_at, chapters
)
VALUES
  (
    'amar-ekushey-novel',
    'usr_default',
    'ড. হুমায়ুন কবির',
    'অমর একুশে উপন্যাস: রক্তের আখরে গাঁথা',
    '১৯৫২ থেকে ২০২৬ — ভাষার আত্মমর্যাদা ও সাংস্কৃতিক জাগরণের মহাকাব্যিক আখ্যান',
    'ভাষার অধিকার রক্ষা থেকে শুরু করে আধুনিক ডিজিটাল সার্বভৌমত্ব প্রতিষ্ঠায় নতুন প্রজন্মের আত্মত্যাগ নিয়ে রচিত কালজয়ী উপন্যাস।',
    'ভাষার অধিকার রক্ষা থেকে শুরু করে আধুনিক ডিজিটাল সার্বভৌমত্ব প্রতিষ্ঠায় নতুন প্রজন্মের আত্মত্যাগ নিয়ে রচিত কালজয়ী উপন্যাস।',
    'bn',
    'Fiction',
    'Historical Fiction',
    '["একুশে বইমেলা","ভাষা আন্দোলন","উপন্যাস"]'::jsonb,
    '978-984-95842-1-2',
    'ekushey',
    160,
    11100,
    '320',
    'BDT',
    0,
    4.90,
    142,
    'published',
    '2026-02-21T00:00:00Z',
    '[{"id":"ch1","title":"অধ্যায় ১: পলাশী থেকে কার্জন হলের মিছিল","wordCount":3200},{"id":"ch2","title":"অধ্যায় ২: নীলক্ষেতের প্রথম লিড টাইপ প্রেস","wordCount":4100},{"id":"ch3","title":"অধ্যায় ৩: ডিজিটাল মাতৃভাষা ও ভোরের আলো","wordCount":3800}]'::jsonb
  ),
  (
    'tech-playbook',
    'usr_default',
    'Tanvir Ahmed & Shothik Founders',
    'The Bangladeshi Tech Startup Playbook',
    'From Zero to $10M ARR in Emerging Markets: Fundraising, Product & Growth',
    'A battle-tested blueprint for Bangladeshi founders scaling B2B SaaS, MFS fin-tech, and AI-native startups in South Asia.',
    'A battle-tested blueprint for Bangladeshi founders scaling B2B SaaS, MFS fin-tech, and AI-native startups in South Asia.',
    'en',
    'Technology',
    'Business & Strategy',
    '["Bangladesh","Startup","bKash","AI Swarm"]'::jsonb,
    '978-984-95842-2-9',
    'tech_playbook',
    240,
    13900,
    '450',
    'BDT',
    50,
    4.80,
    89,
    'published',
    '2026-01-15T00:00:00Z',
    '[{"id":"ch1","title":"Chapter 1: The Emerging Market Moat & Unit Economics","wordCount":4200},{"id":"ch2","title":"Chapter 2: bKash / Nagad Micro-Transactions & Retention","wordCount":5100},{"id":"ch3","title":"Chapter 3: Swarm Autonomous Operations & Lean Scaling","wordCount":4600}]'::jsonb
  ),
  (
    'poetry-anthology',
    'usr_default',
    'নুসরাত জাহান',
    'শ্রাবণের মেঘ ও নৈঃশব্দ্য: সমকালীন কবিতা',
    'নাগরিক বিষাদ, বৃষ্টি ও নদীমাতৃক বাংলার একশত লিরিকাল কবিতা',
    'বৃষ্টিভেজা ঢাকা শহর, ধানমণ্ডি লেকের অপরাহ্ন ও স্মৃতির কোলাজ নিয়ে রচিত একশত মনোমুগ্ধকর কবিতা সংকলন।',
    'বৃষ্টিভেজা ঢাকা শহর, ধানমণ্ডি লেকের অপরাহ্ন ও স্মৃতির কোলাজ নিয়ে রচিত একশত মনোমুগ্ধকর কবিতা সংকলন।',
    'bn',
    'Poetry',
    'Contemporary Poetry',
    '["কবিতা","শ্রাবণ","ঢাকা"]'::jsonb,
    '978-984-95842-3-6',
    'poetry',
    120,
    4000,
    '250',
    'BDT',
    0,
    4.70,
    67,
    'published',
    '2026-02-01T00:00:00Z',
    '[{"id":"ch1","title":"স্তবক ১: বৃষ্টির শব্দ ও নিস্তব্ধ ঘর","wordCount":1800},{"id":"ch2","title":"স্তবক ২: বুড়িগঙ্গার জল ও অচেনা ট্রলার","wordCount":2200}]'::jsonb
  ),
  (
    'thesis-monograph',
    'usr_default',
    'Shothik Research Lab & AI Swarm Group',
    'Distributed LLM Agent Orchestration & Micro-Inference',
    'Formal System Verification, CRDT Collaboration & Edge Memory Graphs',
    'Comprehensive research monograph on multi-agent consensus protocols, sub-10ms Wasm sandbox execution, and local-first memory topologies.',
    'Comprehensive research monograph on multi-agent consensus protocols, sub-10ms Wasm sandbox execution, and local-first memory topologies.',
    'en',
    'Academic',
    'Computer Science',
    '["LLM","CRDT","PgVector","Multi-Agent"]'::jsonb,
    '978-984-95842-4-3',
    'thesis',
    320,
    13700,
    '550',
    'BDT',
    100,
    5.00,
    34,
    'published',
    '2026-02-10T00:00:00Z',
    '[{"id":"ch1","title":"1. Epistemic Graphs & Subagent Deliberation Bounds","wordCount":6500},{"id":"ch2","title":"2. Conflict-Free Replicated Data Types in Real-Time LLM Streaming","wordCount":7200}]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  genre = EXCLUDED.genre,
  page_count = EXCLUDED.page_count,
  credit_price = EXCLUDED.credit_price,
  cover_preset = EXCLUDED.cover_preset,
  rating = EXCLUDED.rating,
  rating_count = EXCLUDED.rating_count,
  synopsis = EXCLUDED.synopsis,
  chapters = EXCLUDED.chapters;

INSERT INTO public.book_chapters (id, book_id, chapter_index, title, content, word_count, status)
VALUES
  ('ch_ekushey_01', 'amar-ekushey-novel', 1, 'অধ্যায় ১: পলাশী থেকে কার্জন হলের মিছিল', '১৯৫২ সালের ২১শে ফেব্রুয়ারি সকাল। কার্জন হলের সামনের রাজপথে ছাত্রদের মিছিল ও স্লোগানে মুখরিত আকাশ...', 3200, 'approved'),
  ('ch_ekushey_02', 'amar-ekushey-novel', 2, 'অধ্যায় ২: নীলক্ষেতের প্রথম লিড টাইপ প্রেস', 'রাত গভীর হলে নীলক্ষেতের পুরনো ছাপাখানায় সীসার হরফ সাজিয়ে ছাপা হতে থাকে ভাষা আন্দোলনের ইশতেহার...', 4100, 'approved'),
  ('ch_ekushey_03', 'amar-ekushey-novel', 3, 'অধ্যায় ৩: ডিজিটাল মাতৃভাষা ও ভোরের আলো', '২০২৬ সালের ঢাকা। বাংলা ভাষার ধ্বনি ও সাহিত্যের ডিজিটাল সার্বভৌমত্ব রক্ষায় নতুন প্রজন্মের অভিযাত্রা...', 3800, 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.marketplace_agents (id, name, category, description, author_name, installs_count, rating, price_credits, price_bdt, icon_name)
VALUES
  ('agent_fcommerce_live', 'Facebook Live Stream Order Parser Bot', 'f-commerce', 'Auto-converts live video comments into bKash payment links & Steadfast courier bookings.', 'Shothik Merchant Lab', 1420, 4.90, 0, 0, 'Video'),
  ('agent_nbr_vat', 'NBR Mushak-6.3 Tax & VAT Assistant', 'vat-tax', 'Generates gapless sequential Mushak-6.3 challans and Section 78 income tax rebate schedules.', 'Dhaka Tax Advisory Ltd', 890, 4.80, 100, 100, 'FileText'),
  ('agent_nilkhet_author', 'Nilkhet 3D Book Authoring & Preflight Bot', 'nilkhet-publishing', 'Automates PDF X-1a preflight checks, SHA-256 DRM watermarking, and Nilkhet POD printing costs.', 'Nilkhet Press Guild', 650, 4.70, 50, 50, 'BookOpen'),
  ('agent_cursor_code', 'Cursor Code Master & Security Swarm', 'developer-swarm', 'Runs multi-agent code reviews, DSH capability seam refactoring, and zero-day vulnerability checks.', 'SGPT9 Dev Labs', 2100, 5.00, 0, 0, 'Code')
ON CONFLICT (id) DO NOTHING;

-- Domain 6: Writing Studio (writing_autosave, second_me_writing_profiles)
INSERT INTO public.writing_autosave (user_id, local_project_id, content, word_count)
SELECT 'usr_default', 'amar-ekushey-novel', 'রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া। হিমু হলুদ পাঞ্জাবি পরে নীলক্ষেতের মোড়ে দাঁড়িয়ে ছাপাখানার শব্দ শুনছে।', 24
WHERE NOT EXISTS (SELECT 1 FROM public.writing_autosave WHERE user_id = 'usr_default' AND local_project_id = 'amar-ekushey-novel');

INSERT INTO public.second_me_writing_profiles (user_id, letta_agent_id, block_label, model_handle, last_content_length)
SELECT 'usr_default', 'letta_style_dna_founder', 'human_persona_bangla_literary', 'hermes-default', 11100
WHERE NOT EXISTS (SELECT 1 FROM public.second_me_writing_profiles WHERE user_id = 'usr_default');

-- Domain 1: Chat (chat_conversations, chat_messages)
INSERT INTO public.chat_conversations (id, user_id, surface, title, model_handle, status, pinned, last_message_preview, message_count)
VALUES (
  'conv_welcome_shothik',
  'usr_default',
  'studio',
  'Welcome to Shothik AI — Deep-Tech Co-Founder & Literary Studio',
  'hermes-default',
  'active',
  true,
  'Your Shothik AI workspace is live on Supabase PostgreSQL with 4 published Boi Mela titles...',
  2
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chat_messages (id, conversation_id, author_id, user_id, role, content, model, metadata)
VALUES
  (
    '00000000-0000-4000-8000-000000000401',
    'conv_welcome_shothik',
    'usr_default',
    'usr_default',
    'user',
    'Give me an overview of my active Shothik AI workspace, Nilkhet publishing pipeline, and Venture Twin tasks.',
    'hermes-default',
    '{"tokens":22}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    'conv_welcome_shothik',
    'assistant',
    'usr_default',
    'assistant',
    'Your Shothik AI workspace is live on Supabase PostgreSQL with 4 published Boi Mela titles, active Nilkhet 6x9 Print-on-Demand imposition, 24kHz Bangla Voice AI casting, and autonomous Venture Twin operations.',
    'hermes-default',
    '{"tokens":45}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Domain 2: Twin (twins, twin_profiles, twin_tasks, opc_tasks)
INSERT INTO public.twins (master_id, name, specialization, persona, communication_style, bio, source_platform, training_status, knowledge_score, is_active, lifecycle_state, verification_badge, trust_score)
SELECT 'usr_default', 'Shothik Venture & Literary Twin', 'F-Commerce & Publishing Showrunner', 'Analytical, bilingual (Bangla/English), deep-tech strategist', 'Direct, high-signal, grounded in Bangladesh unit economics', 'Autonomous AI Co-Founder managing Dhaka F-Commerce logistics, NBR VAT compliance, and Ekushey Boi Mela publishing.', 'shothik_studio', 'ready', 98, true, 'ACTIVE', true, 99
WHERE NOT EXISTS (SELECT 1 FROM public.twins WHERE master_id = 'usr_default');

INSERT INTO public.twin_profiles (id, master_id, name, specialization, persona, communication_style, bio, source_platform, training_status, knowledge_score, is_active, lifecycle_state, verification_badge, trust_score)
VALUES (
  'twin_prof_usr_default',
  'usr_default',
  'Shothik Venture & Literary Twin',
  'F-Commerce & Publishing Showrunner',
  'Analytical, bilingual (Bangla/English), deep-tech strategist',
  'Direct, high-signal, grounded in Bangladesh unit economics',
  'Autonomous AI Co-Founder managing Dhaka F-Commerce logistics, NBR VAT compliance, and Ekushey Boi Mela publishing.',
  'shothik_studio',
  'ready',
  98,
  true,
  'ACTIVE',
  true,
  99
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.twin_tasks (id, twin_id, user_id, title, description, task_type, status, result)
VALUES
  ('ttask_seed_01', 'twin_prof_usr_default', 'usr_default', 'Audit Ekushey Boi Mela 6x9 CMYK Preflight & Spine Width', 'Verify 160-page 80gsm Swedish Cream spine caliper (8.8mm) and ISBN-13 barcode for Bakushah Market press.', 'publishing_preflight', 'completed', '{"preflightScore":100,"spineMm":8.8}'::jsonb),
  ('ttask_seed_02', 'twin_prof_usr_default', 'usr_default', 'Optimize Dhaka-Chittagong Courier Arbitrage Matrix', 'Compare Steadfast vs Pathao COD settlement latency and SLA success rate across 64 districts.', 'logistics_arbitrage', 'in_progress', '{"recommendedCarrier":"steadfast","slaSuccess":0.974}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.opc_tasks (id, company_id, title, description, status, priority, assigned_agent, metadata)
VALUES
  ('opc_seed_01', 'shothik-ai-bd', 'Reconcile bKash PGW TrxID Ledger & Generate Mushak-6.3 Challan', 'Verify daily MFS webhook settlements and emit sequential NBR Mushak-6.3 tax invoice.', 'in_progress', 'high', 'agent_nbr_vat', '{"currency":"BDT","vatRate":0.15}'::jsonb),
  ('opc_seed_02', 'shothik-ai-bd', 'Synthesize 24kHz Multi-Cast Bangla Audiobook Preview for Chapter 1', 'Render Nusrat & Ayesha voice personas with HRTF monsoon rain foley.', 'pending', 'medium', 'agent_nilkhet_author', '{"persona":"nusrat_banking","sampleRate":24000}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Domain 3: Connector (user_connectors)
INSERT INTO public.user_connectors (user_id, connector_id, connected, masked_key, status, items_indexed, sync_summary, last_verified_at, last_synced_at)
VALUES
  ('usr_default', 'steadfast', true, 'stdf••••901', 'connected', 14, 'Steadfast Courier BD Hub connected (64 districts SLA active)', NOW(), NOW()),
  ('usr_default', 'bkash', true, 'bksh••••442', 'connected', 28, 'bKash Tokenized Checkout & TrxID Webhook active', NOW(), NOW()),
  ('usr_default', 'notion', true, 'ntn_••••88a', 'connected', 6, 'Synced 6 workspace PRDs and Story Bible notes into pgvector', NOW(), NOW())
ON CONFLICT (user_id, connector_id) DO UPDATE SET
  status = EXCLUDED.status,
  items_indexed = EXCLUDED.items_indexed,
  sync_summary = EXCLUDED.sync_summary,
  last_synced_at = NOW();

-- Domain 7: Community (creator_guilds)
INSERT INTO public.creator_guilds (guild_id, guild_name, vertical, regional_hub, member_count, collective_pool_value_bdt, escrow_badge)
VALUES
  ('GUILD-DHK-GARMENTS', 'Dhaka Ready-Made Garments & Panjabi Guild', 'apparel_textile', 'Dhaka', 420, '4500000', 'PLATINUM_VERIFIED'),
  ('GUILD-CTG-ELECTRONICS', 'Chittagong Gadget & Mobile Accessory Guild', 'electronics_gadgets', 'Chittagong', 310, '6200000', 'GOLD_VERIFIED'),
  ('GUILD-BOIMELA-AUTHORS', 'BoiMela Novelists & Academic Writers Guild', 'authors_publishing', 'National', 185, '1850000', 'PLATINUM_VERIFIED')
ON CONFLICT (guild_id) DO NOTHING;

-- Add new tables to supabase_realtime publication safely
DO $$
DECLARE
  t TEXT;
  realtime_tables TEXT[] := ARRAY[
    'pricing_plans',
    'outcome_passes',
    'marketplace_agents',
    'projects',
    'user_connectors',
    'creator_guilds',
    'user_subscriptions',
    'user_credits'
  ];
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY realtime_tables LOOP
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = t
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END $$;
