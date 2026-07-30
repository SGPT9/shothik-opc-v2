/**
 * Block Buzz-Inspired Human-in-the-Loop Handoff Manager for Shothik
 * Based on block/buzz Human Assist & Approval Intercept architecture.
 */

export interface HumanHandoffRequest {
  id: string;
  sessionId: string;
  agentId: string;
  reason: "approval_required" | "captcha_assist" | "ambiguous_prompt" | "rate_limit_wait";
  promptMessage: string;
  contextData: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "overridden";
  timestamp: number;
}

export interface HumanHandoffResponse {
  requestId: string;
  status: "approved" | "rejected" | "overridden";
  userFeedback?: string;
  resumedAt: number;
}

/**
 * Creates a human handoff request when an agent encounters a decision barrier.
 */
export async function createHumanHandoffRequest(
  sessionId: string,
  agentId: string,
  reason: HumanHandoffRequest["reason"],
  promptMessage: string,
  contextData: Record<string, any> = {}
): Promise<HumanHandoffRequest> {
  return {
    id: `hdf_${Date.now()}`,
    sessionId,
    agentId,
    reason,
    promptMessage,
    contextData,
    status: "pending",
    timestamp: Date.now(),
  };
}

/**
 * Resolves a pending handoff request with human approval/rejection.
 */
export async function resolveHumanHandoff(
  requestId: string,
  status: "approved" | "rejected" | "overridden",
  userFeedback?: string
): Promise<HumanHandoffResponse> {
  return {
    requestId,
    status,
    userFeedback,
    resumedAt: Date.now(),
  };
}
