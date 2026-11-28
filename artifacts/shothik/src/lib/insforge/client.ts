import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getInsforgePublicConfig, hasInsforgePublicConfig } from "./config";
import type { Database } from "./database.types";

export type { Database };
export type SupabaseBrowserClient = SupabaseClient<Database>;
export type InsforgeClient = SupabaseClient<Database>;

let browserClient: SupabaseClient<Database> | null = null;

/** Singleton Supabase browser client; null when public config is missing. */
export function getInsforgeBrowserClient(): SupabaseClient<Database> | null {
  if (!hasInsforgePublicConfig()) return null;
  if (!browserClient) {
    const { baseUrl, anonKey } = getInsforgePublicConfig();
    browserClient = createClient<Database>(baseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

export const getSupabaseBrowserClient = getInsforgeBrowserClient;

export function createBrowserClient(): SupabaseClient<Database> | null {
  return getInsforgeBrowserClient();
}

/** Server client is not applicable in the Vite SPA build. */
export function getInsforgeServerClient() {
  return null;
}
