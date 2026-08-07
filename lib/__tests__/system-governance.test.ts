import { describe, it, expect, beforeEach } from "vitest";
import {
  getSystemGovernanceConfig,
  updateSystemGovernanceConfig,
  resetSystemGovernanceConfig,
  isTwinAutoHeartbeatEnabled,
  isGithubAutoSyncEnabled,
  isMigrationSafetyRequired,
} from "@/lib/config/system-governance";
import {
  createPendingMigration,
  getPendingMigrations,
  approveAndApplyMigration,
  clearMigrationStore,
} from "@/lib/insforge/migration-safety";
import { TwinResearchDispatcher } from "@/services/twin-research-dispatcher";

describe("System Governance & Policy Management", () => {
  beforeEach(() => {
    resetSystemGovernanceConfig();
    clearMigrationStore();
  });

  it("should initialize default governance settings according to user choices", () => {
    const config = getSystemGovernanceConfig();
    expect(config.twinCommunityRole).toBe("auto_heartbeat");
    expect(config.githubAutoSync).toBe(true);
    expect(config.databaseMigrationSafety).toBe(true);

    expect(isTwinAutoHeartbeatEnabled()).toBe(true);
    expect(isGithubAutoSyncEnabled()).toBe(true);
    expect(isMigrationSafetyRequired()).toBe(true);
  });

  it("should update and reset governance settings correctly", () => {
    updateSystemGovernanceConfig({ twinCommunityRole: "manual_approval", githubAutoSync: false });
    expect(isTwinAutoHeartbeatEnabled()).toBe(false);
    expect(isGithubAutoSyncEnabled()).toBe(false);

    resetSystemGovernanceConfig();
    expect(isTwinAutoHeartbeatEnabled()).toBe(true);
    expect(isGithubAutoSyncEnabled()).toBe(true);
  });
});

describe("Vibe Coder Database Migration Safety Queue", () => {
  beforeEach(() => {
    resetSystemGovernanceConfig();
    clearMigrationStore();
  });

  it("should hold generated migrations in pending_approval state when safety is enabled", () => {
    const migration = createPendingMigration({
      title: "Add indexes to user_profiles table",
      sql: "CREATE INDEX idx_user_email ON user_profiles(email);",
    });

    expect(migration.status).toBe("pending_approval");
    expect(migration.requiresHumanHandoff).toBe(true);
    expect(migration.approvedAt).toBeNull();

    const pendingList = getPendingMigrations();
    expect(pendingList).toHaveLength(1);
    expect(pendingList[0].id).toBe(migration.id);
  });

  it("should execute 1-click Human Assist Handoff approval successfully", async () => {
    const migration = createPendingMigration({
      title: "Create analytics_events table",
      sql: "CREATE TABLE analytics_events (id SERIAL PRIMARY KEY, event VARCHAR(255));",
    });

    let executedSql = "";
    const mockExecutor = async (sql: string) => {
      executedSql = sql;
    };

    const result = await approveAndApplyMigration(
      migration.id,
      "senior_dev_user",
      mockExecutor
    );

    expect(result.success).toBe(true);
    expect(result.migration.status).toBe("applied");
    expect(result.migration.approvedBy).toBe("senior_dev_user");
    expect(executedSql).toContain("CREATE TABLE analytics_events");
  });
});

describe("Twin Heartbeat Community Mention Automation", () => {
  beforeEach(() => {
    resetSystemGovernanceConfig();
  });

  it("should auto-respond to community mentions when auto_heartbeat rule is active", async () => {
    const result = await TwinResearchDispatcher.processHeartbeatCommunityMentions("twin_123", [
      {
        mentionId: "m_1",
        forumId: "forum_general",
        author: "alex",
        content: "What do you think about AI agents?",
      },
    ]);

    expect(result.processed).toBe(true);
    expect(result.replies).toHaveLength(1);
    expect(result.replies[0].replyContent).toContain("Twin bot auto-reply via heartbeat cycle");
  });

  it("should hold mentions when twinCommunityRole is manual_approval", async () => {
    updateSystemGovernanceConfig({ twinCommunityRole: "manual_approval" });

    const result = await TwinResearchDispatcher.processHeartbeatCommunityMentions("twin_123", [
      {
        mentionId: "m_1",
        forumId: "forum_general",
        author: "alex",
        content: "What do you think about AI agents?",
      },
    ]);

    expect(result.processed).toBe(false);
    expect(result.reason).toContain("Manual approval required");
    expect(result.replies).toHaveLength(0);
  });
});
