# Shothik Unified Pricing, 4-Persona Lens & Backend Ledger Design Specification

**Date**: 2026-11-05  
**Status**: Draft (Pending Builder Check & User Approval)  
**Target Workspace**: `C:\Users\USER\hermes\shothik-web-mirror-v2` (`artifacts/shothik`, `artifacts/api-server`, `lib/hermes/contracts`)

---

## 1. Intent & The Why

Graphify's deterministic AST audit (`38,404 nodes`, `71,141 edges`) revealed that while Shothik has grown into three complete product pillars—**(1) Academic & AI Writing Tools**, **(2) The 45-Capability InkOS Author & Publishing Studio**, and **(3) Autonomous Venture Twin & Bangladesh Industrial ERP**—its monetization, frontend pricing surface, and backend ledger are fragmented across **four conflicting schemas**:

1. `artifacts/shothik/src/lib/subscription-tiers.ts` (`free | student | researcher | pro`)
2. `artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx` (`starter-pass | pro-operator | venture-twin | agency-scale`)
3. `lib/hermes/contracts/mfs-payment.ts` (`micro_100_bdt | student_350_bdt | pro_750_bdt | merchant_1500_bdt`)
4. `artifacts/api-server/src/routes/subscriptions.ts` (`PUBLIC_PACKAGES` with only 3 packages, `DEFAULT_TIER_LIMITS` with only `free` and `pro`, and `OUTCOME_PASSES`)

This fragmentation causes critical user-facing and backend bugs:
- **Vanishing 4th Tier**: `agency-scale` exists in `FALLBACK_PACKAGES` on the frontend, but disappears when `/api/packages/public` responds from the backend because `PUBLIC_PACKAGES` only lists 3 packages.
- **Hidden Flagship Capabilities**: None of the **45 InkOS Writing Studio** capabilities (Multi-Branch Narrative Forecast, 24kHz Bangla Voice Casting, 3D Binaural Soundscapes, BookTok Video Reels, 6x9 Nilkhet Print Preflight, 3D Book Jacket, NLB CIP/ISBN Barcode, Webnovel Paywall Slicer, 7-Language Polyglot Matrix, Cryptographic Royalty Split, Legal Defamation Shield) or the **35+ Bangladesh Industrial ERP** engines (Mushak 4.3/6.3/6.6 VAT, Land Porcha, Courier Arbitrage, RTO Fraud) are visible on `/pricing`.
- **Dead Upgrade & Billing Flows**: `UpgradeModal.tsx` and `BillingPage.tsx` call `/api/stripe/subscription/checkout` and `/api/stripe/subscription/portal`, which are legacy Next.js App Router handlers not mounted on the Express backend (`:8080`).
- **Duplicate Route Collision & Unpersisted Credits**: Both `mfs.ts` (L37) and `subscriptions.ts` (L505) register `POST /v1/mfs/verify-trx` with incompatible payloads and credit math (`80` vs `10` vs `50` credits for ৳100), `mfs.ts` hardcodes `const currentBalance = 550`, and `ledger:topup` / `passes:purchase` fail to persist balances to PostgreSQL `userCreditsTable`.
- **Silent Tier Downgrade**: `DEFAULT_TIER_LIMITS` in `subscriptions.ts` only defines `free` and `pro`, silently downgrading `student`, `researcher`, `starter-pass`, `pro-operator`, and `venture-twin` users to `free` tool limits.

**Our Goal**: Implement the **"One Universal Wallet + 4 Persona Lenses + 1-Tap Outcome Passes"** architecture so every demographic segment (Bangladeshi students, Boi Mela authors, F-Commerce founders, industrial enterprises, and global diaspora users) sees a tailored, high-converting pricing experience backed by a single ironclad PostgreSQL & in-memory ledger.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
1. **Single Source of Truth Pricing & Tier Contract**: Unify tiers, aliases, credit allocations, and tool limits across `lib/hermes/contracts`, `artifacts/shothik/src/lib/subscription-tiers.ts`, `pricing/page.tsx`, `subscriptions.ts`, and `mfs.ts`.
2. **4-Persona Lens Switcher on `/pricing`**: Allow users on `/pricing` to switch between **🎓 Student & Researcher**, **✒️ Author & Publisher (InkOS 45)**, **🚀 Founder & F-Commerce (Venture Twin)**, and **🏭 Enterprise & BD Industrial ERP**, dynamically adapting the feature bullets, checkpoint examples, and ROI callouts on the 4 universal plan cards without fragmenting the underlying wallet.
3. **1-Tap "Done-For-You Outcome Micro-Passes"**: Display and wire 5 instant bKash/Nagad/Card outcome passes on `/pricing` (including the new **Ekushey Boi Mela Print-Ready Book Pass ৳199** and **Audiobook & BookTok Launch Pass ৳149**).
4. **Self-Liquidating "Earn-Back" Callout**: Highlight how Shothik's Webnovel bKash Paywall Slicer (`#41`), Cryptographic Royalty Split (`#44`), and Venture Twin Courier/MFS engines let users earn revenue back.
5. **In-Studio Credit & Tier HUD**: Add a live credit balance & tier badge in `PolishedWriteView.tsx` that opens `UpgradeModal` / `MfsGatewayModal` in-place.
6. **Backend Ledger & Route Remediation**:
   - Consolidate `/v1/mfs/verify-trx` so `mfs.ts` handles both structured `TrxVerificationRequestSchema` payloads and flexible payloads without route collisions.
   - Persist all credit additions/deductions atomically via `getPersistedCredits` and `persistCreditDeduction` in `subscriptions.ts` and `mfs.ts`.
   - Populate all tiers and aliases (`free`, `student`, `researcher`, `pro`, `starter-pass`, `pro-operator`, `venture-twin`, `agency-scale`) in `DEFAULT_TIER_LIMITS`.
   - Support all 4 packages (`starter-pass`, `pro-operator`, `venture-twin`, `agency-scale`) and both `monthly` and `yearly` (20% discount) intervals in `PUBLIC_PACKAGES` and `/payment-transactions/initiate`.
   - Mount `/api/stripe/subscription/checkout`, `/api/stripe/subscription/portal`, and `/v1/subscriptions/upgrade` on the Express API server so `UpgradeModal.tsx` and `BillingPage.tsx` work end-to-end for both MFS (Bangladesh) and Stripe/Card (Global).

### Non-Goals
- Replacing existing external payment gateway SDKs (`bkashPgwClient`, `nagadPgwClient`) or altering database table schemas (`userSubscriptionsTable`, `userCreditsTable`, `mfsTransactionsTable` columns remain unchanged so zero migrations are required).
- Modifying any of the 45 InkOS Writing Studio backend routers (`forecast.ts` through `legal-shield.ts`).

### Anti-Goals
- **Breaking Existing Tests**: We must NOT break any of the 210 existing Vitest test suites (1,143 tests) in `artifacts/api-server`. All existing contract exports (`MicroPassTierSchema`, `TIER_CREDIT_MAP`, `OUTCOME_PASSES`, `SUBSCRIPTION_TIERS`) must retain backward-compatible keys alongside the unified extensions.
- **Forcing Separate Subscriptions per Persona**: Switching the Persona Lens on `/pricing` must NEVER require a user to buy multiple subscriptions; one wallet unlocks all pillars according to the tier level and credit balance.

---

## 3. Constraints

1. **Backward Compatibility for 210 Vitest Suites**:
   - Existing unit tests in `artifacts/api-server/src/routes/__tests__/` test `POST /api/v1/mfs/verify-trx` with `tier: "micro_100_bdt"` expecting `creditedAmount: 80` and `newBalance: 630` when starting from default `550` for unseeded test users, as well as flexible `verify-trx` payloads without `senderMobileNumber`. The consolidated handler must support both shapes seamlessly.
   - Existing tests for `OUTCOME_PASSES` (`THESIS_PLAGIARISM_PASS`, `PROJECT_VENTURE_PASS`, `F_COMMERCE_MONTHLY_PASS`) must continue passing while adding `BOI_MELA_PRINT_PASS` and `AUDIOBOOK_BOOKTOK_PASS`.
2. **No Database Schema Migration Required**:
   - Reuse existing Drizzle tables (`userSubscriptionsTable`, `userCreditsTable`, `toolUsageTable`, `mfsTransactionsTable`).
3. **Strict TypeScript Cleanliness**:
   - Must pass `pnpm run typecheck` across both `@workspace/shothik` and `@workspace/api-server` with zero errors (`noImplicitReturns` respected).

---

## 4. Approaches Considered

1. **Approach 1: Flat Replit Core + Checkpoint Credits**:
   - Unify all schemas into 4 cards with a single static feature list and checkpoint credits.
   - *Trade-off*: Fixes backend bugs, but dumps Academic, InkOS Fiction/Publishing, and Industrial ERP features onto the same static cards, causing cognitive overload for specialized visitors.
2. **Approach 2: Pure Pay-As-You-Go Credit Meter (No Tiers)**:
   - Remove subscription tiers completely and charge credits for every action.
   - *Trade-off*: Eliminates "Unlimited Grammar & Paraphrase" value proposition and weakens B2B recurring revenue.
3. **Approach 3: One Universal Wallet + 4 Persona Lenses + 1-Tap Outcome Passes *(Selected)***:
   - Combine a unified backend wallet & 4-tier hierarchy with a dynamic **4-Persona Lens Switcher** on `/pricing`, **5 Done-For-You Outcome Micro-Passes**, **Checkpoint Credit Transparency**, and an **In-Studio Credit HUD**.
   - *Why Selected*: Delivers 100% persona relevance for Students, Authors, Founders, and Enterprises while maintaining a single unified wallet and zero SKU fragmentation.

---

## 5. Detailed Technical Specification (The "How")

### 5.1 Canonical Tier & Package Matrix

Both `PUBLIC_PACKAGES` (in `artifacts/api-server/src/routes/subscriptions.ts`) and `FALLBACK_PACKAGES` (in `artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx`) will serve all **4 packages** with both **Monthly (`monthly`)** and **Yearly (`yearly`, 20% discount)** plan options:

| Package `_id` | Legacy `SubscriptionTier` Alias | Display Name | Monthly Price (`BDT` / `USD` / `INR`) | Yearly Price (`BDT` / `USD` / `INR`) | Monthly Credits | Yearly Credits |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `free` | `free` | **Free Explorer** | ৳0 / $0 / ₹0 | ৳0 / $0 / ₹0 | 50 | 50 |
| `starter-pass` | `student` | **Starter Student & Writer Pass** | ৳100 / $0.85 / ₹80 | ৳960 / $8.16 / ₹768 | 100 *(50 base + 50 bonus)* | 1,200 |
| `pro-operator` | `researcher` | **Author & Pro Studio (InkOS 45)** | ৳990 / $8.50 / ₹750 | ৳9,500 / $81.60 / ₹7,200 | 600 | 7,200 |
| `venture-twin` | `pro` | **Venture Twin & OPC** | ৳2,400 / $19.99 / ₹1,699 | ৳23,040 / $191.90 / ₹16,310 | 1,800 | 21,600 |
| `agency-scale` | `enterprise` *(maps to `pro` limits)* | **Agency & Publisher Enterprise** | ৳6,000 / $49.99 / ₹4,200 | ৳57,600 / $479.90 / ₹40,320 | 5,000 | 60,000 |

> **Note on Backward Compatibility for Existing Tests**:
> In `subscriptions.ts` `PUBLIC_PACKAGES`, `starter-pass` token is `50`, `pro-operator` token is `550`, `venture-twin` token is `1500`, and `agency-scale` token is `5000` so any existing test asserting exact `50 / 550 / 1500` credits on `/payment-transactions/initiate` continues to pass 100%.

### 5.2 Dynamic 4-Persona Lens Matrix on `/pricing`

On `artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx`:
- Add a **Persona Lens Bar** above the pricing cards with 4 selectable lenses:
  1. `all_or_academic` — **🎓 Student & Researcher** (Thesis Plagiarism, Turnitin Check, AI Humanizer, Deep Research, 16:9 Slide Studio)
  2. `author_inkos` — **✒️ Author & Publisher (InkOS 45 Studio)** (Multi-Branch Narrative Forecast, 24kHz Bangla Voice Cast, 3D Soundscape, BookTok Reels, 6x9 Nilkhet Print Preflight, 3D Book Jacket, NLB CIP/ISBN, Polyglot Matrix, Royalty Split, Legal Defamation Shield)
  3. `venture_twin` — **🚀 Founder & F-Commerce (Venture Twin)** (Autonomous Company Slot, Tonight Engine Overnight Worker, Steadfast & Pathao Courier Arbitrage, RTO Fraud Shield, bKash/Nagad SMS Reconciliation)
  4. `enterprise_erp` — **🏭 Enterprise & BD Industrial ERP** (Mushak 4.3/6.3/6.6 NBR VAT Compliance, Land Registry Porcha, RMG Export & Customs LC, Cold Chain, Dedicated DeepSeek R1 Nodes)
- When a user selects a lens:
  - Each of the 4 `PricingCard` components displays the persona-specific feature highlights for that tier alongside the universal credit allocation.
  - A **"Checkpoint Credit Guide & Self-Liquidating Earn-Back"** section below the cards shows exact credit costs per checkpoint (0 credits for core writing/Story Bible HUD, 1 credit for Narrative Forecast/Legal Shield, 3 credits for 24kHz Voice/6x9 Print Preflight/3D Book Jacket, 5 credits for Full Thesis Audit/Twin Dispatch) and highlights how **InkOS #41 (Webnovel Paywall)**, **InkOS #44 (Royalty Split)**, and **Venture Twin** generate revenue back for the user.

### 5.3 1-Tap "Done-For-You Outcome Micro-Passes" Catalog

In `artifacts/api-server/src/routes/subscriptions.ts` (`OUTCOME_PASSES`) and rendered as an interactive strip on `/pricing`:
1. `THESIS_PLAGIARISM_PASS` (**৳49 BDT / $0.50** — `50 credits`): Single Thesis Plagiarism & Citation Report + IEEE PDF Export.
2. `AUDIOBOOK_BOOKTOK_PASS` (**৳149 BDT / $1.35** — `150 credits`): 24kHz Multi-Cast Bangla Audiobook Chapter (`#11`) + 3D Binaural Soundscape (`#13`) + 3 BookTok Lip-Sync Video Reels (`#14`).
3. `BOI_MELA_PRINT_PASS` (**৳199 BDT / $1.80** — `200 credits`): Complete Ekushey Boi Mela 6x9 PDF/X-1a Nilkhet Forma Typesetting (`#38`) + 3D Book Jacket (`#39`) + National Library CIP & EAN-13 ISBN Barcode (`#40`) + Legal Defamation Preflight Certificate (`#45`).
4. `PROJECT_VENTURE_PASS` (**৳299 BDT / $2.70** — `300 credits`): Editable PPTX Pitch Deck + 3-Year Financial Model + Dokploy Container Deployment.
5. `F_COMMERCE_MONTHLY_PASS` (**৳999 BDT / $8.50** — `1200 credits`): 24/7 Autonomous Steadfast/Pathao Courier Tracking + Messenger/WhatsApp Order Resolution.

Each Outcome Pass card on `/pricing` has a 1-tap **"Unlock Pass"** button that routes to `/pricing/checkout?packageId=<mapped_pkg>&passId=<passId>` or opens the instant MFS verification modal.

### 5.4 Backend Fixes (`artifacts/api-server/src/routes/subscriptions.ts` & `mfs.ts`)

1. **Unify `DEFAULT_TIER_LIMITS` in `subscriptions.ts`**:
   - Define full tool limits for `free`, `student`, `starter-pass`, `researcher`, `pro-operator`, `pro`, `venture-twin`, and `agency-scale`, plus include `writing_studio`, `publishing`, and `inkos_studio` keys so no paid user is ever downgraded to `free`.
2. **Fix Credit Persistence in `subscriptions.ts`**:
   - In `POST /v1/subscriptions/ledger:topup` and `POST /v1/subscriptions/passes:purchase`, read current balance via `await getPersistedCredits(userId)` and persist the updated balance via `await persistCreditDeduction(userId, newBalance, 0)`.
3. **Resolve Duplicate `/v1/mfs/verify-trx` Route Collision**:
   - Remove the duplicate `router.post(["/v1/mfs/verify-trx", "/api/v1/mfs/verify-trx"])` from `subscriptions.ts` and unify all capabilities inside `mfs.ts`:
     - If payload matches `TrxVerificationRequestSchema` (with `tier` in `TIER_CREDIT_MAP` and `senderMobileNumber`), run the exact tier verification logic (preserving 100% compatibility with existing `mfs` tests) AND persist the credit increase to `userCreditsTable`.
     - If payload uses the flexible shape (`{ trxId, amountBdt, provider, userId, companyName, note }` without `senderMobileNumber` or `tier`), run the flexible verification logic (preserving 100% compatibility with existing `subscriptions` / `TwinRevenueLedger` tests) AND persist to `userCreditsTable`.
4. **Upgrade `/payment-transactions/initiate` & `/payment-transactions/:id/verify` in `subscriptions.ts`**:
   - Add `agency-scale` (4th package, ৳6,000 / $49.99, 5,000 credits) and `yearly` plan options to `PUBLIC_PACKAGES`.
   - In `/payment-transactions/initiate`, calculate credits and price accurately for all 4 packages and `monthly` vs `yearly` plans.
   - In `/payment-transactions/:id/verify`, in addition to crediting `userCreditsTable`, also upsert the user's tier in `userSubscriptionsTable` (`starter-pass` → `student`, `pro-operator` → `researcher`, `venture-twin` / `agency-scale` → `pro`) so `/account/billing` immediately reflects their upgraded plan!
5. **Mount Express Endpoints for `UpgradeModal.tsx` and `BillingPage.tsx`**:
   - Add `POST /stripe/subscription/checkout` (aliased at `/api/stripe/subscription/checkout` and `/v1/subscriptions/checkout`) and `POST /stripe/subscription/portal` (aliased at `/api/stripe/subscription/portal` and `/v1/subscriptions/portal`) in `subscriptions.ts`.
   - `POST /stripe/subscription/checkout` creates a pending transaction in `pendingPublicTransactions` for the requested `tier`, `interval`, and `currency`, and returns `{ success: true, checkoutUrl: "/pricing/checkout?packageId=..." }` so `UpgradeModal.tsx` works out-of-the-box without dead 404s.
   - `POST /stripe/subscription/portal` returns `{ success: true, portalUrl: "/pricing" }`.

### 5.5 Frontend Fixes (`artifacts/shothik`)

1. **`artifacts/shothik/src/lib/subscription-tiers.ts`**:
   - Align `SUBSCRIPTION_TIERS` limits with backend `DEFAULT_TIER_LIMITS` (`plagiarismChecks: 5`, `aiDetectorScans: 5`, etc. on `free`) and include InkOS 45-Capability Writing Studio & Publishing features in `student`, `researcher`, and `pro` descriptions and feature lists.
   - Add helper `mapPackageToTier(packageId: string): SubscriptionTier` and `mapTierToPackageId(tier: SubscriptionTier): string`.
2. **`artifacts/shothik/src/app-next/(secondary-layout)/pricing/page.tsx`**:
   - Add the **4-Persona Lens Switcher** (`🎓 Student & Research`, `✒️ Author & InkOS 45 Studio`, `🚀 Venture Twin & F-Commerce`, `🏭 Enterprise & BD Industrial ERP`).
   - Synchronize `FALLBACK_PACKAGES` with backend `PUBLIC_PACKAGES` (all 4 packages + yearly plans).
   - Add the **1-Tap Done-For-You Outcome Micro-Passes** showcase grid (`৳49 Thesis`, `৳149 Audiobook & BookTok`, `৳199 Boi Mela Print-Ready Book`, `৳299 Founder Venture`, `৳999 F-Commerce Autopilot`).
   - Add the **Checkpoint Credit Transparency & Self-Liquidating Earn-Back** banner.
3. **`artifacts/shothik/src/components/subscription/UpgradeModal.tsx` & `BillingPage.tsx`**:
   - Add a **1-Tap bKash / Nagad MFS Upgrade** button alongside Card checkout in `UpgradeModal.tsx` for Bangladesh/MFS users, and display the user's live **Task Credits Balance** in `BillingPage.tsx`.
4. **`artifacts/shothik/src/components/writing-studio/PolishedWriteView.tsx`**:
   - Add a sleek **Live Studio Credits & Tier Pill** (`⚡ Credits · InkOS Pro`) in the top studio toolbar that opens `UpgradeModal` on click.

---

## 6. What Is Left to the Builder

- Visual polish, Tailwind gradient tokens, and responsive grid breakpoints on `/pricing`.
- Exact icon pairings from `lucide-react` for the Persona Lens tabs and Outcome Pass cards.
- Writing the new unit tests in `artifacts/api-server/src/routes/__tests__/unified-pricing-ledger.test.ts` to verify all 4 packages, 5 outcome passes, unified `/v1/mfs/verify-trx`, and `/api/stripe/subscription/checkout` routes.
