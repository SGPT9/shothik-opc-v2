# artifacts/api-server/AGENTS.md
# Shothik API Server – Architecture & Operating Standards

This document establishes the architectural rules, route mounting conventions, and testing standards for the Express + TypeScript backend.

---

## 1. Core Stack & Configuration
- **Runtime:** Node.js (ESM / ts-node / vite-node)
- **Framework:** Express.js + TypeScript
- **Validation:** Zod schemas for all request bodies and query parameters
- **Testing:** Vitest with Supertest (`pnpm --filter @workspace/api-server run test`)
- **Port:** `8080` (Mounted at `http://localhost:8080/api/v1/...`)

---

## 2. Route Mounting Convention (CRITICAL)
In `artifacts/api-server/src/index.ts`, routers are mounted with the global `/api` prefix:
```ts
app.use("/api", router);
```
Therefore, all route files under `src/routes/` MUST declare their paths starting with `/v1/...`:
- Correct: `router.post("/v1/tax/mushak/calculate", ...)` -> Accessible at `/api/v1/tax/mushak/calculate`
- Incorrect: `router.post("/mushak/calculate", ...)` -> Missing version prefix

---

## 3. Parameter Typing & TypeScript Strictness
- When accessing route params like `req.params.invoiceId` or `req.params.id`, always cast or sanitize:
  ```ts
  const invoiceId = String(req.params.invoiceId || "");
  ```
- Return JSON responses with strict shape:
  ```ts
  res.status(200).json({ success: true, data: result });
  res.status(400).json({ success: false, error: "Human-readable message" });
  ```

---

## 4. Domain Subsystems
- **Tax & Statutory Compliance (`src/lib/tax/`, `src/lib/audit/`):** NBR Mushak-6.3 VAT calculations (0%, 5%, 7.5%, 10%, 15%), TDS withholding (2%-10%), 13-digit BIN Luhn check, Mushak-9.1 return aggregator, double-entry general ledger with 6 Chart of Accounts categories, real-time trial balance balancing proof, and cryptographically sealed NBR Statutory Audit Dossier compiler with SHA-256 seal.
- **Freelancer Remittance & BB ICT Subsidy (`src/lib/remittance/`, `src/routes/remittance-incentive.ts`):** Inward remittance calculation & tracking (Wise, Payoneer, Swift Wire, Upwork, Fiverr), Bangladesh Bank FE Circular 02/2024 cash subsidy computation (4% freelancer, 10% registered IT exporter), automated Form-C foreign exchange declaration generator, PRC/FFC reconciliation, and milestone escrow contract compiler.
- **BTRC Telephony & Voice IVR (`src/lib/telephony/`):** Autonomous outbound calling for COD order verification, BTRC compliance window (09:00-20:00 BST), Banglish speech intent parsing, Steadfast auto-booking.
- **WhatsApp Commerce & MFS QR (`src/lib/commerce/`):** WhatsApp catalog cart session engine, multi-dialect customer assistant, instant bKash dynamic QR generation.
- **Nilkhet Commercial POD Press (`src/lib/publishing/`):** CMYK imposition calculator, paper weight/spine thickness compiler, print job ticket dispatch.
- **Second-Me Semantic Memory (`src/lib/memory/`):** Vector embeddings, episodic fact extraction, long-term memory retrieval.
- **Hyperlocal Dark Store & Micro-Hub (`src/lib/fulfillment/`, `src/routes/fulfillment.ts`):** Multi-hub micro-fulfillment network (Dhaka Dhanmondi, Uttara, Mirpur, Gulshan/Badda, Old Dhaka + Chittagong GEC & Sylhet Zindabazar), geofenced thana order routing with FEFO lot allocation, S-curve 3D bin pick-path optimizer (`Aisle-Rack-Shelf-Bin`), batch/perishable expiry markdown radar, and velocity-driven inter-hub stock rebalancing from Central Mega-Hub.
- **Courier Logistics & Fleet Arbitrage (`src/routes/courier-arbitrage.ts`, `src/lib/logistics/`):** Dynamic 4-carrier rate cards & DSR arbitrage (Steadfast, Pathao, RedX, Paperfly), 64-district delivery matrix, composite optimization scoring ($w_{\text{dsr}}=0.50$, $w_{\text{cost}}=0.30$, $w_{\text{speed}}=0.20$), 1-click booking, printable barcode generation, and AI RTO risk mitigation.
- **Legal Contracts & Stamp Act 1899 (`src/lib/contracts/`, `src/routes/legal-contracts.ts`):** Bilingual statutory contract generator (Vendor Supply, Property Lease, NDA, Founder Vesting, Freelancer), Stamp Act 1899 Schedule 1 non-judicial stamp duty calculator (৳300, ৳500, ৳1000, 1% lease), Section 7 ICT Act 2006 e-signatures with OTP logs, and SHA-256 cryptographic audit seal.
- **Customs Duty Drawback & DEC (`src/lib/customs/duty-drawback-engine.ts`, `src/routes/duty-drawback.ts`):** Automated NBR DEDO drawback claims under Customs Act 2023 Sec 33/34, 8-digit HS Code input-output tariff calculator, import B/E vs Form-EXP cross-reconciler, and DEDO Form-A/B legal claim generator.
- **Halal Certification & Shariah Governance (`src/lib/shariah/halal-governance-engine.ts`, `src/routes/halal-governance.ts`):** BSTI BDS 1907:2016 food/cosmetic Halal verification, 500+ E-number additive screener (Halal/Haram/Mushbooh) with plant replacements, and AAOIFI Shariah Standard No. 21 corporate financial ratio auditor (Debt ≤ 33%, Interest securities ≤ 33%, Impermissible revenue ≤ 5%) with income purification calculation.
- **Micro-Merchant Collective Buying & Freight Pooling (`src/lib/commerce/collective-buying-engine.ts`, `src/routes/collective-buying.ts`):** Micro-merchant collective buying pools for 1688 Guangzhou, Yiwu, and domestic hubs, CBM volumetric freight & NBR tariff cost-sharing calculator, 30% advance escrow margin lock via bKash/Nagad, and automated central hub parcel splitter with Steadfast/Pathao courier booking.
- **Government e-GP Tender Bids & CPTU Compliance (`src/lib/tenders/tender-bid-engine.ts`, `src/routes/tender-bids.ts`):** Government e-GP and corporate RFP tender bid preparation compliant with CPTU STD PG1/PG2/PG3/PW2, BOQ item rate analysis with statutory 7.5% VAT and 5% AIT withholding deduction calculation, and 2.5% Tender Security and 10% Performance Bank Guarantee tracking with SHA-256 seal.

---

## 5. Verification Commands
```bash
# Run unit & integration test suites
pnpm --filter @workspace/api-server run test

# Run strict TypeScript typechecking
pnpm --filter @workspace/api-server run typecheck
```
