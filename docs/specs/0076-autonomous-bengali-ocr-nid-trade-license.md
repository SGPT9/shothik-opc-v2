# Spec 0076: Autonomous Multi-Modal Bengali OCR & NID/Trade License Extraction Engine

## 1. Problem Statement & Domain Reality
In Bangladesh, solo-entrepreneurs (One-Person Companies / OPCs) and micro-merchants face severe friction during merchant onboarding (bKash Merchant Direct, Nagad Sheba, bank KYC, Steadfast/Pathao courier accounts). Onboarding requires manual transcription of bilingual National Identity Cards (NID / জাতীয় পরিচয়পত্র) and municipal Trade Licenses (ট্রেড লাইসেন্স).
Key challenges:
1. **Diverse NID Formats**: 10-digit Smart NID cards, 17-digit legacy cards (containing 4-digit birth year prefix), and 13-digit cards.
2. **Bengali Unicode & Complex Conjuncts**: Bengali script requires accurate character mapping, conjunct (যুক্তবর্ণ) preservation, and English-Bengali dual-name alignment.
3. **Municipal Trade License Variations**: Issued by Dhaka North (DNCC), Dhaka South (DSCC), Chittagong (CCC), Rajshahi, or rural Union Parishads with varying fiscal year notations (e.g. `2025-2026`).
4. **Fraud & Tampering Defense**: Blurry scans, mismatched birth dates, expired trade licenses, and altered numbers must be flagged deterministically with SHA-256 sealed audit dossiers.

## 2. Core Architectural Pillars & Acceptance Criteria

### AC-1: Bengali & English NID Parser & Validation
- Parses 10-digit Smart NID (`^\d{10}$`), 17-digit legacy NID (`^\d{17}$`), and 13-digit legacy NID (`^\d{13}$`).
- If 17-digit, verifies that the first 4 digits match the birth year in `dateOfBirth`.
- Extracts bilingual fields:
  - `nameEn` (string)
  - `nameBn` (string, Unicode normalized NFC)
  - `fatherNameEn` / `fatherNameBn`
  - `motherNameEn` / `motherNameBn`
  - `dateOfBirth` (ISO format `YYYY-MM-DD`)
  - `bloodGroup` (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
  - `nidNumber` (normalized digits)
  - `address` (parsed into district, thana, postCode, fullAddress)

### AC-2: City Corporation & Union Parishad Trade License Extractor
- Normalizes trade license number across DNCC, DSCC, CCC, and Union Parishads.
- Extracts:
  - `businessName` (Bengali & English)
  - `proprietorName`
  - `licenseNumber`
  - `natureOfBusiness` / sector
  - `wardZone`
  - `issuingAuthority` (e.g., "Dhaka North City Corporation", "Union Parishad")
  - `fiscalYear` (e.g. `2025-2026`)
  - `expiryDate` and status (`ACTIVE`, `EXPIRED`, `PENDING_RENEWAL`)

### AC-3: Multi-Modal Zone Detection & Quality Scoring
- Evaluates document scan quality:
  - Resolution & sharpness index ($0.0 - 1.0$)
  - Government seal & crest presence indicator
  - Photo / avatar bounding box extraction
  - Barcode / 2D QR payload extraction
- Generates composite confidence score: $C_{\text{doc}} \ge 0.85$ required for auto-approval.

### AC-4: Cryptographic KYC Audit Dossier with SHA-256 Seal
- Compiles immutable JSON verification dossier:
  - `dossierId`: UUID
  - `documentType`: `NID_SMART` | `NID_LEGACY` | `TRADE_LICENSE`
  - `extractedData`: Normalized fields
  - `confidenceScore`: Float
  - `verdict`: `VERIFIED` | `FLAGGED_REVIEW` | `REJECTED`
  - `flags`: List of warnings (e.g., `EXPIRED_TRADE_LICENSE`, `MISMATCHED_BIRTH_YEAR`, `LOW_RESOLUTION`)
  - `sha256Seal`: Cryptographic SHA-256 digest of payload + timestamp

### AC-5: REST API Endpoints (`@workspace/api-server`)
- `POST /api/v1/kyc/ocr/process-nid`: Process NID image / text payload.
- `POST /api/v1/kyc/ocr/process-trade-license`: Process trade license document.
- `POST /api/v1/kyc/ocr/verify-dossier`: Cryptographic verification check.
- `GET /api/v1/kyc/ocr/dossiers`: List generated KYC dossiers.

### AC-6: Frontend Twin Studio Modal (`KycOcrModal.tsx`)
- Drag-and-drop file upload with live preview.
- Document type selector (Smart NID vs. Legacy NID vs. Trade License).
- Field inspection panel with 1-click copy, confidence badges, and SHA-256 seal verification.
- Integrated into `TwinCommandPalette.tsx` and `twin/page.tsx` with dedicated keyboard shortcut `⌘K` action.

## 3. Test & Verification Plan
- Unit tests for NID format normalization, birth year validation, and trade license status checks.
- API route tests using ephemeral HTTP test server.
- Component test for `KycOcrModal.tsx` rendering and interactive tab switching.
