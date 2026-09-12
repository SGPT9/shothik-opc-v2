# Shothik AI: UI/UX Design Philosophy

**Version:** 2.0.0  
**Status:** Production Standard  
**Last Updated:** 2025-06-15  
**Audience:** Product Designers, Frontend Engineers, AI Experience Architects

---

## 🎯 Executive Summary

Shothik AI is not a chatbot. It is an **Agentic Operating System** for South Asian economic workflows. Our UI/UX philosophy rejects Western SaaS conventions in favor of a **Conversational-First, Action-Oriented, Low-Literacy-Inclusive** design system built for the realities of Bangladesh and emerging markets.

### Core Design Mandate
> **"Don't make them think. Make them do."**

Every interface must reduce cognitive load for users operating in high-stress, low-bandwidth, multi-tasking environments (e.g., F-commerce operators managing WhatsApp orders while negotiating with suppliers).

---

## 🏛️ Foundational Principles

### 1. **Conversational Primacy**
The chat interface is the **kernel**, not a feature. All actions originate from natural language (Bangla, Banglish, English).

- **No hidden menus:** Capabilities are discovered through conversation, not navigation.
- **Action Cards > Forms:** Complex inputs (e.g., courier dispatch) appear as pre-filled, editable cards within the chat stream.
- **Voice-First Parity:** Every UI element must have a voice-equivalent interaction model.

### 2. **Economic Visibility**
Users are here to make money or save time. Financial context must be **always visible, never abstract**.

- **Real-Time Ledger:** Every action shows immediate impact on cash flow (bKash/Nagad balance, due payments).
- **Risk Indicators:** Financial risks (e.g., "Customer has 3 unpaid orders") are highlighted before action confirmation.
- **Profit/Loss Micro-Feedback:** After completing a task (e.g., dispatch), show estimated profit margin instantly.

### 3. **Low-Bandwidth Resilience**
Design for 3G networks, low-end Android devices, and intermittent connectivity.

- **Progressive Enhancement:** Core text/voice works offline; rich media (images, maps) loads progressively.
- **Skeleton States:** Never show blank screens. Use contextual skeletons (e.g., "Loading customer history...").
- **Data Saver Mode:** Toggle to disable images/videos, prioritizing text and critical actions.

### 4. **Cultural Localization (Not Just Translation)**
Deep integration of Bangladeshi cultural norms, color semantics, and interaction patterns.

- **Color Semantics:** 
  - 🟢 Green = Success/Halal/Profit (culturally positive)
  - 🔴 Red = Danger/Stop (universal)
  - 🟡 Yellow = Caution/Pending (not "warning" which can be negative)
  - 🔵 Blue = Information/Neutral (avoid for primary actions)
- **Date/Time Formats:** DD/MM/YYYY, 12-hour clock with "AM/PM" in Bangla/English.
- **Number Formatting:** Lakh/Crore system (e.g., ৳ ১,৫০,০০০) alongside international formats.

### 5. **Trust & Transparency**
AI decisions must be explainable, reversible, and auditable.

- **Human-in-the-Loop:** High-risk actions (financial, legal) require explicit confirmation with clear rationale.
- **AI Confidence Scores:** Show confidence levels for AI suggestions (e.g., "85% sure this courier is best").
- **Undo/Redo Everywhere:** Every action can be reversed within a time window (configurable per risk level).

---

## 🎨 Design System: "Shothik Native"

### Typography
- **Primary Font:** `Hind Siliguri` (Google Fonts) - Optimized for Bengali script readability.
- **Secondary Font:** `Inter` - For English text and numbers.
- **Hierarchy:**
  - H1: 24px (Bold) - Page titles
  - H2: 20px (Semi-Bold) - Section headers
  - Body: 16px (Regular) - Chat messages, forms
  - Caption: 14px (Regular) - Metadata, timestamps

### Color Palette
| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `#00A86B` (Green) | `#00C882` | Primary actions, success states |
| Secondary | `#FF9900` (Orange) | `#FFAB40` | Secondary actions, highlights |
| Background | `#FFFFFF` | `#121212` | App background |
| Surface | `#F5F5F5` | `#1E1E1E` | Cards, modals |
| Error | `#D32F2F` | `#EF5350` | Errors, destructive actions |
| Warning | `#FFA000` | `#FFCA28` | Warnings, pending states |
| Info | `#1976D2` | `#42A5F5` | Informational messages |

### Components
- **Action Cards:** Pre-filled forms embedded in chat (e.g., courier dispatch details).
- **Quick Replies:** Contextual buttons below AI messages for common next steps.
- **Ledger Widget:** Persistent mini-ledger showing real-time financial status.
- **Risk Badges:** Visual indicators for high-risk actions (e.g., "⚠️ Unpaid Customer").

---

## 📱 Persona-Specific UX Patterns

### F-Commerce Operator (Rina)
- **Priority:** Speed, multitasking, mobile-first.
- **Key Patterns:**
  - One-tap order confirmation from WhatsApp messages.
  - Voice-to-order entry for hands-free operation.
  - Real-time courier tracking map embedded in chat.
  - Daily profit/loss summary at 9 PM (customizable).

### Academic Researcher (Dr. Rahman)
- **Priority:** Precision, citation management, document handling.
- **Key Patterns:**
  - PDF upload with spatial parsing visualization.
  - Citation verification side-panel with source links.
  - Research notebook auto-save with version history.
  - Export to LaTeX/Word with one click.

### Zero-Capital Creator (Karim)
- **Priority:** Discovery, monetization, low-data usage.
- **Key Patterns:**
  - Trending topics widget with local relevance.
  - Revenue estimator for content ideas.
  - Data saver mode enabled by default.
  - Micro-payment integration (bKash/Nagad) for tips/donations.

### SME Operator (Mr. Ahmed)
- **Priority:** Compliance, team management, scalability.
- **Key Patterns:**
  - Multi-user role-based dashboards.
  - Compliance checklist for tax/VAT filings.
  - Inventory alerts with reorder suggestions.
  - Weekly business health report (PDF/Email).

---

## 🔄 Interaction Models

### Conversational Flow
```
User: "Pathao e parcel pathao" (Send parcel via Pathao)
   ↓
AI: Shows Action Card with pre-filled details (address, item, price)
   ↓
User: Edits address, taps "Confirm"
   ↓
AI: Dispatches to Pathao API, shows tracking link
   ↓
User: Receives WhatsApp notification when delivered
```

### Voice Interaction
- **Wake Word:** "Shothik" (optional, can be disabled).
- **Push-to-Talk:** Hold button to record, release to send.
- **Real-Time Transcription:** Shows text as user speaks (Bangla/Banglish).
- **Voice Feedback:** AI responses can be read aloud (configurable voice/gender).

### Gesture Support
- **Swipe Left:** Dismiss card/notification.
- **Swipe Right:** Quick approve (for low-risk actions).
- **Long Press:** Copy text/share card.
- **Pinch:** Zoom into maps/documents.

---

## ♿ Accessibility & Inclusion

### Low Literacy Support
- **Icon-First Navigation:** Critical actions have recognizable icons (e.g., 📦 for shipping).
- **Audio Guidance:** Optional voice prompts for form filling.
- **Simplified Mode:** Toggle to hide advanced features, show only core actions.

### Disability Accommodations
- **Screen Reader:** Full ARIA labels for all interactive elements.
- **High Contrast Mode:** WCAG AAA compliant color combinations.
- **Motor Impairment:** Large touch targets (min 48x48px), voice control alternative.

### Language Inclusivity
- **Banglish Support:** Accepts romanized Bengali input (e.g., "ami kaj kortesi").
- **Dialect Handling:** Understands regional variations (Dhaka, Chittagong, Sylhet).
- **Code-Switching:** Seamlessly handles mixed Bangla-English sentences.

---

## 📊 Metrics & Validation

### Key UX Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Time-to-First-Action | < 5 seconds | From app open to first user action |
| Task Completion Rate | > 90% | % of started tasks completed |
| Error Recovery Rate | > 85% | % of errors successfully resolved |
| Voice Accuracy | > 95% | Word error rate for Bangla/Banglish |
| Data Usage | < 5MB/session | Average data consumption per session |

### Validation Methods
- **Usability Testing:** Weekly sessions with 5 users per persona.
- **A/B Testing:** All major changes tested on 10% of users first.
- **Heatmaps:** Track touch/click patterns to identify friction points.
- **Session Recordings:** Anonymized recordings for qualitative analysis.

---

## 🚀 Implementation Guidelines

### For Designers
1. **Start with Conversation:** Design chat flows before static screens.
2. **Mobile-First:** All designs must work on 360px width screens.
3. **Prototype Interactions:** Use Figma prototypes with realistic data.
4. **Test Locally:** Validate with Bangladeshi users before global rollout.

### For Engineers
1. **Component Library:** Use `@shothik/ui` package for consistent components.
2. **Performance Budget:** Max 3s load time on 3G networks.
3. **Offline-First:** Cache critical data for offline functionality.
4. **Analytics:** Instrument all user actions for metrics tracking.

---

## 📚 Related Documents
- [Persona Context Profiles](../context-engineering/PERSONA_CONTEXT_PROFILES.md)
- [Context Assembly Architecture](../context-engineering/CONTEXT_ASSEMBLY_ARCHITECTURE.md)
- [Intent-to-Context Router Spec](../context-engineering/INTENT_TO_CONTEXT_ROUTER_SPEC.md)
- [Security & Isolation Boundaries](../context-engineering/CONTEXT_SECURITY_AND_ISOLATION_BOUNDARIES.md)

---

## 📝 Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | Design Team | Initial draft |
| 2.0.0 | 2025-06-15 | AI Experience Team | Agentic OS alignment, persona patterns |

---

*This document is part of the Shothik AI Design System. Unauthorized distribution prohibited.*
