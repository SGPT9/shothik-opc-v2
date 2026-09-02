/**
 * WorkspacePermissionManager Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { workspacePermissionManager } from "./infrastructure/workspace-permission-manager";

describe("WorkspacePermissionManager (Multi-Tenant RBAC)", () => {
  it("verifies permissions cleanly based on assigned workspace role", () => {
    expect(workspacePermissionManager.hasPermission("owner", "manage_billing")).toBe(true);
    expect(workspacePermissionManager.hasPermission("viewer", "manage_billing")).toBe(false);
    expect(workspacePermissionManager.hasPermission("merchant_operator", "book_courier")).toBe(true);
  });

  it("switches workspace session context and returns allowed actions list", () => {
    const context = workspacePermissionManager.switchWorkspaceSession("usr_du_01", "ws_store_dhaka", "admin");

    expect(context.userId).toBe("usr_du_01");
    expect(context.workspaceId).toBe("ws_store_dhaka");
    expect(context.role).toBe("admin");
    expect(context.allowedActions).toContain("trigger_payout");
  });
});
