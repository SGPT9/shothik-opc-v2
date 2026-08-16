/**
 * McpGuardrailService — Security Guardrail and Human-in-the-Loop Checkpoint Engine.
 *
 * Inspired by MCP Snitch & Anthropic Tool-Use Security Standards:
 * - Intercepts all tool execution requests before dispatch.
 * - Masks secrets, API tokens, and private host paths from logs & messages.
 * - Enforces 3-tier risk policies: ALLOW (auto), REQUIRE_APPROVAL (human checkpoint), BLOCK (forbidden).
 * - Emits structured checkpoints for `ApprovalCard.tsx` and `SecretShareCard.tsx`.
 */

export type ToolRiskLevel = "low" | "medium" | "high" | "critical";

export type GuardrailDecision = "allow" | "require_approval" | "block";

export interface ToolCallRequest {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  callerId?: string;
  context?: string;
}

export interface CheckpointRecord {
  checkpointId: string;
  toolCall: ToolCallRequest;
  riskLevel: ToolRiskLevel;
  actionSummary: string;
  reason: string;
  details?: string;
  status: "pending" | "approved" | "denied";
  createdAt: number;
  resolvedAt?: number;
}

export interface GuardrailEvaluation {
  decision: GuardrailDecision;
  riskLevel: ToolRiskLevel;
  sanitizedArgs: Record<string, unknown>;
  reason: string;
  checkpoint?: CheckpointRecord;
}

/** Regex patterns for detecting credentials and sensitive environment data */
const SENSITIVE_PATTERNS = [
  /(?:sk-[a-zA-Z0-9_-]{20,})/gi, // OpenAI / general API keys
  /(?:AIza[0-9A-Za-z-_]{35})/gi, // Google / Gemini API keys
  /(?:ghp_[a-zA-Z0-9]{36})/gi, // GitHub Personal Access Tokens
  /(?:ey[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/gi, // JWTs
  /(?:[a-zA-Z0-9_-]{24,}:[a-zA-Z0-9_-]{32,})/gi, // Basic auth / webhook secrets
];

/** Forbidden commands and patterns that are unconditionally blocked */
const BLOCKED_COMMANDS = [
  /rm\s+-rf\s+\/+/i,
  /rmdir\s+\/s\s+\/q\s+C:\\+/i,
  /drop\s+database/i,
  /format\s+[c-z]:/i,
  />\s*\/dev\/sd[a-z]/i,
  /\.env(?:\.local)?/i, // Direct write or dump of .env files
];

/** Low-risk read-only tools that execute automatically */
const AUTO_ALLOWED_TOOLS = new Set([
  "search_web",
  "read_url_content",
  "view_file",
  "list_dir",
  "grep_search",
  "get_project",
  "list_projects",
  "list_screens",
  "get_screen",
  "sequentialthinking",
  "wigolo_search",
  "wigolo_scrape",
]);

/** High-risk actions that require user confirmation */
const APPROVAL_REQUIRED_TOOLS = new Set([
  "run_command",
  "write_to_file",
  "replace_file_content",
  "multi_replace_file_content",
  "hosting_deployStaticWebsite",
  "hosting_deployJsApplication",
  "hosting_deleteWebsiteV1",
  "hosting_createAccountDatabaseV1",
  "hosting_deleteAccountDatabaseV1",
  "ecommerce_deleteStoreV1",
  "VPS_deleteProjectV1",
  "VPS_startVirtualMachineV1",
  "VPS_stopVirtualMachineV1",
]);

export class McpGuardrailService {
  private checkpoints = new Map<string, CheckpointRecord>();
  private autoApproveWhitelist = new Set<string>();

  /**
   * Whitelist a specific tool or action type for the current session
   */
  public whitelistTool(toolName: string): void {
    this.autoApproveWhitelist.add(toolName);
  }

  /**
   * Remove a tool from the session whitelist
   */
  public revokeWhitelist(toolName: string): void {
    this.autoApproveWhitelist.delete(toolName);
  }

  /**
   * Sanitizes text strings by masking any detected API keys, passwords, or tokens.
   */
  public sanitizeText(input: string): string {
    let sanitized = input;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.length <= 8) return "[REDACTED_SECRET]";
        return `${match.slice(0, 4)}...[REDACTED]...${match.slice(-4)}`;
      });
    }
    return sanitized;
  }

  /**
   * Recursively sanitizes JSON objects and tool arguments.
   */
  public sanitizeObject<T>(obj: T): T {
    if (typeof obj === "string") {
      return this.sanitizeText(obj) as unknown as T;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        // Redact values for sensitive keys directly
        if (/password|secret|token|api_?key|auth_?header|private_?key/i.test(key)) {
          result[key] = "[REDACTED_SECRET_FIELD]";
        } else {
          result[key] = this.sanitizeObject(value);
        }
      }
      return result as T;
    }
    return obj;
  }

  /**
   * Evaluates an incoming tool call against guardrail policies and security rules.
   */
  public evaluate(toolCall: ToolCallRequest): GuardrailEvaluation {
    const { toolName, arguments: rawArgs } = toolCall;
    const sanitizedArgs = this.sanitizeObject(rawArgs);
    const argsString = JSON.stringify(rawArgs);

    // 1. Check for unconditionally blocked dangerous commands / patterns
    for (const blockedRegex of BLOCKED_COMMANDS) {
      if (blockedRegex.test(argsString)) {
        return {
          decision: "block",
          riskLevel: "critical",
          sanitizedArgs,
          reason: `Execution blocked: Matched critical security policy (${blockedRegex.source}).`,
        };
      }
    }

    // 2. Check if the tool is in the session whitelist
    if (this.autoApproveWhitelist.has(toolName)) {
      return {
        decision: "allow",
        riskLevel: "low",
        sanitizedArgs,
        reason: `Auto-allowed: Tool "${toolName}" was approved for this session.`,
      };
    }

    // 3. Check for naturally safe / read-only tools
    if (AUTO_ALLOWED_TOOLS.has(toolName)) {
      return {
        decision: "allow",
        riskLevel: "low",
        sanitizedArgs,
        reason: `Auto-allowed: Read-only / safe analytical operation.`,
      };
    }

    // 4. Check for high-risk / mutating tools requiring user approval
    const isApprovalRequired =
      APPROVAL_REQUIRED_TOOLS.has(toolName) ||
      /delete|deploy|drop|execute|remove|write|update|create|kill/i.test(toolName);

    if (isApprovalRequired) {
      const checkpointId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const summary = this.generateActionSummary(toolName, sanitizedArgs);
      const reason = this.generateReason(toolName, sanitizedArgs);

      const checkpoint: CheckpointRecord = {
        checkpointId,
        toolCall: {
          ...toolCall,
          arguments: sanitizedArgs,
        },
        riskLevel: toolName.includes("delete") || toolName.includes("drop") ? "high" : "medium",
        actionSummary: summary,
        reason,
        details: JSON.stringify(sanitizedArgs, null, 2),
        status: "pending",
        createdAt: Date.now(),
      };

      this.checkpoints.set(checkpointId, checkpoint);

      return {
        decision: "require_approval",
        riskLevel: checkpoint.riskLevel,
        sanitizedArgs,
        reason: `User approval required before executing mutating or system action.`,
        checkpoint,
      };
    }

    // Default fallback: allow low risk
    return {
      decision: "allow",
      riskLevel: "low",
      sanitizedArgs,
      reason: "Permitted by default policy.",
    };
  }

  /**
   * Resolves a pending checkpoint when the user clicks Approve or Deny.
   */
  public resolveCheckpoint(
    checkpointId: string,
    outcome: "approved" | "denied"
  ): CheckpointRecord | null {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) return null;

    checkpoint.status = outcome;
    checkpoint.resolvedAt = Date.now();
    this.checkpoints.set(checkpointId, checkpoint);

    return checkpoint;
  }

  /**
   * Retrieves an active checkpoint by its unique ID.
   */
  public getCheckpoint(checkpointId: string): CheckpointRecord | undefined {
    return this.checkpoints.get(checkpointId);
  }

  private generateActionSummary(toolName: string, args: Record<string, unknown>): string {
    if (toolName === "run_command" && typeof args.CommandLine === "string") {
      return `Run shell command: "${args.CommandLine.slice(0, 60)}${args.CommandLine.length > 60 ? "..." : ""}"`;
    }
    if (toolName === "write_to_file" && typeof args.TargetFile === "string") {
      return `Write file: ${args.TargetFile.split(/[/\\]/).pop()}`;
    }
    if (toolName === "replace_file_content" && typeof args.TargetFile === "string") {
      return `Modify file: ${args.TargetFile.split(/[/\\]/).pop()}`;
    }
    return `Execute ${toolName}`;
  }

  private generateReason(toolName: string, _args: Record<string, unknown>): string {
    if (toolName === "run_command") {
      return "Running arbitrary terminal commands alters system state and filesystem data.";
    }
    if (toolName.includes("file")) {
      return "Modifying source files will directly update project code.";
    }
    if (toolName.includes("delete") || toolName.includes("drop")) {
      return "Permanent deletion of project data cannot be automatically undone.";
    }
    return "This action mutates workspace resources.";
  }
}

/** Global singleton instance for app-wide guardrail enforcement */
export const mcpGuardrail = new McpGuardrailService();
