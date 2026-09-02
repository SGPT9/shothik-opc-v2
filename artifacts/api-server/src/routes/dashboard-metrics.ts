import { Router, type Request, type Response } from "express";
import { dashboardMetricsService } from "../../../shothik/src/lib/infrastructure/dashboard-metrics-service";

const router = Router();

/**
 * GET /api/v1/dashboard/metrics
 * Returns real-time system metrics overview for admin telemetry dashboard
 */
router.get("/v1/dashboard/metrics", (_req: Request, res: Response) => {
  const metrics = dashboardMetricsService.getSystemMetricsOverview();
  return res.status(200).json({
    success: true,
    metrics,
  });
});

export default router;
