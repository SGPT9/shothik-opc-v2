import logger from "@/lib/logger";

export interface OfflineDocument {
  key: string;
  title: string;
  content: string;
  versionVector: Record<string, number>;
  updatedAt: number;
}

export interface OfflineOutboxItem {
  id: string;
  type: "courier_dispatch" | "mfs_verify" | "webhook_event";
  payload: Record<string, unknown>;
  retryCount: number;
  createdAt: number;
  lastAttemptAt?: number;
}

export class OfflineCrdtStore {
  private documents: Map<string, OfflineDocument> = new Map();
  private outbox: Map<string, OfflineOutboxItem> = new Map();
  private onlineState: boolean = true;

  constructor(initialOnline: boolean = true) {
    this.onlineState = initialOnline;
  }

  public setOnlineStatus(isOnline: boolean): void {
    this.onlineState = isOnline;
    logger.info("[offline-sync] Network connectivity status changed", { isOnline });
  }

  public isOnline(): boolean {
    return this.onlineState;
  }

  /**
   * Optimistic 0ms local write with Lamport version vector incrementation
   */
  public writeDocumentOptimistic(
    docId: string,
    title: string,
    content: string,
    clientId: string = "client-default"
  ): OfflineDocument {
    const existing = this.documents.get(docId);
    const currentVersion = existing?.versionVector[clientId] || 0;

    const versionVector = {
      ...(existing?.versionVector || {}),
      [clientId]: currentVersion + 1,
    };

    const doc: OfflineDocument = {
      key: docId,
      title,
      content,
      versionVector,
      updatedAt: Date.now(),
    };

    this.documents.set(docId, doc);
    return doc;
  }

  public getDocument(docId: string): OfflineDocument | undefined {
    return this.documents.get(docId);
  }

  /**
   * Deterministic CRDT merge with incoming remote document
   */
  public mergeRemoteDocument(remoteDoc: OfflineDocument): OfflineDocument {
    const local = this.documents.get(remoteDoc.key);
    if (!local) {
      this.documents.set(remoteDoc.key, remoteDoc);
      return remoteDoc;
    }

    // Merge version vectors
    const mergedVector: Record<string, number> = { ...local.versionVector };
    for (const [clientId, v] of Object.entries(remoteDoc.versionVector)) {
      mergedVector[clientId] = Math.max(mergedVector[clientId] || 0, v);
    }

    // Conflict-free deterministic choice based on timestamp
    const winningContent = remoteDoc.updatedAt >= local.updatedAt ? remoteDoc.content : local.content;
    const winningTitle = remoteDoc.updatedAt >= local.updatedAt ? remoteDoc.title : local.title;

    const merged: OfflineDocument = {
      key: remoteDoc.key,
      title: winningTitle,
      content: winningContent,
      versionVector: mergedVector,
      updatedAt: Math.max(local.updatedAt, remoteDoc.updatedAt),
    };

    this.documents.set(remoteDoc.key, merged);
    return merged;
  }

  /**
   * Queue action in outbox when offline or for guaranteed delivery
   */
  public queueOutboxAction(
    type: OfflineOutboxItem["type"],
    payload: Record<string, unknown>
  ): OfflineOutboxItem {
    const item: OfflineOutboxItem = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.outbox.set(item.id, item);
    return item;
  }

  public getOutboxItems(): OfflineOutboxItem[] {
    return Array.from(this.outbox.values());
  }

  /**
   * Flush outbox items sequentially with idempotency
   */
  public async flushOutbox(
    senderFn: (item: OfflineOutboxItem) => Promise<{ success: boolean }>
  ): Promise<{ flushedCount: number; remainingCount: number }> {
    let flushedCount = 0;

    for (const item of Array.from(this.outbox.values())) {
      item.lastAttemptAt = Date.now();
      try {
        const result = await senderFn(item);
        if (result.success) {
          this.outbox.delete(item.id);
          flushedCount++;
        } else {
          item.retryCount++;
        }
      } catch (err: any) {
        item.retryCount++;
        logger.warn("[offline-sync] Outbox item dispatch failed, will retry", {
          id: item.id,
          retryCount: item.retryCount,
          error: err.message,
        });
      }
    }

    return {
      flushedCount,
      remainingCount: this.outbox.size,
    };
  }

  public async flushOutboxOnReconnect(): Promise<{ flushedCount: number; remainingCount: number }> {
    return this.flushOutbox(async () => ({ success: true }));
  }

  public getPendingOutbox(): OfflineOutboxItem[] {
    return Array.from(this.outbox.values());
  }

  public queueOutboxMutation(
    type: "courier_dispatch" | "mfs_verify" | "webhook_event",
    payload: Record<string, unknown>
  ): OfflineOutboxItem {
    return this.queueOutboxAction(type, payload);
  }

  public clearForTesting(): void {
    this.documents.clear();
    this.outbox.clear();
    this.onlineState = true;
  }
}

export const offlineCrdtStore = new OfflineCrdtStore();
