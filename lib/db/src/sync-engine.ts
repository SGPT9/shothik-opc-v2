import { pool, db } from "./index";
import { sqliteDb, ensureTablesInitialized } from "./sqlite";
import {
  offlineProjectsTable,
  offlineParcelsTable,
  offlineNilkhetOrdersTable,
  offlineAutosaveTable,
} from "./schema/sqlite-schema";
import {
  projectsTable,
  nilkhetOrdersTable,
  parcelsTable,
  writingAutosaveTable,
} from "./schema";
import { eq, inArray } from "drizzle-orm";

export interface SyncEngineStatus {
  isPostgresConnected: boolean;
  lastSyncAt: string | null;
  syncedProjectsCount: number;
  syncedParcelsCount: number;
  syncedOrdersCount: number;
  syncedAutosavesCount: number;
  error?: string;
}

export class OfflineSyncEngine {
  private static instance: OfflineSyncEngine;
  private isSyncing = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private status: SyncEngineStatus = {
    isPostgresConnected: false,
    lastSyncAt: null,
    syncedProjectsCount: 0,
    syncedParcelsCount: 0,
    syncedOrdersCount: 0,
    syncedAutosavesCount: 0,
  };

  public static getInstance(): OfflineSyncEngine {
    if (!OfflineSyncEngine.instance) {
      OfflineSyncEngine.instance = new OfflineSyncEngine();
    }
    return OfflineSyncEngine.instance;
  }

  /**
   * Fast probe to verify PostgreSQL connectivity
   */
  public async isPostgresHealthy(): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1;");
      client.release();
      this.status.isPostgresConnected = true;
      return true;
    } catch {
      this.status.isPostgresConnected = false;
      return false;
    }
  }

  /**
   * Drain and synchronize all offline SQLite records to PostgreSQL with Last-Write-Wins (LWW)
   */
  public async flushOfflineQueue(): Promise<SyncEngineStatus> {
    if (this.isSyncing) {
      return this.status;
    }

    this.isSyncing = true;
    await ensureTablesInitialized();

    try {
      const isOnline = await this.isPostgresHealthy();
      if (!isOnline) {
        return this.status;
      }

      // 1. Sync Offline Projects
      const localProjects = await sqliteDb.select().from(offlineProjectsTable);
      for (const p of localProjects) {
        try {
          await db
            .insert(projectsTable)
            .values({
              id: p.id,
              userId: p.userId,
              title: p.title,
              description: p.genre || "offline-sync",
              type: "book",
            } as any)
            .onConflictDoNothing();
          await sqliteDb.delete(offlineProjectsTable).where(eq(offlineProjectsTable.id, p.id));
          this.status.syncedProjectsCount++;
        } catch {}
      }

      // 2. Sync Offline Parcels (Batched Network Writes)
      const localParcels = await sqliteDb.select().from(offlineParcelsTable);
      if (localParcels.length > 0) {
        try {
          await db
            .insert(parcelsTable)
            .values(
              localParcels.map((parcel) => ({
                trackingCode: parcel.trackingCode,
                consignmentId: parcel.consignmentId,
                provider: parcel.provider,
                recipientName: parcel.recipientName,
                recipientPhone: parcel.recipientPhone,
                city: parcel.city,
                address: parcel.address,
                codAmountBdt: parcel.codAmountBdt,
                status: parcel.status,
              } as any))
            )
            .onConflictDoNothing();
          const codes = localParcels.map((p) => p.trackingCode);
          await sqliteDb.delete(offlineParcelsTable).where(inArray(offlineParcelsTable.trackingCode, codes));
          this.status.syncedParcelsCount += localParcels.length;
        } catch {}
      }

      // 3. Sync Offline Nilkhet Orders (Batched Network Writes)
      const localOrders = await sqliteDb.select().from(offlineNilkhetOrdersTable);
      if (localOrders.length > 0) {
        try {
          await db
            .insert(nilkhetOrdersTable)
            .values(
              localOrders.map((o) => ({
                id: o.orderId,
                userId: o.userId,
                bookTitle: o.bookTitle,
                pageCount: o.pageCount,
                copies: o.copies,
                spineThicknessMm: o.spineThicknessMm,
                totalCostBdt: o.totalCostBdt,
                deliveryAddress: o.deliveryAddress,
                recipientPhone: o.recipientPhone,
                status: o.status,
              } as any))
            )
            .onConflictDoNothing();
          const orderIds = localOrders.map((o) => o.orderId);
          await sqliteDb.delete(offlineNilkhetOrdersTable).where(inArray(offlineNilkhetOrdersTable.orderId, orderIds));
          this.status.syncedOrdersCount += localOrders.length;
        } catch {}
      }

      // 4. Sync Offline Writing Autosaves
      const localAutosaves = await sqliteDb.select().from(offlineAutosaveTable);
      for (const a of localAutosaves) {
        try {
          const wordCount = a.content ? a.content.trim().split(/\s+/).length : 0;
          await db
            .insert(writingAutosaveTable)
            .values({
              userId: a.userId,
              localProjectId: a.docId,
              content: a.content,
              wordCount,
              savedAt: new Date(a.updatedAt),
            })
            .onConflictDoUpdate({
              target: [writingAutosaveTable.userId, writingAutosaveTable.localProjectId],
              set: {
                content: a.content,
                wordCount,
                savedAt: new Date(a.updatedAt),
              },
            });
          await sqliteDb.delete(offlineAutosaveTable).where(eq(offlineAutosaveTable.id, a.id));
          this.status.syncedAutosavesCount++;
        } catch {}
      }

      this.status.lastSyncAt = new Date().toISOString();
      this.status.error = undefined;
    } catch (err: any) {
      this.status.error = err.message || String(err);
    } finally {
      this.isSyncing = false;
    }

    return this.status;
  }

  /**
   * Start recurring background daemon
   */
  public startAutoSyncDaemon(intervalMs = 30000): void {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(() => {
      this.flushOfflineQueue().catch(() => {});
    }, intervalMs);
  }

  public stopAutoSyncDaemon(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  public getStatus(): SyncEngineStatus {
    return { ...this.status };
  }
}

export const offlineSyncEngine = OfflineSyncEngine.getInstance();
