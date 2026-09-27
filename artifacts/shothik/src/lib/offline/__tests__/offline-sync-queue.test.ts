import { describe, it, expect, vi, beforeEach } from "vitest";
import { OfflineSyncQueue } from "../offline-sync-queue";

describe("OfflineSyncQueue & Network Resilience Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enqueues offline requests and updates pending count", () => {
    const queue = new OfflineSyncQueue();
    const id = queue.enqueue("/api/ivr/parse-address", "POST", { rawAddress: "Mirpur 10, Dhaka" });

    expect(id).toMatch(/^REQ-/);
    expect(queue.getPendingCount()).toBe(1);
  });

  it("processes queue automatically when online and flushes items on HTTP 200", async () => {
    const queue = new OfflineSyncQueue();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    queue.enqueue("/api/events/publish", "POST", { eventType: "test" });
    await queue.processQueue();

    expect(queue.getPendingCount()).toBe(0);
  });
});
