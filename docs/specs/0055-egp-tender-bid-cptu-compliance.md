# Spec 0055: Autonomous AI B2B Tender & Government e-GP Bid Generator & CPTU Compliance Engine

**Status**: Accepted

## 1. Context & Motivation
In Bangladesh, public and private procurement (e-GP under Central Procurement Technical Unit / CPTU, PPA 2006, PPR 2008) constitutes over ৳1.5 Lakh Crore ($13B+) annually. Solopreneurs and growing MSME suppliers face heavy administrative burdens preparing compliant tender submissions:
1. **e-GP Tender Qualification Screening**: Pre-evaluating company financial turnover, liquid asset certificates, and similar experience against CPTU Standard Tender Document (STD PG1/PG2/PG3/PW2) criteria.
2. **Automated BOQ Rate Analysis**: Breaking down unit costs, material inputs, labor, equipment, and statutory deductions (7.5% VAT, 5% AIT).
3. **Tender Security & Bank Guarantee (BG) Generator**: Managing 2-3% tender security / performance security calculations and bank issuance letters.
4. **CPTU Technical Proposal Dossier**: Generating comprehensive bilingual technical specifications, manufacturer authorization forms (MAF), and compliance matrices.
5. **Cryptographic SHA-256 Verification Seal**: Auditing submission integrity for government e-GP and corporate RFPs.

## 2. Core Acceptance Criteria
- **AC-1 (e-GP Tender Qualification & Rule Screener)**:
  - Validates eligibility under Public Procurement Act 2006 (PPA 2006) and Public Procurement Rules 2008 (PPR 2008).
  - Evaluates financial turnover, credit line commitment, and similar completion certificates.
- **AC-2 (BOQ Rate Analysis & Statutory Withholding Calculator)**:
  - Generates itemized BOQ unit rates with statutory 7.5% VAT (Mushak) and 5% AIT withholding margin deductions.
- **AC-3 (Tender Security & Bank Guarantee (BG) Tracker)**:
  - Computes exact statutory 2%-3% Tender Security and 5%-10% Performance Security amounts with bank request forms.
- **AC-4 (e-GP Bid Dossier Generator & SHA-256 Seal)**:
  - Compiles bilingual technical proposals with digital verification seal and Manufacturer Authorization Form (MAF).
- **AC-5 (Frontend Twin Studio Modal `⌘T` / Palette)**:
  - 4-tab cockpit: Active Tender Bids, New Bid Proposal Generator, BOQ Rate Analysis & Costing, and CPTU/PPR 2008 Standards.

## 3. Architecture & Interfaces
- Engine: `artifacts/api-server/src/lib/tenders/tender-bid-engine.ts`
- Routes: `artifacts/api-server/src/routes/tender-bids.ts`
- Endpoints:
  - `GET /api/v1/tenders/summary`
  - `GET /api/v1/tenders/bids`
  - `GET /api/v1/tenders/bids/:id`
  - `POST /api/v1/tenders/calculate-boq`
  - `POST /api/v1/tenders/screen-eligibility`
  - `POST /api/v1/tenders/bids/generate`
- Frontend: `artifacts/shothik/src/components/twin/TenderBidModal.tsx`
