import { describe, it, expect } from "vitest";
import { taskQueue } from "../task-queue";

describe("TaskQueueManager (Transactional Outbox Runner)", () => {
  it("enqueues a background job and transitions to completed", async () => {
    const job = await taskQueue.enqueueJob("DEEP_RESEARCH", "usr_test_queue", {
      query: "Bangladesh E-Commerce Logistics Growth",
    });

    expect(job).toBeDefined();
    expect(job.id).toContain("JOB_DEEP_");
    expect(job.type).toBe("DEEP_RESEARCH");
    expect(job.status).toBe("queued");

    // Wait for async execution tick to complete
    await new Promise((r) => setTimeout(r, 700));

    const completedJob = taskQueue.getJob(job.id);
    expect(completedJob).toBeDefined();
    expect(completedJob?.status).toBe("completed");
    expect(completedJob?.progress).toBe(100);
    expect(completedJob?.result.sourcesScanned).toBe(18);
  });

  it("deduplicates jobs when enqueued with an identical idempotencyKey", async () => {
    const idempotencyKey = `job_idem_${Date.now()}`;

    const job1 = await taskQueue.enqueueJob(
      "BULK_COURIER_RECONCILIATION",
      "usr_test_queue",
      { provider: "steadfast" },
      idempotencyKey
    );

    const job2 = await taskQueue.enqueueJob(
      "BULK_COURIER_RECONCILIATION",
      "usr_test_queue",
      { provider: "steadfast" },
      idempotencyKey
    );

    // Both should return the same job instance
    expect(job1.id).toBe(job2.id);
  });

  it("lists all jobs belonging to a specific user", async () => {
    const userId = `usr_list_${Date.now()}`;
    await taskQueue.enqueueJob("BOOK_PDF_COMPILATION", userId, { title: "Test Book" });

    const userJobs = taskQueue.listJobs(userId);
    expect(userJobs.length).toBeGreaterThanOrEqual(1);
    expect(userJobs[0].userId).toBe(userId);
  });
});
