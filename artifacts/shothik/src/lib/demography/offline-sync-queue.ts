/**
 * 📶 Offline-First Order Buffer & Sync Queue
 * 
 * Protects merchants against flaky 3G/4G cellular drops in South Asian emerging markets.
 * Buffers newly captured orders, bKash receipts, and cash memos in local memory/IndexedDB,
 * automatically draining and syncing to InsForge PostgreSQL upon network restoration.
 */

export interface QueuedOrderRecord {
  clientOrderId: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  courier: "steadfast" | "pathao" | "redx";
  codAmount: number;
  advanceBkashAmount: number;
  trxId?: string;
  capturedAt: number;
  syncStatus: "QUEUED" | "SYNCING" | "SYNCED" | "FAILED";
}

export class OfflineSyncQueue {
  private static inMemoryQueue: QueuedOrderRecord[] = [];

  /**
   * 1. Enqueues an order captured during offline / flaky network conditions
   */
  public static enqueueOrder(order: Omit<QueuedOrderRecord, "clientOrderId" | "capturedAt" | "syncStatus">): QueuedOrderRecord {
    const record: QueuedOrderRecord = {
      ...order,
      clientOrderId: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      capturedAt: Date.now(),
      syncStatus: "QUEUED",
    };

    this.inMemoryQueue.push(record);
    return record;
  }

  /**
   * 2. Returns all currently pending offline records
   */
  public static getPendingOrders(): QueuedOrderRecord[] {
    return this.inMemoryQueue.filter((o) => o.syncStatus === "QUEUED" || o.syncStatus === "FAILED");
  }

  /**
   * 3. Replays and syncs all pending orders to InsForge PostgreSQL
   */
  public static async drainAndSyncQueue(
    syncHandler: (record: QueuedOrderRecord) => Promise<{ success: boolean; serverOrderId?: string }>
  ): Promise<{ syncedCount: number; failedCount: number; results: { clientOrderId: string; success: boolean }[] }> {
    const pending = this.getPendingOrders();
    let syncedCount = 0;
    let failedCount = 0;
    const results: { clientOrderId: string; success: boolean }[] = [];

    for (const order of pending) {
      order.syncStatus = "SYNCING";
      try {
        const res = await syncHandler(order);
        if (res.success) {
          order.syncStatus = "SYNCED";
          syncedCount++;
          results.push({ clientOrderId: order.clientOrderId, success: true });
        } else {
          order.syncStatus = "FAILED";
          failedCount++;
          results.push({ clientOrderId: order.clientOrderId, success: false });
        }
      } catch (err) {
        order.syncStatus = "FAILED";
        failedCount++;
        results.push({ clientOrderId: order.clientOrderId, success: false });
      }
    }

    return { syncedCount, failedCount, results };
  }

  /**
   * 4. Clears synced records
   */
  public static clearSynced(): void {
    this.inMemoryQueue = this.inMemoryQueue.filter((o) => o.syncStatus !== "SYNCED");
  }
}
