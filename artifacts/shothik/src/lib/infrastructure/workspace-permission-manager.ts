/**
 * Multi-Tenant Workspace RBAC & Session Permission Engine
 * Manages role-based access control (owner, admin, merchant_operator, viewer) and InsForge tenant context binding.
 */

export type WorkspaceRole = "owner" | "admin" | "merchant_operator" | "viewer";

export interface WorkspacePermissionContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  allowedActions: string[];
}

export class WorkspacePermissionManager {
  private rolePermissionsMap: Record<WorkspaceRole, string[]> = {
    owner: ["read", "write", "delete", "manage_members", "manage_billing", "trigger_payout"],
    admin: ["read", "write", "manage_members", "trigger_payout"],
    merchant_operator: ["read", "write", "parse_orders", "book_courier"],
    viewer: ["read"],
  };

  /**
   * Check if user role has permission to perform action
   */
  public hasPermission(role: WorkspaceRole, action: string): boolean {
    const allowed = this.rolePermissionsMap[role] || [];
    return allowed.includes(action);
  }

  /**
   * Switch active workspace session context and return permissions payload
   */
  public switchWorkspaceSession(userId: string, targetWorkspaceId: string, role: WorkspaceRole = "merchant_operator"): WorkspacePermissionContext {
    const allowedActions = this.rolePermissionsMap[role] || [];
    return {
      userId,
      workspaceId: targetWorkspaceId,
      role,
      allowedActions,
    };
  }
}

export const workspacePermissionManager = new WorkspacePermissionManager();
