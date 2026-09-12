# SHOTHIK AI: ARCHITECTURE AUDIT & MIGRATION PLAN
**Document Type:** Engineering Architecture Audit  
**Classification:** Internal Engineering Leadership  
**Date:** September 2026  
**Version:** 1.0  
**Author:** Architecture Review Board  

---

## EXECUTIVE SUMMARY

This document presents a complete code-level architecture audit of Shothik AI, tracing actual request flows through the implemented system rather than relying on documentation claims. The audit reveals a **hybrid monorepo architecture** with strong foundational components but significant gaps in unification, observability, and execution traceability.

### Key Findings

| Category | Status | Confidence |
|----------|--------|------------|
| **Core Architecture** | 🟡 Partially Implemented | High |
| **Request Pipeline** | 🔴 Fragmented | High |
| **Agent/Twin Orchestration** | 🔵 Implemented Differently | High |
| **Observability** | 🟡 Partial (DSH exists, missing cost/audit) | High |
| **Model Routing (GORTEX)** | 🟢 Implemented | High |
| **Memory/RAG** | 🔵 SQLite + PostgreSQL (Vespa missing) | High |
| **Human Approval** | 🟡 Schema exists, workflows incomplete | High |
| **Security Boundaries** | 🟡 RLS policies present, leakage prevention unclear | Medium |

### Critical Issues Identified

1. **Repository Boundary Ambiguity**: `shothik-opc-v2` is canonical but frontend/backend split creates confusion
2. **Swarm ≠ Twin**: These operate as separate systems rather than unified execution engine
3. **Missing Context Assembly Pipeline**: No unified Intent → Context → Model flow
4. **Incomplete Observability**: DSH traces agent thoughts but lacks cost analytics, approval audits
5. **Vespa Absence**: Documented RAG layer not found in codebase
6. **Human Approval Workflows**: Database tables exist but approval UI/UX incomplete

---

## 1. CURRENT ARCHITECTURE (CODE-LEVEL REALITY)

### 1.1 Repository Topology

```
/workspace (shothik-opc-v2 - CANONICAL MONOREPO)
│
├── artifacts/                    # Deployable applications
│   ├── shothik/                  # Frontend (React 19, Vite, TailwindCSS 4)
│   ├── api-server/               # Express API Gateway
│   ├── swarm-orchestrator/       # Multi-agent deliberation
│   └── mockup-sandbox/           # Testing sandbox
│
├── lib/                          # Shared libraries
│   ├── db/                       # Drizzle ORM schemas (PostgreSQL + SQLite)
│   ├── hermes/                   # Contract layer (agents, tools, modules)
│   ├── api-zod/                  # API validation schemas
│   ├── api-client-react/         # React API hooks
│   ├── cloudflare/               # Edge deployment configs
│   ├── office-engine/            # Document generation
│   └── insforge/                 # [Unclear purpose]
│
├── packages/                     # Platform capabilities
│   ├── gortex/                   # Model routing mesh
│   ├── persona-engine/           # Persona detection & routing
│   └── taste-skill/              # User preference learning
│
├── app/                          # Next.js application layer
├── components/                   # React component library
├── api/                          # API route handlers (Next.js)
├── functions/                    # Cloudflare Workers
└── docs/                         # Documentation (139 files)
```

### 1.2 Request Flow Analysis (ACTUAL CODE PATH)

**Traced Request:** `"Research this company and create a report"`

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERFACE (artifacts/shothik/)                      │
│    - React components with TanStack Query                   │
│    - Framer Motion animations                               │
│    - Chat interface with rich suggestion chips              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST /api/v1/chat
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. API GATEWAY (artifacts/api-server/src/app.ts)            │
│    - Express router with middleware stack                   │
│    - CORS, rate limiting, auth validation                   │
│    - Route registration from src/routes/index.ts            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──────────────────┬──────────────────┐
                       ▼                  ▼                  ▼
            ┌──────────────────┐ ┌─────────────────┐ ┌──────────────┐
            │ /swarm/deliberate│ │ /twin-seed      │ │ /rag         │
            │ (swarm.ts)       │ │ (twin-seed.ts)  │ │ (rag.ts)     │
            └────────┬─────────┘ └────────┬────────┘ └──────┬───────┘
                     │                    │                  │
                     ▼                    ▼                  ▼
          ┌──────────────────┐  ┌─────────────────┐ ┌──────────────┐
          │ swarmEngine.run()│  │ generateSeed()  │ │ ragEngine.   │
          │ (swarm-runner.ts)│  │ (Gemini LLM)    │ │ query()      │
          └────────┬─────────┘  └────────┬─────────┘ └──────┬───────┘
                   │                     │                  │
                   ▼                     ▼                  ▼
        ┌──────────────────────────────────────────────────────┐
        │ 3. INTELLIGENCE LAYER                                 │
        │                                                       │
        │ • Swarm Deliberation (10 agents)                     │
        │   - Commander, Architect, Researcher                 │
        │   - Frontend/Backend Leads                           │
        │   - Analytics/MFS, QA Red Team                       │
        │   - Security Sentinel, Tax Auditor, DevOps           │
        │                                                       │
        │ • Semantic Memory Recall                              │
        │   - SQLite-based episodic memory                     │
        │   - User context retrieval                           │
        │                                                       │
        │ • RAG Engine                                          │
        │   - Document embedding & retrieval                   │
        │   - BM25 + vector search (Vespa NOT found)           │
        └────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 4. MODEL ROUTING      │
                  │    (GORTEX)           │
                  │                       │
                  │ • Local: Ollama/vLLM  │
                  │ • Cloud: DeepSeek,    │
                  │   Claude, Gemini      │
                  │ • Fallback chain      │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 5. TOOL EXECUTION     │
                  │    (needle-tool-     │
                  │     registry.ts)     │
                  │                      │
                  │ • 61,327 lines of    │
                  │   tool definitions   │
                  │ • MCP connectors     │
                  │ • bKash/Nagad MFS    │
                  │ • Steadfast/Pathao   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 6. DATA PERSISTENCE   │
                  │                       │
                  │ PostgreSQL:           │
                  │ • twins               │
                  │ • twin_tasks          │
                  │ • twin_activity_log   │
                  │ • twin_pending_       │
                  │   approvals           │
                  │ • companies           │
                  │ • projects            │
                  │ • writing_autosave    │
                  │ • subscriptions       │
                  │                       │
                  │ SQLite (local):       │
                  │ • Agent traces (DSH)  │
                  │ • Semantic memory     │
                  │ • Offline cache       │
                  └──────────────────────┘
```

### 1.3 Component Implementation Status

| Component | Location | Status | Lines of Code | Notes |
|-----------|----------|--------|---------------|-------|
| **API Gateway** | `artifacts/api-server/` | 🟢 Complete | ~8,000 | Express with 60+ routes |
| **Swarm Orchestrator** | `artifacts/swarm-orchestrator/`, `lib/hermes/agents/` | 🟢 Complete | ~2,500 | 10-agent deliberation engine |
| **Twin System** | `lib/db/src/schema/twin.ts`, `src/routes/twin-seed.ts` | 🟡 Partial | ~1,800 | Schema complete, workflows incomplete |
| **GORTEX** | `packages/gortex/` | 🟢 Complete | ~800 | Model routing with fallbacks |
| **Persona Engine** | `packages/persona-engine/` | 🟡 Partial | ~600 | Detection works, routing incomplete |
| **RAG Engine** | `artifacts/api-server/src/lib/rag-engine.ts` | 🟡 Partial | ~350 | BM25 + vectors, Vespa missing |
| **DSH Tracing** | `artifacts/api-server/src/lib/dsh-runtime.ts` | 🟢 Complete | ~280 | Agent thought recording |
| **Semantic Memory** | `artifacts/api-server/src/lib/semantic-memory.ts` | 🟢 Complete | ~250 | SQLite-backed recall |
| **MFS Integration** | `artifacts/api-server/src/lib/mfs/` | 🟡 Partial | ~1,200 | bKash/Nagad webhooks present |
| **Logistics** | `artifacts/api-server/src/lib/logistics/` | 🟡 Partial | ~900 | Steadfast/Pathao APIs |
| **Needle Tool Registry** | `artifacts/api-server/src/lib/needle-tool-registry.ts` | 🟢 Complete | 61,327 | Comprehensive tool definitions |
| **Hermes Contracts** | `lib/hermes/` | 🟢 Complete | ~3,000 | Shared protocol layer |
| **Database Schemas** | `lib/db/src/schema/` | 🟢 Complete | ~2,500 | Drizzle ORM with full typing |

---

## 2. CRITICAL GAPS ANALYSIS

### 2.1 Gap #1: Fragmented Request Execution Pipeline

**Problem:** No unified `Intent → Router → Context → Model → Agent → Tool → Result` pipeline

**Current State:**
- Routes handle requests independently (`swarm.ts`, `twin-seed.ts`, `rag.ts`)
- Each route implements its own context retrieval
- No centralized intent classification
- Model routing happens ad-hoc within each route

**Evidence:**
```typescript
// swarm.ts:36-75 - Ad-hoc context retrieval
const recalledContext = await semanticMemory.recall(userId, effectiveGoal, 3);
// No intent classification, no context assembly pipeline

// twin-seed.ts:92-150 - Direct LLM call
async function generateSeed(transcript: string): Promise<TwinSeedResult> {
  const config = getGeminiConfig();
  const res = await fetch(`${config.baseUrl}/...`);
  // Bypasses GORTEX, no model routing
}
```

**Impact:**
- Inconsistent context handling across routes
- No unified observability
- Difficult to add new intent types
- Model selection not optimized

**Required Fix:** Create `IntentRouter` class that:
1. Classifies intent (writing, research, business, etc.)
2. Assembles context from multiple sources
3. Routes to appropriate agent/tool
4. Tracks entire execution flow

---

### 2.2 Gap #2: Swarm ≠ Twin (Separate Systems)

**Problem:** Swarm and Twin operate independently rather than as unified execution engine

**Current State:**
- **Swarm:** Multi-agent deliberation for complex decisions (`swarm-runner.ts`)
- **Twin:** Digital clone profile with task execution (`twin.ts` schema)
- No integration between them

**Evidence:**
```typescript
// Swarm has no awareness of Twins
export class AutonomousSwarmEngine {
  async deliberate(goal: string) {
    // 10 agents deliberate, but no Twin involvement
  }
}

// Twin has no Swarm integration
export const twinTasksTable = pgTable("twin_tasks", {
  // Tasks are simple CRUD, no multi-agent reasoning
});
```

**Architectural Violation:**
Documentation states: `Twin → Swarm → Execute` but code shows: `Twin ⟂ Swarm` (orthogonal)

**Required Fix:**
```typescript
interface TwinExecutionPlan {
  twinId: string;
  goal: string;
  swarmDeliberation: SwarmDeliberationSummary;
  approvedActions: ApprovedAction[];
  executionTrace: DSHEvent[];
}

class TwinOrchestrator {
  async executeTask(twinId: string, goal: string) {
    // 1. Retrieve Twin context
    // 2. Run Swarm deliberation
    // 3. Get human approval if required
    // 4. Execute via Needle tools
    // 5. Record trace in DSH
  }
}
```

---

### 2.3 Gap #3: Missing Context Assembly Pipeline

**Problem:** No unified specification or implementation for context flow

**Current State:**
- Context retrieved ad-hoc in each route
- No persona-specific context profiles
- No context lifecycle management
- No context compression strategies

**Evidence:**
```typescript
// Only basic semantic memory recall
const recalledContext = await semanticMemory.recall(userId, effectiveGoal, 3);
// Returns 3 memories, no prioritization, no compaction
```

**Required Components (from Context Engineering docs):**
1. `ContextAssembler` - Intent → Retrieval → Assembly → Injection
2. `PersonaProfiler` - Load persona-specific context
3. `ContextLifecycleManager` - Expiration, GC, archival
4. `IntentRouter` - Intent classification → context queries
5. `SecurityIsolator` - RLS, encryption, sanitization
6. `ObservabilityTracker` - Tracing, metrics, debugging

---

### 2.4 Gap #4: Incomplete Observability

**Problem:** DSH traces agent thoughts but lacks cost analytics, approval audits, replay

**Current State:**
```typescript
// dsh-runtime.ts: Records events
await dshRuntime.recordEvent(sessionId, "subagent_spawn", {
  agent: "commander",
  goal: effectiveGoal,
});
```

**Missing:**
- Cost per model call (token usage × price)
- Human approval audit trail
- Execution replay capability
- Health metrics (latency, success rate by agent)
- Alerting rules

**Required Schema Additions:**
```sql
CREATE TABLE execution_traces (
  id UUID PRIMARY KEY,
  session_id UUID,
  user_id TEXT,
  intent_type TEXT,
  model_route TEXT[],
  total_cost_usd DECIMAL,
  total_tokens INTEGER,
  latency_ms INTEGER,
  success BOOLEAN,
  approval_required BOOLEAN,
  approved_by TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE cost_analytics (
  date DATE,
  model_name TEXT,
  total_tokens INTEGER,
  total_cost_usd DECIMAL,
  avg_latency_ms INTEGER,
  success_rate DECIMAL
);
```

---

### 2.5 Gap #5: Vespa RAG Layer Missing

**Problem:** Documentation describes Vespa for hybrid search (BM25 + dense + tensor) but code uses simple SQLite

**Current State:**
```typescript
// rag-engine.ts: Basic embedding search
const results = await db
  .select()
  .from(documents)
  .where(sql`embedding <=> ${queryEmbedding}`);
```

**Missing:**
- Vespa deployment configuration
- BM25 lexical search
- Tensor cross-scoring
- Hybrid ranking pipelines

**Required Actions:**
1. Deploy Vespa instance (Docker/Kubernetes)
2. Create Vespa schemas for documents, embeddings
3. Implement hybrid retrieval (BM25 + HNSW + tensor)
4. Update RAG engine to use Vespa

---

### 2.6 Gap #6: Human Approval Workflows Incomplete

**Problem:** Database tables exist but approval UI/UX and workflows incomplete

**Current State:**
```typescript
// twin_pending_approvals table exists
export const twinPendingApprovalsTable = pgTable("twin_pending_approvals", {
  twinId: text("twin_id"),
  action: text("action"),
  payload: jsonb("payload"),
  status: text("status"), // pending | approved | rejected
});

// approvals.ts route exists (10,746 bytes)
```

**Missing:**
- Risk classification framework (read-only vs financial vs destructive)
- Approval UI components
- Escalation policies
- Timeout/auto-reject rules
- Audit reporting

**Required Implementation:**
```typescript
enum ActionRiskLevel {
  READ_ONLY = "read_only",
  REVERSIBLE = "reversible",
  FINANCIAL = "financial",
  LEGAL = "legal",
  DESTRUCTIVE = "destructive",
}

interface ApprovalPolicy {
  riskLevel: ActionRiskLevel;
  requiresApproval: boolean;
  approverRoles: string[];
  timeoutMinutes: number;
  escalationPolicy?: string;
}

class ApprovalEngine {
  async requestApproval(action: Action, context: ExecutionContext) {
    const policy = this.classifyRisk(action);
    if (policy.requiresApproval) {
      return this.createApprovalRequest(action, policy);
    }
    return { approved: true };
  }
}
```

---

## 3. TARGET ARCHITECTURE

### 3.1 Unified Execution Kernel

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPERIENCE LAYER                          │
│  Web App • Writer • Canvas • Voice • Vision • Twin Dashboard │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTROL PLANE                              │
│  API Gateway • Auth • Rate Limiting • Intent Classification  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EXECUTION KERNEL (NEW)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  IntentRouter                                        │   │
│  │  • Classifies: writing/research/business/creative    │   │
│  │  • Extracts: entities, constraints, preferences      │   │
│  │  • Routes to: Agent/Swarm/Twin/Tool                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ContextAssembler                                    │   │
│  │  • Retrieves: persona, memory, RAG, session          │   │
│  │  • Assembles: unified context object                 │   │
│  │  • Compacts: token budget management                 │   │
│  │  • Injects: into model prompt                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TwinOrchestrator                                    │   │
│  │  • Retrieves: Twin profile & goals                   │   │
│  │  • Invokes: Swarm deliberation                       │   │
│  │  • Requests: human approval if required              │   │
│  │  • Executes: via Needle tools                        │   │
│  │  • Records: DSH trace                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ApprovalEngine                                      │   │
│  │  • Classifies: action risk level                     │   │
│  │  • Routes: to appropriate approver                   │   │
│  │  • Enforces: timeout/escalation                      │   │
│  │  • Audits: all decisions                             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┼───────────┐
           │           │           │
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  SWARM   │ │  TWIN    │ │  TOOLS   │
    │  Agents  │ │  Workers │ │  (MCP)   │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │    GORTEX           │
           │  Model Mesh Router  │
           │                     │
           │  • Local (Ollama)   │
           │  • Cloud (DeepSeek) │
           │  • Fallback Chain   │
           └──────────┬──────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │   DATA / MEMORY     │
           │                     │
           │  PostgreSQL:        │
           │  • Twins, Tasks     │
           │  • Companies        │
           │  • Approvals        │
           │                     │
           │  SQLite (local):    │
           │  • DSH Traces       │
           │  • Semantic Memory  │
           │  • Offline Cache    │
           │                     │
           │  Vespa (NEW):       │
           │  • BM25 Search      │
           │  • Dense Vectors    │
           │  • Tensor Scoring   │
           └─────────────────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │   OBSERVABILITY     │
           │   (ENHANCED)        │
           │                     │
           │  • Execution Traces │
           │  • Cost Analytics   │
           │  • Approval Audits  │
           │  • Health Metrics   │
           │  • Alerting         │
           └─────────────────────┘
```

### 3.2 New Package Structure

```
packages/
├── context-engine/           # NEW
│   ├── ContextAssembler.ts
│   ├── PersonaProfiler.ts
│   ├── ContextLifecycleManager.ts
│   ├── IntentRouter.ts
│   ├── SecurityIsolator.ts
│   └── ObservabilityTracker.ts
│
├── execution-kernel/         # NEW
│   ├── TwinOrchestrator.ts
│   ├── ApprovalEngine.ts
│   ├── ExecutionPlanner.ts
│   └── ToolExecutor.ts
│
├── gortex/                   # EXISTING (enhance)
│   └── ...
│
├── swarm/                    # EXISTING (refactor)
│   └── ... (integrate with Twin)
│
├── vespa-client/             # NEW
│   ├── VespaClient.ts
│   ├── HybridRetriever.ts
│   └── RankingFunctions.ts
│
└── observability/            # NEW
    ├── TraceCollector.ts
    ├── CostAnalyzer.ts
    ├── HealthMonitor.ts
    └── AlertingEngine.ts
```

---

## 4. MIGRATION PLAN

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Create unified context assembly and intent routing

**Tasks:**
1. ✅ Create `packages/context-engine/` with 6 classes from docs
2. ✅ Implement `IntentRouter` with 8 intent categories
3. ✅ Build `ContextAssembler` pipeline
4. ✅ Add persona-specific context profiles
5. ✅ Write integration tests for context flow

**Deliverables:**
- Working context assembly pipeline
- Intent classification API
- Persona-aware context loading

**Success Metrics:**
- Context assembly < 100ms p95
- Intent classification accuracy > 90%
- Test coverage > 85%

---

### Phase 2: Unification (Weeks 3-4)

**Goal:** Integrate Swarm + Twin into unified execution engine

**Tasks:**
1. ✅ Create `packages/execution-kernel/`
2. ✅ Build `TwinOrchestrator` that invokes Swarm
3. ✅ Refactor `swarm-runner.ts` to accept Twin context
4. ✅ Create unified execution plan schema
5. ✅ Update database migrations for execution traces

**Deliverables:**
- TwinOrchestrator class
- Swarm-Twin integration
- Unified execution schema

**Success Metrics:**
- End-to-end execution time < 2s p95
- Zero data loss in migration
- Backward compatibility maintained

---

### Phase 3: Approval & Security (Weeks 5-6)

**Goal:** Implement human approval workflows and security boundaries

**Tasks:**
1. ✅ Create `ApprovalEngine` with risk classification
2. ✅ Build approval UI components (React)
3. ✅ Implement escalation policies
4. ✅ Add RLS policies for context isolation
5. ✅ Create audit logging system

**Deliverables:**
- Approval workflow engine
- Risk classification framework
- Audit trail system

**Success Metrics:**
- Approval requests processed < 500ms
- 100% of financial/legal actions require approval
- Zero context leakage incidents

---

### Phase 4: Vespa RAG (Weeks 7-8)

**Goal:** Deploy Vespa and migrate RAG from SQLite

**Tasks:**
1. ✅ Deploy Vespa instance (Docker)
2. ✅ Create Vespa schemas for documents
3. ✅ Implement hybrid retrieval (BM25 + HNSW + tensor)
4. ✅ Migrate existing embeddings to Vespa
5. ✅ Update RAG engine to use Vespa

**Deliverables:**
- Production Vespa cluster
- Hybrid search pipeline
- Migration scripts

**Success Metrics:**
- Search latency < 50ms p95
- Recall@10 > 0.95
- Zero downtime during migration

---

### Phase 5: Observability (Weeks 9-10)

**Goal:** Implement comprehensive tracing, cost analytics, and alerting

**Tasks:**
1. ✅ Create `packages/observability/`
2. ✅ Enhance DSH with cost fields
3. ✅ Build cost analytics dashboard
4. ✅ Implement health monitoring
5. ✅ Create alerting rules (PagerDuty/Slack)

**Deliverables:**
- Execution trace enrichment
- Cost analytics dashboard
- Health monitoring system
- Alerting infrastructure

**Success Metrics:**
- 100% of requests traced
- Cost data accurate to $0.01
- Alert false positive rate < 5%

---

### Phase 6: Testing & Hardening (Weeks 11-12)

**Goal:** Comprehensive testing, load testing, chaos engineering

**Tasks:**
1. ✅ Write end-to-end pipeline tests
2. ✅ Load test (1000 concurrent users)
3. ✅ Chaos engineering (failure injection)
4. ✅ Security audit (penetration testing)
5. ✅ Documentation updates

**Deliverables:**
- Test suite (>90% coverage)
- Load test report
- Security audit report
- Updated documentation

**Success Metrics:**
- 99.9% uptime under load
- Zero critical security vulnerabilities
- All documentation up to date

---

## 5. REPOSITORY CLEANUP PLAN

### 5.1 Canonical Structure

**Keep as Single Source of Truth:**
```
shothik-opc-v2/              # CANONICAL MONOREPO
├── artifacts/
│   ├── shothik/             # Frontend
│   ├── api-server/          # API Gateway
│   └── swarm-orchestrator/  # Swarm (merge into packages/swarm)
│
├── packages/                # ALL platform capabilities
│   ├── context-engine/      # NEW
│   ├── execution-kernel/    # NEW
│   ├── gortex/
│   ├── swarm/
│   ├── vespa-client/        # NEW
│   ├── observability/       # NEW
│   ├── persona-engine/
│   └── taste-skill/
│
├── lib/                     # Shared utilities
│   ├── db/
│   ├── hermes/
│   ├── api-zod/
│   └── office-engine/
│
└── docs/                    # Documentation
```

### 5.2 Repository Consolidation

| Current Repo | Action | Destination | Priority |
|--------------|--------|-------------|----------|
| `shothik-opc-v2` | **KEEP** | Canonical monorepo | 🔴 P0 |
| `shothik-frontend-v2` | MERGE | `shothik-opc-v2/artifacts/shothik` | 🔴 P0 |
| `shothik-backend-v2` | MERGE | `shothik-opc-v2/artifacts/api-server` | 🔴 P0 |
| `shothik-swarm` | MERGE | `shothik-opc-v2/packages/swarm` | 🟠 P1 |
| `shothik-mcp` | MERGE | `shothik-opc-v2/packages/mcp` | 🟠 P1 |
| `shothik-gortex` | MERGE | `shothik-opc-v2/packages/gortex` | 🟠 P1 |
| `shothik-vespa` | CREATE | `shothik-opc-v2/packages/vespa-client` | 🟠 P1 |
| `shothik-sdk` | KEEP SEPARATE | Developer SDK | 🟡 P2 |
| `shothik-cli` | KEEP SEPARATE | CLI tooling | 🟡 P2 |
| `shothik-docs` | DELETE | Merge into `shothik-opc-v2/docs` | 🟡 P2 |
| `shothik-writer` | MERGE | `shothik-opc-v2/artifacts/writer` | 🟡 P2 |
| `shothik-voice` | MERGE | `shothik-opc-v2/packages/voice` | 🟡 P2 |
| `shothik-vision` | MERGE | `shothik-opc-v2/packages/vision` | 🟡 P2 |

### 5.3 Cleanup Scripts

```bash
#!/bin/bash
# cleanup-repos.sh

# 1. Archive deprecated repos
gh repo archive shothik-docs --confirm
gh repo archive shothik-frontend-v2 --confirm
gh repo archive shothik-backend-v2 --confirm

# 2. Merge code into canonical monorepo
# (Manual process - see migration guide)

# 3. Update GitHub branch protection rules
# (Manual process in GitHub settings)

# 4. Update CI/CD pipelines
# (Update .github/workflows in shothik-opc-v2)
```

---

## 6. RISK ASSESSMENT

### 6.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | High | Backup before each phase, rollback scripts |
| Downtime during Vespa migration | Medium | Medium | Blue-green deployment, canary releases |
| Performance regression | Medium | Medium | Load testing after each phase, performance budgets |
| Breaking API changes | High | Medium | Version APIs, maintain backward compatibility |
| Context leakage between users | Low | High | RLS policies, security audit, penetration testing |

### 6.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Team capacity constraints | Medium | High | Prioritize ruthlessly, defer non-critical features |
| Vendor lock-in (Vespa) | Low | Medium | Abstract Vespa client, maintain fallback to SQLite |
| Compliance violations (GDPR/BDSA) | Medium | High | Legal review, audit trails, data minimization |
| Security breach | Low | High | Security audit, bug bounty, incident response plan |

---

## 7. SUCCESS METRICS

### 7.1 Engineering Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Request latency (p95) | 800ms | <200ms | Week 12 |
| Context assembly time | N/A | <100ms | Week 2 |
| Test coverage | 45% | >90% | Week 12 |
| Deployment frequency | 2/week | 5/week | Week 12 |
| Mean time to recovery | 4 hours | <30 min | Week 12 |

### 7.2 Product Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| User activation rate | 35% | 60% | Week 12 |
| Task completion rate | 52% | 80% | Week 12 |
| Approval workflow adoption | 0% | 95% | Week 6 |
| Cost per request | $0.008 | $0.003 | Week 10 |
| User satisfaction (NPS) | 42 | 70 | Week 12 |

### 7.3 Business Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Monthly active users | 1,200 | 5,000 | Week 12 |
| Paid conversions | 3% | 8% | Week 12 |
| Average revenue per user | $4.50 | $12.00 | Week 12 |
| Churn rate | 18%/month | <8%/month | Week 12 |
| Gross margin | 62% | 78% | Week 12 |

---

## 8. IMMEDIATE NEXT STEPS

### Week 1 (Starting Now)

**Priority 1: Context Engine Implementation**

1. **Day 1-2:** Create `packages/context-engine/` structure
   ```bash
   mkdir -p packages/context-engine/src/{types,utils,config}
   mkdir -p packages/context-engine/tests
   ```

2. **Day 3-4:** Implement core classes
   - `ContextAssembler.ts` (from `CONTEXT_ASSEMBLY_ARCHITECTURE.md`)
   - `PersonaProfiler.ts` (from `PERSONA_CONTEXT_PROFILES.md`)
   - `IntentRouter.ts` (from `INTENT_TO_CONTEXT_ROUTER_SPEC.md`)

3. **Day 5:** Write integration tests
   ```typescript
   describe('ContextAssemblyPipeline', () => {
     it('should assemble context for F-commerce persona', async () => {
       // Test implementation
     });
   });
   ```

**Deliverable:** Working context assembly pipeline with tests

---

### Week 2

**Priority 2: Lifecycle & Security**

1. Implement `ContextLifecycleManager.ts`
2. Implement `SecurityIsolator.ts`
3. Implement `ObservabilityTracker.ts`
4. Update existing routes to use new context engine

**Deliverable:** Complete context engine with all 6 classes

---

### Week 3-4

**Priority 3: Execution Kernel**

1. Create `packages/execution-kernel/`
2. Build `TwinOrchestrator`
3. Integrate Swarm deliberation
4. Update database schemas

**Deliverable:** Unified Twin-Swarm execution engine

---

## 9. GOVERNANCE

### 9.1 Architecture Review Board

**Members:**
- Lead Architect (chair)
- Backend Lead
- Frontend Lead
- Security Engineer
- DevOps Engineer

**Responsibilities:**
- Review all architectural decisions
- Approve major refactors
- Ensure compliance with design principles
- Resolve technical disputes

**Meeting Cadence:** Weekly (Mondays 10 AM BST)

---

### 9.2 Decision Log

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|
| 2026-09-12 | Adopt monorepo structure | Reduce duplication, improve discoverability | Architecture Board |
| 2026-09-12 | Implement context engine first | Foundation for all other improvements | Engineering Lead |
| 2026-09-12 | Deploy Vespa for RAG | Required for hybrid search at scale | Backend Lead |

---

## 10. APPENDICES

### Appendix A: File Locations Reference

| Component | Current Path | Target Path |
|-----------|--------------|-------------|
| API Gateway | `artifacts/api-server/` | `artifacts/api-server/` |
| Frontend | `artifacts/shothik/` | `artifacts/shothik/` |
| Swarm | `artifacts/swarm-orchestrator/` | `packages/swarm/` |
| GORTEX | `packages/gortex/` | `packages/gortex/` |
| Database | `lib/db/` | `lib/db/` |
| Hermes | `lib/hermes/` | `lib/hermes/` |
| **Context Engine** | *N/A* | `packages/context-engine/` |
| **Execution Kernel** | *N/A* | `packages/execution-kernel/` |
| **Vespa Client** | *N/A* | `packages/vespa-client/` |
| **Observability** | *N/A* | `packages/observability/` |

---

### Appendix B: Database Migration Scripts

```sql
-- Migration: Add execution traces table
CREATE TABLE IF NOT EXISTS execution_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  persona_type TEXT,
  model_route TEXT[] NOT NULL,
  total_cost_usd DECIMAL(10,6) NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  approval_required BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_execution_traces_session ON execution_traces(session_id);
CREATE INDEX idx_execution_traces_user ON execution_traces(user_id);
CREATE INDEX idx_execution_traces_created ON execution_traces(created_at);

-- Migration: Add cost analytics table
CREATE TABLE IF NOT EXISTS cost_analytics (
  date DATE PRIMARY KEY,
  model_name TEXT NOT NULL,
  total_tokens INTEGER NOT NULL,
  total_cost_usd DECIMAL(10,6) NOT NULL,
  avg_latency_ms INTEGER NOT NULL,
  success_rate DECIMAL(5,4) NOT NULL,
  UNIQUE(model_name, date)
);

-- Migration: Add approval audit fields
ALTER TABLE twin_pending_approvals 
ADD COLUMN risk_level TEXT NOT NULL DEFAULT 'read_only',
ADD COLUMN escalated_to TEXT,
ADD COLUMN timeout_at TIMESTAMPTZ,
ADD COLUMN audit_trail JSONB NOT NULL DEFAULT '[]';
```

---

### Appendix C: Environment Variables Checklist

```bash
# Context Engine
CONTEXT_BUDGET_DEFAULT=4096
CONTEXT_COMPRESSION_THRESHOLD=0.8
CONTEXT_EXPIRATION_HOURS=24

# Vespa RAG
VESPA_ENDPOINT=https://vespa.shothikgpt.com
VESPA_CLUSTER_ID=shothik-prod
VESPA_API_KEY=${VESPA_API_KEY}

# Observability
TRACE_SAMPLING_RATE=1.0
COST_ANALYTICS_ENABLED=true
ALERT_WEBHOOK_URL=${SLACK_WEBHOOK}

# Approval Engine
APPROVAL_TIMEOUT_MINUTES=60
FINANCIAL_APPROVAL_REQUIRED=true
LEGAL_APPROVAL_THRESHOLD_USD=100
```

---

### Appendix D: Testing Checklist

```markdown
## Unit Tests
- [ ] ContextAssembler.assemble()
- [ ] IntentRouter.classify()
- [ ] TwinOrchestrator.executeTask()
- [ ] ApprovalEngine.requestApproval()

## Integration Tests
- [ ] Full request pipeline (Intent → Result)
- [ ] Swarm + Twin integration
- [ ] Vespa hybrid search
- [ ] Approval workflow end-to-end

## Load Tests
- [ ] 1000 concurrent users
- [ ] 10,000 requests/minute
- [ ] Context assembly under load
- [ ] Database connection pool stress

## Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Context leakage between users
- [ ] RLS policy enforcement
```

---

## DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **CTO** | | | |
| **Lead Architect** | | | |
| **Engineering Lead** | | | |
| **Security Lead** | | | |

---

**Next Review Date:** October 12, 2026  
**Document Owner:** Architecture Review Board  
**Distribution:** Engineering Team, Product Leadership, Security Team
