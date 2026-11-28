import { createClient } from "@supabase/supabase-js";
import { getInsforgePublicConfig } from "@/lib/insforge/config";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";

/**
 * Unified Supabase Server/Universal Client (migrated from @insforge/sdk/ssr).
 */
export async function createInsforgeServerClient() {
  const browser = getInsforgeBrowserClient();
  if (browser) return browser;

  const { baseUrl, anonKey } = getInsforgePublicConfig();
  return createClient(baseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
