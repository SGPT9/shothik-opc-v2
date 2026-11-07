import { useCallback } from "react";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";

/**
 * Syncs user locale preference to Supabase `public.user_preferences`.
 * Retains `useSyncLocaleToConvex` export alias for backward compatibility.
 */
export function useSyncLocaleToSupabase() {
  return useCallback(async (userId: string, locale: string) => {
    if (!userId || !locale) return;
    try {
      const client = getInsforgeBrowserClient();
      await (client as any).from("user_preferences").upsert(
        {
          user_id: userId,
          locale,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    } catch {
      // Offline / unconfigured fallback — localStorage is already updated by i18n provider
    }
  }, []);
}

export const useSyncLocaleToConvex = useSyncLocaleToSupabase;
