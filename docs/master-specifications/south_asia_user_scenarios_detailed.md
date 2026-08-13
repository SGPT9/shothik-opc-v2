# 🇧🇩 🇮🇳 🇵🇰 🇱🇰 Detailed South Asia-First User Scenarios
## Real-World Founder & Creator Workflows across Dhaka, Bangalore, Karachi, and Colombo

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Auditing Standard**: Demography-Aware South Asia UX & Workflow Reliability Framework  

---

## 🇧🇩 SCENARIO 1: The D2C E-Commerce Brand Founder (Dhaka, Bangladesh)
**User**: Tanvir, Founder of a sustainable clothing brand in Banani, Dhaka  
**Goal**: Handle 500+ daily WhatsApp queries, check bKash payments, and pitch wholesale buyers in the UK.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                SCENARIO 1: DHAKA D2C BRAND FOUNDER                          │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. Banglish Voice Input ──► 2. BDT Financial Model  ──► 3. WhatsApp & Reel DM
  ("bKash sales forecast")    (SheetArtifact ৳1,500 AOV)   (ChatbotX + OpenReply)
```

### Step-by-Step User Journey:
1. **Banglish Dictation Input (00:00 - 01:00)**:
   - Tanvir taps the `Mic` icon in `Composer.tsx` while walking to his store and speaks:  
     > *"আজকের bKash transactions check করে BDT ৳1,500 AOV তে 3-scenario financial forecast বানাও।"*
   - **Buzz Whisper ASR** transcribes the mixed English+Bengali input cleanly; **SheetArtifact.tsx** displays unit economics in Bangladeshi Taka (**BDT ৳**).
2. **GenOffice & Papermark Pitch Deck Generation (01:00 - 03:00)**:
   - Shothik opens `SlidesArtifact.tsx` (16:9 Marp deck). Tanvir uses **PageAgent** voice auto-pilot to polish slide titles.
   - Tanvir clicks **`[ 🔗 Trackable Link ]`** in `SlidesArtifact.tsx` to generate a **Papermark** investor deck link.
3. **Automated WhatsApp & Instagram Reel Conversion (03:00 - 05:00)**:
   - **ChatbotX** handles customer inquiries 24/7 on WhatsApp, auto-replying with catalog links and bKash merchant IDs.
   - Tanvir posts an Instagram Reel showcasing new winter jackets. **OpenReply** watches comments: when followers comment `"CATALOG"`, OpenReply verifies their follow status and DMs the catalog link instantly.

---

## 🇮🇳 SCENARIO 2: The SaaS Tech Startup Founder (Bangalore, India)
**User**: Ananya, Solo Founder of an AI API Platform in Indiranagar, Bangalore  
**Goal**: Validate her API model, perform competitor audits, and pitch VC investors.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │               SCENARIO 2: BANGALORE SAAS TECH FOUNDER                       │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. Keyless Search       ──► 2. GenOffice DOCX/XLSX ──► 3. VTuber Investor Pitch
  (Wigolo + ScrapeGraph)      (INR ₹ Unit Economics)     (Silero VAD + Mem0 RAG)
```

### Step-by-Step User Journey:
1. **Zero-Cost Competitor Audit (00:00 - 01:30)**:
   - Ananya types: *"Audit top 5 DevTools APIs in India & US, extract pricing tiers into a sheet, and calculate CAC payback"*.
   - **Wigolo** searches web sources without API keys; **ScrapeGraphAI** parses pricing tables into `SheetArtifact.tsx` in Indian Rupees (**INR ₹**).
2. **Byte-Exact DOCX Business Plan Export (01:30 - 03:00)**:
   - Shothik compiles an executive report in `DocArtifact.tsx`.
   - Ananya exports it using **GenOffice Docs** to a byte-exact Microsoft Word `.docx` file for her board members.
3. **Interactive VTuber Investor Pitch (03:00 - 05:00)**:
   - Ananya sends her Papermark pitch deck link to a Sequoia India partner.
   - The partner opens the link and meets **Open-LLM-VTuber Presenter** (`vtuber-presenter.ts`). The 3D avatar narrates slides in Indian English.
   - When the partner interrupts mid-slide (*"What's your projected ARR growth rate?"*), **Silero VAD** pauses narration in <50ms and answers accurately via **Mem0 RAG Memory**.

---

## 🇵🇰 SCENARIO 3: The Cross-Border Digital Agency Lead (Karachi, Pakistan)
**User**: Hamza, Managing Director of a design agency in Clifton, Karachi  
**Goal**: Manage international USD ($) retainers while paying local team members in PKR (Rs).

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │             SCENARIO 3: KARACHI CROSS-BORDER AGENCY LEAD                    │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. Multi-Currency Lab   ──► 2. Pipedream SaaS Sync ──► 3. Parallel Web Tasks
  (USD/PKR Sensitivity)       (HubSpot + Slack + QC)   (ego-lite Browser Spaces)
```

### Step-by-Step User Journey:
1. **Multi-Currency FX Sensitivity Model (00:00 - 01:30)**:
   - Hamza uses **ScenarioLabModal.tsx** to simulate USD/PKR exchange rate fluctuations across 100 Monte Carlo runs.
   - The results render in `SheetArtifact.tsx`, showing net profit margins in PKR Rs against USD retainer income.
2. **Pipedream Managed OAuth SaaS Sync (01:30 - 03:00)**:
   - Hamza opens [`/connectors`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/app-next/%28primary-layout%29/connectors/page.tsx) and toggles HubSpot, Slack, and QuickBooks via **Pipedream Connect** with zero API key exposure.
   - Polsia AI Cofounder automatically logs new lead proposals into HubSpot and alerts team leads on Slack.
3. **Parallel Background Web Tasks (03:00 - 05:00)**:
   - **ego-lite** runs in parallel browser spaces to publish portfolio updates on Behance and check Stripe payout schedules without stealing Hamza's screen focus.

---

## 🇱🇰 SCENARIO 4: The Novelist & Scriptwriter (Colombo, Sri Lanka)
**User**: Dilshan, Author and Screenwriter in Colombo  
**Goal**: Write a 70,000-word historical novel, simulate narrative branches, and export EPUB/PDF editions.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                SCENARIO 4: COLOMBO NOVELIST & SCRIPTWRITER                  │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. 3-Fold Studio         ──► 2. Narrative Forecasts ──► 3. Multilingual EPUB
  (ReplitBookWorkspace)        (InkOS Plot Branches)      (epubPdfExporter + DOCX)
```

### Step-by-Step User Journey:
1. **3-Fold Book Writing Workspace (00:00 - 02:00)**:
   - Dilshan opens `/writing-studio?mode=3fold` (`ReplitBookWorkspace.tsx`).
   - **Fold 1** displays Chapter Tree; **Fold 2** presents `BookCenterCanvas.tsx`; **Fold 3** displays Polsia Swarm logs.
2. **InkOS 3-Scenario Narrative Forecasts (02:00 - 03:30)**:
   - Reaching Chapter 8, Dilshan clicks **`[ 🔮 Narrative Forecast ]`** (**InkOS**).
   - InkOS generates 3 plot branches (Hero stays in Colombo vs. escapes to Kandy) and checks **Character Canon Vault** to ensure no continuity errors occur. Dilshan picks Branch B.
3. **EPUB & Word Document Export (03:30 - 05:00)**:
   - Dilshan exports the manuscript using **epubPdfExporter.ts** and **GenOffice Docs** to generate EPUB ebooks and byte-exact `.docx` files.

---

## 📊 Summary Scorecard of South Asia-First Scenarios

| City / Country | User Persona | Primary Engine Stack Used | Core Outcome |
|---|---|---|---|
| 🇧🇩 **Dhaka, Bangladesh** | D2C Apparel Founder | `Buzz Whisper` + `SheetArtifact` + `ChatbotX` + `OpenReply` | **bKash & WhatsApp Sales Automation in Banglish** |
| 🇮🇳 **Bangalore, India** | SaaS Tech Founder | `Wigolo` + `GenOffice` + `vtuber-presenter` + `Silero VAD` | **INR ₹ Financial Models & Live 3D Investor Pitch** |
| 🇵🇰 **Karachi, Pakistan** | Digital Agency Lead | `ScenarioLab` + `Pipedream` + `OpenSearch-VL` + `ego-lite` | **USD/PKR FX Models & Pipedream CRM Automation** |
| 🇱🇰 **Colombo, Sri Lanka** | Novelist & Scriptwriter| `ReplitBookWorkspace` + `InkOS` + `epubPdfExporter` | **3-Scenario Plot Forecasts & EPUB Ebook Publishing** |
