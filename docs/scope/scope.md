# Scope: ShothikGPT Agentic OS (v2.8.0)

An agentic operating system for South Asian solo-entrepreneurs (One-Person Companies / OPCs), bridging academic intelligence, statutory compliance (NBR Mushak VAT & TDS), and mobile-first commerce (bKash/Nagad/COD, WhatsApp Business, Pathao/Steadfast logistics).

**Build approach:** Tracer Bullet (Prove end-to-end vertical slices through UI, state, API, and local persistence first).
**Workflow:** Beta (Every slice requires `/check verify` interactive confirmation and `/test` regression suite).

_These are recommendations to keep your build orderly, not requirements. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---|---|---|
| 1 | Bilingual Realtime Audio Avatar (VTuber LiveKit / WebRTC) | Foundation | done |
| 2 | Model Mesh & Sub-50ms Speculative Router | Foundation | done |
| 3 | Core Chat Shell & DeepSeek-Close Minimalist Composer | Foundation | done |
| 4 | Offline First Sync & SQLite OPFS Storage | Foundation | done |
| 5 | Bengali NLP & Banglish Intent Classifier | Foundation | done |
| 6 | Academic Studio (Thesis Defense, Paraphraser, Citation) | Core Apps | done |
| 7 | bKash & Nagad MFS Payment Gateway Integration | Commerce | done |
| 8 | Cash on Delivery (COD) & Fraud Detection Guardrail | Commerce | done |
| 9 | Pathao & Steadfast Courier Dispatch Integration | Logistics | done |
| 10 | Supervised Autonomy (Money Movement & Policy Gates) | Security | done |
| 11 | Mobile First Responsive Shell (2GB RAM Budget) | Shell | done |
| 12 | Merchant Multi-Store Sync & Catalog Manager | Commerce | done |
| 13 | Autonomous Social Media Poster & Marketing Bot | Marketing | done |
| 14 | Voice First Banglish Order Taking Assistant | Voice/AI | done |
| 15 | OCR Document & Nid Scanner for KYC Compliance | Compliance | done |
| 16 | Realtime Inventory Matrix & Stock Sync | Commerce | done |
| 17 | Customer CRM & WhatsApp Chat Ingestion | CRM | done |
| 18 | Dynamic Discount & Coupon Campaign Engine | Growth | done |
| 19 | Merchant Analytics, Profit/Loss & Cash Flow Engine | Accounting | done |
| 20 | Multi-Channel Automated Support Ticketing | Support | done |
| 21 | Micro-Loans & SME Credit Scoring Engine | Fintech | done |
| 22 | Automated Pathao / Steadfast Bulk Tracking Webhooks | Logistics | done |
| 23 | Supplier PO & Raw Materials Procurement Hub | Supply Chain | done |
| 24 | WhatsApp Interactive Catalog Builder & Cart Flow | Commerce | done |
| 25 | Automated Daily Accounting & bKash Settlement Engine | Accounting | done |
| 26 | NBR Mushak-6.3 VAT Invoice & TDS Statutory Studio | Tax & Legal | done |
| 27 | Mushak-9.1 Monthly VAT Return Aggregator | Tax & Legal | done |
| 28 | WhatsApp Commerce & Automated Merchant Agent Hub | Slice 28 | done |
| 29 | Autonomous AI Outbound Calling & COD Order Verification | Slice 29 | active |
| 30 | Cross-Border Sourcing & Customs Declaration Engine | Slice 30 | planned |

---

## Completed Foundations & Milestones (1–27)

### 1–5. Core Foundations & Native Intelligence · done
Audio avatar pipelines, sub-50ms model router, offline OPFS caching, and Banglish intent parsers.
**Done when:** Full foundation layer operates seamlessly under 2GB RAM budget with offline resiliency.
spec 0001 · code in `artifacts/api-server/src/lib/` and `artifacts/shothik/src/`

### 6–10. Academic, Payments & Courier Logistics · done
Thesis tools, bKash/Nagad checkout, Pathao/Steadfast couriers, and human-in-the-loop protection.
**Done when:** All MFS transactions and courier dispatches require supervised approval.
spec 0006 · code in `artifacts/api-server/src/routes/` and `artifacts/shothik/src/components/`

### 11–25. Commerce, CRM, Accounting & SME Financial Ops · done
Multi-store sync, CRM chat ingestion, P&L reporting, credit scoring, and automated daily reconciliations.
**Done when:** End-to-end commerce lifecycle functions from lead to daily bank settlement.
spec 0011 · code in `artifacts/api-server/src/routes/` and `artifacts/shothik/src/components/twin/`

### 26–27. NBR Statutory Tax & Mushak Studio · done
Mushak-6.3 tax invoice generation, 13-digit BIN verification, TDS withholding ledger, and Mushak-9.1 return aggregator.
**Done when:** Invoices generate with valid NBR QR verification tokens and pass all automated tax calculations.
spec 0026 · code in `artifacts/api-server/src/lib/tax/` and `artifacts/shothik/src/components/twin/MushakTaxStudioModal.tsx`

---

## Active Slices

### 28. WhatsApp Commerce & Automated Merchant Agent Hub · done
Interactive conversational catalog, two-way WhatsApp message handler, automatic Banglish order extraction, cart checkout generation, and supervised notification queue.
**Done when:** Incoming customer WhatsApp text/audio creates structured cart drafts, prompts merchant confirmation on high-value orders, and dispatches tracking updates.
- [x] Design it (spec): `/architect whatsapp commerce merchant hub`
- [x] Build it: `/develop whatsapp commerce merchant hub`
   - [x] Webhook receiver & HMAC signature validation (AC-1, AC-6)
   - [x] Banglish conversational cart & Mushak tax/delivery engine (AC-2, AC-3)
   - [x] Supervised Autonomy review for high-value orders >= ৳10,000 (AC-4)
   - [x] Frontend Twin WhatsApp Live Studio Modal with keyboard shortcut (AC-5)
- [x] Verify it: `/check verify whatsapp commerce merchant hub`
- [x] Test it: `/test whatsapp commerce merchant hub`
spec 0028 · code in `artifacts/api-server/src/routes/whatsapp.ts`, `artifacts/api-server/src/lib/commerce/whatsapp-cart-engine.ts`, and `artifacts/shothik/src/components/twin/WhatsAppCommerceModal.tsx`

### 29. Autonomous AI Outbound Calling & COD Order Verification · active
Autonomous voice agent that calls customer phone numbers in natural Bengali to verify high-risk COD orders, confirm exact delivery addresses, and filter bogus orders before dispatching to Pathao/Steadfast.
**Done when:** Automated SIP/WebRTC audio bot dials recipient phone, transcribes customer confirmation, and updates order status to `verified_for_dispatch` or `cancelled_fraud`.
- [ ] Design it (spec): `/architect ai outbound phone verification`

---

## Deferred Features

Out of scope for the current build pass, tracked for future releases:
- **Cross-Border Sourcing & Customs Declaration (Slice 30)**: AliExpress/Taobao direct import calculation with Bangladesh Customs HS codes · needs a decision · Beta
- **Multi-Tenant Franchise Management**: Multi-branch stock allocation and franchise commission split · deferred


---

## Legend

- **needs a decision**: Run `/architect` first to specify data source mapping, failure modes, and security gates.
- **Workflow Tier**: Beta (Build -> Verify -> Test).
- **Pointer line**: spec file under `docs/specs/` and code under workspace packages.
