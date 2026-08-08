import { isMigrationSafetyRequired } from "@/lib/config/system-governance";

export interface PendingMigration {
  id: string;
  title: string;
  sql: string;
  status: "pending_approval" | "approved" | "applied" | "rejected";
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  requiresHumanHandoff: boolean;
}

const pendingMigrationStore = new Map<string, PendingMigration>();

export function createPendingMigration(params: {
  title: string;
  sql: string;
}): PendingMigration {
  const requiresHumanHandoff = isMigrationSafetyRequired();
  const migrationId = `mig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const migration: PendingMigration = {
    id: migrationId,
    title: params.title,
    sql: params.sql,
    status: requiresHumanHandoff ? "pending_approval" : "approved",
    createdAt: new Date().toISOString(),
    approvedAt: requiresHumanHandoff ? null : new Date().toISOString(),
    approvedBy: requiresHumanHandoff ? null : "system_auto_bypass",
    requiresHumanHandoff,
  };

  pendingMigrationStore.set(migrationId, migration);
  return migration;
}

export function getPendingMigrations(): PendingMigration[] {
  return Array.from(pendingMigrationStore.values());
}

export function getMigrationById(id: string): PendingMigration | null {
  return pendingMigrationStore.get(id) ?? null;
}

export async function approveAndApplyMigration(
  id: string,
  approvedBy: string,
  applyExecutor?: (sql: string) => Promise<void>
): Promise<{ success: boolean; migration: PendingMigration }> {
  const migration = pendingMigrationStore.get(id);
  if (!migration) {
    throw new Error(`Migration with ID ${id} not found.`);
  }

  if (migration.status === "applied") {
    return { success: true, migration };
  }

  migration.status = "approved";
  migration.approvedAt = new Date().toISOString();
  migration.approvedBy = approvedBy;

  if (applyExecutor) {
    await applyExecutor(migration.sql);
  }

  migration.status = "applied";
  pendingMigrationStore.set(id, migration);

  return { success: true, migration };
}

export function rejectMigration(
  id: string,
  rejectedBy: string
): PendingMigration {
  const migration = pendingMigrationStore.get(id);
  if (!migration) {
    throw new Error(`Migration with ID ${id} not found.`);
  }

  migration.status = "rejected";
  migration.approvedBy = rejectedBy;
  pendingMigrationStore.set(id, migration);

  return migration;
}

export function clearMigrationStore(): void {
  pendingMigrationStore.clear();
}
