# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-convex-jwt-token-api.spec.ts >> TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios) >> TC-TOKEN-01: Token endpoint returns expected HTTP status
- Location: e2e\02-convex-jwt-token-api.spec.ts:9:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 400, 401, 429, 503]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios)", () => {
  7   | 
  8   |   // [TC-TOKEN-01] HTTP Status Verification
  9   |   test("TC-TOKEN-01: Token endpoint returns expected HTTP status", async ({ request }) => {
  10  |     const response = await request.post("/api/auth/convex-token", {
  11  |       headers: { "Content-Type": "application/json" },
  12  |       data: { accessToken: "guest-playground-token" }
  13  |     });
> 14  |     expect([200, 400, 401, 429, 503]).toContain(response.status());
      |                                       ^ Error: expect(received).toContain(expected) // indexOf
  15  |   });
  16  | 
  17  |   // [TC-TOKEN-02] Token Property Presence
  18  |   test("TC-TOKEN-02: Token response contains valid token string property", async ({ request }) => {
  19  |     const response = await request.post("/api/auth/convex-token", {
  20  |       headers: { "Content-Type": "application/json" },
  21  |       data: { accessToken: "guest-playground-token" }
  22  |     });
  23  |     if (response.status() === 200) {
  24  |       const data = await response.json();
  25  |       expect(data).toHaveProperty("token");
  26  |       expect(typeof data.token).toBe("string");
  27  |     }
  28  |   });
  29  | 
  30  |   // [TC-TOKEN-03] RS256 Header Validation
  31  |   test("TC-TOKEN-03: Token header contains RS256 algorithm and kid", async ({ request }) => {
  32  |     const response = await request.post("/api/auth/convex-token", {
  33  |       headers: { "Content-Type": "application/json" },
  34  |       data: { accessToken: "guest-playground-token" }
  35  |     });
  36  |     if (response.status() === 200) {
  37  |       const data = await response.json();
  38  |       const parts = data.token.split(".");
  39  |       const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
  40  |       expect(header.alg).toBe("RS256");
  41  |       expect(header.kid).toBe("shothik-convex-1");
  42  |     }
  43  |   });
  44  | 
  45  |   // [TC-TOKEN-04] Claims Verification (sub, iss, aud)
  46  |   test("TC-TOKEN-04: Token payload contains sub, iss, and aud claims", async ({ request }) => {
  47  |     const response = await request.post("/api/auth/convex-token", {
  48  |       headers: { "Content-Type": "application/json" },
  49  |       data: { accessToken: "guest-playground-token" }
  50  |     });
  51  |     if (response.status() === 200) {
  52  |       const data = await response.json();
  53  |       const parts = data.token.split(".");
  54  |       const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  55  |       expect(payload.aud).toBe("shothik-publishing");
  56  |       expect(payload.iss).toContain("convex.site");
  57  |     }
  58  |   });
  59  | 
  60  |   // [TC-TOKEN-05] JWKS Endpoint Responds
  61  |   test("TC-TOKEN-05: Well-known JWKS endpoint serves valid keys array", async ({ request }) => {
  62  |     const response = await request.get("/api/.well-known/jwks.json");
  63  |     expect([200, 403, 429]).toContain(response.status());
  64  |     if (response.status() === 200) {
  65  |       const data = await response.json();
  66  |       expect(data).toHaveProperty("keys");
  67  |       expect(Array.isArray(data.keys)).toBeTruthy();
  68  |     }
  69  |   });
  70  | 
  71  |   // [TC-TOKEN-06] JWKS Keypair Match
  72  |   test("TC-TOKEN-06: JWKS keys contain kid shothik-convex-1 and RS256 alg", async ({ request }) => {
  73  |     const response = await request.get("/api/.well-known/jwks.json");
  74  |     if (response.status() === 200) {
  75  |       const data = await response.json();
  76  |       const key = data.keys?.find((k: any) => k.kid === "shothik-convex-1");
  77  |       expect(key).toBeDefined();
  78  |       expect(key.kty).toBe("RSA");
  79  |     }
  80  |   });
  81  | 
  82  |   // [TC-TOKEN-07] Health Check Integration
  83  |   test("TC-TOKEN-07: Health check endpoint reports convexAuth status", async ({ request }) => {
  84  |     const response = await request.get("/api/health-check");
  85  |     expect([200, 503, 429]).toContain(response.status());
  86  |     if (response.status() === 200) {
  87  |       const data = await response.json();
  88  |       expect(data.checks.convexAuth.status).toBe("healthy");
  89  |       expect(data.checks.convexAuth.keypairMatches).toBeTruthy();
  90  |     }
  91  |   });
  92  | 
  93  |   // [TC-TOKEN-08] Subject User ID Mapping
  94  |   test("TC-TOKEN-08: Token sub claim maps to guest-playground-user for guest token", async ({ request }) => {
  95  |     const response = await request.post("/api/auth/convex-token", {
  96  |       headers: { "Content-Type": "application/json" },
  97  |       data: { accessToken: "guest-playground-token" }
  98  |     });
  99  |     if (response.status() === 200) {
  100 |       const data = await response.json();
  101 |       const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
  102 |       expect(payload.sub).toBe("guest-playground-user");
  103 |     }
  104 |   });
  105 | 
  106 |   // [TC-TOKEN-09] Token Expiration Window
  107 |   test("TC-TOKEN-09: Token exp claim is set in the future", async ({ request }) => {
  108 |     const response = await request.post("/api/auth/convex-token", {
  109 |       headers: { "Content-Type": "application/json" },
  110 |       data: { accessToken: "guest-playground-token" }
  111 |     });
  112 |     if (response.status() === 200) {
  113 |       const data = await response.json();
  114 |       const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
```