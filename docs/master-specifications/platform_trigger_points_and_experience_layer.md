# ⚡ Platform-Wide Trigger Points & Experience Layer Architecture
## Mapping Every Event Trigger, UX Touchpoint & Monetization Action Across Shothik AI

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Core Objective**: Define exact system triggers, user actions, and Experience Layer UI/UX responses across all product surfaces.

---

## 1. Master System Trigger Points Matrix

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                PLATFORM-WIDE TRIGGER POINTS ARCHITECTURE                    │
 └─────────────────────────────────────────────────────────────────────────────┘
  TRG-01: Zero-Credit Soft Paywall      │ TRG-02: Scenario Lab Monte Carlo
  TRG-03: Voice Minute Cap Exceeded     │ TRG-04: Twin Task Dispatch
  TRG-05: bKash TrxID & Courier Booking │ TRG-06: /community Skill Forking
```

| Trigger ID | Category | Event / User Action | System Condition | Experience Layer Action (UI/UX) | Monetization / Action Outcome |
|---|---|---|---|---|---|
| **TRG-01** | **Credit Balance** | User runs out of credits during Chat / Search | Credit balance = 0 | **Inline Glassmorphic bKash Top-Up Modal** slides inside chat bubble with 1-tap bKash QR. | User tops up ৳100 BDT (100 Credits). |
| **TRG-02** | **Chat Mode 3** | User requests 3-Scenario Monte Carlo Report | User clicks "Run Monte Carlo Forecast" | **Scenario Lab Canvas Drawer** opens with animated risk curves & badge: *"5 Credits required"*. | Deducts 5 Credits; generates PDF/Sheet report. |
| **TRG-03** | **Voice Agent** | User exceeds 5 free voice minutes per day | Voice time > 300s | **VTuber Voice Avatar** speaks softly: *"৫ ফ্রি মিনিট শেষ। Pro সদস্য হউন অথবা ক্রেডিট ব্যবহার করুন।"* | Prompts ৳600/mo Pro Merchant upgrade or 3 credits/min. |
| **TRG-04** | **Twin Agent** | User dispatches background job to Second-Me Twin | User clicks "Run Overnight Task" | **Overnight Task Drawer** displays estimated task credit cost (~12-20 Task Credits). | Deducts Task Credits; routes to Hostinger VPS DeepSeek R1. |
| **TRG-05** | **F-Commerce** | bKash `TrxID` verified on WhatsApp | SMS Webhook match | **WhatsApp Bot Card** prompts merchant: *"১-ক্লিকে স্টেডফাস্ট কুরিয়ারে পার্সেল বুক করবেন? (২ ক্রেডিট)"*. | Auto-calls Steadfast API & returns tracking URL. |
| **TRG-06** | **Community** | User clicks "Fork Artifact" or "Use Skill" in `/community` | User forks skill | **Community Fork Drawer** displays creator bio, 80/20 credit split indicator, and "Fork & Edit in 3-Fold Workspace" button. | Deducts 10 Credits (80% creator / 20% platform). |
| **TRG-07** | **Document Studio** | User exports byte-exact `.docx` Word manuscript | User clicks "Export DOCX" | **GenOffice Progress Bar** shows byte-exact XML patching with 4 Credit deduction badge. | Deducts 4 Credits; downloads `.docx` file. |

---

## 2. The Experience Layer Architecture (UI/UX Principles)

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                  SHOTHIK EXPERIENCE LAYER ARCHITECTURE                      │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. Contextual Drawers       │ Non-intrusive side panels (user never loses context)
  2. Local Currency First     │ ৳100 BDT bKash / Nagad 1-tap mobile app deep-linking
  3. Voice Avatar Integration │ VTuber 3D Avatar narrating briefings & trigger points
  4. Subtle Haptics & Sound   │ Success chimes on bKash verify & courier bookings
```

### 🎨 1. Non-Intrusive Contextual Drawers
- **Principle**: Never kick the user out of their current workflow to a separate billing page.
- **Implementation**: All trigger points (bKash top-up, Scenario Lab Monte Carlo export, Steadfast courier booking) open as **Glassmorphic Contextual Drawers** overlaying the right panel of the 3-Fold Workspace.

### 🎨 2. Local Currency & Mobile App Deep-Linking
- **Principle**: Zero friction for South Asian merchants and students without international credit cards.
- **Implementation**: All payment triggers render **1-Tap bKash / Nagad App Deep Links** (`https://pay.bkash.com.bd/...`) that automatically open the native bKash mobile app on smartphones.

### 🎨 3. Voice Avatar Conversational Prompts
- **Principle**: Turn rigid paywalls into natural conversational moments.
- **Implementation**: The **VTuber 3D Voice Avatar** ([`vtuber-presenter.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/vtuber-presenter.ts)) speaks trigger notifications aloud during voice calls (*"আপনার বিকাশ পেমেন্ট ভেরিফাই হয়েছে! পার্সেল বুকিং করা হয়েছে।"*).

---

## 3. Trigger & Experience Layer Code Integration Map

| Trigger ID | Infrastructure File | UI Experience Component |
|---|---|---|
| **TRG-01** (Credit Top-Up) | [`lib/economic-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/economic-engine.ts) | [`SendCreditsButton.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/credits/SendCreditsButton.tsx) |
| **TRG-02** (Scenario Lab) | [`scenario-lab-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/scenario-lab-engine.ts) | [`ScenarioLabModal.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/scenariolab/ScenarioLabModal.tsx) |
| **TRG-03** (Voice Agent) | [`omni-voice-executive.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/omni-voice-executive.ts) | `VoiceAgentModal.tsx` |
| **TRG-05** (bKash & Courier) | [`sales-negotiation-courier.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/sales-negotiation-courier.ts) | [`ArtifactPanel.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/chat/ArtifactPanel.tsx) |
| **TRG-06** (Community Fork) | `docs/community-playbook.md` | [`FeedCard.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/discover/FeedCard.tsx) |

---

## 🧪 Certified Infrastructure Status
- **Git Commit**: Synchronized on `origin release/v2.5.0-polsia-opc` ([`12780ba`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/12780ba)).
- **Live Local Server**: Operational on **`http://localhost:5001`**.
