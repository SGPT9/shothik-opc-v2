import { describe, it, expect } from "vitest";
import { CoolifyDokployDeployer } from "../coolify-deployer";
import { CustomDomainDnsService } from "../custom-domain-dns";

describe("CoolifyDokployDeployer & Hosting Ecosystem", () => {
  it("should deploy a website, generate live URLs, auto-inject OpenAPI/Stripe, and send user email digest", async () => {
    const result = await CoolifyDokployDeployer.deployWebsite({
      workspaceId: "ws_deploy_test_1",
      siteTitle: "AI Writing Assistant SaaS",
      userEmail: "founder@shothik.ai",
      provider: "coolify",
      enableMonetization: true,
    });

    expect(result.deploymentId).toBeDefined();
    expect(result.liveUrl).toBe("https://ai-writing-assistant-saas.shothik.app");
    expect(result.docsUrl).toBe("https://ai-writing-assistant-saas.shothik.app/docs");
    expect(result.sslActive).toBe(true);
    expect(result.monetizationInjected).toBe(true);
    expect(result.openApiInjected).toBe(true);
    expect(result.emailNotificationSent).toBe(true);
  });

  it("should verify custom domain DNS CNAME and bind custom domain live URL", async () => {
    const dnsStatus = await CustomDomainDnsService.verifyAndBindCustomDomain("ws_deploy_test_2", "https://app.mycompany.com");
    expect(dnsStatus.verified).toBe(true);
    expect(dnsStatus.domain).toBe("app.mycompany.com");

    const result = await CoolifyDokployDeployer.deployWebsite({
      workspaceId: "ws_deploy_test_2",
      siteTitle: "Custom Domain SaaS",
      customDomain: "app.mycompany.com",
    });

    expect(result.liveUrl).toBe("https://app.mycompany.com");
    expect(result.docsUrl).toBe("https://app.mycompany.com/docs");
  });
});
