# Context Observability and Debugging Runbook

**Version:** 1.0.0  
**Status:** Production Ready  
**Owner:** Platform Engineering & SRE Teams  
**Last Updated:** 2025-06-15  
**Related Docs:** [Context Assembly Architecture](./CONTEXT_ASSEMBLY_ARCHITECTURE.md), [Intent-to-Context Router Spec](./INTENT_TO_CONTEXT_ROUTER_SPEC.md)

---

## 1. Executive Summary

This runbook provides comprehensive observability, debugging, and troubleshooting guidance for Shothik's context engineering system. It enables:

- **Real-time visibility**: Monitor context assembly performance, quality, and costs
- **Root cause analysis**: Debug failed retrievals, poor relevance, and latency spikes
- **Cost optimization**: Track token usage, source costs, and budget adherence
- **Quality assurance**: Validate context relevance, diversity, and completeness
- **Incident response**: Detect, diagnose, and resolve context pipeline failures

**Observability Stack:** OpenTelemetry → Prometheus/Grafana → Jaeger → Custom Dashboards

---

## 2. Key Metrics Dashboard

### 2.1 Performance Metrics

```typescript
interface ContextPerformanceMetrics {
  // Latency (milliseconds)
  latency: {
    p50: number;      // Target: <600ms
    p90: number;      // Target: <900ms
    p95: number;      // Target: <1200ms
    p99: number;      // Target: <2000ms
    max: number;
    avg: number;
  };
  
  // Throughput
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  
  // By Intent
  byIntent: Record<string, {
    p95Latency: number;
    requestCount: number;
    successRate: number;
  }>;
  
  // By Source
  bySource: Record<string, {
    p95Latency: number;
    requestCount: number;
    cacheHitRate: number;
    errorRate: number;
  }>;
}
```

**Dashboard View:**
```
┌─────────────────────────────────────────────────────────────┐
│          CONTEXT ASSEMBLY PERFORMANCE DASHBOARD             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LATENCY (P95)                  THROUGHPUT                  │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   847 ms     │              │   342 req/s  │            │
│  │  target: 1.2s│              │   +12% vs 1h │            │
│  │  ✅ HEALTHY  │              │              │            │
│  └──────────────┘              └──────────────┘            │
│                                                             │
│  SUCCESS RATE                   ERROR RATE                  │
│  ┌──────────────┐              ┌──────────────┐            │
│  │    98.7%     │              │    1.3%      │            │
│  │  target: 95% │              │  threshold: 5%│            │
│  │  ✅ HEALTHY  │              │  ✅ HEALTHY  │            │
│  └──────────────┘              └──────────────┘            │
│                                                             │
│  CACHE HIT RATE                 COST/REQUEST                │
│  ┌──────────────┐              ┌──────────────┐            │
│  │    67.3%     │              │   $0.0023    │            │
│  │  target: 60% │              │  baseline: $0.0025        │
│  │  ✅ HEALTHY  │              │  ✅ HEALTHY  │            │
│  └──────────────┘              └──────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Quality Metrics

```typescript
interface ContextQualityMetrics {
  // Relevance
  relevance: {
    avgScore: number;         // Target: >0.75
    distribution: {
      excellent: number;      // >0.9
      good: number;           // 0.7-0.9
      fair: number;           // 0.5-0.7
      poor: number;           // <0.5
    };
  };
  
  // Completeness
  completeness: {
    avgChunkCount: number;    // Target: 5-15 depending on intent
    avgTokenCount: number;    // Target: varies by persona
    coverageScore: number;    // % of query aspects covered
  };
  
  // Diversity
  diversity: {
    avgSimilarity: number;    // Target: <0.85 between chunks
    uniqueSources: number;    // Target: ≥3 sources
    topicCoverage: number;    // % of subtopics represented
  };
  
  // Freshness
  freshness: {
    avgAge: number;           // Target: <7 days for dynamic content
    stalePercentage: number;  // Target: <10% >30 days old
  };
}
```

### 2.3 Cost Metrics

```typescript
interface ContextCostMetrics {
  // Per-request cost breakdown
  costPerRequest: {
    total: number;            // USD
    bySource: Record<string, number>;
    byComponent: {
      retrieval: number;
      reranking: number;
      embedding: number;
      storage: number;
    };
  };
  
  // Daily/monthly totals
  dailyTotal: number;
  monthlyTotal: number;
  monthlyProjection: number;
  budgetRemaining: number;
  
  // Cost efficiency
  costPerSuccessfulRequest: number;
  costPerRelevantResult: number;
  wastePercentage: number;    // Paid but unused retrievals
}
```

---

## 3. Tracing Implementation

### 3.1 Trace Structure

```typescript
interface ContextTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  
  operation: 'context_assembly' | 'source_query' | 'reranking' | 'sanitization';
  
  startTime: number;
  endTime?: number;
  duration: number;
  
  attributes: {
    userId: string;
    orgId?: string;
    sessionId: string;
    intent: string;
    persona: string;
    requestId: string;
  };
  
  // For source queries
  source?: {
    id: string;
    query: string;
    resultCount: number;
    cacheHit: boolean;
    latencyMs: number;
  };
  
  // For reranking
  reranking?: {
    model: string;
    inputCount: number;
    outputCount: number;
    avgScore: number;
    latencyMs: number;
  };
  
  // Outcome
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'FALLBACK';
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  
  // Costs
  cost: {
    tokens: number;
    usd: number;
  };
}
```

### 3.2 Instrumentation Example

```typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('context-engineering');

class ContextAssemblyTracer {
  async assembleContext(
    intent: ClassifiedIntent,
    persona: PersonaId
  ): Promise<AssembledContext> {
    return tracer.startActiveSpan(
      'context.assembly',
      async (span) => {
        try {
          span.setAttribute('intent', intent.id);
          span.setAttribute('persona', persona);
          
          // Route to retrieval plan
          const plan = await this.traceRouting(span, intent, persona);
          
          // Execute retrievals
          const results = await this.traceRetrievals(span, plan);
          
          // Rerank if needed
          const reranked = await this.traceReranking(span, results);
          
          // Sanitize
          const sanitized = await this.traceSanitization(span, reranked);
          
          span.setStatus({ code: SpanStatusCode.OK });
          return sanitized;
          
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
          });
          span.recordException(error);
          throw error;
          
        } finally {
          span.end();
        }
      }
    );
  }
  
  private async traceRouting(
    parentSpan: Span,
    intent: ClassifiedIntent,
    persona: PersonaId
  ): Promise<ContextRetrievalPlan> {
    return tracer.startActiveSpan(
      'context.routing',
      { parent: context.active() },
      async (span) => {
        const plan = await this.router.route(intent, persona);
        
        span.setAttributes({
          'routing.strategy': plan.executionOrder,
          'routing.sources_count': plan.selectedSources.length,
          'routing.fallback_count': plan.fallbackChain.length
        });
        
        return plan;
      }
    );
  }
  
  private async traceRetrievals(
    parentSpan: Span,
    plan: ContextRetrievalPlan
  ): Promise<RetrievedChunk[]> {
    const spans: Span[] = [];
    const results: RetrievedChunk[] = [];
    
    for (const source of plan.selectedSources) {
      const span = tracer.startSpan('context.source_query', {
        parent: context.active()
      });
      
      spans.push(span);
      
      try {
        span.setAttributes({
          'source.id': source.id,
          'source.weight': source.weight,
          'source.timeout_ms': source.timeout
        });
        
        const startTime = Date.now();
        const chunk = await this.querySource(source, plan);
        const latency = Date.now() - startTime;
        
        span.setAttributes({
          'source.result_count': chunk.items.length,
          'source.cache_hit': chunk.cacheHit,
          'source.latency_ms': latency
        });
        
        results.push(chunk);
        span.setStatus({ code: SpanStatusCode.OK });
        
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        span.recordException(error);
        
        // Try fallback
        const fallback = await this.tryFallback(source, plan);
        if (fallback) {
          results.push(fallback);
        }
      } finally {
        span.end();
      }
    }
    
    return results.flat();
  }
}
```

### 3.3 Distributed Trace Example

```
Trace ID: abc123def456
│
├─[0ms] context.assembly (total: 847ms)
│  ├─ attributes: intent=INTENT_02, persona=PERSONA_ACADEMIC
│  │
│  ├─[2ms] context.routing (duration: 15ms)
│  │  ├─ attributes: strategy=deep_sequential, sources=5
│  │  └─ ✅ OK
│  │
│  ├─[17ms] context.source_query (SRC_01: Session Memory)
│  │  ├─ attributes: result_count=3, cache_hit=true, latency=12ms
│  │  └─ ✅ OK
│  │
│  ├─[32ms] context.source_query (SRC_03: Project Context)
│  │  ├─ attributes: result_count=5, cache_hit=false, latency=87ms
│  │  └─ ✅ OK
│  │
│  ├─[124ms] context.source_query (SRC_07: Domain Corpus)
│  │  ├─ attributes: result_count=4, cache_hit=false, latency=523ms
│  │  └─ ✅ OK
│  │
│  ├─[652ms] context.source_query (SRC_04: Vespa RAG)
│  │  ├─ attributes: result_count=6, cache_hit=false, latency=412ms
│  │  └─ ✅ OK
│  │
│  ├─[1069ms] context.reranking (duration: 234ms)
│  │  ├─ attributes: model=cross-encoder-multilingual, input=18, output=15
│  │  └─ ✅ OK
│  │
│  └─[1308ms] context.sanitization (duration: 23ms)
│     ├─ attributes: detections=0, injections_removed=0
│     └─ ✅ OK
│
└─[1331ms] COMPLETE (status=SUCCESS, cost=$0.0034)
```

---

## 4. Debugging Workflows

### 4.1 Debug Poor Relevance

**Symptom:** User reports "context doesn't match my query"

```bash
# Step 1: Find the trace
curl -X GET "http://jaeger.internal:16686/api/traces?service=context-engineering&tags=intent=INTENT_02" \
  | jq '.data[] | select(.spans[].attributes.persona=="PERSONA_ACADEMIC")'

# Step 2: Examine retrieval results
curl -X GET "http://api.internal:3000/v1/context/debug/{traceId}/retrievals" \
  | jq '.sources[] | {id, query, result_count, avg_score}'

# Step 3: Check reranking scores
curl -X GET "http://api.internal:3000/v1/context/debug/{traceId}/reranking" \
  | jq '.chunks[] | {content_preview, score, source}'

# Step 4: Analyze query expansion
curl -X GET "http://api.internal:3000/v1/context/debug/{traceId}/expansion" \
  | jq '.original_query, .expanded_queries[]'
```

**Common Causes & Fixes:**

| Cause | Symptom | Fix |
|-------|---------|-----|
| Wrong intent detected | Low confidence score | Retrain intent classifier |
| Query too narrow | <3 results retrieved | Adjust expansion thresholds |
| Embedding mismatch | Low similarity scores | Update embedding model |
| Stale index | Old results returned | Trigger index refresh |
| Missing source | Expected source not queried | Update routing config |

### 4.2 Debug High Latency

**Symptom:** P95 latency exceeds budget

```bash
# Step 1: Identify slow traces
curl -X GET "http://prometheus.internal:9090/api/v1/query?query=histogram_quantile(0.95, rate(context_assembly_duration_seconds_bucket[5m]))"

# Step 2: Break down by source
curl -X GET "http://grafana.internal:3000/api/datasources/proxy/1/api/v1/query?query=sum by (source_id) (rate(context_source_query_duration_seconds_sum[5m])) / sum by (source_id) (rate(context_source_query_duration_seconds_count[5m]))"

# Step 3: Check circuit breaker status
curl -X GET "http://api.internal:3000/v1/context/sources/health" \
  | jq '.sources[] | {id, circuit_breaker_state, consecutive_failures}'

# Step 4: Analyze timeout patterns
curl -X GET "http://jaeger.internal:16686/api/traces?service=context-engineering&minDuration=1000ms" \
  | jq '.data[] | .spans[] | select(.operationName="context.source_query") | {operationName, duration, attributes}'
```

**Common Causes & Fixes:**

| Cause | Symptom | Fix |
|-------|---------|-----|
| Slow external API | SRC_05 (Web Search) >1s | Increase timeout or add caching |
| Vespa index fragmentation | SRC_04 latency increasing | Run index optimization |
| Database lock contention | PostgreSQL queries slow | Check RLS policy performance |
| Network latency | All external sources slow | Check VPC routing |
| Insufficient resources | High CPU/memory on context service | Scale horizontally |

### 4.3 Debug Context Leakage

**Symptom:** User sees another user's data

```bash
# URGENT: Immediate investigation required

# Step 1: Identify affected users
curl -X GET "http://api.internal:3000/v1/security/audit?event_type=CONTEXT_ACCESS&time_range=last_1h" \
  | jq '.events[] | select(.outcome.allowed==true) | {actor, resource, timestamp}'

# Step 2: Check RLS policies
psql -h postgres.internal -U admin -d shothik -c "
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'context_chunks';
"

# Step 3: Verify JWT claims
curl -X GET "http://api.internal:3000/v1/auth/debug/{userId}" \
  | jq '.claims | {user_id, org_id, role}'

# Step 4: Check for direct DB access
grep -r "context_chunks" /var/log/postgres/ | grep -v "RLS" | tail -50
```

**Immediate Actions:**
1. **Contain**: Disable suspected compromised API keys
2. **Isolate**: Temporarily enable stricter RLS policies
3. **Notify**: Alert security team and affected users
4. **Investigate**: Full forensic audit of access logs
5. **Remediate**: Patch vulnerability, rotate all credentials

### 4.4 Debug Cost Spikes

**Symptom:** Unexpected increase in context assembly costs

```bash
# Step 1: Identify cost drivers
curl -X GET "http://api.internal:3000/v1/context/costs/breakdown?period=24h" \
  | jq '.by_source | to_entries | sort_by(.value.cost) | reverse'

# Step 2: Check for expensive operations
curl -X GET "http://prometheus.internal:9090/api/v1/query?query=sum(rate(context_reranking_cost_usd_total[1h]))"

# Step 3: Analyze cache effectiveness
curl -X GET "http://redis.internal:6379/info" \
  | grep -E "keyspace_hits|keyspace_misses"

# Step 4: Identify wasteful queries
curl -X GET "http://api.internal:3000/v1/context/debug/waste?threshold=0.5" \
  | jq '.queries[] | {query, cost, used_in_response: false}'
```

**Common Causes & Fixes:**

| Cause | Symptom | Fix |
|-------|---------|-----|
| Cache miss spike | Hit rate drops from 70% → 30% | Warm cache, check TTL |
| Over-retrieval | Fetching 50+ chunks when 10 needed | Reduce max_results |
| Unnecessary reranking | Reranking low-confidence queries | Add confidence threshold |
| Web search overuse | SRC_05 calls increased 5x | Tighten fallback triggers |
| Token bloat | Avg tokens/request doubled | Implement compaction |

---

## 5. Alerting Rules

### 5.1 Critical Alerts (Page Immediately)

```yaml
alerts:
  - name: ContextPipelineDown
    condition: rate(context_assembly_errors_total[5m]) > 0.1
    severity: critical
    action: page_oncall
    
  - name: ContextLeakageDetected
    condition: sum(security_context_isolation_violations_total) > 0
    severity: critical
    action: page_security_team
    
  - name: HighLatencyP99
    condition: histogram_quantile(0.99, context_assembly_duration_seconds) > 3
    severity: critical
    action: page_oncall
    
  - name: CostAnomaly
    condition: rate(context_cost_usd_total[1h]) > baseline * 3
    severity: critical
    action: page_finance_lead
```

### 5.2 Warning Alerts (Slack Notification)

```yaml
alerts:
  - name: ElevatedErrorRate
    condition: rate(context_assembly_errors_total[5m]) > 0.02
    severity: warning
    action: slack_platform_team
    
  - name: LowCacheHitRate
    condition: rate(context_cache_hits_total[1h]) / rate(context_cache_requests_total[1h]) < 0.5
    severity: warning
    action: slack_platform_team
    
  - name: SourceDegradation
    condition: histogram_quantile(0.95, context_source_query_duration_seconds{source="SRC_04"}) > 1
    severity: warning
    action: slack_data_team
    
  - name: LowRelevanceScore
    condition: avg(context_relevance_score[30m]) < 0.65
    severity: warning
    action: slack_ml_team
```

### 5.3 Info Alerts (Dashboard Only)

```yaml
alerts:
  - name: IntentDistributionChange
    condition: abs(delta(context_intent_distribution[1h])) > 0.2
    severity: info
    action: dashboard_only
    
  - name: NewPersonaDetected
    condition: count(count by (persona) (context_assembly_total)) != previous_count
    severity: info
    action: dashboard_only
```

---

## 6. Debug Endpoints

### 6.1 Public Debug API

```typescript
// GET /api/v1/context/debug/trace/{traceId}
// Returns full trace with all spans
{
  "traceId": "abc123",
  "duration": 847,
  "status": "SUCCESS",
  "spans": [...],
  "cost": {
    "total": 0.0034,
    "breakdown": {...}
  }
}

// GET /api/v1/context/debug/retrievals/{traceId}
// Returns retrieval results per source
{
  "sources": [
    {
      "id": "SRC_01",
      "query": "...",
      "results": [...],
      "latency": 12,
      "cacheHit": true
    }
  ]
}

// GET /api/v1/context/debug/reranking/{traceId}
// Returns reranking details
{
  "model": "cross-encoder-multilingual",
  "input": [...],
  "output": [...],
  "scores": [...]
}

// POST /api/v1/context/debug/simulate
// Simulate context assembly without execution
{
  "intent": "INTENT_02",
  "persona": "PERSONA_ACADEMIC",
  "query": "quantum computing",
  "predicted_plan": {...},
  "estimated_cost": 0.003,
  "estimated_latency": 900
}
```

### 6.2 Internal Diagnostic Tools

```bash
# Context assembly profiler
./tools/context-profiler --trace-id abc123 --output flamegraph.svg

# Source health checker
./tools/source-health-check --all --verbose

# Cost analyzer
./tools/cost-analyzer --period 24h --top 10

# Replay tool (for debugging)
./tools/context-replay --trace-id abc123 --compare-with latest
```

---

## 7. Runbook: Common Incidents

### Incident 001: Complete Pipeline Failure

**Symptoms:**
- All context assembly requests failing
- Error rate spikes to 100%

**Diagnosis:**
```bash
curl http://api.internal:3000/health
kubectl get pods -l app=context-engineering
kubectl logs -l app=context-engineering --tail=100
```

**Resolution:**
1. Check downstream dependencies (PostgreSQL, Vespa, Redis)
2. Restart context-engineering pods if unhealthy
3. Roll back recent deployment if applicable
4. Escalate to platform team if infrastructure issue

---

### Incident 002: Vespa RAG Degradation

**Symptoms:**
- SRC_04 latency >2s
- Timeouts and fallbacks increasing

**Diagnosis:**
```bash
curl http://vespa.internal:8080/state/v1/health
curl http://vespa.internal:8080/state/v1/metrics
kubectl describe pod vespa-cluster-0
```

**Resolution:**
1. Check Vespa cluster health
2. Run index optimization if fragmented
3. Scale Vespa nodes if overloaded
4. Enable aggressive caching as temporary mitigation

---

### Incident 003: Intent Classifier Drift

**Symptoms:**
- Users report wrong context retrieved
- Intent confidence scores dropping

**Diagnosis:**
```bash
curl http://ml-internal:5000/intent-classifier/metrics
curl http://api.internal:3000/v1/context/debug/intent-distribution?period=7d
```

**Resolution:**
1. Analyze misclassified examples
2. Retrain classifier with recent data
3. Deploy updated model via canary
4. Monitor confidence scores post-deployment

---

### Incident 004: Cost Budget Breach

**Symptoms:**
- Monthly cost projection exceeds budget by 50%
- Web search (SRC_05) costs spiked

**Diagnosis:**
```bash
curl http://api.internal:3000/v1/context/costs/breakdown?period=30d
curl http://api.internal:3000/v1/context/debug/waste?threshold=0.7
```

**Resolution:**
1. Identify top cost drivers
2. Tighten fallback thresholds for expensive sources
3. Increase cache TTLs
4. Implement stricter query expansion limits
5. Review and optimize reranking usage

---

## 8. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-06-15 | Initial runbook | Platform Engineering Team |

---

## Appendix A: Grafana Dashboard Templates

Import these dashboard IDs into Grafana:

- **Context Performance Overview**: `dashboard-context-perf-v1`
- **Source Health Monitor**: `dashboard-source-health-v1`
- **Cost Analytics**: `dashboard-cost-analytics-v1`
- **Security & Compliance**: `dashboard-security-audit-v1`
- **ML Model Performance**: `dashboard-intent-classifier-v1`

---

## Appendix B: Useful Queries

```promql
# P95 latency by intent
histogram_quantile(0.95, 
  sum by (le, intent) (rate(context_assembly_duration_seconds_bucket[5m]))
)

# Error rate by source
sum by (source_id) (rate(context_source_query_errors_total[5m]))
/
sum by (source_id) (rate(context_source_query_total[5m]))

# Cache effectiveness
sum(rate(context_cache_hits_total[1h])) 
/ 
sum(rate(context_cache_requests_total[1h]))

# Cost per intent
sum by (intent) (rate(context_cost_usd_total[1h]))
```

---

**END OF RUNBOOK**
