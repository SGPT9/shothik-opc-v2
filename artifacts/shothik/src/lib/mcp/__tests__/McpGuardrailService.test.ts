import { describe, it, expect, beforeEach } from "vitest";
import { McpGuardrailService, type ToolCallRequest } from "../McpGuardrailService";

describe("McpGuardrailService", () => {
  let guardrail: McpGuardrailService;

  beforeEach(() => {
    guardrail = new McpGuardrailService();
  });

  describe("Secret Masking & Scrubbing", () => {
    it("should mask OpenAI and generic sk- tokens in strings", () => {
      const secret = "sk-abcdef1234567890abcdef1234567890";
      const sanitized = guardrail.sanitizeText(`My key is ${secret} please use it`);
      expect(sanitized).not.toContain(secret);
      expect(sanitized).toContain("[REDACTED]");
    });

    it("should mask Gemini API keys (AIza...)", () => {
      const geminiKey = "AIzaSyD9Z83Z9OYjxSnYVGaPaDtk05HwKvQSg9Z";
      const sanitized = guardrail.sanitizeText(`Endpoint with key: ${geminiKey}`);
      expect(sanitized).not.toContain(geminiKey);
      expect(sanitized).toContain("[REDACTED]");
    });

    it("should recursively mask secrets in nested tool arguments", () => {
      const rawArgs = {
        config: {
          apiKey: "sk-live-99887766554433221100aa",
          headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doQmentSignatureKey123",
          },
        },
        payload: {
          prompt: "Analyze Q3 revenue report",
        },
      };

      const sanitized = guardrail.sanitizeObject(rawArgs);
      expect(sanitized.config.apiKey).toBe("[REDACTED_SECRET_FIELD]");
      expect(sanitized.config.headers.Authorization).not.toContain("doQmentSignatureKey123");
      expect(sanitized.payload.prompt).toBe("Analyze Q3 revenue report");
    });
  });

  describe("Risk Evaluation & Checkpoint Generation", () => {
    it("should auto-allow read-only search operations without checkpoint", () => {
      const toolCall: ToolCallRequest = {
        id: "call_1",
        toolName: "search_web",
        arguments: { query: "Bangladeshi Fintech market share 2026" },
      };

      const evaluation = guardrail.evaluate(toolCall);
      expect(evaluation.decision).toBe("allow");
      expect(evaluation.riskLevel).toBe("low");
      expect(evaluation.checkpoint).toBeUndefined();
    });

    it("should block critical destructive operations unconditionally", () => {
      const toolCall: ToolCallRequest = {
        id: "call_danger",
        toolName: "run_command",
        arguments: { CommandLine: "rm -rf / --no-preserve-root" },
      };

      const evaluation = guardrail.evaluate(toolCall);
      expect(evaluation.decision).toBe("block");
      expect(evaluation.riskLevel).toBe("critical");
      expect(evaluation.reason).toContain("security policy");
    });

    it("should require human approval for file writes and shell execution", () => {
      const toolCall: ToolCallRequest = {
        id: "call_write",
        toolName: "run_command",
        arguments: { CommandLine: "npm run deploy --stage=production" },
      };

      const evaluation = guardrail.evaluate(toolCall);
      expect(evaluation.decision).toBe("require_approval");
      expect(evaluation.riskLevel).toBe("medium");
      expect(evaluation.checkpoint).toBeDefined();
      expect(evaluation.checkpoint?.status).toBe("pending");
      expect(evaluation.checkpoint?.actionSummary).toContain("npm run deploy");
    });

    it("should resolve checkpoints properly when approved or denied", () => {
      const toolCall: ToolCallRequest = {
        id: "call_mod",
        toolName: "replace_file_content",
        arguments: { TargetFile: "src/config/pricing.ts" },
      };

      const evaluation = guardrail.evaluate(toolCall);
      const chkId = evaluation.checkpoint!.checkpointId;

      // Check initial pending status
      expect(guardrail.getCheckpoint(chkId)?.status).toBe("pending");

      // Approve checkpoint
      const resolved = guardrail.resolveCheckpoint(chkId, "approved");
      expect(resolved?.status).toBe("approved");
      expect(resolved?.resolvedAt).toBeDefined();
      expect(guardrail.getCheckpoint(chkId)?.status).toBe("approved");
    });

    it("should auto-allow whitelisted tools within a session", () => {
      const toolCall: ToolCallRequest = {
        id: "call_whitelisted",
        toolName: "write_to_file",
        arguments: { TargetFile: "src/scratchpad.md", CodeContent: "# Notes" },
      };

      // Before whitelist: requires approval
      expect(guardrail.evaluate(toolCall).decision).toBe("require_approval");

      // Whitelist tool
      guardrail.whitelistTool("write_to_file");

      // After whitelist: auto-allowed
      expect(guardrail.evaluate(toolCall).decision).toBe("allow");

      // Revoke whitelist
      guardrail.revokeWhitelist("write_to_file");
      expect(guardrail.evaluate(toolCall).decision).toBe("require_approval");
    });
  });
});
