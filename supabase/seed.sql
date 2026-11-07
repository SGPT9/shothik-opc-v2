-- =============================================================================
-- Shothik AI v2 — Deterministic Local Supabase Seed (supabase/seed.sql)
-- Idempotent seed data for Local Development & E2E Testing
-- =============================================================================

-- 1. Default Demo User Profile, Starter Credits & Pro Subscription
INSERT INTO public.user_profiles (id, email, name, tier, role)
VALUES ('usr_default', 'demo@shothik.ai', 'Shothik Demo Author', 'pro', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_credits (user_id, balance, lifetime_earned, lifetime_spent)
VALUES ('usr_default', 5000, 5000, 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_subscriptions (user_id, tier, status, interval)
VALUES ('usr_default', 'pro', 'active', 'month')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Default Community Channels
INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'general', 'General Bangla AI & Literary Discussion', 'both', 'general', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'general');

INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'showcase', 'Amar Ekushey & Webnovel Manuscript Showcase', 'both', 'creative', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'showcase');

INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'help', 'Writing Studio, Twin & Commerce Support', 'both', 'support', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'help');

-- 3. Default Digital Twin Profile
INSERT INTO public.twin_profiles (
  id, master_id, name, specialization, persona, bio, training_status, knowledge_score, is_active, lifecycle_state, trust_score
)
VALUES (
  'twin_default_shothik',
  'usr_default',
  'Shothik Second-Me Twin',
  'Bangla Literary & Commerce Architect',
  'Empathetic, observant, bilingual Dhaka literary & OPC strategist.',
  'Autonomous digital clone trained on Bangla manuscripts and OPC workflows.',
  'ready',
  96,
  true,
  'active',
  100
)
ON CONFLICT (id) DO NOTHING;

-- 4. Default Inventory Matrix SKUs
INSERT INTO public.inventory_items (
  sku, name, category, total_stock, daraz_stock, shopify_stock, woocommerce_stock, whatsapp_stock, dark_hub_reserve, unit_cost_bdt, unit_price_bdt, supplier_name, lead_time_days
)
VALUES
  ('SHOTHIK-TSHIRT-BLK-M', 'Premium Cotton Knitted T-Shirt (Black, M)', 'Apparel', 320, 100, 80, 40, 60, 40, 280.00, 650.00, 'Babu Bazar Knitwear Ltd', 7),
  ('SHOTHIK-BAG-LTH-01', 'Artisan Leather Office Messenger Bag', 'Leather Goods', 45, 15, 12, 8, 5, 5, 1850.00, 3800.00, 'Hazaribagh Leather Craft', 14),
  ('SHOTHIK-SMART-CHG-65W', 'GaN Fast Charger 65W Dual USB-C', 'Electronics', 18, 8, 4, 2, 2, 2, 750.00, 1650.00, 'Stadium Market Electronics', 10)
ON CONFLICT (sku) DO NOTHING;
