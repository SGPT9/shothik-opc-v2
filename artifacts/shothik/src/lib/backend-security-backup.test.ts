/**
 * Full Backend DB Backup & Request Security Sanitizer Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { databaseBackupService } from "../../../api-server/src/db/backup-restore-service";
import { requestValidatorService } from "../../../api-server/src/lib/request-validator";

describe("Full Backend Security & Storage Backup Suite", () => {
  describe("DatabaseBackupService (Encrypted Snapshot & Restore Engine)", () => {
    it("creates snapshot, lists backups, and executes 1-click restore", () => {
      const snap = databaseBackupService.createSnapshot("daily_prod_snap");
      expect(snap.snapshotId).toContain("snp_");
      expect(snap.snapshotName).toBe("daily_prod_snap.sql.gz");
      expect(snap.tablesCount).toBe(6);

      const snapshotsList = databaseBackupService.listSnapshots();
      expect(snapshotsList.length).toBeGreaterThan(0);

      const restoreRes = databaseBackupService.restoreSnapshot(snap.snapshotId);
      expect(restoreRes.success).toBe(true);
      expect(restoreRes.restoredTablesCount).toBe(6);
    });
  });

  describe("RequestValidatorService (XSS & SQL Injection Sanitizer)", () => {
    it("sanitizes XSS script tags and SQL injection syntax from input payloads", () => {
      const maliciousInput = {
        username: "<script>alert('hack')</script>আরিফ",
        query: "' OR '1'='1",
      };

      const sanitized = requestValidatorService.sanitizeInput(maliciousInput);

      expect(sanitized.username).toBe("[REMOVED_SCRIPT]আরিফ");
      expect(sanitized.query).toBe("[REMOVED_SQL_INJECTION]");
    });
  });
});
