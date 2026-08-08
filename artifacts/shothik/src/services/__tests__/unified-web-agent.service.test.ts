import { describe, expect, it, vi } from "vitest";
import { UnifiedWebAgentService } from "../unified-web-agent.service";

describe("UnifiedWebAgentService", () => {
  it("triggers HITL login gate when target URL points to login", async () => {
    const result = await UnifiedWebAgentService.runWebAutomationTask(
      "Extract software engineer contact profiles",
      "https://linkedin.com/login"
    );

    expect(result.status).toBe("hitl_required");
    expect(result.message).toContain("Authentication required");
  });

  it("runs task successfully when no auth gate is present", async () => {
    const result = await UnifiedWebAgentService.runWebAutomationTask(
      "Extract software engineer contact profiles",
      "https://linkedin.com/search?q=Frontend+Engineers"
    );

    expect(result.status).toBe("success");
    expect(result.message).toContain("Sourced 2 leads and uploaded to Reach campaign");
  });

  it("resumes automation successfully after authentication cookies injection", async () => {
    const result = await UnifiedWebAgentService.resumeAutomationAfterLogin(
      "session-12345",
      "mock-auth-cookie-value"
    );

    expect(result.status).toBe("success");
    expect(result.message).toContain("Session authenticated");
  });

  describe("executeActionWithSelfHealing", () => {
    it("executes successfully on first attempt with valid coordinates", async () => {
      const result = await UnifiedWebAgentService.executeActionWithSelfHealing({
        type: "click",
        coordinates: { x: 350, y: 560 }
      });
      expect(result.status).toBe("success");
      expect(result.coordinatesUsed).toEqual({ x: 350, y: 560 });
    });

    it("triggers self-healing coordinate shift on coordinate alignment failure", async () => {
      const result = await UnifiedWebAgentService.executeActionWithSelfHealing({
        type: "click",
        coordinates: { x: 0, y: 0 } // triggers retry
      });
      expect(result.status).toBe("success");
      expect(result.coordinatesUsed.x).toBeGreaterThan(0);
    });
  });

  describe("debugAndResolveStagingBuild", () => {
    it("identifies and resolves missing dependency error", async () => {
      const result = await UnifiedWebAgentService.debugAndResolveStagingBuild(
        "shothik-app",
        "Error: Cannot find module 'lucide-react' in /workspace/index.js"
      );
      expect(result.status).toBe("resolved");
      expect(result.fixCommitSha).toContain("sha-");
      expect(result.message).toContain("Missing dependency resolved");
    });

    it("identifies and resolves syntax errors", async () => {
      const result = await UnifiedWebAgentService.debugAndResolveStagingBuild(
        "shothik-app",
        "SyntaxError: Unexpected token 'export' at line 12"
      );
      expect(result.status).toBe("resolved");
      expect(result.fixCommitSha).toContain("sha-");
      expect(result.message).toContain("Syntax error fixed");
    });

    it("gracefully fails when logs do not match known patterns", async () => {
      const result = await UnifiedWebAgentService.debugAndResolveStagingBuild(
        "shothik-app",
        "Disk space limit exceeded during container write operations"
      );
      expect(result.status).toBe("failed");
      expect(result.message).toContain("Manual intervention required");
    });
  });
});
