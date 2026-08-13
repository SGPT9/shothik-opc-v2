# Shothik AI / Polsia OPC — Official Production Release Notes v2.6.0

**Release Tag**: `v2.6.0-release`  
**Release Date**: August 13, 2026  
**Target Environment**: InsForge BaaS (`oss-project` / `shothik-web` at `https://ers8j28a.ap-southeast.insforge.app`) & Docker Standalone Container (<88MB) at `https://store.polsia.app`

---

## 🌟 Executive Summary

Release **v2.6.0** introduces the **South Asia & Emerging Markets Hyper-Ecosystem Engine**, empowering merchants, students, digital freelancers, and citizens with demography-aware AI capabilities tailored for Bangladesh, India, and Pakistan.

---

## 🚀 Key Major Features Added in v2.6.0

### 1. 🛍️ 1-Click F-Commerce Merchant Onboarding Wizard
- Parses Facebook Page product catalogs using **ScrapeGraphAI** without needing Meta Graph API tokens.
- Provisions dedicated InsForge PostgreSQL store workspaces with Row-Level Security (`auth.uid() = user_id`).
- Binds custom `.com.bd` domains via Hostinger/BTCL registry and activates bKash/Nagad 1-tap checkout.

### 2. 🎓 BCS & University AI Exam Prep Portal
- Extracts 4-option MCQs with detailed explanations in Bangla & English from textbook PDFs.
- Features **3D VTuber Viva Mock Interview Simulator** with Silero VAD voice interruption and VRM avatar lip-syncing.
- Generates real-time dual-language scorecards with A+ letter grades in Bangla (`bn`) and English (`en`).

### 3. 💳 Freelancer Form C Bank Remittance & NBR Tax Portal
- Enforces **NBR SRO No. 228-Act/Tax/2023 0% tax exemption** for IT/ITeS software export earnings in BDT (৳).
- Generates official Bangladesh Bank Form C Encashment Certificates (`BB_FORMC_...`) required for DBBL, EBL, and BRAC Bank wire clearance.
- Exports byte-exact Microsoft Word `.docx` client invoices for international accounts payable departments.

### 4. 🏛️ CS/SA/RS/BS Land Record Porcha OCR Parser & Khajna Calculator
- Parses historical land survey records (CS 1888-1940, SA 1956-1962, RS 1965-1998, BS City Survey), extracting Khatian #, Dag #, Mouza, and area in Shatak (Decimal).
- Calculates Bangladesh Ministry of Land Development Tax (খাজনা) in BDT ৳ with 10% late surcharges.
- Issues official Ministry of Land e-Challan receipts cleared via 1-tap bKash or Nagad.

### 5. 📱 Demography-Aware 2GB RAM PWA & WhatsApp Suite
- Installs light Service Worker (48MB DOM memory limit) with stale-while-revalidate caching tailored for low-spec 2GB RAM Android phones on 3G cellular network.
- Generates 1-Tap native smartphone app URL schemes (`bkash://pay`, `nagad://pay`) with HTTPS fallback.
- Dispatches order receipts and **Steadfast Courier tracking codes** (`BD_STEADFAST_...`) directly to customer WhatsApp via Pipedream Connect API.

---

## 🧪 Certified Test Verification

| Module | Test File Path | Status |
|---|---|---|
| Merchant Onboarding Service | `merchant-onboarding-wizard.test.ts` | **`✓ PASS`** |
| Merchant Onboarding UI | `MerchantOnboardingWizard.test.tsx` | **`✓ PASS`** |
| BCS Exam Prep Service | `bcs-exam-prep-service.test.ts` | **`✓ PASS`** |
| BCS Exam Prep UI | `BcsExamPrepPortal.test.tsx` | **`✓ PASS`** |
| Freelancer Remittance Service | `freelancer-tax-remittance-service.test.ts` | **`✓ PASS`** |
| Freelancer Remittance UI | `FreelancerTaxRemittanceModal.test.tsx` | **`✓ PASS`** |
| Land Record Porcha Service | `land-record-porcha-service.test.ts` | **`✓ PASS`** |
| Land Record Porcha UI | `LandRecordPorchaModal.test.tsx` | **`✓ PASS`** |
| Low-RAM PWA & WhatsApp | `low-ram-pwa-service.test.ts` | **`✓ PASS`** |
| Low-RAM PWA & WhatsApp UI | `DemographyOptimizationBanner.test.tsx` | **`✓ PASS`** |

---

## 📦 Release Tag & Repository Information

- **Tag**: `v2.6.0-release`
- **Branch**: `release/v2.5.0-polsia-opc`
- **Git Commit**: [`fb12c1b`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/fb12c1b)
