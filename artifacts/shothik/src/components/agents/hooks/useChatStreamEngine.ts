import { useState, useRef, useCallback } from "react";

export interface StreamState {
  isStreaming: boolean;
  statusText: string;
  error: string | null;
}

export function useChatStreamEngine() {
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
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        if (!response.body) {
          throw new Error("No response body available for streaming");
        }

        setStreamState({
          isStreaming: true,
          statusText: "Streaming response tokens…",
          error: null,
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }

        setStreamState({
          isStreaming: false,
          statusText: "Response complete",
          error: null,
        });
        onComplete();
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
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
        abortControllerRef.current = null;
      }
    },
    []
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
