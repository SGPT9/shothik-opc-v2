import { Router, type Request, type Response } from "express";
import { healthProbeService } from "../../../shothik/src/lib/infrastructure/health-probe-service";

const router = Router();

/**
 * GET /healthz/liveness
 * Kubernetes / Dokploy Liveness Probe
 */
router.get("/healthz/liveness", (_req: Request, res: Response) => {
  const result = healthProbeService.checkLiveness();
  return res.status(200).json(result);
});

/**
 * GET /healthz/readiness
 * Kubernetes / Dokploy Readiness Probe
 */
router.get("/healthz/readiness", (_req: Request, res: Response) => {
  const result = healthProbeService.checkReadiness();
  const statusCode = result.status === "UP" ? 200 : 503;
  return res.status(statusCode).json(result);
});

export default router;
