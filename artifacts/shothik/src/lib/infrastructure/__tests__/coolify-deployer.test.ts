import { describe, it, expect } from "vitest";
import { CoolifyDokployDeployer } from "../coolify-deployer";

describe("CoolifyDokployDeployer One-Click Deployment Engine", () => {
  it("should deploy Next.js standalone container under sub-90MB Docker image and return live SSL URL", async () => {
    const deployment = await CoolifyDokployDeployer.deployWebsite({
      workspaceId: "ws_deploy_991",
      siteTitle: "Shothik Store Front",
      provider: "coolify",
      customDomain: "store.shothikgpt.com",
      enableMonetization: true,
    });

    expect(deployment.sslActive).toBe(true);
    expect(deployment.liveUrl).toContain("store.shothikgpt.com");
    expect(deployment.providerUsed).toBe("coolify");
    expect(deployment.monetizationInjected).toBe(true);
    expect(deployment.containerSizeEstimateMb).toBe(88);
    expect(deployment.dockerfileSnippet).toContain("USER nextjs");
    expect(deployment.dockerfileSnippet).toContain(".next/standalone");
    expect(deployment.nextConfigSnippet).toContain("output: 'standalone'");
  });

  it("should generate a valid 3-stage minimal Dockerfile with non-root execution", () => {
    const dockerfile = CoolifyDokployDeployer.generateStandaloneDockerfile();
    expect(dockerfile).toContain("FROM node:20-alpine AS deps");
    expect(dockerfile).toContain("FROM node:20-alpine AS builder");
    expect(dockerfile).toContain("FROM node:20-alpine AS runner");
    expect(dockerfile).toContain("adduser --system --uid 1001 nextjs");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain('CMD ["node", "server.js"]');
  });

  it("should generate standalone next.config.js snippet", () => {
    const config = CoolifyDokployDeployer.generateStandaloneNextConfig();
    expect(config).toContain("output: 'standalone'");
    expect(config).toContain("module.exports = nextConfig;");
  });
});
