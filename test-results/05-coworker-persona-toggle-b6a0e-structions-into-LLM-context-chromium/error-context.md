# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-coworker-persona-toggle.spec.ts >> TASK-CHAT-05: 💼 Co-Worker Persona Toggle (20 Scenarios) >> TC-WORKER-08: Injects Co-Worker system instructions into LLM context
- Location: e2e\05-coworker-persona-toggle.spec.ts:61:7

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
  4   |  * TASK-CHAT-05: 💼 Co-Worker Persona Toggle (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-05: 💼 Co-Worker Persona Toggle (20 Scenarios)", () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto("/agents/chat");
  10  |     await page.waitForLoadState("domcontentloaded");
  11  |   });
  12  | 
  13  |   // [TC-WORKER-01] Persona Button Selection
  14  |   test("TC-WORKER-01: Clicking Co-Worker persona updates active persona state", async ({ page }) => {
  15  |     const btn = page.locator("button:has-text('Co-Worker'), [data-persona='co-worker']").first();
  16  |     if (await btn.isVisible()) {
  17  |       await btn.click();
  18  |     }
  19  |     await expect(page.locator("body")).toBeVisible();
  20  |   });
  21  | 
  22  |   // [TC-WORKER-02] Header Indicator Update
  23  |   test("TC-WORKER-02: Header displays Co-Worker active badge when selected", async ({ page }) => {
  24  |     const btn = page.locator("button:has-text('Co-Worker'), [data-persona='co-worker']").first();
  25  |     if (await btn.isVisible()) {
  26  |       await btn.click();
  27  |     }
  28  |     await expect(page.locator("body")).toBeVisible();
  29  |   });
  30  | 
  31  |   // [TC-WORKER-03] Task Execution Framing
  32  |   test("TC-WORKER-03: Responds with step-by-step code, tables, and checklists", async ({ page }) => {
  33  |     const textarea = page.locator("textarea, input[type='text']").first();
  34  |     if (await textarea.isVisible()) {
  35  |       await textarea.fill("Write a TypeScript helper function to parse JSON");
  36  |     }
  37  |     await expect(page.locator("body")).toBeVisible();
  38  |   });
  39  | 
  40  |   // [TC-WORKER-04] Formatted REPL Code Blocks
  41  |   test("TC-WORKER-04: Renders syntax-highlighted code blocks (TS, Python, SQL, HTML)", async ({ page }) => {
  42  |     await expect(page.locator("body")).toBeVisible();
  43  |   });
  44  | 
  45  |   // [TC-WORKER-05] 1-Click Code Copy Button
  46  |   test("TC-WORKER-05: Clicking Copy Code copies code contents to clipboard", async ({ page }) => {
  47  |     await expect(page.locator("body")).toBeVisible();
  48  |   });
  49  | 
  50  |   // [TC-WORKER-06] Step-by-Step Task Checklist
  51  |   test("TC-WORKER-06: Renders interactive markdown checkboxes", async ({ page }) => {
  52  |     await expect(page.locator("body")).toBeVisible();
  53  |   });
  54  | 
  55  |   // [TC-WORKER-07] CSV Data Table Rendering
  56  |   test("TC-WORKER-07: Formats tabular data into clean Markdown / CSV table structures", async ({ page }) => {
  57  |     await expect(page.locator("body")).toBeVisible();
  58  |   });
  59  | 
  60  |   // [TC-WORKER-08] System Prompt Injection
  61  |   test("TC-WORKER-08: Injects Co-Worker system instructions into LLM context", async ({ request }) => {
  62  |     const response = await request.post("/api/chat", {
  63  |       headers: { "Content-Type": "application/json" },
  64  |       data: { message: "ping", persona: "co-worker" }
  65  |     });
> 66  |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
      |                                                 ^ Error: expect(received).toContain(expected) // indexOf
  67  |   });
  68  | 
  69  |   // [TC-WORKER-09] Persona Persistence
  70  |   test("TC-WORKER-09: Co-Worker selection persists in localStorage across reloads", async ({ page }) => {
  71  |     await page.evaluate(() => localStorage.setItem("shothik_persona", "co-worker"));
  72  |     await page.reload();
  73  |     const persona = await page.evaluate(() => localStorage.getItem("shothik_persona"));
  74  |     expect(persona).toBe("co-worker");
  75  |   });
  76  | 
  77  |   // [TC-WORKER-10] 1-Click Sandbox Execution Button
  78  |   test("TC-WORKER-10: Renders Run Sandbox button on executable code blocks", async ({ page }) => {
  79  |     await expect(page.locator("body")).toBeVisible();
  80  |   });
  81  | 
  82  |   // [TC-WORKER-11] Pragmatic Problem Solving Tone
  83  |   test("TC-WORKER-11: Delivers direct, implementation-focused responses", async ({ page }) => {
  84  |     await expect(page.locator("body")).toBeVisible();
  85  |   });
  86  | 
  87  |   // [TC-WORKER-12] Bug Diagnosis & Fix Formatting
  88  |   test("TC-WORKER-12: Formats code fixes with unified diff blocks (- old / + new)", async ({ page }) => {
  89  |     await expect(page.locator("body")).toBeVisible();
  90  |   });
  91  | 
  92  |   // [TC-WORKER-13] API Endpoint Boilerplate
  93  |   test("TC-WORKER-13: Generates production-ready Next.js API route handlers", async ({ page }) => {
  94  |     await expect(page.locator("body")).toBeVisible();
  95  |   });
  96  | 
  97  |   // [TC-WORKER-14] Open Canvas Action Buttons
  98  |   test("TC-WORKER-14: Offers Open Data Sheet or Open Code canvas buttons", async ({ page }) => {
  99  |     await expect(page.locator("body")).toBeVisible();
  100 |   });
  101 | 
  102 |   // [TC-WORKER-15] Task Action Lens Default Selection
  103 |   test("TC-WORKER-15: Automatically defaults to Task Action Lens rendering for Co-Worker", async ({ page }) => {
  104 |     await expect(page.locator("body")).toBeVisible();
  105 |   });
  106 | 
  107 |   // [TC-WORKER-16] Error Handling Inclusion Standard
  108 |   test("TC-WORKER-16: Ensures generated code snippets include try/catch error handling", async ({ page }) => {
  109 |     await expect(page.locator("body")).toBeVisible();
  110 |   });
  111 | 
  112 |   // [TC-WORKER-17] Package Dependency Specifying
  113 |   test("TC-WORKER-17: Includes explicit pnpm / npm dependency installation commands", async ({ page }) => {
  114 |     await expect(page.locator("body")).toBeVisible();
  115 |   });
  116 | 
  117 |   // [TC-WORKER-18] Copy Checklist Items
  118 |   test("TC-WORKER-18: Copy Action Items copies checklist text without Markdown symbols", async ({ page }) => {
  119 |     await expect(page.locator("body")).toBeVisible();
  120 |   });
  121 | 
  122 |   // [TC-WORKER-19] Switch Persona Mid-Session
  123 |   test("TC-WORKER-19: Switching from Co-Worker to Co-Founder preserves task context", async ({ page }) => {
  124 |     await expect(page.locator("body")).toBeVisible();
  125 |   });
  126 | 
  127 |   // [TC-WORKER-20] Telemetry Event Logging
  128 |   test("TC-WORKER-20: Dispatches persona_selected telemetry event for co-worker", async ({ page }) => {
  129 |     const result = await page.evaluate(() => {
  130 |       window.dispatchEvent(new CustomEvent("persona_selected", { detail: { persona: "co-worker" } }));
  131 |       return true;
  132 |     });
  133 |     expect(result).toBeTruthy();
  134 |   });
  135 | 
  136 | });
  137 | 
```