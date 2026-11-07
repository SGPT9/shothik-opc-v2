import { useEffect } from "react";
import { useTranslation } from "./index";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";

/**
 * Hydrates user locale from Supabase `public.user_preferences`.
 * Retains `useLoadConvexLocale` export alias for backward compatibility.
 */
export function useLoadSupabaseLocale(userId: string | null | undefined) {
  const { setLocale } = useTranslation();

  useEffect(() => {
    if (!userId) return;
    let active = true;
    async function load() {
      try {
        const client = getInsforgeBrowserClient();
        const { data } = await (client as any)
          .from("user_preferences")
          .select("locale")
          .eq("user_id", userId)
          .maybeSingle();
        if (active && data?.locale) {
          setLocale(data.locale);
        }
      } catch {
        // Offline / unconfigured fallback
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [userId, setLocale]);
}

export const useLoadConvexLocale = useLoadSupabaseLocale;
