-- =============================================================================
-- Shothik AI / Supabase Local & Cloud Seed File
-- File: supabase/seed.sql
-- =============================================================================

INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'Architecture & AST Graph', 'Deep-tech engineering discussions on Gortex AST, CRDTs, and multi-agent systems.', 'both', 'Architecture', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'Architecture & AST Graph');

INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'Bangla Literary & Novel Guild', 'Collaborative novel writing, Boi Mela publishing, and Bengali dialect styling.', 'both', 'Literature', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'Bangla Literary & Novel Guild');

INSERT INTO public.channels (name, description, participant_type, category, status)
SELECT 'Autonomous Commerce & Logistics', 'Steadfast, Pathao, bKash MFS reconciliation, and NBR statutory compliance.', 'both', 'Commerce', 'open'
WHERE NOT EXISTS (SELECT 1 FROM public.channels WHERE name = 'Autonomous Commerce & Logistics');
