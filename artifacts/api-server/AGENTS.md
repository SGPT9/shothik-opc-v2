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
- **Tax & Statutory Compliance (`src/lib/tax/`):** NBR Mushak-6.3 VAT calculations (0%, 5%, 7.5%, 10%, 15%), TDS withholding (2%-10%), 13-digit BIN Luhn check, Mushak-9.1 return aggregator, official printable HTML challan.
- **BTRC Telephony & Voice IVR (`src/lib/telephony/`):** Autonomous outbound calling for COD order verification, BTRC compliance window (09:00-20:00 BST), Banglish speech intent parsing, Steadfast auto-booking.
- **WhatsApp Commerce & MFS QR (`src/lib/commerce/`):** WhatsApp catalog cart session engine, multi-dialect customer assistant, instant bKash dynamic QR generation.
- **Nilkhet Commercial POD Press (`src/lib/publishing/`):** CMYK imposition calculator, paper weight/spine thickness compiler, print job ticket dispatch.
- **Second-Me Semantic Memory (`src/lib/memory/`):** Vector embeddings, episodic fact extraction, long-term memory retrieval.
- **Payment Gateways (`src/routes/payment.ts`, `src/lib/mfs/`):** bKash PGW (1.85% fee), Nagad direct checkout (1.50% fee), COD fraud risk scoring.
- **Courier Logistics (`src/routes/courier.ts`, `src/lib/courier/`):** Pathao Merchant API, Steadfast Courier live parcel consignment & tracking.
- **Model Router (`src/lib/router.ts`):** Sub-50ms speculative inference mesh, Bangla & Banglish dialect token routing.

---

## 5. Verification Commands
```bash
# Run unit & integration test suites
pnpm --filter @workspace/api-server run test

# Run strict TypeScript typechecking
pnpm --filter @workspace/api-server run typecheck
```
