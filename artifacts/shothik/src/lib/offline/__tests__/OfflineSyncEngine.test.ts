import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OfflineSyncEngine } from "../OfflineSyncEngine";
import {
  clearOfflineStorage,
  saveOfflineTranscript,
  getOfflineTranscript,
  listOutbox,
  getOutboxItem,
} from "../offline-storage";

describe("OfflineSyncEngine", () => {
  beforeEach(() => {
    clearOfflineStorage();
    OfflineSyncEngine.resetInstance();
  });

  afterEach(() => {
    OfflineSyncEngine.resetInstance();
  });

  it("enqueues items to offline outbox and notifies subscribers", () => {
    const engine = new OfflineSyncEngine();
    let lastStatus: any = null;

    const unsubscribe = engine.subscribe((status) => {
      lastStatus = status;
    });

    const item = engine.enqueue("courier_dispatch", { trackingId: "ST-998811" });
    expect(item.id).toBeDefined();
    expect(item.status).toBe("queued");
    expect(lastStatus.pendingCount).toBeGreaterThanOrEqual(1);

    unsubscribe();
  });

  it("flushes queued items using custom transport handler successfully", async () => {
    const transported: string[] = [];
    const mockTransport = vi.fn().mockImplementation(async (item) => {
      transported.push(item.id);
      return { success: true };
    });

    const engine = new OfflineSyncEngine(mockTransport);
    engine.setOnlineStatus(false); // prevent auto-flush on enqueue

    const item1 = engine.enqueue("mfs_verify", { trxId: "TRX-101" }, "item-1");
    const item2 = engine.enqueue("mfs_verify", { trxId: "TRX-102" }, "item-2");

    expect(listOutbox("queued")).toHaveLength(2);

    engine.setOnlineStatus(true, false);
    const result = await engine.flush(mockTransport);

    expect(result.flushed).toBe(2);
    expect(result.failed).toBe(0);
    expect(transported).toEqual(["item-1", "item-2"]);
    expect(listOutbox()).toHaveLength(0);
  });

  it("updates chat transcript to synced when chat_turn outbox item flushes", async () => {
    saveOfflineTranscript({
      conversationId: "conv-sync-01",
      messages: [],
      updatedAt: 1000,
      syncStatus: "pending_upload",
    });

    const mockTransport = vi.fn().mockResolvedValue({ success: true });
    const engine = new OfflineSyncEngine(mockTransport);
    engine.setOnlineStatus(false);

    engine.enqueue("chat_turn", {
      conversationId: "conv-sync-01",
      content: "Hello offline agent",
    });

    engine.setOnlineStatus(true, false);
    await engine.flush(mockTransport);

    const transcript = getOfflineTranscript("conv-sync-01");
    expect(transcript?.syncStatus).toBe("synced");
  });

  it("handles transport errors by incrementing retry count and marking as failed", async () => {
    const mockTransport = vi.fn().mockResolvedValue({
      success: false,
      error: "401 Unauthorized / Insufficient token quota",
    });

    const engine = new OfflineSyncEngine(mockTransport);
    engine.setOnlineStatus(false);

    const item = engine.enqueue(
      "webhook_event",
      { event: "order_created" },
      "err-item-1"
    );

    engine.setOnlineStatus(true, false);
    const result = await engine.flush(mockTransport);

    expect(result.failed).toBe(1);
    expect(result.flushed).toBe(0);

    const stored = getOutboxItem("err-item-1");
    expect(stored?.status).toBe("failed");
    expect(stored?.retryCount).toBe(1);
    expect(stored?.error).toContain("Insufficient token quota");
  });

  it("performs deterministic CRDT version vector conflict resolution", () => {
    const local = {
      content: "Local offline draft text",
      versionVector: { nodeA: 2, nodeB: 1 },
      updatedAt: 2000,
    };

    const remote = {
      content: "Remote server text",
      versionVector: { nodeA: 1, nodeB: 3 },
      updatedAt: 1500,
    };

    const merged = OfflineSyncEngine.resolveVectorMerge(local, remote);
    // Local has higher updatedAt (2000 > 1500), so local content wins
    expect(merged.content).toBe("Local offline draft text");
    expect(merged.conflict).toBe(false);
    expect(merged.versionVector).toEqual({ nodeA: 2, nodeB: 3 });

    // When remote has higher updatedAt
    const remoteNewer = {
      content: "Newer remote text",
      versionVector: { nodeA: 1, nodeB: 4 },
      updatedAt: 3000,
    };

    const mergedRemote = OfflineSyncEngine.resolveVectorMerge(local, remoteNewer);
    expect(mergedRemote.content).toBe("Newer remote text");
    expect(mergedRemote.conflict).toBe(true);
    expect(mergedRemote.versionVector).toEqual({ nodeA: 2, nodeB: 4 });
  });
});
