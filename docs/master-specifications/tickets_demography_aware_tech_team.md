# 🎟️ Implementation Tickets: Demography-Aware Autonomous Tech Team
## Incremental Execution Plan Derived from PRD_demography_aware_autonomous_tech_team.md

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Parent PRD**: [`PRD_demography_aware_autonomous_tech_team.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/docs/master-specifications/PRD_demography_aware_autonomous_tech_team.md)  
**Status**: Ready for Sequential Execution  

---

## 📋 Master Ticket Dependency Map

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                  IMPLEMENTATION TICKET DEPENDENCY GRAPH                     │
 └─────────────────────────────────────────────────────────────────────────────┘
   Ticket #1: Low-RAM StyleX Optimization  ──► Ticket #2: 1-Tap bKash Deep-Link
                                                         │
   Ticket #4: Courier Auto-Dispatch       ◄── Ticket #3: Banglish Speech Tuning
```

---

## 🎟️ Ticket Breakdown

### 🎟️ Ticket #1: Low-RAM Android Device Optimization & StyleX Layout Engine
- **Priority**: High (P0)
- **Dependencies**: None
- **Scope**:
  - Integrate Meta Astryx StyleX compile-time CSS into the chat transcript (`Transcript.tsx`) & canvas drawers.
  - Implement virtualized list rendering for long chat message histories to prevent DOM thrashing on 2GB RAM budget smartphones.
- **Acceptance Criteria**:
  - [ ] 0ms runtime CSS calculation overhead during message streaming.
  - [ ] Page load LCP < 1.2s on simulated 3G network conditions.

---

### 🎟️ Ticket #2: 1-Tap bKash / Nagad Mobile App Deep-Link Card
- **Priority**: High (P0)
- **Dependencies**: Depends on Ticket #1
- **Scope**:
  - Add `renderBkashDeepLinkCard()` in [`sales-negotiation-courier.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/sales-negotiation-courier.ts).
  - Render 1-tap mobile app URL schemes (`https://pay.bkash.com.bd/...`) inside chat bubbles and WhatsApp DMs.
- **Acceptance Criteria**:
  - [ ] Tapping the link on an Android smartphone opens the native bKash/Nagad mobile app with pre-filled merchant account and payable amount.
  - [ ] Renders fallback QR code modal for desktop users.

---

### 🎟️ Ticket #3: Banglish Code-Mixed Lexicon Tuning for Buzz-Whisper ASR
- **Priority**: Medium (P1)
- **Dependencies**: None
- **Scope**:
  - Add South Asian business dictionary (`bKash`, `Nagad`, `TrxID`, `Steadfast`, `Dhaka`, `Banani`) to [`buzz-whisper-service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/buzz-whisper-service.ts).
  - Tune speech activity threshold for noisy street environments in Bangladesh.
- **Acceptance Criteria**:
  - [ ] 98%+ transcription accuracy on code-mixed Banglish voice audio clips (*"আজকের bKash sales report দেখাও"*).

---

### 🎟️ Ticket #4: Steadfast & Pathao Courier Auto-Dispatch Webhook Trigger
- **Priority**: Medium (P1)
- **Dependencies**: Depends on Ticket #2
- **Scope**:
  - Connect `verifyPayment()` in [`bkash-nagad-adapter.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/bkash-nagad-adapter.ts) directly to `bookParcelDelivery()`.
  - Automatically generate tracking codes (`BD_STEADFAST_755448`) and DM tracking links to customers via WhatsApp API upon bKash payment verification.
- **Acceptance Criteria**:
  - [ ] Submitting a valid 10-character `TrxID` automatically triggers Steadfast parcel booking and outputs tracking link.

---

## 🧪 Execution Strategy
We will execute **Ticket #1** (Low-RAM Android Device & StyleX Optimization) first, followed sequentially by Tickets #2, #3, and #4!
