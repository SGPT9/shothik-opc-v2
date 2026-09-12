# Intent-to-Context Router Specification

**Version:** 1.0.0  
**Status:** Production Ready  
**Owner:** Context Engineering Team  
**Last Updated:** 2025-06-15  
**Related Docs:** [Context Assembly Architecture](./CONTEXT_ASSEMBLY_ARCHITECTURE.md), [Persona Context Profiles](./PERSONA_CONTEXT_PROFILES.md)

---

## 1. Executive Summary

The Intent-to-Context Router is the **decision engine** that translates user intent into optimized context retrieval strategies. It determines:
- **What** context sources to query
- **How deeply** to search each source
- **In what order** to execute retrievals (parallel vs sequential)
- **When** to apply re-ranking, filtering, or expansion
- **How much** latency budget to allocate per source

This specification defines the routing logic, fallback hierarchies, and performance budgets for Shothik's context assembly pipeline.

---

## 2. Intent Classification Taxonomy

### 2.1 Primary Intent Categories

| Intent ID | Category | Description | Default Depth | Latency Budget |
|-----------|----------|-------------|---------------|----------------|
| `INTENT_01` | **Information Retrieval** | Fact-finding, lookup, reference | Shallow (3) | 400ms |
| `INTENT_02` | **Research & Analysis** | Deep investigation, synthesis | Deep (7) | 1200ms |
| `INTENT_03` | **Creative Generation** | Writing, storytelling, content creation | Medium (5) | 800ms |
| `INTENT_04` | **Task Execution** | Transactional, workflow completion | Shallow (3) | 500ms |
| `INTENT_05` | **Conversation & Support** | Chat, customer service, Q&A | Shallow (2) | 300ms |
| `INTENT_06` | **Learning & Education** | Tutorial, explanation, skill-building | Medium (5) | 900ms |
| `INTENT_07` | **Decision Support** | Comparison, recommendation, planning | Deep (7) | 1100ms |
| `INTENT_08` | **Code & Technical** | Debugging, implementation, architecture | Deep (7) | 1000ms |

### 2.2 Intent Confidence Scoring

```typescript
interface IntentConfidence {
  primary: string;        // e.g., "INTENT_02"
  confidence: number;     // 0.0 - 1.0
  secondary?: string;     // e.g., "INTENT_07"
  secondaryConfidence?: number;
  ambiguityScore: number; // 0.0 (clear) - 1.0 (ambiguous)
}
```

**Routing Behavior by Confidence:**
- **confidence ≥ 0.85**: Execute primary intent strategy
- **0.60 ≤ confidence < 0.85**: Execute primary + secondary (parallel)
- **confidence < 0.60**: Trigger clarification dialogue before retrieval

---

## 3. Context Source Registry

### 3.1 Registered Sources

| Source ID | Name | Type | Latency Profile | Cost Tier | Use Cases |
|-----------|------|------|-----------------|-----------|-----------|
| `SRC_01` | **Session Memory** | Short-term KV store | <50ms | Free | Conversation history, recent actions |
| `SRC_02` | **User Profile** | PostgreSQL | <100ms | Free | Preferences, persona settings |
| `SRC_03` | **Project Context** | SQLite + S3 | <200ms | Free | Active project files, drafts |
| `SRC_04` | **Vespa RAG** | Vector DB | 200-600ms | Low | Knowledge base, documentation |
| `SRC_05` | **Web Search** | External API (Tavily/SerpAPI) | 500-1500ms | Medium | Current events, external facts |
| `SRC_06` | **MCP Tools** | MCP Protocol | 100-800ms | Variable | Live data from connected apps |
| `SRC_07` | **Domain Corpus** | Vespa (specialized) | 300-700ms | Low | Academic papers, legal docs |
| `SRC_08` | **Bengali NLP** | Specialized embeddings | 150-400ms | Low | Banglish normalization, local context |
| `SRC_09` | **Organizational KB** | PostgreSQL + Vespa | 200-500ms | Free | Company policies, SOPs |
| `SRC_10` | **Public APIs** | External (Payment, Courier) | 300-1000ms | Medium | bKash, Pathao, Steadfast |

### 3.2 Source Capability Matrix

| Source | Supports Bengali? | Supports Banglish? | Multi-modal? | Real-time? | Requires Auth? |
|--------|-------------------|--------------------|--------------|------------|----------------|
| SRC_01 | ✅ | ✅ | ❌ | ✅ | ✅ |
| SRC_02 | ✅ | ✅ | ❌ | ❌ | ✅ |
| SRC_03 | ✅ | ✅ | ✅ (images) | ❌ | ✅ |
| SRC_04 | ✅ | ⚠️ (partial) | ❌ | ❌ | ✅ |
| SRC_05 | ⚠️ (English only) | ❌ | ❌ | ⚠️ (cached) | ✅ |
| SRC_06 | Depends on tool | Depends on tool | Varies | ✅ | Varies |
| SRC_07 | ✅ | ❌ | ✅ (PDF) | ❌ | ✅ |
| SRC_08 | ✅ | ✅ | ❌ | ❌ | ✅ |
| SRC_09 | ✅ | ✅ | ❌ | ❌ | ✅ |
| SRC_10 | ⚠️ (English) | ❌ | ❌ | ✅ | ✅ |

---

## 4. Routing Strategies by Intent

### 4.1 INTENT_01: Information Retrieval

```yaml
strategy: shallow_parallel
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_04  # Vespa RAG
    weight: 0.8
    timeout: 400ms
    required: false
  - id: SRC_08  # Bengali NLP
    weight: 0.6
    timeout: 300ms
    required: false
fallback_chain:
  - SRC_04
  - SRC_05  # Web Search (if RAG fails)
max_results: 5
re_ranking: false
```

**Execution Flow:**
1. Query Session Memory (always first)
2. Parallel query to Vespa RAG + Bengali NLP
3. If no results from RAG → trigger Web Search
4. Return top 5 results without re-ranking (latency priority)

---

### 4.2 INTENT_02: Research & Analysis

```yaml
strategy: deep_sequential_with_expansion
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_03  # Project Context
    weight: 0.9
    timeout: 200ms
    required: true
  - id: SRC_07  # Domain Corpus
    weight: 0.85
    timeout: 600ms
    required: false
  - id: SRC_04  # Vespa RAG
    weight: 0.8
    timeout: 600ms
    required: false
  - id: SRC_05  # Web Search
    weight: 0.7
    timeout: 1200ms
    required: false
fallback_chain:
  - SRC_07
  - SRC_04
  - SRC_05
expansion_triggers:
  - if results < 3: expand_to_web = true
  - if confidence < 0.7: add_src_06 = true  # MCP Tools
max_results: 15
re_ranking: true
re_rank_model: cross-encoder-multilingual
citation_required: true
```

**Execution Flow:**
1. Sequential retrieval (Session → Project → Domain → RAG → Web)
2. After each step, evaluate result count and quality
3. If <3 high-quality results → trigger Web Search expansion
4. Apply cross-encoder re-ranking on all results
5. Extract and validate citations
6. Return structured results with source attribution

---

### 4.3 INTENT_03: Creative Generation

```yaml
strategy: medium_balanced
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_02  # User Profile (style prefs)
    weight: 0.8
    timeout: 100ms
    required: true
  - id: SRC_03  # Project Context
    weight: 0.9
    timeout: 200ms
    required: true
  - id: SRC_04  # Vespa RAG
    weight: 0.6
    timeout: 500ms
    required: false
  - id: SRC_08  # Bengali NLP (cultural context)
    weight: 0.7
    timeout: 300ms
    required: false
fallback_chain:
  - SRC_04
  - SRC_08
max_results: 8
re_ranking: false
style_injection: true
```

**Special Handling:**
- Prioritize user style preferences from profile
- Inject cultural context for Bengali/Banglish content
- No aggressive re-ranking (preserve creative diversity)

---

### 4.4 INTENT_04: Task Execution (F-Commerce Focus)

```yaml
strategy: transactional_fast
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_02  # User Profile
    weight: 0.9
    timeout: 100ms
    required: true
  - id: SRC_10  # Public APIs (Payment/Courier)
    weight: 0.95
    timeout: 800ms
    required: true
  - id: SRC_06  # MCP Tools
    weight: 0.9
    timeout: 600ms
    required: false
fallback_chain:
  - SRC_10 (retry × 2)
  - SRC_06 (alternative provider)
max_results: 3
re_ranking: false
real_time_required: true
idempotency_key: true
```

**Critical Requirements:**
- Real-time data mandatory for payment/courier status
- Idempotency keys prevent duplicate transactions
- Retry logic with exponential backoff for external APIs
- No re-ranking (deterministic results required)

---

### 4.5 INTENT_05: Conversation & Support

```yaml
strategy: ultra_fast_session_first
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 30ms
    required: true
  - id: SRC_02  # User Profile
    weight: 0.7
    timeout: 80ms
    required: false
  - id: SRC_09  # Organizational KB
    weight: 0.6
    timeout: 300ms
    required: false
fallback_chain:
  - SRC_09
  - SRC_04
max_results: 3
re_ranking: false
conversation_window: last_10_turns
```

**Optimization:**
- Ultra-low latency target (<300ms total)
- Heavy reliance on session memory
- Minimal external queries unless escalation needed

---

### 4.6 INTENT_06: Learning & Education

```yaml
strategy: pedagogical_progressive
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_02  # User Profile (level, goals)
    weight: 0.9
    timeout: 100ms
    required: true
  - id: SRC_07  # Domain Corpus (educational)
    weight: 0.85
    timeout: 600ms
    required: false
  - id: SRC_04  # Vespa RAG
    weight: 0.75
    timeout: 500ms
    required: false
  - id: SRC_08  # Bengali NLP (local examples)
    weight: 0.7
    timeout: 300ms
    required: false
fallback_chain:
  - SRC_07
  - SRC_04
  - SRC_05
max_results: 10
re_ranking: true
difficulty_matching: true
progression_tracking: true
```

**Special Features:**
- Match content difficulty to user level
- Track learning progression across sessions
- Prioritize pedagogically structured content

---

### 4.7 INTENT_07: Decision Support

```yaml
strategy: comparative_deep
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_02  # User Profile (preferences)
    weight: 0.9
    timeout: 100ms
    required: true
  - id: SRC_04  # Vespa RAG
    weight: 0.85
    timeout: 600ms
    required: false
  - id: SRC_05  # Web Search (market data)
    weight: 0.8
    timeout: 1000ms
    required: false
  - id: SRC_06  # MCP Tools (live comparisons)
    weight: 0.75
    timeout: 800ms
    required: false
fallback_chain:
  - SRC_04
  - SRC_05
  - SRC_06
max_results: 12
re_ranking: true
comparison_matrix: true
pros_cons_extraction: true
```

**Output Structure:**
- Generate comparison matrix
- Extract pros/cons for each option
- Include confidence scores per recommendation

---

### 4.8 INTENT_08: Code & Technical

```yaml
strategy: technical_precise
sources:
  - id: SRC_01  # Session Memory
    weight: 1.0
    timeout: 50ms
    required: true
  - id: SRC_03  # Project Context (codebase)
    weight: 0.95
    timeout: 200ms
    required: true
  - id: SRC_06  # MCP Tools (IDE integration)
    weight: 0.9
    timeout: 600ms
    required: false
  - id: SRC_04  # Vespa RAG (docs)
    weight: 0.8
    timeout: 500ms
    required: false
  - id: SRC_05  # Web Search (StackOverflow, GitHub)
    weight: 0.75
    timeout: 1000ms
    required: false
fallback_chain:
  - SRC_03
  - SRC_06
  - SRC_04
  - SRC_05
max_results: 10
re_ranking: true
code_syntax_validation: true
version_compatibility_check: true
```

**Critical Features:**
- Syntax validation on retrieved code snippets
- Version compatibility checking (e.g., React 19 vs 18)
- Prioritize official documentation over community content

---

## 5. Fallback Hierarchies

### 5.1 Universal Fallback Rules

```typescript
const FALLBACK_RULES = {
  // Rule 1: Always try session memory first
  always_include: ['SRC_01'],
  
  // Rule 2: If primary source times out, try next in chain
  timeout_fallback: 'next_in_chain',
  
  // Rule 3: If all sources fail, trigger user clarification
  all_sources_failed: 'clarify_intent',
  
  // Rule 4: If confidence < 0.6, expand sources
  low_confidence_expansion: {
    threshold: 0.6,
    action: 'add_secondary_sources'
  },
  
  // Rule 5: Web search as last resort for factual queries
  web_search_last_resort: true,
  
  // Rule 6: Cache miss → retry with relaxed filters
  cache_miss_retry: {
    max_retries: 2,
    relax_filters: true
  }
};
```

### 5.2 Fallback Chain Execution

```typescript
async function executeWithFallback(
  primarySource: Source,
  fallbackChain: Source[],
  query: ContextQuery
): Promise<ContextResult> {
  const sources = [primarySource, ...fallbackChain];
  
  for (const source of sources) {
    try {
      const result = await querySource(source, query, {
        timeout: source.timeout,
        retries: 2
      });
      
      if (result && result.items.length >= query.minResults) {
        return result; // Success
      }
      
      // Not enough results, continue to next fallback
      logger.warn(`Source ${source.id} returned insufficient results`, {
        count: result.items.length,
        required: query.minResults
      });
      
    } catch (error) {
      logger.error(`Source ${source.id} failed`, { error });
      // Continue to next fallback
    }
  }
  
  // All sources exhausted
  throw new ContextRetrievalError('All fallback sources exhausted');
}
```

---

## 6. Re-Ranking Protocols

### 6.1 When to Apply Re-Ranking

| Intent | Re-Rank? | Model | Threshold |
|--------|----------|-------|-----------|
| INTENT_01 | ❌ | N/A | N/A |
| INTENT_02 | ✅ | cross-encoder-multilingual | 0.65 |
| INTENT_03 | ❌ | N/A | N/A |
| INTENT_04 | ❌ | N/A | N/A |
| INTENT_05 | ❌ | N/A | N/A |
| INTENT_06 | ✅ | cross-encoder-pedagogical | 0.60 |
| INTENT_07 | ✅ | cross-encoder-comparative | 0.70 |
| INTENT_08 | ✅ | cross-encoder-code | 0.75 |

### 6.2 Re-Ranking Pipeline

```typescript
interface ReRankPipeline {
  input: RawRetrievedChunk[];
  model: string;
  threshold: number;
  max_output: number;
  
  steps: [
    'normalize_scores',
    'apply_cross_encoder',
    'filter_below_threshold',
    'diversity_sampling',  // Ensure topic diversity
    'final_sort'
  ];
}
```

**Diversity Sampling:**
- Prevent top-N results from being too similar
- Ensure coverage across subtopics
- Max similarity between any two results: 0.85 cosine

---

## 7. Latency Budgets

### 7.1 Total Budget by Intent

| Intent | Target P50 | Target P95 | Target P99 | Max Allowed |
|--------|------------|------------|------------|-------------|
| INTENT_01 | 300ms | 500ms | 800ms | 1200ms |
| INTENT_02 | 900ms | 1400ms | 2000ms | 3000ms |
| INTENT_03 | 600ms | 900ms | 1300ms | 2000ms |
| INTENT_04 | 400ms | 700ms | 1000ms | 1500ms |
| INTENT_05 | 200ms | 350ms | 500ms | 800ms |
| INTENT_06 | 700ms | 1100ms | 1600ms | 2500ms |
| INTENT_07 | 850ms | 1300ms | 1900ms | 2800ms |
| INTENT_08 | 750ms | 1200ms | 1700ms | 2500ms |

### 7.2 Budget Allocation Strategy

```typescript
function allocateBudget(
  intent: Intent,
  sources: Source[]
): BudgetAllocation {
  const totalBudget = INTENT_BUDGETS[intent].p95;
  
  // Fixed overhead (routing, serialization, etc.)
  const overhead = 50;
  const availableBudget = totalBudget - overhead;
  
  // Allocate proportionally by source weight
  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  
  return sources.map(source => ({
    sourceId: source.id,
    allocatedBudget: (source.weight / totalWeight) * availableBudget,
    timeout: Math.min(source.timeout, (source.weight / totalWeight) * availableBudget)
  }));
}
```

### 7.3 Circuit Breaker Integration

```typescript
interface CircuitBreakerConfig {
  failureThreshold: 5;        // Failures before opening
  resetTimeout: 30000;        // ms before trying again
  halfOpenRequests: 3;        // Test requests in half-open state
  
  metrics: {
    consecutiveFailures: number;
    lastFailureTime: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  };
}

// Per-source circuit breakers
const circuitBreakers = new Map<string, CircuitBreaker>();
```

---

## 8. Context Query Expansion

### 8.1 Expansion Triggers

```typescript
const EXPANSION_TRIGGERS = {
  // Trigger 1: Insufficient results
  low_result_count: {
    threshold: 3,
    action: 'expand_query_synonyms'
  },
  
  // Trigger 2: Low average relevance score
  low_relevance: {
    threshold: 0.5,
    action: 'broaden_search_scope'
  },
  
  // Trigger 3: High intent ambiguity
  high_ambiguity: {
    threshold: 0.7,
    action: 'multi_interpretation_search'
  },
  
  // Trigger 4: User explicitly requests "more"
  user_request_more: {
    action: 'deep_dive_mode'
  },
  
  // Trigger 5: Complex multi-part query
  multi_part_query: {
    min_parts: 3,
    action: 'decompose_and_search_each'
  }
};
```

### 8.2 Query Expansion Techniques

```typescript
type ExpansionTechnique = 
  | 'synonym_expansion'           // Add synonyms (especially for Bengali)
  | 'hyponym_expansion'           // Add specific instances
  | 'hypernym_expansion'          // Add general categories
  | 'related_concept_expansion'   // Add semantically related terms
  | 'translation_expansion'       // Search in both Bengali and English
  | 'banglish_normalization'      // Try multiple romanization variants
  | 'temporal_expansion'          // Expand time range
  | 'geographic_expansion';       // Expand geographic scope (for local context)
```

**Banglish Expansion Example:**
```
Original: "kibhabe order korbo"
Expanded: [
  "kibhabe order korbo",
  "কিভাবে অর্ডার করব",
  "how to order",
  "order process",
  "ordering tutorial"
]
```

---

## 9. Implementation Reference

### 9.1 Router Interface

```typescript
interface IntentToContextRouter {
  /**
   * Route an intent to context retrieval strategy
   */
  route(
    intent: ClassifiedIntent,
    persona: PersonaId,
    options?: RoutingOptions
  ): Promise<ContextRetrievalPlan>;
  
  /**
   * Execute the retrieval plan
   */
  execute(plan: ContextRetrievalPlan): Promise<AssembledContext>;
  
  /**
   * Get routing decision trace for observability
   */
  getTrace(planId: string): Promise<RoutingTrace>;
}

interface ContextRetrievalPlan {
  planId: string;
  intent: ClassifiedIntent;
  selectedSources: PlannedSource[];
  executionOrder: 'parallel' | 'sequential' | 'hybrid';
  fallbackChain: SourceId[];
  reRankingConfig?: ReRankConfig;
  latencyBudget: LatencyBudget;
  expansionTriggers: ExpansionTrigger[];
}
```

### 9.2 Routing Decision Log

```typescript
interface RoutingTrace {
  planId: string;
  timestamp: number;
  intent: {
    detected: string;
    confidence: number;
    alternatives: Array<{ intent: string; confidence: number }>;
  };
  persona: PersonaId;
  decisions: Array<{
    stage: 'source_selection' | 'ordering' | 'fallback' | 'reranking';
    rationale: string;
    alternativesConsidered: string[];
    chosen: string;
  }>;
  performance: {
    totalLatency: number;
    sourceLatencies: Record<SourceId, number>;
    cacheHits: number;
    fallbackInvocations: number;
  };
  outcome: {
    success: boolean;
    resultCount: number;
    avgRelevanceScore: number;
    errors?: string[];
  };
}
```

---

## 10. Monitoring & Observability

### 10.1 Key Metrics

```typescript
interface RouterMetrics {
  // Throughput
  requestsPerSecond: number;
  
  // Latency
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  
  // Quality
  avgResultCount: number;
  avgRelevanceScore: number;
  fallbackUsageRate: number;
  
  // Reliability
  successRate: number;
  errorRate: number;
  circuitBreakerOpenRate: number;
  
  // Cost
  avgCostPerRequest: number;
  costBySource: Record<SourceId, number>;
  
  // Intent Distribution
  intentDistribution: Record<IntentId, number>;
}
```

### 10.2 Alerting Rules

| Metric | Threshold | Severity | Action |
|--------|-----------|----------|--------|
| p95 Latency > budget × 1.5 | 3 consecutive minutes | Warning | Investigate slow sources |
| p95 Latency > budget × 2.0 | 1 minute | Critical | Trigger circuit breaker |
| Success Rate < 95% | 5 minutes | Warning | Check source health |
| Success Rate < 90% | 2 minutes | Critical | Escalate to on-call |
| Fallback Usage > 30% | 10 minutes | Warning | Review primary source config |
| Avg Result Count < 2 | 5 minutes | Warning | Expand retrieval depth |
| Cost per Request > 2× baseline | 15 minutes | Warning | Review expensive sources |

### 10.3 Debug Endpoints

```bash
# Get routing decision for a specific request
GET /api/v1/context/router/trace/{planId}

# Simulate routing without execution
POST /api/v1/context/router/simulate
{
  "intent": "INTENT_02",
  "persona": "PERSONA_ACADEMIC",
  "query": "quantum computing applications"
}

# Get source health dashboard
GET /api/v1/context/router/sources/health

# Force refresh source configurations
POST /api/v1/context/router/sources/refresh
```

---

## 11. A/B Testing Framework

### 11.1 Experiment Configuration

```typescript
interface RoutingExperiment {
  experimentId: string;
  name: string;
  hypothesis: string;
  
  variants: {
    control: RoutingConfig;
    treatment: RoutingConfig;
  };
  
  allocation: {
    control: number;  // e.g., 0.5 for 50%
    treatment: number;
  };
  
  targeting: {
    personas?: PersonaId[];
    intents?: IntentId[];
    regions?: string[];
  };
  
  successMetrics: string[];
  guardrailMetrics: string[];
  
  startDate: number;
  endDate?: number;
}
```

### 11.2 Example Experiment

```typescript
const EXPERIMENT_001: RoutingExperiment = {
  experimentId: 'EXP_ROUTER_001',
  name: 'Parallel vs Sequential for Research Intent',
  hypothesis: 'Parallel retrieval reduces p95 latency by 30% without sacrificing relevance',
  
  variants: {
    control: {
      intent: 'INTENT_02',
      strategy: 'deep_sequential_with_expansion'
    },
    treatment: {
      intent: 'INTENT_02',
      strategy: 'deep_parallel_with_reranking'
    }
  },
  
  allocation: {
    control: 0.5,
    treatment: 0.5
  },
  
  successMetrics: [
    'p95_latency',
    'avg_relevance_score',
    'user_satisfaction_rating'
  ],
  
  guardrailMetrics: [
    'cost_per_request',
    'error_rate',
    'fallback_usage_rate'
  ],
  
  startDate: Date.now()
};
```

---

## 12. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-06-15 | Initial specification | Context Engineering Team |

---

## Appendix A: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│           INTENT-TO-CONTEXT ROUTER QUICK REFERENCE          │
├─────────────────────────────────────────────────────────────┤
│ INTENT_01 (Info)      → shallow_parallel, 400ms, 5 results  │
│ INTENT_02 (Research)  → deep_sequential, 1200ms, 15 results │
│ INTENT_03 (Creative)  → medium_balanced, 800ms, 8 results   │
│ INTENT_04 (Task)      → transactional_fast, 500ms, 3 results│
│ INTENT_05 (Chat)      → ultra_fast_session, 300ms, 3 results│
│ INTENT_06 (Learning)  → pedagogical_prog, 900ms, 10 results │
│ INTENT_07 (Decision)  → comparative_deep, 1100ms, 12 results│
│ INTENT_08 (Code)      → technical_precise, 1000ms, 10 res   │
├─────────────────────────────────────────────────────────────┤
│ ALWAYS: Session Memory first                                │
│ FALLBACK: Chain through sources, then clarify               │
│ RE-RANK: Only for INTENT_02, 06, 07, 08                     │
│ BANGISH: Expand to Bengali + English variants               │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Bengali/Banglish Query Expansion Examples

| Original Query | Expanded Queries |
|----------------|------------------|
| "order kibhabe dibo" | ["order kibhabe dibo", "অর্ডার কিভাবে দিব", "how to place order", "order placement process"] |
| "payment verify hoy nai" | ["payment verify hoy nai", "পেমেন্ট ভেরিফাই হয় নাই", "payment not verified", "payment verification failed"] |
| "pathao courier cost" | ["pathao courier cost", "পাঠাও কুরিয়ার খরচ", "Pathao delivery charge", "courier pricing Bangladesh"] |
| "bkash cashout niyam" | ["bkash cashout niyam", "বিকাশ ক্যাশআউট নিয়ম", "bKash cashout rules", "how to cashout bKash"] |

---

**END OF SPECIFICATION**
