export interface InsforgeEnvSource {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  VITE_INSFORGE_URL?: string;
  VITE_INSFORGE_ANON_KEY?: string;
  NEXT_PUBLIC_INSFORGE_URL?: string;
  NEXT_PUBLIC_INSFORGE_ANON_KEY?: string;
}

const DEFAULT_SUPABASE_URL = "https://xgnzsikvguswhtozvokx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_pa1rLrMH8sLguAUhbTHfmw_wAcIY9hY";

/**
 * Pure resolver for browser-safe Supabase / InsForge config.
 * Prioritizes NEXT_PUBLIC_SUPABASE_* / VITE_SUPABASE_* then falls back to legacy InsForge vars or defaults.
 */
export function resolveInsforgePublicEnv(source: InsforgeEnvSource) {
  return {
    baseUrl:
      source.VITE_SUPABASE_URL ||
      source.NEXT_PUBLIC_SUPABASE_URL ||
      source.VITE_INSFORGE_URL ||
      source.NEXT_PUBLIC_INSFORGE_URL ||
      "",
    anonKey:
      source.VITE_SUPABASE_ANON_KEY ||
      source.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      source.VITE_INSFORGE_ANON_KEY ||
      source.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
      "",
  };
}

function readRuntimeEnv(): InsforgeEnvSource {
  let viteEnv: Record<string, string | undefined> = {};
  try {
    viteEnv =
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  } catch {
    viteEnv = {};
  }

  return {
    VITE_SUPABASE_URL: viteEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    VITE_INSFORGE_URL: viteEnv.VITE_INSFORGE_URL,
    VITE_INSFORGE_ANON_KEY: viteEnv.VITE_INSFORGE_ANON_KEY,
    NEXT_PUBLIC_INSFORGE_URL: process.env.NEXT_PUBLIC_INSFORGE_URL,
    NEXT_PUBLIC_INSFORGE_ANON_KEY: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  };
}

export function hasInsforgePublicConfig() {
  const { baseUrl, anonKey } = resolveInsforgePublicEnv(readRuntimeEnv());
  return Boolean(baseUrl && anonKey);
}

export function getInsforgePublicConfig() {
  const { baseUrl, anonKey } = resolveInsforgePublicEnv(readRuntimeEnv());

  if (!baseUrl) {
    throw new Error(
      "Missing required Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  }
  if (!anonKey) {
    throw new Error(
      "Missing required Supabase environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { baseUrl, anonKey };
}
