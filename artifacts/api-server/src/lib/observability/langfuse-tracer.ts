import http from "node:http";
import https from "node:https";
import { logger } from "../logger";

export interface LangfuseTraceEvent {
  id: string;
  timestamp: string;
  name: string;
  type: "generation" | "span" | "event";
  model?: string;
  input: unknown;
  output: unknown;
  metadata?: Record<string, unknown>;
  latencyMs?: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export class LangfuseTracer {
  private static instance: LangfuseTracer;
  private readonly baseUrl: string;
  private readonly publicKey?: string;
  private readonly secretKey?: string;
  private readonly traceBuffer: LangfuseTraceEvent[] = [];
  private readonly maxBufferSize = 100;

  private constructor() {
    this.baseUrl = (process.env.LANGFUSE_BASEURL || "http://127.0.0.1:12000").replace(/\/$/, "");
    this.publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    this.secretKey = process.env.LANGFUSE_SECRET_KEY;
  }

  public static getInstance(): LangfuseTracer {
    if (!LangfuseTracer.instance) {
      LangfuseTracer.instance = new LangfuseTracer();
    }
    return LangfuseTracer.instance;
  }

  /**
   * Records an LLM generation or heuristic transformation pass.
   */
  public traceGeneration(params: {
    name: string;
    model?: string;
    input: unknown;
    output: unknown;
    metadata?: Record<string, unknown>;
    latencyMs?: number;
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  }): LangfuseTraceEvent {
    const event: LangfuseTraceEvent = {
      id: `trace_gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      name: params.name,
      type: "generation",
      model: params.model || "heuristic-pipeline",
      input: params.input,
      output: params.output,
      metadata: params.metadata,
      latencyMs: params.latencyMs || 0,
      usage: params.usage,
    };

    this.recordTrace(event);
    return event;
  }

  /**
   * Records a general pipeline span (e.g. web search rank fusion, queue job, evasion loop pass).
   */
  public traceSpan(params: {
    name: string;
    input?: unknown;
    output?: unknown;
    metadata?: Record<string, unknown>;
    durationMs?: number;
  }): LangfuseTraceEvent {
    const event: LangfuseTraceEvent = {
      id: `trace_span_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      name: params.name,
      type: "span",
      input: params.input,
      output: params.output,
      metadata: params.metadata,
      latencyMs: params.durationMs || 0,
    };

    this.recordTrace(event);
    return event;
  }

  public getRecentTraces(limit = 50): LangfuseTraceEvent[] {
    return this.traceBuffer.slice(-limit).reverse();
  }

  public clearTraces(): void {
    this.traceBuffer.length = 0;
  }

  private recordTrace(event: LangfuseTraceEvent): void {
    // 1. Maintain in-memory circular buffer
    this.traceBuffer.push(event);
    if (this.traceBuffer.length > this.maxBufferSize) {
      this.traceBuffer.shift();
    }

    // 2. Dispatch asynchronously to Langfuse server if configured
    if (this.publicKey && this.secretKey) {
      this.dispatchToLangfuse(event).catch((err) => {
        logger.debug({ err: err.message }, "[langfuse] Non-blocking dispatch notice");
      });
    }
  }

  private async dispatchToLangfuse(event: LangfuseTraceEvent): Promise<void> {
    try {
      const url = new URL(`${this.baseUrl}/api/public/ingestion`);
      const isHttps = url.protocol === "https:";
      const client = isHttps ? https : http;

      const payload = JSON.stringify({
        batch: [
          {
            id: event.id,
            type: event.type === "generation" ? "generation-create" : "span-create",
            timestamp: event.timestamp,
            body: {
              name: event.name,
              input: event.input,
              output: event.output,
              metadata: event.metadata,
              model: event.model,
            },
          },
        ],
      });

      const auth = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString("base64");

      const req = client.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 2000,
        },
        (res) => {
          res.resume(); // consume response body
        }
      );

      req.on("error", () => {
        // Safe silence on network/offline errors
      });

      req.write(payload);
      req.end();
    } catch {
      // Safe no-op
    }
  }
}

export const langfuseTracer = LangfuseTracer.getInstance();
