import { Router, type Request, type Response } from "express";
import { databaseBackupService } from "../db/backup-restore-service";
import { requestValidatorService, requestSanitizerMiddleware } from "../lib/request-validator";

const router = Router();

router.use(requestSanitizerMiddleware());

/**
 * POST /api/v1/db/backup/create
 * Create encrypted database snapshot
 */
router.post("/v1/db/backup/create", (req: Request, res: Response) => {
  const { snapshotName } = req.body;
  const snapshot = databaseBackupService.createSnapshot(snapshotName);

  return res.status(200).json({
    success: true,
    snapshot,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/db/backup/restore
 * Restore database from snapshot ID
 */
router.post("/v1/db/backup/restore", (req: Request, res: Response) => {
  const { snapshotId } = req.body;

  if (!snapshotId) {
    return res.status(400).json({ success: false, error: "snapshotId is required" });
  }

  const result = databaseBackupService.restoreSnapshot(snapshotId);

  return res.status(200).json({
    success: true,
    result,
  });
});

/**
 * POST /api/v1/security/sanitize-test
 * Test payload sanitization against XSS & SQL injection
 */
router.post("/v1/security/sanitize-test", (req: Request, res: Response) => {
  const sanitized = requestValidatorService.sanitizeInput(req.body);

  return res.status(200).json({
    success: true,
    sanitizedPayload: sanitized,
    timestamp: new Date().toISOString(),
  });
});

export default router;
