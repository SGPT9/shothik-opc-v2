# Spec 0067: Wholesale Commodity Price Ticker & Inland LC Escrow Engine

## 1. Overview
Real-time wholesale market commodity spot price tickers across major trading hubs (Khatunganj Chittagong, Chawkbazar Dhaka, Narsingdi Textile) and Bangladesh Bank compliant Inland Letter of Credit (Inland LC) generation with escrow locking.

## 2. Acceptance Criteria
- **AC-1**: Provide real-time commodity spot prices across Rice, Palm Oil, Wheat, Cotton Yarn, Lentils, and Spices.
- **AC-2**: Compute statutory Inland LC contract terms with banking charges, inspection clearance gates, and irrevocable beneficiary clauses.
- **AC-3**: Generate cryptographic SHA-256 seal for Inland LC legal enforceability.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/wholesale/commodity-lc-engine.ts`
- Routes: `artifacts/api-server/src/routes/commodity-lc.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/commodity-lc.test.ts`
