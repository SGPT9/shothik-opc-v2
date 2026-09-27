# Spec 0071: NBR Mushak-6.6 Certificate of Tax Deduction at Source (VDS) Engine

## 1. Overview
National Board of Revenue (NBR) Value Added Tax and Supplementary Duty Act 2012 (মূসক-৬.৬) certificate generator with itemized VDS calculations, supplier net disbursement, and e-Treasury deposit code formatting.

## 2. Acceptance Criteria
- **AC-1**: Validate 9-digit or 13-digit BINs for withholding entity and supplier.
- **AC-2**: Decompose total invoice amounts, calculate exact VDS withholding based on rate (5%, 7.5%, 10%, 15%), and compute net payment to supplier.
- **AC-3**: Format NBR e-Treasury deposit code (1/1133/0010/0311) and emit cryptographic SHA-256 state seal.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/tax/mushak-66-engine.ts`
- Routes: `artifacts/api-server/src/routes/mushak-66.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/mushak-66.test.ts`
