import { Router, type Request, type Response } from "express";
import { dlqRetryManager } from "../../../shothik/src/lib/infrastructure/dlq-retry-manager";

const router = Router();

/**
 * POST /api/v1/dlq/retry-failed
 * Retry pending Dead-Letter Queue failed jobs
 */
router.post("/v1/dlq/retry-failed", (_req: Request, res: Response) => {
  const result = dlqRetryManager.retryPendingJobs();
  return res.status(200).json({
    success: true,
    result,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/dlq/metrics
 * Returns DLQ metrics and failed webhook counts
 */
router.get("/v1/dlq/metrics", (_req: Request, res: Response) => {
  const metrics = dlqRetryManager.getMetrics();
  return res.status(200).json({
    success: true,
    metrics,
    timestamp: new Date().toISOString(),
  });
});

export default router;
