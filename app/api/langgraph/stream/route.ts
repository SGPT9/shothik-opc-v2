/**
 * POST /api/langgraph/stream
 *
 * Multi-agent streaming endpoint for the DeerFlow pipeline.
 *
 * Routing:
 *   overnight_deepthink  → Tonight Engine queue (enqueues job, returns SSE redirect info)
 *   deep_research        → DeerFlow FastAPI backend (proxied), falls back to direct LLM
 *   slide_generation     → DeerFlow FastAPI backend (proxied)
 *   code_generation      → DeerFlow FastAPI backend (proxied)
 *   general              → Direct OpenRouter streaming
 *
 * All paths emit valid SSE (text/event-stream) so the useDeerFlowStream
 * hook can consume them uniformly.
 */

import { NextRequest, NextResponse } from "next/server";
import { streamOvernightLLM } from "@/lib/tonight-engine/llm-overnight-client";
import logger from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEERFLOW_URL = (process.env.DEERFLOW_BACKEND_URL ?? "http://localhost:2026").replace(/\/$/, "");

// ─── SSE helpers ──────────────────────────────────────────────────────────────

function makeSSEStream(
  generator: (send: (data: object) => void, close: () => void) => Promise<void>
): NextResponse {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const close = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        await generator(send, close);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ event: "error", error: msg });
        close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─── DeerFlow proxy ───────────────────────────────────────────────────────────

async function proxyDeerFlow(
  prompt: string,
  taskType: string,
  metadata: Record<string, unknown>,
  send: (data: object) => void,
  close: () => void
): Promise<void> {
  try {
    const res = await fetch(`${DEERFLOW_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, task_type: taskType, metadata }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok || !res.body) throw new Error(`DeerFlow HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Forward DeerFlow SSE lines verbatim via the send wrapper
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue;
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          send(parsed);
        } catch {
          // Raw text token
          send({ event: "token", content: trimmed.slice(6) });
        }
      }
    }
    close();
  } catch (err) {
    logger.warn("[langgraph-stream] DeerFlow proxy failed, falling back to direct LLM", {
      taskType,
      error: err instanceof Error ? err.message : String(err),
    });
    // Fallback to direct LLM stream
    await directLLMStream(prompt, taskType, send, close);
  }
}

// ─── Direct LLM stream (OpenRouter fallback) ──────────────────────────────────

async function directLLMStream(
  prompt: string,
  taskType: string,
  send: (data: object) => void,
  close: () => void
): Promise<void> {
  send({
    event: "start",
    node: "LeadEditor",
    agent: "LeadAgent",
    timestamp: Date.now(),
  });

  const depth = taskType === "deep_research" ? "deep" : "standard";

  for await (const token of streamOvernightLLM(prompt, { depth })) {
    send({
      event: "token",
      node: "WriterAgent",
      agent: "WriterAgent",
      content: token,
      timestamp: Date.now(),
    });
  }

  send({
    event: "complete",
    node: "LeadEditor",
    agent: "LeadAgent",
    timestamp: Date.now(),
  });

  close();
}

// ─── Overnight deepthink handler ──────────────────────────────────────────────

async function handleOvernightDeepthink(
  prompt: string,
  metadata: Record<string, unknown>,
  send: (data: object) => void,
  close: () => void
): Promise<void> {
  // For overnight tasks submitted via the langgraph stream endpoint directly
  // (legacy path), we still do a real streaming response but label it correctly.
  send({
    event: "start",
    node: "AirLLMStreamer",
    agent: "TonightEngine",
    tool: "gemini-2.5-flash",
    timestamp: Date.now(),
    metadata: { executionMode: "overnight_deepthink" },
  });

  const depth = (metadata?.depth as "quick" | "standard" | "deep") ?? "standard";

  send({
    event: "node_start",
    node: "AirLLMStreamer",
    agent: "TonightEngine",
    tool: "MXFP4-PCIe-Engine",
    timestamp: Date.now(),
  });

  for await (const token of streamOvernightLLM(prompt, { depth })) {
    send({
      event: "token",
      node: "TonightEngine",
      agent: "TonightEngine",
      content: token,
      timestamp: Date.now(),
    });
  }

  send({
    event: "complete",
    node: "AirLLMStreamer",
    agent: "TonightEngine",
    timestamp: Date.now(),
  });

  close();
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { prompt?: string; task_type?: string; metadata?: Record<string, unknown> };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim();
  const taskType = String(body.task_type ?? "general");
  const metadata = (body.metadata ?? {}) as Record<string, unknown>;

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  logger.info("[langgraph-stream] Request", { taskType, promptLen: prompt.length });

  // Route by task type
  if (taskType === "overnight_deepthink") {
    return makeSSEStream((send, close) =>
      handleOvernightDeepthink(prompt, metadata, send, close)
    );
  }

  if (
    taskType === "deep_research" ||
    taskType === "slide_generation" ||
    taskType === "code_generation" ||
    taskType === "sheet_analysis"
  ) {
    return makeSSEStream((send, close) =>
      proxyDeerFlow(prompt, taskType, metadata, send, close)
    );
  }

  // General: direct LLM stream
  return makeSSEStream((send, close) =>
    directLLMStream(prompt, taskType, send, close)
  );
}
