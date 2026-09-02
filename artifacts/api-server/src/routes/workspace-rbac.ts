import { Router, type Request, type Response } from "express";
import { workspacePermissionManager, WorkspaceRole } from "../../../shothik/src/lib/infrastructure/workspace-permission-manager";

const router = Router();

/**
 * POST /api/v1/workspaces/switch
 * Switch active workspace session context
 */
router.post("/v1/workspaces/switch", (req: Request, res: Response) => {
  const { userId = "usr_01", targetWorkspaceId, role = "merchant_operator" } = req.body;

  if (!targetWorkspaceId) {
    return res.status(400).json({ success: false, error: "targetWorkspaceId is required" });
  }

  const context = workspacePermissionManager.switchWorkspaceSession(userId, targetWorkspaceId, role as WorkspaceRole);

  return res.status(200).json({
    success: true,
    context,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/workspaces/permissions
 * Check permission for specific action
 */
router.get("/v1/workspaces/permissions", (req: Request, res: Response) => {
  const { role = "viewer", action = "read" } = req.query;

  const allowed = workspacePermissionManager.hasPermission(role as WorkspaceRole, action as string);

  return res.status(200).json({
    success: true,
    role,
    action,
    allowed,
    timestamp: new Date().toISOString(),
  });
});

export default router;
