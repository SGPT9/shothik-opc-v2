import { Router, type Request, type Response } from "express";
import { cacheManager } from "../lib/cache-manager";
import { llmCircuitBreaker } from "../lib/circuit-breaker";

const router = Router();

/**
 * GET /api/v1/resilience/cache-stats
 * Returns key-value cache performance statistics and hit-ratios
 */
router.get("/v1/resilience/cache-stats", (_req: Request, res: Response) => {
  const stats = cacheManager.getStats();
  return res.status(200).json({
    success: true,
    stats,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/resilience/breaker-status
 * Returns circuit breaker trip states for LLM & PGW integrations
 */
router.get("/v1/resilience/breaker-status", (_req: Request, res: Response) => {
  const status = llmCircuitBreaker.getStatus();
  return res.status(200).json({
    success: true,
    status,
    timestamp: new Date().toISOString(),
  });
});

export default router;
