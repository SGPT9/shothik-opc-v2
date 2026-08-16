/**
 * StreamTransport — Injectable Transport Adapter Interface for Chat & Agent Streams.
 *
 * Implements the "Accept dependencies, don't create them" architectural seam:
 * - Decouples UI streaming state from underlying HTTP/2 SSE, WebSockets, or In-Memory test fakes.
 * - Dispatches strongly-typed discrete events (tokens, assistant steps, traces, artifacts, checkpoints).
 * - Enables 100% deterministic unit testing with Vitest without network mocks.
 */

export interface StreamStepEvent {
  id: string;
  type: "think" | "mcp" | "code" | "plan" | "general";
  label: string;
  status: "running" | "completed" | "error";
  latencyMs?: number;
  detail?: string;
}

export interface StreamTraceEvent {
  stepId?: string;
  detail: string;
  timestamp: number;
}

export interface StreamArtifactEvent {
  type: "slides" | "sheet" | "research" | "code";
  title?: string;
  subtitle?: string;
  data?: unknown;
}

export interface StreamCheckpointEvent {
  checkpointId: string;
  actionSummary: string;
  reason: string;
  details?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onThinking?: (thought: string) => void;
  onStep?: (step: StreamStepEvent) => void;
  onTrace?: (trace: StreamTraceEvent) => void;
  onArtifact?: (artifact: StreamArtifactEvent) => void;
  onCheckpoint?: (checkpoint: StreamCheckpointEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface StreamPayload {
  message: string;
  conversationId: string;
  model?: string;
  persona?: string;
  attachments?: string[];
  context?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface StreamTransport {
  executeStream(payload: StreamPayload, callbacks: StreamCallbacks): Promise<void>;
  abort(): void;
}

/**
 * Default HTTP/2 SSE StreamTransport implementation.
 */
export class FetchStreamTransport implements StreamTransport {
  private abortController: AbortController | null = null;
  private endpoint: string;

  constructor(endpoint: string = "/api/chat/stream") {
    this.endpoint = endpoint;
  }

  public async executeStream(payload: StreamPayload, callbacks: StreamCallbacks): Promise<void> {
    this.abortController = new AbortController();
    const signal = payload.signal || this.abortController.signal;

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: payload.message,
          conversationId: payload.conversationId,
          model: payload.model || "gemini-3.7-flash",
          persona: payload.persona || "cofounder",
          attachments: payload.attachments,
          context: payload.context,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported by server response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              callbacks.onComplete?.();
              return;
            }

            try {
              const event = JSON.parse(dataStr);
              this.dispatchEvent(event, callbacks);
            } catch {
              // Plain text token fallback
              callbacks.onToken(dataStr);
            }
          }
        }
      }

      callbacks.onComplete?.();
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private dispatchEvent(event: Record<string, unknown>, callbacks: StreamCallbacks): void {
    if (typeof event.token === "string") {
      callbacks.onToken(event.token);
    }
    if (typeof event.thinking === "string") {
      callbacks.onThinking?.(event.thinking);
    }
    if (event.event === "assistant_step" && typeof event.step === "object" && event.step !== null) {
      callbacks.onStep?.(event.step as StreamStepEvent);
    }
    if (event.event === "trace_milestone") {
      callbacks.onTrace?.({
        stepId: event.stepId as string | undefined,
        detail: (event.detail || event.stdout_chunk || "") as string,
        timestamp: Date.now(),
      });
    }
    if (event.event === "artifact_produced") {
      callbacks.onArtifact?.({
        type: (event.type || "sheet") as any,
        title: event.title as string | undefined,
        data: event.data || event.output,
      });
    }
    if (event.event === "await_checkpoint") {
      callbacks.onCheckpoint?.({
        checkpointId: event.checkpointId as string,
        actionSummary: event.actionSummary as string,
        reason: event.reason as string,
        details: event.details as string | undefined,
      });
    }
  }
}

/**
 * In-Memory Mock StreamTransport for 100% deterministic unit testing.
 */
export class MockStreamTransport implements StreamTransport {
  public mockEvents: Array<{ type: string; payload: unknown }> = [];
  public isAborted = false;

  constructor(mockEvents: Array<{ type: string; payload: unknown }> = []) {
    this.mockEvents = mockEvents;
  }

  public async executeStream(_payload: StreamPayload, callbacks: StreamCallbacks): Promise<void> {
    this.isAborted = false;

    for (const item of this.mockEvents) {
      if (this.isAborted) break;

      switch (item.type) {
        case "token":
          callbacks.onToken(item.payload as string);
          break;
        case "thinking":
          callbacks.onThinking?.(item.payload as string);
          break;
        case "step":
          callbacks.onStep?.(item.payload as StreamStepEvent);
          break;
        case "trace":
          callbacks.onTrace?.(item.payload as StreamTraceEvent);
          break;
        case "artifact":
          callbacks.onArtifact?.(item.payload as StreamArtifactEvent);
          break;
        case "checkpoint":
          callbacks.onCheckpoint?.(item.payload as StreamCheckpointEvent);
          break;
        case "error":
          callbacks.onError?.(new Error(item.payload as string));
          return;
      }
    }

    if (!this.isAborted) {
      callbacks.onComplete?.();
    }
  }

  public abort(): void {
    this.isAborted = true;
  }
}
