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
| 35 | Autonomous Courier Fleet Arbitrage & Micro-Hub Dispatcher | Slice 35 | done |
| 36 | Autonomous Freelancer Remittance & Bangladesh Bank ICT Incentive Ledger | Slice 36 | done |
| 37 | Autonomous Hyperlocal Dark Store & Micro-Fulfillment Dark Hub Orchestrator | Slice 37 | done |
| 38 | Autonomous Multi-Channel Cashflow & COD Settlement Reconciler | Slice 38 | done |
| 39 | Autonomous Wholesale Supplier RFQ & B2B Escrow Negotiation Engine | Slice 39 | done |
| 40 | Autonomous Agri-Commodity Sourcing & Wholesale Mandi Price Radar | Slice 40 | done |
| 41 | Autonomous Micro-Franchise Field Agent POS & Offline Bluetooth Thermal Print Engine | Slice 41 | done |
| 43 | Autonomous Multi-Carrier Inbound Webhook Dispatcher & Real-Time Double-Entry Settlement Reconciler | Slice 43 | done |
| 44 | Autonomous Cross-Border Export Manifest, ERC Validator & Bangladesh Bank Form-EXP Compiler | Slice 44 | done |
| 45 | Autonomous Cross-Border FX Hedging, CIRP Arbitrage & Forward Contract Rate-Lock Engine | Slice 45 | done |
| 46 | Autonomous SME Payroll Tax, Surcharge & Provident Fund Statutory Compliance Engine | Slice 46 | done |
| 47 | Autonomous Corporate Income Tax, NBR Form-82C Minimum Tax & Mushak-9.1 e-Return Reconciler | Slice 47 | done |
| 48 | Autonomous B2B Invoice Factoring, Bill Discounting & Islamic Murabaha Cash Advance Engine | Slice 48 | done |
| 49 | Autonomous B2B Trade Credit Insurance, NI Act 138 Cheque Default & Debt Recovery Engine | Slice 49 | done |
| 50 | Autonomous Vernacular Voice Commerce, WebRTC Banglish Agent & 1-Click MFS Voice Checkout Engine | Slice 50 | done |
| 51 | Autonomous AI Legal Contract Generator & Stamp Duty Act 1899 Compliance Engine | Slice 51 | done |
| 52 | Autonomous NBR Customs Duty Drawback & Duty-Exemption Certificate (DEC) Engine | Slice 52 | done |
| 53 | Autonomous Halal Certification & Islamic Shariah Governance Engine | Slice 53 | done |
| 54 | Autonomous Micro-Merchant B2B Collective Buying & Bulk Freight Pooling Engine | Slice 54 | done |
| 55 | Autonomous AI B2B Tender & Government e-GP Bid Generator & CPTU Compliance Engine | Slice 55 | done |
| 56 | OpenMuse Agentic Compute, Persistent Browser Takeover & CAS Leased Task Orchestration Engine | Slice 56 | done |
| 57 | Autonomous HS Code Classification, Customs Tariff & Cross-Border Commercial Invoice Engine | Slice 57 | done |
| 58 | Autonomous Multi-Channel Inventory Matrix, Stock-Out Prediction & Micro-Warehousing Engine | Slice 58 | queued |

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

### 36. Autonomous Freelancer Remittance & Bangladesh Bank ICT Incentive Ledger · done
Inward remittance calculation and reconciliation across Wise, Payoneer, Swift Wire, Upwork, and Fiverr, automated 4% to 10% statutory cash subsidy/export incentive computation under Bangladesh Bank FE Circular 02/2024, Form-C Foreign Exchange declaration generation, Proceeds Realization Certificate (PRC) matching, and bilingual international milestone escrow service contract generation with SHA-256 seal.
**Done when:** Foreign inward remittances calculate exact BDT realization and statutory government subsidies, compile compliant Form-C declarations, reconcile bank PRCs, and emit signed milestone escrow agreements.
spec 0036 · code in `artifacts/api-server/src/lib/remittance/freelancer-incentive-engine.ts`, `artifacts/api-server/src/routes/remittance-incentive.ts`, and `artifacts/shothik/src/components/twin/FreelancerRemittanceModal.tsx`

### 37. Autonomous Hyperlocal Dark Store & Micro-Fulfillment Dark Hub Orchestrator · done
Multi-hub micro-fulfillment network (Dhaka Dhanmondi, Uttara, Mirpur, Gulshan/Badda, Old Dhaka + Chittagong GEC & Sylhet Zindabazar), geofenced thana order routing with FEFO lot allocation, S-curve 3D bin pick-path optimizer, batch/perishable expiry markdown radar, and velocity-driven inter-hub stock rebalancing from Central Mega-Hub.
**Done when:** Customer delivery thana routes to nearest dark store with FEFO lot allocation, S-curve serpentine pick list generates walking paths, expiry radar triggers liquidation discounts, and inter-hub transfers rebalance depleted micro-hubs.
spec 0037 · code in `artifacts/api-server/src/lib/fulfillment/dark-hub-engine.ts`, `artifacts/api-server/src/routes/fulfillment.ts`, and `artifacts/shothik/src/components/twin/DarkHubFulfillmentModal.tsx`

### 38. Autonomous Multi-Channel Cashflow & COD Settlement Reconciler · done
Unified liquid capital consolidation across Bank, bKash Merchant, Nagad Sheba, Pathao & Steadfast in-transit COD, multi-courier payout remittance batch reconciliation with automated 1% COD fee + freight + RTO penalty deductions, true unit economics daily PnL waterfall with return loss absorption, carrier shortage discrepancy auditor & dispute brief generator, and 30-day working capital runway burn trajectory predictor.
**Done when:** Multi-channel liquid balances consolidate live, carrier settlement manifests reconcile against ERP shipments with discrepancy detection, true daily PnL accounts for return courier losses, and working capital runway predicts cash health.
spec 0038 · code in `artifacts/api-server/src/lib/cashflow/cashflow-reconciler-engine.ts`, `artifacts/api-server/src/routes/cashflow.ts`, and `artifacts/shothik/src/components/twin/MultiChannelCashflowModal.tsx`

### 39. Autonomous Wholesale Supplier RFQ & B2B Escrow Negotiation Engine · done
B2B raw material and wholesale finished goods sourcing from key commercial hubs (Chawkbazar, Islampur, Keraniganj, Tongi Industrial Zone, and 1688/Yiwu cross-border imports), automated Request for Quotation (RFQ) generator with tiered volume discount curves ($Q \ge 500, 1000, 5000$), supplier reliability index scoring, LC/milestone escrow term compiler, and delivery SLA enforcement.
**Done when:** Merchant generates structured B2B RFQs with tiered volume pricing, evaluates supplier bids with quality/lead-time weighting, compiles enforceable milestone escrow agreements, and tracks wholesale shipment commitments.
spec 0039 · code in `artifacts/api-server/src/lib/wholesale/wholesale-rfq-escrow-engine.ts`, `artifacts/api-server/src/routes/wholesale.ts`, and `artifacts/shothik/src/components/twin/WholesaleRfqEscrowModal.tsx`

### 40. Autonomous Agri-Commodity Sourcing & Wholesale Mandi Price Radar · done
Live wholesale price discovery across major Bangladeshi commodity trading hubs (Khatunganj Chittagong, Badamtoli Fruit Market Dhaka, Karwan Bazar Wholesale Arat, Bogra Spice Yard & Rajshahi Fruit Belt), seasonal harvest price fluctuation predictor, cold chain temperature-monitored refrigerated transport dispatch scheduler, and instant farmer micro-advance payout via bKash/Nagad MFS.
**Done when:** Merchant tracks real-time mandi spot prices vs. 7-day moving averages, calculates moisture/spoilage shrinkage buffers, books Reefer cold-chain transport, and disburses farmer harvesting advances via automated MFS payroll.
spec 0040 · code in `artifacts/api-server/src/lib/agri/agri-commodity-radar-engine.ts`, `artifacts/api-server/src/routes/agri.ts`, and `artifacts/shothik/src/components/twin/AgriMandiRadarModal.tsx`

### 41. Autonomous Micro-Franchise Field Agent POS & Offline Bluetooth Thermal Print Engine · done
Offline-first mobile POS for rural field sales agents and roadside pop-ups: local CRDT SQLite transaction sync, raw 58mm/80mm ESC/POS thermal receipt bytecode generation over Web Bluetooth, dynamic bKash/Nagad static+dynamic merchant QR invoice generator, and field float replenishment reconciler.
**Done when:** Field agent registers offline sales, prints bilingual Bengali/English ESC/POS thermal receipts over Bluetooth, generates dynamic payment QR codes, and syncs queued transactions on network reconnection.
- [x] Design it (spec): `/architect micro-franchise field agent pos` (Spec 0041)
- [x] Build it: `/develop micro-franchise field agent pos`
   - [x] POS catalog, cart VAT calculation & offline CRDT queue (AC-1)
   - [x] Raw ESC/POS 58mm/80mm bytecode generator with control codes & NBR seal (AC-2)
   - [x] Dynamic bKash & Nagad EMVCo QR code payload compiler (AC-3)
   - [x] Batch transaction sync with conflict resolution & duplicate detection (AC-4)
   - [x] End-of-day cash float reconciliation & supervisor sign-off hash (AC-5)
   - [x] Frontend Twin Field Agent POS Studio Modal with keyboard shortcut ⌘P (AC-6)
- [x] Verify it: `/check verify micro-franchise field agent pos`
- [x] Test it: `/test micro-franchise field agent pos`
spec 0041 · code in `artifacts/api-server/src/lib/pos/field-agent-pos-engine.ts`, `artifacts/api-server/src/routes/pos.ts`, and `artifacts/shothik/src/components/twin/FieldAgentPosModal.tsx`

### 42. Autonomous NBR Mushak-4.3 Input-Output Coefficient Declarator & Factory Costing Engine · done
Statutory manufacturing input-output coefficient declaration (Mushak-4.3 / মূসক-৪.৩) under Value Added Tax and Supplementary Duty Act 2012: raw material Bill of Materials (BOM) decomposition, standard wastage percentages, direct labor & packaging overhead amortization, NBR Divisional VAT Office submission packet compiler, and automated production batch COGS variance auditor.
**Done when:** Manufacturer or food processor declares input-output coefficients, calculates exact raw material consumption ratios per unit of finished product, and compiles compliant Mushak-4.3 declaration forms with cryptographic verification seal.
- [x] Design it (spec): `/architect nbr mushak 4.3 factory costing` (Spec 0042)
- [x] Build it: `/develop nbr mushak 4.3 factory costing`
   - [x] Bill of Materials (BOM) decomposition & gross/net wastage calculation (AC-1)
   - [x] Direct labor & overhead allocation per unit of supply (AC-2)
   - [x] Statutory value addition percentage calculator under VAT Act 2012 (AC-3)
   - [x] 7.5% input price fluctuation refiling trigger & variance auditor (AC-4)
   - [x] Official NBR Mushak-4.3 tabular form compiler with verification seal (AC-5)
   - [x] Frontend Twin Mushak-4.3 Studio Modal with keyboard shortcut ⌘4 (AC-6)
- [x] Verify it: `/check verify nbr mushak 4.3 factory costing`
- [x] Test it: `/test nbr mushak 4.3 factory costing`
spec 0042 · code in `artifacts/api-server/src/lib/mushak43/mushak43-engine.ts`, `artifacts/api-server/src/routes/mushak43.ts`, and `artifacts/shothik/src/components/twin/Mushak43DeclarationModal.tsx`

### 43. Autonomous Multi-Carrier Inbound Webhook Dispatcher & Real-Time Double-Entry Settlement Reconciler · done
Carrier-agnostic inbound webhook normalizer and automated general ledger reconciler for Steadfast, Pathao, RedX, and Paperfly: cryptographic signature validation, delivery lifecycle state machine, real-time double-entry GL ledger journal postings (COD clearing, freight fees, 1% handling commission), underpayment variance detector, and automated bilingual dispute letter compiler.
**Done when:** Logistics webhooks from Steadfast, Pathao, RedX, and Paperfly are ingested in real-time, automatically balanced in the double-entry general ledger, and flagged for underpayment disputes with instant Bangla/English claim letters.
- [x] Design it (spec): `/architect multicarrier webhook settlement` (Spec 0043)
- [x] Build it: `/develop multicarrier webhook settlement`
   - [x] Unified carrier payload normalization for Steadfast, Pathao, RedX & Paperfly (AC-1)
   - [x] Cryptographic HMAC-SHA256 signature verification & deduplication (AC-2)
   - [x] Automated double-entry GL journal posting engine for delivery, return & settlement (AC-3)
   - [x] COD disbursement variance detector & fee surcharge auditor (AC-4)
   - [x] Real-time SLA breach radar & geographic high-risk return rate analyzer (AC-5)
   - [x] Frontend Twin Webhook & Settlement Studio Modal with keyboard shortcut ⌘W (AC-6)
- [x] Verify it: `/check verify multicarrier webhook settlement`
- [x] Test it: `/test multicarrier webhook settlement`
spec 0043 · code in `artifacts/api-server/src/lib/logistics/multi-carrier-webhook-engine.ts`, `artifacts/api-server/src/routes/carrier-webhooks.ts`, and `artifacts/shothik/src/components/twin/MultiCarrierWebhookModal.tsx`

### 44. Autonomous Cross-Border Export Manifest & Form-EXP / BB ERC Compliance Engine · done
Bangladesh Bank Foreign Exchange Regulation Act (FERA) export compliance automation: NBR ASYCUDA World export manifest generator, automated Form-EXP filing compiler, Export Registration Certificate (ERC) statutory validator, LC/CAD payment milestone auditor, and international freight forwarder BL/AWB reconciliation.
**Done when:** Exporter or merchant compiles compliant Form-EXP packets, cross-verifies HS codes with NBR ASYCUDA export tariffs, tracks Letter of Credit (LC) milestones, and reconciles foreign exchange inward realizations against outward export manifests.
- [x] Design it (spec): `/architect cross border export form exp` (Spec 0044)
- [x] Build it: `/develop cross border export form exp`
   - [x] Bangladesh Bank Online Form-EXP compiler & NBR ASYCUDA World manifest (AC-1)
   - [x] 10-digit ERC & 13-digit BIN statutory entity validator with CCI&E standing (AC-2)
   - [x] Letter of Credit (LC) & CAD milestone tracker with inward SWIFT reconciliation (AC-3)
   - [x] 120-Day FERA foreign exchange repatriation countdown & extension petition generator (AC-4)
   - [x] Inward Proceeds Realization Certificate (PRC) & export cash subsidy accrual (AC-5)
   - [x] Frontend Twin Export Compliance Studio Modal with keyboard shortcut ⌘E (AC-6)
- [x] Verify it: `/check verify cross border export form exp`
- [x] Test it: `/test cross border export form exp`
spec 0044 · code in `artifacts/api-server/src/lib/export/export-compliance-engine.ts`, `artifacts/api-server/src/routes/export-compliance.ts`, and `artifacts/shothik/src/components/twin/ExportComplianceModal.tsx`

### 45. Autonomous Cross-Border FX Hedging & Forward Rate Lock Engine · done
Bangladesh Bank Authorized Dealer forward foreign currency hedging and exchange rate risk management: USD/BDT spot vs forward arbitrage rate predictor, Interest Rate Parity (IRP) premium calculator, 30/60/90-day forward contract booking packet compiler, and automated export receivables downside hedge generator.
**Done when:** Exporter locks forward foreign exchange rates, amortizes forward booking premiums, and protects cross-border turnover against currency devaluations.
- [x] Design it (spec): `/architect cross border fx hedging forward lock` (Spec 0045)
- [x] Build it: `/develop cross border fx hedging forward lock`
   - [x] Dynamic CIRP forward curve model for 30/60/90/180-day tenors (AC-1)
   - [x] Form-EXP linked forward contract booking engine with 5% margin lien (AC-2)
   - [x] Real-time daily Mark-to-Market (MTM) unrealized gain/loss auditor (AC-3)
   - [x] Inward SWIFT remittance settlement & collateral lien release engine (AC-4)
   - [x] Export portfolio hedge ratio & weighted average rate ledger (AC-5)
   - [x] Frontend Twin FX Hedging Studio Modal with keyboard shortcut ⌘X (AC-6)
- [x] Verify it: `/check verify cross border fx hedging forward lock`
- [x] Test it: `/test cross border fx hedging forward lock`
spec 0045 · code in `artifacts/api-server/src/lib/hedging/fx-hedging-engine.ts`, `artifacts/api-server/src/routes/fx-hedging.ts`, and `artifacts/shothik/src/components/twin/FxHedgingModal.tsx`

### 46. Autonomous SME Payroll Tax & Statutory Provident Fund / Gratuity Ledger Engine · done
Bangladesh Income Tax Act 2023 individual progressive tax calculator (0%-25% tax slabs, gender rebates), statutory Provident Fund (PF) & Gratuity liability amortization, direct salary disbursement via bKash/Nagad MFS Payroll API and BEFTN/NPSB, and automated monthly NBR salary withholding tax deduction return compiler.
- [x] Build it: `/develop sme payroll tax provident fund`
   - [x] NBR Income Tax Act 2023 progressive slabs (0%, 5%, 10%, 15%, 20%, 25%) with gender/senior/freedom fighter exemptions (AC-1)
   - [x] Statutory 1/3rd gross or ৳4,50,000 max standard tax exemption ceiling (AC-2)
   - [x] Labour Act 2006 compliant Recognized Provident Fund (RPF) 10% matching trustee ledger (AC-3)
   - [x] Monthly Gratuity reserve amortization engine (AC-4)
   - [x] Direct MFS (bKash/Nagad) and BEFTN/NPSB disbursement batch generator with verification hashes (AC-5)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘Y (AC-6)
- [x] Verify it: `/check verify sme payroll tax provident fund`
- [x] Test it: `/test sme payroll tax provident fund`
spec 0046 · code in `artifacts/api-server/src/lib/payroll/`, `artifacts/api-server/src/routes/payroll.ts`, and `artifacts/shothik/src/components/twin/PayrollTaxModal.tsx`

### 47. Autonomous Corporate Income Tax (NBR Form 82C / Minimum Tax) & VAT Sub-Form 9.1 AIT Reconciliation Engine · done
Automated corporate income tax calculator under Bangladesh Income Tax Act 2023 (27.5% non-listed / 22.5% OPC/SME rate vs Section 163/82C 0.6% gross turnover minimum tax floor), Advance Income Tax (AIT) Section 120 credit ledger, VAT Mushak-9.1 input-output adjustment reconciler, and NBR e-Return XML/JSON compiler.
- [x] Build it: `/develop corporate income tax nbr form 82c ait mushak 9.1`
   - [x] Corporate Tax Slabs for Non-listed (27.5%/25%), OPC (22.5%/20%), ITES (0%), and RMG/Textile (12%/10%) (AC-1)
   - [x] Section 163 / 82C Gross Turnover 0.6% minimum tax floor auditor (AC-2)
   - [x] Advance Income Tax (AIT) Section 120/86/89/123 withholding credit vault (AC-3)
   - [x] VAT Mushak-9.1 Input Tax Credit (ITC) & VDS increasing/decreasing adjustment reconciler (AC-4)
   - [x] Statutory e-Return XML/JSON compiler for NBR e-Return company portal (AC-5)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘9 (AC-6)
- [x] Verify it: `/check verify corporate income tax nbr form 82c ait mushak 9.1`
- [x] Test it: `/test corporate income tax nbr form 82c ait mushak 9.1`
spec 0047 · code in `artifacts/api-server/src/lib/corporate-tax/`, `artifacts/api-server/src/routes/corporate-tax.ts`, and `artifacts/shothik/src/components/twin/CorporateTaxModal.tsx`

### 48. Autonomous B2B Invoice Factoring, Bill Discounting & Islamic Murabaha Cash Advance Engine · done
Automated B2B receivables discounting for MSMEs supplying enterprise conglomerates, Mushak-6.3 e-Invoice OCR verification, dual conventional discounting (SMART reference rate + spread) & Shariah-compliant Murabaha markup mode, debtor creditworthiness scoring, and instant working capital disbursement via corporate MFS/BEFTN.
- [x] Build it: `/develop b2b invoice factoring bill discounting islamic murabaha`
   - [x] Enterprise Debtor Creditworthiness Scoring Matrix (Tier 1 AAA, Tier 2 A+, Tier 3 BBB) (AC-1)
   - [x] Dual Pricing Simulator (Conventional SMART 11.5% + spread vs Shariah Murabaha cost-plus markup) (AC-2)
   - [x] Irrevocable Receivables Escrow Lien & Automated Buyer Settlement Reconciler (AC-3)
   - [x] Instant Advance Disbursal via bKash Corporate / Nagad Enterprise / BEFTN (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘I (AC-5)
- [x] Verify it: `/check verify b2b invoice factoring bill discounting islamic murabaha`
- [x] Test it: `/test b2b invoice factoring bill discounting islamic murabaha`
spec 0048 · code in `artifacts/api-server/src/lib/factoring/`, `artifacts/api-server/src/routes/invoice-factoring.ts`, and `artifacts/shothik/src/components/twin/InvoiceFactoringModal.tsx`

### 49. Autonomous B2B Trade Credit Insurance, NI Act 138 Cheque Default & Debt Recovery Engine · done
Underwriting engine for trade credit insurance (90% non-payment indemnity for supply contracts), Negotiable Instruments Act 1881 Section 138 statutory dishonored cheque legal notice compiler, Artha Rin Adalat court dossier builder, and automated corporate debtor CIB delinquency reporting.
- [x] Build it: `/develop b2b trade credit insurance debt recovery ni act 138`
   - [x] Trade Credit Insurance Policy underwriter with 90% default indemnity bonding (AC-1)
   - [x] Dishonored Cheque Logger & 30-Day Statutory Limitation Clock (AC-2)
   - [x] Bilingual Section 138 Statutory Legal Notice Generator (Bangla & English) (AC-3)
   - [x] Instant Insurance Claim Indemnity Disbursal Engine (AC-4)
   - [x] Artha Rin Adalat court evidence dossier & CIB delinquency exporter (AC-5)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘R (AC-6)
- [x] Verify it: `/check verify b2b trade credit insurance debt recovery ni act 138`
- [x] Test it: `/test b2b trade credit insurance debt recovery ni act 138`
spec 0049 · code in `artifacts/api-server/src/lib/recovery/`, `artifacts/api-server/src/routes/debt-recovery.ts`, and `artifacts/shothik/src/components/twin/DebtRecoveryModal.tsx`

### 50. Autonomous Vernacular Voice Commerce, WebRTC Banglish Agent & 1-Click MFS Voice Checkout Engine · done
Real-time WebRTC audio duplex stream, sub-150ms Banglish speech-to-intent engine, regional dialect phonetics (Sylheti, Chittagonian, Noakhali), automated voice-based COD address verification, and instant dynamic bKash/Nagad 1-click payment link SMS dispatch.
- [x] Build it: `/develop vernacular voice commerce webrtc banglish agent`
   - [x] Sub-150ms Hybrid Banglish Speech-to-Intent Engine with entity slot extraction (AC-1)
   - [x] Regional Dialect Phonetic Adaptation (Sylheti, Chittagonian, Noakhali, Standard) (AC-2)
   - [x] Delivery fee & dynamic 1-click bKash/Nagad payment link generator (AC-3)
   - [x] Automated SMS Payment Gateway Dispatcher (AC-4)
   - [x] Steadfast/Pathao Courier Consignment generator from spoken addresses (AC-5)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘V (AC-6)
- [x] Verify it: `/check verify vernacular voice commerce webrtc banglish agent`
- [x] Test it: `/test vernacular voice commerce webrtc banglish agent`
spec 0050 · code in `artifacts/api-server/src/lib/voice-commerce/`, `artifacts/api-server/src/routes/voice-commerce.ts`, and `artifacts/shothik/src/components/twin/VoiceCommerceModal.tsx`

### 51. Autonomous AI Legal Contract Generator & Stamp Duty Act 1899 Compliance Engine · done
Bilingual legal contract generator complying with Contract Act 1872 & Stamp Act 1899, Non-Judicial E-Stamp Duty calculator (৳300, ৳500, ৳1000, ৳2000 slabs), bilateral e-Signatures under ICT Act 2006, and SHA-256 verification seal.
- [x] Build it: `/develop ai legal contract stamp duty compliance`
   - [x] Statutory Template Repository (Vendor, Lease, NDA, Vesting, Freelancer) (AC-1)
   - [x] Non-Judicial E-Stamp Duty Calculator under Stamp Act 1899 Schedule 1 (AC-2)
   - [x] Dual-Party Digital Signature & SHA-256 Cryptographic Audit Seal (AC-3)
   - [x] Bilingual Contract Exporter (Bangla & English) (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘L (AC-5)
- [x] Verify it: `/check verify ai legal contract stamp duty compliance`
- [x] Test it: `/test ai legal contract stamp duty compliance`
spec 0051 · code in `artifacts/api-server/src/lib/contracts/`, `artifacts/api-server/src/routes/legal-contracts.ts`, and `artifacts/shothik/src/components/twin/LegalContractsModal.tsx`

### 52. Autonomous NBR Customs Duty Drawback & Duty-Exemption Certificate (DEC) Engine · done
Automated export manufacturing duty drawback claims under Customs Act 2023 Sections 33 & 34, 8-digit HS Code input-output tariff calculator (CD 5%-25%, RD 3%, SD 20%-100%, VAT 15%), ASYCUDA World import Bill of Entry (B/E) & Bangladesh Bank Form-EXP cross-reconciler, DEDO Form-A/Form-B legal filing generator, and SHA-256 cryptographic seal.
- [x] Build it: `/develop nbr customs duty drawback dec engine`
   - [x] Customs Duty Drawback Calculator & 8-Digit HS Tariff Matrix (AC-1)
   - [x] Dual Claim Mode: DEDO Statutory Flat Rate vs. Actual BOM Costing (AC-2)
   - [x] Import Bill of Entry & BB Form-EXP Cross-Reconciler (AC-3)
   - [x] NBR DEDO Statutory Claim Dossier & Cryptographic SHA-256 Seal (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘B (AC-5)
- [x] Verify it: `/check verify nbr customs duty drawback dec engine`
- [x] Test it: `/test nbr customs duty drawback dec engine`
spec 0052 · code in `artifacts/api-server/src/lib/customs/duty-drawback-engine.ts`, `artifacts/api-server/src/routes/duty-drawback.ts`, and `artifacts/shothik/src/components/twin/DutyDrawbackModal.tsx`

### 53. Autonomous Halal Certification & Islamic Shariah Governance Engine · done
Food, cosmetic, and pharmaceutical Halal compliance pre-audit engine under Bangladesh BSTI BDS 1907:2016 and OIC-SMIIC standards, 500+ E-number and food additive screener (Halal/Haram/Mushbooh), AAOIFI Shariah Standard No. 21 corporate financial ratio auditor (Debt ≤ 33%, Interest securities ≤ 33%, Non-halal revenue ≤ 5%), income purification calculator, and SHA-256 sealed Shariah board audit dossier generator.
- [x] Build it: `/develop halal certification shariah governance engine`
   - [x] Halal E-Number & Additive Screener with substitute suggestions (AC-1)
   - [x] AAOIFI Shariah Standard No. 21 Financial Ratio & Income Purification Screener (AC-2)
   - [x] Islamic Murabaha & Shariah Financing Contract Auditor (AC-3)
   - [x] BSTI BDS 1907 Statutory Application Dossier & SHA-256 Cryptographic Seal (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘J (AC-5)
- [x] Verify it: `/check verify halal certification shariah governance engine`
- [x] Test it: `/test halal certification shariah governance engine`
spec 0053 · code in `artifacts/api-server/src/lib/shariah/halal-governance-engine.ts`, `artifacts/api-server/src/routes/halal-governance.ts`, and `artifacts/shothik/src/components/twin/HalalGovernanceModal.tsx`

### 54. Autonomous Micro-Merchant B2B Collective Buying & Bulk Freight Pooling Engine · done
Micro-merchant collective buying pools for 1688 Guangzhou, Yiwu, Khatunganj, and Chawkbazar sourcing, MOQ countdown threshold manager, CBM volumetric freight & NBR customs duty cost sharing allocator, 30% advance escrow margin locking via bKash/Nagad, and central hub unboxing parcel splitter with automated Steadfast/Pathao courier dispatch.
- [x] Build it: `/develop micro merchant collective buying bulk freight pooling`
   - [x] Collective Buying Pool Lifecycle & Threshold Engine (AC-1)
   - [x] CBM & Weight Freight Cost Allocator (AC-2)
   - [x] Merchant Escrow Margin & bKash Disbursal (AC-3)
   - [x] Domestic Micro-Hub Parcel Splitter & Courier Booking (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘P (AC-5)
- [x] Verify it: `/check verify micro merchant collective buying bulk freight pooling`
- [x] Test it: `/test micro merchant collective buying bulk freight pooling`
spec 0054 · code in `artifacts/api-server/src/lib/commerce/collective-buying-engine.ts`, `artifacts/api-server/src/routes/collective-buying.ts`, and `artifacts/shothik/src/components/twin/CollectiveBuyingModal.tsx`

### 55. Autonomous AI B2B Tender & Government e-GP Bid Generator & CPTU Compliance Engine · done
Government e-GP and corporate RFP tender bid preparation engine compliant with CPTU Standard Tender Documents (STD PG1, PG2, PG3, PW2), Public Procurement Act 2006 (PPA 2006), and PPR 2008, itemized BOQ rate analysis with 7.5% VAT and 5% AIT withholding deduction calculation, 2.5% Tender Security and 10% Performance Bank Guarantee tracking, and SHA-256 sealed bid dossier generator.
- [x] Build it: `/develop egp tender bid cptu compliance engine`
   - [x] e-GP Tender Qualification & PPR 2008 Rule 54 Screener (AC-1)
   - [x] BOQ Rate Analysis & Statutory Tax Withholding Calculator (AC-2)
   - [x] Tender Security & Bank Guarantee (BG) Tracker (AC-3)
   - [x] e-GP Bid Dossier Generator & SHA-256 Verification Seal (AC-4)
   - [x] Frontend Twin Studio Modal with keyboard shortcut ⌘T (AC-5)
- [x] Verify it: `/check verify egp tender bid cptu compliance engine`
- [x] Test it: `/test egp tender bid cptu compliance engine`
spec 0055 · code in `artifacts/api-server/src/lib/tenders/tender-bid-engine.ts`, `artifacts/api-server/src/routes/tender-bids.ts`, and `artifacts/shothik/src/components/twin/TenderBidModal.tsx`

### 56. OpenMuse Agentic Compute, Persistent Browser Takeover & CAS Leased Task Orchestration Engine · done
Distributed SQL Compare-and-Swap (CAS) leased task worker engine with heartbeat renewal and zero-lost-job crash recovery, protected action proposal and stored review state machine with SHA-256 seals, Playwright egress-proxied browser worker with remote screenshot takeover and coordinate normalization, Nilkhet interactive PDF form field extraction and signed delivery receipt engine, and cross-platform AG-UI Twin Studio modal with shortcut ⌘U.
- [x] Build it: `/develop openmuse agentic compute browser takeover cas task engine`
   - [x] Distributed SQL Compare-and-Swap (CAS) Leased Task Worker Engine (AC-1)
   - [x] Protected Action Proposal & Stored Review State Machine with SHA-256 Seals (AC-2)
   - [x] Egress-Proxied Browser Worker & Live Screenshot Takeover (AC-3)
   - [x] Nilkhet Interactive PDF Form Field Extraction & Signed Receipt Engine (AC-4)
   - [x] Frontend AG-UI Twin Studio Modal (⌘U) & Action Proposal Chat Cards (AC-5)
- [x] Verify it: `/check verify openmuse agentic compute browser takeover cas task engine`
- [x] Test it: `/test openmuse agentic compute browser takeover cas task engine`
spec 0056 · code in `lib/hermes/src/leased-task-worker.ts`, `artifacts/api-server/src/lib/actions/action-proposal-engine.ts`, `artifacts/api-server/src/lib/browser/browser-takeover-engine.ts`, `lib/office-engine/src/pdf-form-engine.ts`, and `artifacts/shothik/src/components/twin/AgentComputerModal.tsx`

### 57. Autonomous HS Code Classification, Customs Tariff & Cross-Border Commercial Invoice Engine · done
Bangladesh Customs Tariff 2026-2027 8-digit HS Code classifier, NBR Customs Act 2023 Total Tax Incidence (TTI) compounding duty calculator (CD, SD, VAT, AIT, RD, AT), Ministry of Commerce Import Policy Order (IPO) regulatory screener, ASYCUDA World Commercial Invoice & Packing List (CIPL) generator with SHA-256 seals, and cross-platform Twin Studio modal with shortcut ⌘N.
- [x] Build it: `/develop hs code classification customs tariff commercial invoice engine`
   - [x] 8-Digit HS Code Classifier & Tariff Rate Engine (AC-1)
   - [x] Total Tax Incidence (TTI) Assessment Calculator (AC-2)
   - [x] IPO Regulatory & Mandatory Agency Clearance Screener (AC-3)
   - [x] ASYCUDA World Commercial Invoice & Packing List Generator (AC-4)
   - [x] Frontend AG-UI Twin Studio Modal with keyboard shortcut ⌘N (AC-5)
- [x] Verify it: `/check verify hs code classification customs tariff commercial invoice engine`
- [x] Test it: `/test hs code classification customs tariff commercial invoice engine`
spec 0057 · code in `artifacts/api-server/src/lib/customs/tariff-engine.ts`, `artifacts/api-server/src/routes/tariff.ts`, and `artifacts/shothik/src/components/twin/CustomsTariffModal.tsx`

### 58. Autonomous Multi-Channel Inventory Matrix, Stock-Out Prediction & Micro-Warehousing Engine · done
Real-time unified SKU synchronization across Daraz, Shopify, WooCommerce, Facebook Live Selling, and WhatsApp Business Storefront, AI sales velocity & Days of Inventory Remaining (DIR) run-rate forecasting, dark store micro-hub allocation between Tejgaon, Dhanmondi, Banani, and Chittagong, automated wholesale reorder PO generator with SHA-256 seals, and cross-platform Twin Studio modal with shortcut ⌘I.
- [x] Build it: `/develop multichannel inventory matrix stock out prediction engine`
   - [x] Multi-Channel SKU Sync Matrix & Reservation Engine (AC-1)
   - [x] Predictive Sales Velocity & Days of Inventory Remaining (DIR) Forecast (AC-2)
   - [x] Hyperlocal Dark Store Micro-Hub Rebalancer (AC-3)
   - [x] Automated Supplier Purchase Order (PO) Generator (AC-4)
   - [x] Frontend AG-UI Twin Studio Modal with keyboard shortcut ⌘I (AC-5)
- [x] Verify it: `/check verify multichannel inventory matrix stock out prediction engine`
- [x] Test it: `/test multichannel inventory matrix stock out prediction engine`
spec 0058 · code in `artifacts/api-server/src/lib/inventory/inventory-matrix-engine.ts`, `artifacts/api-server/src/routes/inventory-matrix.ts`, and `artifacts/shothik/src/components/twin/InventoryMatrixModal.tsx`

### 59. Autonomous Banglish Voice IVR, Automated COD Order Verification & Courier Return Minimization Engine · done
Natural Banglish/Bangla interactive voice response (IVR) phone verification engine, AI Return-to-Origin (RTO) courier fraud risk scoring, automated address sanitization and district/thana resolution, automated Pathao/Steadfast consignment booking upon verified voice/WhatsApp confirmation with SHA-256 seals, and cross-platform Twin Studio modal with shortcut ⌘V.
- [x] Build it: `/develop banglish voice ivr cod verification courier return minimization engine`
   - [x] Banglish/Bangla Voice IVR Call Scheduler & Interactive Dialogue Matrix (AC-1)
   - [x] Return-to-Origin (RTO) Risk Scoring & Delivery Fraud Detection (AC-2)
   - [x] Hyperlocal Address Parser & District/Thana Resolution Engine (AC-3)
   - [x] Automated Courier Consignment Dispatch & Cryptographic Verification Audit (AC-4)
   - [x] Frontend AG-UI Twin Studio Modal with keyboard shortcut ⌘V (AC-5)
- [x] Verify it: `/check verify banglish voice ivr cod verification courier return minimization engine`
- [x] Test it: `/test banglish voice ivr cod verification courier return minimization engine`
spec 0059 · code in `artifacts/api-server/src/lib/ivr/cod-ivr-engine.ts`, `artifacts/api-server/src/routes/cod-ivr.ts`, and `artifacts/shothik/src/components/twin/CodIvrModal.tsx`

### 60. Autonomous B2B Micro-Factoring, AI Accounts Receivable Radar & Early Liquidity Engine · done
B2B credit scoring for Bangladeshi corporate buyers (Pran-RFL, Square, Akij, Beximco, ACI), automated receivables aging radar (0-30, 31-60, 61-90+ days), instant bKash/Nagad Enterprise early liquidity factoring with dynamic APR haircut calculation, automated legal promissory notes with SHA-256 verification seals, and cross-platform Twin Studio modal with shortcut ⌘L.
- [x] Build it: `/develop b2b micro factoring accounts receivable early liquidity engine`
   - [x] B2B Corporate Credit Scoring & Buyer Risk Engine (AC-1)
   - [x] Accounts Receivable Aging Radar & Overdue Cashflow Forecaster (AC-2)
   - [x] Dynamic Early Liquidity Factoring Calculator with APR Haircuts (AC-3)
   - [x] Legal Promissory Note & Cryptographic Lien Generator (AC-4)
   - [x] Frontend AG-UI Twin Studio Modal with keyboard shortcut ⌘L (AC-5)
- [x] Verify it: `/check verify b2b micro factoring accounts receivable early liquidity engine`
- [x] Test it: `/test b2b micro factoring accounts receivable early liquidity engine`
spec 0060 · code in `artifacts/api-server/src/lib/factoring/early-liquidity-engine.ts`, `artifacts/api-server/src/routes/early-liquidity.ts`, and `artifacts/shothik/src/components/twin/EarlyLiquidityModal.tsx`

### 61. Autonomous Live Selling Comment-to-Cart & Courier Dispatch Engine · done
Real-time Banglish intent extraction from live social comments (Facebook/TikTok Live), automated SKU reservation, phone validation, and instant Steadfast/Pathao courier booking pipeline with SHA-256 state seal.
- [x] Build it: `/develop live selling comment to cart courier dispatch engine`
- [x] Verify it: `/check verify live selling comment to cart courier dispatch engine`
- [x] Test it: `/test live selling comment to cart courier dispatch engine`
spec 0061 · code in `artifacts/api-server/src/lib/live-selling/live-selling-engine.ts` and `artifacts/api-server/src/routes/live-selling.ts`

### 62. NBR Mushak 6.3 Automated VAT Challan & QR Code Generator · done
Bangladesh National Board of Revenue (NBR) VAT Act 2012 compliance, 9/13-digit BIN verification, itemized tax invoice calculation with CD, SD, VAT, VDS withholding, and official QR code payload with SHA-256 digital seals.
- [x] Build it: `/develop nbr mushak 63 vat challan qr generator`
- [x] Verify it: `/check verify nbr mushak 63 vat challan qr generator`
- [x] Test it: `/test nbr mushak 63 vat challan qr generator`
spec 0062 · code in `artifacts/api-server/src/lib/tax/mushak-63-engine.ts` and `artifacts/api-server/src/routes/mushak-63.ts`

### 63. Nilkhet Print-on-Demand (POD) 300-DPI Spine & CMYK Press Engine · done
Automated caliper & spine thickness calculator for softcover and casebound hardcover books, CMYK 300-DPI press layout margins, Bengali Unicode font embedding validation, and physical parcel weight estimator.
- [x] Build it: `/develop nilkhet pod 300dpi spine cmyk press engine`
- [x] Verify it: `/check verify nilkhet pod 300dpi spine cmyk press engine`
- [x] Test it: `/test nilkhet pod 300dpi spine cmyk press engine`
spec 0063 · code in `lib/office-engine/spine-calculator.ts`

### 64. Zero-Latency Client-Side WebAssembly (Wasm) Engine · done
Client-side in-browser fast engine for instant Banglish-to-Bengali phonetic transliteration, offline delivery zone & fee lookup, and compound tax incidence calculations with <5ms response times.
- [x] Build it: `/develop zero latency client side wasm engine`
- [x] Verify it: `/check verify zero latency client side wasm engine`
- [x] Test it: `/test zero latency client side wasm engine`
spec 0064 · code in `artifacts/shothik/src/lib/wasm/shothik-wasm-engine.ts`

### 65. Bengali Thesis Plagiarism & Citation Matcher · done
N-gram word shingles & semantic similarity scanner for academic Bengali thesis manuscripts with UGC compliance verification, similarity percentage scoring, and automated APA 7th / IEEE citation formatting.
- [x] Build it: `/develop bengali thesis plagiarism citation matcher`
- [x] Verify it: `/check verify bengali thesis plagiarism citation matcher`
- [x] Test it: `/test bengali thesis plagiarism citation matcher`
spec 0065 · code in `artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts` and `artifacts/api-server/src/routes/plagiarism.ts`

### 66. Push-to-Talk Voice Note Input & Inline Wasm Sandbox Runner · done
WebAudio microphone recorder with real-time waveform visualization, Banglish speech transcription prompt integration, and interactive 1-tap inline Wasm code execution sandbox for chat messages.
- [x] Build it: `/develop push to talk voice note inline wasm sandbox runner`
- [x] Verify it: `/check verify push to talk voice note inline wasm sandbox runner`
- [x] Test it: `/test push to talk voice note inline wasm sandbox runner`
spec 0066 · code in `artifacts/shothik/src/components/chat/VoiceNoteRecorder.tsx` and `artifacts/shothik/src/components/chat/InlineWasmCodeRunner.tsx`

### 67. Wholesale Commodity Price Ticker & Inland LC Escrow Engine · done
Real-time wholesale market commodity tickers (Khatunganj, Chawkbazar, Narsingdi) and Bangladesh Bank compliant Inland Letter of Credit (Inland LC) generator with bKash/Steadfast escrow locking.
- [x] Build it: `/develop wholesale commodity price ticker inland lc escrow engine`
- [x] Verify it: `/check verify wholesale commodity price ticker inland lc escrow engine`
- [x] Test it: `/test wholesale commodity price ticker inland lc escrow engine`
spec 0067 · code in `artifacts/api-server/src/lib/wholesale/commodity-lc-engine.ts` and `artifacts/api-server/src/routes/commodity-lc.ts`

### 68. Hyperlocal Creator Guilds & Verified Supplier Escrow Radar · done
Regional vertical creator guilds (Dhaka Garments, Chittagong Gadgets, BoiMela Writers) with collective purchasing volume pools and trust-scored verified supplier escrow badges.
- [x] Build it: `/develop creator guilds verified supplier escrow radar`
- [x] Verify it: `/check verify creator guilds verified supplier escrow radar`
- [x] Test it: `/test creator guilds verified supplier escrow radar`
spec 0068 · code in `artifacts/api-server/src/lib/community/creator-guilds-engine.ts` and `artifacts/api-server/src/routes/creator-guilds.ts`

### 69. HarfBuzz-Compatible Bengali OpenType Typography & Complex Script Shaper · done
Unicode NFC normalization, complex conjunct (যুক্তবর্ণ) ligature mapping, pre-base vowel reordering, and 300-DPI / ESC-POS printable metric calculations for flawless PDF and thermal press layouts.
- [x] Build it: `/develop harfbuzz bengali opentype typography shaper`
- [x] Verify it: `/check verify harfbuzz bengali opentype typography shaper`
- [x] Test it: `/test harfbuzz bengali opentype typography shaper`
spec 0069 · code in `lib/office-engine/bengali-shaper.ts` and `lib/office-engine/__tests__/bengali-shaper.test.ts`

### 70. Nagad Sheba Direct PGW Tokenized Checkout & MFS Clearing Engine · done
Direct Nagad PGW client supporting payment session initialization, callback URL redirection, transaction verification, and SHA-256 cryptographic state seals.
- [x] Build it: `/develop nagad sheba direct pgw clearing engine`
- [x] Verify it: `/check verify nagad sheba direct pgw clearing engine`
- [x] Test it: `/test nagad sheba direct pgw clearing engine`
spec 0070 · code in `artifacts/api-server/src/lib/mfs/nagad-pgw-client.ts`, `artifacts/api-server/src/routes/mfs.ts`, and `artifacts/api-server/src/routes/__tests__/nagad-pgw.test.ts`

### 71. NBR Mushak-6.6 Certificate of Tax Deduction at Source (VDS) Engine · done
National Board of Revenue (NBR) Value Added Tax and Supplementary Duty Act 2012 (মূসক-৬.৬) certificate generator with itemized VDS calculations, supplier net disbursement, and e-Treasury deposit code formatting.
- [x] Build it: `/develop nbr mushak 66 vds certificate engine`
- [x] Verify it: `/check verify nbr mushak 66 vds certificate engine`
- [x] Test it: `/test nbr mushak 66 vds certificate engine`
spec 0071 · code in `artifacts/api-server/src/lib/tax/mushak-66-engine.ts`, `artifacts/api-server/src/routes/mushak-66.ts`, and `artifacts/api-server/src/routes/__tests__/mushak-66.test.ts`

### 72. Academic BibTeX & Overleaf LaTeX Citation Generator · done
Automated `.bib` entry generation and Overleaf-ready LaTeX `\cite{}` snippets for BUET, DU, and SUST engineering and thesis manuscripts.
- [x] Build it: `/develop academic bibtex overleaf latex citation generator`
- [x] Verify it: `/check verify academic bibtex overleaf latex citation generator`
- [x] Test it: `/test academic bibtex overleaf latex citation generator`
spec 0072 · code in `artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts` and `artifacts/api-server/src/routes/__tests__/plagiarism.test.ts`

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
