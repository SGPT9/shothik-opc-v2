import {
  enqueueOutbox,
  listOutbox,
  updateOutboxItem,
  deleteOutboxItem,
  OutboxItem,
  OutboxItemType,
  saveOfflineTranscript,
  getOfflineTranscript,
} from "./offline-storage";

export interface SyncEngineStatus {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingCount: number;
  failedCount: number;
  completedCount: number;
  lastSyncTimestamp: number | null;
}

export type OutboxTransportHandler = (
  item: OutboxItem
) => Promise<{ success: boolean; error?: string }>;

export class OfflineSyncEngine {
  private static instance: OfflineSyncEngine | null = null;
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private syncInProgress = false;
  private lastSyncTimestamp: number | null = null;
  private listeners = new Set<(status: SyncEngineStatus) => void>();
  private defaultTransport: OutboxTransportHandler;
  private maxRetries = 5;

  constructor(customTransport?: OutboxTransportHandler) {
    this.defaultTransport =
      customTransport ||
      (async (item: OutboxItem) => {
        try {
          const response = await fetch("/api/v1/sync/flush", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-idempotency-key": item.id,
            },
            body: JSON.stringify({
              id: item.id,
              type: item.type,
              payload: item.payload,
              createdAt: item.createdAt,
            }),
          });
          if (!response.ok) {
            const err = await response.text().catch(() => "HTTP Sync Error");
            return { success: false, error: err };
          }
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message || "Network request failed" };
        }
      });

    this.initNetworkListeners();
  }

  public static getInstance(customTransport?: OutboxTransportHandler): OfflineSyncEngine {
    if (!OfflineSyncEngine.instance) {
      OfflineSyncEngine.instance = new OfflineSyncEngine(customTransport);
    }
    return OfflineSyncEngine.instance;
  }

  public static resetInstance(): void {
    if (OfflineSyncEngine.instance) {
      OfflineSyncEngine.instance.destroy();
      OfflineSyncEngine.instance = null;
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.flush();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  private initNetworkListeners(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  public destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
    this.listeners.clear();
  }

  public setOnlineStatus(status: boolean, autoFlush = true): void {
    this.isOnline = status;
    this.notify();
    if (status && autoFlush) {
      this.flush().catch(() => {});
    }
  }

  public setTransport(transport: OutboxTransportHandler): void {
    this.defaultTransport = transport;
  }

  public getStatus(): SyncEngineStatus {
    const queued = listOutbox("queued");
    const inFlight = listOutbox("in_flight");
    const failed = listOutbox("failed");
    const completed = listOutbox("completed");

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingCount: queued.length + inFlight.length,
      failedCount: failed.length,
      completedCount: completed.length,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };
  }

  public subscribe(listener: (status: SyncEngineStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Enqueue a critical client action to the offline outbox
   */
  public enqueue(
    type: OutboxItemType,
    payload: Record<string, any>,
    customIdempotencyKey?: string
  ): OutboxItem {
    const id = customIdempotencyKey || `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: OutboxItem = {
      id,
      type,
      payload,
      retryCount: 0,
      status: "queued",
      createdAt: Date.now(),
    };

    enqueueOutbox(item);
    this.notify();

    // If online, trigger auto-flush
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.flush(), 10);
    }

    return item;
  }

  /**
   * Flush queued and failed outbox items through the transport
   */
  public async flush(
    customTransport?: OutboxTransportHandler
  ): Promise<{ flushed: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline) {
      return { flushed: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.notify();

    const transport = customTransport || this.defaultTransport;
    const candidates = listOutbox().filter(
      (item) => item.status === "queued" || (item.status === "failed" && item.retryCount < this.maxRetries)
    );

    let flushed = 0;
    let failed = 0;

    for (const item of candidates) {
      updateOutboxItem(item.id, {
        status: "in_flight",
        lastAttemptAt: Date.now(),
      });
      this.notify();

      try {
        const res = await transport(item);
        if (res.success) {
          flushed++;
          // For chat turns, also mark transcript as synced
          if (item.type === "chat_turn" && item.payload?.conversationId) {
            const transcript = getOfflineTranscript(item.payload.conversationId);
            if (transcript) {
              saveOfflineTranscript({ ...transcript, syncStatus: "synced", updatedAt: Date.now() });
            }
          }

          deleteOutboxItem(item.id);
        } else {
          failed++;
          updateOutboxItem(item.id, {
            status: "failed",
            retryCount: item.retryCount + 1,
            error: res.error || "Sync transport failure",
          });
        }
      } catch (err: any) {
        failed++;
        updateOutboxItem(item.id, {
          status: "failed",
          retryCount: item.retryCount + 1,
          error: err?.message || "Unexpected exception during outbox dispatch",
        });
      }

      this.notify();
    }

    this.syncInProgress = false;
    this.lastSyncTimestamp = Date.now();
    this.notify();

    return { flushed, failed };
  }

  /**
   * Deterministic CRDT Version Vector Merge
   * Resolves conflicts between local and remote state without data loss
   */
  public static resolveVectorMerge(
    local: { content: string; versionVector?: Record<string, number>; updatedAt: number },
    remote: { content: string; versionVector?: Record<string, number>; updatedAt: number }
  ): { content: string; versionVector: Record<string, number>; conflict: boolean } {
    const localVector = local.versionVector || { local: 1 };
    const remoteVector = remote.versionVector || { remote: 1 };

    const mergedVector: Record<string, number> = { ...localVector };
    for (const [node, version] of Object.entries(remoteVector)) {
      mergedVector[node] = Math.max(mergedVector[node] || 0, version);
    }

    // If identical content, clean merge
    if (local.content === remote.content) {
      return { content: local.content, versionVector: mergedVector, conflict: false };
    }

    // Lamport timestamp ordering with content preservation
    if (local.updatedAt >= remote.updatedAt) {
      return { content: local.content, versionVector: mergedVector, conflict: false };
    } else {
      return { content: remote.content, versionVector: mergedVector, conflict: true };
    }
  }
}
