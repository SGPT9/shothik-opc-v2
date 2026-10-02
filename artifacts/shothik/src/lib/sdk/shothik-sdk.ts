/**
 * Shothik Platform Frontend SDK
 * Typed client configured for browser environments.
 */

export * from "../../../../api-server/src/lib/client/shothik-sdk";
import { createShothikClient, ShothikClient } from "../../../../api-server/src/lib/client/shothik-sdk";

let defaultClient: ShothikClient | null = null;

export function getShothikClient(): ShothikClient {
  if (!defaultClient) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    defaultClient = createShothikClient({ baseUrl });
  }
  return defaultClient;
}
