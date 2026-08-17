# 🏗️ Shothik Autonomous Orchestration & Grilling Architectural Spec
**Specification Version**: v2.8.0  
**Status**: Production Verified & Consensus Approved  
**Topology**: Ask-First Minimalist Shell ➔ Hybrid Fast-Path Router ➔ 5-Tier Model Mesh ➔ Offline CRDT Sync

---

## 1. Executive Summary & Design Principles

Shothik couples an **Ask-First Minimalist Shell** (inspired by DeepSeek's zero-friction interface standard) with a high-throughput **Autonomous Multi-Agent Backend Mesh**. 

### 🌟 Core Architectural Tenets:
1. **Ask-First Dominance**: Never require mode or persona selection prior to user prompt entry. Intent is inferred dynamically.
2. **Hybrid Fast-Path Routing**: Client-side regex/heuristics trigger immediate split-pane canvases (<5ms), reconciled seamlessly with backend semantic orchestration.
3. **Optimistic Offline-First CRDT**: Local mutations are buffered in IndexedDB/SQLite with field-level Last-Write-Wins (LWW) conflict resolution and background sync to InsForge BaaS PostgreSQL.
4. **Zero-Plaintext Credential Safety**: Ephemeral session token/cookie capture during Human-In-The-Loop (HITL) browser sessions without storing raw passwords in database tables.
5. **Continuous Grilling & Adversarial Tree Walking**: Algorithmic decision DAGs that compute the unblocked question frontier and stress-test assumptions before code/plan execution.

---

## 2. Complete End-to-End System Topology

```mermaid
graph TD
    %% ── 1. FRONTEND USER INTERFACE ──
    subgraph FrontendShell["🖥️ 1. Minimalist Ask-First Shell (Vite :5000)"]
        Sidebar["📂 Sidebar Navigation<br/>• Session History<br/>• Quick Studio Links<br/>• Pinned Workspaces"]
        
        subgraph WorkSurface["💬 Primary Work Surface"]
            Composer["✍️ Ask-First Composer<br/>• Zero launcher strip clutter<br/>• Dual-voice dictation<br/>• / Slash popup & Tools menu"]
            Transcript["📜 Conversation Transcript<br/>• Deep reasoning ThinkBox<br/>• Grounded citation pills<br/>• Approval cards & secrets"]
        end
        
        subgraph StudioCanvas["🎨 Right Split-Pane Studio (Progressive Disclosure)"]
            SlideStudio["📽️ Slide Studio"]
            SheetStudio["📊 Sheet Studio"]
            ResearchStudio["🔬 Deep Research"]
            ParallelSpace["🌐 Browser Sandbox & HITL"]
        end
    end

    %% ── 2. INTENT ROUTING & CLASSIFICATION ──
    Composer -->|Natural Language Prompt| IntentRouter{"🧠 Autonomous Intent Router"}
    
    IntentRouter -->|"slides / pitch deck"| SlideStudio
    IntentRouter -->|"sheet / financial model"| SheetStudio
    IntentRouter -->|"deep research / market sizing"| ResearchStudio
    IntentRouter -->|"browser / portal automation"| ParallelSpace
    IntentRouter -->|"all prompts & actions"| Gateway["⚡ API Ingress Gateway (:8080)"]

    %% ── 3. BACKEND ORCHESTRATION & SERVICES ──
    subgraph BackendServices["⚙️ 2. Backend Services & Orchestrator Layer"]
        Gateway --> ControlLayer["🛡️ Orchestrator Control Layer"]
        
        ControlLayer --> GrillingService["🔥 Grilling & Decision Tree Engine<br/>• Round-by-round frontier calculation<br/>• Adversarial edge-case discovery"]
        ControlLayer --> BrowserService["🌐 Browser-Use & HITL Sandbox<br/>• Puppeteer / DevTools automation<br/>• Credential intercept & OTP fallback"]
        ControlLayer --> LogisticsService["📦 Logistics & Commerce Gateway<br/>• Steadfast courier dispatch API<br/>• bKash/Nagad settlement math"]
        ControlLayer --> ModelMesh["🔀 5-Tier Model Mesh Router"]
    end

    %% ── 4. COMPUTE & STORAGE TOPOLOGY ──
    subgraph ComputeStorage["💾 3. Compute Mesh & Data Persistence"]
        ModelMesh -->|"Tier 1: Fast Zero-Cost"| LocalOllama["⚡ Local GPU Ollama (:11434)<br/>qwen2.5-coder:7b"]
        ModelMesh -->|"Tier 2: Deep Reasoning"| DeepSeek["🧠 DeepSeek-V3 / R1"]
        ModelMesh -->|"Tier 3: Complex Vision"| CloudFrontier["🌐 Claude / Gemini 2.5 Pro"]
        
        ControlLayer --> LocalDB["📂 Local SQLite / IndexedDB<br/>• Offline-first CRDT buffer"]
        LocalDB <-->|"Replication / Sync"| InsForge["🗄️ InsForge BaaS PostgreSQL<br/>• Auth, Vector RAG & Storage"]
    end

    %% ── 5. FEEDBACK LOOPS ──
    GrillingService -->|"Push Unblocked Tickets"| Wayfinder["🧭 Wayfinder Decision DAG"]
    Wayfinder --> Transcript
    BrowserService -->|"Live Viewport Stream"| ParallelSpace
    LocalOllama -->|"Token Stream (SSE)"| Transcript
    DeepSeek -->|"Reasoning Trace"| Transcript
```

---

## 3. Decision Tree Consensus Matrix (Grilling Audit)

| # | Domain | Settled Decision Policy | Rationale |
| :--- | :--- | :--- | :--- |
| **Q1** | **Intent Routing** | **Hybrid Fast-Path** (<5ms client heuristic + async backend planner) | Provides instant perceived UI response while giving the orchestrator full authority to adjust tooling. |
| **Q2** | **Edge Resilience** | **Optimistic CRDT Local Buffer** (IndexedDB/SQLite auto-sync) | Guarantees zero message or artifact loss across spotty 2G/3G South Asian mobile networks. |
| **Q3** | **HITL Security** | **Ephemeral Cookie/Token Export** (No plaintext password saving) | Injects credentials safely into headless memory and retains session cookies only. |
| **Q4** | **Intent Reconciliation**| **Seamless Auto-Pivot with Toast** | When backend semantic intent overrides initial client heuristic, smoothly shifts active canvas tab. |
| **Q5** | **CRDT Merging** | **Field/Cell-Level Last-Write-Wins (LWW)** | Preserves non-conflicting spreadsheet cells and document sections across simultaneous devices. |
| **Q6** | **Overnight Auth** | **Graceful Pause & Morning Checkpoint** | Preserves partial research dumps and highlights re-authentication needs in the morning briefing card. |

---

## 4. Verification & Operational Health

- **Visual QA Test Suite**: `pnpm verify:frontend` (4/4 Automated Health Checks Passed)
- **Monorepo Typecheck**: `pnpm -r exec tsc --noEmit` (0 Errors Clean)
- **Local GPU Mesh**: `qwen2.5-coder:7b` on port `:11434`
- **Ingress Gateway**: Node/Express API Server on port `:8080`
- **Frontend App**: Vite React Web App on port `:5000`
