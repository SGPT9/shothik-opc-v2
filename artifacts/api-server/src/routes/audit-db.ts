import { Router, type Request, type Response } from "express";
import { financialAuditLedger } from "../lib/financial-audit-ledger";
import { databasePoolSentinel } from "../lib/db-pool-sentinel";

const router = Router();

/**
 * GET /api/v1/audit/ledger-verify
 * Verifies cryptographic integrity of the SHA-256 financial ledger chain
 */
router.get("/v1/audit/ledger-verify", (_req: Request, res: Response) => {
  const result = financialAuditLedger.verifyLedgerIntegrity();
  return res.status(200).json({
    success: true,
    isValid: result.isValid,
    totalEntries: result.totalEntries,
    tamperedEntryId: result.tamperedEntryId || null,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/db/pool-health
 * Returns PostgreSQL connection pool health status & query timeout diagnostics
 */
router.get("/v1/db/pool-health", (_req: Request, res: Response) => {
  const health = databasePoolSentinel.getHealthStatus();
  return res.status(200).json({
    success: true,
    health,
    timestamp: new Date().toISOString(),
  });
});

export default router;
