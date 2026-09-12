# Persona Context Profiles

**Document ID:** `CTX-PERS-002`  
**Version:** 1.0.0  
**Status:** Draft  
**Owner:** Product Engineering + Platform Engineering  
**Last Updated:** 2025-01-XX  
**Classification:** Internal Engineering

---

## Executive Summary

This document defines persona-specific context requirements for Shothik AI's four primary user archetypes: F-Commerce Operator, Academic Researcher, Zero-Capital Creator, and SME Operator. Each persona has distinct context needs, token budgets, retrieval priorities, and retention policies optimized for their workflows.

### Persona Definitions

| Persona | Description | Primary Goals | Key Pain Points |
|---------|-------------|---------------|-----------------|
| **F-Commerce Operator** | Facebook/Instagram-based seller using WhatsApp for commerce | Quick responses, order management, payment verification | Inventory tracking, customer disputes, courier coordination |
| **Academic Researcher** | STEM researcher, student, or knowledge worker | Literature review, citation management, writing assistance | Information overload, citation accuracy, formatting requirements |
| **Zero-Capital Creator** | Content creator with minimal resources, reviewer, storyteller | Content ideation, audience growth, monetization strategies | Limited tools, platform algorithm changes, consistency |
| **SME Operator** | Established small-medium enterprise with formal operations | Business analytics, compliance, team coordination, scaling | Multi-channel management, regulatory compliance, cash flow |

---

## 1. F-Commerce Operator Context Profile

### 1.1 Default Context Composition

| Context Type | Source | Default Allocation | Priority | Refresh Rate |
|--------------|--------|-------------------|----------|--------------|
| **Session Memory** | SQLite | 32K tokens | Critical | Real-time |
| **Customer History** | PostgreSQL | 16K tokens | High | Per-session |
| **Product Catalog** | PostgreSQL | 24K tokens | High | Daily sync |
| **Order Ledger** | PostgreSQL | 16K tokens | Critical | Real-time |
| **Courier APIs** | MCP (Pathao/Steadfast) | 8K tokens | Medium | On-demand |
| **Payment Status** | MCP (bKash/Nagad) | 8K tokens | Critical | Real-time |
| **Negotiation Scripts** | Vespa | 12K tokens | Medium | Weekly update |
| **Policy Templates** | Vespa | 8K tokens | Low | Monthly update |

**Total Default Context:** 124K tokens (within 128K budget)

### 1.2 Context Priority by Intent

| Intent Type | Primary Context | Secondary Context | Excluded Context |
|-------------|-----------------|-------------------|------------------|
| `order_inquiry` | Order Ledger, Customer History | Product Catalog, Payment Status | Negotiation Scripts, Policy Templates |
| `price_negotiation` | Product Catalog, Negotiation Scripts | Customer History, Order Ledger | Courier APIs, Policy Templates |
| `payment_verification` | Payment Status, Order Ledger | Customer History | Product Catalog, Negotiation Scripts |
| `courier_dispatch` | Courier APIs, Order Ledger | Customer History, Product Catalog | Negotiation Scripts, Policy Templates |
| `customer_dispute` | Order Ledger, Customer History, Policy Templates | Payment Status, Negotiation Scripts | Courier APIs, Product Catalog |
| `inventory_check` | Product Catalog, Order Ledger | Courier APIs | Negotiation Scripts, Policy Templates |

### 1.3 Token Budget Allocation

```typescript
const F_COMMERCE_CONTEXT_BUDGET = {
  max_tokens: 131072, // 128K
  
  allocation: {
    system_prompt: 8192,      // 8K - F-commerce specific instructions
    retrieved_context: 65536, // 64K - Dynamic retrieval from all sources
    session_memory: 32768,    // 32K - Recent conversations, preferences
    user_message: 16384,      // 16K - User input buffer
    reserved: 8192            // 8K - Safety margin for generation
  },
  
  pressure_thresholds: {
    yellow: 0.60,   // Start soft compaction at 60%
    orange: 0.80,   // Aggressive compaction at 80%
    red: 0.90,      // Emergency truncation at 90%
    critical: 0.95  // Hard fail at 95%
  }
};
```

### 1.4 Retention Policies

| Context Type | Session Retention | Cross-Session Retention | Archive Trigger |
|--------------|-------------------|------------------------|-----------------|
| Session Memory | Full session | Last 7 days | After 30 days of inactivity |
| Customer History | Full session | Indefinite (per customer) | Never (business critical) |
| Product Catalog | Full session | Last updated version | When product discontinued |
| Order Ledger | Full session | Indefinite | After 7 years (legal requirement) |
| Payment Records | Full session | Indefinite | After 7 years (legal requirement) |
| Negotiation Logs | Current session only | Last 30 days | After 90 days |

### 1.5 Bengali/Banglish Optimization Rules

```python
F_COMMERCE_LANGUAGE_RULES = {
    # Common Banglish variations in F-commerce
    'romanization_variants': {
        'price': ['dam', 'daam', 'dham'],
        'order': ['order', 'ordar', 'ordr'],
        'delivery': ['delivery', 'delivari', 'dilivery'],
        'payment': ['payment', 'paiment', 'paymnt'],
        'discount': ['discount', 'diskaunt', 'diskount'],
    },
    
    # F-commerce specific terminology
    'domain_terms': [
        'inbox korben', 'comment korun', 'price inbox e',
        'dhaka delivery', 'outside dhaka', 'cash on delivery',
        'bkash number', 'nogod payment', 'pathao pathabo',
        'steadfast e dibo', 'tracking number', 'confirmation din'
    ],
    
    # Numeric patterns (prices, quantities)
    'numeric_patterns': [
        r'\d+\s*taka',      # "500 taka"
        r'tk\s*\d+',        # "tk 500"
        r'\d+[- ]pcs',      # "5-pcs", "5 pcs"
        r'\d+\%',           # "10%" discount
    ],
    
    # Currency normalization
    'currency_normalization': {
        'taka': 'BDT',
        'tk': 'BDT',
        'টাকা': 'BDT',
        '৳': 'BDT',
    }
}
```

---

## 2. Academic Researcher Context Profile

### 2.1 Default Context Composition

| Context Type | Source | Default Allocation | Priority | Refresh Rate |
|--------------|--------|-------------------|----------|--------------|
| **Session Memory** | SQLite | 32K tokens | Critical | Real-time |
| **Paper Library** | Vespa (PDF embeddings) | 64K tokens | High | On-demand |
| **Citation Database** | PostgreSQL | 32K tokens | High | Weekly sync |
| **Research Notes** | SQLite + Vespa | 24K tokens | Medium | Per-session |
| **Writing Templates** | Vespa | 16K tokens | Low | Monthly update |
| **Journal Guidelines** | Vespa | 16K tokens | Medium | Quarterly update |
| **Semantic Search Results** | Vespa | 48K tokens | High | On-demand |
| **Collaboration History** | PostgreSQL | 16K tokens | Low | Per-project |

**Total Default Context:** 248K tokens (requires 200K+ model window)

### 2.2 Context Priority by Intent

| Intent Type | Primary Context | Secondary Context | Excluded Context |
|-------------|-----------------|-------------------|------------------|
| `literature_review` | Paper Library, Semantic Search | Citation Database, Research Notes | Writing Templates, Journal Guidelines |
| `citation_check` | Citation Database, Paper Library | Research Notes | Collaboration History, Writing Templates |
| `writing_assistance` | Writing Templates, Journal Guidelines | Research Notes, Paper Library | Collaboration History |
| `methodology_query` | Paper Library, Research Notes | Citation Database | Writing Templates, Journal Guidelines |
| `formatting_help` | Journal Guidelines, Writing Templates | Research Notes | Paper Library, Citation Database |
| `collaboration_sync` | Collaboration History, Research Notes | Citation Database | Writing Templates, Journal Guidelines |

### 2.3 Token Budget Allocation

```typescript
const ACADEMIC_RESEARCHER_CONTEXT_BUDGET = {
  max_tokens: 204800, // 200K
  
  allocation: {
    system_prompt: 12288,     // 12K - Academic writing assistant persona
    retrieved_context: 131072, // 128K - Large paper library + search results
    session_memory: 32768,    // 32K - Research conversation history
    user_message: 20480,      // 20K - Complex research queries
    reserved: 8192            // 8K - Safety margin
  },
  
  pressure_thresholds: {
    yellow: 0.60,   // Start soft compaction at 60%
    orange: 0.75,   // Aggressive compaction at 75% (lower due to large context)
    red: 0.85,      // Emergency truncation at 85%
    critical: 0.95  // Hard fail at 95%
  }
};
```

### 2.4 Retention Policies

| Context Type | Session Retention | Cross-Session Retention | Archive Trigger |
|--------------|-------------------|------------------------|-----------------|
| Session Memory | Full session | Last 30 days | After 90 days of inactivity |
| Paper Library | Current session | Indefinite (user's library) | Never (user-owned data) |
| Citation Database | Full session | Indefinite | Sync with external DB |
| Research Notes | Full session | Indefinite (per project) | Project completion + 1 year |
| Writing Drafts | Full session | Indefinite | Publication or abandonment |
| Search History | Current session | Last 90 days | After 180 days |

### 2.5 Document Parsing & Chunking Strategy

```python
ACADEMIC_DOCUMENT_CHUNKING = {
    # Layout-aware parsing for PDFs
    'parsing_strategy': 'layout_aware',
    
    # Section-based chunking
    'chunk_boundaries': [
        'abstract',
        'introduction',
        'related_work',
        'methodology',
        'experiments',
        'results',
        'discussion',
        'conclusion',
        'references'
    ],
    
    # Chunk size by section type
    'chunk_sizes': {
        'abstract': 512,        # Keep abstracts whole
        'introduction': 1024,
        'related_work': 2048,   # Larger for literature context
        'methodology': 1536,
        'experiments': 2048,
        'results': 1536,
        'discussion': 2048,
        'conclusion': 1024,
        'references': 4096      # Batch references together
    },
    
    # Citation extraction
    'citation_handling': {
        'extract_inline_citations': True,
        'resolve_bibtex_references': True,
        'link_to_external_databases': ['CrossRef', 'PubMed', 'arXiv', 'Google Scholar'],
        'preserve_citation_context': 128  # Tokens around each citation
    },
    
    # Figure/table handling
    'multimodal_elements': {
        'extract_figure_captions': True,
        'ocr_tables': True,
        'embed_diagram_descriptions': True,
        'link_to_full_resolution': True
    }
}
```

---

## 3. Zero-Capital Creator Context Profile

### 3.1 Default Context Composition

| Context Type | Source | Default Allocation | Priority | Refresh Rate |
|--------------|--------|-------------------|----------|--------------|
| **Session Memory** | SQLite | 16K tokens | Critical | Real-time |
| **Content Ideas** | SQLite | 12K tokens | High | Per-session |
| **Platform Trends** | Vespa (web scraping) | 16K tokens | Medium | Daily update |
| **Audience Analytics** | MCP (YouTube/FB API) | 8K tokens | High | Hourly sync |
| **Monetization Guides** | Vespa | 12K tokens | Low | Weekly update |
| **Content Templates** | Vespa | 8K tokens | Medium | Monthly update |
| **Competitor Analysis** | Vespa | 8K tokens | Low | Weekly update |
| **Script Drafts** | SQLite | 8K tokens | High | Per-session |

**Total Default Context:** 88K tokens (within 64K budget, requires compaction)

### 3.2 Context Priority by Intent

| Intent Type | Primary Context | Secondary Context | Excluded Context |
|-------------|-----------------|-------------------|------------------|
| `content_ideation` | Content Ideas, Platform Trends | Audience Analytics, Competitor Analysis | Monetization Guides, Content Templates |
| `script_writing` | Script Drafts, Content Templates | Content Ideas, Platform Trends | Competitor Analysis, Monetization Guides |
| `audience_growth` | Audience Analytics, Platform Trends | Competitor Analysis | Script Drafts, Content Templates |
| `monetization_query` | Monetization Guides, Audience Analytics | Platform Trends | Script Drafts, Competitor Analysis |
| `trend_analysis` | Platform Trends, Competitor Analysis | Audience Analytics | Script Drafts, Content Templates |
| `performance_review` | Audience Analytics, Script Drafts | Platform Trends, Content Ideas | Competitor Analysis |

### 3.3 Token Budget Allocation

```typescript
const ZERO_CAPITAL_CREATOR_CONTEXT_BUDGET = {
  max_tokens: 65536, // 64K - Optimized for cost efficiency
  
  allocation: {
    system_prompt: 6144,      // 6K - Creator coach persona
    retrieved_context: 32768, // 32K - Tight budget, aggressive pruning
    session_memory: 16384,    // 16K - Recent creative sessions
    user_message: 8192,       // 8K - Creative briefs, feedback
    reserved: 2048            // 2K - Minimal safety margin
  },
  
  pressure_thresholds: {
    yellow: 0.50,   // Start compaction early (tight budget)
    orange: 0.70,   // Aggressive compaction at 70%
    red: 0.85,      // Emergency truncation at 85%
    critical: 0.92  // Hard fail at 92%
  }
};
```

### 3.4 Retention Policies

| Context Type | Session Retention | Cross-Session Retention | Archive Trigger |
|--------------|-------------------|------------------------|-----------------|
| Session Memory | Full session | Last 14 days | After 30 days of inactivity |
| Content Ideas | Current session | Last 90 days | After 180 days or when used |
| Script Drafts | Full session | Last 30 days | After publication or 60 days |
| Audience Analytics | Current session | Last 7 days | Rolling 30-day window |
| Platform Trends | Current session | Last 14 days | Rolling 30-day window |
| Performance Data | Current session | Last 90 days | Indefinite (for growth tracking) |

### 3.5 Cost-Aware Context Strategies

```python
ZERO_CAPITAL_COST_OPTIMIZATION = {
    # Aggressive context pruning to minimize token costs
    'pruning_strategies': {
        'drop_old_ideas_after_days': 30,
        'keep_only_top_n_trends': 10,
        'summarize_analytics_to_key_metrics': True,
        'discard_drafts_older_than_days': 14,
    },
    
    # Free-tier API prioritization
    'api_priority': {
        'free_apis_first': True,
        'cache_all_responses': True,
        'batch_requests_when_possible': True,
        'use_local_embedding_models': True,  # Avoid API embedding costs
    },
    
    # Content recycling detection
    'recycling_detection': {
        'detect_similar_ideas': True,
        'suggest_variations_instead_of_new': True,
        'track_content_lifecycle': True,
    },
    
    # Lightweight embedding models
    'embedding_config': {
        'model': 'all-MiniLM-L6-v2',  # Small, fast, local
        'dimension': 384,
        'quantized': True,
        'cache_embeddings': True,
    }
}
```

---

## 4. SME Operator Context Profile

### 4.1 Default Context Composition

| Context Type | Source | Default Allocation | Priority | Refresh Rate |
|--------------|--------|-------------------|----------|--------------|
| **Session Memory** | SQLite | 24K tokens | Critical | Real-time |
| **Business Entities** | PostgreSQL | 32K tokens | Critical | Real-time |
| **Financial Records** | PostgreSQL | 32K tokens | Critical | Daily sync |
| **Inventory Data** | PostgreSQL | 24K tokens | High | Hourly sync |
| **Team Directory** | PostgreSQL | 8K tokens | Medium | Weekly update |
| **Compliance Docs** | Vespa | 24K tokens | High | Monthly update |
| **Analytics Dashboards** | PostgreSQL + Vespa | 32K tokens | Medium | Real-time |
| **Vendor Contracts** | Vespa | 16K tokens | Medium | Per-contract |
| **Customer CRM** | PostgreSQL | 24K tokens | High | Real-time |

**Total Default Context:** 216K tokens (requires careful management)

### 4.2 Context Priority by Intent

| Intent Type | Primary Context | Secondary Context | Excluded Context |
|-------------|-----------------|-------------------|------------------|
| `financial_report` | Financial Records, Analytics Dashboards | Business Entities, Compliance Docs | Team Directory, Vendor Contracts |
| `inventory_management` | Inventory Data, Business Entities | Analytics Dashboards, Customer CRM | Compliance Docs, Team Directory |
| `compliance_check` | Compliance Docs, Financial Records | Business Entities, Vendor Contracts | Analytics Dashboards, Team Directory |
| `team_coordination` | Team Directory, Session Memory | Business Entities, Analytics Dashboards | Vendor Contracts, Compliance Docs |
| `vendor_management` | Vendor Contracts, Business Entities | Financial Records, Inventory Data | Team Directory, Customer CRM |
| `customer_analysis` | Customer CRM, Analytics Dashboards | Financial Records, Business Entities | Compliance Docs, Vendor Contracts |

### 4.3 Token Budget Allocation

```typescript
const SME_OPERATOR_CONTEXT_BUDGET = {
  max_tokens: 131072, // 128K
  
  allocation: {
    system_prompt: 10240,     // 10K - Business operations assistant persona
    retrieved_context: 65536, // 64K - Core business data
    session_memory: 24576,    // 24K - Multi-user session context
    user_message: 20480,      // 20K - Complex business queries
    reserved: 10240           // 10K - Larger safety margin for business-critical ops
  },
  
  pressure_thresholds: {
    yellow: 0.60,   // Start soft compaction at 60%
    orange: 0.80,   // Aggressive compaction at 80%
    red: 0.90,      // Emergency truncation at 90%
    critical: 0.95  // Hard fail at 95%
  }
};
```

### 4.4 Retention Policies

| Context Type | Session Retention | Cross-Session Retention | Archive Trigger |
|--------------|-------------------|------------------------|-----------------|
| Session Memory | Full session | Last 30 days | After 90 days of inactivity |
| Financial Records | Full session | Indefinite (7 years legal) | After 7 years |
| Inventory Data | Full session | Last 2 years | After 3 years |
| Customer CRM | Full session | Indefinite | Customer inactive 3+ years |
| Compliance Docs | Full session | Indefinite | Superseded by new version |
| Team Directory | Full session | Current employees + 3 years | After employee departure + 3 years |
| Analytics Data | Full session | Last 3 years | Rolling 5-year window |

### 4.5 Multi-User Context Isolation

```typescript
interface SMEContextIsolation {
  // Role-based context visibility
  role_permissions: {
    owner: 'full_access',
    manager: 'departmental_access',
    accountant: 'financial_access',
    sales: 'crm_inventory_access',
    support: 'crm_order_access',
    intern: 'restricted_access',
  };
  
  // Department-level context segmentation
  department_boundaries: {
    finance: ['financial_records', 'compliance_docs'],
    sales: ['customer_crm', 'inventory_data', 'analytics_dashboards'],
    operations: ['inventory_data', 'vendor_contracts', 'team_directory'],
    support: ['customer_crm', 'order_history'],
  };
  
  // Audit trail requirements
  audit_requirements: {
    log_all_context_access: true,
    retain_audit_logs_years: 7,
    alert_on_unusual_access_patterns: true,
    require_mfa_for_sensitive_context: true,
  };
}
```

---

## 5. Cross-Persona Context Sharing Rules

### 5.1 When Personas Overlap

| Scenario | Primary Persona | Secondary Persona | Context Merge Strategy |
|----------|-----------------|-------------------|----------------------|
| F-Commerce → SME growth | F-Commerce Operator | SME Operator | Gradual transition, keep commerce context, add business analytics |
| Creator → F-Commerce | Zero-Capital Creator | F-Commerce Operator | Add product/order context, retain content creation context |
| Researcher → Creator | Academic Researcher | Zero-Capital Creator | Shift to content-focused context, archive deep research |
| SME → Academic (upskilling) | SME Operator | Academic Researcher | Temporary research mode, maintain business context |

### 5.2 Persona Detection Confidence Thresholds

```typescript
const PERSONA_DETECTION_THRESHOLDS = {
  high_confidence: 0.85,  // Use persona-specific profile immediately
  medium_confidence: 0.60, // Use blended profile, ask clarifying questions
  low_confidence: 0.40,   // Use generic profile, explicit persona selection
  fallback: 'general_user', // When all else fails
};

const PERSONA_SIGNALS = {
  f_commerce: [
    'price inquiry', 'order status', 'delivery', 'bkash', 'pathao',
    'facebook page', 'instagram shop', 'whatsapp order'
  ],
  academic_researcher: [
    'paper', 'citation', 'literature review', 'methodology',
    'journal', 'thesis', 'research question', 'hypothesis'
  ],
  zero_capital_creator: [
    'content idea', 'youtube', 'tiktok', 'audience growth',
    'monetization', 'script', 'viral', 'algorithm'
  ],
  sme_operator: [
    'financial report', 'inventory', 'compliance', 'team management',
    'vendor', 'contract', 'analytics dashboard', 'cash flow'
  ],
};
```

---

## 6. Implementation Checklist

### Phase 1: Core Profiles (Week 1)
- [ ] Implement F-Commerce Operator context profile
- [ ] Implement Academic Researcher context profile
- [ ] Implement Zero-Capital Creator context profile
- [ ] Implement SME Operator context profile
- [ ] Add persona detection classifier

### Phase 2: Dynamic Allocation (Week 2)
- [ ] Build intent-to-context priority mapper
- [ ] Implement dynamic token budget adjustment
- [ ] Add Bengali/Banglish normalization per persona
- [ ] Create retention policy enforcement engine

### Phase 3: Advanced Features (Week 3-4)
- [ ] Implement cross-persona transition logic
- [ ] Add multi-user isolation for SME operators
- [ ] Build cost-optimization for zero-capital creators
- [ ] Deploy document parsing for academic researchers

---

## 7. Related Documents

- `CONTEXT_ASSEMBLY_ARCHITECTURE.md` - Overall context pipeline design
- `CONTEXT_LIFECYCLE_AND_EXPIRATION_POLICY.md` - Retention and expiration rules
- `INTENT_TO_CONTEXT_ROUTER_SPEC.md` - Intent classification to retrieval mapping
- `CONTEXT_SECURITY_AND_ISOLATION_BOUNDARIES.md` - Security requirements

---

## Appendix: Persona Signal Examples

### F-Commerce Operator Signals
```
"এইটার দাম কত?" (What's the price?)
"ঢাকায় ডেলিভারি কত দিন লাগে?" (How long for Dhaka delivery?)
"বিকাশ নাম্বার দেন" (Give me bKash number)
"অর্ডার কনফার্ম করতে চাই" (Want to confirm order)
```

### Academic Researcher Signals
```
"Find papers on transformer architectures from 2023"
"Check if this citation format is correct for Nature journal"
"Summarize the methodology section of this PDF"
"Help me write the literature review for my thesis"
```

### Zero-Capital Creator Signals
```
"Give me 10 viral video ideas for tech reviews"
"How do I grow my YouTube channel without ads?"
"Write a script for a 60-second TikTok about AI"
"What's trending on Facebook Reels this week?"
```

### SME Operator Signals
```
"Generate Q3 financial report with cash flow analysis"
"Check inventory levels for top 10 SKUs"
"Is our VAT compliance up to date?"
"Show me sales performance by team member"
```

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | Product Engineering Lead | | |
| Reviewer | Platform Engineering Lead | | |
| Approver | VP of Product | | |
