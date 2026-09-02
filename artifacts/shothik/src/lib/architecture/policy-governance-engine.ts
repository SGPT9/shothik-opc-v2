/**
 * ShothikGPT 12-Pillar Reference Architecture — Pillar 11: Policy, Safety & Governance Engine
 * 
 * Enforces enterprise governance:
 *   Identity ➔ Authentication ➔ Authorization ➔ Delegation ➔ Policy Engine ➔ Audit Log
 */

export interface PolicyContext {
  userId: string;
  orgId?: string;
  agentHandle: string;
  actionType: 'read' | 'write' | 'execute' | 'disburse_payment' | 'system_admin';
  financialAmountBdt?: number;
  targetResource: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  userRole: 'guest' | 'merchant' | 'developer' | 'admin';
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  requiresHumanApproval: boolean;
  auditLogId: string;
  timestampIso: string;
}

export class PolicyGovernanceEngine {
  private auditLogs: PolicyEvaluationResult[] = [];

  /**
   * Evaluates policy context against safety, financial, and organizational boundaries.
   */
  public evaluatePolicy(context: PolicyContext): PolicyEvaluationResult {
    const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestampIso = new Date().toISOString();

    let allowed = true;
    let requiresHumanApproval = false;
    let reason = 'Policy check passed';

    // Financial Disbursal Policy (bKash/Nagad Cashout)
    if (context.actionType === 'disburse_payment') {
      const amount = context.financialAmountBdt || 0;
      if (amount > 100_000) {
        allowed = false;
        reason = 'Financial payout exceeds maximum single transaction limit of ৳100,000 BDT';
      } else if (amount > 10_000) {
        requiresHumanApproval = true;
        reason = 'Financial payout above ৳10,000 BDT requires 2FA Human Approval';
      }
    }

    // Critical Action Policy
    if (context.riskLevel === 'critical' && context.userRole !== 'admin') {
      allowed = false;
      reason = 'Critical system action requires Admin role authorization';
    }

    // Agent Delegation Policy
    if (context.actionType === 'system_admin' && context.agentHandle !== 'security-reviewer') {
      allowed = false;
      reason = 'System administrative actions can only be delegated to @security-reviewer';
    }

    const result: PolicyEvaluationResult = {
      allowed,
      reason,
      requiresHumanApproval,
      auditLogId,
      timestampIso,
    };

    this.auditLogs.push(result);
    return result;
  }

  public getAuditLogs(): PolicyEvaluationResult[] {
    return this.auditLogs;
  }
}
