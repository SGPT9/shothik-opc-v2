# 🗺️ Shothik AI: Master User Journey Mind Map & Workspace Architecture

---

## 1. User Types & Archetypes (Who They Are & Why They Come)

```mermaid
mindmap
  root((Shothik AI))
    Student & Academic
      Thesis & Term Paper Writing
      Bangla & English Grammar Fix
      Plagiarism & AI Detection Defense
      BCS & Govt Exam Prep
      Citation & Bibliography Generator
    Book Author & Publisher
      BoiMela 3D Manuscript Studio
      Chapter-by-Chapter Beat Planning
      Bengali Typography (SolaimanLipi)
      6x9 Royal Demy Print Layout
      300 DPI CMYK PDF Exporter
    Founder & Knowledge Worker
      Deep Market Intelligence (TAM/SAM)
      10-Slide Investor Pitch Deck
      Financial Models (ScenarioLab Sheet)
      Contract & Policy Analysis
      Fullstack Web & Code Sandbox
    F-Commerce & SME Merchant
      Banglish Customer Chat Twin
      bKash & Nagad MFS Verification
      Steadfast Courier Parcel Booking
      Social Media Copy & Ad Creatives
```

---

## 2. End-to-End User Journey (How They Arrive ➔ What They See ➔ How They Deliver)

```mermaid
graph TD
  subgraph Phase1["1. Acquisition & Entry"]
    A1["🎓 Campus Ambassadors & TikTok"] --> Entry["http://localhost:5000"]
    A2["📖 Amar Ekushey BoiMela Community"] --> Entry
    A3["💼 Steadfast Courier Merchant Portal"] --> Entry
    A4["🔍 Organic Search (বাংলা AI)"] --> Entry
  end

  subgraph Phase2["2. First Paint Experience (Ask-First Minimalist Shell)"]
    Entry --> Shell["DeepSeek Minimalist Canvas"]
    Shell --> Hero["Centered Mode Switcher (Chat | Work Canvas)"]
    Hero --> Greeting["'What do you want to accomplish today?'"]
    Greeting --> Starter["3 Outcome Cards (Research | Analysis | Create)"]
    Starter --> Composer["Centered Clean Composer + Voice Orb + Tools"]
  end

  subgraph Phase3["3. Intent-First Autonomous Routing"]
    Composer --> IntentEngine{"Natural Language Intent Classifier"}
    IntentEngine -->|"Thesis / Paper"| FlowWriting["Writing Studio / BoiMela 3D"]
    IntentEngine -->|"Market / Stats"| FlowResearch["Deep Research (Multi-Source Grid)"]
    IntentEngine -->|"Pitch Deck"| FlowSlides["Slide Studio (10-Slide Marp Deck)"]
    IntentEngine -->|"Tax / Projection"| FlowSheets["ScenarioLab (Spreadsheet Canvas)"]
    IntentEngine -->|"Voice Session"| FlowVoice["3D Conversational Voice Orb"]
  end

  subgraph Phase4["4. Interactive Canvas & Co-Creation"]
    FlowWriting --> Canvas["55/45 Proportional Split Workspace"]
    FlowResearch --> Canvas
    FlowSlides --> Canvas
    FlowSheets --> Canvas
    FlowVoice --> Canvas
  end

  subgraph Phase5["5. Monetization & Value Realization"]
    Canvas --> Value{"Delivery Point"}
    Value -->|"Exam Crunch / 1-Off"| Pay1["৳100 bKash Quick Pass (80 Credits)"]
    Value -->|"Author & Pro Creator"| Pay2["৳450/mo Pro Creator Tier"]
    Value -->|"F-Commerce Automation"| Pay3["৳1,500/mo Merchant Twin Tier"]
  end
```

---

## 3. Comparative Benchmarking: What We Learn From Other Agent Workspaces

| Agent Workspace | Key Strengths & Patterns | What Shothik Adopts & Adapts | What We Avoid |
| :--- | :--- | :--- | :--- |
| **DeepSeek** | • Ultra-focused Ask-First composer<br>• Quiet, collapsible `<think>` reasoning traces<br>• Zero cognitive friction on first paint | • Clean centered hero greeting + 3 intent cards<br>• Bengali thinking accordion (`ThinkBox`) with live word metric and 1-click trace copy | • Raw debug stacks on user surfaces<br>• Mode pre-selection requirements |
| **Claude Artifacts** | • 50/50 dual-pane live canvas<br>• Editable persistent outputs alongside chat | • 55/45 proportional split with non-occluding draggable handle<br>• Direct handoff into specialized studios | • Static non-interactive preview panels |
| **Perplexity AI** | • Epistemic citation badges `[1]` `[2]`<br>• Visual source domains grid<br>• Pro Search multi-step trail | • Perplexity Sources Grid & Related Queries in research tab<br>• One-click verifiable document coordinates | • Ad clutter and intrusive paywall banners |
| **v0 by Vercel** | • Live interactive UI sandboxes<br>• Instant code run & visual feedback | • Web REPL sandbox runner in Markdown code blocks<br>• CMYK 3D BoiMela live page-flip preview | • Forcing code view when user wanted human copy |
| **Genspark / Devin** | • Multi-agent planning & execution checklist<br>• Checkpoint approvals for dangerous actions | • Inline Approval Cards for irreversible actions<br>• Background Overnight Jobs with wake-up sync | • Overwhelming non-technical users with raw terminal outputs |

---

## 4. Monetization Matrix (Demography-Tailored for South Asia)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                SHOTHIK TIERED MONETIZATION ENGINE                                      │
├─────────────────────────┬─────────────────────────┬──────────────────────────┬─────────────────────────┤
│    ৳100 Micro-Pass      │   ৳450/mo Student Pro   │   ৳1,200/mo Author Pro   │  ৳1,500/mo Merchant Pro │
│   (Casual & Students)   │   (Academics & Thesis)  │   (Writers & Publishers) │   (F-Commerce Stores)   │
├─────────────────────────┼─────────────────────────┼──────────────────────────┼─────────────────────────┤
│ • 80 Instant Credits    │ • 600 Monthly Credits   │ • Unlimited 3D BoiMela   │ • Unlimited Sales Twin  │
│ • bKash/Nagad 1-click   │ • AI Detector Defense   │ • 300 DPI CMYK PDF Export│ • Steadfast Courier API │
│ • 2 Deep Research runs  │ • Full Citation Engine  │ • Bengali Font Licensing │ • NBR Invoice Generator │
│ • Valid 14 Days         │ • Word/LaTeX Export     │ • ISBN & Barcode Tool    │ • Realtime bKash Reconc │
└─────────────────────────┴─────────────────────────┴──────────────────────────┴─────────────────────────┘
```

---

## 5. UI Architecture Action Plan for Immediate Polish

1. **Center `[💬 Chat | 🎴 Work Canvas]` Switcher**:
   - Move the mode switcher directly above *"What do you want to accomplish today?"* on the empty state canvas.
2. **Prominent 3D Voice Orb Launcher**:
   - Mount an explicit interactive Voice Orb button directly in the composer bottom toolbar and header.
3. **Backend-Free Human Persona Taxonomy**:
   - `Shothik Core` (General AI) ➔ `Deep Analyst` (Research & Papers) ➔ `Creative & Business Partner` (Manuscripts & Slides).
4. **Focused Tools Menu**:
   - Clean, outcome-oriented tools (*Deep Research*, *Slide Studio*, *Financial Model*, *Code Engine*, *3D BoiMela Studio*).
