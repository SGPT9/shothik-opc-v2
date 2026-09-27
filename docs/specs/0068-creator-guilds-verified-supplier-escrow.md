# Spec 0068: Hyperlocal Creator Guilds & Verified Supplier Escrow Radar

## 1. Overview
Regional vertical creator guilds (Dhaka Garments, Chittagong Gadgets, BoiMela Writers) with collective purchasing volume pools and trust-scored verified supplier escrow badges.

## 2. Acceptance Criteria
- **AC-1**: Manage creator guilds across Dhaka, Chittagong, Sylhet, and Bogra with collective order pooling.
- **AC-2**: Score verified suppliers based on fulfillment history, physical factory inspection, and escrow reliability rating.
- **AC-3**: Compute collective bargaining discounts when pool volume reaches target batch sizes.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/community/creator-guilds-engine.ts`
- Routes: `artifacts/api-server/src/routes/creator-guilds.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/creator-guilds.test.ts`
