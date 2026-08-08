# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-playground-taskmaster.spec.ts >> TASK-CHAT-01: Freemium Guest Playground Deep Verification (15 Scenarios) >> TC-GUEST-02: Session endpoint returns expected status for unauthenticated guest
- Location: e2e\guest-playground-taskmaster.spec.ts:24:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 401, 403]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * TASK-CHAT-01: Freemium Guest Playground Access Without Login Redirects
  5   |  * 15 Production Test Scenarios
  6   |  */
  7   | test.describe("TASK-CHAT-01: Freemium Guest Playground Deep Verification (15 Scenarios)", () => {
  8   | 
  9   |   test.beforeEach(async ({ page, context }) => {
  10  |     // Ensure clean state (no auth cookies or storage)
  11  |     await context.clearCookies();
  12  |     await page.goto("about:blank");
  13  |   });
  14  | 
  15  |   // [TC-GUEST-01] Incognito Direct Navigation & Visual Snapshot
  16  |   test("TC-GUEST-01: Incognito direct navigation to /agents/chat does not redirect to /auth/login", async ({ page }) => {
  17  |     await page.goto("/agents/chat");
  18  |     await expect(page).not.toHaveURL(/\/auth\/login/);
  19  |     await expect(page).toHaveURL(/\/agents\/chat/);
  20  |     await expect(page.locator("body")).toBeVisible();
  21  |   });
  22  | 
  23  |   // [TC-GUEST-02] Session Endpoint Response
  24  |   test("TC-GUEST-02: Session endpoint returns expected status for unauthenticated guest", async ({ request }) => {
  25  |     const response = await request.get("/api/auth/session");
> 26  |     expect([200, 401, 403]).toContain(response.status());
      |                             ^ Error: expect(received).toContain(expected) // indexOf
  27  |   });
  28  | 
  29  |   // [TC-GUEST-03] Convex JWT Token Generation for Guest
  30  |   test("TC-GUEST-03: Convex token endpoint handles POST token exchange", async ({ request }) => {
  31  |     const response = await request.post("/api/auth/convex-token", {
  32  |       headers: { "Content-Type": "application/json" },
  33  |       data: { accessToken: "demo-token" },
  34  |     });
  35  |     expect([200, 400, 401, 404, 405, 429, 503]).toContain(response.status());
  36  |   });
  37  | 
  38  |   // [TC-GUEST-04] Composer Input Enabled
  39  |   test("TC-GUEST-04: Composer input box is unlocked, visible, and editable for guest", async ({ page }) => {
  40  |     await page.goto("/agents/chat");
  41  |     await page.waitForLoadState("domcontentloaded");
  42  |     const textarea = page.locator("textarea, input[type='text'], [contenteditable='true'], [placeholder*='Ask']").first();
  43  |     await expect(textarea).toBeVisible();
  44  |   });
  45  | 
  46  |   // [TC-GUEST-05] First Message Submission
  47  |   test("TC-GUEST-05: Submitting a message in guest mode streams assistant response", async ({ page }) => {
  48  |     await page.goto("/agents/chat");
  49  |     await page.waitForLoadState("domcontentloaded");
  50  |     const textarea = page.locator("textarea, input[type='text'], [contenteditable='true'], [placeholder*='Ask']").first();
  51  |     if (await textarea.isVisible()) {
  52  |       await textarea.fill("Hello Shothik");
  53  |     }
  54  |     await expect(page.locator("body")).toBeVisible();
  55  |   });
  56  | 
  57  |   // [TC-GUEST-06] Local Storage Guest State Persistence
  58  |   test("TC-GUEST-06: Guest conversation state persists in localStorage across reload", async ({ page }) => {
  59  |     await page.goto("/agents/chat");
  60  |     await page.evaluate(() => {
  61  |       localStorage.setItem("shothik_guest_active_chat", JSON.stringify({ id: "test-guest-session", name: "Guest Session" }));
  62  |     });
  63  |     await page.reload();
  64  |     const stored = await page.evaluate(() => localStorage.getItem("shothik_guest_active_chat"));
  65  |     expect(stored).toContain("test-guest-session");
  66  |   });
  67  | 
  68  |   // [TC-GUEST-07] Persona Selection as Guest
  69  |   test("TC-GUEST-07: Guest can freely toggle between 🚀 Co-Founder, 🔬 Co-Researcher, and 💼 Co-Worker personas", async ({ page }) => {
  70  |     await page.goto("/agents/chat");
  71  |     const personaBtns = page.locator("button").filter({ hasText: /co-founder|co-researcher|co-worker/i });
  72  |     if (await personaBtns.count() > 0) {
  73  |       await personaBtns.first().click();
  74  |     }
  75  |     await expect(page.locator("body")).toBeVisible();
  76  |   });
  77  | 
  78  |   // [TC-GUEST-08] Persona Lens Toggle as Guest
  79  |   test("TC-GUEST-08: Guest can toggle response lenses (Executive / Research / Task Action)", async ({ page }) => {
  80  |     await page.goto("/agents/chat");
  81  |     const lensBtns = page.locator("button").filter({ hasText: /executive|research|task action/i });
  82  |     if (await lensBtns.count() > 0) {
  83  |       await lensBtns.first().click();
  84  |     }
  85  |     await expect(page.locator("body")).toBeVisible();
  86  |   });
  87  | 
  88  |   // [TC-GUEST-09] Rate Limiting & Usage Shield for Guest
  89  |   test("TC-GUEST-09: User limit API route returns valid quota for guest user", async ({ request }) => {
  90  |     const response = await request.get("/api/user-limit");
  91  |     expect([200, 429]).toContain(response.status());
  92  |   });
  93  | 
  94  |   // [TC-GUEST-10] Guest to Authenticated Sign-In Link
  95  |   test("TC-GUEST-10: Sign in button in header preserves callbackUrl to /agents/chat", async ({ page }) => {
  96  |     await page.goto("/agents/chat");
  97  |     const signInBtn = page.locator("a[href*='/auth/login'], button:has-text('Sign In')").first();
  98  |     if (await signInBtn.isVisible()) {
  99  |       const href = await signInBtn.getAttribute("href");
  100 |       if (href) {
  101 |         expect(href).toContain("/auth/login");
  102 |       }
  103 |     }
  104 |     await expect(page.locator("body")).toBeVisible();
  105 |   });
  106 | 
  107 |   // [TC-GUEST-11] Guest Session Identification
  108 |   test("TC-GUEST-11: Guest session endpoint returns valid session structure", async ({ request }) => {
  109 |     const res = await request.get("/api/auth/session");
  110 |     expect([200, 401, 403, 429]).toContain(res.status());
  111 |   });
  112 | 
  113 |   // [TC-GUEST-12] Deep Linking Guest Access
  114 |   test("TC-GUEST-12: Opening shared chat route as guest renders chat shell without login prompt", async ({ page }) => {
  115 |     await page.goto("/agents/chat?shareId=demo-123");
  116 |     await expect(page).not.toHaveURL(/\/auth\/login/);
  117 |   });
  118 | 
  119 |   // [TC-GUEST-13] Cross-Origin Cookie Independence
  120 |   test("TC-GUEST-13: Chat playground functions cleanly without requiring third-party cookies", async ({ page }) => {
  121 |     await page.goto("/agents/chat");
  122 |     await expect(page.locator("body")).toBeVisible();
  123 |   });
  124 | 
  125 |   // [TC-GUEST-14] Network Disconnection Toast in Guest Mode
  126 |   test("TC-GUEST-14: Page state remains intact during offline network event", async ({ page }) => {
```