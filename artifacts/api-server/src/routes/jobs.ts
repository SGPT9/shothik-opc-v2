import { Router, Request, Response } from "express";
import { taskQueue, JobType, JobProgressEvent } from "../lib/queue/task-queue";
import { dbAutoSync } from "../lib/db-bootstrap";
import { validateRequest } from "../lib/middleware/zod-validator";
import { JobSubmitSchema } from "@workspace/api-zod";

const router = Router();

/**
 * POST /api/v1/jobs/submit
 * Enqueue a long-running background job (Deep Research, Courier Sync, Book Compilation)
 */
router.post(
  "/v1/jobs/submit",
  validateRequest(JobSubmitSchema),
  (req: Request, res: Response): void => {
    try {
      const { type, data = {}, userId = "usr_default" } = req.body;
      const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

      const job = taskQueue.enqueueJob(type as JobType, userId, data, idempotencyKey);

      res.status(202).json({
        success: true,
        jobId: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        message: "Job enqueued for background processing.",
        streamUrl: `/api/v1/jobs/${job.id}/stream`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/v1/jobs/:jobId/stream
 * Real-time Server-Sent Events (SSE) stream for live job progress & step events
 */
router.get("/v1/jobs/:jobId/stream", (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const job = taskQueue.getJob(jobId as string);

  if (!job) {
    res.status(404).json({ success: false, error: "Job not found" });
    return;
  }

  // Set standard SSE streaming headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  // Send initial snapshot
  const initialEvent: JobProgressEvent = {
    jobId: job.id,
    type: job.type,
    progress: job.progress,
    status: job.status,
    stepMessage: job.stepMessage || `Job is currently ${job.status}`,
    timestamp: new Date().toISOString(),
  };
  res.write(`data: ${JSON.stringify(initialEvent)}\n\n`);

  // If already completed or failed, close immediately
  if (job.status === "completed" || job.status === "failed" || job.status === "dlq") {
    res.write(`data: ${JSON.stringify({ type: "done", result: job.result, error: job.error })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  // Heartbeat interval every 15s to keep connection alive
  const heartbeatTimer = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  // Progress listener
  const onProgress = (event: JobProgressEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.status === "completed" || event.status === "failed" || event.status === "dlq") {
      cleanup();
      res.write(`data: ${JSON.stringify({ type: "done", result: job.result, error: job.error })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  };

  const cleanup = () => {
    clearInterval(heartbeatTimer);
    taskQueue.removeListener(`progress:${jobId}`, onProgress);
  };

  taskQueue.on(`progress:${jobId}`, onProgress);

  req.on("close", cleanup);
  req.on("end", cleanup);
});

/**
 * GET /api/v1/jobs/:jobId
 * Poll status, progress (0-100%), and results of an ongoing background job
 */
router.get("/v1/jobs/:jobId", (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const job = taskQueue.getJob(jobId as string);

  if (!job) {
    res.status(404).json({ success: false, error: "Job not found" });
    return;
  }

  res.status(200).json({
    success: true,
    job,
  });
});

/**
 * GET /api/v1/jobs
 * List all active and completed background jobs for a user
 */
router.get("/v1/jobs", (req: Request, res: Response): void => {
  const userId = (req.query.userId as string) || (req.headers["x-user-id"] as string) || "usr_default";
  const jobs = taskQueue.listJobs(userId);

  res.status(200).json({
    success: true,
    userId,
    count: jobs.length,
    jobs,
  });
});

/**
 * GET /api/v1/system/db-status
 * Health status and schema sync metrics for PostgreSQL / SQLite
 */
router.get("/v1/system/db-status", async (_req: Request, res: Response): Promise<void> => {
  const status = await dbAutoSync.autoSync();
  res.status(200).json({
    success: true,
    db: status,
  });
});

export default router;
