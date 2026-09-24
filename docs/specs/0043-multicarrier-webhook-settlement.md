# SPEC-0043: Autonomous Multi-Carrier Inbound Webhook Dispatcher & Real-Time Double-Entry Settlement Reconciler

## 1. Context & Motivation
In South Asian / Bangladeshi e-commerce and micro-manufacturing, Cash-On-Delivery (COD) accounts for 75%+ of retail parcel movements. Merchants manage multiple logistics partners (Steadfast, Pathao Courier, RedX, Paperfly). Courier platforms emit inbound webhooks as parcels transition through statuses (`in_transit`, `delivered`, `partial_delivered`, `cancelled`, `return_in_transit`, `returned`, `settled`).

Managing these webhooks manually or through fragmented scripts leads to:
1. Delayed order status updates causing customer anxiety and duplicate dispatch attempts.
2. Financial reconciliation leakages where courier companies deduct arbitrary COD commissions (0.5% - 1.5%), return charges, or weight discrepancy penalties without matching general ledger audit trails.
3. Unverified bank transfers where lump-sum courier disbursement amounts do not reconcile against individual delivery consignment invoices.

This engine provides a carrier-agnostic webhook ingestor, cryptographic HMAC validator, state transition state machine, and real-time automated double-entry accounting ledger poster.

---

## 2. Core Architecture

```
                                  [ Steadfast / Pathao / RedX / Paperfly ]
                                                    │
                                        (Inbound HTTP Webhook)
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │    CarrierWebhookEngine (Ingestion Gate)     │
                             │  - HMAC-SHA256 & API-Token Auth Check       │
                             │  - Nonce / Timestamp Replay Protection       │
                             │  - Idempotent Event Deduplication (UUIDv5)   │
                             └──────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │       Carrier Canonical State Normalizer     │
                             │  - Maps vendor status to standard lifecycle │
                             │  - Calculates SLA deltas & transit latency   │
                             │  - Evaluates Return Risk & Customer Score    │
                             └──────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │    Autonomous Double-Entry GL Ledger Engine   │
                             │  - Debit/Credit Courier COD Clearing         │
                             │  - Recognize Delivery & COD Commission Exp.  │
                             │  - Discrepancy & Underpayment Variance Alarm │
                             └──────────────────────────────────────────────┘
```

---

## 3. Acceptance Criteria

- **AC-1: Multi-Carrier Payload Normalization**: Ingest webhook payloads from Steadfast, Pathao, RedX, and Paperfly into a unified `NormalizedCarrierEvent` format (`consignmentId`, `orderId`, `carrier`, `status`, `collectedAmount`, `deliveryFee`, `codFee`, `returnFee`, `timestamp`, `metadata`).
- **AC-2: Cryptographic Security & Idempotency**: Validate inbound webhooks with carrier-specific shared secret signatures or bearer tokens. Prevent duplicate processing via deterministic event hashing.
- **AC-3: Double-Entry General Ledger Automation**:
  - `delivered`: Debit `Accounts Receivable: Courier COD`, Credit `Order Revenue / Customer Receivable`.
  - `settled`: Debit `Bank Account / Cash Float`, Debit `Delivery Expense`, Debit `COD Commission Expense`, Credit `Accounts Receivable: Courier COD`.
  - `returned`: Debit `Inventory In-Transit/Restock`, Debit `Return Penalty Expense`, Credit `Accounts Receivable: Pending Consignment`.
- **AC-4: COD Variance & Underpayment Audit**: Detect discrepancies where courier disbursements differ from expected invoice collections by $> 0.5\%$, highlighting unapproved weight surcharges or rate tier jumps.
- **AC-5: SLA & High-Risk Postal Radar**: Flag consignments exceeding 72h (intra-city) or 120h (inter-district) SLAs, and compute return-rate risk scores by geographic delivery hub (e.g. Chittagong, Sylhet, Bogura).
- **AC-6: Twin Webhook & Settlement Studio Modal**: Interactive frontend Twin modal accessible via `⌘W`, featuring live webhook event telemetry, settlement ledger balance cards, real-time dispute letter generator, and one-click webhook test simulator.

---

## 4. API Endpoints
- `POST /api/v1/carrier-webhooks/ingest/:carrier`: Ingest and process carrier webhook.
- `GET /api/v1/carrier-webhooks/reconciliation-summary`: Retrieve overall COD collected, pending payout, settlement fees, and ledger health.
- `GET /api/v1/carrier-webhooks/events`: List normalized carrier events with filtering.
- `POST /api/v1/carrier-webhooks/simulate`: Simulate mock courier webhook for test & verification.
- `GET /api/v1/carrier-webhooks/disputes`: List detected courier deduction variances and auto-drafted dispute claims.

---

## 5. Verification Plan
- Unit & integration tests in `artifacts/api-server/src/routes/__tests__/carrier-webhooks.test.ts`.
- Frontend Twin modal unit tests in `artifacts/shothik/src/components/twin/__tests__/MultiCarrierWebhookModal.test.tsx`.
- 100% assertion pass with zero unhandled rejections or broken routes.
