# 📄 PRD: Demography-Aware Autonomous Tech Team Engine
## Building, Optimizing & Scaling Software for South Asian & Emerging Market Demographics

**Document Identifier**: `docs/master-specifications/PRD_demography_aware_autonomous_tech_team.md`  
**Author**: Polsia AI Product Architecture Team  
**Version**: 1.0.0 Production Baseline  
**Status**: Approved & Active  

---

## 1. Executive Overview & Problem Statement

### Problem Statement
Most modern Web / AI frameworks (Next.js 15, Tailwind, OpenAI APIs) are engineered for Western demographics equipped with high-speed 5G broadband, high-end Apple/Intel hardware ($1,200+ laptops), and credit card payment infrastructure (Stripe).

In South Asia (Bangladesh, India, Pakistan) and emerging markets:
1. **Hardware Profile**: Over 85% of target users access applications on **6GB RAM Android smartphones** (Redmi Note, Realme, Samsung Galaxy A-series) on 4G/5G cellular networks, requiring responsive client-side caching and smooth 60fps rendering without excessive memory consumption.
2. **Payment Infrastructure**: Credit cards represent <4% of transactions. Over 96% of payments occur via **Mobile Financial Services (MFS)** like bKash, Nagad, Rocket, and Cash-on-Delivery (COD).
3. **Linguistic Reality**: Users communicate in **Banglish / Code-Mixed Speech** (*"আজকের bKash sales report দেখাও"*), which standard Western LLM prompts fail to transcribe accurately.
4. **Logistics Bottlenecks**: F-Commerce merchants rely on local courier APIs (Steadfast, Pathao, RedX) for parcel delivery and cash collection.

### Solution Overview
The **Demography-Aware Autonomous Tech Team** is an integrated AI agent system that automatically architects, builds, and optimizes software tailored specifically for emerging market demographics.

---

## 2. Target User Personas & Key Pain Points

### Persona 1: Tanvir — Solo F-Commerce Merchant (Dhaka, Bangladesh)
- **Role**: Sells leather jackets and apparel on Facebook & WhatsApp.
- **Pain Points**: Spends 6 hours/day manually answering bargaining customers, checking bKash `TrxID` SMS alerts, and handwriting Steadfast delivery labels.
- **Needs**: AI agent that bargains in Banglish, verifies bKash payments automatically, and books courier pickup in 1 click.

### Persona 2: Nusrat — University Student & Content Creator (Chittagong)
- **Role**: Writes ebooks and academic research papers on a budget $100 Android phone.
- **Pain Points**: Heavy web applications freeze her browser; international credit card paywalls block her from using ChatGPT.
- **Needs**: Low-RAM responsive workspace with ৳100 BDT bKash credit top-ups.

---

## 3. Functional Specifications

### 🎯 Feature 1: Mobile-First 6GB RAM Performance Engine
- **Requirement**: Sustained 60fps responsiveness, instant IndexedDB state hydration, and zero UI freezing on 6GB RAM Android smartphones with graceful fallback for lower memory tiers.
- **Implementation**:
  - StyleX / Vanilla compile-time CSS engine with 0ms runtime recalculation overhead.
  - Client-side WebAssembly linear memory vector buffer and IndexedDB offline cache.
  - Virtualized lists for long chat histories (`Transcript.tsx`).
  - Next.js standalone Docker container builds <88MB.

### 💳 Feature 2: South Asian MFS Payment Gateway Integration
- **Requirement**: Support 1-tap bKash, Nagad, and Rocket payments with SMS verification.
- **Implementation**:
  - Generates 1-tap deep links (`https://pay.bkash.com.bd/...`) opening the native bKash app on mobile devices.
  - Webhook listener matching 10-character `TrxID` strings against merchant SMS notifications ([`bkash-nagad-adapter.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/bkash-nagad-adapter.ts)).

### 🗣️ Feature 3: Banglish Code-Mixed Speech & NLP Parser
- **Requirement**: Transcribe mixed English + Bengali voice dictation with 98%+ accuracy.
- **Implementation**:
  - Buzz-Whisper ASR pipeline ([`buzz-whisper-service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/buzz-whisper-service.ts)) tuned with a custom South Asian business dictionary (`bKash`, `Nagad`, `TrxID`, `Steadfast`, `Dhaka`).

### 🚚 Feature 4: Automated Courier Parcel Booking API
- **Requirement**: Automatically book courier delivery upon payment confirmation.
- **Implementation**:
  - Calls Steadfast / Pathao / RedX Courier REST API ([`sales-negotiation-courier.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/sales-negotiation-courier.ts)).
  - Generates consignment ID and tracking URL (`BD_STEADFAST_755448`), DMing it to the customer on WhatsApp.

---

## 4. Non-Functional Requirements

- **Performance**: Initial page load LCP < 1.2s on 3G cellular connections; JavaScript bundle size < 120KB gzipped.
- **Reliability**: 99.9% uptime guaranteed by Hostinger VPS DeepSeek R1 failover node (`187.127.125.115:11434`).
- **Security**: InsForge Row-Level Security (RLS) policies enforcing JWT authentication; zero storage of raw customer bKash PINs or passwords.
- **Accessibility (A11y)**: WCAG AA compliant contrast ratios and keyboard navigation across all canvas elements.

---

## 5. Out-of-Scope & Future Iterations

- **Out-of-Scope (Sprint 1)**: Native iOS Swift app (Web / PWA mobile experience is prioritized for Android dominance).
- **Future Iterations (Sprint 2)**: Integration with Indian UPI payment gateways and Pakistani JazzCash / EasyPaisa adapters.

---

## 🧪 Certified System Status
- **Skill File Created**: [`.agents/skills/demography-aware-tech-team/SKILL.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/.agents/skills/demography-aware-tech-team/SKILL.md).
- **PRD Document**: [`docs/master-specifications/PRD_demography_aware_autonomous_tech_team.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/docs/master-specifications/PRD_demography_aware_autonomous_tech_team.md).
- **Git Branch**: Synchronized on `release/v2.5.0-polsia-opc`.
