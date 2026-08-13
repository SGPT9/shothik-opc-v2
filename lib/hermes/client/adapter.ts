import {
  HermesSession,
  HermesRun,
  HermesEventEnvelope,
  HermesEventEnvelopeSchema,
  RunControlAction,
} from "../contracts/core";

export interface CreateSessionParams {
  workspaceId: string;
  title?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface CreateRunParams {
  sessionId: string;
  workspaceId: string;
  domain?: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class HermesClientAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a new Hermes persistent session context via backend API.
   */
  async createSession(params: CreateSessionParams): Promise<HermesSession> {
    const res = await fetch(`${this.baseUrl}/api/hermes/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create session (${res.status})`);
    }

    const data = await res.json();
    return data.session;
  }

  /**
   * Fetches an existing Hermes session context by ID.
   */
  async getSession(sessionId: string): Promise<HermesSession> {
    const res = await fetch(`${this.baseUrl}/api/hermes/sessions/${sessionId}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch session '${sessionId}' (${res.status})`);
    }

    const data = await res.json();
    return data.session;
  }

  /**
   * Instantiates an execution run under a session context.
   */
  async createRun(params: CreateRunParams): Promise<{ run: HermesRun; streamUrl: string }> {
    const res = await fetch(`${this.baseUrl}/api/hermes/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create run (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Connects to the SSE event stream for a specific run.
   */
  subscribeToRunStream(
    runId: string,
    onEvent: (envelope: HermesEventEnvelope) => void,
    onError?: (err: Event) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/hermes/runs/${runId}`);

    eventSource.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        
        let parsed: { success: boolean; data?: HermesEventEnvelope; error?: any };

        if (HermesEventEnvelopeSchema && typeof HermesEventEnvelopeSchema.safeParse === "function") {
          try {
            const zResult = HermesEventEnvelopeSchema.safeParse(raw);
            parsed = { success: zResult.success, data: zResult.success ? zResult.data : undefined, error: zResult.success ? undefined : zResult.error };
          } catch {
            // Fallback to structural validation if Zod prototype is incomplete in client chunk
            const isEnvelope = Boolean(raw && typeof raw === "object" && raw.__hermes === true && raw.eventId && raw.eventType);
            parsed = { success: isEnvelope, data: isEnvelope ? (raw as HermesEventEnvelope) : undefined };
          }
        } else {
          const isEnvelope = Boolean(raw && typeof raw === "object" && raw.__hermes === true && raw.eventId && raw.eventType);
          parsed = { success: isEnvelope, data: isEnvelope ? (raw as HermesEventEnvelope) : undefined };
        }

        if (parsed.success && parsed.data) {
          onEvent(parsed.data);
        } else {
          console.warn("[HermesClientAdapter] Event envelope validation failed:", parsed.error || raw);
        }
      } catch (err) {
        console.error("[HermesClientAdapter] Error parsing event stream data:", err);
      }
    };

    if (onError) {
      eventSource.onerror = onError;
    }

    return () => {
      eventSource.close();
    };
  }

  /**
   * Sends control actions (pause, resume, cancel) to a running execution run.
   */
  async controlRun(
    runId: string,
    action: RunControlAction["action"],
    reason?: string
  ): Promise<{ run: HermesRun; actionApplied: string }> {
    const res = await fetch(`${this.baseUrl}/api/hermes/runs/${runId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to send control action '${action}' (${res.status})`);
    }

    return await res.json();
  }
}

export const defaultHermesAdapter = new HermesClientAdapter();
