"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getInsforgePublicConfig } from "@/lib/insforge/config";

let browserClient: SupabaseClient | null = null;

export function getInsforgeBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { baseUrl, anonKey } = getInsforgePublicConfig();
    browserClient = createClient(baseUrl, anonKey);
  }

  return browserClient;
}

export const getInsforgeClient = getInsforgeBrowserClient;
