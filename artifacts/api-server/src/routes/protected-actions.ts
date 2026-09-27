import { Router } from "express";
import { globalProtectedActionGuard } from "../lib/actions/protected-action-guard";

export const protectedActionsRouter = Router();

protectedActionsRouter.post("/protected-actions/initiate", (req, res) => {
  try {
    const { actionType, actorPhone, payload } = req.body;
    if (!actionType || !actorPhone) {
      res.status(400).json({ success: false, error: "actionType and actorPhone are required" });
      return;
    }

    const result = globalProtectedActionGuard.initiateProtectedAction(
      actionType,
      actorPhone,
      payload || {}
    );

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

protectedActionsRouter.post("/protected-actions/verify", (req, res) => {
  try {
    const { actionId, otpCode } = req.body;
    if (!actionId || !otpCode) {
      res.status(400).json({ success: false, error: "actionId and otpCode are required" });
      return;
    }

    const result = globalProtectedActionGuard.verifyAndExecuteAction(actionId, otpCode);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, auditSealSha256: result.auditSealSha256 });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

protectedActionsRouter.get("/protected-actions/:id", (req, res) => {
  const action = globalProtectedActionGuard.getAction(req.params.id);
  if (!action) {
    res.status(404).json({ success: false, error: "Action not found" });
    return;
  }
  res.json({ success: true, action });
});
