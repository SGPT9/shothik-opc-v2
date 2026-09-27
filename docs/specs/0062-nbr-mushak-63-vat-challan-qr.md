# Spec 0062: NBR Mushak 6.3 Automated VAT Challan & QR Code Generator

## 1. Overview
Automates statutory tax invoice generation compliant with the National Board of Revenue (NBR) Value Added Tax and Supplementary Duty Act 2012 (মূসক-৬.৩).

## 2. Acceptance Criteria
- **AC-1**: Validate 9-digit or 13-digit Business Identification Numbers (BIN).
- **AC-2**: Decompose taxable amounts, Customs Duty (CD), Supplementary Duty (SD), Standard VAT (15% or reduced), and VAT Deducted at Source (VDS withholding).
- **AC-3**: Format official Mushak 6.3 invoice with itemized line items, seller BIN, buyer BIN, and serial numbers.
- **AC-4**: Generate NBR-standard verification QR code payload embedding challan number, BIN, date, total payable, and SHA-256 digital verification seal.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/tax/mushak-63-engine.ts`
- Routes: `artifacts/api-server/src/routes/mushak-63.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/mushak-63.test.ts`
