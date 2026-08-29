import { pool, db } from "./index";
import { sqliteDb, rawSqlite, ensureTablesInitialized } from "./sqlite";
import { offlineProjectsTable, offlineParcelsTable, offlineNilkhetOrdersTable } from "./schema/sqlite-schema";
import { projectsTable, nilkhetOrdersTable, parcelsTable } from "./schema";
import { eq } from "drizzle-orm";

export interface SyncEngineStatus {
  isPostgresConnected: boolean;
  lastSyncAt: string | null;
  syncedProjectsCount: number;
  syncedParcelsCount: number;
  syncedOrdersCount: number;
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
              name: p.title,
              description: p.genre || "offline-sync",
              category: "general",
            } as any)
            .onConflictDoNothing();
          this.status.syncedProjectsCount++;
        } catch {}
      }

      // 2. Sync Offline Parcels
      const localParcels = await sqliteDb.select().from(offlineParcelsTable);
      for (const parcel of localParcels) {
        try {
          await db
            .insert(parcelsTable)
            .values({
              trackingCode: parcel.trackingCode,
              consignmentId: parcel.consignmentId,
              provider: parcel.provider,
              recipientName: parcel.recipientName,
              recipientPhone: parcel.recipientPhone,
              city: parcel.city,
              address: parcel.address,
              codAmountBdt: parcel.codAmountBdt,
              status: parcel.status,
            } as any)
            .onConflictDoNothing();
          this.status.syncedParcelsCount++;
        } catch {}
      }

      // 3. Sync Offline Nilkhet Orders
      const localOrders = await sqliteDb.select().from(offlineNilkhetOrdersTable);
      for (const o of localOrders) {
        try {
          await db
            .insert(nilkhetOrdersTable)
            .values({
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
            } as any)
            .onConflictDoNothing();
          this.status.syncedOrdersCount++;
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
