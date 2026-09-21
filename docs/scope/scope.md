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
| 29 | Autonomous AI Outbound Calling & COD Order Verification | Slice 29 | done |
| 30 | Cross-Border Sourcing & Customs Declaration Engine | Slice 30 | done |
| 31 | Platform Elevators & Viral Growth Triggers | Slice 31 | done |
| 32 | Multi-Tenant Franchise & Multi-Branch Stock Allocation | Slice 32 | done |
| 33 | Autonomous Social Commerce Live-Selling & Comment Parser | Slice 33 | done |
| 34 | NBR Statutory Audit Dossier & Double-Entry Ledger | Slice 34 | done |

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

### 29. Autonomous AI Outbound Calling & COD Order Verification · done
Autonomous voice IVR bot that calls customer phone numbers in natural regional Bengali (Standard, Dhakaiya, Sylheti, Chatgaya) to verify COD orders, confirm delivery addresses, filter bogus orders, enforce BTRC calling windows (09:00–20:00 BST), and auto-book Steadfast consignments.
**Done when:** Automated telephony engine dials recipient, plays statutory disclosure, transcribes confirmation dialog, manages supervised high-value orders (>= ৳10,000), and auto-books Steadfast Courier consignment.
- [x] Design it (spec): `/architect ai outbound phone verification` (Spec 0029)
- [x] Build it: `/develop ai outbound phone verification`
   - [x] BTRC telecom window enforcement & E.164 phone normalization (AC-1, AC-5)
   - [x] 4-stage conversational state machine with Banglish intent classification (AC-2)
   - [x] Vernacular dialect synthesis & automatic Steadfast booking (AC-3, AC-4)
   - [x] Supervised Autonomy escalation for high-value COD orders (AC-6)
   - [x] Frontend Twin Outbound Calling & Verification Modal with shortcut ⌘O (AC-7)
- [x] Verify it: `/check verify ai outbound phone verification`
- [x] Test it: `/test ai outbound phone verification`
spec 0029 · code in `artifacts/api-server/src/lib/telephony/outbound-calling-engine.ts`, `artifacts/api-server/src/routes/telephony.ts`, and `artifacts/shothik/src/components/twin/OutboundCallVerificationModal.tsx`

### 30. Cross-Border Sourcing & Customs Declaration Engine · done
AliExpress/Taobao/1688 import costing engine, Bangladesh Customs Harmonized System (HS) code classification, regulatory duty (RD), supplementary duty (SD), advance income tax (AIT), and Chittagong Port clearing workflow.
**Done when:** Merchant inputs product link or HS code, receives landed cost calculation with NBR tariff breakdown, and generates C&F agent clearing brief.
- [x] Design it (spec): `/architect cross border sourcing customs` (Spec 0030)
- [x] Build it: `/develop cross border sourcing customs`
   - [x] NBR Customs Act 2023 compound duty cascade calculator (CD, RD, SD, VAT, AIT, AT) (AC-1)
   - [x] 8-digit HS Code search catalog & regulatory NOC warnings (BTRC, BSTI) (AC-2)
   - [x] Multi-currency exchange rate conversion (USD, CNY, EUR -> BDT) (AC-3)
   - [x] Certified C&F clearance brief generator (AC-4)
   - [x] Frontend Twin Cross-Border Customs Studio with keyboard shortcut ⌘U (AC-5)
- [x] Verify it: `/check verify cross border sourcing customs`
- [x] Test it: `/test cross border sourcing customs`
spec 0030 · code in `artifacts/api-server/src/lib/customs/cross-border-engine.ts`, `artifacts/api-server/src/routes/customs.ts`, and `artifacts/shothik/src/components/twin/CrossBorderCustomsModal.tsx`

### 31. Platform Elevators & Viral Growth Triggers · done
Product-Led Growth (PLG) mechanics for One-Person Companies: 4-tier operational elevator (Rookie Solopreneur -> Rising OPC -> Power Merchant -> Enterprise Franchise), composite Merchant Health Index (MHI), viral watermarked Mushak-6.3 digital receipts, bKash cashback referral ledger, verifiable COD trust badges, and 1688 group-sourcing cohorts.
**Done when:** Engine computes MHI score and unlocks tier powers, generates referral ledger with cashback tracking, and facilitates group import cohorts.
- [x] Design it (spec): `/architect platform elevators viral triggers` (Spec 0031)
- [x] Build it: `/develop platform elevators viral triggers`
   - [x] Deterministic MHI calculation & 4-tier elevator engine (AC-1, AC-2)
   - [x] Referral cashback ledger & viral receipt watermark generator (AC-3)
   - [x] 1688 group-sourcing cohort pool manager (AC-4)
   - [x] Express API routes mounted under `/api/v1/growth/` (AC-1, AC-3, AC-4)
   - [x] Frontend Twin Platform Elevators & Viral Growth Modal with shortcut ⌘G (AC-5)
- [x] Verify it: `/check verify platform elevators viral triggers`
- [x] Test it: `/test platform elevators viral triggers`
spec 0031 · code in `artifacts/api-server/src/lib/growth/`, `artifacts/api-server/src/routes/growth.ts`, and `artifacts/shothik/src/components/twin/PlatformElevatorsViralModal.tsx`

### 32. Multi-Tenant Franchise & Multi-Branch Stock Allocation · done
Multi-branch stock allocation, 3-way commission waterfall splitting (COGS replenishment + master royalty + franchisee margin), atomic inter-branch stock transfers (IBST) with courier tracking and 6-digit OTP reception handshake, and decentralized bKash sub-merchant settlement.
**Done when:** Merchant creates franchise nodes, tracks inter-branch stock movements with OTP verification, and automates bKash sub-merchant royalty disbursements.
spec 0032 · code in `artifacts/api-server/src/lib/franchise/`, `artifacts/api-server/src/routes/franchise.ts`, and `artifacts/shothik/src/components/twin/FranchiseMultiBranchModal.tsx`

### 33. Autonomous Social Commerce Live-Selling & Comment Parser · done
Real-time high-velocity comment parsing (Banglish/Bengali), 15-minute temporary inventory locks to prevent live overselling, instant 1-tap bKash PGW dynamic payment links, COD draft booking, and automated 9:16 TikTok/Reels vertical promo video generator.
**Done when:** Live broadcast stream captures and drafts customer orders from comments with >90% precision and enforces 15-minute TTL stock reservation.
spec 0033 · code in `artifacts/api-server/src/lib/live-selling/`, `artifacts/api-server/src/routes/live-selling.ts`, and `artifacts/shothik/src/components/twin/LiveSellingStudioModal.tsx`

### 34. NBR Statutory Audit Dossier & Double-Entry Ledger · done
Mathematical double-entry general ledger with 6 standard Chart of Accounts categories, real-time Trial Balance balancing proof, and cryptographically sealed NBR Statutory Audit Dossier generator with 13-digit BIN validation and SHA-256 seal.
**Done when:** Journal entries enforce debit/credit equilibrium invariant, trial balance computes live, and NBR compliance dossier compiles with cryptographic verification seal.
spec 0034 · code in `artifacts/api-server/src/lib/audit/`, `artifacts/api-server/src/routes/audit-ledger.ts`, and `artifacts/shothik/src/components/twin/AuditLedgerStudioModal.tsx`

### 35. Autonomous Courier Fleet Arbitrage & Micro-Hub Dispatcher · done
Dynamic 4-carrier logistics arbitrage (Steadfast vs. Pathao vs. RedX vs. Paperfly) optimizing across 64 Bangladesh districts, composite delivery scoring ($w_{\text{dsr}}=0.50$, $w_{\text{cost}}=0.30$, $w_{\text{speed}}=0.20$), 1-click booking, barcode generation, and AI RTO risk mitigation.
**Done when:** 4-carrier rate cards dynamically evaluate parcel destination and COD value, pick the optimal provider, register consignments with tracking code and barcode, and flag RTO risks.
spec 0035 · code in `artifacts/api-server/src/lib/logistics/courier-arbitrage-engine.ts`, `artifacts/api-server/src/routes/courier-arbitrage.ts`, and `artifacts/shothik/src/components/twin/CourierArbitrageModal.tsx`

---

## Deferred Features

Out of scope for the current build pass, tracked for future releases:
- **Autonomous Drone Fleet Dispatch**: Hyperlocal drone delivery coordination · deferred
- **Decentralized Agro-Supply Chain**: Farm-to-table cold chain RFID tracking · deferred


---

## Legend

- **needs a decision**: Run `/architect` first to specify data source mapping, failure modes, and security gates.
- **Workflow Tier**: Beta (Build -> Verify -> Test).
- **Pointer line**: spec file under `docs/specs/` and code under workspace packages.
