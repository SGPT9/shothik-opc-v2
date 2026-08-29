import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { validateRequest } from "../../lib/middleware/zod-validator";
import { JobSubmitSchema, NilkhetOrderCreateSchema } from "@workspace/api-zod";
import jobsRouter from "../jobs";
import mfsRouter from "../mfs";
import { taskQueue } from "../../lib/queue/task-queue";
import { offlineSyncEngine } from "@workspace/db";

describe("Deep-Tech Production Backend Hardening", () => {
  let app: express.Application;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use("/api", jobsRouter);
    app.use("/api", mfsRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe("WP1: RFC 7807 Zod Schema Validation Middleware", () => {
    it("should reject invalid job submission payload with RFC 7807 problem details", async () => {
      const res = await fetch(`${baseUrl}/api/v1/jobs/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "INVALID_TASK_TYPE" }),
      });

      expect(res.status).toBe(400);
      expect(res.headers.get("content-type")).toContain("application/problem+json");
      const body = (await res.json()) as any;
      expect(body.type).toBe("https://api.shothikgpt.com/errors/validation-error");
      expect(body.title).toBe("Invalid Request Payload");
      expect(body.status).toBe(400);
      expect(Array.isArray(body.invalidParams)).toBe(true);
      expect(body.invalidParams.length).toBeGreaterThan(0);
    });

    it("should accept valid job submission payload", async () => {
      const res = await fetch(`${baseUrl}/api/v1/jobs/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DEEP_RESEARCH",
          userId: "usr_test_123",
          data: { query: "Bangladesh AI Market 2026" },
        }),
      });

      expect(res.status).toBe(202);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.jobId).toMatch(/^JOB_DEEP_/);
      expect(body.streamUrl).toBe(`/api/v1/jobs/${body.jobId}/stream`);
    });
  });

  describe("WP2 & WP3: Task Queue Execution & SSE Streaming", () => {
    it("should enqueue and track background job lifecycle", async () => {
      const job = taskQueue.enqueueJob("BULK_COURIER_RECONCILIATION", "usr_test", { batchId: "B1" });
      expect(job.id).toBeDefined();
      expect(job.type).toBe("BULK_COURIER_RECONCILIATION");

      const fetched = taskQueue.getJob(job.id);
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(job.id);
    });

    it("should stream initial snapshot for ongoing job via SSE", async () => {
      const job = taskQueue.enqueueJob("BOOK_PDF_COMPILATION", "usr_test", { title: "Test Manuscript" });

      const res = await fetch(`${baseUrl}/api/v1/jobs/${job.id}/stream`, {
        headers: { Accept: "text/event-stream" },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");
      const text = await res.text();
      expect(text).toContain(job.id);
      expect(text).toContain("BOOK_PDF_COMPILATION");
    });
  });

  describe("WP4: Offline SQLite Sync Engine", () => {
    it("should initialize and report sync status", async () => {
      const status = offlineSyncEngine.getStatus();
      expect(status).toBeDefined();
      expect(typeof status.syncedProjectsCount).toBe("number");
      expect(typeof status.syncedParcelsCount).toBe("number");
    });

    it("should gracefully handle offline flush when postgres is unreachable", async () => {
      vi.spyOn(offlineSyncEngine, "isPostgresHealthy").mockResolvedValue(false);
      const res = await offlineSyncEngine.flushOfflineQueue();
      expect(res.isPostgresConnected).toBe(false);
    });
  });

  describe("WP5: MFS Automated IPN Webhook Settlement", () => {
    it("should reject invalid IPN webhook payload", async () => {
      const res = await fetch(`${baseUrl}/api/v1/mfs/ipn/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Failed" }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
    });

    it("should process and settle valid bKash/Nagad IPN webhook", async () => {
      const testTrxId = `IPN${Date.now().toString().slice(-6)}`;
      const res = await fetch(`${baseUrl}/api/v1/mfs/ipn/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: testTrxId,
          amount: 299,
          currency: "BDT",
          status: "Completed",
          customerMsisdn: "01712345678",
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.trxId).toBe(testTrxId);
      expect(body.status).toBe("SETTLED");
      expect(body.amount).toBe(299);
    });

    it("should handle duplicate IPN webhook calls idempotently", async () => {
      const duplicateTrxId = `DUP${Date.now().toString().slice(-6)}`;
      
      // First call
      await fetch(`${baseUrl}/api/v1/mfs/ipn/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trxId: duplicateTrxId, amount: 49, status: "Completed" }),
      });

      // Second call (replay)
      const res = await fetch(`${baseUrl}/api/v1/mfs/ipn/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trxId: duplicateTrxId, amount: 49, status: "Completed" }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.status).toBe("ALREADY_PROCESSED");
    });
  });
});
