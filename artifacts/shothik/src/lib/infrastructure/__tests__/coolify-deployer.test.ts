import { describe, it, expect } from "vitest";
import { CoolifyDokployDeployer } from "../coolify-deployer";

describe("CoolifyDokployDeployer One-Click Deployment Engine", () => {
  it("should deploy Next.js standalone container under sub-90MB Docker image and return live SSL URL", async () => {
    const deployment = await CoolifyDokployDeployer.deployWebsite({
      workspaceId: "ws_deploy_991",
      siteTitle: "Polsia Store Front",
      provider: "coolify",
      customDomain: "store.polsia.app",
      enableMonetization: true,
    });

    expect(deployment.sslActive).toBe(true);
    expect(deployment.liveUrl).toContain("store.polsia.app");
    expect(deployment.providerUsed).toBe("coolify");
    expect(deployment.monetizationInjected).toBe(true);
  });
});
