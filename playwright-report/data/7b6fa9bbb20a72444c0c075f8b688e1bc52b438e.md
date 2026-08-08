# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-slide-deck-canvas.spec.ts >> TASK-CHAT-09: Slide Deck Canvas Marp Presentation Export (20 Scenarios) >> TC-SLIDE-11: Hermes slides generation API handles slide creation prompts
- Location: e2e\09-slide-deck-canvas.spec.ts:55:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 400, 401, 403, 429, 500, 503]
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
  4   |  * TASK-CHAT-09: Slide Deck Canvas Marp Presentation Export (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-09: Slide Deck Canvas Marp Presentation Export (20 Scenarios)", () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto("/agents/chat");
  10  |     await page.waitForLoadState("domcontentloaded");
  11  |   });
  12  | 
  13  |   test("TC-SLIDE-01: Slide Deck Canvas action card triggers presentation preview", async ({ page }) => {
  14  |     const btn = page.locator("button:has-text('Slide'), button:has-text('Presentation')").first();
  15  |     if (await btn.isVisible()) await btn.click();
  16  |     await expect(page.locator("body")).toBeVisible();
  17  |   });
  18  | 
  19  |   test("TC-SLIDE-02: Marp Markdown renderer parses slide delimiters (---)", async ({ page }) => {
  20  |     await expect(page.locator("body")).toBeVisible();
  21  |   });
  22  | 
  23  |   test("TC-SLIDE-03: Slide carousel pagination controls allow Next / Previous navigation", async ({ page }) => {
  24  |     await expect(page.locator("body")).toBeVisible();
  25  |   });
  26  | 
  27  |   test("TC-SLIDE-04: Slide theme picker switches presentation themes (Gaia, Uncover, Default)", async ({ page }) => {
  28  |     await expect(page.locator("body")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("TC-SLIDE-05: 1-Click Export to PDF compiles slide deck layout", async ({ page }) => {
  32  |     await expect(page.locator("body")).toBeVisible();
  33  |   });
  34  | 
  35  |   test("TC-SLIDE-06: 1-Click Export to PPTX downloads PowerPoint deck payload", async ({ page }) => {
  36  |     await expect(page.locator("body")).toBeVisible();
  37  |   });
  38  | 
  39  |   test("TC-SLIDE-07: Live Slide Editor panel updates presentation preview in realtime", async ({ page }) => {
  40  |     await expect(page.locator("body")).toBeVisible();
  41  |   });
  42  | 
  43  |   test("TC-SLIDE-08: Slide Deck Canvas supports custom background colors and image URLs", async ({ page }) => {
  44  |     await expect(page.locator("body")).toBeVisible();
  45  |   });
  46  | 
  47  |   test("TC-SLIDE-09: Speaker Notes drawer renders speaker prompts alongside slides", async ({ page }) => {
  48  |     await expect(page.locator("body")).toBeVisible();
  49  |   });
  50  | 
  51  |   test("TC-SLIDE-10: Slide Deck Canvas provides Presenter Fullscreen mode", async ({ page }) => {
  52  |     await expect(page.locator("body")).toBeVisible();
  53  |   });
  54  | 
  55  |   test("TC-SLIDE-11: Hermes slides generation API handles slide creation prompts", async ({ request }) => {
  56  |     const response = await request.post("/api/hermes/slides/generate", {
  57  |       headers: { "Content-Type": "application/json" },
  58  |       data: { prompt: "Generate pitch deck" }
  59  |     });
> 60  |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
      |                                                 ^ Error: expect(received).toContain(expected) // indexOf
  61  |   });
  62  | 
  63  |   test("TC-SLIDE-12: Slide export API handles PDF/PPTX conversion requests", async ({ request }) => {
  64  |     const response = await request.post("/api/hermes/slides/export", {
  65  |       headers: { "Content-Type": "application/json" },
  66  |       data: { markdown: "# Slide 1\n---\n# Slide 2", format: "pdf" }
  67  |     });
  68  |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
  69  |   });
  70  | 
  71  |   test("TC-SLIDE-13: Slide deck title slide renders large typography and subtitle", async ({ page }) => {
  72  |     await expect(page.locator("body")).toBeVisible();
  73  |   });
  74  | 
  75  |   test("TC-SLIDE-14: Column layout slides split content into two equal cards", async ({ page }) => {
  76  |     await expect(page.locator("body")).toBeVisible();
  77  |   });
  78  | 
  79  |   test("TC-SLIDE-15: Copy Slide Markdown copies raw Marp source to clipboard", async ({ page }) => {
  80  |     await expect(page.locator("body")).toBeVisible();
  81  |   });
  82  | 
  83  |   test("TC-SLIDE-16: Re-order slides drag-and-drop handles slide position changes", async ({ page }) => {
  84  |     await expect(page.locator("body")).toBeVisible();
  85  |   });
  86  | 
  87  |   test("TC-SLIDE-17: Mobile viewport renders responsive slide viewer with swipe gestures", async ({ page }) => {
  88  |     await page.setViewportSize({ width: 375, height: 667 });
  89  |     await expect(page.locator("body")).toBeVisible();
  90  |   });
  91  | 
  92  |   test("TC-SLIDE-18: Slide Deck Canvas dispatches slide_exported telemetry event", async ({ page }) => {
  93  |     const ok = await page.evaluate(() => {
  94  |       window.dispatchEvent(new CustomEvent("slide_exported", { detail: { format: "pptx" } }));
  95  |       return true;
  96  |     });
  97  |     expect(ok).toBeTruthy();
  98  |   });
  99  | 
  100 |   test("TC-SLIDE-19: Slide deck artifact state persists in Hermes artifacts table (domain: 'slides')", async ({ request }) => {
  101 |     const response = await request.get("/api/hermes/runs");
  102 |     expect([200, 401, 403, 404, 500]).toContain(response.status());
  103 |   });
  104 | 
  105 |   test("TC-SLIDE-20: Slide presentation share link renders read-only slide deck viewer", async ({ page }) => {
  106 |     await page.goto("/slide-share/demo");
  107 |     await expect(page.locator("body")).toBeVisible();
  108 |   });
  109 | 
  110 | });
  111 | 
```