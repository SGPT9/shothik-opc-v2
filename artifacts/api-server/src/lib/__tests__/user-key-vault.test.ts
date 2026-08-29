import { describe, it, expect, beforeEach } from "vitest";
import { userKeyVault } from "../user-key-vault";

describe("UserKeyVault — AES-256-GCM BYOK Custody & Circuit Breaker", () => {
  const userId = `usr_founder_${Date.now()}`;

  it("stores and unseals user OpenAI API credentials cleanly", async () => {
    await userKeyVault.saveKey(userId, "openai", {
      apiKey: "sk-proj-test-1234567890abcdefg",
      endpointUrl: "https://api.openai.com/v1",
    });

    const credentials = await userKeyVault.getKey(userId, "openai");
    expect(credentials).not.toBeNull();
    expect(credentials?.apiKey).toBe("sk-proj-test-1234567890abcdefg");
    expect(credentials?.endpointUrl).toBe("https://api.openai.com/v1");
  });

  it("stores and unseals Steadfast courier merchant credentials", async () => {
    await userKeyVault.saveKey(userId, "steadfast", {
      apiKey: "sf_api_key_live_9981827",
      secretKey: "sf_secret_live_7726152",
    });

    const credentials = await userKeyVault.getKey(userId, "steadfast");
    expect(credentials).not.toBeNull();
    expect(credentials?.apiKey).toBe("sf_api_key_live_9981827");
    expect(credentials?.secretKey).toBe("sf_secret_live_7726152");
  });

  it("lists configured providers with masked key previews (never leaking full keys)", async () => {
    const list = await userKeyVault.listUserProviders(userId);
    expect(list["openai"]).toBeDefined();
    expect(list["openai"].configured).toBe(true);
    expect(list["openai"].maskedKey).toContain("...");
    expect(list["openai"].maskedKey).not.toBe("sk-proj-test-1234567890abcdefg");

    expect(list["steadfast"]).toBeDefined();
    expect(list["steadfast"].configured).toBe(true);
    expect(list["steadfast"].maskedKey).toContain("...");
  });

  it("deletes credentials cleanly upon user request", async () => {
    await userKeyVault.deleteKey(userId, "openai");
    const credentials = await userKeyVault.getKey(userId, "openai");
    expect(credentials).toBeNull();
  });
});
