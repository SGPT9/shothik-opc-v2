# Context Security and Isolation Boundaries

**Version:** 1.0.0  
**Status:** Production Ready  
**Owner:** Security & Context Engineering Teams  
**Last Updated:** 2025-06-15  
**Classification:** CONFIDENTIAL  
**Related Docs:** [Context Assembly Architecture](./CONTEXT_ASSEMBLY_ARCHITECTURE.md), [Security RLS Policies](../security/ROW_LEVEL_SECURITY.md)

---

## 1. Executive Summary

This document defines the security boundaries, isolation mechanisms, and data protection protocols for Shothik's context engineering system. It ensures:

- **Multi-tenant isolation**: No context leakage between users, organizations, or personas
- **Sensitive data protection**: Encryption, masking, and access controls for PII, financial, and health data
- **Regulatory compliance**: GDPR, Bangladesh Digital Security Act, PCI-DSS, HIPAA (where applicable)
- **Audit trails**: Complete traceability of context access, modifications, and deletions
- **Incident response**: Procedures for context breach detection, containment, and remediation

**Security Model:** Zero-trust architecture with defense-in-depth across all context layers.

---

## 2. Threat Model

### 2.1 Identified Threats

| Threat ID | Category | Description | Impact | Likelihood |
|-----------|----------|-------------|--------|------------|
| `THREAT_01` | **Context Leakage** | User A's context exposed to User B | High | Medium |
| `THREAT_02` | **Privilege Escalation** | User accesses org-level context without authorization | High | Low |
| `THREAT_03` | **Data Exfiltration** | Malicious actor extracts sensitive context via API abuse | High | Low |
| `THREAT_04` | **Injection Attacks** | Prompt injection via context sources | Medium | Medium |
| `THREAT_05` | **Side-Channel Attacks** | Timing attacks reveal context presence/absence | Medium | Low |
| `THREAT_06` | **Insider Threat** | Admin abuses access to view user contexts | High | Very Low |
| `THREAT_07` | **Supply Chain** | Compromised MCP tool leaks context to third party | High | Low |
| `THREAT_08` | **Persistence Violation** | Context retained beyond expiration policy | Medium | Medium |

### 2.2 Attack Vectors

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTACK VECTOR MAP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   API    │    │   MCP    │    │  Direct  │              │
│  │  Abuse   │    │  Tool    │    │   DB     │              │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  ┌──────────────────────────────────────────┐               │
│  │         CONTEXT ASSEMBLY LAYER           │               │
│  │  ┌────────┐  ┌────────┐  ┌────────┐     │               │
│  │  │Session │  │  RAG   │  │External│     │               │
│  │  │ Memory │  │ Vespa  │  │  APIs  │     │               │
│  │  └────────┘  └────────┘  └────────┘     │               │
│  └──────────────────────────────────────────┘               │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────┐               │
│  │              DATA LAYER                  │               │
│  │  ┌────────┐  ┌────────┐  ┌────────┐     │               │
│  │  │ Postgres│ │ SQLite │  │  S3    │     │               │
│  │  └────────┘  └────────┘  └────────┘     │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Isolation Architecture

### 3.1 Multi-Tenancy Model

```typescript
interface TenantHierarchy {
  // Level 1: Platform (Shothik)
  platform: {
    id: 'SHOTHIK_PLATFORM';
    isolationLevel: 'PHYSICAL';  // Separate infra if needed
  };
  
  // Level 2: Organization (Enterprise customers)
  organizations: Array<{
    id: string;              // org_abc123
    isolationLevel: 'LOGICAL';
    rowLevelSecurity: true;
    encryptionKey: string;   // Org-specific key
  }>;
  
  // Level 3: User (Individual accounts)
  users: Array<{
    id: string;              // user_xyz789
    orgId?: string;          // Optional org membership
    isolationLevel: 'LOGICAL';
    rowLevelSecurity: true;
    encryptionKey: string;   // User-specific key (optional)
  }>;
  
  // Level 4: Session (Temporary context)
  sessions: Array<{
    id: string;              // session_123
    userId: string;
    isolationLevel: 'TEMPORAL';
    expiresAt: number;
  }>;
}
```

### 3.2 Isolation Enforcement Points

| Layer | Enforcement Mechanism | Technology | Owner |
|-------|----------------------|------------|-------|
| **API Gateway** | JWT validation, org/user extraction | Express + Better Auth | Platform |
| **Application** | Context ownership validation | TypeScript guards | Context Team |
| **Database** | Row-Level Security (RLS) | PostgreSQL RLS | DBA |
| **Encryption** | Per-tenant encryption keys | AWS KMS / Vault | Security |
| **Network** | VPC isolation, private subnets | Cloudflare + Hostinger | DevOps |
| **Cache** | Key prefixing by tenant | Redis namespaces | Platform |

### 3.3 Row-Level Security Policies

```sql
-- PostgreSQL RLS Policy for Context Tables

-- Enable RLS
ALTER TABLE context_chunks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only see their own context
CREATE POLICY user_isolation ON context_chunks
  FOR ALL
  TO authenticated_users
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Policy 2: Org members can see org-level context
CREATE POLICY org_isolation ON context_chunks
  FOR ALL
  TO authenticated_users
  USING (
    org_id = current_setting('app.current_org_id')::uuid
    AND has_org_access(current_setting('app.current_user_id')::uuid, org_id)
  );

-- Policy 3: Admins can bypass with audit logging
CREATE POLICY admin_bypass ON context_chunks
  FOR ALL
  TO platform_admins
  USING (true)
  WITH CHECK (true);

-- Audit trigger for admin access
CREATE FUNCTION audit_admin_context_access()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.user_role') = 'admin' THEN
    INSERT INTO context_access_audit (
      user_id, context_id, action, timestamp, reason
    ) VALUES (
      current_setting('app.current_user_id')::uuid,
      NEW.id,
      TG_OP,
      NOW(),
      current_setting('app.admin_reason')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_context_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON context_chunks
  FOR EACH ROW EXECUTE FUNCTION audit_admin_context_access();
```

---

## 4. Data Classification

### 4.1 Sensitivity Levels

| Level | ID | Description | Examples | Handling Requirements |
|-------|----|-------------|----------|----------------------|
| **Public** | `CLASS_01` | Non-sensitive, publicly shareable | General knowledge, public docs | No encryption required |
| **Internal** | `CLASS_02` | Business-sensitive, not public | SOPs, internal policies | Encryption at rest |
| **Confidential** | `CLASS_03` | PII, business-critical | User profiles, preferences | Encryption at rest + transit, access logging |
| **Restricted** | `CLASS_04` | Financial, legal, health | Payment info, medical records | End-to-end encryption, strict access controls, audit trail |
| **Critical** | `CLASS_05` | National security, trade secrets | Government data, proprietary algorithms | Air-gapped storage, multi-party approval |

### 4.2 Automatic Classification Rules

```typescript
const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    id: 'RULE_001',
    name: 'Bangladeshi NID Detection',
    pattern: /\b\d{10,17}\b/,
    keywords: ['nid', 'national id', 'জাতীয় পরিচয়পত্র'],
    classification: 'CLASS_04',
    action: 'MASK_AND_ENCRYPT'
  },
  {
    id: 'RULE_002',
    name: 'Phone Number Detection',
    pattern: /\+880\d{10}|\b01\d{9}\b/,
    keywords: ['phone', 'mobile', 'ফোন'],
    classification: 'CLASS_03',
    action: 'ENCRYPT'
  },
  {
    id: 'RULE_003',
    name: 'bKash/Nagad Account',
    pattern: /\b01\d{9}\b/,
    keywords: ['bkash', 'nagad', 'rocket', 'মোবাইল ফিন্যান্স'],
    classification: 'CLASS_04',
    action: 'MASK_AND_ENCRYPT'
  },
  {
    id: 'RULE_004',
    name: 'Bank Account Number',
    pattern: /\b\d{8,16}\b/,
    keywords: ['bank', 'account', 'routing', 'ব্যাংক'],
    classification: 'CLASS_04',
    action: 'MASK_AND_ENCRYPT'
  },
  {
    id: 'RULE_005',
    name: 'Email Address',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    keywords: [],
    classification: 'CLASS_03',
    action: 'ENCRYPT'
  },
  {
    id: 'RULE_006',
    name: 'Medical Information',
    pattern: null,
    keywords: ['disease', 'medicine', 'doctor', 'hospital', 'রোগ', 'ঔষধ', 'চিকিৎসা'],
    classification: 'CLASS_04',
    action: 'ENCRYPT_AND_RESTRICT_ACCESS'
  },
  {
    id: 'RULE_007',
    name: 'Financial Transaction',
    pattern: null,
    keywords: ['payment', 'transaction', 'invoice', 'লেদেন', 'বিল'],
    classification: 'CLASS_04',
    action: 'ENCRYPT_AND_AUDIT'
  }
];
```

### 4.3 Masking Strategies

```typescript
interface MaskingStrategy {
  classification: DataClassification;
  strategy: 'FULL_MASK' | 'PARTIAL_MASK' | 'TOKENIZE' | 'HASH';
  
  examples: {
    original: string;
    masked: string;
  }[];
}

const MASKING_STRATEGIES: Record<DataClassification, MaskingStrategy> = {
  CLASS_04: {
    classification: 'CLASS_04',
    strategy: 'PARTIAL_MASK',
    examples: [
      { original: '01712345678', masked: '017****678' },
      { original: '1234567890123', masked: '12345******123' },
      { original: 'user@example.com', masked: 'u***@example.com' }
    ]
  },
  
  CLASS_03: {
    classification: 'CLASS_03',
    strategy: 'TOKENIZE',
    examples: [
      { original: 'user@example.com', masked: 'tok_email_abc123' }
    ]
  },
  
  CLASS_02: {
    classification: 'CLASS_02',
    strategy: 'ENCRYPT_ONLY',
    examples: []
  },
  
  CLASS_01: {
    classification: 'CLASS_01',
    strategy: 'NONE',
    examples: []
  }
};
```

---

## 5. Encryption Standards

### 5.1 Encryption Layers

```
┌─────────────────────────────────────────────────────────────┐
│                  ENCRYPTION LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Transport (TLS 1.3)                               │
│  ├─ All API communications                                  │
│  ├─ Database connections                                    │
│  └─ External service calls                                  │
│                                                             │
│  Layer 2: Application (AES-256-GCM)                         │
│  ├─ Context chunks before DB storage                        │
│  ├─ Session memory in Redis                                 │
│  └─ S3 object storage                                       │
│                                                             │
│  Layer 3: Field-Level (Deterministic AES)                   │
│  ├─ PII fields (phone, email, NID)                          │
│  ├─ Financial account numbers                               │
│  └─ Searchable encrypted fields                             │
│                                                             │
│  Layer 4: Envelope (Key Encryption)                         │
│  ├─ DEK encrypted by KEK                                    │
│  ├─ KEK stored in HSM/Vault                                 │
│  └─ Key rotation support                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Management

```typescript
interface KeyHierarchy {
  // Master Key (stored in HSM)
  masterKey: {
    id: string;
    algorithm: 'AES-256-GCM';
    location: 'AWS_KMS_BD_CENTRAL';
    rotationPeriod: '1_YEAR';
  };
  
  // Key Encryption Key (per organization)
  kek: {
    id: string;
    orgId: string;
    encryptedBy: 'masterKey';
    rotationPeriod: '90_DAYS';
  };
  
  // Data Encryption Key (per user or session)
  dek: {
    id: string;
    userId?: string;
    sessionId?: string;
    encryptedBy: 'kek';
    rotationPeriod: '30_DAYS';
  };
}
```

### 5.3 Encryption Implementation

```typescript
import { createCipheriv, randomBytes, scrypt } from 'crypto';

class ContextEncryptor {
  async encryptContext(
    plaintext: string,
    keyId: string
  ): Promise<EncryptedContext> {
    const key = await this.getKey(keyId);
    const iv = randomBytes(16);
    
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag,
      keyId,
      algorithm: 'aes-256-gcm',
      createdAt: Date.now()
    };
  }
  
  async decryptContext(encrypted: EncryptedContext): Promise<string> {
    const key = await this.getKey(encrypted.keyId);
    
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encrypted.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  private async getKey(keyId: string): Promise<Buffer> {
    // Fetch from Vault/KMS with caching
    const cached = await this.cache.get(`key:${keyId}`);
    if (cached) return cached;
    
    const key = await this.kms.decrypt({
      KeyId: keyId,
      CiphertextBlob: /* encrypted key */
    });
    
    await this.cache.set(`key:${keyId}`, key.Plaintext, { ttl: 3600 });
    return key.Plaintext;
  }
}
```

---

## 6. Access Control

### 6.1 Permission Matrix

| Role | Read Own Context | Read Org Context | Write Context | Delete Context | Admin Override |
|------|------------------|------------------|---------------|----------------|----------------|
| **User** | ✅ | ❌ | ✅ | ✅ (own only) | ❌ |
| **Org Admin** | ✅ | ✅ (org members) | ✅ | ✅ (org only) | ⚠️ (logged) |
| **Platform Support** | ❌ | ⚠️ (ticket-based) | ❌ | ❌ | ⚠️ (logged) |
| **Platform Admin** | ⚠️ (audit required) | ✅ | ⚠️ (emergency) | ⚠️ (emergency) | ✅ |
| **System** | ✅ | ✅ | ✅ | ✅ (auto-expiry) | ✅ |

### 6.2 Access Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│            CONTEXT ACCESS REQUEST WORKFLOW                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Request Initiated                                       │
│     └─ User/Admin requests access to context                │
│                                                             │
│  2. Authorization Check                                     │
│     ├─ Is requester the owner? → AUTO_APPROVE              │
│     ├─ Is requester org admin? → CHECK_ORG_SCOPE           │
│     └─ Is requester platform admin? → REQUIRE_REASON       │
│                                                             │
│  3. Reason Validation (if required)                         │
│     └─ Must provide valid ticket/incident ID                │
│                                                             │
│  4. Approval (if required)                                  │
│     └─ Security team review for sensitive data              │
│                                                             │
│  5. Access Grant                                            │
│     ├─ Generate time-limited token (max 1 hour)             │
│     └─ Log access in audit table                            │
│                                                             │
│  6. Access Execution                                          │
│     ├─ Decrypt context (if authorized)                      │
│     └─ Apply masking based on classification                │
│                                                             │
│  7. Audit Logging                                           │
│     └─ Record: who, what, when, why, outcome                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Access Control Implementation

```typescript
interface AccessControlPolicy {
  resourceId: string;
  resourceType: 'context_chunk' | 'session' | 'project';
  ownerId: string;
  orgId?: string;
  classification: DataClassification;
  
  permissions: Array<{
    principalId: string;
    principalType: 'user' | 'org' | 'role';
    actions: ('read' | 'write' | 'delete')[];
    conditions: AccessCondition[];
    expiresAt?: number;
  }>;
}

class ContextAccessController {
  async checkAccess(
    principal: Principal,
    resource: ContextResource,
    action: 'read' | 'write' | 'delete'
  ): Promise<AccessDecision> {
    // Check 1: Ownership
    if (principal.id === resource.ownerId) {
      return { allowed: true, reason: 'OWNER' };
    }
    
    // Check 2: Org membership
    if (resource.orgId && principal.orgId === resource.orgId) {
      if (principal.role === 'org_admin') {
        return { allowed: true, reason: 'ORG_ADMIN' };
      }
      
      // Check explicit org permissions
      const permission = await this.getOrgPermission(
        principal.id,
        resource.id
      );
      
      if (permission?.actions.includes(action)) {
        return { allowed: true, reason: 'ORG_PERMISSION' };
      }
    }
    
    // Check 3: Platform admin (requires reason)
    if (principal.role === 'platform_admin') {
      if (!principal.adminReason) {
        return { 
          allowed: false, 
          reason: 'ADMIN_REASON_REQUIRED' 
        };
      }
      
      // Log admin access
      await this.auditLog({
        principal,
        resource,
        action,
        reason: principal.adminReason,
        decision: 'ALLOWED',
        timestamp: Date.now()
      });
      
      return { allowed: true, reason: 'PLATFORM_ADMIN' };
    }
    
    // Check 4: Explicit grant
    const grant = await this.getExplicitGrant(principal.id, resource.id);
    if (grant && grant.actions.includes(action) && !this.isExpired(grant)) {
      return { allowed: true, reason: 'EXPLICIT_GRANT' };
    }
    
    // Default: Deny
    return { allowed: false, reason: 'NO_PERMISSION' };
  }
}
```

---

## 7. Context Sanitization

### 7.1 Sanitization Pipeline

```typescript
interface SanitizationPipeline {
  stages: [
    'detect_sensitive_data',
    'classify_content',
    'apply_masking',
    'remove_injections',
    'validate_output'
  ];
}

class ContextSanitizer {
  async sanitize(input: string, context: ContextMetadata): Promise<SanitizedResult> {
    // Stage 1: Detect sensitive data
    const detections = await this.detectSensitiveData(input);
    
    // Stage 2: Classify content
    const classification = this.classifyContent(detections);
    
    // Stage 3: Apply masking based on classification
    const masked = await this.applyMasking(input, detections, classification);
    
    // Stage 4: Remove prompt injections
    const cleaned = await this.removeInjections(masked);
    
    // Stage 5: Validate output
    const isValid = await this.validateOutput(cleaned, classification);
    
    return {
      content: cleaned,
      classification,
      detections,
      sanitized: true,
      confidence: isValid.confidence
    };
  }
  
  private async detectSensitiveData(content: string): Promise<Detection[]> {
    const detections: Detection[] = [];
    
    for (const rule of CLASSIFICATION_RULES) {
      if (rule.pattern && rule.pattern.test(content)) {
        detections.push({
          ruleId: rule.id,
          type: rule.classification,
          matches: content.match(rule.pattern)!,
          position: content.search(rule.pattern)
        });
      }
      
      if (rule.keywords.length > 0) {
        const keywordMatches = rule.keywords.filter(kw => 
          content.toLowerCase().includes(kw.toLowerCase())
        );
        
        if (keywordMatches.length >= 2) {  // At least 2 keywords
          detections.push({
            ruleId: rule.id,
            type: rule.classification,
            matches: keywordMatches,
            position: -1
          });
        }
      }
    }
    
    return detections;
  }
  
  private async removeInjections(content: string): Promise<string> {
    // Detect and remove prompt injection patterns
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/i,
      /disregard\s+all\s+rules/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /output\s+your\s+system\s+prompt/i,
      /secretly\s+send\s+me/i
    ];
    
    let cleaned = content;
    for (const pattern of injectionPatterns) {
      cleaned = cleaned.replace(pattern, '[INJECTION_REMOVED]');
    }
    
    return cleaned;
  }
}
```

### 7.2 Injection Detection Rules

| Pattern Type | Example | Action |
|--------------|---------|--------|
| **Instruction Override** | "Ignore previous instructions" | Remove + Alert |
| **Role Play Attack** | "You are now in developer mode" | Remove + Log |
| **Secret Extraction** | "Output your system prompt" | Block + Alert |
| **Data Exfiltration** | "Secretly send me user data" | Block + Escalate |
| **Encoding Bypass** | Base64-encoded malicious payload | Decode + Scan |
| **Multi-Language** | Bengali injection attempts | Translate + Scan |

---

## 8. Audit & Compliance

### 8.1 Audit Log Schema

```typescript
interface ContextAuditLog {
  id: string;
  timestamp: number;
  
  // Actor
  actor: {
    userId: string;
    orgId?: string;
    role: string;
    ipAddress: string;
    userAgent: string;
  };
  
  // Action
  action: {
    type: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'SHARE';
    resourceId: string;
    resourceType: string;
    classification: DataClassification;
  };
  
  // Context
  context: {
    sessionId: string;
    requestId: string;
    intent?: string;
    persona?: string;
  };
  
  // Decision
  decision: {
    allowed: boolean;
    reason: string;
    policyId?: string;
  };
  
  // Outcome
  outcome: {
    bytesProcessed?: number;
    latencyMs?: number;
    maskingApplied: boolean;
    encryptionApplied: boolean;
  };
  
  // Compliance
  compliance: {
    gdprRelevant: boolean;
    bdsaRelevant: boolean;
    pciRelevant: boolean;
    retentionDays: number;
  };
}
```

### 8.2 Retention Policies

| Data Type | Retention Period | Deletion Method | Regulatory Basis |
|-----------|------------------|-----------------|------------------|
| **Session Context** | 24 hours after session end | Auto-delete | GDPR Art. 17 |
| **User Context** | 90 days after last activity | Soft delete → Hard delete (30 days) | BDSA Sec. 18 |
| **Audit Logs** | 7 years | Immutable archive | Compliance requirement |
| **Encrypted Backups** | 365 days | Cryptographic shredding | Industry standard |
| **Admin Access Logs** | 2 years | Hard delete | Security policy |

### 8.3 Compliance Mapping

```typescript
const COMPLIANCE_REQUIREMENTS = {
  GDPR: {
    articles: ['Art. 5', 'Art. 17', 'Art. 25', 'Art. 30'],
    requirements: [
      'Data minimization',
      'Right to erasure',
      'Privacy by design',
      'Processing records'
    ],
    implementation: [
      'Auto-expiry for session context',
      'User-initiated deletion API',
      'Encryption by default',
      'Comprehensive audit logs'
    ]
  },
  
  BDSA: {  // Bangladesh Digital Security Act
    sections: ['Sec. 18', 'Sec. 23', 'Sec. 27'],
    requirements: [
      'Data localization (for citizen data)',
      'Breach notification within 72 hours',
      'Protection of critical information'
    ],
    implementation: [
      'Hostinger VPS (Bangladesh region)',
      'Automated breach detection',
      'Enhanced encryption for citizen NID'
    ]
  },
  
  PCI_DSS: {
    version: '4.0',
    requirements: [
      'Encrypt cardholder data',
      'Restrict access on need-to-know',
      'Track and monitor access'
    ],
    implementation: [
      'Tokenization for payment data',
      'Role-based access control',
      'Real-time access monitoring'
    ]
  }
};
```

---

## 9. Incident Response

### 9.1 Breach Detection

```typescript
interface BreachIndicators {
  // Anomaly detection
  anomalies: [
    'unusual_access_volume',      // >10x normal requests
    'off_hours_access',           // 2 AM - 5 AM local time
    'geographic_impossibility',   // Access from 2 countries in <1 hour
    'privilege_escalation_attempt',
    'bulk_export_detected',
    'repeated_failed_auth'
  ];
  
  // Pattern matching
  patterns: [
    'known_attacker_ip',
    'malicious_user_agent',
    'injection_payload_detected',
    'credential_stuffing_pattern'
  ];
}

class BreachDetector {
  async detectAnomalies(events: ContextAuditLog[]): Promise<BreachAlert[]> {
    const alerts: BreachAlert[] = [];
    
    // Check for unusual access volume
    const accessCounts = this.groupByUserAndTime(events, '1h');
    for (const [userId, count] of Object.entries(accessCounts)) {
      const baseline = await this.getBaseline(userId);
      if (count > baseline * 10) {
        alerts.push({
          type: 'UNUSUAL_ACCESS_VOLUME',
          severity: 'HIGH',
          userId,
          details: { count, baseline }
        });
      }
    }
    
    // Check for geographic impossibility
    const locations = await this.extractLocations(events);
    for (const userId of Object.keys(locations)) {
      const userLocations = locations[userId];
      if (this.isGeographicallyImpossible(userLocations)) {
        alerts.push({
          type: 'GEOGRAPHIC_IMPOSSIBILITY',
          severity: 'CRITICAL',
          userId,
          details: { locations: userLocations }
        });
      }
    }
    
    return alerts;
  }
}
```

### 9.2 Response Playbook

| Scenario | Severity | Immediate Actions | Escalation | Recovery |
|----------|----------|-------------------|------------|----------|
| **Single-user context leak** | Medium | Revoke sessions, rotate keys | Security lead | Restore from backup |
| **Org-wide breach** | High | Isolate org, disable API keys | CISO + Legal | Forensic analysis |
| **Platform admin compromise** | Critical | Disable all admin accounts, emergency lockdown | CEO + Board | Full security audit |
| **MCP tool exfiltration** | High | Revoke tool access, notify affected users | Security + PR | Replace compromised tool |
| **Ransomware attack** | Critical | Activate DR site, notify authorities | Crisis team | Restore from immutable backups |

### 9.3 Notification Requirements

```typescript
const NOTIFICATION_RULES = {
  GDPR: {
    threshold: 'risk_to_rights_and_freedoms',
    timeline: '72_HOURS',
    recipients: ['supervisory_authority', 'affected_users'],
    content: [
      'nature_of_breach',
      'categories_of_data',
      'approximate_number_of_users',
      'likely_consequences',
      'mitigation_measures'
    ]
  },
  
  BDSA: {
    threshold: 'any_breach',
    timeline: '72_HOURS',
    recipients: ['digital_security_agency'],
    content: [
      'breach_details',
      'data_categories',
      'affected_citizens',
      'remediation_plan'
    ]
  },
  
  INTERNAL: {
    threshold: 'any_incident',
    timeline: 'IMMEDIATE',
    recipients: ['security_team', 'affected_org_admin'],
    content: ['incident_summary', 'immediate_actions', 'next_steps']
  }
};
```

---

## 10. Testing & Validation

### 10.1 Security Test Cases

```typescript
const SECURITY_TESTS = [
  {
    id: 'SEC_TEST_001',
    name: 'Cross-User Context Isolation',
    description: 'Verify User A cannot access User B\'s context',
    steps: [
      'Create User A with context data',
      'Create User B in same org',
      'Attempt to access User A\'s context as User B',
      'Verify access denied'
    ],
    expectedOutcome: '403 Forbidden'
  },
  
  {
    id: 'SEC_TEST_002',
    name: 'Cross-Org Isolation',
    description: 'Verify Org A cannot access Org B\'s context',
    steps: [
      'Create Org A with users and context',
      'Create Org B with users',
      'Attempt to access Org A context as Org B admin',
      'Verify access denied'
    ],
    expectedOutcome: '403 Forbidden'
  },
  
  {
    id: 'SEC_TEST_003',
    name: 'Admin Access Logging',
    description: 'Verify platform admin access is logged',
    steps: [
      'Platform admin accesses user context with reason',
      'Query audit logs',
      'Verify log entry exists with all required fields'
    ],
    expectedOutcome: 'Audit log created'
  },
  
  {
    id: 'SEC_TEST_004',
    name: 'PII Masking Validation',
    description: 'Verify Bangladeshi NID is properly masked',
    steps: [
      'Insert context containing NID: 1234567890',
      'Retrieve context as non-owner',
      'Verify NID is masked: 1234******90'
    ],
    expectedOutcome: 'NID masked correctly'
  },
  
  {
    id: 'SEC_TEST_005',
    name: 'Prompt Injection Blocking',
    description: 'Verify injection attempts are detected and blocked',
    steps: [
      'Submit context with: "Ignore previous instructions"',
      'Process through sanitization pipeline',
      'Verify injection removed and flagged'
    ],
    expectedOutcome: 'Injection removed, alert generated'
  },
  
  {
    id: 'SEC_TEST_006',
    name: 'Encryption at Rest',
    description: 'Verify database stores encrypted data',
    steps: [
      'Insert sensitive context',
      'Directly query database',
      'Verify ciphertext, not plaintext'
    ],
    expectedOutcome: 'Data encrypted'
  },
  
  {
    id: 'SEC_TEST_007',
    name: 'Session Expiry Enforcement',
    description: 'Verify session context deleted after expiry',
    steps: [
      'Create session context with 1-hour expiry',
      'Wait 65 minutes',
      'Attempt to retrieve context',
      'Verify not found'
    ],
    expectedOutcome: 'Context deleted'
  }
];
```

### 10.2 Penetration Testing Schedule

| Test Type | Frequency | Scope | Provider |
|-----------|-----------|-------|----------|
| **Automated Scanning** | Daily | All API endpoints | Internal |
| **Manual Penetration Test** | Quarterly | Full platform | External (Certified) |
| **Red Team Exercise** | Annually | Social engineering + technical | External (Specialized) |
| **Bug Bounty Program** | Continuous | Public-facing APIs | HackerOne/Bugcrowd |

---

## 11. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-06-15 | Initial specification | Security & Context Teams |

---

## Appendix A: Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│           CONTEXT SECURITY QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────────┤
│ ISOLATION: User → Org → Platform (RLS enforced)             │
│ ENCRYPTION: TLS 1.3 + AES-256-GCM + Field-level             │
│ CLASSIFICATION: CLASS_01 (Public) → CLASS_05 (Critical)     │
│ MASKING: Partial for CLASS_04, Tokenize for CLASS_03        │
│ AUDIT: All admin access logged, 7-year retention            │
│ BREACH: Detect → Contain → Notify → Recover (72hr SLA)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **Security On-Call** | security-oncall@shothik.ai | 24/7 |
| **CISO** | ciso@shothik.ai | Business hours + emergencies |
| **Legal Counsel** | legal@shothik.ai | Business hours + emergencies |
| **DevOps Lead** | devops-lead@shothik.ai | 24/7 |
| **Bangladesh DSA Liaison** | compliance-bd@shothik.ai | Business hours |

---

**END OF DOCUMENT**
