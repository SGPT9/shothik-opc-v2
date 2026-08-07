import { describe, expect, it } from "vitest";
import { PipedreamConnectService } from "@/lib/infrastructure/pipedream-connect";

describe("PipedreamConnectService (OAuth Proxy Engine)", () => {
  it("generates Pipedream Connect OAuth initialization config", () => {
    const config = PipedreamConnectService.getConnectConfig({
      externalUserId: "usr_pipedream_123",
      app: "facebook",
      oauthAppId: "oauth_app_fb_99",
    });

    expect(config.publicKey).toBeDefined();
    expect(config.app).toBe("facebook");
    expect(config.externalUserId).toBe("usr_pipedream_123");
    expect(config.oauthAppId).toBe("oauth_app_fb_99");
  });

  it("executes a Pipedream action on behalf of an authenticated user", async () => {
    const result = await PipedreamConnectService.runAction({
      actionId: "linkedin-post-update",
      externalUserId: "usr_pipedream_123",
      params: { text: "Launching Shothik AI Growth OS" },
    });

    expect(result.success).toBe(true);
    expect(result.actionId).toBe("linkedin-post-update");
    expect(result.app).toBe("linkedin");
    expect(result.data).toBeDefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
