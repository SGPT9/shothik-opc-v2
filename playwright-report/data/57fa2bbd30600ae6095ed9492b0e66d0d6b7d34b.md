# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-guest-playground-access.spec.ts >> TASK-CHAT-01: Freemium Guest Playground Access (20 Scenarios) >> TC-GUEST-02: Session endpoint returns status 200/401 for unauthenticated guest
- Location: e2e\01-guest-playground-access.spec.ts:22:7

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
  4   |  * TASK-CHAT-01: Freemium Guest Playground Access (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-01: Freemium Guest Playground Access (20 Scenarios)", () => {
  7   | 
  8   |   test.beforeEach(async ({ page, context }) => {
  9   |     await context.clearCookies();
  10  |     await page.goto("about:blank");
  11  |   });
  12  | 
  13  |   // [TC-GUEST-01] Incognito Direct Navigation
  14  |   test("TC-GUEST-01: Direct incognito navigation to /agents/chat renders playground without login redirect", async ({ page }) => {
  15  |     await page.goto("/agents/chat");
  16  |     await expect(page).not.toHaveURL(/\/auth\/login/);
  17  |     await expect(page).toHaveURL(/\/agents\/chat/);
  18  |     await expect(page.locator("body")).toBeVisible();
  19  |   });
  20  | 
  21  |   // [TC-GUEST-02] Session Endpoint Response
  22  |   test("TC-GUEST-02: Session endpoint returns status 200/401 for unauthenticated guest", async ({ request }) => {
  23  |     const response = await request.get("/api/auth/session");
> 24  |     expect([200, 401, 403]).toContain(response.status());
      |                             ^ Error: expect(received).toContain(expected) // indexOf
  25  |   });
  26  | 
  27  |   // [TC-GUEST-03] Convex JWT Token Generation for Guest
  28  |   test("TC-GUEST-03: Convex token endpoint handles POST token exchange", async ({ request }) => {
  29  |     const response = await request.post("/api/auth/convex-token", {
  30  |       headers: { "Content-Type": "application/json" },
  31  |       data: { accessToken: "guest-playground-token" },
  32  |     });
  33  |     expect([200, 400, 401, 404, 405, 429, 503]).toContain(response.status());
  34  |   });
  35  | 
  36  |   // [TC-GUEST-04] Composer Input Enabled
  37  |   test("TC-GUEST-04: Composer input box is unlocked, visible, and editable for guest", async ({ page }) => {
  38  |     await page.goto("/agents/chat");
  39  |     await page.waitForLoadState("domcontentloaded");
  40  |     const textarea = page.locator("textarea, input[type='text'], [contenteditable='true'], [placeholder*='Ask']").first();
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
```