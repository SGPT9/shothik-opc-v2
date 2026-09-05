# ShothikGPT — Service List

> **Core Principle:** ShothikGPT combines these services into a single **AI execution platform** where users describe what they want, and AI agents help execute the outcome.

---

## 🧭 Platform Service Taxonomy

```
                              ┌────────────────────────┐
                              │  Universal Intent Bar  │
                              │     "Ask / Describe"   │
                              └───────────┬────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    ShothikGPT AI Execution Platform   │
                      │  (Intent Engine + Swarm Orchestrator) │
                      └───────────────────┬───────────────────┘
                                          │
    ┌──────────────┬──────────────┬───────┴──────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼
1. AI Exec   2. Academic   3. Writing     4. Creative    5. Twin        6. Commerce
    │              │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼              ▼
7. Logistics  8. Venture    9. Convers.   10. Publish   11. Agent Svc  12. Payments
```

---

### 1. ⚡ AI Execution
* **Core Function:** Turn user intent into completed work.
* **Key Offerings:**
  - AI agents, workflows, tool use, and human approvals
  - Text, voice, PDF, URL, and multimodal input
  - Execution pipeline: **Observe $\to$ Understand $\to$ Decide $\to$ Execute $\to$ Learn**
  - Ephemeral sandbox execution with zero-leak memory isolation
* **Codebase Anchors:**
  - [`artifacts/api-server/src/lib/twin/task-runner.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/twin/task-runner.ts)
  - [`artifacts/api-server/src/routes/twin-tasks.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/twin-tasks.ts)

---

### 2. 🎓 Academic & Research
* **Core Function:** End-to-end academic and scholarly workflow acceleration.
* **Key Offerings:**
  - Research assistance & deep literature review
  - Thesis & dissertation creation workspaces
  - Research paper creation and peer-review proofing
  - Literature synthesis and knowledge graph extraction
  - Citations & reference formatting (APA, MLA, Chicago, IEEE, Harvard)
  - Academic writing, rigorous tone calibration, and structural editing
* **Codebase Anchors:**
  - [`services/citationDetector.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/citationDetector.ts)
  - [`THESIS.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/THESIS.md)

---

### 3. ✍️ Writing & Content Creation
* **Core Function:** Comprehensive linguistic and content intelligence suite.
* **Key Offerings:**
  - Semantic paraphrasing across multi-tone presets
  - Contextual grammar and punctuation correction
  - Bulleted and executive summarization
  - Polyglot translation across 50+ languages with native Bengali (bn-BD) nuance
  - AI humanization (natural cadence restructuring)
  - Plagiarism checking with source attribution
  - Citation generation
  - Document and book creation
* **Codebase Anchors:**
  - [`services/grammar-checker.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/grammar-checker.service.ts)
  - [`services/paraphrase.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/paraphrase.service.ts)
  - [`services/summarize.service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/summarize.service.ts)
  - [`services/plagiarismService.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/plagiarismService.ts)

---

### 4. 🎨 Creative & Professional Creation
* **Core Function:** Production of high-value intellectual, creative, and enterprise artifacts.
* **Key Offerings:**
  - Books and manuscripts with chapter pacing and tone consistency
  - Pitch decks (Slide Studio with automated layout rendering)
  - Business documents, executive proposals, and whitepapers
  - Product Requirement Documents (PRDs) with technical specs
  - Financial models (runway estimation, cash burn, unit economics)
  - Interactive presentations and structured artifacts
* **Codebase Anchors:**
  - [`services/createPresentationServer.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/services/createPresentationServer.ts)
  - [`artifacts/shothik/src/components/work-canvas`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/work-canvas)

---

### 5. 🏛️ Twin — Business Automation
* **Core Function:** Autonomous business execution layer for the One Person Company (OPC).
* **Key Offerings:**
  - AI-powered business operations across 10 specialized domains
  - Customer support automation with multilingual dialect handling
  - Agent orchestration with shared memory and cross-twin synergy
  - Human-supervised business execution (**Protected Action Gate**)
  - Persistent business workflows running 24/7 without context decay
* **Codebase Anchors:**
  - [`TWIN_DOCTRINE.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/TWIN_DOCTRINE.md)
  - [`artifacts/api-server/src/lib/twin/twin-orchestrator.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/twin/twin-orchestrator.ts)

---

### 6. 🛍️ Commerce & F-Commerce Automation
* **Core Function:** Unified commercial operations for South Asian digital merchants.
* **Key Offerings:**
  - Facebook Page & Messenger automated conversational commerce
  - WhatsApp Business commerce, order confirmation, and automated status pings
  - WooCommerce bi-directional product and inventory sync
  - Daraz marketplace seller integration
  - Order lifecycle management (pending, confirmed, packed, dispatched, delivered)
  - Merchant analytics and customer lifetime value tracking
* **Codebase Anchors:**
  - [`artifacts/api-server/src/routes/whatsapp.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/whatsapp.ts)
  - [`artifacts/shothik/src/app-next/(primary-layout)/connectors/page.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/app-next/(primary-layout)/connectors/page.tsx)

---

### 7. 🚚 Logistics & Courier Automation
* **Core Function:** Automated courier dispatch, COD management, and parcel telemetry.
* **Key Offerings:**
  - Steadfast Courier API direct integration
  - Pathao Courier automated consignment booking
  - RedX courier gateway support
  - 1-click parcel booking with automatic recipient phone validation
  - Real-time parcel tracking and customer delivery notification
  - Cash-on-Delivery (COD) reconciliation with bank/MFS settlement
  - Return-to-origin (RTO) anomaly detection and fraud prevention
* **Codebase Anchors:**
  - [`artifacts/api-server/src/lib/couriers/steadfast-client.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/couriers/steadfast-client.ts)
  - [`artifacts/api-server/src/routes/courier-tracking.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/courier-tracking.ts)

---

### 8. 🚀 Venture Creation
* **Core Function:** From raw entrepreneurial idea to validated, operating enterprise.
* **Key Offerings:**
  - Idea validation through competitive landscape extraction
  - Market research & South Asian demographic demand modeling
  - Market-gap analysis and defensible moat identification
  - Startup/venture planning with iterative milestone tracking
  - PRD generation with tech stack recommendations
  - Financial modeling (CAC, LTV, gross margin, payback periods)
  - Investor pitch-deck generation
  - Launch planning and go-to-market execution roadmaps
* **Codebase Anchors:**
  - [`docs/south-asian-userbase-mapping.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/docs/south-asian-userbase-mapping.md)
  - [`artifacts/api-server/src/routes/venture-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/venture-engine.ts)

---

### 9. 🗣️ Conversational AI
* **Core Function:** High-empathy, contextual, voice-enabled conversational intelligence.
* **Key Offerings:**
  - Fluid AI chat with dynamic canvas rendering
  - Real-time voice interaction and audio synthesis
  - Accurate Bengali, English, and Banglish speech-to-text
  - Contextual conversations anchored in persistent workspace memory
  - Conversational-to-workflow handoff (turning dialogue into concrete tasks)
* **Codebase Anchors:**
  - [`artifacts/api-server/src/routes/voice.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/voice.ts)
  - [`artifacts/api-server/src/lib/vernacular-dialects.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/vernacular-dialects.ts)

---

### 10. 📖 Publishing & Print-on-Demand
* **Core Function:** Physical book manufacturing and localized digital publishing.
* **Key Offerings:**
  - Manuscript-to-book automated typesetting and production
  - Professional book interior formatting and cover design
  - Interactive 3D book previews with page-turn physics
  - Print-ready PDF generation with trim marks, bleeds, and imposition calculation
  - Nilkhet (Dhaka) print-on-demand press integration
  - Physical order fulfillment and door-to-door courier delivery
* **Codebase Anchors:**
  - [`artifacts/api-server/src/routes/nilkhet-pod-direct-api.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/nilkhet-pod-direct-api.ts)
  - [`artifacts/api-server/src/routes/__tests__/nilkhet-pod-direct-api.test.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/__tests__/nilkhet-pod-direct-api.test.ts)

---

### 11. 🤖 AI Agent Services
* **Core Function:** Swarm intelligence and autonomous agent execution infrastructure.
* **Key Offerings:**
  - Specialized AI agents (Developer, Marketing, Sales, SEO, Operations, etc.)
  - Multi-agent orchestration with DAG task delegation
  - Secure sandboxed tool execution (Bash, Python, AST, WebGPU)
  - Long-running background tasks with reactive notification
  - Human-in-the-loop approvals for sensitive or irreversible operations
  - Full agent activity audit trails, cost attribution, and execution observability
* **Codebase Anchors:**
  - [`artifacts/api-server/src/lib/twin/developer-twin-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/twin/developer-twin-engine.ts)
  - [`artifacts/api-server/src/lib/vast-spot-orchestrator.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/vast-spot-orchestrator.ts)
  - [`artifacts/api-server/src/routes/twin-specialized-swarm.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/twin-specialized-swarm.ts)

---

### 12. 💳 Payments & Monetization Infrastructure
* **Core Function:** Outcome-driven financial rails and localized payment processing.
* **Key Offerings:**
  - Outcome-based payments (pay on successful milestone completion)
  - Credit and usage management with transparent token cost accounting
  - Subscription management with tier entitlements
  - Native bKash, Nagad, and Rocket MFS integration (with automated 1.85% fee handling)
  - Instant checkout, TrxID verification, and automated cryptographic webhooks
* **Codebase Anchors:**
  - [`artifacts/api-server/src/lib/mfs/bkash-pgw-client.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/mfs/bkash-pgw-client.ts)
  - [`artifacts/api-server/src/lib/token-cost-tracker.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/token-cost-tracker.ts)
  - [`artifacts/shothik/src/components/credits/CreatorCashoutModal.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/credits/CreatorCashoutModal.tsx)

---

## 🏛️ Strategic Alignment

Every service operates under the **Shothik Triad**:
1. **Writing Suite** $\longrightarrow$ Refine, translate, and verify written knowledge.
2. **Creative Studio** $\longrightarrow$ Synthesize substantial assets (books, decks, PRDs, code).
3. **Twin Execution Engine** $\longrightarrow$ Automate, transact, dispatch, and operate the One Person Company.
