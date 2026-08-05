/**
 * Client-side streaming utilities for agent chat.
 *
 * - Feature flag: `streaming_enabled` — env-driven (VITE_STREAMING_ENABLED),
 *   with an optional localStorage override so it can be toggled without a
 *   deploy. When off, the UI buffers the stream and renders the completed
 *   response as a single block.
 * - Event normalization: maps raw SSE payloads (legacy `type` events and
 *   canonical Hermes envelopes) to a small set of canonical client events:
 *   token / tool_call / status / error / done (+ conversation / message_start
 *   bookkeeping events).
 * - Friendly status labels: internal state names (queued/running/session/run)
 *   are never shown verbatim; they map to a single subtle label.
 */

export type ChatStreamEvent =
  | { kind: "token"; text: string }
  | { kind: "tool_call"; name?: string; detail?: string }
  | { kind: "status"; stage: ChatStreamStage; detail?: string }
  | { kind: "error"; message: string }
  | { kind: "done" }
  | { kind: "conversation"; conversationId: string }
  | { kind: "message_start"; messageId: string }
  | { kind: "ignored" };

export type ChatStreamStage =
  | "connecting"
  | "thinking"
  | "writing"
  | "reading_document"
  | "completed"
  | "cancelled"
  | "failed";

const STREAMING_FLAG_STORAGE_KEY = "streaming_enabled";

/**
 * Whether incremental streaming rendering is enabled.
 * Priority: localStorage override → VITE_STREAMING_ENABLED env → default on.
 */
export function isStreamingEnabled(): boolean {
  try {
    const override = localStorage.getItem(STREAMING_FLAG_STORAGE_KEY);
    if (override === "true") return true;
    if (override === "false") return false;
  } catch {
    // localStorage unavailable (SSR/privacy mode) — fall through to env.
  }
  const env = (import.meta as any).env?.VITE_STREAMING_ENABLED;
  if (typeof env === "string") return env !== "false" && env !== "0";
  return true;
}

/**
 * Map any raw/internal status text to a friendly, user-facing label.
 * Unknown or internal-sounding labels collapse to "Thinking…" so raw
 * backend state names never leak into the UI.
 */
export function friendlyStatusLabel(raw?: string | null): string {
  if (!raw) return "Thinking\u2026";
  const value = raw.toLowerCase();
  if (
    value.includes("fail") ||
    value.includes("error") ||
    value.includes("wrong")
  ) {
    return "Something went wrong";
  }
  if (value.includes("cancel") || value.includes("stop")) return "Stopped";
  if (value.includes("complet") || value.includes("done") || value.includes("ready")) {
    return "Done";
  }
  if (
    value.includes("ingest") ||
    value.includes("document") ||
    value.includes("upload")
  ) {
    return "Reading your document\u2026";
  }
  if (value.includes("draft") || value.includes("stream") || value.includes("writ")) {
    return "Writing\u2026";
  }
  // queued / running / session / run / spec / preparing / anything internal
  return "Thinking\u2026";
}

export function stageLabel(stage: ChatStreamStage): string {
  switch (stage) {
    case "writing":
      return "Writing\u2026";
    case "reading_document":
      return "Reading your document\u2026";
    case "completed":
      return "Done";
    case "cancelled":
      return "Stopped";
    case "failed":
      return "Something went wrong";
    case "connecting":
    case "thinking":
    default:
      return "Thinking\u2026";
  }
}

/**
 * Normalize a parsed SSE payload into canonical client events.
 * Handles both canonical Hermes envelopes (`__hermes: true`) and legacy
 * `type`-tagged events. A single payload can yield multiple events.
 */
export function normalizeStreamEvent(data: any): ChatStreamEvent[] {
  const events: ChatStreamEvent[] = [];

  if (data && data.__hermes) {
    switch (data.eventType) {
      case "session_created":
        events.push({ kind: "status", stage: "connecting" });
        break;
      case "run_started":
        events.push({ kind: "status", stage: "thinking" });
        break;
      case "progress_update":
        events.push({
          kind: "status",
          stage: "thinking",
          detail:
            typeof data.payload?.message === "string"
              ? data.payload.message
              : undefined,
        });
        break;
      case "tool_call":
      case "tool_call_started":
        events.push({
          kind: "tool_call",
          name:
            typeof data.payload?.tool === "string"
              ? data.payload.tool
              : undefined,
        });
        break;
      case "run_completed":
        events.push({ kind: "status", stage: "completed" });
        break;
      case "run_cancelled":
        events.push({ kind: "status", stage: "cancelled" });
        break;
      case "run_failed":
        events.push({
          kind: "error",
          message:
            typeof data.payload?.message === "string"
              ? data.payload.message
              : "The response could not be completed.",
        });
        break;
      case "document_ingestion_started":
      case "document_ingestion_progress":
        events.push({ kind: "status", stage: "reading_document" });
        break;
      case "document_ingestion_completed":
        events.push({
          kind: "status",
          stage:
            data.payload?.status === "completed" ? "thinking" : "failed",
        });
        break;
      default:
        events.push({ kind: "ignored" });
    }
    return events;
  }

  switch (data?.type) {
    case "chunk":
      if (typeof data.content === "string" && data.content) {
        events.push({ kind: "token", text: data.content });
      }
      break;
    case "conversation":
      if (data.conversationId) {
        events.push({ kind: "conversation", conversationId: data.conversationId });
      }
      break;
    case "message_start":
      if (data.messageId) {
        events.push({ kind: "message_start", messageId: data.messageId });
      }
      break;
    case "status":
      events.push({ kind: "status", stage: "thinking", detail: data.message });
      break;
    case "error":
      events.push({
        kind: "error",
        message:
          typeof data.error === "string" && data.error
            ? data.error
            : "The response could not be completed.",
      });
      break;
    case "done":
      events.push({ kind: "done" });
      break;
    default:
      events.push({ kind: "ignored" });
  }
  return events;
}
