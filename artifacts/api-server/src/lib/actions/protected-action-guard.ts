import { createHash } from "node:crypto";

export interface ProtectedActionRequest {
  actionId: string;
  actionType: "bkash_payout" | "courier_dispatch" | "po_wholesale" | "bulk_price_update";
  actorPhone: string;
  payload: Record<string, any>;
  status: "pending_otp" | "approved" | "rejected" | "expired";
  otpCode?: string;
  otpExpiresAt: number;
  auditSealSha256?: string;
  createdAt: string;
}

export class ProtectedActionGuard {
  private actions: Map<string, ProtectedActionRequest> = new Map();

  public initiateProtectedAction(
    actionType: "bkash_payout" | "courier_dispatch" | "po_wholesale" | "bulk_price_update",
    actorPhone: string,
    payload: Record<string, any>
  ): { actionId: string; otpExpiresInSec: number; simulatedOtp: string } {
    const actionId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    // Generate deterministic 6-digit OTP for test/demo
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    this.actions.set(actionId, {
      actionId,
      actionType,
      actorPhone,
      payload,
      status: "pending_otp",
      otpCode: simulatedOtp,
      otpExpiresAt,
      createdAt: new Date().toISOString(),
    });

    return { actionId, otpExpiresInSec: 300, simulatedOtp };
  }

  public verifyAndExecuteAction(
    actionId: string,
    submittedOtp: string
  ): { success: boolean; error?: string; auditSealSha256?: string } {
    const action = this.actions.get(actionId);
    if (!action) {
      return { success: false, error: "Action not found" };
    }

    if (Date.now() > action.otpExpiresAt) {
      action.status = "expired";
      return { success: false, error: "OTP expired. Please initiate a fresh confirmation request." };
    }

    if (action.otpCode !== submittedOtp.trim()) {
      return { success: false, error: "Invalid 6-digit OTP code" };
    }

    action.status = "approved";
    const sealData = JSON.stringify({
      actionId,
      actionType: action.actionType,
      actorPhone: action.actorPhone,
      payload: action.payload,
      verifiedAt: new Date().toISOString(),
    });

    action.auditSealSha256 = createHash("sha256").update(sealData).digest("hex");
    return { success: true, auditSealSha256: action.auditSealSha256 };
  }

  public getAction(actionId: string): ProtectedActionRequest | undefined {
    return this.actions.get(actionId);
  }
}

export const globalProtectedActionGuard = new ProtectedActionGuard();
