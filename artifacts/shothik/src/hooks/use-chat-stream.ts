"use client";

/**
 * use-chat-stream.ts
 *
 * React hook that opens a chat SSE connection, runs every line through the
 * canonical stream-normalizer, and exposes a clean streaming state object.
 *
 * Features
 *  - Respects STREAMING_ENABLED flag (buffers all tokens when false)
 *  - AbortController lifecycle: cleans up on unmount, conversation-switch, or re-send
 *  - Cancels an in-flight stream before opening a new one
 *  - Exposes `abort()` so the Composer Stop button and sidebar nav can tear down cleanly
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeSseStream, type StreamEvent } from "@/lib/chat/stream-normalizer";
import { STREAMING_ENABLED } from "@/lib/config/streaming-flag";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ChatStreamState {
  /** Token text accumulated so far for the in-flight message. Empty when idle. */
  partialText: string;
  /** Friendly pre-token status label ("Thinking…", "Searching…", etc.) Empty once tokens arrive. */
  statusLabel: string;
  /** True while the stream is open and hasn't received a done/error event yet. */
  isStreaming: boolean;
  /** Set when the stream ends with an error event. */
  error: { message: string; recoverable: boolean } | null;
  /** Tool call events received during this turn (for ChainOfThought / reasoning display). */
  toolCalls: Array<{ name: string; args?: unknown }>;
}

export interface UseChatStreamOptions {
  /** Called with each canonical event as it arrives. */
  onEvent?: (event: StreamEvent) => void;
  /** Called once when the stream ends (done or error). */
  onDone?: (finalText: string) => void;
  /** Called on error event. */
  onError?: (message: string, recoverable: boolean) => void;
}

export interface UseChatStreamResult extends ChatStreamState {
  /**
   * Open a new SSE stream at the given fetch `Request`.
   * If a stream is already open it is aborted first.
   */
  stream: (request: Request | string | URL, init?: RequestInit) => void;
  /** Abort the current stream (no-op when idle). */
  abort: () => void;
  /** Reset state to initial (idle) — useful when switching conversations. */
  reset: () => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL: ChatStreamState = {
  partialText: "",
  statusLabel: "",
  isStreaming: false,
  error: null,
  toolCalls: [],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatStream(options?: UseChatStreamOptions): UseChatStreamResult {
  const [state, setState] = useState<ChatStreamState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const stream = useCallback((input: Request | string | URL, init?: RequestInit) => {
    // Cancel any previous in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...INITIAL, isStreaming: true, statusLabel: "Thinking…" });

    (async () => {
      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const errorText = await response.text().catch(() => "Request failed");
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            statusLabel: "",
            error: { message: errorText, recoverable: true },
          }));
          optionsRef.current?.onError?.(errorText, true);
          return;
        }

        // ── Non-streaming (flag off) — buffer entire body ─────────────────
        if (!STREAMING_ENABLED) {
          const text = await response.text();
          // Try to extract text from a JSON body
          let finalText = text;
          try {
            const json = JSON.parse(text) as { content?: string; text?: string; message?: string };
            finalText = json.content ?? json.text ?? json.message ?? text;
          } catch {
            // plain text — use as-is
          }
          setState({
            partialText: finalText,
            statusLabel: "",
            isStreaming: false,
            error: null,
            toolCalls: [],
          });
          optionsRef.current?.onDone?.(finalText);
          return;
        }

        // ── Streaming — consume SSE ───────────────────────────────────────
        let accumulatedText = "";
        const toolCalls: Array<{ name: string; args?: unknown }> = [];

        for await (const event of normalizeSseStream(response.body, controller.signal)) {
          optionsRef.current?.onEvent?.(event);

          if (event.type === "token") {
            accumulatedText += event.text;
            setState((prev) => ({
              ...prev,
              partialText: accumulatedText,
              statusLabel: "", // clear status once tokens arrive
            }));
          } else if (event.type === "status") {
            setState((prev) =>
              // Only show status label if no tokens yet
              prev.partialText ? prev : { ...prev, statusLabel: event.label }
            );
          } else if (event.type === "tool_call") {
            toolCalls.push({ name: event.name, args: event.args });
            setState((prev) => ({ ...prev, toolCalls: [...toolCalls] }));
          } else if (event.type === "error") {
            setState((prev) => ({
              ...prev,
              isStreaming: false,
              statusLabel: "",
              error: { message: event.message, recoverable: event.recoverable },
            }));
            optionsRef.current?.onError?.(event.message, event.recoverable);
            return;
          } else if (event.type === "done") {
            break;
          }
        }

        setState((prev) => ({
          ...prev,
          isStreaming: false,
          statusLabel: "",
        }));
        optionsRef.current?.onDone?.(accumulatedText);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          // Intentional abort — reset to idle
          setState(INITIAL);
          return;
        }
        const message = err instanceof Error ? err.message : "Stream interrupted";
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          statusLabel: "",
          error: { message, recoverable: true },
        }));
        optionsRef.current?.onError?.(message, true);
      }
    })();
  }, []);

  return { ...state, stream, abort, reset };
}
