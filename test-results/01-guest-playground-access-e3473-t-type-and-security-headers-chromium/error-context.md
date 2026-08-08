# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-guest-playground-access.spec.ts >> TASK-CHAT-01: Freemium Guest Playground Access (20 Scenarios) >> TC-GUEST-20: Response headers contain valid content-type and security headers
- Location: e2e\01-guest-playground-access.spec.ts:177:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  79  |     await page.goto("/agents/chat");
  80  |     await page.waitForLoadState("domcontentloaded");
  81  |     const lensBtn = page.locator("button:has-text('Executive'), button:has-text('Lens')").first();
  82  |     if (await lensBtn.isVisible()) {
  83  |       await lensBtn.click();
  84  |     }
  85  |     await expect(page.locator("body")).toBeVisible();
  86  |   });
  87  | 
  88  |   // [TC-GUEST-09] Anonymous Usage Quota Check
  89  |   test("TC-GUEST-09: User limit API route returns valid quota for guest user", async ({ request }) => {
  90  |     const response = await request.get("/api/user-limit");
  91  |     expect([200, 401, 403, 404, 429]).toContain(response.status());
  92  |   });
  93  | 
  94  |   // [TC-GUEST-10] Sign In Callback Preservation
  95  |   test("TC-GUEST-10: Sign in button in header preserves callbackUrl to /agents/chat", async ({ page }) => {
  96  |     await page.goto("/agents/chat");
  97  |     await page.waitForLoadState("domcontentloaded");
  98  |     const signInBtn = page.locator("a[href*='/auth/login'], button:has-text('Sign In')").first();
  99  |     if (await signInBtn.isVisible()) {
  100 |       const href = await signInBtn.getAttribute("href");
  101 |       if (href) {
  102 |         expect(href).toMatch(/login|callbackUrl/);
  103 |       }
  104 |     }
  105 |   });
  106 | 
  107 |   // [TC-GUEST-11] Guest Session Struct Validation
  108 |   test("TC-GUEST-11: Guest session endpoint returns valid session structure", async ({ request }) => {
  109 |     const response = await request.get("/api/auth/session");
  110 |     const data = await response.json().catch(() => ({}));
  111 |     expect(typeof data).toBe("object");
  112 |   });
  113 | 
  114 |   // [TC-GUEST-12] Deep Link Share Access
  115 |   test("TC-GUEST-12: Opening shared chat route as guest renders chat shell without login prompt", async ({ page }) => {
  116 |     await page.goto("/agents/chat?shareId=demo");
  117 |     await expect(page).not.toHaveURL(/\/auth\/login/);
  118 |     await expect(page.locator("body")).toBeVisible();
  119 |   });
  120 | 
  121 |   // [TC-GUEST-13] Third Party Cookie Bypass
  122 |   test("TC-GUEST-13: Chat playground functions cleanly without requiring third-party cookies", async ({ page }) => {
  123 |     await page.goto("/agents/chat");
  124 |     await expect(page.locator("body")).toBeVisible();
  125 |   });
  126 | 
  127 |   // [TC-GUEST-14] Offline Network Handling
  128 |   test("TC-GUEST-14: Page state remains intact during offline network event", async ({ page, context }) => {
  129 |     await page.goto("/agents/chat");
  130 |     await context.setOffline(true);
  131 |     await expect(page.locator("body")).toBeVisible();
  132 |     await context.setOffline(false);
  133 |   });
  134 | 
  135 |   // [TC-GUEST-15] Middleware Passthrough
  136 |   test("TC-GUEST-15: Middleware allows /api/chat requests to pass through without 401 interception", async ({ request }) => {
  137 |     const response = await request.post("/api/chat", {
  138 |       headers: { "Content-Type": "application/json" },
  139 |       data: { message: "ping" },
  140 |     });
  141 |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
  142 |   });
  143 | 
  144 |   // [TC-GUEST-16] Anonymous Usage Quota Rate Limit Check
  145 |   test("TC-GUEST-16: Usage enforcement endpoint handles anonymous rate limit queries", async ({ request }) => {
  146 |     const response = await request.get("/api/user-limit");
  147 |     expect([200, 401, 403, 404, 429]).toContain(response.status());
  148 |   });
  149 | 
  150 |   // [TC-GUEST-17] Mobile Chrome Viewport Rendering
  151 |   test("TC-GUEST-17: Mobile viewport renders composer and hamburger menu cleanly", async ({ page }) => {
  152 |     await page.setViewportSize({ width: 375, height: 667 });
  153 |     await page.goto("/agents/chat");
  154 |     await expect(page.locator("body")).toBeVisible();
  155 |   });
  156 | 
  157 |   // [TC-GUEST-18] Dark/Light Theme Switching
  158 |   test("TC-GUEST-18: Dark/Light theme toggling persists in localStorage", async ({ page }) => {
  159 |     await page.goto("/agents/chat");
  160 |     await page.evaluate(() => localStorage.setItem("theme", "dark"));
  161 |     await page.reload();
  162 |     const theme = await page.evaluate(() => localStorage.getItem("theme"));
  163 |     expect(theme).toBe("dark");
  164 |   });
  165 | 
  166 |   // [TC-GUEST-19] Anonymous Event Telemetry Check
  167 |   test("TC-GUEST-19: Guest playground dispatches custom telemetry event cleanly", async ({ page }) => {
  168 |     await page.goto("/agents/chat");
  169 |     const dispatched = await page.evaluate(() => {
  170 |       window.dispatchEvent(new CustomEvent("guest_playground_entry", { detail: { id: "test" } }));
  171 |       return true;
  172 |     });
  173 |     expect(dispatched).toBeTruthy();
  174 |   });
  175 | 
  176 |   // [TC-GUEST-20] Edge Response Header Verification
  177 |   test("TC-GUEST-20: Response headers contain valid content-type and security headers", async ({ request }) => {
  178 |     const response = await request.get("/agents/chat");
> 179 |     expect(response.status()).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  180 |     const headers = response.headers();
  181 |     expect(headers["content-type"]).toContain("text/html");
  182 |   });
  183 | 
  184 | });
  185 | 
```