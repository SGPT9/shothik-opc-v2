export type ToolRiskLevel = "READ_ONLY" | "LOW_RISK" | "HIGH_RISK_MUTATING" | "DESTRUCTIVE";

export interface ToolExecutionContext {
  toolName: string;
  args: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  riskLevel: ToolRiskLevel;
  approvedByUser?: boolean;
}

export interface GuardrailDecision {
  allowed: boolean;
  reason?: string;
  requiresUserConfirmation?: boolean;
  sanitizedArgs?: Record<string, unknown>;
}

export interface ToolExecutionTelemetry {
  toolName: string;
  durationMs: number;
  tokensConsumed: number;
  success: boolean;
  error?: string;
}

export class ToolExecutionGuardrail {
  private static DESTRUCTIVE_PATTERNS = [
    /rm\s+-rf/i,
    /DROP\s+TABLE/i,
    /TRUNCATE/i,
    /git\s+push\s+.*--force/i,
    /git\s+reset\s+--hard/i,
    /mkfs/i,
    /dd\s+if=/i,
  ];

  public static evaluatePreExecution(ctx: ToolExecutionContext): GuardrailDecision {
    const rawArgs = JSON.stringify(ctx.args);

    // 1. Check for destructive shell/database injections
    for (const pattern of this.DESTRUCTIVE_PATTERNS) {
      if (pattern.test(rawArgs)) {
        return {
          allowed: false,
          reason: `Blocked by Security Guardrail: Potentially destructive pattern detected (${pattern.source})`,
          requiresUserConfirmation: true,
        };
      }
    }

    // 2. Classify Risk & Confirmation Gate
    if (ctx.riskLevel === "DESTRUCTIVE" || ctx.riskLevel === "HIGH_RISK_MUTATING") {
      if (!ctx.approvedByUser) {
        return {
          allowed: false,
          reason: `Tool '${ctx.toolName}' mutates persistent state and requires explicit user confirmation.`,
          requiresUserConfirmation: true,
        };
      }
    }

    return { allowed: true };
  }
}
