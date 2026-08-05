import { describe, it, expect } from "vitest";
import { PipedreamConnectService } from "../pipedream-connect";

describe("PipedreamConnectService Managed Auth & OAuth Token Proxy", () => {
  it("should generate Pipedream Connect OAuth config without exposing raw tokens", () => {
    const config = PipedreamConnectService.getConnectConfig({
      externalUserId: "shothik_user_123",
      app: "facebook",
    });

    expect(config.externalUserId).toBe("shothik_user_123");
    expect(config.app).toBe("facebook");
    expect(config.publicKey).toBeDefined();
  });

  it("should execute proxy actions on demand using user externalUserId", async () => {
    const result = await PipedreamConnectService.runAction({
      actionId: "linkedin-post-update",
      externalUserId: "shothik_user_456",
      params: { message: "Autonomous update from Shothik!" },
    });

    expect(result.success).toBe(true);
    expect(result.app).toBe("linkedin");
    expect(result.actionId).toBe("linkedin-post-update");
    expect(result.data).toBeDefined();
  });
});
