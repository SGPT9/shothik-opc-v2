/**
 * Client for the Hermes run-control endpoint:
 *   POST /api/hermes/runs/[runId]  { action: "pause" | "resume" | "cancel" }
 *
 * Used by the chat UI to make the kill switch a real server-side cancel
 * (instead of only aborting the local fetch) and to pause/resume a run.
 * Guest access is authorized via the `x-chat-device-id` header.
 */
import { guestChatHeaders } from "./guest-device-id";

export type HermesRunAction = "pause" | "resume" | "cancel";

export interface RunControlResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function controlHermesRun(
  runId: string,
  action: HermesRunAction,
  options?: { signal?: AbortSignal },
): Promise<RunControlResult> {
  try {
    const response = await fetch(`/api/hermes/runs/${encodeURIComponent(runId)}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...guestChatHeaders() },
      body: JSON.stringify({ action }),
      signal: options?.signal,
    });
    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      return {
        ok: false,
        status: response.status,
        error: json?.error || `Run ${action} failed with status ${response.status}`,
      };
    }
    return { ok: true, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : `Run ${action} failed`,
    };
  }
}
