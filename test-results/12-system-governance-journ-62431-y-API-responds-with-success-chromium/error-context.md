# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-system-governance-journey.spec.ts >> TASK-GOVERNANCE-01: End-to-End System Governance & Migration Safety Journey >> TC-GOV-02: Pending database migration safety API responds with success
- Location: e2e\12-system-governance-journey.spec.ts:13:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * TASK-GOVERNANCE-01: End-to-End System Governance & Migration Safety Journey
  5  |  */
  6  | test.describe("TASK-GOVERNANCE-01: End-to-End System Governance & Migration Safety Journey", () => {
  7  |   test("TC-GOV-01: Admin governance page renders title and policy controls", async ({ page }) => {
  8  |     await page.goto("/admin/governance");
  9  |     await expect(page.locator("body")).toBeVisible();
  10 |     await expect(page.locator("h1")).toContainText("System Governance");
  11 |   });
  12 | 
  13 |   test("TC-GOV-02: Pending database migration safety API responds with success", async ({ request }) => {
  14 |     const response = await request.get("/api/vibe/migrations/approve");
> 15 |     expect(response.ok()).toBeTruthy();
     |                           ^ Error: expect(received).toBeTruthy()
  16 |     const body = await response.json();
  17 |     expect(body.success).toBe(true);
  18 |     expect(Array.isArray(body.data)).toBe(true);
  19 |   });
  20 | 
  21 |   test("TC-GOV-03: GitHub auto-sync webhook endpoint processes repository update payload", async ({ request }) => {
  22 |     const response = await request.post("/api/webhooks/github", {
  23 |       headers: { "Content-Type": "application/json" },
  24 |       data: {
  25 |         ref: "refs/heads/main",
  26 |         repository: { full_name: "shothik/shothik-web" },
  27 |         commits: [{ id: "abc1234", message: "feat: updated core models" }],
  28 |       },
  29 |     });
  30 | 
  31 |     expect(response.ok()).toBeTruthy();
  32 |     const body = await response.json();
  33 |     expect(body.success).toBe(true);
  34 |     expect(body.reindexed).toBe(true);
  35 |   });
  36 | 
  37 |   test("TC-GOV-04: Migration approval endpoint handles approval payload", async ({ request }) => {
  38 |     const response = await request.post("/api/vibe/migrations/approve", {
  39 |       headers: { "Content-Type": "application/json" },
  40 |       data: {
  41 |         migrationId: "non_existent_id",
  42 |         approvedBy: "playwright_e2e_runner",
  43 |       },
  44 |     });
  45 | 
  46 |     // Should return 404 for non-existent migration, showing proper API handling
  47 |     expect(response.status()).toBe(404);
  48 |   });
  49 | });
  50 | 
```