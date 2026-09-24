# Spec 0051: Autonomous AI Legal Contract Generator & Stamp Duty Act 1899 Compliance Engine

**Status**: Accepted

## 1. Context & Motivation
Bangladeshi OPCs, solopreneurs, and MSMEs constantly draft contracts (vendor supply, commercial lease, NDAs, founder vesting, freelancer agreements).
However, most contracts are either informally executed (rendering them legally inadmissible) or non-compliant with:
1. **The Stamp Act, 1899**: Mandates specific non-judicial stamp values (৳300, ৳500, ৳1000, or percentage rent slabs). An unstamped contract cannot be admitted as evidence under Section 35 of the Stamp Act.
2. **The Contract Act, 1872 & Registration Act, 1908**: Valid consideration, clear termination notices, and arbitration clauses.
3. **The Information & Communication Technology (ICT) Act, 2006**: Recognition of electronic records and digital signature certificates.

This engine automates statutory contract drafting, stamp duty calculation, dual-party digital e-signing, and immutable cryptographic sealing.

## 2. Core Acceptance Criteria
- **AC-1 (Statutory Template Repository)**:
  - 5 bilingual templates:
    1. Commercial Vendor Supply Agreement
    2. Commercial Property / Warehouse Lease
    3. Mutual Non-Disclosure Agreement (NDA)
    4. Co-Founder Equity Vesting & IP Assignment
    5. Software Developer & Freelancer Agreement
- **AC-2 (Non-Judicial E-Stamp Duty Calculator)**:
  - Calculate required statutory stamp value under Stamp Act 1899 schedule:
    - NDA / Affidavits: ৳300 stamp
    - Service / Supply Contracts (< ৳5,00,000): ৳500 stamp
    - Commercial Contracts (> ৳5,00,000): ৳1,000 stamp
    - Commercial Leases: 0.5% - 1.5% of total annual rent value
- **AC-3 (Dual-Party Digital Signature & SHA-256 Audit Seal)**:
  - Signer party 1 & party 2 name, NID/TIN, mobile OTP verification timestamp.
  - Generates SHA-256 cryptographic proof seal embedded into the document footer.
- **AC-4 (Bilingual Contract Exporter)**:
  - Output contract text formatted in English and Bangla with statutory legal clauses and registered advocate verification placeholders.
- **AC-5 (Frontend Twin Studio Modal `⌘L`)**:
  - Interactive multi-tab cockpit for Active Executed Contracts, New Contract Drafter & Stamp Duty Calculator, Contract Preview & Digital Signature Seal, and Statutory Stamp Schedule.

## 3. Architecture & Interfaces
- Module path: `artifacts/api-server/src/lib/contracts/legal-contracts-engine.ts`
- Routes: `artifacts/api-server/src/routes/legal-contracts.ts`
- Endpoints:
  - `GET /api/v1/contracts/summary`
  - `POST /api/v1/contracts/generate`
  - `GET /api/v1/contracts`
  - `POST /api/v1/contracts/sign`
  - `POST /api/v1/contracts/calculate-stamp-duty`
- Frontend: `artifacts/shothik/src/components/twin/LegalContractsModal.tsx` (`⌘L`)
