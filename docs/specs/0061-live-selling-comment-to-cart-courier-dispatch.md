# Spec 0061: Autonomous Live Selling Comment-to-Cart & Courier Dispatch Engine

## 1. Overview
Real-time Banglish intent extraction from social video broadcasts (Facebook Live, TikTok Live), automated SKU reservation with 15-minute TTL locks, customer phone validation, and automated Steadfast/Pathao courier booking pipeline with SHA-256 state seals.

## 2. Acceptance Criteria
- **AC-1**: Parse unstructured Bengali/Banglish comments (e.g. `ami red dress ta nibo 01712345678 Dhanmondi`) into structured cart intents (`sku`, `quantity`, `phone`, `address`).
- **AC-2**: Enforce 15-minute temporary inventory reservation to prevent overselling during high-velocity live streams.
- **AC-3**: Automatically calculate delivery charge based on district and book Steadfast/Pathao courier consignment.
- **AC-4**: Compute cryptographic SHA-256 seal for the generated order state.
- **AC-5**: Return itemized summary and dynamic bKash PGW payment link for instant checkout.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/live-selling/live-selling-engine.ts`
- Routes: `artifacts/api-server/src/routes/live-selling.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/live-selling.test.ts`
