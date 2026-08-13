# 🚀 Missing Platform Elevators & Viral Trigger Specification
## Completing the Shothik AI Product Experience & Retention Circuit

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Objective**: Identify and specify the missing high-velocity viral triggers, retention loops, and human-in-the-loop overrides.

---

## 1. The 4 Missing High-Impact Platform Triggers

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    MISSING PLATFORM TRIGGERS ARCHITECTURE                   │
 └─────────────────────────────────────────────────────────────────────────────┘
  TRG-08: Viral Achievement Milestones │ TRG-09: bKash Auto-Recharge Trigger
  TRG-10: Live Human Co-Pilot Override  │ TRG-11: Post-Purchase Referral Loop
```

| Trigger ID | Missing Trigger Name | Event / System Condition | Experience Layer Action (UI/UX) | Business & Growth Outcome |
|---|---|---|---|---|
| **TRG-08** | **Viral Achievement Milestones** | Merchant reaches 10 sales or writer hits 10,000 words | **Viral Share Modal** pops up with custom celebratory graphics (*"I made ৳15,000 using Polsia AI!"*). | Shares to Facebook/LinkedIn; awards **50 Free Bonus Credits**. |
| **TRG-09** | **bKash Auto-Recharge Trigger** | Credit balance drops below 20 credits during high sales | **Auto-Debit Toast Notification** prompts: *"Enable ৳500 bKash auto-topup to never drop mid-customer bargain"*. | Prevents zero-credit dropped sales for active merchants. |
| **TRG-10** | **Human-in-the-Loop Co-Pilot Override** | Customer asks a complex custom question on WhatsApp | **Desktop Push & Audio Chime**: *"Take Over Chat"* button overlays WhatsApp management drawer. | Merchant overrides AI in 1 click; AI learns from human answer. |
| **TRG-11** | **Post-Purchase Referral Trigger** | Customer payment verified & parcel booked | **Automated WhatsApp Follow-Up Card**: *"আপনার বন্ধুকে রেফার করুন এবং পান ৳১০০ ক্যাশব্যাক!"* (Powered by OfferKit). | Generates viral referral loops (`K = 1.35`). |

---

## 2. Updated Master Platform Trigger Matrix (TRG-01 to TRG-11)

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                COMPLETE 11-TRIGGER PLATFORM MATRIX                          │
 └─────────────────────────────────────────────────────────────────────────────┘
  TRG-01: Zero-Credit Soft Paywall      │ TRG-02: Scenario Lab Monte Carlo
  TRG-03: Voice Minute Cap Exceeded     │ TRG-04: Twin Task Dispatch
  TRG-05: bKash TrxID & Courier Booking │ TRG-06: /community Skill Forking
  TRG-07: GenOffice DOCX Export         │ TRG-08: Viral Achievement Milestones
  TRG-09: bKash Auto-Recharge Agreement │ TRG-10: Human Co-Pilot Override
  TRG-11: Post-Purchase OfferKit Referral
```

---

## 3. Experience Layer Polish: The "Delight Touches"

1. **bKash Payment Success Audio Chime**:
   - Plays a crisp, cheerful mobile payment chime whenever a customer's `TrxID` is verified on WhatsApp.
2. **Dynamic Revenue Ticker in Header**:
   - Shows live daily revenue (`"Today's bKash Revenue: ৳22,500 BDT"`) directly in `ChatHeader.tsx`.
3. **1-Click WhatsApp Live Takeover**:
   - Allows page owners to jump into any AI-driven customer chat on their smartphone without interrupting the session.

---

## 🧪 Certified Infrastructure Status
- **Git Remote**: Synchronized on `origin release/v2.5.0-polsia-opc` ([`12780ba`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/12780ba)).
- **Live Local Server**: Operational on **`http://localhost:5001`**.
