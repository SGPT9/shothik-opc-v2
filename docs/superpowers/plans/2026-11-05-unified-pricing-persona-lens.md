# Unified Pricing, 4-Persona Lens & Backend Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify Shothik's fragmented pricing schemas, backend credit/subscription ledgers, and frontend `/pricing`, `/account/billing`, and Writing Studio HUD into the "One Universal Wallet + 4 Persona Lenses + 1-Tap Outcome Passes" architecture.

**Architecture:** We consolidate backend tier limits, public packages (4 packages + monthly/yearly plans), outcome micro-passes (5 passes), and MFS/Stripe checkout routes inside `artifacts/api-server/src/routes/subscriptions.ts` and `mfs.ts` with atomic persistence to `userCreditsTable` and `userSubscriptionsTable`. On the frontend (`artifacts/shothik`), we synchronize `subscription-tiers.ts`, upgrade `pricing/page.tsx` with the 4-Persona Lens switcher and Outcome Pass showcase, wire `UpgradeModal.tsx` and `BillingPage.tsx` to live backend routes, and embed a live Credit & Tier HUD pill into `PolishedWriteView.tsx`.

**Tech Stack:** TypeScript, Express, Drizzle ORM (`@workspace/db`), React 18, TanStack Query, Wouter, Tailwind CSS, Vitest.

**Spec:** `C:\Users\USER\hermes\shothik-web-mirror-v2\docs\superpowers\specs\2026-11-05-unified-pricing-persona-lens-design.md`

## Global Constraints

- Maintain 100% pass rate across all 210 existing Vitest test suites in `artifacts/api-server`.
- Preserve backward-compatible keys in `TIER_CREDIT_MAP` (`micro_100_bdt`, `student_350_bdt`, `pro_750_bdt`, `merchant_1500_bdt`), `OUTCOME_PASSES` (`THESIS_PLAGIARISM_PASS`, `PROJECT_VENTURE_PASS`, `F_COMMERCE_MONTHLY_PASS`), and `PUBLIC_PACKAGES` (`starter-pass` token `50`, `pro-operator` token `550`, `venture-twin` token `1500`, `agency-scale` token `5000`).
- Zero database schema migrations required; use existing Drizzle tables (`userSubscriptionsTable`, `userCreditsTable`, `toolUsageTable`, `mfsTransactionsTable`).
- Zero TypeScript errors (`pnpm run typecheck` across `@workspace/api-server` and `@workspace/shothik` with `noImplicitReturns`).
- Always use `graphify query "<question>"` before searching unlocated files and run `graphify update .` after modifying code.

## Review Focus

1. **Unmapped Tier Alias Downgrade**: Checking tool quota via `POST /v1/subscriptions/check-limit` when `userSubscriptionsTable.tier` is `"student"`, `"researcher"`, `"starter-pass"`, `"pro-operator"`, `"venture-twin"`, or `"agency-scale"` must return that tier's elevated quota instead of falling back to `DEFAULT_TIER_LIMITS.free`.
2. **Dual-Shape `/v1/mfs/verify-trx` Payloads**: Sending a strict `TrxVerificationRequestSchema` payload (with `senderMobileNumber` and `tier: "micro_100_bdt"`) vs. a flexible payload (`{ trxId: "BKA9911223", amountBdt: 500, provider: "bkash", companyName: "VerifiQ" }` without `senderMobileNumber` or `tier`) to `POST /api/v1/mfs/verify-trx` must both succeed (`200 OK`) without route shadowing.
3. **Yearly Plan & 4th Package Checkout Calculation**: Initiating payment via `POST /v1/payment-transactions/initiate` with `{ package: "agency-scale", plan: "yearly", payment_method: "card" }` must return `5000` credits (or yearly equivalent), `USD` currency, and update `userSubscriptionsTable` upon `/payment-transactions/:id/verify`.
4. **Top-Up & Outcome Pass Persistence Across Reads**: Calling `POST /v1/subscriptions/passes:purchase` for `BOI_MELA_PRINT_PASS` (`200` credits) followed immediately by `GET /v1/subscriptions/credits` for the same `userId` must reflect the persisted `+200` credit increase rather than resetting to `500`.
5. **Stripe Checkout & Portal Express Compatibility**: Calling `POST /api/stripe/subscription/checkout` with `{ tier: "researcher", interval: "month", currency: "usd" }` on the Express server must return `{ success: true, checkoutUrl }` with status `200`.

---

### Task 1: Backend Unified Pricing, Outcome Passes, Tier Limits & MFS Route Consolidation

**Files:**
- Modify: `artifacts/api-server/src/routes/subscriptions.ts:11-846`
- Modify: `artifacts/api-server/src/routes/mfs.ts:37-173`
- Test: `artifacts/api-server/src/routes/__tests__/unified-pricing-ledger.test.ts`

**Interfaces:**
- Consumes: `db`, `userSubscriptionsTable`, `userCreditsTable`, `toolUsageTable`, `mfsTransactionsTable` from `@workspace/db`; `TrxVerificationRequestSchema`, `TIER_CREDIT_MAP` from `@workspace/hermes/contracts`.
- Produces:
  - Exported `OUTCOME_PASSES` in `subscriptions.ts` containing 5 passes: `THESIS_PLAGIARISM_PASS` (`49` BDT, `50` credits), `AUDIOBOOK_BOOKTOK_PASS` (`149` BDT, `150` credits), `BOI_MELA_PRINT_PASS` (`199` BDT, `200` credits), `PROJECT_VENTURE_PASS` (`299` BDT, `300` credits), `F_COMMERCE_MONTHLY_PASS` (`999` BDT, `1200` credits).
  - Exported `DEFAULT_TIER_LIMITS` in `subscriptions.ts` covering `free`, `student`, `starter-pass`, `researcher`, `pro-operator`, `pro`, `venture-twin`, `agency-scale`.
  - `GET /v1/packages/public` returning 4 packages (`starter-pass`, `pro-operator`, `venture-twin`, `agency-scale`), each with `monthly` and `yearly` plan entries.
  - `POST /stripe/subscription/checkout` & `POST /v1/subscriptions/checkout` returning `{ success: true, checkoutUrl: string, transactionId: string }`.
  - `POST /stripe/subscription/portal` & `POST /v1/subscriptions/portal` returning `{ success: true, portalUrl: "/pricing" }`.
  - Unified `POST /v1/mfs/verify-trx` in `mfs.ts` (and removed duplicate from `subscriptions.ts`) supporting both strict `TrxVerificationRequestSchema` and flexible `{ trxId, amountBdt, provider, userId, companyName, note }` payloads.

- [ ] **Step 1: Write the failing test in `artifacts/api-server/src/routes/__tests__/unified-pricing-ledger.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import express from "express";
import subscriptionsRouter, { OUTCOME_PASSES, DEFAULT_TIER_LIMITS } from "../subscriptions";
import mfsRouter from "../mfs";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", mfsRouter);
  app.use("/api", subscriptionsRouter);
  app.use(mfsRouter);
  app.use(subscriptionsRouter);
  return app;
}

describe("Unified Pricing, Outcome Passes & Backend Ledger", () => {
  it("exposes all 5 Done-For-You Outcome Micro-Passes including Boi Mela and Audiobook passes", () => {
    expect(Object.keys(OUTCOME_PASSES)).toEqual(
      expect.arrayContaining([
        "THESIS_PLAGIARISM_PASS",
        "AUDIOBOOK_BOOKTOK_PASS",
        "BOI_MELA_PRINT_PASS",
        "PROJECT_VENTURE_PASS",
        "F_COMMERCE_MONTHLY_PASS",
      ])
    );
    expect(OUTCOME_PASSES.BOI_MELA_PRINT_PASS.priceBdt).toBe(199);
    expect(OUTCOME_PASSES.AUDIOBOOK_BOOKTOK_PASS.priceBdt).toBe(149);
  });

  it("defines DEFAULT_TIER_LIMITS for all canonical tiers and aliases without downgrading student or researcher to free", () => {
    expect(DEFAULT_TIER_LIMITS.student.plagiarismChecks).toBe(30);
    expect(DEFAULT_TIER_LIMITS["starter-pass"].plagiarismChecks).toBe(30);
    expect(DEFAULT_TIER_LIMITS.researcher.plagiarismChecks).toBe(100);
    expect(DEFAULT_TIER_LIMITS["pro-operator"].grammarChecks).toBe(-1);
    expect(DEFAULT_TIER_LIMITS["venture-twin"].plagiarismChecks).toBe(-1);
    expect(DEFAULT_TIER_LIMITS["agency-scale"].plagiarismChecks).toBe(-1);
  });

  it("returns all 4 public packages with monthly and yearly plans from GET /api/v1/packages/public", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/packages/public`);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.map((p: any) => p._id)).toEqual([
        "starter-pass",
        "pro-operator",
        "venture-twin",
        "agency-scale",
      ]);
      expect(body.data[3].plans.length).toBeGreaterThanOrEqual(2);
    } finally {
      server.close();
    }
  });

  it("persists credits across passes:purchase and GET /v1/subscriptions/credits and supports Express stripe checkout", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    const testUser = `usr_test_${Date.now()}`;
    try {
      const passRes = await fetch(`http://127.0.0.1:${port}/api/v1/subscriptions/passes:purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": testUser },
        body: JSON.stringify({ userId: testUser, passId: "BOI_MELA_PRINT_PASS" }),
      });
      const passBody = await passRes.json();
      expect(passRes.status).toBe(200);
      expect(passBody.newCreditsBalance).toBe(700);

      const credRes = await fetch(`http://127.0.0.1:${port}/api/v1/subscriptions/credits`, {
        headers: { "x-user-id": testUser },
      });
      const credBody = await credRes.json();
      expect(credBody.creditsBalance).toBe(700);

      const stripeRes = await fetch(`http://127.0.0.1:${port}/api/stripe/subscription/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "researcher", interval: "year", currency: "usd" }),
      });
      const stripeBody = await stripeRes.json();
      expect(stripeRes.status).toBe(200);
      expect(stripeBody.checkoutUrl).toContain("/pricing/checkout?packageId=pro-operator&planId=yearly");
    } finally {
      server.close();
    }
  });

  it("handles both strict schema and flexible TwinRevenueLedger payloads on POST /api/v1/mfs/verify-trx", async () => {
    const app = createTestApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;
    try {
      const strictRes = await fetch(`http://127.0.0.1:${port}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: "STRICT889900",
          provider: "bkash",
          senderMobileNumber: "01711223344",
          tier: "micro_100_bdt",
          amountBdt: 100,
          userId: "usr_strict_test",
        }),
      });
      const strictBody = await strictRes.json();
      expect(strictRes.status).toBe(200);
      expect(strictBody.creditedAmount).toBe(80);

      const flexRes = await fetch(`http://127.0.0.1:${port}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: "FLEX8899001",
          amountBdt: 500,
          provider: "nagad",
          companyName: "VerifiQ",
        }),
      });
      const flexBody = await flexRes.json();
      expect(flexRes.status).toBe(200);
      expect(flexBody.verified).toBe(true);
      expect(flexBody.creditUpdate.addedCredits).toBe(50);
    } finally {
      server.close();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:\Users\USER\hermes\shothik-web-mirror-v2"; pnpm --filter @workspace/api-server test src/routes/__tests__/unified-pricing-ledger.test.ts`
Expected: FAIL (`OUTCOME_PASSES.BOI_MELA_PRINT_PASS` undefined, `DEFAULT_TIER_LIMITS` not exported / missing `student`, `agency-scale` missing from `PUBLIC_PACKAGES`).

- [ ] **Step 3: Implement unified backend logic in `artifacts/api-server/src/routes/subscriptions.ts` and `artifacts/api-server/src/routes/mfs.ts`**

In `artifacts/api-server/src/routes/subscriptions.ts`:
1. Export `DEFAULT_TIER_LIMITS` with keys `free`, `student`, `starter-pass`, `researcher`, `pro-operator`, `pro`, `venture-twin`, `agency-scale`.
2. Add `AUDIOBOOK_BOOKTOK_PASS` (`149` BDT, `150` credits) and `BOI_MELA_PRINT_PASS` (`199` BDT, `200` credits) to `OUTCOME_PASSES`.
3. Update `ledger:topup` and `passes:purchase` to read via `await getPersistedCredits(userId)` and write via `await persistCreditDeduction(userId, newBalance, 0)`.
4. Remove the duplicate `router.post(["/v1/mfs/verify-trx", "/api/v1/mfs/verify-trx"])` handler from `subscriptions.ts` and move its flexible fallback into `mfs.ts`.
5. Expand `PUBLIC_PACKAGES` to include `agency-scale` (`USD: 49.99, BDT: 6000`, `token: 5000`) and include both `monthly` and `yearly` plan entries on all 4 packages.
6. Update `/payment-transactions/initiate` and `/payment-transactions/:id/verify` to handle all 4 packages, `yearly` plans, and upsert `userSubscriptionsTable` on verification.
7. Mount `POST ["/stripe/subscription/checkout", "/api/stripe/subscription/checkout", "/v1/subscriptions/checkout"]` and `POST ["/stripe/subscription/portal", "/api/stripe/subscription/portal", "/v1/subscriptions/portal"]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:\Users\USER\hermes\shothik-web-mirror-v2"; pnpm --filter @workspace/api-server test src/routes/__tests__/unified-pricing-ledger.test.ts`
Expected: PASS (5/5 tests passing).

---

### Task 2: Frontend Unified Tier Config, 4-Persona Lens `/pricing` Page, Outcome Passes & Studio Credit HUD

**Files:**
- Modify: `artifacts/shothik/src/lib/subscription-tiers.ts:1-275`
- Modify: `artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx:1-299`
- Modify: `artifacts/shothik/src/components/subscription/UpgradeModal.tsx:1-188`
- Modify: `artifacts/shothik/src/components/subscription/BillingPage.tsx:1-362`
- Modify: `artifacts/shothik/src/components/writing-studio/PolishedWriteView.tsx`

**Interfaces:**
- Consumes: `GET /api/packages/public`, `GET /api/v1/subscriptions/credits`, `GET /api/v1/subscriptions/me`, `POST /api/stripe/subscription/checkout`.
- Produces:
  - Exported `PersonaLensId = "academic" | "author_inkos" | "venture_twin" | "enterprise_erp"` and `PERSONA_LENSES` metadata in `subscription-tiers.ts`, plus `mapTierToPackageId(tier: SubscriptionTier): string` and `mapPackageToTier(pkgId: string): SubscriptionTier`.
  - Updated `PricingPage` in `pricing/page.tsx` with:
    1. Interactive **4-Persona Lens Switcher** (`data-testid="persona-lens-switcher"`) dynamically tailoring package feature lists and ROI badges.
    2. **1-Tap Done-For-You Outcome Micro-Passes** section (`data-testid="outcome-micro-passes-grid"`) showcasing all 5 passes (`৳49 Thesis`, `৳149 Audiobook & BookTok`, `৳199 Ekushey Boi Mela Print-Ready Book`, `৳299 Founder Venture`, `৳999 F-Commerce Autopilot`).
    3. **Checkpoint Credit Transparency & Self-Liquidating Earn-Back** matrix (`data-testid="checkpoint-credit-guide"`).
  - Updated `UpgradeModal.tsx` with direct **bKash / Nagad MFS Checkout** button routing to `/pricing/checkout?packageId=...` alongside Card checkout.
  - Updated `BillingPage.tsx` displaying live **Universal Task Credits Balance** fetched from `/api/v1/subscriptions/credits`.
  - Updated `PolishedWriteView.tsx` with a **Live Studio Credits & Tier Pill** (`data-testid="button-studio-credit-hud"`) in the studio header that opens `UpgradeModal`.

- [ ] **Step 1: Update `artifacts/shothik/src/lib/subscription-tiers.ts` with aligned limits, InkOS 45 features, `PERSONA_LENSES`, and package-tier mappers**

Align `free` limits (`plagiarismChecks: 5`, `aiDetectorScans: 5`, `paraphraseUses: 10`, `grammarChecks: 20`, `humanizeUses: 5`, `summarizeUses: 10`, `translatorUses: 20`), enrich `student`, `researcher`, and `pro` features with InkOS 45-Capability Studio & Venture Twin highlights, and export `PERSONA_LENSES`, `OUTCOME_MICRO_PASSES`, `mapTierToPackageId`, and `mapPackageToTier`.

- [ ] **Step 2: Upgrade `artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx` with the 4-Persona Lens Switcher, 5 Outcome Micro-Passes, and Checkpoint Credit & Earn-Back Matrix**

Render the 4 Persona Lens buttons, dynamically project lens-specific feature bullets onto the 4 packages (`starter-pass`, `pro-operator`, `venture-twin`, `agency-scale`), render the 5 Outcome Micro-Pass cards with 1-click checkout links, and render the Checkpoint Credit & Earn-Back section.

- [ ] **Step 3: Upgrade `UpgradeModal.tsx`, `BillingPage.tsx`, and `PolishedWriteView.tsx`**

1. In `UpgradeModal.tsx`, add a 1-click bKash/Nagad MFS checkout button (`/pricing/checkout?packageId=${mapTierToPackageId(tierId)}&planId=${interval === "year" ? "yearly" : "monthly"}`) and ensure Card checkout navigates smoothly to `data.checkoutUrl`.
2. In `BillingPage.tsx`, fetch `/api/v1/subscriptions/credits` and display a **Universal Task Credits** card with quick Top-Up / Outcome Pass triggers.
3. In `PolishedWriteView.tsx`, add the `⚡ Credits · InkOS Studio` toolbar button (`data-testid="button-studio-credit-hud"`) opening `UpgradeModal`.

- [ ] **Step 4: Run TypeScript typecheck, rebuild API server, update Graphify knowledge graph, and verify in live browser**

Run:
1. `cd "C:\Users\USER\hermes\shothik-web-mirror-v2"; pnpm --filter @workspace/api-server run typecheck; pnpm --filter @workspace/shothik run typecheck`
2. `cd "C:\Users\USER\hermes\shothik-web-mirror-v2"; pnpm --filter @workspace/api-server run build`
3. `cd "C:\Users\USER\hermes\shothik-web-mirror-v2"; & "C:\Users\USER\.local\bin\graphify.exe" update .`
Expected: 0 TypeScript errors, clean build, and live verification on `http://localhost:5000/pricing` and `http://localhost:5000/writing-studio?projectId=proj_demo_bengali`.

- [ ] **Step 5: Commit and Push with ECC Pre-Commit & Chaos Fuzzing Gates**

```powershell
cd "C:\Users\USER\hermes\shothik-web-mirror-v2"
git add docs/superpowers/specs/2026-11-05-unified-pricing-persona-lens-design.md docs/superpowers/plans/2026-11-05-unified-pricing-persona-lens.md artifacts/api-server/src/routes/subscriptions.ts artifacts/api-server/src/routes/mfs.ts artifacts/api-server/src/routes/__tests__/unified-pricing-ledger.test.ts artifacts/shothik/src/lib/subscription-tiers.ts "artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx" artifacts/shothik/src/components/subscription/UpgradeModal.tsx artifacts/shothik/src/components/subscription/BillingPage.tsx artifacts/shothik/src/components/writing-studio/PolishedWriteView.tsx
git commit -m "feat(pricing): unify pricing schemas, 4-persona lens, outcome passes & backend ledger"
git push origin feat/supabase-deeptech-transformation
```
