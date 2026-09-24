# Spec 0049: Autonomous B2B Trade Credit Insurance, NI Act 138 Cheque Default & Debt Recovery Engine

## 1. Context & Motivation
Commercial suppliers and OPCs in Bangladesh regularly face bad debts, delayed payments, and bounced security cheques from corporate and wholesale debtors.
The legal recourse in Bangladesh is governed by:
1. **The Negotiable Instruments Act, 1881 (Section 138)**: For bounced cheques, the creditor must serve a statutory written Legal Notice within 30 days of receiving the bank dishonor memo, giving the debtor 30 days to pay before criminal proceedings can be initiated in Metropolitan Magistrate Court.
2. **The Money Loan Court Act, 2003 (Artha Rin Adalat Ain)** & Civil Recovery: For contract defaults.
3. **Trade Credit Insurance Bonding**: MSMEs can insure high-value supply invoices at a 0.45%-1.25% premium to guarantee 90% indemnity against corporate buyer insolvency.

This engine automates trade credit insurance policy issuance, bank dishonor memo logging, statutory Section 138 legal notice compilation, and insurance indemnity claim settlements.

## 2. Core Acceptance Criteria
- **AC-1 (Trade Credit Insurance Policy Underwriting)**:
  - Calculate insurance premium based on debtor risk tier:
    - Tier 1 Debtor: 0.45% premium rate, 90% indemnity.
    - Tier 2 Debtor: 0.75% premium rate, 90% indemnity.
    - Tier 3 Debtor: 1.25% premium rate, 85% indemnity.
  - Issue cryptographically stamped Policy Certificates with policy numbers, covered amounts, and maximum liability caps.
- **AC-2 (Bank Cheque Dishonor & NI Act 138 Legal Notice Compiler)**:
  - Record dishonored cheques (Cheque Number, Bank Name, Routing Number, Dishonor Memo Date, Reason).
  - Enforce strict 30-day statutory limitation window from memo date.
  - Generate compliant Statutory Legal Notice in English and Bangla with legal citations, registered postal tracking placeholders, and 30-day payment deadline.
- **AC-3 (Insurance Indemnity Claim Settlement)**:
  - Submit insurance claim upon expiry of statutory 30-day notice without payment.
  - Disburse 90% insured indemnity directly via bKash Merchant / Corporate MFS / BEFTN.
- **AC-4 (Artha Rin Adalat & CIB Reporting Dossier Exporter)**:
  - Bundle invoices, dishonor memos, legal notices, and postal receipts into an evidence package for court filing and CIB delinquency reporting.
- **AC-5 (Frontend Twin Studio Modal `⌘R`)**:
  - Interactive multi-tab cockpit for Trade Insurance Policies, Dishonored Cheques & Section 138 Legal Notice Generator, Claim Indemnity Disbursal, and Court Dossier Exporter.

## 3. Architecture & Interfaces
- Module path: `artifacts/api-server/src/lib/recovery/debt-recovery-engine.ts`
- Routes: `artifacts/api-server/src/routes/debt-recovery.ts`
- Endpoints:
  - `GET /api/v1/recovery/summary`
  - `POST /api/v1/recovery/policies/issue`
  - `GET /api/v1/recovery/policies`
  - `POST /api/v1/recovery/cheques/dishonor`
  - `GET /api/v1/recovery/cheques`
  - `POST /api/v1/recovery/claims/submit`
  - `POST /api/v1/recovery/export-court-dossier`
- Frontend: `artifacts/shothik/src/components/twin/DebtRecoveryModal.tsx` (`⌘R`)
