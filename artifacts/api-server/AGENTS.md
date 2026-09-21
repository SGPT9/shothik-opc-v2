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

---

## 5. Verification Commands
```bash
# Run unit & integration test suites
pnpm --filter @workspace/api-server run test

# Run strict TypeScript typechecking
pnpm --filter @workspace/api-server run typecheck
```
