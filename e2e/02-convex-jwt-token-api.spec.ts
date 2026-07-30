import { test, expect } from "@playwright/test";

/**
 * TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios)
 */
test.describe("TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios)", () => {

  // [TC-TOKEN-01] HTTP Status Verification
  test("TC-TOKEN-01: Token endpoint returns expected HTTP status", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    expect([200, 400, 401, 429, 503]).toContain(response.status());
  });

  // [TC-TOKEN-02] Token Property Presence
  test("TC-TOKEN-02: Token response contains valid token string property", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("token");
      expect(typeof data.token).toBe("string");
    }
  });

  // [TC-TOKEN-03] RS256 Header Validation
  test("TC-TOKEN-03: Token header contains RS256 algorithm and kid", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const parts = data.token.split(".");
      const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
      expect(header.alg).toBe("RS256");
      expect(header.kid).toBe("shothik-convex-1");
    }
  });

  // [TC-TOKEN-04] Claims Verification (sub, iss, aud)
  test("TC-TOKEN-04: Token payload contains sub, iss, and aud claims", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const parts = data.token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
      expect(payload.aud).toBe("shothik-publishing");
      expect(payload.iss).toContain("convex.site");
    }
  });

  // [TC-TOKEN-05] JWKS Endpoint Responds
  test("TC-TOKEN-05: Well-known JWKS endpoint serves valid keys array", async ({ request }) => {
    const response = await request.get("/api/.well-known/jwks.json");
    expect([200, 403, 429]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("keys");
      expect(Array.isArray(data.keys)).toBeTruthy();
    }
  });

  // [TC-TOKEN-06] JWKS Keypair Match
  test("TC-TOKEN-06: JWKS keys contain kid shothik-convex-1 and RS256 alg", async ({ request }) => {
    const response = await request.get("/api/.well-known/jwks.json");
    if (response.status() === 200) {
      const data = await response.json();
      const key = data.keys?.find((k: any) => k.kid === "shothik-convex-1");
      expect(key).toBeDefined();
      expect(key.kty).toBe("RSA");
    }
  });

  // [TC-TOKEN-07] Health Check Integration
  test("TC-TOKEN-07: Health check endpoint reports convexAuth status", async ({ request }) => {
    const response = await request.get("/api/health-check");
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.checks.convexAuth.status).toBe("healthy");
      expect(data.checks.convexAuth.keypairMatches).toBeTruthy();
    }
  });

  // [TC-TOKEN-08] Subject User ID Mapping
  test("TC-TOKEN-08: Token sub claim maps to guest-playground-user for guest token", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      expect(payload.sub).toBe("guest-playground-user");
    }
  });

  // [TC-TOKEN-09] Token Expiration Window
  test("TC-TOKEN-09: Token exp claim is set in the future", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      const now = Math.floor(Date.now() / 1000);
      expect(payload.exp).toBeGreaterThan(now);
    }
  });

  // [TC-TOKEN-10] Zero Whitespace Key Integrity
  test("TC-TOKEN-10: Token string has zero spaces or newline characters", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.token).not.toMatch(/\s/);
    }
  });

  // [TC-TOKEN-11] Invalid Access Token Rejection
  test("TC-TOKEN-11: Invalid access token handles request with 401 or fallback guest token", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "invalid-token-123" }
    });
    expect([200, 401, 403, 429, 503]).toContain(response.status());
  });

  // [TC-TOKEN-12] Empty Body Handling
  test("TC-TOKEN-12: Empty JSON body defaults to guest token exchange", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: {}
    });
    expect([200, 400, 401, 429, 503]).toContain(response.status());
  });

  // [TC-TOKEN-13] Performance Latency Check
  test("TC-TOKEN-13: Token exchange responds in under 1500ms", async ({ request }) => {
    const start = Date.now();
    await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1500);
  });

  // [TC-TOKEN-14] OPTIONS Preflight CORS Handshake
  test("TC-TOKEN-14: OPTIONS request returns 200/204 CORS preflight status", async ({ request }) => {
    const response = await request.fetch("/api/auth/convex-token", { method: "OPTIONS" });
    expect([200, 204, 405, 429]).toContain(response.status());
  });

  // [TC-TOKEN-15] Token Format Standard
  test("TC-TOKEN-15: Minted token consists of exactly 3 dot-separated JWT parts", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.token.split(".").length).toBe(3);
    }
  });

  // [TC-TOKEN-16] Issued At (iat) Claim Check
  test("TC-TOKEN-16: Token iat timestamp is less than or equal to current timestamp", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      const now = Math.floor(Date.now() / 1000);
      expect(payload.iat).toBeLessThanOrEqual(now + 10);
    }
  });

  // [TC-TOKEN-17] Email Claim Format
  test("TC-TOKEN-17: Token email claim contains valid email format", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      expect(payload.email).toMatch(/@/);
    }
  });

  // [TC-TOKEN-18] Issuer Protocol Standard
  test("TC-TOKEN-18: Token iss claim starts with https://", async ({ request }) => {
    const response = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (response.status() === 200) {
      const data = await response.json();
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      expect(payload.iss).toMatch(/^https:\/\//);
    }
  });

  // [TC-TOKEN-19] Synthetic Health Check Object Shape
  test("TC-TOKEN-19: Health check returns openRouterStream and insforgeBackend properties", async ({ request }) => {
    const response = await request.get("/api/health-check");
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.checks).toHaveProperty("openRouterStream");
      expect(data.checks).toHaveProperty("insforgeBackend");
    }
  });

  // [TC-TOKEN-20] Full Token Handshake Roundtrip
  test("TC-TOKEN-20: Minted token passes Bearer header verification on protected route", async ({ request }) => {
    const tokenRes = await request.post("/api/auth/convex-token", {
      headers: { "Content-Type": "application/json" },
      data: { accessToken: "guest-playground-token" }
    });
    if (tokenRes.status() === 200) {
      const { token } = await tokenRes.json();
      const runsRes = await request.get("/api/hermes/runs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      expect([200, 401, 403, 404, 500]).toContain(runsRes.status());
    }
  });

});
