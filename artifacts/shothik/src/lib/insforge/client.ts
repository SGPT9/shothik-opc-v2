import { createClient } from "@insforge/sdk";
import { getInsforgePublicConfig, hasInsforgePublicConfig } from "./config";

type InsforgeClient = ReturnType<typeof createClient>;

let browserClient: InsforgeClient | null = null;

/** Singleton Insforge browser client; null when public config is missing. */
export function getInsforgeBrowserClient(): InsforgeClient | null {
  if (!hasInsforgePublicConfig()) return null;
  if (!browserClient) {
    const { baseUrl, anonKey } = getInsforgePublicConfig();
    browserClient = createClient({ baseUrl, anonKey });
  }
  return browserClient;
}

export function createBrowserClient(): InsforgeClient | null {
  return getInsforgeBrowserClient();
}

/** Server client is not applicable in the Vite SPA build. */
export function getInsforgeServerClient() {
  return null;
}
