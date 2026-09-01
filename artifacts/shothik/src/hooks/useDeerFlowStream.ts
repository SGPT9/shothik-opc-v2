import { useState, useCallback, useRef } from "react";

export interface DeerFlowEvent {
  event: "start" | "node_start" | "node_end" | "token" | "tool_start" | "tool_end" | "slide_generated" | "sheet_updated" | "complete" | "error";
  node?: string;
  agent?: string;
  tool?: string;
  content?: string;
  data?: any;
  timestamp?: number;
}

export interface UseDeerFlowStreamOptions {
  onToken?: (token: string) => void;
  onEvent?: (event: DeerFlowEvent) => void;
  onSlideGenerated?: (slideData: any) => void;
  onSheetUpdated?: (sheetData: any) => void;
  onComplete?: (finalOutput: string) => void;
  onError?: (error: Error) => void;
}

export interface DeerFlowStreamState {
  isStreaming: boolean;
  activeNode: string | null;
  activeAgent: string | null;
  activeTool: string | null;
  streamedText: string;
  events: DeerFlowEvent[];
  slides: any[];
  sheetData: any | null;
  error: string | null;
  /** Set when an overnight job is enqueued — use to poll /api/tonight-engine/status */
  overnightRunId: string | null;
  overnightStatusUrl: string | null;
  overnightEstimatedCompletion: string | null;
  overnightModelLabel: string | null;
}

export function useDeerFlowStream(options: UseDeerFlowStreamOptions = {}) {
  const [state, setState] = useState<DeerFlowStreamState>({
    isStreaming: false,
    activeNode: null,
    activeAgent: null,
    activeTool: null,
    streamedText: "",
    events: [],
    slides: [],
    sheetData: null,
    error: null,
    overnightRunId: null,
    overnightStatusUrl: null,
    overnightEstimatedCompletion: null,
    overnightModelLabel: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      prompt: string,
      taskType: "deep_research" | "slide_generation" | "sheet_analysis" | "code_generation" | "overnight_deepthink" | "general" = "general",
      metadata: Record<string, any> = {}
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({
        isStreaming: true,
        activeNode: "initializing",
        activeAgent: "LeadAgent",
        activeTool: null,
        streamedText: "",
        events: [],
        slides: [],
        sheetData: null,
        error: null,
        overnightRunId: null,
        overnightStatusUrl: null,
        overnightEstimatedCompletion: null,
        overnightModelLabel: null,
      });

      try {
        // ── Overnight tasks: enqueue via Tonight Engine, don't stream inline ──
        if (taskType === "overnight_deepthink") {
          const enqueueRes = await fetch("/api/tonight-engine/enqueue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: metadata.workspaceId ?? "default-workspace",
              prompt,
              depth: (metadata.depth as string) ?? "standard",
              attachmentUrls: metadata.attachmentUrls ?? [],
              notifyOnComplete: metadata.notifyOnComplete ?? false,
            }),
            signal: controller.signal,
          });

          if (!enqueueRes.ok) {
            const errData = await enqueueRes.json().catch(() => ({}));
            throw new Error(
              (errData as any).message ?? `Overnight enqueue failed (${enqueueRes.status})`
            );
          }

          const { data } = await enqueueRes.json();
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            activeNode: "overnight_queued",
            activeAgent: "TonightEngine",
            overnightRunId: data.runId ?? null,
            overnightStatusUrl: data.statusUrl ?? null,
            overnightEstimatedCompletion: data.estimatedCompletion ?? null,
            overnightModelLabel: data.modelLabel ?? null,
          }));
          options.onComplete?.(data.runId ?? "");
          return;
        }

        // ── All other tasks: standard SSE stream ──
        const response = await fetch("/api/langgraph/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            task_type: taskType,
            metadata,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`DeerFlow stream failed with status ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body received from DeerFlow stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;

            const isDataLine = trimmed.startsWith("data:") || trimmed.startsWith("data: ");
            if (isDataLine) {
              const dataStr = trimmed.startsWith("data: ")
                ? trimmed.slice(6).trim()
                : trimmed.slice(5).trim();

              if (dataStr === "[DONE]") continue;

              try {
                const event: DeerFlowEvent = JSON.parse(dataStr);
                options.onEvent?.(event);

                setState((prev) => {
                  const updatedEvents = [...prev.events, event];
                  let nextText = prev.streamedText;
                  let nextSlides = prev.slides;
                  let nextSheet = prev.sheetData;

                  if (event.event === "token" && event.content) {
                    nextText += event.content;
                    accumulatedText += event.content;
                    options.onToken?.(event.content);
                  }

                  if (event.event === "slide_generated" && event.data) {
                    nextSlides = [...prev.slides, event.data];
                    options.onSlideGenerated?.(event.data);
                  }

                  if (event.event === "sheet_updated" && event.data) {
                    nextSheet = event.data;
                    options.onSheetUpdated?.(event.data);
                  }

                  return {
                    ...prev,
                    activeNode: event.node ?? prev.activeNode,
                    activeAgent: event.agent ?? prev.activeAgent,
                    activeTool: event.tool ?? prev.activeTool,
                    streamedText: nextText,
                    events: updatedEvents,
                    slides: nextSlides,
                    sheetData: nextSheet,
                  };
                });
              } catch {
                // If chunk is raw text token rather than JSON event
                accumulatedText += dataStr;
                options.onToken?.(dataStr);
                setState((prev) => ({
                  ...prev,
                  streamedText: prev.streamedText + dataStr,
                }));
              }
            }
          }
        }

        setState((prev) => ({
          ...prev,
          isStreaming: false,
          activeNode: "completed",
        }));
        options.onComplete?.(accumulatedText);
      } catch (err: any) {
        if (err.name === "AbortError") {
          setState((prev) => ({ ...prev, isStreaming: false }));
          return;
        }

        const errorObj = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: errorObj.message,
        }));
        options.onError?.(errorObj);
      }
    },
    [options]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
  };
}
