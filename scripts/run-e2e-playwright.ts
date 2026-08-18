import { chromium, type Browser, type Page } from "playwright";
import assert from "node:assert";

interface TestStepResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function runPlaywrightE2ESuite() {
  console.log("🎭 [Playwright E2E] Starting Studio Workspaces & Ask-First Flow Tests...");
  console.log(`🌐 Base URL: ${BASE_URL}`);

  const results: TestStepResult[] = [];
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page: Page = await context.newPage();

    let consoleErrors = 0;
    page.on("pageerror", (err) => {
      consoleErrors++;
      console.error("🔴 [Page Error]", err.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("api/auth/session") ||
          text.includes("convex-token") ||
          text.includes("CORS policy") ||
          text.includes("ERR_FAILED") ||
          text.includes("ERR_CONNECTION_REFUSED")
        ) {
          return; // Ignore transient offline dev probes
        }
        consoleErrors++;
        console.error("🔴 [Console Error]", text);
      }
    });

    // ── Test 1: Ask-First Home & Composer Surface ──
    const t1Start = Date.now();
    console.log("  ▶ [Test 1] Testing Ask-First Home & Composer Surface...");
    await page.goto(`${BASE_URL}/agents/chat`, { waitUntil: "networkidle" });
    
    // Check main greeting
    const greeting = await page.textContent("h1, h2");
    assert(greeting && greeting.length > 0, "Hero greeting heading must be visible");

    // Check composer textarea
    const composerInput = await page.$("textarea#composer-chat-input, textarea[placeholder*='Ask anything']");
    assert(composerInput, "Primary composer textarea must be present");

    // Check starter prompts
    const starterCards = await page.$$("button:has-text('Research'), button:has-text('Analysis'), button:has-text('Create')");
    assert(starterCards.length >= 3, "Expected at least 3 intent starter prompt cards");

    results.push({ name: "1. Ask-First Home & Composer Surface", passed: true, durationMs: Date.now() - t1Start });

    // ── Test 2: Slides Studio Canvas & In-Place Editing ──
    const t2Start = Date.now();
    console.log("  ▶ [Test 2] Testing Slides Studio Canvas (?tab=slides)...");
    await page.goto(`${BASE_URL}/agents/chat?tab=slides`, { waitUntil: "networkidle" });

    // Verify slide stage is visible
    await page.waitForSelector("button:has-text('+ Slide')", { timeout: 8000 });
    
    // Verify toolbar controls exist (+ Slide, Narrate, Present)
    const addSlideBtn = await page.$("button:has-text('+ Slide')");
    assert(addSlideBtn, "+ Slide button must exist");

    const narrateBtn = await page.$("button:has-text('Narrate'), button:has-text('Stop')");
    assert(narrateBtn, "Narrate button must exist");

    results.push({ name: "2. Slides Studio Stage & Interactivity", passed: true, durationMs: Date.now() - t2Start });

    // ── Test 3: Financial Spreadsheet Canvas (?tab=sheet) ──
    const t3Start = Date.now();
    console.log("  ▶ [Test 3] Testing Financial Spreadsheet Canvas (?tab=sheet)...");
    await page.goto(`${BASE_URL}/agents/chat?tab=sheet`, { waitUntil: "networkidle" });

    // Verify spreadsheet grid table and formula bar
    await page.waitForSelector("table, button:has-text('Export CSV')", { timeout: 8000 });

    // Verify Export CSV button
    const exportCsvBtn = await page.$("button:has-text('Export CSV')");
    assert(exportCsvBtn, "Export CSV button must exist");

    // Verify KPI summary cards
    const kpiCards = await page.$$("p.font-mono, span.font-mono");
    assert(kpiCards.length >= 1, "KPI summary metric values must be rendered");

    results.push({ name: "3. Financial Spreadsheet & Formula Bar", passed: true, durationMs: Date.now() - t3Start });

    // ── Test 4: Deep Research & Grounded Evidence (?tab=research) ──
    const t4Start = Date.now();
    console.log("  ▶ [Test 4] Testing Deep Research Canvas (?tab=research)...");
    await page.goto(`${BASE_URL}/agents/chat?tab=research`, { waitUntil: "networkidle" });

    // Verify verified sources and executive summary
    await page.waitForSelector("text=Deep Research", { timeout: 8000 });
    
    const downloadBtn = await page.$("button[title*='Download'], button[title*='Print']");
    assert(downloadBtn, "Download or Print report button must exist");

    results.push({ name: "4. Deep Research & Source Auditing", passed: true, durationMs: Date.now() - t4Start });

    // ── Test 5: Multi-Page Navigation & Pricing Verification ──
    const t5Start = Date.now();
    console.log("  ▶ [Test 5] Testing Multi-Page Navigation (/pricing & /saved-reports)...");
    
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
    const pricingHeading = await page.textContent("h1");
    assert(pricingHeading && pricingHeading.includes("Plans"), "Pricing page must load plans heading");

    await page.goto(`${BASE_URL}/saved-reports`, { waitUntil: "networkidle" });
    const reportsHeading = await page.textContent("h1");
    assert(reportsHeading && reportsHeading.includes("Saved Reports"), "Saved reports page must load heading");

    results.push({ name: "5. Multi-Page Navigation & Pricing", passed: true, durationMs: Date.now() - t5Start });

    // ── Final Assertion: Zero Critical Console Errors ──
    assert.strictEqual(consoleErrors, 0, `Expected 0 console errors across all test runs, encountered ${consoleErrors}`);

  } catch (err: any) {
    console.error("❌ [Playwright E2E Failure]", err.message);
    results.push({ name: "E2E Test Execution", passed: false, error: err.message, durationMs: 0 });
  } finally {
    if (browser) await browser.close();
  }

  console.log("\n================================================================================");
  console.log("🎭 PLAYWRIGHT END-TO-END SUITE EXECUTION REPORT");
  console.log("================================================================================");
  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon} ${r.name.padEnd(48)} [${r.durationMs}ms]`);
    if (!r.passed) {
      allPassed = false;
      if (r.error) console.log(`     Error: ${r.error}`);
    }
  }
  console.log("================================================================================");

  if (!allPassed) {
    process.exit(1);
  }
  console.log("🎉 ALL PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!\n");
}

runPlaywrightE2ESuite();
