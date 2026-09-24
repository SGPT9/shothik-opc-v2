# Spec 0052: Autonomous NBR Customs Duty Drawback & Duty-Exemption Certificate (DEC) Engine

**Status**: Accepted

## 1. Context & Motivation
Bangladeshi export manufacturers (RMG, textiles, light engineering, leather, electronics, packaged foods) pay customs duty, regulatory duty, supplementary duty, and import VAT on raw materials.
Under **Sections 33 & 34 of the Customs Act, 2023**, exporters are legally entitled to:
1. **Duty Drawback (DEDO Refund)**: Cash refund of duties paid on imported inputs once finished goods are exported.
2. **Duty-Exemption Certificate (DEC)**: Advance exemption for bonded/direct exporters.

Currently, over 80% of MSME exporters fail to claim duty drawbacks due to complex reconciliation between import Bills of Entry (B/E), Bangladesh Bank Form-EXP, and NBR DEDO input-output coefficients. This engine automates tariff calculation, bill cross-reconciliation, statutory claim dossier generation, and cryptographic verification.

## 2. Core Acceptance Criteria
- **AC-1 (Customs Duty Drawback Calculator & 8-Digit HS Tariff Matrix)**:
  - Calculates refundable Customs Duty (CD: 5%-25%), Regulatory Duty (RD: 3%), Supplementary Duty (SD: 20%-100%), and Import VAT (15%).
- **AC-2 (Dual Claim Mode: DEDO Statutory Flat Rate vs. Actual Costing)**:
  - Flat Rate mode (standard percentage of FOB export value).
  - Actual Costing mode (exact input-output coefficient mapped to Mushak-4.3 declaration).
- **AC-3 (Import Bill of Entry & BB Form-EXP Cross-Reconciler)**:
  - Validates import B/E (Chittagong Port, Benapole, Dhaka Airport ICD) against export B/E, commercial invoice, and Bangladesh Bank 120-day Form-EXP repatriation.
- **AC-4 (NBR DEDO Statutory Claim Dossier & Cryptographic SHA-256 Seal)**:
  - Generates DEDO Form-A (Flat Rate) and Form-B (Actual Costing) printable legal filings with advocate/customs broker authorization tokens and SHA-256 audit proof.
- **AC-5 (Frontend Twin Studio Modal `⌘B`)**:
  - 4-tab cockpit: Active Drawback Claims, New Claim Drafter & Tariff Calculator, B/E to Form-EXP Cross-Matcher, and DEDO Statutory Tariff Matrix.

## 3. Architecture & Interfaces
- Engine: `artifacts/api-server/src/lib/customs/duty-drawback-engine.ts`
- Route: `artifacts/api-server/src/routes/duty-drawback.ts`
- Endpoints:
  - `GET /api/v1/duty-drawback/summary`
  - `GET /api/v1/duty-drawback/claims`
  - `POST /api/v1/duty-drawback/calculate`
  - `POST /api/v1/duty-drawback/claims/generate`
  - `POST /api/v1/duty-drawback/reconcile-bills`
- Frontend: `artifacts/shothik/src/components/twin/DutyDrawbackModal.tsx` (`⌘B`)
