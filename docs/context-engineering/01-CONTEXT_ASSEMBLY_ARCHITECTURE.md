# Context Assembly Architecture

**Document ID:** `CTX-ARCH-001`  
**Version:** 1.0.0  
**Status:** Draft  
**Owner:** Platform Engineering  
**Last Updated:** 2025-01-XX  
**Classification:** Internal Engineering

---

## Executive Summary

This document defines the unified architecture for context assembly in Shothik AI, specifying how contextual information flows from user intent through retrieval, assembly, injection, and model consumption. This architecture supports all personas (F-Commerce Operator, Academic Researcher, Zero-Capital Creator, SME Operator) with persona-specific optimizations while maintaining a single coherent execution pipeline.

### Design Principles

1. **Intent-First**: Context assembly begins with intent classification, not keyword matching
2. **Persona-Aware**: Default context profiles vary by detected persona
3. **Cost-Conscious**: Every context token has an associated cost budget
4. **Secure-by-Design**: Context isolation boundaries prevent cross-user leakage
5. **Observable**: Every context decision is traceable and debuggable
6. **Degradable**: Graceful fallbacks when primary context sources fail

---

## 1. Context Flow Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   USER      │     │   INTENT     │     │   CONTEXT   │     │   CONTEXT   │     │   MODEL     │
│   REQUEST   │────▶│   CLASSIFIER │────▶│   RETRIEVER │────▶│   ASSEMBLER │────▶│   INJECTION │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
                           │                    │                    │                    │
                           ▼                    ▼                    ▼                    ▼
                    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                    │ Persona Detect│    │ Multi-Source │     │ Compaction & │     │ Token Budget │
                    │ Intent Depth  │    │ Fetch        │     │ Prioritization│    │ Validation   │
                    │ Query Rewrite │    │ Re-Ranking   │     │ Injection Pos │    │ Final Inject │
                    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 1.1 Stage Definitions

| Stage | Responsibility | Latency Budget | Failure Mode |
|-------|---------------|----------------|--------------|
| **Intent Classification** | Detect persona, intent type, complexity level | <50ms | Default to general persona |
| **Context Retrieval** | Parallel fetch from SQL, Vespa, session memory | <200ms | Partial degradation allowed |
| **Context Assembly** | Merge, deduplicate, rank, compact | <100ms | Aggressive compaction |
| **Model Injection** | Position context, validate tokens, inject | <20ms | Hard fail if over budget |

---

## 2. Context Window Topology

### 2.1 Per-Persona Token Allocation

| Persona | Max Context | System Prompt | Retrieved Context | Session Memory | User Message | Reserved |
|---------|-------------|---------------|-------------------|----------------|--------------|----------|
| **F-Commerce Operator** | 128K | 8K | 64K | 32K | 16K | 8K |
| **Academic Researcher** | 200K | 12K | 128K | 32K | 20K | 8K |
| **Zero-Capital Creator** | 64K | 6K | 32K | 16K | 8K | 2K |
| **SME Operator** | 128K | 10K | 64K | 24K | 20K | 10K |

### 2.2 Context Slot Structure

```typescript
interface ContextWindow {
  system_prompt: ContextSlot;      // Fixed position: tokens 0-N
  retrieved_context: ContextSlot;  // Variable position: after system
  session_memory: ContextSlot;     // Variable position: before user message
  user_message: ContextSlot;       // Fixed position: last N tokens
  reserved_buffer: ContextSlot;    // Safety margin for generation
}

interface ContextSlot {
  start_token: number;
  end_token: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'system' | 'vespa' | 'postgres' | 'sqlite' | 'session' | 'user';
  expiration_policy: ExpirationPolicy;
  compression_strategy: CompressionStrategy;
}
```

---

## 3. Multi-Source Context Assembly Pipeline

### 3.1 Source Hierarchy

```
Priority 1: Session Memory (SQLite) - Low latency, high relevance
Priority 2: PostgreSQL (Structured Data) - Business entities, transactions
Priority 3: Vespa (Semantic Search) - Documents, knowledge base
Priority 4: External APIs (MCP Connectors) - Real-time data
Priority 5: Long-term Archive (Cold Storage) - Historical context
```

### 3.2 Parallel Fetch Strategy

```typescript
interface ContextFetchPlan {
  intent_id: string;
  persona: PersonaType;
  parallel_queries: ContextQuery[];
  sequential_fallbacks: ContextQuery[];
  timeout_ms: number;
  min_results_required: number;
}

interface ContextQuery {
  source: 'sqlite' | 'postgres' | 'vespa' | 'mcp';
  query_type: 'semantic' | 'keyword' | 'structured' | 'graph';
  priority: 1 | 2 | 3 | 4;
  timeout_budget_ms: number;
  fallback_query?: string;
}
```

### 3.3 Re-Ranking Algorithm

```python
def rerank_context_chunks(chunks: List[ContextChunk], intent: Intent) -> List[ContextChunk]:
    scores = []
    for chunk in chunks:
        # Relevance scoring (0-1)
        semantic_score = cosine_similarity(chunk.embedding, intent.embedding)
        recency_score = exponential_decay(chunk.timestamp, half_life_hours=24)
        source_reliability = SOURCE_WEIGHTS[chunk.source]
        persona_boost = PERSONA_RELEVANCE[chunk.tags, intent.persona]
        
        # Weighted combination
        final_score = (
            0.4 * semantic_score +
            0.2 * recency_score +
            0.2 * source_reliability +
            0.2 * persona_boost
        )
        scores.append((chunk, final_score))
    
    # Sort by score, keep top N within token budget
    return select_within_budget(sorted(scores, key=lambda x: x[1], reverse=True))
```

---

## 4. Injection Strategies

### 4.1 Injection Positions

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Prepend** | Context before user message | Standard Q&A, research queries |
| **Interleave** | Context chunks between reasoning steps | Complex multi-step tasks |
| **Append** | Context after user message (rare) | Reference material, citations |
| **System-Embedded** | Context merged into system prompt | Persona conditioning, long-term preferences |

### 4.2 Injection Template

```xml
<context_injection>
  <metadata>
    <intent_id>{intent_id}</intent_id>
    <persona>{persona}</persona>
    <assembly_timestamp>{iso8601}</assembly_timestamp>
    <total_tokens>{count}</total_tokens>
    <sources>{source_list}</sources>
  </metadata>
  
  <retrieved_context priority="high">
    <!-- Ranked chunks from Vespa/Postgres -->
    {context_chunks_xml}
  </retrieved_context>
  
  <session_memory priority="medium">
    <!-- Recent conversation history, user preferences -->
    {session_memory_xml}
  </session_memory>
  
  <business_context priority="high">
    <!-- Orders, inventory, payments (F-Commerce/SME) -->
    {business_entities_xml}
  </business_context>
</context_injection>

<user_message>
  {user_input}
</user_message>
```

---

## 5. Banglish/Bengali-Specific Token Normalization

### 5.1 Character Encoding Rules

| Issue | Solution | Implementation |
|-------|----------|----------------|
| Banglish romanization variance | Canonical form mapping | `আমি → ami → "I"` normalization table |
| Bengali compound characters | Pre-tokenization splitting | Split conjuncts before BPE tokenization |
| Mixed script detection | Script-aware tokenization | Detect Bengali vs Latin vs numeric runs |
| Code-switching patterns | Context-aware embedding | Separate embeddings for Banglish vs pure Bengali |

### 5.2 Token Efficiency Optimizations

```python
BENGLALI_TOKEN_REDUCTION_RULES = {
    'compound_split': True,      # Split conjuncts for better compression
    'romanization_canonicalize': True,  # Normalize Banglish variants
    'numeric_localization': True,  # Convert ১২৩ to 123 for token efficiency
    'stopword_expansion': [      # Expand common Bengali stopwords
        'আমি', 'তুমি', 'সে', 'এই', 'ওই', 'কি', 'না', 'হ্যাঁ'
    ],
    'embedding_model': 'multilingual-e5-large',  # Better Bengali semantic capture
}
```

### 5.3 Estimated Token Savings

| Optimization | Reduction % | Notes |
|--------------|-------------|-------|
| Compound splitting | 15-20% | Reduces rare token fragmentation |
| Romanization canonicalization | 10-15% | Merges variant spellings |
| Numeric localization | 5-8% | Standardizes number representation |
| **Combined** | **25-35%** | Cumulative effect |

---

## 6. Context Pressure Thresholds & Compaction Triggers

### 6.1 Pressure Levels

| Level | Usage % | Action | Trigger Condition |
|-------|---------|--------|-------------------|
| **Green** | 0-60% | No action | Normal operation |
| **Yellow** | 60-80% | Soft compaction | Summarize low-priority chunks |
| **Orange** | 80-90% | Aggressive compaction | Drop lowest 20% ranked chunks |
| **Red** | 90-95% | Emergency truncation | Keep only critical context |
| **Critical** | 95-100% | Hard fail | Reject request with clear error |

### 6.2 Compaction Strategies by Pressure Level

```typescript
interface CompactionStrategy {
  green: NoCompaction;
  yellow: SummarizeLowPriority;
  orange: DropBottomPercentile + SummarizeMedium;
  red: KeepCriticalOnly + AggressiveSummarization;
  critical: RejectRequest;
}

function apply_compaction(
  context: ContextWindow,
  pressure_level: PressureLevel,
  persona: PersonaType
): ContextWindow {
  switch (pressure_level) {
    case 'green':
      return context; // No action
    
    case 'yellow':
      return summarize_chunks(context, priority='low', target_reduction=0.15);
    
    case 'orange':
      context = drop_bottom_percentile(context, percentile=0.2);
      return summarize_chunks(context, priority='medium', target_reduction=0.25);
    
    case 'red':
      context = keep_only_priority(context, ['critical', 'high']);
      return aggressive_summarization(context, target_reduction=0.5);
    
    case 'critical':
      throw new ContextOverflowError('Cannot assemble context within token budget');
  }
}
```

---

## 7. Fallback Hierarchy

### 7.1 Source-Level Fallbacks

```
Primary Source Failed → Fallback Sequence

Vespa Semantic Search:
  1. Vespa (degraded: keyword-only mode)
  2. PostgreSQL full-text search
  3. Session memory keyword match
  4. Empty context with warning

PostgreSQL Structured Data:
  1. PostgreSQL (read replica)
  2. SQLite local cache
  3. Last-known-good snapshot
  4. Empty business context with warning

Session Memory (SQLite):
  1. Primary SQLite
  2. In-memory LRU cache
  3. Start fresh session
  4. Warning: "Session context unavailable"
```

### 7.2 Intent Classification Fallbacks

```
Primary Intent Detection Failed → Fallback Sequence

1. High-confidence classifier (threshold > 0.85)
2. Medium-confidence with persona defaults (threshold > 0.6)
3. Generic persona + broad context retrieval
4. Manual clarification request to user
```

### 7.3 Assembly Pipeline Circuit Breaker

```typescript
interface CircuitBreakerConfig {
  failure_threshold: 5;        // Failures before opening circuit
  reset_timeout_ms: 30000;     // Wait 30s before retry
  half_open_requests: 3;       // Test with 3 requests before closing
  
  fallback_behavior: 'degraded_context' | 'empty_context' | 'reject';
  alert_on_open: true;
  log_all_transitions: true;
}
```

---

## 8. Performance Benchmarks & SLAs

### 8.1 Latency Targets (P95)

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Intent Classification | <50ms | >100ms |
| Context Retrieval (parallel) | <200ms | >500ms |
| Context Assembly & Ranking | <100ms | >250ms |
| Model Injection | <20ms | >50ms |
| **End-to-End** | **<370ms** | **>900ms** |

### 8.2 Availability Requirements

| Component | Availability SLA | RTO | RPO |
|-----------|------------------|-----|-----|
| Intent Classifier | 99.9% | 5 min | 0 |
| Context Retrieval | 99.5% | 15 min | 5 min |
| Vespa Search | 99.5% | 30 min | 15 min |
| PostgreSQL | 99.9% | 5 min | 0 |
| Session Memory (SQLite) | 99.0% | 1 min | 1 min |

---

## 9. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Implement parallel context fetch pipeline
- [ ] Build persona-specific token allocation logic
- [ ] Deploy re-ranking algorithm with Bengali optimizations
- [ ] Create injection template engine
- [ ] Add Banglish normalization preprocessor

### Phase 2: Resilience (Week 3-4)
- [ ] Implement compaction strategies per pressure level
- [ ] Build fallback hierarchy for all sources
- [ ] Deploy circuit breakers with alerting
- [ ] Add context overflow error handling
- [ ] Create degraded mode operations runbook

### Phase 3: Optimization (Week 5-6)
- [ ] Profile token usage per persona
- [ ] Tune re-ranking weights based on user feedback
- [ ] Optimize Bengali tokenization pipeline
- [ ] Implement context caching for repeated queries
- [ ] A/B test injection strategies

---

## 10. Related Documents

- `PERSONA_CONTEXT_PROFILES.md` - Persona-specific context requirements
- `CONTEXT_LIFECYCLE_AND_EXPIRATION_POLICY.md` - Retention and expiration rules
- `INTENT_TO_CONTEXT_ROUTER_SPEC.md` - Intent classification to retrieval mapping
- `CONTEXT_SECURITY_AND_ISOLATION_BOUNDARIES.md` - Security requirements
- `CONTEXT_OBSERVABILITY_RUNBOOK.md` - Debugging and monitoring guide

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Context Chunk** | Atomic unit of retrieved context (typically 256-1024 tokens) |
| **Context Pressure** | Ratio of used tokens to maximum context window |
| **Compaction** | Process of reducing context size via summarization or deletion |
| **Injection Position** | Location where context is placed relative to user message |
| **Persona** | User archetype with specific context needs and workflows |
| **Re-Ranking** | Post-retrieval scoring to prioritize most relevant chunks |

---

## Appendix B: Example Context Assembly Trace

```json
{
  "trace_id": "ctx_assembly_20250115_abc123",
  "timestamp": "2025-01-15T10:30:45.123Z",
  "persona": "f_commerce_operator",
  "intent": {
    "type": "order_negotiation",
    "confidence": 0.92,
    "complexity": "medium"
  },
  "fetch_plan": {
    "parallel_queries": [
      {"source": "sqlite", "query": "recent_customer_interactions", "latency_ms": 45},
      {"source": "postgres", "query": "product_inventory_status", "latency_ms": 78},
      {"source": "vespa", "query": "negotiation_best_practices", "latency_ms": 156}
    ],
    "total_fetch_time_ms": 189
  },
  "assembly": {
    "raw_chunks_retrieved": 24,
    "after_deduplication": 19,
    "after_reranking": 15,
    "after_compaction": 12,
    "final_token_count": 58432,
    "token_budget": 65536,
    "pressure_level": "yellow"
  },
  "injection": {
    "strategy": "prepend",
    "system_tokens": 7821,
    "context_tokens": 58432,
    "session_tokens": 24567,
    "user_message_tokens": 142,
    "reserved_tokens": 8192,
    "total_tokens": 99154,
    "max_tokens": 131072
  },
  "outcome": "success",
  "warnings": ["Approaching yellow pressure threshold"]
}
```

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | Platform Engineering Lead | | |
| Reviewer | Chief Architect | | |
| Approver | VP of Engineering | | |
