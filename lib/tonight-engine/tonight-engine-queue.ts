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
import { AGENCY_PERSONAS } from "./agency-personas";
import { getRedis } from "@/lib/infrastructure/redis";
import { getDokployClient } from "@/lib/dokploy/dokploy-client";
import { getGitWorkspaceClient } from "@/lib/git/git-workspace-client";
import logger from "@/lib/logger";
import type { RunId } from "@/lib/hermes/contracts/core";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanStep {
  title: string;
  persona: string;
}

export interface OvernightJobPayload {
  runId: RunId;
  userId: string;
  workspaceId: string;
  prompt: string;
  depth: OvernightDepth;
  activeSkill?: string;
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

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn(`[tonight-engine] Operation failed, retrying in ${delayMs}ms...`, { error: err });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
  throw new Error("Execution retries exhausted.");
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
          // Set TTL of 20 minutes to prevent permanent ghost lock on crash
          await this.redis.expire(activeJobsKey, 1200);
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
      await this._logActivityToConvex(payload.userId, "overnight_research_started", prompt.slice(0, 80));

      // ── Step 2: Web context gathering ───────────────────────────────────
      await this.streaming.emitProgressToken(runId, "🔍 Gathering web research context…\n\n");
      const webContext = await retryWithBackoff(() => gatherWebContext(prompt, runId));
      await this._updateJobState(runId, { step: "synthesizing", progressPercent: 25 });

      // ── Step 3: Stage 1 — Planning Phase ─────────────────────────────────
      await this.streaming.emitProgressToken(runId, "📋 Formulating strategic multi-step plan…\n\n");
      await this._updateJobState(runId, { step: "planning", progressPercent: 10 });

      const plannerPrompt = [
        "You are an expert project planner and collaborative swarm orchestrator.",
        "Analyze the following research request and context, and break it down into a list of 3 sequential, modular sub-tasks to build the final response.",
        "For each sub-task, assign the most suitable specialized agent persona key from this list:",
        "  - \"github-fixer\" (For code implementation, bug fixing, scripting)",
        "  - \"cloud-deployer\" (For DevOps, containerization, staging configs)",
        "  - \"db-migrator\" (For databases, SQL queries, schemas)",
        "  - \"ui-designer\" (For design, visual hierarchy, theme systems)",
        "  - \"security-auditor\" (For audits, checking code vulnerabilities/secrets)",
        "  - \"product-manager\" (For product requirements, goals, stories)",
        "  - \"test-automator\" (For Playwright, testing scripts)",
        "  - \"seo-specialist\" (For search optimization, INP, LCP)",
        "  - \"content-creator\" (For copywriting, documentation blog posts)",
        "  - \"sales-outreach\" (For cold outreach, templates, proposals)",
        "  - \"technical-writer\" (For API reference, README guides)",
        "  - \"sre-architect\" (For SRE, alerting, error budgets)",
        "  - \"ux-architect\" (For Tailwind layouts, CSS tokens, touch targets)",
        "  - \"researcher\" (Default fallback, for research and calculations)",
        "",
        "Your output must be a simple, valid JSON array containing exactly 3 objects matching the schema: { \"title\": string, \"persona\": string }",
        "Do not include markdown backticks or any other text around the JSON array.",
        "Example output: [{\"title\": \"Task 1: Design Layout\", \"persona\": \"ui-designer\"}, {\"title\": \"Task 2: Implement Code\", \"persona\": \"github-fixer\"}, {\"title\": \"Task 3: Run Audit\", \"persona\": \"security-auditor\"}]",
        "\n---",
        `Request: "${prompt}"`,
        "\n---",
        webContext
      ].join("\n");

      let plannerOutput = "";
      for await (const token of streamOvernightLLM(plannerPrompt, { depth })) {
        plannerOutput += token;
      }

      let planSteps: PlanStep[] = [];
      try {
        const firstBracket = plannerOutput.indexOf("[");
        const lastBracket = plannerOutput.lastIndexOf("]");
        let cleanedJson = plannerOutput;
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanedJson = plannerOutput.substring(firstBracket, lastBracket + 1);
        } else {
          cleanedJson = plannerOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        const parsed = JSON.parse(cleanedJson);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === "object" && typeof item.title === "string")) {
          planSteps = parsed.map(item => ({
            title: item.title,
            persona: typeof item.persona === "string" ? item.persona : (payload.activeSkill || "researcher")
          }));
        } else {
          throw new Error("Parsed JSON is not an array of plan step objects.");
        }
      } catch (err) {
        logger.warn("[tonight-engine] Failed to parse planned tasks JSON — attempting regex lines recovery", { runId, output: plannerOutput, error: err });
        const titles: string[] = [];
        const titleMatches = plannerOutput.match(/"title"\s*:\s*"([^"]+)"/g) || plannerOutput.match(/'title'\s*:\s*'([^']+)'/g);
        if (titleMatches && titleMatches.length >= 2) {
          for (const match of titleMatches) {
            const titleVal = match.split(":")[1].trim().slice(1, -1);
            titles.push(titleVal);
          }
        }
        
        if (titles.length >= 2) {
          planSteps = titles.map(title => ({
            title,
            persona: payload.activeSkill || "researcher"
          }));
        }
      }

      if (!planSteps || planSteps.length < 2) {
        planSteps = [
          { title: "Phase 1: Foundation & Web Research Synthesis", persona: "researcher" },
          { title: "Phase 2: Comparative Analysis & Deep Investigation", persona: "researcher" },
          { title: "Phase 3: Final Recommendations & Strategic Executive Summary", persona: "researcher" }
        ];
      }

      // Output the plan checklist to the stream
      await this.streaming.emitProgressToken(runId, "### 📋 Strategic Execution Plan:\n");
      for (const step of planSteps) {
        await this.streaming.emitProgressToken(runId, `• [ ] **${step.title}** (Delegated to: *${step.persona}*)\n`);
      }
      await this.streaming.emitProgressToken(runId, "\n");

      // ── Step 4: Stage 2 — Sequential Execution Phase ─────────────────────
      let cumulativeOutput = "# Analysis Report\n\n";
      let totalTokenCount = 0;
      const { model } = await resolveOvernightModel({ depth });

      for (let i = 0; i < planSteps.length; i++) {
        // Check abort status before starting task
        const activeRun = await this.db.getRun(runId);
        if (activeRun?.status === "cancelled" || activeRun?.status === "failed") {
          throw new Error("Job execution aborted by user cancel signal.");
        }

        const step = planSteps[i];
        const taskTitle = step.title;
        const stepProgress = 15 + Math.floor((i / planSteps.length) * 55);
        await this._updateJobState(runId, { step: `executing_step_${i + 1}`, progressPercent: stepProgress });

        await this.streaming.emitProgressToken(
          runId,
          `\n⚡ **Executing Step ${i + 1}/${planSteps.length}: ${taskTitle}** (Delegated Agent: \`${step.persona}\`)…\n\n`
        );
        await this._logActivityToConvex(payload.userId, "executing_step", taskTitle, { step: i + 1, agent: step.persona });

        const personaKey = step.persona || payload.activeSkill || "researcher";
        const persona = AGENCY_PERSONAS[personaKey] || AGENCY_PERSONAS["researcher"];

        const stepPrompt = [
          `You are a ${persona.role} executing Step ${i + 1} of a 3-step execution plan.`,
          `Behavioral Directives: ${persona.systemDirective}`,
          `Guidelines to follow:`,
          ...persona.instructions.map(ins => `• ${ins}`),
          "\n---\n",
          `Step Title: "${taskTitle}"`,
          `Full Goal: "${prompt}"`,
          "\n---\n",
          `Web Context:\n${webContext}`,
          "\n---\n",
          i > 0 ? `Previous Sections Output:\n${cumulativeOutput}` : "",
          `Write the response for this specific step only. Be thorough, detailed, and structure it cleanly with markdown. Do not repeat content from previous sections.`
        ].join("\n");

        let stepOutput = "";
        for await (const token of streamOvernightLLM(stepPrompt, { depth })) {
          stepOutput += token;
          totalTokenCount++;
          await this.streaming.emitProgressToken(runId, token);
        }

        cumulativeOutput += `\n## ${taskTitle}\n\n${stepOutput}\n`;
      }

      // ── Step 4b: Stage 3 — Synthesis Phase ───────────────────────────────
      await this._updateJobState(runId, { step: "synthesizing_report", progressPercent: 80 });
      await this.streaming.emitProgressToken(runId, "\n\n✍️ Synthesizing final report & executive summary…\n\n");

      const synthesisPrompt = [
        "You are an expert editor. Synthesize the following multi-section analysis report into a final polished report.",
        "Add a clear, professional Executive Summary at the top, and clean up any formatting or repetitiveness in the body.",
        "Keep the full detailed sections intact, but make the report read as a cohesive document.",
        "\n---",
        cumulativeOutput
      ].join("\n");

      let finalReport = "";
      for await (const token of streamOvernightLLM(synthesisPrompt, { depth })) {
        finalReport += token;
        totalTokenCount++;
        await this.streaming.emitProgressToken(runId, token);
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
          markdown: finalReport,
          prompt,
          webContext,
          model: model.id,
          tokenCount: totalTokenCount,
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

      // ── Step 5b: Hybrid Staging Deploy ────────────────────────────────────
      const containsDeployKeyword = /deploy|publish|launch|hosting|host|live/i.test(prompt);
      let stagingUrl = "";
      
      if (containsDeployKeyword) {
        await this._updateJobState(runId, { step: "deploying_staging", progressPercent: 95 });
        await this.streaming.emitProgressToken(runId, "\n\n🚀 **[Staging Deploy] Provisioning preview container on Dokploy…**\n");

        const appName = `shothik-app-${runId.slice(0, 8)}`.toLowerCase();
        const fallbackDomain = `${appName}.shothik.app`;

        const requiresDatabase = /postgres|mysql|redis|mongodb|db|drizzle|prisma/i.test(finalReport) ||
                                 /postgres|mysql|redis|mongodb|db|drizzle|prisma/i.test(prompt);

        let envVariables: Record<string, string> = {};

        if (requiresDatabase) {
          await this.streaming.emitProgressToken(runId, "🗄️ **Database dependency detected. Provisioning database instance on Dokploy…**\n");
          try {
            const dbName = `${appName}-db`;
            if (process.env.DOKPLOY_API_KEY) {
              const { connectionString } = await getDokployClient().createDatabase({
                name: dbName,
                type: "postgres",
              });
              envVariables["DATABASE_URL"] = connectionString;
              await this.streaming.emitProgressToken(runId, `✅ **Database provisioned!** Internal connection string bound to DATABASE_URL.\n`);
              await this._logActivityToConvex(payload.userId, "database_provisioned", dbName);
            } else {
              envVariables["DATABASE_URL"] = `postgresql://postgres:postgres@localhost:5432/${dbName}`;
              await this.streaming.emitProgressToken(runId, `✅ **[Mock Mode] Database registered!** Mock connection string bound to DATABASE_URL.\n`);
              await this._logActivityToConvex(payload.userId, "database_provisioned", dbName, { mock: true });
            }
          } catch (dbErr) {
            const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
            logger.error("[tonight-engine] Database provisioning failed", { runId, error: dbErrMsg });
            await this.streaming.emitProgressToken(runId, `⚠️ **Database provisioning failed, skipping database bind:** ${dbErrMsg}\n`);
          }
        }

        try {
          const workspace = await this.db.getWorkspace(workspaceId);
          const repository = (workspace?.metadata?.repository as string) || "ahsanhab919-ux/shothik-web";

          const dokploy = getDokployClient();
          const appConfig = {
            name: appName,
            repository,
            branch: "main",
            domain: fallbackDomain,
            envVariables,
          };
          
          if (process.env.DOKPLOY_API_KEY) {
            const { cleanUrl } = await dokploy.createApplication(appConfig);
            stagingUrl = cleanUrl ? `https://${cleanUrl}` : `https://${fallbackDomain}`;
            await dokploy.deployApplication(appName);
            await this.streaming.emitProgressToken(runId, `🌐 **Live preview successfully deployed on Dokploy!**\nLink: [${stagingUrl}](${stagingUrl})\n`);
            await this._logActivityToConvex(payload.userId, "staging_deploy_triggered", appName, { url: stagingUrl });
          } else {
            stagingUrl = `https://${fallbackDomain}`;
            await this.streaming.emitProgressToken(runId, `🌐 **[Mock Mode] Live preview registered!**\nLink: [${stagingUrl}](${stagingUrl}) (Configure DOKPLOY_API_KEY on host VPS for live deployment)\n`);
            await this._logActivityToConvex(payload.userId, "staging_deploy_triggered", appName, { url: stagingUrl, mock: true });
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          logger.error("[tonight-engine] Staging deployment failed", { runId, error: errMsg });
          await this.streaming.emitProgressToken(runId, `⚠️ **Staging deploy skipped:** ${errMsg}\n`);
          await this._logActivityToConvex(payload.userId, "staging_deploy_failed", appName, { error: errMsg });
        }
      }

      // ── Step 6: Complete ─────────────────────────────────────────────────
      await this.hermes.completeRun(runId, {
        artifactId,
        artifactUrl: `/api/hermes/artifacts/${artifactId}`,
        tokenCount: totalTokenCount,
        modelId: model.id,
        metadata: {
          stagingUrl: stagingUrl || undefined,
        }
      });

      await this._updateJobState(runId, {
        step: "completed",
        progressPercent: 100,
        artifactId,
        completedAt: new Date().toISOString(),
      });
      await this._logActivityToConvex(payload.userId, "overnight_research_completed", `Artifact: ${artifactId}`);

      await this.streaming.emitProgressToken(
        runId,
        `\n\n---\n🌙 **Tonight Engine complete.** Your research artifact is ready.\n`
      );

      logger.info("[tonight-engine] Job completed", { runId, artifactId, tokenCount: totalTokenCount });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[tonight-engine] Job failed", { runId, error: message });

      await this.hermes.failRun(runId, message, { depth, prompt: prompt.slice(0, 200) });
      await this._updateJobState(runId, {
        step: "failed",
        progressPercent: 0,
        errorMessage: message,
      });
      await this._logActivityToConvex(payload.userId, "overnight_research_failed", message);

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

  private async _logActivityToConvex(
    userId: string,
    action: string,
    targetResource?: string,
    metadata?: any
  ): Promise<void> {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const systemSecret = process.env.CREDIT_PURCHASE_SECRET || "dev-system-secret";
    if (!convexUrl) return;

    try {
      const client = new ConvexHttpClient(convexUrl);
      const twin = await client.query(api.twin.getByMasterFromSystem, {
        masterId: userId,
        systemSecret,
      });

      if (twin?._id) {
        await client.mutation(api.twin.logActivityFromSystem, {
          twinId: twin._id,
          action,
          targetResource,
          metadata,
          systemSecret,
        });
      }
    } catch (err) {
      logger.warn("[tonight-engine] Failed to sync activity log to Convex", { userId, action, error: err });
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
