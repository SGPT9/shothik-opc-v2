import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/tonight-engine/tonight-graph-runtime", () => ({
  TonightGraphRuntime: {
    executeGraph: vi.fn().mockResolvedValue({
      runId: "run_mock_trigger_123",
      status: "completed",
    }),
  },
}));

vi.mock("@/lib/hermes", () => ({
  getHermesOrchestrator: vi.fn().mockReturnValue({
    artifactManager: {
      createArtifact: vi.fn().mockResolvedValue({
        id: "art_test_123",
        title: "Trigger Report",
      }),
    },
  }),
}));

import { HermesTriggerGateway } from "../trigger-gateway";

describe("HermesTriggerGateway Autonomous Ingress", () => {
  it("should process GitHub webhooks and dispatch code review swarm runs", async () => {
    const result = await HermesTriggerGateway.handleWebhook("github", {
      action: "opened",
      pull_request: { number: 42 },
      repository: { full_name: "ahsanhab919-ux/shothik-web" },
      workspaceId: "ws_trig_test_1",
    });

    expect(result.triggered).toBe(true);
    expect(result.provider).toBe("github");
    expect(result.mappedIntent).toContain("Autonomous Code & Security Review");
    expect(result.runId).toBeDefined();
  });

  it("should process InsForge DB mutation webhooks and dispatch onboarding runs", async () => {
    const result = await HermesTriggerGateway.handleWebhook("insforge", {
      table: "users",
      eventType: "INSERT",
      workspaceId: "ws_trig_test_2",
    });

    expect(result.triggered).toBe(true);
    expect(result.provider).toBe("insforge");
    expect(result.mappedIntent).toContain("Automated Customer Prospecting & Onboarding");
    expect(result.runId).toBeDefined();
  });

  it("should execute scheduled cron jobs cleanly", async () => {
    const result = await HermesTriggerGateway.handleCronSchedule("nightly_security_audit_2am");

    expect(result.triggered).toBe(true);
    expect(result.provider).toBe("cron");
    expect(result.mappedIntent).toContain("Nightly Automated Security");
    expect(result.runId).toBeDefined();
  });
});
