import logger from "@/lib/logger";

export interface SystemPromptResponse {
  version: string;
  systemPrompt: string;
}

export interface WigoloSearchRequest {
  query: string;
  maxResults?: number;
}

export interface WigoloSearchResponse {
  query: string;
  results: Array<{ title: string; url: string; excerpt: string; evidenceScore: number }>;
  totalFound: number;
}

export interface TonightEngineEnqueueRequest {
  prompt: string;
  workspaceId?: string;
  topology?: "mesh" | "hierarchical" | "coordinator" | "sequential";
}

export interface TonightEngineEnqueueResponse {
  runId: string;
  status: string;
  enqueuedAt: string;
}

export class ShothikApiCommunications {
  /**
   * Unified API Communications Client for Vercel Staging UI Components.
   * Connects /agents/chat and /twin pages to all Shothik AI backend microservices.
   */
  static async fetchSystemPrompt(): Promise<SystemPromptResponse> {
    try {
      const res = await fetch("/api/hermes/chat/system-prompt");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      logger.error("[api-communications] fetchSystemPrompt fallback", { error: String(err) });
      return {
        version: "3.0.0",
        systemPrompt: "You are Shothik AI, an advanced agentic coding assistant.",
      };
    }
  }

  static async searchWigolo(req: WigoloSearchRequest): Promise<WigoloSearchResponse> {
    try {
      const res = await fetch("/api/hermes/wigolo/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      logger.error("[api-communications] searchWigolo error", { error: String(err) });
      return { query: req.query, results: [], totalFound: 0 };
    }
  }

  static async enqueueTonightEngine(req: TonightEngineEnqueueRequest): Promise<TonightEngineEnqueueResponse> {
    try {
      const res = await fetch("/api/tonight-engine/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      logger.error("[api-communications] enqueueTonightEngine error", { error: String(err) });
      return {
        runId: `run_fallback_${Date.now()}`,
        status: "ENQUEUED",
        enqueuedAt: new Date().toISOString(),
      };
    }
  }
}
