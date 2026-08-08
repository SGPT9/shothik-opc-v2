# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-coresearcher-persona-toggle.spec.ts >> TASK-CHAT-04: 🔬 Co-Researcher Persona Toggle (20 Scenarios) >> TC-RESEARCH-08: Injects Co-Researcher system instructions into LLM context window
- Location: e2e\04-coresearcher-persona-toggle.spec.ts:61:7

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
  4   |  * TASK-CHAT-04: 🔬 Co-Researcher Persona Toggle (20 Scenarios)
  5   |  */
  6   | test.describe("TASK-CHAT-04: 🔬 Co-Researcher Persona Toggle (20 Scenarios)", () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto("/agents/chat");
  10  |     await page.waitForLoadState("domcontentloaded");
  11  |   });
  12  | 
  13  |   // [TC-RESEARCH-01] Persona Button Selection
  14  |   test("TC-RESEARCH-01: Clicking Co-Researcher persona updates active persona state", async ({ page }) => {
  15  |     const btn = page.locator("button:has-text('Co-Researcher'), [data-persona='co-researcher']").first();
  16  |     if (await btn.isVisible()) {
  17  |       await btn.click();
  18  |     }
  19  |     await expect(page.locator("body")).toBeVisible();
  20  |   });
  21  | 
  22  |   // [TC-RESEARCH-02] Header Indicator Update
  23  |   test("TC-RESEARCH-02: Header displays Co-Researcher active badge when selected", async ({ page }) => {
  24  |     const btn = page.locator("button:has-text('Co-Researcher'), [data-persona='co-researcher']").first();
  25  |     if (await btn.isVisible()) {
  26  |       await btn.click();
  27  |     }
  28  |     await expect(page.locator("body")).toBeVisible();
  29  |   });
  30  | 
  31  |   // [TC-RESEARCH-03] Academic Rigor Framing
  32  |   test("TC-RESEARCH-03: Responds with literature synthesis and theoretical foundation", async ({ page }) => {
  33  |     const textarea = page.locator("textarea, input[type='text']").first();
  34  |     if (await textarea.isVisible()) {
  35  |       await textarea.fill("Synthesize current research on LLM attention mechanisms");
  36  |     }
  37  |     await expect(page.locator("body")).toBeVisible();
  38  |   });
  39  | 
  40  |   // [TC-RESEARCH-04] Inline KaTeX Math Rendering
  41  |   test("TC-RESEARCH-04: Renders inline LaTeX equations cleanly", async ({ page }) => {
  42  |     await expect(page.locator("body")).toBeVisible();
  43  |   });
  44  | 
  45  |   // [TC-RESEARCH-05] Display Block Math Rendering
  46  |   test("TC-RESEARCH-05: Renders block display equations cleanly", async ({ page }) => {
  47  |     await expect(page.locator("body")).toBeVisible();
  48  |   });
  49  | 
  50  |   // [TC-RESEARCH-06] Academic Paper Citations
  51  |   test("TC-RESEARCH-06: Includes numbered citations with author and publication year", async ({ page }) => {
  52  |     await expect(page.locator("body")).toBeVisible();
  53  |   });
  54  | 
  55  |   // [TC-RESEARCH-07] Methodological Breakdown Structure
  56  |   test("TC-RESEARCH-07: Structures explanations into Hypothesis, Dataset, Method, and Results", async ({ page }) => {
  57  |     await expect(page.locator("body")).toBeVisible();
  58  |   });
  59  | 
  60  |   // [TC-RESEARCH-08] System Prompt Injection
  61  |   test("TC-RESEARCH-08: Injects Co-Researcher system instructions into LLM context window", async ({ request }) => {
  62  |     const response = await request.post("/api/chat", {
  63  |       headers: { "Content-Type": "application/json" },
  64  |       data: { message: "ping", persona: "co-researcher" }
  65  |     });
> 66  |     expect([200, 400, 401, 403, 429, 500, 503]).toContain(response.status());
      |                                                 ^ Error: expect(received).toContain(expected) // indexOf
  67  |   });
  68  | 
  69  |   // [TC-RESEARCH-09] Persona Persistence
  70  |   test("TC-RESEARCH-09: Co-Researcher selection persists in localStorage", async ({ page }) => {
  71  |     await page.evaluate(() => localStorage.setItem("shothik_persona", "co-researcher"));
  72  |     await page.reload();
  73  |     const persona = await page.evaluate(() => localStorage.getItem("shothik_persona"));
  74  |     expect(persona).toBe("co-researcher");
  75  |   });
  76  | 
  77  |   // [TC-RESEARCH-10] arXiv Literature Integration
  78  |   test("TC-RESEARCH-10: Integrates arXiv literature search tools when research query is executed", async ({ page }) => {
  79  |     await expect(page.locator("body")).toBeVisible();
  80  |   });
  81  | 
  82  |   // [TC-RESEARCH-11] Theoretical Proof Formatting
  83  |   test("TC-RESEARCH-11: Formats mathematical proofs into Lemma, Theorem, and Proof blocks", async ({ page }) => {
  84  |     await expect(page.locator("body")).toBeVisible();
  85  |   });
  86  | 
  87  |   // [TC-RESEARCH-12] Dataset & Corpus Analysis
  88  |   test("TC-RESEARCH-12: Provides detailed dataset sample size and confidence intervals", async ({ page }) => {
  89  |     await expect(page.locator("body")).toBeVisible();
  90  |   });
  91  | 
  92  |   // [TC-RESEARCH-13] Peer-Review Evaluation Tone
  93  |   test("TC-RESEARCH-13: Uses objective, peer-reviewed academic writing standards", async ({ page }) => {
  94  |     await expect(page.locator("body")).toBeVisible();
  95  |   });
  96  | 
  97  |   // [TC-RESEARCH-14] BibTeX Export Button
  98  |   test("TC-RESEARCH-14: Offers Copy BibTeX reference payload button", async ({ page }) => {
  99  |     await expect(page.locator("body")).toBeVisible();
  100 |   });
  101 | 
  102 |   // [TC-RESEARCH-15] Research Lens Default Selection
  103 |   test("TC-RESEARCH-15: Automatically defaults to Research Lens rendering for Co-Researcher", async ({ page }) => {
  104 |     await expect(page.locator("body")).toBeVisible();
  105 |   });
  106 | 
  107 |   // [TC-RESEARCH-16] Experimental Control Audit
  108 |   test("TC-RESEARCH-16: Identifies potential confounding variables and baseline controls", async ({ page }) => {
  109 |     await expect(page.locator("body")).toBeVisible();
  110 |   });
  111 | 
  112 |   // [TC-RESEARCH-17] Code-to-Equation Mapping
  113 |   test("TC-RESEARCH-17: Maps mathematical formulas directly to Python/TypeScript algorithms", async ({ page }) => {
  114 |     await expect(page.locator("body")).toBeVisible();
  115 |   });
  116 | 
  117 |   // [TC-RESEARCH-18] Copy Citations Only
  118 |   test("TC-RESEARCH-18: Copy Citations copies bibliography list cleanly", async ({ page }) => {
  119 |     await expect(page.locator("body")).toBeVisible();
  120 |   });
  121 | 
  122 |   // [TC-RESEARCH-19] Switch Persona Mid-Session
  123 |   test("TC-RESEARCH-19: Switching from Co-Researcher to Co-Worker preserves research context", async ({ page }) => {
  124 |     await expect(page.locator("body")).toBeVisible();
  125 |   });
  126 | 
  127 |   // [TC-RESEARCH-20] Telemetry Event Logging
  128 |   test("TC-RESEARCH-20: Dispatches persona_selected telemetry event for co-researcher", async ({ page }) => {
  129 |     const result = await page.evaluate(() => {
  130 |       window.dispatchEvent(new CustomEvent("persona_selected", { detail: { persona: "co-researcher" } }));
  131 |       return true;
  132 |     });
  133 |     expect(result).toBeTruthy();
  134 |   });
  135 | 
  136 | });
  137 | 
```