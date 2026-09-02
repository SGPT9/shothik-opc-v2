import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/tonight-engine/tonight-graph-runtime", () => ({
  TonightGraphRuntime: {
    executeGraph: vi.fn().mockResolvedValue({
      runId: "run_god_mock_123",
      status: "completed",
    }),
  },
}));

vi.mock("../coolify-deployer", () => ({
  CoolifyDokployDeployer: {
    deployWebsite: vi.fn().mockResolvedValue({
      liveUrl: "https://shothik-preview.dokploy.app",
      docsUrl: "https://shothik-preview.dokploy.app/docs",
      canvasUrl: "https://shothik-preview.dokploy.app/canvas",
    }),
  },
}));

vi.mock("../poltiz-social-engine", () => ({
  PoltizSocialEngine: {
    generateGrowthCampaign: vi.fn().mockResolvedValue({
      campaignId: "camp_social_123",
    }),
  },
}));

vi.mock("../deployment-notification-mailer", () => ({
  DeploymentNotificationMailer: {
    sendDeploymentEmail: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/lib/hermes", () => ({
  getHermesOrchestrator: vi.fn().mockReturnValue({
    artifactManager: {
      createArtifact: vi.fn().mockResolvedValue({
        id: "art_test_123",
        title: "God Mode Report",
      }),
    },
  }),
}));

import { GodModeRuntime } from "../god-mode-runtime";

describe("GodModeRuntime 7-Day Autonomous Engine", () => {
  it("should initialize a 7-day God Mode session, execute an autonomous tick, and handle pause/resume", async () => {
    const session = await GodModeRuntime.startGodModeSession({
      workspaceId: "ws_god_test_1",
      userId: "usr_god_test_1",
      intent: "Automate Full-Stack SaaS Development & Postiz Marketing",
      durationDays: 7,
    });

    expect(session.sessionId).toBeDefined();
    expect(session.status).toBe("active");
    expect(session.durationDays).toBe(7);

    // Execute Autonomous Tick
    const tickResult = await GodModeRuntime.executeAutonomousTick(session.sessionId);
    expect(tickResult.success).toBe(true);
    expect(tickResult.session.ticksCompleted).toBe(1);
    expect(tickResult.deploymentUrl).toBeDefined();
    expect(tickResult.socialCampaignId).toBeDefined();

    // Pause Session
    const paused = await GodModeRuntime.pauseGodModeSession(session.sessionId);
    expect(paused?.status).toBe("paused");

    // Resume Session
    const resumed = await GodModeRuntime.resumeGodModeSession(session.sessionId);
    expect(resumed?.status).toBe("active");
  });
});
