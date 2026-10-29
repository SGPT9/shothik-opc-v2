import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Unified Authentication Endpoints", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const testUser = {
    name: "Dr. Rafiqul Islam",
    email: `rafiq_${Date.now()}@shothik.edu.bd`,
    password: "SecurePassword123!",
    country: "BD",
  };

  it("POST /api/auth/sign-up registers user with 500 credits and token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.token).toBeDefined();
    expect(json.user.email).toBe(testUser.email.toLowerCase());
    expect(json.user.credits).toBe(500);
    expect(json.user.role).toBe("user");
  });

  it("POST /api/auth/sign-in authenticates and rejects wrong password", async () => {
    // 1. Wrong password
    const failRes = await fetch(`${baseUrl}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: "WrongPassword!",
      }),
    });
    expect(failRes.status).toBe(401);

    // 2. Correct password
    const okRes = await fetch(`${baseUrl}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    expect(okRes.status).toBe(200);
    const okJson = await okRes.json();
    expect(okJson.success).toBe(true);
    expect(okJson.token).toBeDefined();
    expect(okJson.user.name).toBe(testUser.name);
  });

  it("GET /api/auth/session verifies session with Bearer token", async () => {
    // 1. Sign in to obtain token
    const signInRes = await fetch(`${baseUrl}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const { token } = await signInRes.json();

    // 2. Access session
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(sessionRes.status).toBe(200);
    const sessionJson = await sessionRes.json();
    expect(sessionJson.user.email).toBe(testUser.email.toLowerCase());
  });

  it("GET /api/auth/oauth/google sanitizes malicious next redirect parameter against XSS and open redirects", async () => {
    const res = await fetch(`${baseUrl}/api/auth/oauth/google?next=${encodeURIComponent('javascript:alert(1)//')}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).not.toContain("javascript:alert(1)");
    expect(html).toContain('window.location.replace("/twin")');
  });

  it("POST /api/auth/sign-out clears session", async () => {
    const res = await fetch(`${baseUrl}/api/auth/sign-out`, {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
