import { describe, it, expect, vi, beforeEach } from "vitest";
import { OfflineCrdtStore, type OfflineDocument } from "../offline-crdt-store";

describe("OfflineCrdtStore (Offline-First CRDT & Outbox Sync)", () => {
  let store: OfflineCrdtStore;

  beforeEach(() => {
    store = new OfflineCrdtStore();
  });

  it("performs optimistic 0ms local document write and tracks version vectors", () => {
    const doc = store.writeDocumentOptimistic(
      "doc_chapter_1",
      "Chapter 1: The AI Solopreneur",
      "Draft content in Bengali and English",
      "device_macbook"
    );

    expect(doc.key).toBe("doc_chapter_1");
    expect(doc.versionVector["device_macbook"]).toBe(1);

    // Second write increments client version
    const updated = store.writeDocumentOptimistic(
      "doc_chapter_1",
      "Chapter 1: The AI Solopreneur (Rev 2)",
      "Updated draft content",
      "device_macbook"
    );

    expect(updated.versionVector["device_macbook"]).toBe(2);
  });

  it("merges remote document deterministically using version vectors and timestamps", () => {
    store.writeDocumentOptimistic(
      "doc_shared_101",
      "Initial Title",
      "Initial Content",
      "device_phone"
    );

    const remoteDoc: OfflineDocument = {
      key: "doc_shared_101",
      title: "Remote Updated Title",
      content: "Remote Updated Content",
      versionVector: { device_laptop: 3 },
      updatedAt: Date.now() + 5000,
    };

    const merged = store.mergeRemoteDocument(remoteDoc);

    expect(merged.title).toBe("Remote Updated Title");
    expect(merged.content).toBe("Remote Updated Content");
    expect(merged.versionVector["device_phone"]).toBe(1);
    expect(merged.versionVector["device_laptop"]).toBe(3);
  });

  it("queues and flushes offline outbox actions on reconnection", async () => {
    store.setOnlineStatus(false);
    expect(store.isOnline()).toBe(false);

    // Queue offline logistics booking
    store.queueOutboxAction("courier_dispatch", {
      recipientName: "Rifat Hasan",
      amountBdt: 1200,
    });

    // Queue offline payment check
    store.queueOutboxAction("mfs_verify", {
      trxId: "TRX881239",
    });

    expect(store.getOutboxItems()).toHaveLength(2);

    // Reconnection & flush
    store.setOnlineStatus(true);
    const mockSender = vi.fn().mockResolvedValue({ success: true });

    const result = await store.flushOutbox(mockSender);

    expect(result.flushedCount).toBe(2);
    expect(result.remainingCount).toBe(0);
    expect(mockSender).toHaveBeenCalledTimes(2);
  });
});
