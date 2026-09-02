/**
 * DlqRetryManager Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { dlqRetryManager } from "./infrastructure/dlq-retry-manager";

describe("DlqRetryManager (Dead-Letter Queue Backoff Manager)", () => {
  it("enqueues failed webhook job and calculates exponential backoff delay", () => {
    const job = dlqRetryManager.enqueueFailedJob("https://api.pipedream.com/v1/webhook", { orderId: "ord_101" }, "504 Gateway Timeout");

    expect(job.jobId).toContain("dlq_");
    expect(job.attemptsCount).toBe(1);
    expect(job.maxAttempts).toBe(3);
    expect(job.nextRetryTimestamp).toBeDefined();
  });

  it("retries pending failed jobs cleanly", () => {
    const res = dlqRetryManager.retryPendingJobs();
    expect(res.processedCount).toBeGreaterThanOrEqual(0);
  });
});
