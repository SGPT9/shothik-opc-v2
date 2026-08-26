import { describe, it, expect, beforeEach } from "vitest";
import { HermesQueueConsumer } from "../queue-consumer.js";

describe("HermesQueueConsumer (Async Background Jobs)", () => {
  let consumer: HermesQueueConsumer;

  beforeEach(() => {
    consumer = new HermesQueueConsumer("test-worker-queue");
  });

  it("enqueues tasks and tracks pending queue depth", () => {
    consumer.enqueue("deep_research", { topic: "bKash MFS Regulations 2026" });
    consumer.enqueue("book_compilation", { bookId: "book-101" });

    expect(consumer.getPendingCount()).toBe(2);
  });

  it("processes batch items successfully", async () => {
    consumer.enqueue("swarm_task", { goal: "Audit security headers" });

    const report = await consumer.processBatch(async (msg) => {
      expect(msg.type).toBe("swarm_task");
      return { success: true };
    });

    expect(report.processed).toBe(1);
    expect(report.failed).toBe(0);
    expect(consumer.getPendingCount()).toBe(0);
  });

  it("requeues failed tasks up to maxRetries before sending to DLQ", async () => {
    consumer.enqueue("mfs_reconciliation", { batchId: "bat-001" }, 2);

    // Attempt 1: Fails
    const report1 = await consumer.processBatch(async () => {
      return { success: false, error: "Network timeout" };
    });
    expect(report1.retried).toBe(1);
    expect(consumer.getPendingCount()).toBe(1);

    // Attempt 2: Fails again (reaches maxRetries = 2)
    const report2 = await consumer.processBatch(async () => {
      return { success: false, error: "Network timeout again" };
    });
    expect(report2.retried).toBe(1);

    // Attempt 3: Exceeds maxRetries -> DLQ
    const report3 = await consumer.processBatch(async () => {
      return { success: false, error: "Final failure" };
    });
    expect(report3.failed).toBe(1);
    expect(consumer.getPendingCount()).toBe(0);
  });
});
