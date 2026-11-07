import { describe, it, expect, afterAll } from "vitest";
import { queueManager } from "../bullmq-queue";

describe("BullMQ Task Queue & Async Processors", () => {
  afterAll(async () => {
    await queueManager.close();
  });

  it("submits a batch-humanize job and reports progress until completion", async () => {
    const text = "Furthermore, this study delves into AI detection mechanisms.\n\nMoreover, the experimental results prove efficiency.";
    const { jobId } = await queueManager.addJob("batch-humanize", {
      text,
      mode: "academic",
      language: "en",
      zeroExpansion: false,
    }, "usr_test_queue");

    expect(jobId).toBeDefined();
    expect(jobId).toContain("job_batch-humanize_");

    // Poll until completed (timeout 25s)
    let status = await queueManager.getJobStatus(jobId);
    let attempts = 0;
    while (status && (status.state === "active" || status.state === "waiting") && attempts < 60) {
      await new Promise((r) => setTimeout(r, 350));
      status = await queueManager.getJobStatus(jobId);
      attempts++;
    }

    expect(status).not.toBeNull();
    expect(status?.state).toBe("completed");
    expect(status?.progress).toBe(100);
    expect(status?.result?.success).toBe(true);
    expect(status?.result?.data?.paragraphsCount).toBe(2);
    expect(status?.result?.data?.humanizedText).toBeDefined();
  }, 30000);

  it("submits a plagiarism-scan job and calculates originality score", async () => {
    const text = "The quick brown fox jumps over the lazy dog in deep academic verification.";
    const { jobId } = await queueManager.addJob("plagiarism-scan", { text });

    let status = await queueManager.getJobStatus(jobId);
    let attempts = 0;
    while (status && (status.state === "active" || status.state === "waiting") && attempts < 60) {
      await new Promise((r) => setTimeout(r, 350));
      status = await queueManager.getJobStatus(jobId);
      attempts++;
    }

    expect(status?.state).toBe("completed");
    expect(status?.result?.data?.originalityScore).toBeDefined();
  }, 30000);
});
