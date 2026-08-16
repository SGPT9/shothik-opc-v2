import { useState, useRef, useCallback } from "react";

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (err: Error) => void;
  onThinking?: (thought: string) => void;
  onStep?: (step: {
    id: string;
    type: "think" | "mcp" | "code" | "plan" | "general";
    label: string;
    status: "running" | "completed" | "error";
    latencyMs?: number;
    detail?: string;
  }) => void;
  onTrace?: (trace: { stepId?: string; detail: string; timestamp: number }) => void;
  onArtifact?: (artifact: {
    type: "slides" | "sheet" | "research" | "code";
    title?: string;
    subtitle?: string;
    data?: unknown;
  }) => void;
  onCheckpoint?: (checkpoint: {
    checkpointId: string;
    actionSummary: string;
    reason: string;
    details?: string;
  }) => void;
}

export interface StreamTransport {
  sendStream(
    endpoint: string,
    payload: Record<string, unknown>,
    signal: AbortSignal,
    callbacks: StreamCallbacks
  ): Promise<void>;
}

export const defaultFetchTransport: StreamTransport = {
  async sendStream(endpoint, payload, signal, callbacks) {
    const { onChunk, onComplete, onError, onThinking, onStep, onTrace, onArtifact, onCheckpoint } = callbacks;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    if (!response.body) {
      throw new Error("No response body available for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") {
              onComplete();
              return;
            }

            try {
              const event = JSON.parse(dataStr);
              if (typeof event.token === "string") onChunk(event.token);
              if (typeof event.thinking === "string") onThinking?.(event.thinking);
              if (event.event === "assistant_step" && event.step) onStep?.(event.step);
              if (event.event === "trace_milestone") {
                onTrace?.({
                  stepId: event.stepId,
                  detail: event.detail || event.stdout_chunk || "",
                  timestamp: Date.now(),
                });
              }
              if (event.event === "artifact_produced") {
                onArtifact?.({
                  type: event.type || "sheet",
                  title: event.title,
                  data: event.data || event.output,
                });
              }
              if (event.event === "await_checkpoint") {
                onCheckpoint?.({
                  checkpointId: event.checkpointId,
                  actionSummary: event.actionSummary,
                  reason: event.reason,
                  details: event.details,
                });
              }
            } catch {
              onChunk(dataStr);
            }
          } else {
            onChunk(line);
          }
        }
      }
      onComplete();
    } finally {
      reader.releaseLock();
    }
  },
};

export interface StreamState {
  isStreaming: boolean;
  statusText: string;
  error: string | null;
}

export interface UseChatStreamEngineOptions {
  transport?: StreamTransport;
}

export function useChatStreamEngine(options?: UseChatStreamEngineOptions) {
  const transport = options?.transport ?? defaultFetchTransport;

  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    statusText: "",
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      endpoint: string,
      payload: Record<string, unknown>,
      onChunk: (text: string) => void,
      onComplete: () => void,
      onError: (err: Error) => void
    ) => {
      // Cleanup existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStreamState({
        isStreaming: true,
        statusText: "Connecting to AI Agent swarm…",
        error: null,
      });

      try {
        setStreamState({
          isStreaming: true,
          statusText: "Streaming response tokens…",
          error: null,
        });

        await transport.sendStream(endpoint, payload, controller.signal, {
          onChunk,
          onComplete: () => {
            setStreamState({
              isStreaming: false,
              statusText: "Response complete",
              error: null,
            });
            onComplete();
          },
          onError: (err) => {
            setStreamState({
              isStreaming: false,
              statusText: "Stream failed",
              error: err.message,
            });
            onError(err);
          },
        });
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError" || controller.signal.aborted) {
          setStreamState({
            isStreaming: false,
            statusText: "Stream cancelled",
            error: null,
          });
          return;
        }

        const errorObj = err instanceof Error ? err : new Error(String(err));
        setStreamState({
          isStreaming: false,
          statusText: "Stream failed",
          error: errorObj.message,
        });
        onError(errorObj);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [transport]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamState({
      isStreaming: false,
      statusText: "Stream stopped",
      error: null,
    });
  }, []);

  return {
    streamState,
    startStream,
    stopStream,
  };
}
