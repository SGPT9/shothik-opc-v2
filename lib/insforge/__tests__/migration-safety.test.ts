import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPendingMigration,
  getPendingMigrations,
  getMigrationById,
  approveAndApplyMigration,
  rejectMigration,
  clearMigrationStore,
} from "@/lib/insforge/migration-safety";

vi.mock("@/lib/config/system-governance", () => ({
  isMigrationSafetyRequired: vi.fn().mockReturnValue(true),
}));

describe("InsForge Migration Safety Guardrails", () => {
  beforeEach(() => {
    clearMigrationStore();
  });

  it("creates pending migrations requiring human handoff approval", () => {
    const migration = createPendingMigration({
      title: "Add pgvector index to twin_knowledge_vectors",
      sql: "CREATE INDEX IF NOT EXISTS idx_twin_vectors ON twin_knowledge_vectors USING ivfflat (embedding);",
    });

    expect(migration.id).toContain("mig_");
    expect(migration.title).toBe("Add pgvector index to twin_knowledge_vectors");
    expect(migration.status).toBe("pending_approval");
    expect(migration.requiresHumanHandoff).toBe(true);
    expect(migration.approvedAt).toBeNull();
  });

  it("retrieves migrations by ID and lists all pending migrations", () => {
    const mig1 = createPendingMigration({
      title: "Migration 1",
      sql: "ALTER TABLE users ADD COLUMN bio text;",
    });

    const mig2 = createPendingMigration({
      title: "Migration 2",
      sql: "CREATE TABLE audit_logs (id uuid primary key);",
    });

    const all = getPendingMigrations();
    expect(all.length).toBe(2);

    const found = getMigrationById(mig1.id);
    expect(found?.title).toBe("Migration 1");

    expect(getMigrationById("nonexistent_id")).toBeNull();
  });

  it("approves and applies migration via executor callback", async () => {
    const migration = createPendingMigration({
      title: "Add column",
      sql: "ALTER TABLE user_profiles ADD COLUMN preferred_theme text;",
    });

    const applyExecutor = vi.fn().mockResolvedValue(undefined);

    const result = await approveAndApplyMigration(
      migration.id,
      "admin@shothik.app",
      applyExecutor
    );

    expect(result.success).toBe(true);
    expect(result.migration.status).toBe("applied");
    expect(result.migration.approvedBy).toBe("admin@shothik.app");
    expect(applyExecutor).toHaveBeenCalledWith("ALTER TABLE user_profiles ADD COLUMN preferred_theme text;");
  });

  it("rejects migration cleanly", () => {
    const migration = createPendingMigration({
      title: "Drop table attempt",
      sql: "DROP TABLE users;",
    });

    const rejected = rejectMigration(migration.id, "security_officer");
    expect(rejected.status).toBe("rejected");
    expect(rejected.approvedBy).toBe("security_officer");
  });

  it("throws error when approving or rejecting nonexistent migration ID", async () => {
    await expect(
      approveAndApplyMigration("missing_id", "admin")
    ).rejects.toThrow("Migration with ID missing_id not found.");

    expect(() => rejectMigration("missing_id", "admin")).toThrow(
      "Migration with ID missing_id not found."
    );
  });
});
