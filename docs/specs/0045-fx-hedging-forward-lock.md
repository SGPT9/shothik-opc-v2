# SPEC-0045: Autonomous Cross-Border FX Hedging & Forward Rate Lock Engine

## 1. Context & Motivation
Bangladeshi exporters (RMG, leather, IT/ITES services, agro-commodities) operate with 60–120 day lead times between order confirmation/production and inward foreign exchange realization. In a volatile macro-currency environment, USD/BDT exchange rate swings erode profit margins or cause unhedged balance sheet losses.

Under Bangladesh Bank Foreign Exchange Regulation Act (FERA) 1947 (Chapter 10) and FE Circular guidelines, exporters with underlying commercial exposure (Export LC, Sales Contract, or Form-EXP) are legally permitted to book **Forward Exchange Contracts** with Authorized Dealer (AD) commercial banks to lock in future exchange rates.

This engine automates forward rate modeling via Covered Interest Rate Parity (CIRP), compiles compliant bank booking packets, computes mark-to-market (MTM) daily valuations, and manages automatic forward contract settlement when inward SWIFT MT103 remittances arrive.

---

## 2. Core Architecture

```
                    [ Exporter / Form-EXP Consignment / Export LC ]
                                         │
                         (Export Receivables Exposure)
                                         ▼
                     ┌──────────────────────────────────────┐
                     │         FxHedgingEngine              │
                     │  - Covered Interest Rate Parity CIRP │
                     │  - USD SOFR vs BDT SMART Yield Curve │
                     │  - 30 / 60 / 90 / 180d Forward Rates │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │    BB Authorized Dealer Booking Gate │
                     │  - 5% Margin Lien / Collateral Check │
                     │  - Underlier Form-EXP Validation     │
                     │  - Forward Contract Number Issuance  │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │     Mark-to-Market (MTM) Auditor     │
                     │  - Daily Spot vs Forward Variance    │
                     │  - Unrealized Gain / Loss Ledger     │
                     │  - SWIFT Inward Remittance Settle    │
                     └──────────────────────────────────────┘
```

---

## 3. Mathematical Model: Covered Interest Rate Parity (CIRP)

The forward exchange rate $F_t$ for tenure $t$ (in days) is calculated as:
$$F_t = S \times \left( \frac{1 + r_{\text{BDT}} \times \frac{t}{360}}{1 + r_{\text{USD}} \times \frac{t}{360}} \right)$$

Where:
- $S$: Current USD/BDT Spot Rate (e.g. ৳121.50)
- $r_{\text{BDT}}$: Bangladesh Treasury / SMART 6-month reference rate ($\sim 11.50\%$)
- $r_{\text{USD}}$: US Secured Overnight Financing Rate (SOFR) reference ($\sim 5.25\%$)
- $t$: Tenor in days (30, 60, 90, 180 days)

---

## 4. Acceptance Criteria

- **AC-1: Dynamic Forward Rate & CIRP Yield Curve Calculator**: Calculate 30, 60, 90, and 180-day forward exchange rates and annualized forward premium percentages.
- **AC-2: Forward Contract Booking Engine**: Generate statutory forward booking records linked to underlying Form-EXP filings, tracking locked contract rates, notional USD amounts, bank margin lien requirements (5%), and maturity dates.
- **AC-3: Daily Mark-to-Market (MTM) Revaluation**: Compute unrealized profit/loss by comparing current spot rate against locked forward contract rates.
- **AC-4: Automated Inward Remittance Settlement**: Settle forward contracts upon inward foreign remittance realization, calculating net exchange gains/losses and releasing collateral liens.
- **AC-5: Export Hedging Risk & Portfolio Summary**: Provide real-time aggregate portfolio hedge ratios (hedged vs open receivables), weighted average locked exchange rates, and realized hedge revenue.
- **AC-6: Frontend Twin Studio Modal (`⌘X`)**: Interactive studio modal featuring live forward rate curves, active contract ledger, MTM profit/loss visualization, and one-click forward booking wizard.

---

## 5. REST API Endpoints
- `POST /api/v1/fx-hedging/quote`: Get real-time CIRP forward rate quotes for 30/60/90/180-day tenors.
- `POST /api/v1/fx-hedging/contract/book`: Book an export forward hedge contract linked to Form-EXP / LC.
- `GET /api/v1/fx-hedging/contract/list`: Retrieve active and settled forward contracts.
- `POST /api/v1/fx-hedging/contract/settle`: Settle forward contract upon inward remittance credit.
- `GET /api/v1/fx-hedging/summary`: Return total hedged volume, MTM unrealized gains, and hedge ratio.

---

## 6. Verification Plan
- Unit & integration tests in `artifacts/api-server/src/routes/__tests__/fx-hedging.test.ts`.
- Frontend Twin modal unit tests in `artifacts/shothik/src/components/twin/__tests__/FxHedgingModal.test.tsx`.
- 100% test coverage with zero unhandled edge cases.
