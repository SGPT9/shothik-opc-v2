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
    'à¦«à§à¦°à¦¿ à¦¸à§à¦Ÿà¦¾à¦°à§à¦Ÿà¦¾à¦°',
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
    'à¦¸à§à¦Ÿà§à¦¡à§‡à¦¨à§à¦Ÿ à¦“ à¦²à§‡à¦–à¦• à¦ªà¦¾à¦¸',
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
    'à¦ªà§à¦°à§‹ à¦…à¦ªà¦¾à¦°à§‡à¦Ÿà¦° à¦“ à¦²à§‡à¦–à¦•',
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
    'à¦­à§‡à¦žà§à¦šà¦¾à¦° à¦Ÿà§à¦‡à¦¨ à¦“ à¦à¦«-à¦•à¦®à¦¾à¦°à§à¦¸ à¦¸à§à¦¯à§à¦Ÿ',
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
    'à¦à¦¨à§à¦Ÿà¦¾à¦°à¦ªà§à¦°à¦¾à¦‡à¦œ à¦“ à¦ªà§à¦°à¦•à¦¾à¦¶à¦¨à§€ à¦—à¦¿à¦²à§à¦¡',
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
    'à¦…à¦®à¦° à¦à¦•à§à¦¶à§‡ à¦‰à¦ªà¦¨à§à¦¯à¦¾à¦¸: à¦°à¦•à§à¦¤à§‡à¦° à¦†à¦–à¦°à§‡ à¦—à¦¾à¦à¦¥à¦¾ (Ekushey Novel 2026)',
    'book',
    'ekushey_6x9_trade',
    'Historical & cyber-noir novel set across 1952 Curzon Hall and 2026 Dhaka.',
    11100,
    75,
    true,
    '[{"id":"sec_1","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§§: à¦ªà¦²à¦¾à¦¶à§€ à¦¥à§‡à¦•à§‡ à¦•à¦¾à¦°à§à¦œà¦¨ à¦¹à¦²à§‡à¦° à¦®à¦¿à¦›à¦¿à¦²","wordCount":3200},{"id":"sec_2","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§¨: à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤à§‡à¦° à¦ªà§à¦°à¦¥à¦® à¦²à¦¿à¦¡ à¦Ÿà¦¾à¦‡à¦ª à¦ªà§à¦°à§‡à¦¸","wordCount":4100},{"id":"sec_3","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§©: à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦®à¦¾à¦¤à§ƒà¦­à¦¾à¦·à¦¾ à¦“ à¦­à§‹à¦°à§‡à¦° à¦†à¦²à§‹","wordCount":3800}]'::jsonb,
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
    'à¦¡. à¦¹à§à¦®à¦¾à§Ÿà§à¦¨ à¦•à¦¬à¦¿à¦°',
    'à¦…à¦®à¦° à¦à¦•à§à¦¶à§‡ à¦‰à¦ªà¦¨à§à¦¯à¦¾à¦¸: à¦°à¦•à§à¦¤à§‡à¦° à¦†à¦–à¦°à§‡ à¦—à¦¾à¦à¦¥à¦¾',
    'à§§à§¯à§«à§¨ à¦¥à§‡à¦•à§‡ à§¨à§¦à§¨à§¬ â€” à¦­à¦¾à¦·à¦¾à¦° à¦†à¦¤à§à¦®à¦®à¦°à§à¦¯à¦¾à¦¦à¦¾ à¦“ à¦¸à¦¾à¦‚à¦¸à§à¦•à§ƒà¦¤à¦¿à¦• à¦œà¦¾à¦—à¦°à¦£à§‡à¦° à¦®à¦¹à¦¾à¦•à¦¾à¦¬à§à¦¯à¦¿à¦• à¦†à¦–à§à¦¯à¦¾à¦¨',
    'à¦­à¦¾à¦·à¦¾à¦° à¦…à¦§à¦¿à¦•à¦¾à¦° à¦°à¦•à§à¦·à¦¾ à¦¥à§‡à¦•à§‡ à¦¶à§à¦°à§ à¦•à¦°à§‡ à¦†à¦§à§à¦¨à¦¿à¦• à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦®à¦¤à§à¦¬ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à§Ÿ à¦¨à¦¤à§à¦¨ à¦ªà§à¦°à¦œà¦¨à§à¦®à§‡à¦° à¦†à¦¤à§à¦®à¦¤à§à¦¯à¦¾à¦— à¦¨à¦¿à§Ÿà§‡ à¦°à¦šà¦¿à¦¤ à¦•à¦¾à¦²à¦œà§Ÿà§€ à¦‰à¦ªà¦¨à§à¦¯à¦¾à¦¸à¥¤',
    'à¦­à¦¾à¦·à¦¾à¦° à¦…à¦§à¦¿à¦•à¦¾à¦° à¦°à¦•à§à¦·à¦¾ à¦¥à§‡à¦•à§‡ à¦¶à§à¦°à§ à¦•à¦°à§‡ à¦†à¦§à§à¦¨à¦¿à¦• à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦®à¦¤à§à¦¬ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à§Ÿ à¦¨à¦¤à§à¦¨ à¦ªà§à¦°à¦œà¦¨à§à¦®à§‡à¦° à¦†à¦¤à§à¦®à¦¤à§à¦¯à¦¾à¦— à¦¨à¦¿à§Ÿà§‡ à¦°à¦šà¦¿à¦¤ à¦•à¦¾à¦²à¦œà§Ÿà§€ à¦‰à¦ªà¦¨à§à¦¯à¦¾à¦¸à¥¤',
    'bn',
    'Fiction',
    'Historical Fiction',
    '["à¦à¦•à§à¦¶à§‡ à¦¬à¦‡à¦®à§‡à¦²à¦¾","à¦­à¦¾à¦·à¦¾ à¦†à¦¨à§à¦¦à§‹à¦²à¦¨","à¦‰à¦ªà¦¨à§à¦¯à¦¾à¦¸"]'::jsonb,
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
    '[{"id":"ch1","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§§: à¦ªà¦²à¦¾à¦¶à§€ à¦¥à§‡à¦•à§‡ à¦•à¦¾à¦°à§à¦œà¦¨ à¦¹à¦²à§‡à¦° à¦®à¦¿à¦›à¦¿à¦²","wordCount":3200},{"id":"ch2","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§¨: à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤à§‡à¦° à¦ªà§à¦°à¦¥à¦® à¦²à¦¿à¦¡ à¦Ÿà¦¾à¦‡à¦ª à¦ªà§à¦°à§‡à¦¸","wordCount":4100},{"id":"ch3","title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§©: à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦®à¦¾à¦¤à§ƒà¦­à¦¾à¦·à¦¾ à¦“ à¦­à§‹à¦°à§‡à¦° à¦†à¦²à§‹","wordCount":3800}]'::jsonb
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
    'à¦¨à§à¦¸à¦°à¦¾à¦¤ à¦œà¦¾à¦¹à¦¾à¦¨',
    'à¦¶à§à¦°à¦¾à¦¬à¦£à§‡à¦° à¦®à§‡à¦˜ à¦“ à¦¨à§ˆà¦ƒà¦¶à¦¬à§à¦¦à§à¦¯: à¦¸à¦®à¦•à¦¾à¦²à§€à¦¨ à¦•à¦¬à¦¿à¦¤à¦¾',
    'à¦¨à¦¾à¦—à¦°à¦¿à¦• à¦¬à¦¿à¦·à¦¾à¦¦, à¦¬à§ƒà¦·à§à¦Ÿà¦¿ à¦“ à¦¨à¦¦à§€à¦®à¦¾à¦¤à§ƒà¦• à¦¬à¦¾à¦‚à¦²à¦¾à¦° à¦à¦•à¦¶à¦¤ à¦²à¦¿à¦°à¦¿à¦•à¦¾à¦² à¦•à¦¬à¦¿à¦¤à¦¾',
    'à¦¬à§ƒà¦·à§à¦Ÿà¦¿à¦­à§‡à¦œà¦¾ à¦¢à¦¾à¦•à¦¾ à¦¶à¦¹à¦°, à¦§à¦¾à¦¨à¦®à¦£à§à¦¡à¦¿ à¦²à§‡à¦•à§‡à¦° à¦…à¦ªà¦°à¦¾à¦¹à§à¦¨ à¦“ à¦¸à§à¦®à§ƒà¦¤à¦¿à¦° à¦•à§‹à¦²à¦¾à¦œ à¦¨à¦¿à§Ÿà§‡ à¦°à¦šà¦¿à¦¤ à¦à¦•à¦¶à¦¤ à¦®à¦¨à§‹à¦®à§à¦—à§à¦§à¦•à¦° à¦•à¦¬à¦¿à¦¤à¦¾ à¦¸à¦‚à¦•à¦²à¦¨à¥¤',
    'à¦¬à§ƒà¦·à§à¦Ÿà¦¿à¦­à§‡à¦œà¦¾ à¦¢à¦¾à¦•à¦¾ à¦¶à¦¹à¦°, à¦§à¦¾à¦¨à¦®à¦£à§à¦¡à¦¿ à¦²à§‡à¦•à§‡à¦° à¦…à¦ªà¦°à¦¾à¦¹à§à¦¨ à¦“ à¦¸à§à¦®à§ƒà¦¤à¦¿à¦° à¦•à§‹à¦²à¦¾à¦œ à¦¨à¦¿à§Ÿà§‡ à¦°à¦šà¦¿à¦¤ à¦à¦•à¦¶à¦¤ à¦®à¦¨à§‹à¦®à§à¦—à§à¦§à¦•à¦° à¦•à¦¬à¦¿à¦¤à¦¾ à¦¸à¦‚à¦•à¦²à¦¨à¥¤',
    'bn',
    'Poetry',
    'Contemporary Poetry',
    '["à¦•à¦¬à¦¿à¦¤à¦¾","à¦¶à§à¦°à¦¾à¦¬à¦£","à¦¢à¦¾à¦•à¦¾"]'::jsonb,
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
    '[{"id":"ch1","title":"à¦¸à§à¦¤à¦¬à¦• à§§: à¦¬à§ƒà¦·à§à¦Ÿà¦¿à¦° à¦¶à¦¬à§à¦¦ à¦“ à¦¨à¦¿à¦¸à§à¦¤à¦¬à§à¦§ à¦˜à¦°","wordCount":1800},{"id":"ch2","title":"à¦¸à§à¦¤à¦¬à¦• à§¨: à¦¬à§à§œà¦¿à¦—à¦™à§à¦—à¦¾à¦° à¦œà¦² à¦“ à¦…à¦šà§‡à¦¨à¦¾ à¦Ÿà§à¦°à¦²à¦¾à¦°","wordCount":2200}]'::jsonb
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
  ('ch_ekushey_01', 'amar-ekushey-novel', 1, 'à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§§: à¦ªà¦²à¦¾à¦¶à§€ à¦¥à§‡à¦•à§‡ à¦•à¦¾à¦°à§à¦œà¦¨ à¦¹à¦²à§‡à¦° à¦®à¦¿à¦›à¦¿à¦²', 'à§§à§¯à§«à§¨ à¦¸à¦¾à¦²à§‡à¦° à§¨à§§à¦¶à§‡ à¦«à§‡à¦¬à§à¦°à§à¦¯à¦¼à¦¾à¦°à¦¿ à¦¸à¦•à¦¾à¦²à¥¤ à¦•à¦¾à¦°à§à¦œà¦¨ à¦¹à¦²à§‡à¦° à¦¸à¦¾à¦®à¦¨à§‡à¦° à¦°à¦¾à¦œà¦ªà¦¥à§‡ à¦›à¦¾à¦¤à§à¦°à¦¦à§‡à¦° à¦®à¦¿à¦›à¦¿à¦² à¦“ à¦¸à§à¦²à§‹à¦—à¦¾à¦¨à§‡ à¦®à§à¦–à¦°à¦¿à¦¤ à¦†à¦•à¦¾à¦¶...', 3200, 'approved'),
  ('ch_ekushey_02', 'amar-ekushey-novel', 2, 'à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§¨: à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤à§‡à¦° à¦ªà§à¦°à¦¥à¦® à¦²à¦¿à¦¡ à¦Ÿà¦¾à¦‡à¦ª à¦ªà§à¦°à§‡à¦¸', 'à¦°à¦¾à¦¤ à¦—à¦­à§€à¦° à¦¹à¦²à§‡ à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤à§‡à¦° à¦ªà§à¦°à¦¨à§‹ à¦›à¦¾à¦ªà¦¾à¦–à¦¾à¦¨à¦¾à¦¯à¦¼ à¦¸à§€à¦¸à¦¾à¦° à¦¹à¦°à¦« à¦¸à¦¾à¦œà¦¿à¦¯à¦¼à§‡ à¦›à¦¾à¦ªà¦¾ à¦¹à¦¤à§‡ à¦¥à¦¾à¦•à§‡ à¦­à¦¾à¦·à¦¾ à¦†à¦¨à§à¦¦à§‹à¦²à¦¨à§‡à¦° à¦‡à¦¶à¦¤à§‡à¦¹à¦¾à¦°...', 4100, 'approved'),
  ('ch_ekushey_03', 'amar-ekushey-novel', 3, 'à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§©: à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦®à¦¾à¦¤à§ƒà¦­à¦¾à¦·à¦¾ à¦“ à¦­à§‹à¦°à§‡à¦° à¦†à¦²à§‹', 'à§¨à§¦à§¨à§¬ à¦¸à¦¾à¦²à§‡à¦° à¦¢à¦¾à¦•à¦¾à¥¤ à¦¬à¦¾à¦‚à¦²à¦¾ à¦­à¦¾à¦·à¦¾à¦° à¦§à§à¦¬à¦¨à¦¿ à¦“ à¦¸à¦¾à¦¹à¦¿à¦¤à§à¦¯à§‡à¦° à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦®à¦¤à§à¦¬ à¦°à¦•à§à¦·à¦¾à¦¯à¦¼ à¦¨à¦¤à§à¦¨ à¦ªà§à¦°à¦œà¦¨à§à¦®à§‡à¦° à¦…à¦­à¦¿à¦¯à¦¾à¦¤à§à¦°à¦¾...', 3800, 'approved')
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
SELECT 'usr_default', 'amar-ekushey-novel', 'à¦°à¦¾à¦¤ à¦¤à¦–à¦¨ à¦†à¦¡à¦¼à¦¾à¦‡à¦Ÿà¦¾à¥¤ à¦¢à¦¾à¦•à¦¾à¦° à¦°à¦¾à¦œà¦ªà¦¥ à¦§à§‹à¦à¦¯à¦¼à¦¾à¦Ÿà§‡ à¦¬à§ƒà¦·à§à¦Ÿà¦¿à¦° à¦šà¦¾à¦¦à¦°à§‡ à¦®à§‹à¦¡à¦¼à¦¾à¥¤ à¦¹à¦¿à¦®à§ à¦¹à¦²à§à¦¦ à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿ à¦ªà¦°à§‡ à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤à§‡à¦° à¦®à§‹à¦¡à¦¼à§‡ à¦¦à¦¾à¦à¦¡à¦¼à¦¿à¦¯à¦¼à§‡ à¦›à¦¾à¦ªà¦¾à¦–à¦¾à¦¨à¦¾à¦° à¦¶à¦¬à§à¦¦ à¦¶à§à¦¨à¦›à§‡à¥¤', 24
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
  'Welcome to Shothik AI â€” Deep-Tech Co-Founder & Literary Studio',
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
  ('usr_default', 'steadfast', true, 'stdfâ€¢â€¢â€¢â€¢901', 'connected', 14, 'Steadfast Courier BD Hub connected (64 districts SLA active)', NOW(), NOW()),
  ('usr_default', 'bkash', true, 'bkshâ€¢â€¢â€¢â€¢442', 'connected', 28, 'bKash Tokenized Checkout & TrxID Webhook active', NOW(), NOW()),
  ('usr_default', 'notion', true, 'ntn_â€¢â€¢â€¢â€¢88a', 'connected', 6, 'Synced 6 workspace PRDs and Story Bible notes into pgvector', NOW(), NOW())
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


-- =============================================================================
-- SHOTHIK AI â€” COMPLETE 70-TABLE POPULATION & DOMAIN RPC FUNCTIONS
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
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾ (Golden Bengal & AI)', 'book', 'ekushey-novel', 'Flagship Bangla non-fiction manuscript on sovereign AI transformation.', '# à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§§: à¦¸à§‚à¦šà¦¨à¦¾\n\nà¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿à¦° à¦¨à¦¤à§à¦¨ à¦¦à¦¿à¦—à¦¨à§à¦¤...', 4250, 35, true, 'private', 'main'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'usr_default', 'Dhaka FinTech Market Intelligence 2027', 'research', 'market-report', 'Deep research brief on MFS, bKash/Nagad velocity, and SME factoring.', '# Executive Summary\n\nMobile Financial Services in Bangladesh...', 2890, 80, true, 'private', 'main')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.channels (id, name, description, participant_type, category, status)
VALUES ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'bangla-ai-builders', 'Flagship channel for Bangla AI builders, authors, and OPC founders.', 'both', 'technology', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.publishing_books (id, user_id, project_id, title, subtitle, description, language, category, list_price, currency, status, target_word_count, author_name, genre, page_count, credit_price, cover_preset, rating, rating_count, synopsis)
VALUES ('book_ekushey_01', 'usr_default', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾', 'à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦® à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿à¦° à¦­à¦¬à¦¿à¦·à§à¦¯à§Ž', 'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦¶à¦¿à¦²à§à¦ª, à¦¸à¦¾à¦¹à¦¿à¦¤à§à¦¯ à¦“ à¦¬à¦¾à¦£à¦¿à¦œà§à¦¯à§‡ à¦à¦†à¦‡ à¦¬à¦¿à¦ªà§à¦²à¦¬à§‡à¦° à¦ªà§‚à¦°à§à¦£à¦¾à¦™à§à¦— à¦°à§‚à¦ªà¦°à§‡à¦–à¦¾à¥¤', 'bn', 'Technology', '350', 'BDT', 'published', 45000, 'à¦¡. à¦†à¦°à¦¿à¦« à¦°à¦¹à¦®à¦¾à¦¨', 'Non-Fiction', 210, 120, 'ekushey', 4.9, 42, 'à¦à¦•à§à¦¶à§‡ à¦¬à¦‡à¦®à§‡à¦²à¦¾ à¦¬à¦¿à¦¶à§‡à¦· à¦¸à¦‚à¦¸à§à¦•à¦°à¦£à¥¤')
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
  'à¦à¦•à§à¦¶à§‡ à¦¬à¦‡à¦®à§‡à¦²à¦¾ à§¨à§¦à§¨à§­: à¦à¦†à¦‡-à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦¯à¦¼ à¦¬à¦¾à¦‚à¦²à¦¾ à¦ªà¦¾à¦£à§à¦¡à§à¦²à¦¿à¦ªà¦¿ à¦¸à¦®à§à¦ªà¦¾à¦¦à¦¨à¦¾à¦° à¦¨à¦¤à§à¦¨ à¦®à¦¾à¦¨à¦¦à¦£à§à¦¡',
  'à¦†à¦®à¦°à¦¾ à¦¸à¦ à¦¿à¦• à¦à¦†à¦‡ à¦°à¦¾à¦‡à¦Ÿà¦¿à¦‚ à¦¸à§à¦Ÿà§à¦¡à¦¿à¦“à¦¤à§‡ à¦¸à¦¾à¦§à§ à¦“ à¦šà¦²à¦¿à¦¤ à¦°à§€à¦¤à¦¿à¦° à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼ à¦¸à¦¾à¦®à¦žà§à¦œà¦¸à§à¦¯ à¦à¦¬à¦‚ à¦¬à¦¾à¦¨à¦¾à¦¨ à¦¨à¦¿à¦°à§€à¦•à§à¦·à¦¾à¦° à¦¨à¦¤à§à¦¨ à¦‡à¦žà§à¦œà¦¿à¦¨ à¦¯à§à¦•à§à¦¤ à¦•à¦°à§‡à¦›à¦¿à¥¤ à¦†à¦ªà¦¨à¦¾à¦¦à§‡à¦° à¦®à¦¤à¦¾à¦®à¦¤ à¦œà¦¾à¦¨à¦¾à¦¨!',
  24,
  1
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (id, post_id, author_id, content, upvotes, downvotes)
VALUES (
  '22eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  'usr_default',
  'à¦…à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦‰à¦¦à§à¦¯à§‹à¦—! à¦¬à¦¿à¦¶à§‡à¦· à¦•à¦°à§‡ à¦¯à§à¦•à§à¦¤à¦¾à¦•à§à¦·à¦° à¦“ à¦«à¦¨à§‡à¦Ÿà¦¿à¦• à¦Ÿà¦¿à¦‰à¦¨à¦¾à¦° à¦«à¦¿à¦šà¦¾à¦°à¦Ÿà¦¿ à¦…à¦¡à¦¿à¦“à¦¬à§à¦• à¦¨à¦¿à¦°à§à¦®à¦¾à¦£à§‡ à¦¦à¦¾à¦°à§à¦£ à¦•à¦¾à¦œ à¦•à¦°à¦›à§‡à¥¤',
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
  '[{"bookId":"book_ekushey_01","title":"à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾","units":95,"royaltyBdt":28500}]'::jsonb
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
  'à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾',
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
  'à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾ (Golden Bengal & AI)',
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
  '# à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§§: à¦¸à§‚à¦šà¦¨à¦¾\n\nà¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿à¦° à¦¨à¦¤à§à¦¨ à¦¦à¦¿à¦—à¦¨à§à¦¤à§‡ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾ à¦à¦• à¦¯à§à¦—à¦¾à¦¨à§à¦¤à¦•à¦¾à¦°à§€ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦à¦¨à§‡à¦›à§‡à¥¤',
  true,
  '{"orthographyScore":99.4,"styleConsistency":"à¦šà¦²à¦¿à¦¤ à¦°à§€à¦¤à¦¿ (Standard Colloquial)","passedGate":true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.book_suite_manifests (id, project_id, user_id, module_type, state, version)
VALUES
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'story_bible', '{"characters":[{"name":"à¦†à¦°à¦¿à¦«","role":"à¦—à¦¬à§‡à¦·à¦•"}],"worldRules":["à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦® à¦¡à§‡à¦Ÿà¦¾ à¦¨à§€à¦¤à¦¿ à§¨à§¦à§¨à§­"]}'::jsonb, 1),
  ('44eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'usr_default', 'voice_casting', '{"narrator":"bn-BD-PradeepNeural","emotionProfile":"warm_documentary"}'::jsonb, 1)
ON CONFLICT (project_id, module_type) DO NOTHING;

INSERT INTO public.plagiarism_scans (id, scan_id, document_title, author_name, total_words, similarity_score_percent, ugc_compliant, audit_seal_sha256)
VALUES (
  1,
  'scan_ugc_20261107_01',
  'à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾ (Golden Bengal & AI)',
  'à¦¡. à¦†à¦°à¦¿à¦« à¦°à¦¹à¦®à¦¾à¦¨',
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
    'à¦¬à¦¾à¦‚à¦²à¦¾ à¦­à¦¾à¦·à¦¾ à¦“ à¦¸à¦¾à¦¹à¦¿à¦¤à§à¦¯à§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦ à¦¿à¦• à¦à¦†à¦‡-à¦à¦° à¦¹à¦¾à¦‡à¦¬à§à¦°à¦¿à¦¡ à¦°â€à§à¦¯à¦¾à¦— à¦‡à¦žà§à¦œà¦¿à¦¨ à¦²à§‡à¦–à¦• à¦“ à¦—à¦¬à§‡à¦·à¦•à¦¦à§‡à¦° à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦¤à¦¥à§à¦¯à¦¸à§‚à¦¤à§à¦° à¦¯à¦¾à¦šà¦¾à¦‡à¦¯à¦¼à§‡ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦•à¦°à§‡à¥¤',
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
  'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿à¦° à¦¨à¦¤à§à¦¨ à¦¦à¦¿à¦—à¦¨à§à¦¤à§‡ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾ à¦“ à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦® à¦•à§à¦²à¦¾à¦‰à¦¡ à¦…à¦¬à¦•à¦¾à¦ à¦¾à¦®à§‹à¥¤',
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
  '{"blocks":[{"type":"heading","text":"à¦à¦•à§à¦¶à§‡ à¦¬à¦‡à¦®à§‡à¦²à¦¾ à¦ªà§à¦°à¦•à¦¾à¦¶à¦¨à¦¾ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾"},{"type":"checklist","items":["à¦ªà§à¦°à¦šà§à¦›à¦¦ à¦šà§‚à¦¡à¦¼à¦¾à¦¨à§à¦¤à¦•à¦°à¦£","à¦†à¦‡à¦à¦¸à¦¬à¦¿à¦à¦¨ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨","à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤ à¦ªà§à¦°à¦¿à¦¨à§à¦Ÿ à¦…à¦°à§à¦¡à¦¾à¦°"]}]}'::jsonb,
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
  '{"protagonist":"à¦¡. à¦†à¦°à¦¿à¦« à¦°à¦¹à¦®à¦¾à¦¨","setting":"à¦¢à¦¾à¦•à¦¾ à§¨à§¦à§©à§«","themes":["à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦® à¦à¦†à¦‡","à¦¬à¦¾à¦‚à¦²à¦¾ à¦­à¦¾à¦·à¦¾ à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿"]}'::jsonb
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
  'Author prefers standard colloquial Bangla (à¦ªà§à¦°à¦®à¦¿à¦¤ à¦šà¦²à¦¿à¦¤ à¦°à§€à¦¤à¦¿) with English technical terms retained in parentheses on first mention.',
  '["à¦šà¦²à¦¿à¦¤ à¦°à§€à¦¤à¦¿","style-guide","bangla-orthography"]'::jsonb,
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
  '{"bookId":"book_ekushey_01","chapterIndex":3,"title":"à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à§©: à¦¸à¦¾à¦°à§à¦¬à¦­à§Œà¦® à¦­à¦¾à¦·à¦¾ à¦®à¦¡à§‡à¦²"}'::jsonb,
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
  'à¦…-à¦¤à§Žà¦¸à¦® à¦¶à¦¬à§à¦¦à§‡à¦° à¦¬à¦¾à¦¨à¦¾à¦¨à§‡ à¦‡-à¦•à¦¾à¦° à¦¬à§à¦¯à¦¬à¦¹à§ƒà¦¤ à¦¹à¦¬à§‡ à¦à¦¬à¦‚ à¦°à§‡à¦«à§‡à¦° à¦ªà¦° à¦¬à§à¦¯à¦žà§à¦œà¦¨à¦¬à¦°à§à¦£à§‡à¦° à¦¦à§à¦¬à¦¿à¦¤à§à¦¬ à¦¹à¦¬à§‡ à¦¨à¦¾à¥¤',
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
  'Monthly author royalty settlement for à¦¸à§‹à¦¨à¦¾à¦° à¦¬à¦¾à¦‚à¦²à¦¾ à¦“ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾',
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
  'à¦¤à¦¾à¦¨à¦­à§€à¦° à¦†à¦¹à¦®à§‡à¦¦ (Tanvir Ahmed)',
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
  'à¦¸à¦¾à¦¦à¦¿à¦¯à¦¼à¦¾ à¦‡à¦¸à¦²à¦¾à¦® (Sadia Islam)',
  '+8801911223344',
  'Dhaka',
  'Uttara Sector 7, Road 12, House 9, Dhaka-1230',
  650,
  60,
  'DELIVERED',
  'à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦¹à¦¯à¦¼à§‡à¦›à§‡',
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

