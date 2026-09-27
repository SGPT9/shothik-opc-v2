# Spec 0059: Autonomous Banglish Voice IVR, Automated COD Order Verification & Courier Return Minimization Engine

## 1. Executive Summary & Objective
An autonomous voice & messaging order verification operations system for South Asian (especially Bangladeshi) One-Person Companies (OPCs) and social commerce merchants:
1. **Banglish / Bangla Natural Voice IVR Call Engine**: Generates interactive natural voice call dialogues (in colloquial Banglish/Dhaka dialect) to confirm Cash-on-Delivery (COD) orders, ask for address corrections, or schedule delivery timeframes.
2. **AI Return-to-Origin (RTO) Fraud Risk Radar**: Analyzes buyer risk using phone number patterns, order value, delivery address completeness, and simulated courier historical delivery rate metrics (Steadfast/Pathao fraud scoring).
3. **Hyperlocal Address Normalizer & Thana Resolution**: Automatically parses messy unstructured Bangladeshi addresses (e.g. "Road 11, House 42, Block C, Mirpur 2, Dhaka") into structured District, Thana/Upazila, Sub-district, Area, and Postcode.
4. **Automated Courier Consignment Dispatch & Verification Seal**: Automatically books verified consignments into courier APIs (Pathao/Steadfast/RedX) upon confirmed phone or WhatsApp prompt with SHA-256 sealed verification logs.
5. **Frontend AG-UI Twin Studio Modal**: Responsive cockpit with keyboard shortcut `⌘V` (or `Ctrl+V`), interactive audio call simulator, RTO risk badge, and live courier booking dispatch.

---

## 2. Acceptance Criteria

- **AC-1**: Banglish/Bangla Voice IVR Call Engine: Generates dynamic dialogue scripts with audio synthesis metadata, interactive keypad/voice options (1: Confirm, 2: Change Address, 3: Cancel), and fallback to WhatsApp prompt.
- **AC-2**: RTO Risk & Fraud Scoring Engine: Evaluates order risk score (0-100), risk tier (LOW, MEDIUM, HIGH, BLOCKED), flags suspicious patterns (incomplete address, high COD amount, high-risk courier blacklist).
- **AC-3**: Hyperlocal Address Parser: Parses unstructured addresses into structured format (`district`, `thana`, `area`, `road_house`, `postcode`), suggests normalized courier zone.
- **AC-4**: Courier Consignment Dispatch & Verification Audit: Creates courier consignment payloads with tracking IDs and cryptographically sealed audit records (`sha256`).
- **AC-5**: Frontend Studio Modal: Interactive React/Next.js modal with shortcut `⌘V`, interactive call audio simulation, RTO risk inspection, and instant courier dispatch.
