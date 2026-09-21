# Spec 0036: Autonomous Freelancer Remittance & Bangladesh Bank ICT Cash Incentive Ledger

## 1. Problem Statement
Over 650,000 freelancers, IT agencies, and digital export OPCs in Bangladesh receive foreign inward remittances through banking channels (Payoneer, Wise, Swift Wire, Upwork, Fiverr). The Government of Bangladesh and Bangladesh Bank (FE Circular) mandate a **4% to 10% Cash Incentive / Export Subsidy** on qualifying ICT and digital service export receipts.
However, small OPCs fail to claim millions of BDT in legitimate government subsidies due to burdensome paperwork:
1. Complex Form-C (Declaration for Inward Remittance Exceeding Thresholds) manual filings.
2. Inward Remittance Certificate (PRC / FFC) reconciliation gaps across authorized dealer (AD) banks (BRAC Bank, City Bank, Eastern Bank, Islami Bank).
3. Failure to prove bona fide digital export service delivery with verified milestone contracts and invoice trails.

## 2. Solution Overview
Slice 36 builds the **Autonomous Freelancer Remittance & ICT Cash Incentive Ledger**:
- **Bangladesh Bank Export Incentive Engine:** Calculates statutory cash subsidies (4% for individual ICT freelancers, 10% for BASIS/registered software exporters) net of bank source tax and processing charges.
- **Automated Form-C Generator:** Generates compliant Form-C statutory declaration documents with HS/BOP Code `9801` (Computer Software & IT Services) and authorized dealer bank routing.
- **Inward Remittance & PRC Reconciler:** Validates Transaction Reference Numbers (FT/TTN), exchange rates (USD/EUR/GBP to BDT), and matches bank credits with export invoices.
- **International Milestone Escrow & Service Contract Compiler:** Generates legally binding bilingual (English/Bangla) service agreements with cryptographic milestone hash seals.

## 3. Acceptance Criteria
- **AC-1 (Incentive Calculation):** Accurately computes statutory subsidy based on foreign inward currency, conversion rate, and exporter category (4% freelancer, 10% registered tech exporter) with exact BDT realization breakdown.
- **AC-2 (Form-C Compiler):** Emits structured Form-C foreign exchange declaration payloads compliant with Bangladesh Bank foreign exchange guidelines.
- **AC-3 (PRC Reconciliation):** Reconciles inward remittance records against bank credits and verifies withholding tax exemption under Section 52Q / ICT tax holiday.
- **AC-4 (Escrow Contract Generator):** Emits export service contracts with milestone payment schedules and SHA-256 integrity hashes.
- **AC-5 (Twin Modal & Keyboard Access):** Responsive 4-tab studio modal (`FreelancerRemittanceModal.tsx`) triggered via global shortcut `⌘I` / `Ctrl+I` and `TwinCommandPalette.tsx`.
- **AC-6 (Testing & Localhost Verification):** 100% test coverage in Vitest, certified via `scripts/verify-localhost.cjs`, pre-commit ECC gate, and pushed across all 9 canonical remotes.
