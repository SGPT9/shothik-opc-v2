/**
 * Tonight Engine — Overnight Task Queue Service
 *
 * Uses the existing Hermes infrastructure (Postgres + Redis + SSE) as a
 * durable job queue. No external queue service required.
 *
 * Flow:
 *   enqueueOvernightJob()
 *     → marks run as "planning" in DB
 *     → stores job payload in Redis
 *     → fires processOvernightJob() in the background (fire-and-forget)
 *
 *   processOvernightJob()
 *     → moves run to "running"
 *     → web-search context gathering (Tavily or mock)
 *     → streams tokens from LLM → Redis event replay
 *     → saves artifact to hermes_artifacts
 *     → marks run "completed" or "failed"
 */

import { randomUUID } from "crypto";
import { getHermesOrchestrator } from "@/lib/hermes";
import { getHermesDatabase } from "@/lib/hermes/infra/db";
import { getHermesStreamingEngine } from "@/lib/hermes/modules/streaming-engine";
import { streamOvernightLLM, resolveOvernightModel, type OvernightDepth } from "./llm-overnight-client";
import { getRedis } from "@/lib/infrastructure/redis";
import logger from "@/lib/logger";
import type { RunId } from "@/lib/hermes/contracts/core";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OvernightJobPayload {
  runId: RunId;
  userId: string;
  workspaceId: string;
  prompt: string;
  depth: OvernightDepth;
  attachmentUrls?: string[];
  notifyOnComplete?: boolean;
  enqueuedAt: string;
}

export interface OvernightJobStatus {
  runId: RunId;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progressPercent: number;
  currentStep: string;
  estimatedCompletion: string;
  modelLabel?: string;
  artifactUrl?: string;
  errorMessage?: string;
  enqueuedAt?: string;
  completedAt?: string;
}

// ─── Redis key helpers ────────────────────────────────────────────────────────

const JOB_KEY = (runId: string) => `tonight:job:${runId}`;
const JOB_TTL = 7 * 24 * 60 * 60; // 7 days

// ─── Estimated completion helper ──────────────────────────────────────────────

function estimateCompletion(depth: OvernightDepth): string {
  const minutesMap: Record<OvernightDepth, number> = {
    quick: 5,
    standard: 15,
    deep: 30,
  };
  const minutes = minutesMap[depth];
  const completion = new Date(Date.now() + minutes * 60_000);
  return completion.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Web search context (Tavily with mock fallback) ──────────────────────────

async function gatherWebContext(
  query: string,
  runId: RunId
): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  const streaming = getHermesStreamingEngine();

  if (!apiKey) {
    logger.warn("[tonight-engine] TAVILY_API_KEY not set — using mock context", { runId });
    return `[Web context for: "${query.slice(0, 80)}"]\n• No live web search available in dev mode. Set TAVILY_API_KEY for real results.\n`;
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 8,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tavily HTTP ${res.status}`);
    }

    const data = await res.json();
    const results = (data.results ?? []) as Array<{
      title: string;
      url: string;
      content: string;
    }>;

    const lines = results.map(
      (r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 400)}`
    );

    if (data.answer) {
      lines.unshift(`**Quick Answer:** ${data.answer}\n`);
    }

    await streaming.emitProgressEvent(runId, "web_search_complete", {
      sourcesFound: results.length,
      hasAnswer: !!data.answer,
    });

    return `## Web Research Context\n\n${lines.join("\n\n---\n\n")}`;
  } catch (err) {
    logger.warn("[tonight-engine] Tavily search failed, proceeding without web context", {
      runId,
      error: err instanceof Error ? err.message : String(err),
    });
    return `[Web search unavailable: ${err instanceof Error ? err.message : "unknown error"}]`;
  }
}

// ─── Main queue service ───────────────────────────────────────────────────────

export class TonightEngineQueue {
  private redis = getRedis();
  private hermes = getHermesOrchestrator();
  private db = getHermesDatabase();
  private streaming = getHermesStreamingEngine();

  /**
   * Enqueue an overnight job.
   * Persists the job payload to Redis and kicks off background processing.
   * Returns immediately — the job runs asynchronously.
   */
  async enqueueOvernightJob(payload: Omit<OvernightJobPayload, "enqueuedAt">): Promise<OvernightJobStatus> {
    const fullPayload: OvernightJobPayload = {
      ...payload,
      enqueuedAt: new Date().toISOString(),
    };

    // Persist job metadata to Redis for status polling
    if (this.redis) {
      try {
        await this.redis.set(JOB_KEY(payload.runId), fullPayload, { ex: JOB_TTL });
      } catch (err) {
        logger.warn("[tonight-engine] Redis job store failed — status polling unavailable", {
          runId: payload.runId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Mark run as planning
    await this.hermes.reportProgress(payload.runId, "Job enqueued — waiting to start", {
      step: "queued",
      progressPercent: 0,
    });

    // Fire-and-forget: process in background
    // Node.js: setImmediate defers to next event loop tick after I/O
    setImmediate(() => {
      this.processOvernightJob(fullPayload).catch((err) => {
        logger.error("[tonight-engine] Background job crashed", {
          runId: payload.runId,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    });

    const { model } = await resolveOvernightModel({ depth: payload.depth });

    return {
      runId: payload.runId,
      status: "queued",
      progressPercent: 0,
      currentStep: "Job queued — starting shortly",
      estimatedCompletion: estimateCompletion(payload.depth),
      modelLabel: model.label,
      enqueuedAt: fullPayload.enqueuedAt,
    };
  }

  /**
   * Process an overnight job end-to-end.
   * Called in background — must not throw unhandled.
   */
  async processOvernightJob(payload: OvernightJobPayload): Promise<void> {
    const { runId, prompt, depth, workspaceId } = payload;
    const artifactId = `artifact_${randomUUID()}`;
    const maxConcurrent = Number(process.env.TONIGHT_ENGINE_MAX_CONCURRENT ?? "1");
    const activeJobsKey = "tonight:active_jobs_count";

    logger.info("[tonight-engine] Job processing started", { runId, depth });

    // ── Concurrency Check & Wait Loop ───────────────────────────────────────
    if (this.redis) {
      let isEnqueued = false;
      while (true) {
        try {
          // Atomic increment to try and acquire a slot
          const currentActive = await this.redis.incr(activeJobsKey);
          if (currentActive <= maxConcurrent) {
            // Acquired slot
            break;
          }

          // Slot not available — decrement back and wait
          await this.redis.decr(activeJobsKey);
          if (!isEnqueued) {
            await this.hermes.reportProgress(runId, "Queue busy — waiting for GPU slot...", {
              step: "queued",
              progressPercent: 0,
            });
            isEnqueued = true;
          }
        } catch (err) {
          logger.warn("[tonight-engine] Concurrency lock check failed — running uncapped", { runId, error: err });
          break; // Fallback to running uncapped if Redis fails
        }
        // Poll every 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10_000));
      }
    }

    try {
      // ── Step 1: Start run ───────────────────────────────────────────────
      await this.hermes.startRun(runId);
      await this._updateJobState(runId, { step: "research", progressPercent: 5 });

      // ── Step 2: Web context gathering ───────────────────────────────────
      await this.streaming.emitProgressToken(runId, "🔍 Gathering web research context…\n\n");
      const webContext = await gatherWebContext(prompt, runId);
      await this._updateJobState(runId, { step: "synthesizing", progressPercent: 25 });

      // ── Step 3: Build enriched prompt ───────────────────────────────────
      const enrichedPrompt = [
        "## Research Task\n",
        prompt,
        "\n\n---\n",
        webContext,
        "\n\n---\n",
        "Based on the research context above, provide a comprehensive, well-structured analysis.",
      ].join("\n");

      // ── Step 4: Stream LLM output ────────────────────────────────────────
      await this.streaming.emitProgressToken(runId, "🤖 Generating deep analysis…\n\n");
      await this._updateJobState(runId, { step: "generating", progressPercent: 30 });

      let fullOutput = "";
      let tokenCount = 0;
      const { model } = await resolveOvernightModel({ depth });

      for await (const token of streamOvernightLLM(enrichedPrompt, { depth })) {
        fullOutput += token;
        tokenCount++;

        // Emit token event every token
        await this.streaming.emitProgressToken(runId, token);

        // Update progress periodically (every 100 tokens)
        if (tokenCount % 100 === 0) {
          const progressPercent = Math.min(30 + Math.floor(tokenCount / 50), 85);
          await this._updateJobState(runId, {
            step: "generating",
            progressPercent,
          });
        }
      }

      // ── Step 5: Save artifact ────────────────────────────────────────────
      await this._updateJobState(runId, { step: "saving", progressPercent: 90 });
      await this.streaming.emitProgressToken(runId, "\n\n✅ Saving artifact…\n");

      await this.db.createArtifact({
        id: artifactId,
        workspaceId,
        runId,
        userId: payload.userId,
        domain: "research",
        status: "ready",
        title: `Overnight Research: ${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}`,
        description: `Generated by Tonight Engine (${model.label})`,
        content: {
          markdown: fullOutput,
          prompt,
          webContext,
          model: model.id,
          tokenCount,
          generatedAt: new Date().toISOString(),
        },
        metadata: {
          executionMode: "overnight_deepthink",
          depth,
          modelId: model.id,
          modelLabel: model.label,
          costTier: model.costTier,
        },
        version: 1,
      });

      // ── Step 6: Complete ─────────────────────────────────────────────────
      await this.hermes.completeRun(runId, {
        artifactId,
        artifactUrl: `/api/hermes/artifacts/${artifactId}`,
        tokenCount,
        modelId: model.id,
      });

      await this._updateJobState(runId, {
        step: "completed",
        progressPercent: 100,
        artifactId,
        completedAt: new Date().toISOString(),
      });

      await this.streaming.emitProgressToken(
        runId,
        `\n\n---\n🌙 **Tonight Engine complete.** Your research artifact is ready.\n`
      );

      logger.info("[tonight-engine] Job completed", { runId, artifactId, tokenCount });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[tonight-engine] Job failed", { runId, error: message });

      await this.hermes.failRun(runId, message, { depth, prompt: prompt.slice(0, 200) });
      await this._updateJobState(runId, {
        step: "failed",
        progressPercent: 0,
        errorMessage: message,
      });

      await this.streaming.emitProgressToken(
        runId,
        `\n\n❌ **Tonight Engine error:** ${message}\n`
      );
    } finally {
      // ── Release Lock ───────────────────────────────────────────────────────
      if (this.redis) {
        try {
          await this.redis.decr(activeJobsKey);
        } catch (err) {
          logger.error("[tonight-engine] Failed to release concurrency lock", { runId, error: err });
        }
      }
    }
  }

  /**
   * Get current status of an overnight job.
   * Reads from Redis hot-state for O(1) lookup.
   */
  async getJobStatus(runId: RunId): Promise<OvernightJobStatus | null> {
    // Read job payload from Redis
    let jobPayload: OvernightJobPayload | null = null;
    if (this.redis) {
      try {
        jobPayload = await this.redis.get<OvernightJobPayload>(JOB_KEY(runId));
      } catch {
        // Ignore Redis errors — fall through to DB
      }
    }

    // Read Hermes run from DB
    const run = await this.db.getRun(runId);
    if (!run) return null;

    // Read hot-state from Redis for progress details
    const hotState = await this.streaming.getRunHotState(runId);

    const progressPercent =
      typeof hotState?.payload?.progressPercent === "number"
        ? (hotState.payload.progressPercent as number)
        : run.status === "completed"
        ? 100
        : run.status === "running"
        ? 50
        : 0;

    const currentStep =
      typeof hotState?.payload?.step === "string"
        ? stepLabel(hotState.payload.step as string)
        : run.status === "completed"
        ? "Complete"
        : run.status === "running"
        ? "Processing…"
        : "Queued";

    const depth = (jobPayload?.depth ?? "standard") as OvernightDepth;
    const { model } = await resolveOvernightModel({ depth });

    const artifactUrl =
      typeof run.metadata?.artifactId === "string"
        ? `/api/hermes/artifacts/${run.metadata.artifactId}`
        : undefined;

    return {
      runId,
      status: hermesStatusToJobStatus(run.status),
      progressPercent,
      currentStep,
      estimatedCompletion: estimateCompletion(depth),
      modelLabel: model.label,
      artifactUrl,
      errorMessage:
        typeof run.metadata?.error === "string" ? run.metadata.error : undefined,
      enqueuedAt: jobPayload?.enqueuedAt,
      completedAt:
        typeof run.metadata?.completedAt === "string"
          ? run.metadata.completedAt
          : run.completedAt,
    };
  }

  private async _updateJobState(
    runId: RunId,
    state: {
      step: string;
      progressPercent: number;
      artifactId?: string;
      completedAt?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    if (!this.redis) return;
    try {
      const existingRaw = await this.redis.get<OvernightJobPayload>(JOB_KEY(runId));
      if (existingRaw) {
        await this.redis.set(
          JOB_KEY(runId),
          { ...existingRaw, _state: state },
          { ex: JOB_TTL }
        );
      }
    } catch {
      // State update failure is non-fatal
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hermesStatusToJobStatus(status: string): OvernightJobStatus["status"] {
  switch (status) {
    case "created":
    case "planning":
      return "queued";
    case "running":
    case "resumed":
      return "processing";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "queued";
  }
}

function stepLabel(step: string): string {
  const labels: Record<string, string> = {
    queued: "Queued — starting shortly",
    research: "Gathering web research…",
    synthesizing: "Synthesising sources…",
    generating: "Generating analysis…",
    saving: "Saving artifact…",
    completed: "Complete",
    failed: "Failed",
  };
  return labels[step] ?? step;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance: TonightEngineQueue | null = null;

export function getTonightEngineQueue(): TonightEngineQueue {
  if (!_instance) {
    _instance = new TonightEngineQueue();
  }
  return _instance;
}
