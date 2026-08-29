import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { validateRequest } from "../../lib/middleware/zod-validator";
import { JobSubmitSchema, NilkhetOrderCreateSchema } from "@workspace/api-zod";
import jobsRouter from "../jobs";
import mfsRouter from "../mfs";
import { taskQueue } from "../../lib/queue/task-queue";
import { offlineSyncEngine } from "@workspace/db";

describe("Deep-Tech Production Backend Hardening", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", jobsRouter);
    app.use("/api", mfsRouter);
  });

  describe("WP1: RFC 7807 Zod Schema Validation Middleware", () => {
    it("should reject invalid job submission payload with RFC 7807 problem details", async () => {
      const res = await request(app)
        .post("/api/v1/jobs/submit")
        .send({ type: "INVALID_TASK_TYPE" });

      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toContain("application/problem+json");
      expect(res.body.type).toBe("https://api.shothikgpt.com/errors/validation-error");
      expect(res.body.title).toBe("Invalid Request Payload");
      expect(res.body.status).toBe(400);
      expect(Array.isArray(res.body.invalidParams)).toBe(true);
      expect(res.body.invalidParams.length).toBeGreaterThan(0);
    });

    it("should accept valid job submission payload", async () => {
      const res = await request(app)
        .post("/api/v1/jobs/submit")
        .send({
          type: "DEEP_RESEARCH",
          userId: "usr_test_123",
          data: { query: "Bangladesh AI Market 2026" },
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.jobId).toMatch(/^JOB_DEEP_/);
      expect(res.body.streamUrl).toBe(`/api/v1/jobs/${res.body.jobId}/stream`);
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

      const res = await request(app)
        .get(`/api/v1/jobs/${job.id}/stream`)
        .set("Accept", "text/event-stream");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");
      expect(res.text).toContain(job.id);
      expect(res.text).toContain("BOOK_PDF_COMPILATION");
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
      const res = await request(app)
        .post("/api/v1/mfs/ipn/webhook")
        .send({ status: "Failed" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should process and settle valid bKash/Nagad IPN webhook", async () => {
      const testTrxId = `IPN${Date.now().toString().slice(-6)}`;
      const res = await request(app)
        .post("/api/v1/mfs/ipn/webhook")
        .send({
          trxId: testTrxId,
          amount: 299,
          currency: "BDT",
          status: "Completed",
          customerMsisdn: "01712345678",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.trxId).toBe(testTrxId);
      expect(res.body.status).toBe("SETTLED");
      expect(res.body.amount).toBe(299);
    });

    it("should handle duplicate IPN webhook calls idempotently", async () => {
      const duplicateTrxId = `DUP${Date.now().toString().slice(-6)}`;
      
      // First call
      await request(app)
        .post("/api/v1/mfs/ipn/webhook")
        .send({ trxId: duplicateTrxId, amount: 49, status: "Completed" });

      // Second call (replay)
      const res = await request(app)
        .post("/api/v1/mfs/ipn/webhook")
        .send({ trxId: duplicateTrxId, amount: 49, status: "Completed" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("ALREADY_PROCESSED");
    });
  });
});
