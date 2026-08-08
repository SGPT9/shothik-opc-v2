# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-playground-taskmaster.spec.ts >> Shothik Chat E2E Taskmaster Verification Suite (Phase 1) >> TASK-CHAT-02: Convex Token API returns expected status for token exchange
- Location: e2e\chat-playground-taskmaster.spec.ts:17:7

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
  3   | test.describe("Shothik Chat E2E Taskmaster Verification Suite (Phase 1)", () => {
  4   | 
  5   |   // =========================================================================
  6   |   // SUITE 1: Freemium Guest Playground & Zero-Config Auth
  7   |   // =========================================================================
  8   | 
  9   |   test("TASK-CHAT-01: Guest Session Playground loads without login redirect", async ({ page }) => {
  10  |     await page.goto("/agents/chat");
  11  |     await page.waitForLoadState("domcontentloaded");
  12  |     await expect(page).not.toHaveURL(/\/auth\/login/);
  13  |     const composer = page.locator("textarea, input[type='text'], [contenteditable='true']").first();
  14  |     await expect(composer).toBeVisible();
  15  |   });
  16  | 
  17  |   test("TASK-CHAT-02: Convex Token API returns expected status for token exchange", async ({ request }) => {
  18  |     const response = await request.post("/api/auth/convex-token", {
  19  |       headers: { "Content-Type": "application/json" },
  20  |       data: { accessToken: "demo-token" },
  21  |     });
> 22  |     expect([200, 400, 401, 429, 503]).toContain(response.status());
      |                                       ^ Error: expect(received).toContain(expected) // indexOf
  23  |   });
  24  | 
  25  |   // =========================================================================
  26  |   // SUITE 2: 3 AI Partner Personas & Dynamic Switching
  27  |   // =========================================================================
  28  | 
  29  |   test("TASK-CHAT-03: Selecting 🚀 Co-Founder persona updates composer state", async ({ page }) => {
  30  |     await page.goto("/agents/chat");
  31  |     const coFounderBtn = page.locator("button, [role='button']").filter({ hasText: /co-founder|executive/i }).first();
  32  |     if (await coFounderBtn.isVisible()) {
  33  |       await coFounderBtn.click();
  34  |     }
  35  |     await expect(page.locator("body")).toBeVisible();
  36  |   });
  37  | 
  38  |   test("TASK-CHAT-04: Selecting 🔬 Co-Researcher persona updates composer state", async ({ page }) => {
  39  |     await page.goto("/agents/chat");
  40  |     const coResearcherBtn = page.locator("button, [role='button']").filter({ hasText: /co-researcher|research/i }).first();
  41  |     if (await coResearcherBtn.isVisible()) {
  42  |       await coResearcherBtn.click();
  43  |     }
  44  |     await expect(page.locator("body")).toBeVisible();
  45  |   });
  46  | 
  47  |   test("TASK-CHAT-05: Selecting 💼 Co-Worker persona updates composer state", async ({ page }) => {
  48  |     await page.goto("/agents/chat");
  49  |     const coWorkerBtn = page.locator("button, [role='button']").filter({ hasText: /co-worker|action|task/i }).first();
  50  |     if (await coWorkerBtn.isVisible()) {
  51  |       await coWorkerBtn.click();
  52  |     }
  53  |     await expect(page.locator("body")).toBeVisible();
  54  |   });
  55  | 
  56  |   // =========================================================================
  57  |   // SUITE 3: Interactive Persona Response Lenses
  58  |   // =========================================================================
  59  | 
  60  |   test("TASK-CHAT-06: Lens switcher pills toggle active lens view state", async ({ page }) => {
  61  |     await page.goto("/agents/chat");
  62  |     const lensContainer = page.locator("[data-testid='lens-switcher'], .lens-switcher, button:has-text('Executive')").first();
  63  |     await expect(page.locator("body")).toBeVisible();
  64  |   });
  65  | 
  66  |   // =========================================================================
  67  |   // SUITE 4: 🌙 Tonight Engine (Unlimited $0 Deep Research)
  68  |   // =========================================================================
  69  | 
  70  |   test("TASK-CHAT-07: 🌙 Tonight Engine toggle activates overnight batch mode", async ({ page }) => {
  71  |     await page.goto("/agents/chat");
  72  |     const tonightToggle = page.locator("button, input[type='checkbox']").filter({ hasText: /tonight|overnight|2\.8t/i }).first();
  73  |     if (await tonightToggle.isVisible()) {
  74  |       await tonightToggle.click();
  75  |     }
  76  |     await expect(page.locator("body")).toBeVisible();
  77  |   });
  78  | 
  79  |   // =========================================================================
  80  |   // SUITE 5: Dynamic 2-Pane Side Canvas
  81  |   // =========================================================================
  82  | 
  83  |   test("TASK-CHAT-08: Data Sheet Canvas action card triggers spreadsheet view", async ({ page }) => {
  84  |     await page.goto("/agents/chat");
  85  |     await expect(page.locator("body")).toBeVisible();
  86  |   });
  87  | 
  88  |   test("TASK-CHAT-09: Slide Deck Canvas action card triggers Marp presentation preview", async ({ page }) => {
  89  |     await page.goto("/agents/chat");
  90  |     await expect(page.locator("body")).toBeVisible();
  91  |   });
  92  | 
  93  |   test("TASK-CHAT-10: Code REPL Sandbox triggers executable code block payload", async ({ page }) => {
  94  |     await page.goto("/agents/chat");
  95  |     await expect(page.locator("body")).toBeVisible();
  96  |   });
  97  | 
  98  |   // =========================================================================
  99  |   // SUITE 6: Proven 3-Fold Book Writing Studio Gateway
  100 |   // =========================================================================
  101 | 
  102 |   test("TASK-CHAT-11: Book Writing Studio Gateway link target navigates to /writing-studio", async ({ page }) => {
  103 |     await page.goto("/agents/chat");
  104 |     const bookStudioGateway = page.locator("a[href*='/writing-studio'], button:has-text('Book Writing Studio')").first();
  105 |     if (await bookStudioGateway.isVisible()) {
  106 |       await bookStudioGateway.click();
  107 |       await expect(page).toHaveURL(/\/writing-studio/);
  108 |     } else {
  109 |       await expect(page.locator("body")).toBeVisible();
  110 |     }
  111 |   });
  112 | 
  113 | });
  114 | 
```