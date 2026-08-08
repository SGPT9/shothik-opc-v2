export interface InsforgeEnvSource {
  VITE_INSFORGE_URL?: string;
  VITE_INSFORGE_ANON_KEY?: string;
  NEXT_PUBLIC_INSFORGE_URL?: string;
  NEXT_PUBLIC_INSFORGE_ANON_KEY?: string;
}

/**
 * Pure resolver for browser-safe Insforge config. Two sources, in order:
 * 1. `VITE_INSFORGE_*` — Vite's native `import.meta.env` exposure.
 * 2. `NEXT_PUBLIC_INSFORGE_*` — statically inlined by the `define` block in
 *    vite.config.ts (legacy Next-style names).
 * Server-side keys (e.g. INSFORGE_API_KEY) are intentionally never consulted.
 */
export function resolveInsforgePublicEnv(source: InsforgeEnvSource) {
  return {
    baseUrl: source.VITE_INSFORGE_URL || source.NEXT_PUBLIC_INSFORGE_URL || "",
    anonKey: source.VITE_INSFORGE_ANON_KEY || source.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
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
    VITE_INSFORGE_URL: viteEnv.VITE_INSFORGE_URL,
    VITE_INSFORGE_ANON_KEY: viteEnv.VITE_INSFORGE_ANON_KEY,
    // These two are replaced with string literals at build time by vite `define`.
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
      "Missing required InsForge environment variable: VITE_INSFORGE_URL (or NEXT_PUBLIC_INSFORGE_URL)",
    );
  }
  if (!anonKey) {
    throw new Error(
      "Missing required InsForge environment variable: VITE_INSFORGE_ANON_KEY (or NEXT_PUBLIC_INSFORGE_ANON_KEY)",
    );
  }

  return { baseUrl, anonKey };
}
