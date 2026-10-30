import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getInsforgePublicConfig, hasInsforgePublicConfig } from "./config";

export type SupabaseBrowserClient = SupabaseClient;
export type InsforgeClient = SupabaseClient;

let browserClient: SupabaseClient | null = null;

/** Singleton Supabase browser client; null when public config is missing. */
export function getInsforgeBrowserClient(): SupabaseClient | null {
  if (!hasInsforgePublicConfig()) return null;
  if (!browserClient) {
    const { baseUrl, anonKey } = getInsforgePublicConfig();
    browserClient = createClient(baseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

export const getSupabaseBrowserClient = getInsforgeBrowserClient;

export function createBrowserClient(): SupabaseClient | null {
  return getInsforgeBrowserClient();
}

/** Server client is not applicable in the Vite SPA build. */
export function getInsforgeServerClient() {
  return null;
}
