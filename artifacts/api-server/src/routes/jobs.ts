import { Router, Request, Response } from "express";
import { taskQueue, JobType } from "../lib/queue/task-queue";
import { dbAutoSync } from "../lib/db-bootstrap";

const router = Router();

/**
 * POST /api/v1/jobs/submit
 * Enqueue a long-running background job (Deep Research, Courier Sync, Book Compilation)
 */
router.post("/v1/jobs/submit", (req: Request, res: Response): void => {
  try {
    const { type, data = {}, userId = "usr_default" } = req.body;

    const validTypes: JobType[] = [
      "DEEP_RESEARCH",
      "BULK_COURIER_RECONCILIATION",
      "BOOK_PDF_COMPILATION",
      "SEMANTIC_VAULT_REINDEX",
    ];

    if (!type || !validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: `Invalid job type. Supported types: ${validTypes.join(", ")}`,
      });
      return;
    }

    const job = taskQueue.enqueueJob(type, userId, data);

    res.status(202).json({
      success: true,
      jobId: job.id,
      type: job.type,
      status: job.status,
      message: "Job enqueued for background processing.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/jobs/:jobId
 * Poll status, progress (0-100%), and results of an ongoing background job
 */
router.get("/v1/jobs/:jobId", (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const job = taskQueue.getJob(jobId);

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
