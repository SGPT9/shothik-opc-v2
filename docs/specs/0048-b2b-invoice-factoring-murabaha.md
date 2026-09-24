# Spec 0048: Autonomous B2B Invoice Factoring, Bill Discounting & Islamic Murabaha Cash Advance Engine

## 1. Context & Motivation
Bangladeshi MSMEs and solopreneurs operating as vendors or subcontractors to large corporations (PRAN-RFL, Square, Beximco, Walton, Aarong, Apex) suffer from 60 to 120-day receivables payment lags. This causes severe liquidity crunches during payroll and inventory replenishment cycles.

Traditional bank factoring requires months of collateralized paperwork. This engine provides:
1. **Instant Mushak-6.3 e-Invoice Verification**: Validates invoice amounts, buyer BIN/TIN, PO numbers, and payment due dates.
2. **Dual Financing Modalities**:
   - **Conventional Discounting**: SMART reference rate + risk spread (e.g. 11.5% SMART + 3.0% spread = 14.5% p.a.).
   - **Shariah-Compliant Murabaha / Bai-Muajjal**: Fixed cost-plus asset purchase markup (1.5% - 3.5% flat based on tenor), avoiding compounding ribā.
3. **Automated Receivables Escrow Lien & Instant Disbursal**: Advances 75%-85% LTV within minutes via bKash Corporate Payroll / BEFTN, retaining 15%-25% until enterprise buyer settles into the designated escrow account.

## 2. Core Acceptance Criteria
- **AC-1 (Invoice Scoring & Debtor Risk Profile)**:
  - Classify enterprise debtors into Credit Tiers:
    - Tier 1 (AAA Blue Chip: PRAN, Square, Grameenphone, Unilever BD): 85% LTV, 1.2% Murabaha fee / 13.5% APR.
    - Tier 2 (A+ Established Corporate: Walton, Apex, Aarong, Akij): 80% LTV, 1.8% Murabaha fee / 14.5% APR.
    - Tier 3 (BBB Mid-Cap / Wholesale Buyer): 75% LTV, 2.5% Murabaha fee / 16.0% APR.
- **AC-2 (Dual Pricing Simulator)**:
  - Calculate net advance amount, financing cost/markup, platform processing fee (0.5%), and retained escrow balance across 30, 60, 90, and 120-day tenors for both Conventional and Islamic Murabaha models.
- **AC-3 (Receivables Escrow Lien & Automated Settlement)**:
  - Generate irrevocable escrow assignment agreement with digital SHA-256 stamp.
  - Reconcile incoming buyer bank remittance (BEFTN/RTGS), release retained reserve to SME minus actual financing charges.
- **AC-4 (Disbursement Batch Generator)**:
  - Direct instant payout routing via bKash Merchant API, Nagad Enterprise, or BEFTN/NPSB.
- **AC-5 (Frontend Twin Studio Modal `⌘I`)**:
  - Interactive multi-tab cockpit for Invoice Upload/Verification, Dual Conventional vs Murabaha Simulator, Active Factored Portfolio, and Escrow Settlement Ledger.

## 3. Architecture & Interfaces
- Module path: `artifacts/api-server/src/lib/factoring/invoice-factoring-engine.ts`
- Routes: `artifacts/api-server/src/routes/invoice-factoring.ts`
- Endpoints:
  - `GET /api/v1/factoring/summary`
  - `POST /api/v1/factoring/quote`
  - `GET /api/v1/factoring/invoices`
  - `POST /api/v1/factoring/apply`
  - `POST /api/v1/factoring/settle`
- Frontend: `artifacts/shothik/src/components/twin/InvoiceFactoringModal.tsx` (`⌘I`)
