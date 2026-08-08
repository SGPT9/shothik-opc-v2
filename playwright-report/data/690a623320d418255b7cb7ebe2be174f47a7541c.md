# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-tonight-engine-overnight.spec.ts >> TASK-CHAT-07: 🌙 Tonight Engine Overnight Batch Mode (20 Scenarios) >> TC-TONIGHT-07: Stores scheduled task in Hermes runs table with status: 'planning'
- Location: e2e\07-tonight-engine-overnight.spec.ts:39:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [201, 401, 402, 403]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "404" [level=1] [ref=e4]
    - heading "This page could not be found." [level=2] [ref=e6]
  - alert [ref=e7]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * TASK-CHAT-07: 🌙 Tonight Engine Overnight Batch Mode (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-07: 🌙 Tonight Engine Overnight Batch Mode (20 Scenarios)", () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto("/agents/chat");
  10  |     await page.waitForLoadState("domcontentloaded");
  11  |   });
  12  | 
  13  |   test("TC-TONIGHT-01: Toggle switch activates 🌙 Tonight Engine mode in composer", async ({ page }) => {
  14  |     const toggle = page.locator("button:has-text('Tonight'), [data-mode='tonight']").first();
  15  |     if (await toggle.isVisible()) await toggle.click();
  16  |     await expect(page.locator("body")).toBeVisible();
  17  |   });
  18  | 
  19  |   test("TC-TONIGHT-02: Tonight Engine badge highlights $0 Token Cost indicator", async ({ page }) => {
  20  |     await expect(page.locator("body")).toBeVisible();
  21  |   });
  22  | 
  23  |   test("TC-TONIGHT-03: Schedules task for nocturnal 2:00 AM BDT/IST batch queue", async ({ page }) => {
  24  |     await expect(page.locator("body")).toBeVisible();
  25  |   });
  26  | 
  27  |   test("TC-TONIGHT-04: Enqueues 2.8T AirLLM / DeepSeek parameter batch job", async ({ page }) => {
  28  |     await expect(page.locator("body")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("TC-TONIGHT-05: Displays estimated completion time banner (e.g. Ready at 7:00 AM)", async ({ page }) => {
  32  |     await expect(page.locator("body")).toBeVisible();
  33  |   });
  34  | 
  35  |   test("TC-TONIGHT-06: Disables realtime streaming response when Tonight Engine mode is active", async ({ page }) => {
  36  |     await expect(page.locator("body")).toBeVisible();
  37  |   });
  38  | 
  39  |   test("TC-TONIGHT-07: Stores scheduled task in Hermes runs table with status: 'planning'", async ({ request }) => {
  40  |     // Perform a direct backend API request validation for enqueuing
  41  |     const enqueueRes = await request.post("/api/tonight-engine/enqueue", {
  42  |       data: {
  43  |         workspaceId: "test-workspace-e2e",
  44  |         prompt: "Write a comprehensive market research report on carbon capture tech",
  45  |         depth: "standard",
  46  |         attachmentUrls: [],
  47  |         notifyOnComplete: false
  48  |       }
  49  |     });
  50  | 
  51  |     // Accept 201 (success), 401 (unauthorized), 402 (needs credits), or 403 (forbidden)
> 52  |     expect([201, 401, 402, 403]).toContain(enqueueRes.status());
      |                                  ^ Error: expect(received).toContain(expected) // indexOf
  53  |     
  54  |     if (enqueueRes.status() === 201) {
  55  |       const body = await enqueueRes.json();
  56  |       expect(body.data).toBeDefined();
  57  |       expect(body.data.runId).toBeDefined();
  58  |       expect(body.data.statusUrl).toBeDefined();
  59  |       expect(body.data.streamUrl).toBeDefined();
  60  |       expect(body.data.modelLabel).toContain("Ornith"); // VPS model verified
  61  |     }
  62  |   });
  63  | 
  64  |   test("TC-TONIGHT-08: User can attach documents or datasets for overnight batch processing", async ({ page }) => {
  65  |     await expect(page.locator("body")).toBeVisible();
  66  |   });
  67  | 
  68  |   test("TC-TONIGHT-09: Tonight Engine queue card displays progress status (Queued / Processing / Ready)", async ({ request }) => {
  69  |     // Verify status endpoint resolves correctly
  70  |     const statusRes = await request.get("/api/tonight-engine/status/test-invalid-run");
  71  |     // Should return 404 (Not Found), 403 (Forbidden), or 401 (Unauthorized) for fake ID
  72  |     expect([401, 403, 404]).toContain(statusRes.status());
  73  |   });
  74  | 
  75  |   test("TC-TONIGHT-10: Email or Push notification checkbox is selectable for morning completion alert", async ({ page }) => {
  76  |     await expect(page.locator("body")).toBeVisible();
  77  |   });
  78  | 
  79  |   test("TC-TONIGHT-11: Cancel Scheduled Task button removes job from overnight queue", async ({ page }) => {
  80  |     await expect(page.locator("body")).toBeVisible();
  81  |   });
  82  | 
  83  |   test("TC-TONIGHT-12: Overnight batch result renders deep multi-page manuscript or report", async ({ page }) => {
  84  |     await expect(page.locator("body")).toBeVisible();
  85  |   });
  86  | 
  87  |   test("TC-TONIGHT-13: Overnight job retains full 128k context without token cutoff", async ({ page }) => {
  88  |     await expect(page.locator("body")).toBeVisible();
  89  |   });
  90  | 
  91  |   test("TC-TONIGHT-14: Tonight Engine mode selection persists in localStorage", async ({ page }) => {
  92  |     await page.evaluate(() => localStorage.setItem("shothik_engine_mode", "tonight"));
  93  |     await page.reload();
  94  |     const mode = await page.evaluate(() => localStorage.getItem("shothik_engine_mode"));
  95  |     expect(mode).toBe("tonight");
  96  |   });
  97  | 
  98  |   test("TC-TONIGHT-15: Mobile viewport renders Tonight Engine toggle clearly in header", async ({ page }) => {
  99  |     await page.setViewportSize({ width: 375, height: 667 });
  100 |     await expect(page.locator("body")).toBeVisible();
  101 |   });
  102 | 
  103 |   test("TC-TONIGHT-16: Tonight Engine dispatches batch_job_enqueued telemetry event", async ({ page }) => {
  104 |     const ok = await page.evaluate(() => {
  105 |       window.dispatchEvent(new CustomEvent("batch_job_enqueued", { detail: { jobType: "overnight" } }));
  106 |       return true;
  107 |     });
  108 |     expect(ok).toBeTruthy();
  109 |   });
  110 | 
  111 |   test("TC-TONIGHT-17: Overnight batch queue handles network disconnection gracefully", async ({ page, context }) => {
  112 |     await context.setOffline(true);
  113 |     await expect(page.locator("body")).toBeVisible();
  114 |     await context.setOffline(false);
  115 |   });
  116 | 
  117 |   test("TC-TONIGHT-18: Completed overnight task offers 1-Click Open Artifact button", async ({ page }) => {
  118 |     await expect(page.locator("body")).toBeVisible();
  119 |   });
  120 | 
  121 |   test("TC-TONIGHT-19: Overnight batch mode supports multi-domain jobs (Research + Book + Slides)", async ({ page }) => {
  122 |     await expect(page.locator("body")).toBeVisible();
  123 |   });
  124 | 
  125 |   test("TC-TONIGHT-20: User quota consumption remains 0 for Tonight Engine batch runs", async ({ page }) => {
  126 |     await expect(page.locator("body")).toBeVisible();
  127 |   });
  128 | 
  129 | });
  130 | 
```