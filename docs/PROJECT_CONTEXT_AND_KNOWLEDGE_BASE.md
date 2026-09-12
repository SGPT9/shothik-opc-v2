# SHOTHIKGPT: Project Context & Knowledge Base
**Confidential Internal Document** | **Last Updated:** September 2026  
**Project:** ShothikGPT - The Agentic Operating System for South Asia's Hyped Economy  
**Stage:** Series A Preparation | **Primary Market:** Bangladesh (Scaling to South Asia)

---

## 1. Core Product Vision
ShothikGPT is not a conversational wrapper; it is an **Agentic Operating System** designed for the One-Person Company (OPC) and micro-entrepreneurs in South Asia. It transitions AI from a "machine-as-a-tool" to a "machine-as-a-partner" (Digital Employee / DE) that orchestrates local logistics, Mobile Financial Services (MFS), and regulatory compliance to turn hustle into scalable business.

### 1.1 The "Machine-as-a-Partner" Paradigm
Traditional AI tools position the machine as a passive instrument waiting for explicit commands. ShothikGPT redefines this relationship:
- **Proactive Orchestration**: The Digital Employee (DE) anticipates needs based on context, historical patterns, and real-time signals.
- **Shared Agency**: Decisions are co-made; the Human Entrepreneur (HE) sets goals, the DE executes tactics with autonomy within defined boundaries.
- **Economic Alignment**: The DE's success metrics are tied directly to the HE's financial outcomes (revenue growth, cost reduction, compliance adherence).

### 1.2 Target Demographic: The South Asian Micro-Economy
- **One-Person Companies (OPCs)**: 14M+ informal businesses in Bangladesh alone, operating across WhatsApp, Facebook, and physical markets.
- **The "Hyped Economy"**: High-velocity, low-margin transactions characterized by Cash-on-Delivery (COD), Mobile Financial Services (MFS), and fragmented logistics.
- **Pain Points**: Cognitive overload from managing 5-8 disconnected tools, manual reconciliation of payments/logistics, lack of localized AI understanding cultural nuances.

---

## 2. Deep Tech Architecture Stack

### 2.1 Twin Execution Engine
Operates on a continuous **`Observe → Understand → Decide → Execute → Learn`** loop.

| Component | Role | Implementation Details |
|-----------|------|------------------------|
| **Orchestrator** | Context Manager | Maintains state across multiple micro-enterprises owned by a single user. Handles persona switching and cross-business insights. |
| **Operator** | Action Executor | Direct API integration layer for local services. Executes concrete actions (send message, verify payment, book courier). |
| **Memory Layer** | Persistent State | Hybrid storage: PostgreSQL (structured ledgers), SQLite (local cache), Vespa (semantic search/RAG). |

### 2.2 LiteParse Integration
**Layout-aware, zero-cloud-dependency document parser** built on LlamaIndex.
- **Spatial Awareness**: Preserves bounding boxes for multi-column STEM papers, financial tables, and forms.
- **Cost Efficiency**: Enables high-speed local RAG without expensive multimodal API calls ($0.00/image vs $0.50+/image).
- **Use Cases**: Thesis parsing, invoice extraction, NBR tax form digitization.

### 2.3 Local API Mesh
Hyper-local integrations forming the "execution muscle" of the OS:
- **Mobile Financial Services (MFS)**: bKash, Nagad, Rocket (Payment verification, disbursement, balance checks).
- **Logistics**: Pathao, Steadfast, RedX (Order dispatch, tracking, COD reconciliation).
- **Regulatory**: NBR (National Board of Revenue) for automated tax ledger generation and compliance reporting.
- **Communication**: WhatsApp Business API, Messenger, SMS gateways.

### 2.4 Deployment Strategy
- **Self-Hosted via Dokploy**: Next.js standalone containers deployed on cost-effective VPS (Hostinger/DigitalOcean).
- **Edge Computing**: Cloudflare Workers for latency-sensitive routing and authentication.
- **Batch Processing**: Asynchronous job queues for heavy tasks (document parsing, report generation) to optimize compute costs.

---

## 3. Behavioral Design Framework (HE-DE Collaboration)

UX/UI is grounded in **Interdependence Theory** to build trust with a demographic prone to technological skepticism. The relationship between Human Entrepreneur (HE) and Digital Employee (DE) must display visible collaborative cues.

### 3.1 Coordination Cues (Task Connection)
Proactive, visible handovers that signal active work.
- **Pattern**: "I have [completed action]. I am now [initiating next step]."
- **Example**: *"I have verified the bKash TrxID 8X9...2A. I am now triggering the Steadfast Courier API to dispatch your order #1234."*
- **Psychological Impact**: Drives *Process Fluency* – the user feels the system is moving forward without needing constant micromanagement.

### 3.2 Team Goal Cues (Entity Connection)
Explicit alignment of objectives between human and machine.
- **Pattern**: "Our joint goal is [metric/outcome]."
- **Example**: *"Our joint goal this week is to reduce your 22% Cash-on-Delivery return rate by verifying addresses before dispatch."*
- **Psychological Impact**: Drives *Team Cohesion* – the AI is perceived as a partner invested in the user's success, not just a tool.

### 3.3 Process Transparency
Making the HE-DE workflow visible to the end-customer (or the user themselves).
- **Implementation**: Status timelines showing "AI Verification," "Human Review," "Dispatched."
- **Impact**: Significantly increases adoption, usage likelihood, and satisfaction compared to pure substitution or augmentation models. Users trust what they can see.

---

## 4. Priority User Personas & Jobs-to-be-Done (JTBD)
*(Synthesized from 30-Persona Dossier)*

### Cluster A: Students & STEM (High Volume / Advocacy)
| Attribute | Details |
|-----------|---------|
| **Archetypes** | The Academic Climber, Thesis Researcher, STEM Student |
| **Frustrations** | Colonial language barriers, AI hallucination in citations, fragmented tools, high cost of Western SaaS ($20/mo too expensive) |
| **JTBD** | "Help me produce original-sounding, academically safe English writing and research documents quickly and cheaply." |
| **Shothik Solution** | Deep Research + LiteParse RAG + GenOffice Docs + AI Detector + Nilkhet Print Bridge |
| **Willingness to Pay** | Low (Freemium → ৳199/mo) |
| **Acquisition Channel** | University ambassadors, Facebook study groups |

### Cluster B: Early Entrepreneurs & OPCs (High LTV)
| Attribute | Details |
|-----------|---------|
| **Archetypes** | Side-Hustle Founder, One-Person Company Operator |
| **Frustrations** | Cognitive overload from 5-8 disconnected tools, manual admin, lack of local context in Western AI |
| **JTBD** | "Give me a low-cost digital co-pilot that helps one person run multiple small businesses without drowning in admin." |
| **Shothik Solution** | Business Twin, GenOffice Sheets for ledgers, ScenariosLab for idea validation |
| **Willingness to Pay** | Medium (৳499-999/mo) |
| **Acquisition Channel** | Facebook entrepreneur groups, YouTube tutorials |

### Cluster C: Digital / COD Merchants (High Stickiness)
| Attribute | Details |
|-----------|---------|
| **Archetypes** | F-Commerce Hustler, Traditional SME Owner |
| **Frustrations** | 22%+ COD return rates, manual bKash TrxID matching, fragmented courier tracking, NBR compliance fear |
| **JTBD** | "Connect my orders, payments, and logistics so I stop losing money and time to manual matching." |
| **Shothik Solution** | Autonomous Escrow, TrxID verification webhook → Steadfast dispatch automation, NBR tax-ready ledger |
| **Willingness to Pay** | High (৳999-2,499/mo + transaction fees) |
| **Acquisition Channel** | Direct sales, courier partnerships |

### Cluster D: Professionals & Freelancers (Expansion)
| Attribute | Details |
|-----------|---------|
| **Archetypes** | Freelancer, NGO Officer, RMG Coordinator, Tutor |
| **JTBD** | "Increase the quality and speed of my client deliverables / reports so I can earn more without working more hours." |
| **Shothik Solution** | Writing Suite (Humanize + Paraphrase), Personal Twin with persistent style memory |
| **Willingness to Pay** | Medium-High (USD earnings allow higher pricing) |
| **Acquisition Channel** | Upwork/Fiverr communities, LinkedIn |

---

## 5. Key Workflows & "Phygital" Bridges

### 5.1 F-Commerce COD Mitigation Workflow
*Problem: 22% fake orders lead to massive losses in shipping fees.*
1. **Customer Order**: Received via WhatsApp/FB Messenger.
2. **Twin Intervention**: Automatically requests a 100 BDT advance deposit via bKash/Nagad.
3. **Verification**: Twin listens for webhook, matches TrxID to phone number.
4. **Ledger Update**: Marks order as "Verified" in GenOffice Sheets.
5. **Dispatch**: Twin triggers Steadfast/Pathao API webhook only for verified orders.
6. **Outcome**: Fake orders reduced by ~90%, shipping cost savings immediate.

### 5.2 Nilkhet Phygital Bridge
*Problem: Digital thesis formatting doesn't translate to physical printing standards.*
1. **Formatting**: Student writes/formats thesis in Shothik GenOffice Docs.
2. **Pre-flight Check**: LiteParse validates margins, fonts, binding space against university guidelines.
3. **Order**: User clicks "Print & Bind."
4. **Routing**: Platform interfaces with verified Nilkhet merchant network.
5. **Fulfillment**: Document printed, bound, and dispatched via Steadfast to university/home.
6. **Outcome**: Zero formatting errors, same-day delivery, support for local merchant economy.

### 5.3 The Emporium (Tokenized Economy)
*Problem: High-quality prompts/assets are siloed; users need extra income.*
1. **Asset Creation**: User creates a high-performing prompt template or formatted book layout.
2. **Publication**: Twin publishes preview to community marketplace.
3. **Validation**: Human reviewers or sub-agents test and validate asset quality.
4. **Monetization**: Asset listed for credits; buyers purchase using platform currency.
5. **Payout**: Creator earns credits convertible to bKash cash.
6. **Outcome**: Closed-loop internal economy driving retention and content quality.

---

## 6. Competitive Moat

| Competitor Type | Examples | Shothik's Advantage |
|-----------------|----------|---------------------|
| **Global Conversational AI** | ChatGPT, Jasper, Claude | **Execution Layer**: They talk; we act. We integrate bKash, Pathao, NBR. <br> **Pricing**: $50/mo vs ৳499/mo. <br> **Context**: No understanding of COD, TrxID, or Banglish. |
| **Automation Platforms** | Zapier, Make | **Reasoning**: They follow rigid rules; we handle edge cases (negotiating with customers, verifying fuzzy TrxIDs). <br> **Local APIs**: Zapier doesn't support Steadfast or bKash personal accounts. |
| **Local Point Solutions** | Individual ledger apps, courier dashboards | **Unified OS**: We replace 5-8 apps with one coherent interface. <br> **Cross-Business Insights**: A user running 3 businesses gets consolidated analytics. |

---

## 7. Developer & Coding Guidelines for Qwen Coder

When generating code, UI components, or architecture for this project, strictly adhere to these principles:

### 7.1 Mobile-First & WhatsApp-Centric
- **Assumption**: 85% of interactions occur on mid-range Android devices over 3G/4G.
- **Design**: Touch targets ≥ 44px. Critical actions reachable with thumb zone.
- **Bandwidth**: Lazy load images. Prefer text/SVG over heavy assets. Offline-first caching for critical data (ledgers, orders).

### 7.2 Local Payment Logic
- **bKash/Nagad**: Always implement webhook listeners for `payment.success`, `payment.fail`, `refund.initiated`.
- **TrxID Verification**: Never trust client-side input. Always server-side verify against MFS API or SMS parsing (with permission).
- **NPSB Rates**: Calculate interoperability fees (0.85%) accurately in all ledger computations.

### 7.3 HE-DE Cues in UI
- **Coordination States**: Explicitly show "Twin is verifying...", "Waiting for human approval", "Handing over to courier API".
- **Team Goals**: Display shared metrics prominently ("Return Rate: 22% → Target: 10%").
- **Transparency**: Log every autonomous action in an audit trail visible to the user.

### 7.4 Cost-Efficiency
- **Parsing**: Prioritize `LiteParse` (local CPU) over cloud multimodal APIs (expensive).
- **Batching**: Group API calls (e.g., send 50 WhatsApp messages in one batch job) to reduce overhead.
- **Caching**: Aggressively cache RAG contexts and model responses for repeated queries.

### 7.5 Language & Localization
- **Code-Switching**: NLP prompts must handle Bangla, English, and Banglish seamlessly.
  - *Good*: "Order confirm koren?" / "Confirm the order?"
  - *Bad*: Strict English-only prompts.
- **UI Copy**: Use local idioms. "৳" symbol always. Date format DD/MM/YYYY. Phone format +880 XXXX-XXXXXX.

---

## 8. Related Documentation
This document serves as the root context. For deeper dives, refer to:
- **Context Engineering**: `/docs/context-engineering/` (Assembly, Lifecycle, Security, Observability)
- **Personas**: `/docs/personas/` (Rina, Dr. Rahman, Karim, Ahmed)
- **UI/UX Philosophy**: `/docs/design/ui-ux-philosophy.md`
- **Architecture Decision Records**: `/docs/adr/`

---

*End of Document*
