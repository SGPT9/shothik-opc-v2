# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-convex-jwt-token-api.spec.ts >> TASK-CHAT-02: Convex JWT Token API Verification (20 Scenarios) >> TC-TOKEN-14: OPTIONS request returns 200/204 CORS preflight status
- Location: e2e\02-convex-jwt-token-api.spec.ts:162:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 204, 405, 429]
```

# Test source

```ts
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
  115 |       const now = Math.floor(Date.now() / 1000);
  116 |       expect(payload.exp).toBeGreaterThan(now);
  117 |     }
  118 |   });
  119 | 
  120 |   // [TC-TOKEN-10] Zero Whitespace Key Integrity
  121 |   test("TC-TOKEN-10: Token string has zero spaces or newline characters", async ({ request }) => {
  122 |     const response = await request.post("/api/auth/convex-token", {
  123 |       headers: { "Content-Type": "application/json" },
  124 |       data: { accessToken: "guest-playground-token" }
  125 |     });
  126 |     if (response.status() === 200) {
  127 |       const data = await response.json();
  128 |       expect(data.token).not.toMatch(/\s/);
  129 |     }
  130 |   });
  131 | 
  132 |   // [TC-TOKEN-11] Invalid Access Token Rejection
  133 |   test("TC-TOKEN-11: Invalid access token handles request with 401 or fallback guest token", async ({ request }) => {
  134 |     const response = await request.post("/api/auth/convex-token", {
  135 |       headers: { "Content-Type": "application/json" },
  136 |       data: { accessToken: "invalid-token-123" }
  137 |     });
  138 |     expect([200, 401, 403, 429, 503]).toContain(response.status());
  139 |   });
  140 | 
  141 |   // [TC-TOKEN-12] Empty Body Handling
  142 |   test("TC-TOKEN-12: Empty JSON body defaults to guest token exchange", async ({ request }) => {
  143 |     const response = await request.post("/api/auth/convex-token", {
  144 |       headers: { "Content-Type": "application/json" },
  145 |       data: {}
  146 |     });
  147 |     expect([200, 400, 401, 429, 503]).toContain(response.status());
  148 |   });
  149 | 
  150 |   // [TC-TOKEN-13] Performance Latency Check
  151 |   test("TC-TOKEN-13: Token exchange responds in under 1500ms", async ({ request }) => {
  152 |     const start = Date.now();
  153 |     await request.post("/api/auth/convex-token", {
  154 |       headers: { "Content-Type": "application/json" },
  155 |       data: { accessToken: "guest-playground-token" }
  156 |     });
  157 |     const duration = Date.now() - start;
  158 |     expect(duration).toBeLessThan(1500);
  159 |   });
  160 | 
  161 |   // [TC-TOKEN-14] OPTIONS Preflight CORS Handshake
  162 |   test("TC-TOKEN-14: OPTIONS request returns 200/204 CORS preflight status", async ({ request }) => {
  163 |     const response = await request.fetch("/api/auth/convex-token", { method: "OPTIONS" });
> 164 |     expect([200, 204, 405, 429]).toContain(response.status());
      |                                  ^ Error: expect(received).toContain(expected) // indexOf
  165 |   });
  166 | 
  167 |   // [TC-TOKEN-15] Token Format Standard
  168 |   test("TC-TOKEN-15: Minted token consists of exactly 3 dot-separated JWT parts", async ({ request }) => {
  169 |     const response = await request.post("/api/auth/convex-token", {
  170 |       headers: { "Content-Type": "application/json" },
  171 |       data: { accessToken: "guest-playground-token" }
  172 |     });
  173 |     if (response.status() === 200) {
  174 |       const data = await response.json();
  175 |       expect(data.token.split(".").length).toBe(3);
  176 |     }
  177 |   });
  178 | 
  179 |   // [TC-TOKEN-16] Issued At (iat) Claim Check
  180 |   test("TC-TOKEN-16: Token iat timestamp is less than or equal to current timestamp", async ({ request }) => {
  181 |     const response = await request.post("/api/auth/convex-token", {
  182 |       headers: { "Content-Type": "application/json" },
  183 |       data: { accessToken: "guest-playground-token" }
  184 |     });
  185 |     if (response.status() === 200) {
  186 |       const data = await response.json();
  187 |       const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
  188 |       const now = Math.floor(Date.now() / 1000);
  189 |       expect(payload.iat).toBeLessThanOrEqual(now + 10);
  190 |     }
  191 |   });
  192 | 
  193 |   // [TC-TOKEN-17] Email Claim Format
  194 |   test("TC-TOKEN-17: Token email claim contains valid email format", async ({ request }) => {
  195 |     const response = await request.post("/api/auth/convex-token", {
  196 |       headers: { "Content-Type": "application/json" },
  197 |       data: { accessToken: "guest-playground-token" }
  198 |     });
  199 |     if (response.status() === 200) {
  200 |       const data = await response.json();
  201 |       const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
  202 |       expect(payload.email).toMatch(/@/);
  203 |     }
  204 |   });
  205 | 
  206 |   // [TC-TOKEN-18] Issuer Protocol Standard
  207 |   test("TC-TOKEN-18: Token iss claim starts with https://", async ({ request }) => {
  208 |     const response = await request.post("/api/auth/convex-token", {
  209 |       headers: { "Content-Type": "application/json" },
  210 |       data: { accessToken: "guest-playground-token" }
  211 |     });
  212 |     if (response.status() === 200) {
  213 |       const data = await response.json();
  214 |       const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
  215 |       expect(payload.iss).toMatch(/^https:\/\//);
  216 |     }
  217 |   });
  218 | 
  219 |   // [TC-TOKEN-19] Synthetic Health Check Object Shape
  220 |   test("TC-TOKEN-19: Health check returns openRouterStream and insforgeBackend properties", async ({ request }) => {
  221 |     const response = await request.get("/api/health-check");
  222 |     expect([200, 503, 429]).toContain(response.status());
  223 |     if (response.status() === 200) {
  224 |       const data = await response.json();
  225 |       expect(data.checks).toHaveProperty("openRouterStream");
  226 |       expect(data.checks).toHaveProperty("insforgeBackend");
  227 |     }
  228 |   });
  229 | 
  230 |   // [TC-TOKEN-20] Full Token Handshake Roundtrip
  231 |   test("TC-TOKEN-20: Minted token passes Bearer header verification on protected route", async ({ request }) => {
  232 |     const tokenRes = await request.post("/api/auth/convex-token", {
  233 |       headers: { "Content-Type": "application/json" },
  234 |       data: { accessToken: "guest-playground-token" }
  235 |     });
  236 |     if (tokenRes.status() === 200) {
  237 |       const { token } = await tokenRes.json();
  238 |       const runsRes = await request.get("/api/hermes/runs", {
  239 |         headers: { "Authorization": `Bearer ${token}` }
  240 |       });
  241 |       expect([200, 401, 403, 404, 500]).toContain(runsRes.status());
  242 |     }
  243 |   });
  244 | 
  245 | });
  246 | 
```