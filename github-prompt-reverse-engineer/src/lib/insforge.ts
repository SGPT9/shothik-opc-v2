import { createClient } from '@supabase/supabase-js';

// InsForge is built on Supabase — same URL, same anonKey, same API.
export const insforge = createClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ers8j28a.ap-southeast.insforge.app',
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''
);
