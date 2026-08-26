import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTurnstileToken } from "../turnstile-verify";

describe("Turnstile Token Verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("grants bypass for test_pass_token", async () => {
    const result = await verifyTurnstileToken("test_pass_token", "real_secret");
    expect(result.success).toBe(true);
    expect(result.hostname).toBe("localhost");
  });

  it("grants bypass when secretKey is test_secret_bypass", async () => {
    const result = await verifyTurnstileToken("some_token", "test_secret_bypass");
    expect(result.success).toBe(true);
  });

  it("returns error for empty token when secret is provided", async () => {
    const result = await verifyTurnstileToken("", "valid_prod_secret_123");
    expect(result.success).toBe(false);
    expect(result.error_codes).toContain("missing-input-response");
  });

  it("calls Cloudflare verification endpoint and returns payload", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        challenge_ts: "2026-08-26T10:00:00Z",
        hostname: "shothik-eight.vercel.app",
      }),
    } as any);

    const result = await verifyTurnstileToken("valid_cf_token", "valid_prod_secret_123", "127.0.0.1");
    expect(result.success).toBe(true);
    expect(result.hostname).toBe("shothik-eight.vercel.app");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" })
    );
  });
});
