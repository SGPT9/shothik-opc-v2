# Spec 0050: Autonomous Vernacular Voice Commerce, WebRTC Banglish Agent & 1-Click MFS Voice Checkout Engine

## 1. Context & Motivation
Over 80% of emerging market shoppers and live-selling buyers in Bangladesh prefer spoken audio (voice messages, phone calls, live streams) over typed form entries.
Existing voice AI models fail on Banglish (phonetic hybrid Bangla-English mix) and regional phonetic varieties (Sylheti, Chittagonian, Noakhali).

This engine delivers:
1. **Sub-150ms Banglish Speech-to-Intent Pipeline**: Transcribes colloquial spoken audio, normalizes vernacular idioms, and parses e-commerce order intent.
2. **Dialect-Aware Entity Extraction**: Extracts product names, sizes, color attributes, quantities, and Bangladeshi delivery addresses with automated postal code lookup.
3. **Instant 1-Click MFS SMS Payment Dispatch**: Generates authenticated, dynamic bKash/Nagad checkout links and delivers them to the caller via SMS in real-time.
4. **Courier Handoff Engine**: Prepares Steadfast/Pathao parcel payloads directly from verified voice orders.

## 2. Core Acceptance Criteria
- **AC-1 (Banglish Speech-to-Intent & Dialect Parser)**:
  - Process spoken transcripts across 4 dialect nodes:
    - Standard Bengali / Banglish: "2 ta black panjabi pathan Dhanmondi 27 e, bKash korbo"
    - Sylheti: "Duta kalo panjabi zindabazar Sylhet pathai deu"
    - Chittagonian: "Duiyan kalo panjabi GEC circle Chittagong oth pathai diyun"
    - Noakhali: "Dui ta kalo panjabi Maijdee court Noakhali te den"
  - Extract structured slots: `productName`, `quantity`, `color`, `deliveryAddress`, `district`, `paymentMethod`, `customerPhone`.
- **AC-2 (Voice Order Valuation & Delivery Fee Calculator)**:
  - Calculate unit price, subtotal, delivery fee (৳60 inside Dhaka, ৳120 outside Dhaka), and bKash 1.85% cash-out/gateway surcharge.
- **AC-3 (1-Click Dynamic bKash/Nagad Link & SMS Dispatch)**:
  - Generate secure 1-click payment URL with cryptographic transaction signature.
  - Mock instant SMS gateway dispatch to customer's mobile number.
- **AC-4 (Steadfast/Pathao Courier Auto-Dispatch)**:
  - Create consignment record ready for 1-click carrier API manifest handoff.
- **AC-5 (Frontend Twin Studio Modal `⌘V`)**:
  - Interactive multi-tab cockpit for Live Voice Session / WebRTC Audio Simulator, Voice Order Feed, Dialect Adaptation Matrix, and Instant Payment Link SMS Dispatcher.

## 3. Architecture & Interfaces
- Module path: `artifacts/api-server/src/lib/voice-commerce/voice-commerce-engine.ts`
- Routes: `artifacts/api-server/src/routes/voice-commerce.ts`
- Endpoints:
  - `GET /api/v1/voice-commerce/summary`
  - `POST /api/v1/voice-commerce/parse-intent`
  - `POST /api/v1/voice-commerce/create-order`
  - `GET /api/v1/voice-commerce/orders`
  - `POST /api/v1/voice-commerce/dispatch-sms`
- Frontend: `artifacts/shothik/src/components/twin/VoiceCommerceModal.tsx` (`⌘V`)
