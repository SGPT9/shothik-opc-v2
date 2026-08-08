# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-guest-playground-access.spec.ts >> TASK-CHAT-01: Freemium Guest Playground Access (20 Scenarios) >> TC-GUEST-15: Middleware allows /api/chat requests to pass through without 401 interception
- Location: e2e\01-guest-playground-access.spec.ts:136:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 400, 401, 403, 429, 500, 503]
```

# Test source

```ts
  41  |     await expect(textarea).toBeVisible();
  42  |   });
  43  | 
  44  |   // [TC-GUEST-05] First Prompt Submission
  45  |   test("TC-GUEST-05: Submitting a message in guest mode streams assistant response", async ({ page }) => {
  46  |     await page.goto("/agents/chat");
  47  |     await page.waitForLoadState("domcontentloaded");
  48  |     const textarea = page.locator("textarea, input[type='text'], [contenteditable='true'], [placeholder*='Ask']").first();
  49  |     if (await textarea.isVisible()) {
  50  |       await textarea.fill("Hello Shothik AI");
  51  |     }
  52  |     await expect(page.locator("body")).toBeVisible();
  53  |   });
  54  | 
  55  |   // [TC-GUEST-06] Local Storage State Persistence
  56  |   test("TC-GUEST-06: Guest conversation state persists in localStorage across reload", async ({ page }) => {
  57  |     await page.goto("/agents/chat");
  58  |     await page.evaluate(() => {
  59  |       localStorage.setItem("shothik_guest_session_v1", JSON.stringify({ active: true, id: "test-guest-123" }));
  60  |     });
  61  |     await page.reload();
  62  |     const stored = await page.evaluate(() => localStorage.getItem("shothik_guest_session_v1"));
  63  |     expect(stored).toContain("test-guest-123");
  64  |   });
  65  | 
  66  |   // [TC-GUEST-07] Persona Switcher Enabled for Guest
  67  |   test("TC-GUEST-07: Guest can freely toggle between Co-Founder, Co-Researcher, and Co-Worker personas", async ({ page }) => {
  68  |     await page.goto("/agents/chat");
  69  |     await page.waitForLoadState("domcontentloaded");
  70  |     const cofounder = page.locator("button:has-text('Co-Founder'), [data-persona='co-founder']").first();
  71  |     if (await cofounder.isVisible()) {
  72  |       await cofounder.click();
  73  |     }
  74  |     await expect(page.locator("body")).toBeVisible();
  75  |   });
  76  | 
  77  |   // [TC-GUEST-08] Response Lens Toggle for Guest
  78  |   test("TC-GUEST-08: Guest can toggle response lenses (Executive / Research / Task Action)", async ({ page }) => {
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
> 141 |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
      |                                                 ^ Error: expect(received).toContain(expected) // indexOf
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
  179 |     expect(response.status()).toBe(200);
  180 |     const headers = response.headers();
  181 |     expect(headers["content-type"]).toContain("text/html");
  182 |   });
  183 | 
  184 | });
  185 | 
```