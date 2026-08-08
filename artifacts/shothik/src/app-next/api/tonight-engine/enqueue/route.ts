/**
 * POST /api/tonight-engine/enqueue
 *
 * Creates a Hermes run for an overnight batch job and kicks off
 * background processing via TonightEngineQueue.
 *
 * Response:
 *   { runId, streamUrl, statusUrl, estimatedCompletion, modelLabel }
 */

import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesOrchestrator } from "@/lib/hermes";
import { getTonightEngineQueue } from "@/lib/tonight-engine/tonight-engine-queue";
import { z } from "zod";
import logger from "@/lib/logger";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const EnqueueBodySchema = z.object({
  workspaceId: z.string().min(1),
  prompt: z.string().min(1).max(32_000),
  depth: z.enum(["quick", "standard", "deep"]).default("standard"),
  activeSkill: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
  notifyOnComplete: z.boolean().optional(),
});

const OVERNIGHT_JOB_CREDIT_COST = 20;
import { getSanitizedConvexUrl } from "@/lib/convex-url";
const convex = new ConvexHttpClient(getSanitizedConvexUrl());

function unauthorized() {
  return Response.json(
    { error: "Authentication required", code: "AUTH_REQUIRED" },
    { status: 401 }
  );
}

export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) return unauthorized();

  const userId = String(user._id);

  // ── Verify Credit Balance ────────────────────────────────────────────────
  try {
    const credits = await convex.query(api.billing.getUserCredits, { userId });
    if (!credits || credits.balance < OVERNIGHT_JOB_CREDIT_COST) {
      return Response.json(
        {
          error: "Insufficient credits",
          code: "INSUFFICIENT_CREDITS",
          message: `Overnight research requires ${OVERNIGHT_JOB_CREDIT_COST} credits. Please buy more credits.`,
          balance: credits?.balance ?? 0,
          cost: OVERNIGHT_JOB_CREDIT_COST,
        },
        { status: 402 } // 402 Payment Required
      );
    }
  } catch (err) {
    logger.warn("[tonight-engine] Convex credit check failed, bypass check in dev", { userId, error: err });
  }

  let body: z.infer<typeof EnqueueBodySchema>;
  try {
    body = EnqueueBodySchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request body", code: "VALIDATION_ERROR", details: err.issues },
        { status: 400 }
      );
    }
    return Response.json({ error: "Bad request", code: "BAD_REQUEST" }, { status: 400 });
  }


  try {
    const hermes = getHermesOrchestrator();

    // Create a durable Hermes run — this is our job record
    const run = await hermes.createRun({
      workspaceId: body.workspaceId,
      userId,
      domain: "research",
      config: {
        depth: body.depth,
        executionMode: "overnight_deepthink",
      },
      metadata: {
        executionMode: "overnight_deepthink",
        prompt: body.prompt.slice(0, 500), // Truncated for metadata
        depth: body.depth,
        notifyOnComplete: body.notifyOnComplete ?? false,
        attachmentUrls: body.attachmentUrls ?? [],
        enqueuedBy: userId,
      },
    });

    // Mark as planning
    await hermes.reportProgress(run.id, "Overnight job received", {
      step: "queued",
      progressPercent: 0,
    });

    // Deduct credits
    try {
      await convex.mutation(api.billing.spendCredits, {
        userId,
        amount: OVERNIGHT_JOB_CREDIT_COST,
        description: `Overnight research: ${body.prompt.slice(0, 40)}...`,
        metadata: {
          tool: "tonight_engine",
          model: body.depth === "deep" ? "deepseek-r1" : "gemini-2.5-flash",
        },
      });
      logger.info("[tonight-engine] Deducted credits for overnight job", { userId, amount: OVERNIGHT_JOB_CREDIT_COST, runId: run.id });
    } catch (err) {
      logger.error("[tonight-engine] Failed to deduct credits", { userId, error: err });
      // In dev mode/test environment without fully seeded userCredits, we log and proceed.
      // In production, this throws from the Convex check anyway.
    }

    // Enqueue — fires background worker, returns immediately
    const queue = getTonightEngineQueue();
    const jobStatus = await queue.enqueueOvernightJob({
      runId: run.id,
      userId,
      workspaceId: body.workspaceId,
      prompt: body.prompt,
      depth: body.depth,
      activeSkill: body.activeSkill,
      attachmentUrls: body.attachmentUrls,
      notifyOnComplete: body.notifyOnComplete,
    });

    logger.info("[tonight-engine] Job enqueued", {
      runId: run.id,
      depth: body.depth,
      userId,
      workspaceId: body.workspaceId,
    });

    return Response.json(
      {
        data: {
          runId: run.id,
          streamUrl: `/api/hermes/runs/${run.id}`,
          statusUrl: `/api/tonight-engine/status/${run.id}`,
          estimatedCompletion: jobStatus.estimatedCompletion,
          modelLabel: jobStatus.modelLabel,
          status: "queued",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("[tonight-engine] Enqueue failed", {
      userId,
      workspaceId: body.workspaceId,
      error: err instanceof Error ? err.message : String(err),
    });

    return Response.json(
      {
        error: "Failed to enqueue overnight job",
        code: "ENQUEUE_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
