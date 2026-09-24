# Spec 0047: Autonomous Corporate Income Tax (NBR Form 82C / Minimum Tax) & VAT Sub-Form 9.1 AIT Reconciliation Engine

## 1. Context & Motivation
Bangladeshi registered companies (SMEs, One-Person Companies (OPCs), Private Limited entities) face complex fiscal compliance hurdles:
1. **Section 163 / 82C Minimum Turnover Tax**: Companies must pay either computed corporate tax on net taxable profit or 0.6% of gross receipts (turnover floor), whichever is higher.
2. **Advance Income Tax (AIT) Section 120 / 163 Deductions**: Vendors, banks, customs, and corporate clients deduct 1% to 12% AIT at source (import customs, invoice factoring, export realization, B2B supplies). This must be tracked and set off against annual tax liability.
3. **VAT Mushak-9.1 Monthly Return**: Under NBR Value Added Tax and Supplementary Duty Act 2012, businesses must calculate Output VAT (15%/10%/7.5%/5%), claim eligible Input Tax Credit (ITC) under Mushak-6.3 invoices, reconcile increasing/decreasing adjustments (VDS, export rebates), and determine Net Treasury Payable or Carry-Forward Refund.

## 2. Core Acceptance Criteria
- **AC-1 (Corporate Tax Slabs & Rates)**: Compute corporate tax across entity categories:
  - Non-listed Private Limited: 27.5% (25% if cash transaction limit compliant)
  - One-Person Company (OPC): 22.5% (20% if cashless compliant)
  - Qualifying IT Enabled Services (ITES): 0% (Tax holiday with valid exemption certificate)
  - Export Oriented RMG / Textiles: 12% (10% for LEED certified green factories)
- **AC-2 (Section 163/82C Minimum Turnover Tax Floor)**:
  - Minimum tax = Gross Turnover × 0.6% (0.1% for industrial goods manufacturing or telecom special rates).
  - Effective tax liability = $\max(\text{Net Taxable Profit} \times \text{Tax Rate}, \text{Gross Turnover} \times \text{Minimum Rate})$.
- **AC-3 (Advance Income Tax (AIT) Credit Ledger)**:
  - Track AIT certificates (Challans) across Import (Section 120/121), Supply of Goods (Section 89/90), Professional & Technical Services (Section 86/87), Export Realization (Section 123), and Bank Interest (Section 102).
  - Compute Net Tax Payable = $\max(0, \text{Gross Tax Liability} - \text{Total AIT Credited})$.
- **AC-4 (VAT Mushak-9.1 Monthly Reconciliation)**:
  - Input VAT (Part 3) vs Output VAT (Part 2).
  - VDS (VAT Deducted at Source) decreasing adjustments (Part 4) and treasury deposits (Part 5).
  - Net VAT Payable / Refundable carry-forward balance calculation.
- **AC-5 (Statutory e-Return & Challan Bundle Exporter)**:
  - Compile JSON/XML formatted payload matching NBR e-Return portal & Form 82C schedule tables.
- **AC-6 (Frontend Twin Studio Modal `⌘9`)**:
  - Interactive multi-tab cockpit for Corporate Tax computation, AIT Certificate Vault, Mushak-9.1 VAT Return compiler, and e-Return payload generator.

## 3. Architecture & Interfaces
- Module path: `artifacts/api-server/src/lib/corporate-tax/corporate-tax-engine.ts`
- Routes: `artifacts/api-server/src/routes/corporate-tax.ts`
- Endpoints:
  - `GET /api/v1/corporate-tax/summary`
  - `POST /api/v1/corporate-tax/calculate`
  - `GET /api/v1/corporate-tax/ait-ledger`
  - `POST /api/v1/corporate-tax/ait-ledger/add`
  - `GET /api/v1/corporate-tax/mushak-9-1`
  - `POST /api/v1/corporate-tax/export-e-return`
- Frontend: `artifacts/shothik/src/components/twin/CorporateTaxModal.tsx` (`⌘9`)
