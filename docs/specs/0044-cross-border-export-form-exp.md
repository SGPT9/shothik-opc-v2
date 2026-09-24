# SPEC-0044: Autonomous Cross-Border Export Manifest & Form-EXP / BB ERC Compliance Engine

## 1. Context & Motivation
Bangladeshi direct-to-consumer (D2C) manufacturers, artisan cooperatives, RMG sample houses, and software/IT exporters face complex regulatory friction when shipping products internationally. Under Bangladesh Bank Foreign Exchange Regulation Act (FERA) 1947 and NBR Customs Act 2023, every commercial export shipment exceeding USD 500 must possess:
1. A valid **Export Registration Certificate (ERC / ইআরসি)** issued by the Chief Controller of Imports and Exports (CCI&E).
2. A verified **Bangladesh Bank Online Form-EXP (ফরম-ইএক্সপি)** certified by an Authorized Dealer (AD) Bank before customs clearance.
3. An **NBR ASYCUDA World Export Manifest** with validated 8-digit Harmonized System (HS) Codes, Freight on Board (FOB) valuation, and Country of Origin certification.
4. An automated 120-day foreign exchange repatriation countdown ensuring export proceeds are realized and credited to the merchant's Foreign Currency / ERQ account, preventing regulatory flagging or de-listing by Bangladesh Bank.

This engine automates the entire export compliance workflow, compiles legally compliant Form-EXP data packets, audits Letter of Credit (LC) and Cash Against Documents (CAD) milestones, and reconciles Airway Bills (AWB) and Bills of Lading (BL) against bank realization certificates.

---

## 2. Core Architecture

```
                       [ Exporter / Manufacturer / Artisan Hub ]
                                         │
                         (Export Consignment & Invoice)
                                         ▼
                     ┌──────────────────────────────────────┐
                     │     ExportComplianceEngine           │
                     │  - ERC Statutory Validator           │
                     │  - NBR 8-Digit HS Code Tariff Match │
                     │  - FOB / CIF / C&F Value Decomposer │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │    BB Online Form-EXP Generator      │
                     │  - 14-Digit EXP Number Formulation   │
                     │  - AD Bank Code & L/C Validation     │
                     │  - Customs Manifest (ASYCUDA World)  │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │  Repatriation & LC Milestone Tracker │
                     │  - 120-Day FERA Repatriation Clock   │
                     │  - Inward SWIFT MT103 Reconciliation │
                     │  - Export PRC (Proceeds Realization) │
                     └──────────────────────────────────────┘
```

---

## 3. Acceptance Criteria

- **AC-1: Form-EXP & NBR Export Manifest Compiler**: Compile standard Bangladesh Bank Form-EXP packets (`expNumber`, `exporterBin`, `ercNumber`, `adBankCode`, `consigneeDetails`, `portOfShipment`, `destinationCountry`, `hsCode`, `fobValueUsd`, `currencyExchangeRateBdt`).
- **AC-2: ERC & Statutory Entity Validation**: Validate 13-digit BIN, 10-digit ERC, and CCI&E validity status with anti-forgery check.
- **AC-3: Letter of Credit (LC) & CAD Milestone Auditor**: Track LC issuance, amendment, port dispatch, bill presentation, and SWIFT MT103 inward remittance settlement.
- **AC-4: 120-Day FERA Repatriation Countdown**: Flag overdue receivables exceeding 120 days post-onboard bill of lading, providing automated extension petitions for Bangladesh Bank Foreign Exchange Policy Department.
- **AC-5: Inward Proceeds Realization Certificate (PRC)**: Reconcile inward bank credits, calculate export cash subsidies (4%-10%), and generate digital PRC reports.
- **AC-6: Frontend Twin Studio Modal (`⌘E`)**: Interactive studio modal featuring live export consignment pipeline, official Form-EXP printable certificate view, LC lifecycle radar, and one-click ASYCUDA JSON export.

---

## 4. REST API Endpoints
- `POST /api/v1/export-compliance/form-exp/generate`: Generate and certify Form-EXP document.
- `GET /api/v1/export-compliance/form-exp/list`: Retrieve all active and completed export filings.
- `POST /api/v1/export-compliance/validate-erc`: Validate merchant ERC registration and renewal status.
- `POST /api/v1/export-compliance/lc/update`: Update LC/CAD milestone and trigger repatriation clock.
- `GET /api/v1/export-compliance/summary`: Aggregate export turnover, pending FX realizations, and subsidy accruals.

---

## 5. Verification Plan
- Unit & integration tests in `artifacts/api-server/src/routes/__tests__/export-compliance.test.ts`.
- Frontend Twin modal unit tests in `artifacts/shothik/src/components/twin/__tests__/ExportComplianceModal.test.tsx`.
- 100% test pass rate with zero unhandled errors.
