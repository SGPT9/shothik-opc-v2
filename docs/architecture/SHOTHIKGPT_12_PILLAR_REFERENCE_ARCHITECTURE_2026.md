# 🏛️ ShothikGPT 12-Pillar Master Reference Architecture — 2026

**Version:** 3.0.0  
**Classification:** Deep-Tech Platform Reference Architecture  
**Target Standard:** Global Deep-Tech Enterprise AI Operating System  

---

##  EXECUTIVE SUMMARY

ShothikGPT transcends generic chatbots by establishing an **Architecture-Driven, Goal-Oriented AI Platform** structured into **12 Interconnected Pillars**. 

```
                                    SHOTHIKGPT OS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
 EXPERIENCE / INTERACTION            TRUST / GOVERNANCE (Pillar 11)
 (Pillar 1)                               │
        │                                 │
        └──────────────┬──────────────────┘
                       │
              INTELLIGENCE & ROUTING PLANE (Pillar 3)
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Context       Knowledge        Model/Agent
     Engine          Engine          Routing
    (Pillar 2)     (Pillar 4)       (Pillar 3)
        │              │              │
        └──────────────┼──────────────┘
                       │
              GOAL / PLANNING (Pillar 5)
                       │
             TWIN EXECUTION (Pillar 6)
                       │
          TOOLS + CONNECTORS + MCP (Pillar 7)
                       │
              ARTIFACTS (Pillar 8)
                       │
         MEMORY & LEARNING (Pillar 9)
                       │
            AUTOMATION & WORKFLOWS (Pillar 10)
                       │
         OBSERVABILITY & EVALS (Pillar 12)
```

---

## THE 12 PLATFORM PILLARS

### 1. Interaction & Experience
- **Capabilities:** Chat space, streaming, KaTeX math, rich links, citations, media, and multimodal continuity (Voice ➔ Text ➔ Image ➔ Document ➔ Artifact).
- **Component Surface:** `Composer.tsx`, `Transcript.tsx`, `MessageActions.tsx`, `VoicePopup.tsx`.

### 2. Conversation & Context
- **Capabilities:** Short/long-term context orchestration, active token budget tracking, context scope picker, and tenant boundary isolation.
- **Component Surface:** `ContextUsageIndicator.tsx`, `ContextChip`, `SessionEventLog`.

### 3. Intelligence & Model Routing Plane
- **Capabilities:** Evaluates intent (`simple_query`, `complex_research`, `code_engineering`, `business_strategy`, `fcommerce_execution`), assesses complexity (1–10), selects optimal Prompt Profiles (Claude Opus 4.6 Thinking, GPT-5.6 Sol, DeepSeek R1, Cursor Code Master), and applies latency/cost policies.
- **Implementation:** `src/lib/architecture/intelligence-router.ts`.

### 4. Knowledge Lifecycle Engine
- **Capabilities:** `Ingest ➔ Normalize ➔ Index ➔ Retrieve ➔ Validate ➔ Update ➔ Expire ➔ Re-index`.
- **Banglish & Academy Normalization:** Automatic spelling normalization, hybrid vector/keyword retrieval, freshness scoring, and authority verification.
- **Implementation:** `src/lib/architecture/knowledge-lifecycle-engine.ts`.

### 5. Goal & Planning
- **Capabilities:** Goal definition, task decomposition, subtask dependency graph (`blockedBy`), dynamic plan modification, and user plan approval cards.
- **Implementation:** `GoalDriver.ts`, `ApprovalCard.tsx`.

### 6. Twin & Agent Lifecycle Execution
- **Capabilities:** `Discover ➔ Instantiate ➔ Configure ➔ Authorize ➔ Execute ➔ Monitor ➔ Evaluate ➔ Terminate`.
- **Implementation:** `src/lib/architecture/agent-lifecycle-manager.ts`, `PluginRegistry.ts`.

### 7. Tools, Connectors & MCP Infrastructure
- **Capabilities:** Dynamic MCP server discovery, external API connectors (bKash, Nagad, Steadfast, Pathao), capability seam selection, and tool execution guards.
- **Implementation:** `capability-seam.ts`, `guard.ts`, `bkash-tokenized-pgw.ts`.

### 8. Artifacts & Creation Workspace
- **Capabilities:** 38 specialized rich artifact engines (Code Editor, Spreadsheet Modeler, Pitch Deck Slides, BoiMela 3D Book Authoring, Legal Contracts, DRM Watermarking).
- **Component Surface:** `ArtifactPanel.tsx`, `BoiMela3DPageFlipPreview.tsx`, `NilkhetPreflightEngine.ts`.

### 9. Memory & Learning Vault
- **Capabilities:** Cross-session memory persistence, user/project/org memory vaults, rule learning (`/learn`), and epistemic provenance tracking.
- **Implementation:** `RagKnowledgeVaultModal.tsx`, `EpistemicProvenanceBadge.tsx`.

### 10. Automation & Workflows
- **Capabilities:** 24/7 background worker queue, overnight batch task execution, priority queue, exponential retries, and reusable automation triggers.
- **Implementation:** `tonight-worker-daemon.ts`, `HermesTriggerGateway.ts`.

### 11. Trust, Security & Governance
- **Capabilities:** Financial limit policies (৳100,000 BDT max, ৳10,000 2FA threshold), RLS tenant data isolation, risk-level assessments, and immutable audit logs.
- **Implementation:** `src/lib/architecture/policy-governance-engine.ts`.

### 12. Observability, Evaluation & Platform Operations
- **Capabilities:** Trajectory health tracking, task success metrics, citation/tool accuracy evaluation, latency budgets, and real-time cost analytics.
- **Implementation:** `src/lib/architecture/evaluation-observability-engine.ts`.

---

## VERIFIED TEST SUITE

```bash
npx vitest run src/lib/architecture/__tests__/12-pillar-architecture.test.ts
```

- **Test Suite Status:** 🟢 **6 / 6 Passed (100%)**
