# Context Lifecycle and Expiration Policy

**Document ID:** `CTX-LIFE-003`  
**Version:** 1.0.0  
**Status:** Draft  
**Owner:** Platform Engineering + Data Engineering  
**Last Updated:** 2025-01-XX  
**Classification:** Internal Engineering

---

## Executive Summary

This document defines the operational policies for context lifecycle management in Shothik AI, including creation, retention, expiration, garbage collection, archival, and deletion of context data across all storage systems (PostgreSQL, SQLite, Vespa). These policies ensure cost efficiency, regulatory compliance, and optimal system performance while respecting user data rights.

### Lifecycle Stages Overview

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ CREATION │───▶│   ACTIVE │───▶│ DORMANT  │───▶│ ARCHIVED │───▶│ DELETED  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
  Timestamp     Access Track    Inactivity      Cold Storage    Purge Trigger
  Validation    Monitoring      Detection       Migration       Execution
```

---

## 1. Context Chunk Expiration Triggers

### 1.1 Time-Based Expiration

| Context Type | Session Expiry | Cross-Session Expiry | Absolute Max Age | Extension Conditions |
|--------------|----------------|---------------------|------------------|---------------------|
| **Session Memory** | End of session | 7-30 days (persona-dependent) | 90 days | Active conversation continuation |
| **Retrieved Documents** | End of session | 14-60 days | 180 days | Re-accessed by user |
| **Business Entities** | N/A | Indefinite (until updated) | N/A | Business continuity requirement |
| **Payment Records** | N/A | 7 years (legal) | N/A | Legal hold |
| **Research Papers** | End of session | Indefinite (user library) | N/A | User ownership |
| **Content Drafts** | End of session | 30-90 days | 1 year | Published or actively edited |
| **Analytics Data** | End of session | 2-5 years | N/A | Business intelligence needs |
| **Chat History** | End of session | 30-180 days | 2 years | Premium user preference |

### 1.2 Event-Based Expiration

| Trigger Event | Affected Context Types | Action | Notification Required |
|---------------|----------------------|--------|----------------------|
| **User Account Deletion** | All context types | Hard delete within 30 days | Yes (confirmation email) |
| **Subscription Downgrade** | Premium context features | Remove premium context after grace period | Yes (7 days before) |
| **Legal Hold Request** | Relevant case context | Suspend expiration, preserve indefinitely | No (legal confidentiality) |
| **Data Breach** | Potentially compromised context | Immediate quarantine, audit, selective deletion | Yes (regulatory requirement) |
| **User Export Request** | All user context | Prepare export package, then continue normal lifecycle | Yes (GDPR compliance) |
| **Business Closure (SME)** | All business context | Archive for legal period, then scheduled deletion | Yes (business owner) |
| **Project Completion** | Project-specific context | Archive after 1 year, delete after 3 years | Optional |
| **Product Discontinuation** | Product catalog context | Mark deprecated, archive after 1 year | Internal only |

### 1.3 Cost-Based Expiration

```typescript
interface CostBasedExpirationPolicy {
  // Trigger expiration when storage cost exceeds threshold
  cost_thresholds: {
    per_user_monthly_usd: 0.50,     // Alert at $0.50/user/month
    per_persona_monthly_usd: {      // Higher thresholds for data-intensive personas
      academic_researcher: 2.00,
      sme_operator: 1.50,
      f_commerce_operator: 0.75,
      zero_capital_creator: 0.25,
    },
    action_on_breach: 'aggressive_compaction_then_expire',
  };
  
  // Token-based triggers (proxy for cost)
  token_thresholds: {
    soft_limit_multiplier: 1.2,     // Warn at 120% of persona budget
    hard_limit_multiplier: 1.5,     // Force expiration at 150%
    emergency_deletion_trigger: 2.0, // Delete oldest 50% at 200%
  };
  
  // Storage tier optimization
  tier_migration: {
    hot_to_warm_days: 7,            // Move to warm storage after 7 days
    warm_to_cold_days: 30,          // Move to cold storage after 30 days
    cold_to_archive_days: 90,       // Archive after 90 days
  };
}
```

---

## 2. Cross-Session Persistence Rules

### 2.1 Persistence Levels

| Level | Description | Default Duration | Persona Defaults |
|-------|-------------|------------------|----------------|
| **Ephemeral** | Session-only, deleted on logout | < 2 hours | All personas (temporary queries) |
| **Short-Term** | Few days for ongoing tasks | 1-7 days | Zero-Capital Creator (content ideas) |
| **Medium-Term** | Weeks for projects | 7-30 days | F-Commerce (customer negotiations) |
| **Long-Term** | Months for active work | 30-180 days | Academic Researcher (research notes) |
| **Indefinite** | Until explicit deletion | User lifetime | Business records, user libraries |

### 2.2 Session Boundary Definitions

```typescript
interface SessionBoundaryRules {
  // Session start conditions
  session_start: [
    'user_authentication',
    'new_conversation_thread',
    'explicit_session_request',
  ];
  
  // Session end conditions
  session_end: [
    'user_logout',
    'inactivity_timeout_default: 30_minutes',
    'browser_close_detected',
    'explicit_session_end',
  ];
  
  // Session extension conditions
  session_extend: [
    'active_typing_detected',
    'api_call_within_last_5_minutes',
    'user_clicked_continue_session',
  ];
  
  // Cross-session context carryover rules
  carryover_by_persona: {
    f_commerce_operator: {
      max_sessions: 5,
      carryover_types: ['customer_history', 'active_orders', 'preferences'],
      expiry_after_sessions: 7,
    },
    academic_researcher: {
      max_sessions: 20,
      carryover_types: ['paper_library', 'research_notes', 'citations'],
      expiry_after_sessions: 30,
    },
    zero_capital_creator: {
      max_sessions: 10,
      carryover_types: ['content_ideas', 'script_drafts', 'analytics'],
      expiry_after_sessions: 14,
    },
    sme_operator: {
      max_sessions: 50,
      carryover_types: ['business_entities', 'financial_records', 'team_data'],
      expiry_after_sessions: 'indefinite',
    },
  };
}
```

### 2.3 Context Continuity Strategies

| Strategy | Description | Use Case | Implementation |
|----------|-------------|----------|----------------|
| **Full Carryover** | All context persists to next session | SME business operations | Copy entire context snapshot |
| **Selective Carryover** | Only high-priority context persists | F-Commerce customer history | Filter by priority tags |
| **Summarized Carryover** | Long context summarized for next session | Academic research sessions | LLM-generated summary |
| **Reference-Only** | Store references, re-fetch on demand | Research paper library | Store IDs, not full content |
| **No Carryover** | Fresh start each session | Sensitive financial queries | Explicit session isolation |

---

## 3. Garbage Collection Protocols

### 3.1 GC Triggers

| Trigger Type | Condition | Frequency | Scope |
|--------------|-----------|-----------|-------|
| **Scheduled** | Daily at 03:00 UTC | Daily | All expired context |
| **Threshold-Based** | Storage > 80% capacity | On-demand | Oldest 20% of expired |
| **Cost-Based** | Monthly cost exceeds budget | Monthly | Low-priority expired |
| **Event-Driven** | User deletion request | Immediate | User-specific |
| **Emergency** | System storage critical (>95%) | Immediate | Aggressive across all users |

### 3.2 GC Algorithm

```python
def run_garbage_collection(scope: GCScope, mode: GCMode) -> GCResult:
    """
    Execute garbage collection based on scope and mode.
    
    Args:
        scope: 'global', 'per_user', 'per_persona', 'per_storage_tier'
        mode: 'gentle', 'standard', 'aggressive', 'emergency'
    """
    
    # Phase 1: Identify expired candidates
    expired_candidates = query_expired_context(
        older_than_days=get_expiry_threshold(mode),
        priority_below=get_priority_threshold(mode),
        scope=scope,
    )
    
    # Phase 2: Apply retention holds
    protected_context = apply_legal_holds(expired_candidates)
    candidates_without_holds = expired_candidates - protected_context
    
    # Phase 3: Check for active dependencies
    candidates_with_deps = filter_active_dependencies(candidates_without_holds)
    final_candidates = candidates_without_holds - candidates_with_deps
    
    # Phase 4: Execute deletion based on mode
    if mode == 'gentle':
        # Only delete clearly expired, no dependencies
        deleted = soft_delete(final_candidates.filter(priority='low'))
    elif mode == 'standard':
        # Delete expired with standard checks
        deleted = soft_delete(final_candidates.filter(priority__lte='medium'))
    elif mode == 'aggressive':
        # Delete all expired except protected
        deleted = soft_delete(final_candidates)
    elif mode == 'emergency':
        # Emergency: delete even non-expired low-priority
        deleted = hard_delete(final_candidates + query_low_priority_active())
    
    # Phase 5: Log and notify
    log_gc_operation(deleted, scope, mode)
    notify_stakeholders_if_required(deleted, mode)
    
    return GCResult(
        deleted_count=len(deleted),
        freed_storage_bytes=calculate_freed_space(deleted),
        protected_count=len(protected_context),
        deferred_count=len(candidates_with_deps),
    )
```

### 3.3 GC Safety Checks

```typescript
interface GCSafetyChecks {
  // Pre-GC validations
  pre_checks: {
    require_backup_before_gc: true,
    verify_no_active_queries: true,
    check_legal_holds_applied: true,
    confirm_retention_periods_elapsed: true,
    validate_user_notifications_sent: true,
  };
  
  // During GC monitoring
  runtime_checks: {
    max_deletion_rate_per_second: 1000,
    pause_on_error_threshold: 5,
    rollback_on_critical_failure: true,
    alert_on_unusual_patterns: true,
  };
  
  // Post-GC verification
  post_checks: {
    verify_deletion_completeness: true,
    confirm_storage_freed_matches_expectations: true,
    audit_log_all_deletions: true,
    send_completion_report: true,
  };
  
  // Rollback conditions
  rollback_triggers: [
    'deletion_failure_rate > 5%',
    'storage_not_freed_as_expected',
    'active_context_accidentally_deleted',
    'legal_hold_violation_detected',
    'user_complaint_received',
  ];
}
```

---

## 4. Archival Strategies

### 4.1 Archive Tiers

| Tier | Storage Type | Cost/TB/Month | Access Latency | Use Case |
|------|--------------|---------------|----------------|----------|
| **Hot** | SSD (Primary DB) | ~$100 | <10ms | Active sessions, recent context |
| **Warm** | HDD (Secondary DB) | ~$30 | 100ms-1s | Recent history, frequent access |
| **Cold** | Object Storage (S3/GCS) | ~$5 | 1-10s | Archived projects, old sessions |
| **Deep Archive** | Glacier/Archive Storage | ~$1 | Minutes-Hours | Legal retention, compliance |

### 4.2 Archive Migration Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ HOT STORAGE │────▶│ WARM STORAGE│────▶│ COLD STORAGE│────▶│ DEEP ARCHIVE│
│ (Active)    │     │ (Recent)    │     │ (Archived)  │     │ (Compliance)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  0-7 days           7-30 days          30-365 days         1-7 years
  Real-time          Hourly batch       Daily batch         Monthly batch
  Instant access     <1s retrieval      <10s retrieval      Minutes retrieval
```

### 4.3 Archive Metadata Requirements

```typescript
interface ArchiveMetadata {
  // Identification
  archive_id: string;              // UUID
  original_context_id: string;     // Source context ID
  user_id: string;                 // Data owner
  persona: PersonaType;            // User persona at time of archival
  
  // Timing
  created_at: ISO8601;             // Original creation time
  archived_at: ISO8601;            // Archive migration time
  expires_at: ISO8601 | null;      // Scheduled deletion date
  last_accessed: ISO8601 | null;   // Last retrieval from archive
  
  // Content description
  context_type: ContextType;       // e.g., 'session_memory', 'research_notes'
  token_count: number;             // Size in tokens
  compression_ratio: number;       // Compressed vs original size
  encryption_key_id: string;       // Reference to KMS key
  
  // Compliance
  retention_policy_id: string;     // Applied retention policy
  legal_hold_status: boolean;      // Under legal hold?
  gdpr_category: GDPRCategory;     // GDPR classification
  export_package_id?: string;      // If exported, reference to package
  
  // Retrieval info
  retrieval_cost_estimate: number; // Cost to retrieve from archive
  retrieval_time_estimate_sec: number; // Expected retrieval latency
  access_count: number;            // Number of times retrieved
}
```

---

## 5. Regulatory Compliance Requirements

### 5.1 GDPR Compliance (EU Users)

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| **Right to Access** | Export all user context within 30 days | Automated export pipeline |
| **Right to Erasure** | Delete all user context within 30 days of request | Deletion confirmation audit |
| **Data Minimization** | Collect only necessary context, auto-expire rest | Regular audits of collected data |
| **Purpose Limitation** | Use context only for stated purposes | Purpose tagging, access controls |
| **Storage Limitation** | Enforce retention periods, auto-delete | Automated expiration enforcement |
| **Integrity & Confidentiality** | Encrypt context at rest and in transit | Encryption audits, penetration testing |

### 5.2 Bangladesh Data Protection Considerations

| Regulation | Requirement | Shothik Implementation |
|------------|-------------|----------------------|
| **Digital Security Act 2018** | Protect user data from unauthorized access | RLS policies, encryption, audit logs |
| **ICT Act 2006** | Maintain data integrity for e-commerce transactions | Transaction logging, immutable ledgers |
| **Consumer Rights Ordinance** | Retain transaction records for dispute resolution | 7-year retention for order/payment data |
| **Bangladesh Bank Guidelines** | Financial data protection for MFS transactions | PCI-DSS compliance, secure payment handling |

### 5.3 Data Residency Requirements

```typescript
interface DataResidencyRules {
  // Geographic storage requirements
  residency_by_user_location: {
    bangladesh: {
      primary_storage: 'hostinger_vps_dhaka',
      backup_storage: 'cloudflare_r2_singapore',
      restricted_transfers: ['no_china', 'no_north_korea'],
    },
    eu: {
      primary_storage: 'aws_frankfurt',
      backup_storage: 'gcp_belgium',
      restricted_transfers: ['no_us_without_privacy_shield'],
    },
    default: {
      primary_storage: 'cloudflare_r2_singapore',
      backup_storage: 'aws_mumbai',
      restricted_transfers: [],
    },
  };
  
  // Cross-border transfer rules
  cross_border_transfers: {
    require_user_consent: true,
    encrypt_in_transit: true,
    log_all_transfers: true,
    respect_sanctions_lists: true,
  };
}
```

---

## 6. Cost-Aware Eviction Strategies

### 6.1 Eviction Priority Algorithm

```python
def calculate_eviction_priority(context_chunk: ContextChunk) -> float:
    """
    Calculate eviction priority score (0-1, higher = more likely to evict).
    """
    
    # Recency factor (older = higher priority for eviction)
    age_days = (datetime.now() - context_chunk.last_accessed).days
    recency_score = min(age_days / 365, 1.0) * 0.25
    
    # Access frequency (less accessed = higher eviction priority)
    access_count_30d = context_chunk.access_count_last_30_days
    frequency_score = (1.0 - min(access_count_30d / 100, 1.0)) * 0.25
    
    # Priority level (low priority = higher eviction priority)
    priority_weights = {'critical': 0.0, 'high': 0.25, 'medium': 0.5, 'low': 1.0}
    priority_score = priority_weights[context_chunk.priority] * 0.25
    
    # Cost factor (expensive storage = higher eviction priority)
    storage_cost_per_mb = context_chunk.storage_tier_cost
    cost_score = min(storage_cost_per_mb / 100, 1.0) * 0.15
    
    # User value (free users = higher eviction priority than premium)
    user_tier_weights = {'free': 1.0, 'pro': 0.5, 'enterprise': 0.1}
    user_value_score = user_tier_weights[context_chunk.user_tier] * 0.10
    
    total_score = (
        recency_score + 
        frequency_score + 
        priority_score + 
        cost_score + 
        user_value_score
    )
    
    return min(total_score, 1.0)
```

### 6.2 Eviction Actions by Score

| Priority Score Range | Action | Timeline | Notification |
|---------------------|--------|----------|--------------|
| 0.0 - 0.2 | Keep in hot storage | N/A | None |
| 0.2 - 0.4 | Move to warm storage | Next maintenance window | None |
| 0.4 - 0.6 | Move to cold storage | Within 7 days | In-app notification |
| 0.6 - 0.8 | Archive to deep storage | Within 30 days | Email notification |
| 0.8 - 1.0 | Schedule for deletion | Within 90 days | Email + export reminder |

### 6.3 User Override Mechanisms

```typescript
interface UserOverrideOptions {
  // Manual preservation
  pin_context: {
    allowed_for_all_users: true,
    max_pinned_items_free_tier: 10,
    max_pinned_items_pro_tier: 100,
    max_pinned_items_enterprise: 'unlimited',
    pinned_items_exempt_from_eviction: true,
  };
  
  // Extended retention purchase
  buy_extended_retention: {
    available_packs: [
      { duration_days: 30, price_usd: 0.99 },
      { duration_days: 90, price_usd: 2.49 },
      { duration_days: 365, price_usd: 7.99 },
    ],
    applies_to_context_types: ['all'],
    refundable: false,
  };
  
  // Export before eviction
  auto_export_before_deletion: {
    enabled_by_default: true,
    export_formats: ['json', 'pdf', 'markdown'],
    delivery_method: 'email',
    retain_export_copy_days: 30,
  };
}
```

---

## 7. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Implement timestamp tracking for all context chunks
- [ ] Build expiration query engine
- [ ] Create legal hold system
- [ ] Set up daily GC cron job
- [ ] Add basic archival to cold storage

### Phase 2: Advanced Policies (Week 2)
- [ ] Deploy cost-aware eviction algorithm
- [ ] Implement persona-specific retention rules
- [ ] Build user override mechanisms (pin, extend)
- [ ] Add GDPR export/delete automation
- [ ] Create archive metadata system

### Phase 3: Compliance & Optimization (Week 3-4)
- [ ] Complete Bangladesh data residency implementation
- [ ] Add regulatory compliance reporting
- [ ] Optimize GC for minimal system impact
- [ ] Build user notifications for impending expiration
- [ ] Create admin dashboard for lifecycle monitoring

---

## 8. Related Documents

- `CONTEXT_ASSEMBLY_ARCHITECTURE.md` - Overall context pipeline design
- `PERSONA_CONTEXT_PROFILES.md` - Persona-specific context requirements
- `CONTEXT_SECURITY_AND_ISOLATION_BOUNDARIES.md` - Security requirements
- `CONTEXT_OBSERVABILITY_RUNBOOK.md` - Debugging and monitoring guide

---

## Appendix A: Retention Period Quick Reference

| Context Type | Free Tier | Pro Tier | Enterprise | Legal Max |
|--------------|-----------|----------|------------|-----------|
| Session Memory | 7 days | 30 days | 90 days | N/A |
| Chat History | 30 days | 90 days | 180 days | 2 years |
| Business Records | 2 years | 5 years | Indefinite | 7 years |
| Payment Data | 7 years | 7 years | 7 years | 7 years |
| Research Library | Indefinite | Indefinite | Indefinite | N/A |
| Content Drafts | 30 days | 90 days | 1 year | N/A |
| Analytics Data | 90 days | 1 year | 5 years | N/A |

---

## Appendix B: Example Lifecycle Trace

```json
{
  "context_id": "ctx_20250115_xyz789",
  "lifecycle_events": [
    {
      "event": "created",
      "timestamp": "2025-01-15T10:30:00Z",
      "storage_tier": "hot",
      "token_count": 15420,
      "initial_priority": "high"
    },
    {
      "event": "accessed",
      "timestamp": "2025-01-15T14:22:00Z",
      "access_type": "read",
      "user_id": "usr_abc123"
    },
    {
      "event": "migrated",
      "timestamp": "2025-01-22T03:00:00Z",
      "from_tier": "hot",
      "to_tier": "warm",
      "reason": "7_day_inactivity"
    },
    {
      "event": "priority_downgraded",
      "timestamp": "2025-02-15T03:00:00Z",
      "from_priority": "high",
      "to_priority": "medium",
      "reason": "30_day_inactivity"
    },
    {
      "event": "archived",
      "timestamp": "2025-03-15T03:00:00Z",
      "from_tier": "warm",
      "to_tier": "cold",
      "archive_id": "arch_20250315_def456",
      "reason": "60_day_inactivity"
    },
    {
      "event": "expiration_warning",
      "timestamp": "2025-04-15T03:00:00Z",
      "days_until_expiration": 60,
      "notification_sent": "email"
    },
    {
      "event": "expired",
      "timestamp": "2025-06-15T03:00:00Z",
      "reason": "180_day_inactivity",
      "retention_policy": "standard_user_context"
    },
    {
      "event": "deleted",
      "timestamp": "2025-06-15T03:15:00Z",
      "gc_run_id": "gc_20250615_001",
      "deletion_type": "soft_delete"
    }
  ]
}
```

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | Data Engineering Lead | | |
| Reviewer | Legal Counsel | | |
| Approver | VP of Engineering | | |
