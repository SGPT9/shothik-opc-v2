# Multi-Modal Context Assembly Specification

**Document Type:** Technical Specification  
**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** September 2026  
**Author:** Shothik AI Architecture Team  
**Reviewers:** Core Engineering, Product, Research  

---

## Executive Summary

This specification defines how ShothikGPT assembles, prioritizes, and injects **multi-modal context** (text, images, voice, video, documents, structured data) into the agent execution pipeline. Unlike text-only RAG systems, Shothik must handle the complex reality of South Asian micro-entrepreneurs who communicate via WhatsApp voice notes, photographed receipts, handwritten ledgers, and mixed-language documents.

### Key Challenges Addressed
1. **Modality Heterogeneity**: Users submit contexts in 6+ formats simultaneously
2. **Bandwidth Constraints**: Must work on 2G/3G networks with large media files
3. **Cultural Specificity**: Bangla handwriting, local document formats, regional visual conventions
4. **Cost Sensitivity**: Minimize expensive multimodal API calls via smart local processing
5. **Temporal Dynamics**: Voice notes decay faster than documents; real-time context priority

### Design Principles
- **Progressive Enhancement**: Start with cheap local parsing, escalate to cloud APIs only when necessary
- **Modality-Aware Prioritization**: Different retention policies per modality
- **Fallback Chains**: Multiple extraction strategies per modality type
- **Unified Representation**: All modalities converted to token-efficient context vectors
- **Observability First**: Track which modality contributed to which decision

---

## 1. Modality Taxonomy & Characteristics

### 1.1 Supported Modalities

| Modality | Sub-types | Avg Size | Processing Cost | Latency Budget | Retention TTL |
|----------|-----------|----------|-----------------|----------------|---------------|
| **Text** | Chat messages, Documents, Notes | 1-50 KB | Low (< $0.001) | < 100ms | 30 days |
| **Image** | Photos, Screenshots, Scanned docs | 100 KB - 5 MB | Medium ($0.01-0.10) | < 2s | 7 days |
| **Voice** | WhatsApp voice notes, Audio memos | 50 KB - 2 MB | Medium-High ($0.02-0.15) | < 3s | 3 days |
| **Video** | Product demos, Tutorial clips | 5-50 MB | High ($0.10-0.50) | < 10s | 24 hours |
| **Document** | PDFs, Word, Excel (structured) | 100 KB - 10 MB | Low-Medium ($0.005-0.05) | < 1s | 90 days |
| **Structured** | JSON, CSV, Database rows | 1-100 KB | Negligible | < 50ms | Session-based |

### 1.2 Modality-Specific Metadata

Every context chunk must include:

```typescript
interface ModalityMetadata {
  // Core identification
  modalityType: 'text' | 'image' | 'voice' | 'video' | 'document' | 'structured';
  modalitySubtype: string; // e.g., 'whatsapp_voice_note', 'handwritten_receipt'
  
  // Processing chain
  extractionMethod: 'local_liteparse' | 'cloud_vision' | 'whisper_local' | 'whisper_api' | 'manual_entry';
  processingCost: number; // BDT equivalent
  processingLatencyMs: number;
  confidenceScore: number; // 0.0 - 1.0
  
  // Content characteristics
  languageDetected: 'bn' | 'en' | 'bn-en-mixed' | 'unknown';
  containsText: boolean;
  containsNumbers: boolean;
  containsHandwriting: boolean;
  isLowQuality: boolean; // For bandwidth-adaptive processing
  
  // Temporal & spatial
  captureTimestamp?: number;
  expiryTimestamp: number;
  geoLocation?: { lat: number; lng: number; accuracyMeters: number };
  
  // Source attribution
  sourceApp?: 'whatsapp' | 'facebook' | 'camera' | 'microphone' | 'file_upload';
  deviceId?: string;
  userId: string;
  
  // Security & compliance
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'pii' | 'financial';
  encryptionRequired: boolean;
  retentionClass: 'ephemeral' | 'short' | 'medium' | 'long' | 'permanent';
}
```

---

## 2. Multi-Modal Context Assembly Pipeline

### 2.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-MODAL INGESTION LAYER                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Text    │    │  Image   │    │  Voice   │    │  Video   │  │
│  │ Ingest   │    │ Ingest   │    │ Ingest   │    │ Ingest   │  │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  │
│       │               │               │               │         │
│       ▼               ▼               ▼               ▼         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MODALITY CLASSIFIER & ROUTER                 │  │
│  │  • Detect modality type                                  │  │
│  │  • Assess quality/bandwidth                              │  │
│  │  • Route to appropriate extraction pipeline              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Local      │  │   Hybrid     │  │   Cloud      │          │
│  │   Extractor  │  │   Extractor  │  │   Extractor  │          │
│  │  (LiteParse) │  │  (Local+API) │  │  (Full API)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UNIFIED REPRESENTATION LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           CONTEXT NORMALIZATION & TOKENIZATION             │  │
│  │  • Convert all modalities to token sequences              │  │
│  │  • Preserve modality metadata                             │  │
│  │  • Apply persona-specific compression                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CROSS-MODALITY FUSION ENGINE                  │  │
│  │  • Resolve conflicts between modalities                   │  │
│  │  • Merge complementary information                        │  │
│  │  • Create unified context graph                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRIORITIZATION & INJECTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         INTENT-AWARE CONTEXT PRIORITIZATION                │  │
│  │  • Rank by relevance to detected intent                   │  │
│  │  • Apply modality-specific decay factors                  │  │
│  │  • Enforce token budget constraints                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            CONTEXT INJECTION STRATEGY                      │  │
│  │  • Determine injection position (system/user/tool)        │  │
│  │  • Format for target model                                │  │
│  │  • Inject with provenance tracking                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Extraction Pipelines by Modality

#### 2.2.1 Text Extraction Pipeline

**Priority:** Highest (baseline for all other modalities)  
**Processing Strategy:** Always local, near-zero cost

```typescript
interface TextExtractionConfig {
  preprocessing: {
    normalizeWhitespace: true;
    removeZeroWidthChars: true;
    detectLanguage: 'auto';
    convertBanglishToBangla: boolean; // Configurable per user preference
  };
  
  enrichment: {
    extractEntities: true;
    extractDates: true;
    extractNumbers: true;
    extractUrls: true;
    extractMentions: true;
  };
  
  compression: {
    removeStopwords: false; // Keep for context coherence
    summarizeIfLongerThan: 2000; // tokens
    maxTokens: 1000;
  };
}
```

**Special Handling for Bangla/Banglish:**
- Unicode normalization (NFC)
- Character set detection (Bangla vs English vs Mixed)
- Transliteration normalization (multiple Banglish spellings → canonical form)
- Dialect-aware tokenization

#### 2.2.2 Image Extraction Pipeline

**Priority:** High (frequently used for receipts, products, documents)  
**Processing Strategy:** Progressive enhancement

```typescript
enum ImageExtractionStrategy {
  LOCAL_OCR_ONLY = 'local_ocr_only',           // Fastest, cheapest
  LOCAL_OCR_PLUS_CLOUD = 'local_plus_cloud',   // Balanced
  CLOUD_VISION_FULL = 'cloud_vision_full',     // Most accurate
  MANUAL_REVIEW = 'manual_review'              // Fallback
}

interface ImageExtractionConfig {
  // Quality assessment
  minResolution: { width: 640; height: 480 };
  maxFileSizeMB: 5;
  acceptBlurryImages: false;
  
  // Extraction pipeline
  defaultStrategy: ImageExtractionStrategy.LOCAL_OCR_PLUS_CLOUD;
  
  localOcr: {
    engine: 'tesseract' | 'paddleocr';
    languages: ['ben', 'eng'];
    preserveLayout: true;
    extractTables: true;
  };
  
  cloudVision: {
    provider: 'google_vision' | 'azure_cv' | 'aws_rekognition';
    features: [
      'TEXT_DETECTION',
      'DOCUMENT_TEXT_DETECTION',
      'LABEL_DETECTION',
      'LANDMARK_DETECTION',
      'LOGO_DETECTION'
    ];
    fallbackToLocalOnError: true;
  };
  
  // Post-processing
  mergeLocalAndCloudResults: true;
  confidenceThreshold: 0.7;
  lowConfidenceAction: 'flag_for_review' | 'use_best_effort';
}
```

**South Asia-Specific Optimizations:**
- Handwritten Bangla numeral recognition
- Receipt format templates for common BD retailers
- Currency symbol detection (৳, Tk, BDT)
- Phone number format normalization (+880 vs 01XXX)

**Example: Receipt Processing Flow**
```
User uploads photo of bKash transaction receipt
         ↓
[Step 1] Quality check: Resolution OK? Not too blurry?
         ↓
[Step 2] Local OCR (PaddleOCR): Extract visible text
         ↓
[Step 3] Pattern matching: Detect TrxID, Amount, Date, Merchant
         ↓
[Step 4] Confidence check: All fields > 0.8 confidence?
         ├─ YES → Proceed to verification
         └─ NO  → Escalate to Cloud Vision API
                  ↓
             Re-extract with Google Vision
                  ↓
             Merge results (prefer higher confidence)
                  ↓
             Still low confidence? → Flag for manual review
         ↓
[Step 5] Structure extraction: Convert to JSON
         ↓
[Step 6] Verification: Cross-check with bKash webhook data
         ↓
[Step 7] Store in context with metadata
```

#### 2.2.3 Voice Extraction Pipeline

**Priority:** High (critical for WhatsApp-first users)  
**Processing Strategy:** Local-first with cloud fallback

```typescript
interface VoiceExtractionConfig {
  // Input constraints
  supportedFormats: ['ogg', 'mp3', 'wav', 'm4a', 'opus'];
  maxDurationSeconds: 300; // 5 minutes
  maxFileSizeMB: 2;
  
  // Primary extraction (local Whisper)
  localWhisper: {
    enabled: true;
    modelSize: 'tiny' | 'base' | 'small' | 'medium'; // Trade-off: speed vs accuracy
    computeBudget: {
      maxCpuThreads: 4;
      allowGpuAcceleration: false; // Most mobile devices lack GPU
      timeoutSeconds: 30;
    };
    languages: ['bn', 'en'];
    task: 'transcribe' | 'translate'; // Translate Bangla to English if needed
  };
  
  // Fallback extraction (cloud API)
  cloudWhisper: {
    enabled: true;
    provider: 'openai_whisper' | 'azure_speech' | 'google_speech';
    model: 'whisper-1';
    fallbackTrigger: {
      localFailure: true;
      lowConfidence: 0.6;
      longDuration: 120; // seconds
    };
  };
  
  // Post-processing
  diarization: {
    enabled: false; // Expensive, only for multi-speaker scenarios
    maxSpeakers: 2;
  };
  
  punctuationRestoration: true;
  profanityFilter: false; // Respect user expression
  timestampAlignment: true; // For referencing specific moments
  
  // Special handling
  banglaDialectNormalization: true;
  codeSwitchingDetection: true; // Bangla ↔ English mid-sentence
  fillerWordRemoval: false; // Preserve natural speech patterns
}
```

**WhatsApp Voice Note Optimization:**
```typescript
// WhatsApp uses OGG Opus format, typically 16kHz sample rate
const whatsappVoiceNoteConfig = {
  format: 'ogg',
  codec: 'opus',
  sampleRate: 16000,
  channels: 1,
  bitrate: 'variable',
  
  // Preprocessing for WhatsApp-specific artifacts
  preprocessing: {
    removeSilenceAtStart: true,
    removeSilenceAtEnd: true,
    normalizeVolume: true,
    reduceBackgroundNoise: 'light', // Avoid over-processing
  },
};
```

**Example: Voice Note Processing Flow**
```
User sends 45-second WhatsApp voice note in Banglish
         ↓
[Step 1] Format validation: OGG Opus, check duration < 5min
         ↓
[Step 2] Preprocessing: Remove silence, normalize volume
         ↓
[Step 3] Local Whisper (base model): Transcribe
         ↓
[Step 4] Language detection: Mixed Bangla-English detected
         ↓
[Step 5] Confidence scoring: 0.72 average (above threshold 0.6)
         ↓
[Step 6] Punctuation restoration & formatting
         ↓
[Step 7] Entity extraction: Numbers, dates, names, amounts
         ↓
[Step 8] Intent classification from transcription
         ↓
[Step 9] Store transcription + audio file reference in context
```

#### 2.2.4 Video Extraction Pipeline

**Priority:** Medium (less common, high processing cost)  
**Processing Strategy:** Extract key frames + audio, avoid full video processing

```typescript
interface VideoExtractionConfig {
  // Input constraints
  supportedFormats: ['mp4', 'mov', 'avi', 'webm'];
  maxDurationSeconds: 180; // 3 minutes
  maxFileSizeMB: 50;
  
  // Frame extraction strategy
  frameExtraction: {
    method: 'keyframe_sampling' | 'uniform_sampling' | 'scene_detection';
    framesPerSecond: 0.5; // 1 frame every 2 seconds
    maxTotalFrames: 20;
    resolution: { width: 640; height: 480 }; // Downscale for OCR
  };
  
  // Audio extraction
  audioExtraction: {
    extractAudio: true;
    audioFormat: 'wav';
    sampleRate: 16000;
    applyVoiceExtractionPipeline: true; // Reuse voice pipeline
  };
  
  // Processing pipeline
  processing: {
    processFramesAsImages: true;
    processAudioAsVoice: true;
    combineResults: true;
    
    // Optional: Video understanding API (expensive)
    useVideoUnderstandingApi: {
      enabled: false; // Disabled by default for cost control
      provider: 'google_video_ai' | 'aws_video';
      features: ['label_detection', 'object_tracking'];
      triggerCondition: 'user_explicit_request' | 'low_confidence_multimodal';
    };
  };
  
  // Output format
  outputFormat: {
    includeFrameTimestamps: true;
    includeAudioTranscript: true;
    createSummary: true;
    maxSummaryTokens: 200;
  };
}
```

**Cost Optimization Strategy:**
```typescript
// Decision tree for video processing
function selectVideoProcessingStrategy(video: VideoFile): VideoStrategy {
  if (video.duration < 15 && video.fileSize < 5_000_000) {
    // Short video: Process all frames + audio
    return 'full_extraction';
  }
  
  if (video.containsAudio && !video.hasVisualText) {
    // Audio-heavy: Just extract and transcribe audio
    return 'audio_only';
  }
  
  if (video.isProductDemo || video.hasOnScreenText) {
    // Visual-heavy: Extract keyframes, skip audio
    return 'visual_only';
  }
  
  // Default: Sampled frames + audio
  return 'balanced_extraction';
}
```

#### 2.2.5 Document Extraction Pipeline

**Priority:** High (critical for academic and business users)  
**Processing Strategy:** LiteParse for layout-aware parsing

```typescript
interface DocumentExtractionConfig {
  // Supported formats
  supportedFormats: {
    pdf: { enabled: true; priority: 'high' };
    docx: { enabled: true; priority: 'high' };
    xlsx: { enabled: true; priority: 'medium' };
    pptx: { enabled: true; priority: 'low' };
    txt: { enabled: true; priority: 'low' };
  };
  
  // LiteParse configuration
  liteParse: {
    enabled: true;
    preserveLayout: true;
    extractBoundingBoxes: true;
    detectColumns: true;
    detectTables: true;
    detectHeaders: true;
    
    // OCR for scanned PDFs
    ocrForScannedPdf: {
      enabled: true;
      engine: 'paddleocr';
      languages: ['ben', 'eng'];
    };
  };
  
  // Format-specific handlers
  pdfHandler: {
    extractText: true;
    extractImages: true;
    extractMetadata: true;
    extractBookmarks: true;
    extractAnnotations: true;
  };
  
  excelHandler: {
    extractAllSheets: false; // Only active sheet by default
    detectFormulas: true;
    convertFormulasToValues: true;
    preserveFormatting: false;
    maxRows: 1000; // Limit for context size
    maxColumns: 50;
  };
  
  wordHandler: {
    extractText: true;
    extractImages: true;
    extractTables: true;
    extractComments: false; // Skip comments by default
    extractTrackChanges: false;
  };
  
  // Post-processing
  chunking: {
    strategy: 'semantic' | 'fixed_size' | 'recursive';
    chunkSize: 500; // tokens
    chunkOverlap: 50; // tokens
  };
}
```

**Academic Paper Special Handling:**
```typescript
const academicPaperConfig = {
  // Multi-column layout detection
  detectMultiColumn: true,
  readingOrder: 'column_by_column', // Critical for STEM papers
  
  // Equation handling
  extractEquations: {
    enabled: true,
    format: 'latex', // Preserve LaTeX notation
    inlineWithText: true,
  },
  
  // Citation extraction
  extractCitations: {
    enabled: true,
    format: 'bibtex',
    linkToReferences: true,
  },
  
  // Figure and table captions
  extractCaptions: {
    enabled: true,
    associateWithContent: true,
  },
  
  // Section hierarchy
  detectSections: {
    enabled: true,
    levels: 3, // Abstract → Section → Subsection
  },
};
```

#### 2.2.6 Structured Data Extraction Pipeline

**Priority:** Medium (API responses, database exports)  
**Processing Strategy:** Direct parsing, minimal transformation

```typescript
interface StructuredDataConfig {
  supportedFormats: ['json', 'csv', 'xml', 'yaml'];
  
  jsonHandler: {
    flattenNestedObjects: true;
    maxDepth: 3;
    arrayHandling: 'concatenate' | 'sample' | 'summarize';
    maxArrayItems: 20;
  };
  
  csvHandler: {
    detectDelimiter: true;
    headerRow: 0;
    maxRows: 500;
    parseNumbers: true;
    parseDates: true;
  };
  
  // Schema inference
  inferSchema: {
    enabled: true;
    detectPrimaryKey: true;
    detectRelationships: true;
  };
  
  // Natural language interface
  nlQuery: {
    enabled: true; // Allow "show me top 5 customers" → SQL/JSON query
    maxComplexity: 'medium';
  };
}
```

---

## 3. Cross-Modality Fusion Engine

### 3.1 Fusion Strategies

When multiple modalities provide overlapping or complementary information:

#### Strategy A: Complementary Fusion
**Use Case:** Different modalities provide unique information  
**Example:** Voice note describes product features + Image shows product appearance

```typescript
interface ComplementaryFusionResult {
  combinedContext: ContextChunk[];
  modalityContributions: {
    text: string[];
    image: string[];
    voice: string[];
  };
  confidenceScore: number;
  gaps: string[]; // Information still missing
}
```

#### Strategy B: Redundant Fusion
**Use Case:** Same information across modalities (verification)  
**Example:** Voice note states amount + Receipt image shows same amount

```typescript
interface RedundantFusionResult {
  consensusValue: any;
  modalityAgreement: {
    text: value;
    voice: value;
    image: value;
  };
  agreementScore: number; // 0.0 - 1.0
  discrepancies: Array<{
    modality: string;
    expectedValue: any;
    actualValue: any;
    severity: 'minor' | 'major' | 'critical';
  }>;
}
```

#### Strategy C: Conflict Resolution
**Use Case:** Modalities contradict each other  
**Example:** Voice says "৳500" but receipt shows "৳5000"

```typescript
interface ConflictResolutionResult {
  resolvedValue: any;
  resolutionStrategy: 'trust_highest_confidence' | 'trust_text' | 'flag_for_human';
  confidenceInResolution: number;
  requiresHumanReview: boolean;
  auditTrail: {
    originalValues: Record<string, any>;
    confidenceScores: Record<string, number>;
    reasoning: string;
  };
}
```

### 3.2 Fusion Algorithm

```typescript
async function fuseMultiModalContext(
  chunks: ContextChunk[],
  intent: DetectedIntent,
  persona: PersonaType
): Promise<FusedContext> {
  
  // Step 1: Group by semantic similarity
  const groups = await clusterBySemanticSimilarity(chunks);
  
  // Step 2: Analyze each group for fusion strategy
  const fusedGroups = await Promise.all(
    groups.map(async (group) => {
      const modalities = new Set(group.map(c => c.modality));
      
      if (modalities.size === 1) {
        // Single modality: No fusion needed
        return { strategy: 'single_modality', chunks: group };
      }
      
      // Check for redundancy
      const redundancyScore = await calculateRedundancy(group);
      
      if (redundancyScore > 0.8) {
        // Highly redundant: Use redundant fusion
        return { 
          strategy: 'redundant', 
          result: await applyRedundantFusion(group) 
        };
      }
      
      // Check for conflict
      const conflictScore = await calculateConflict(group);
      
      if (conflictScore > 0.6) {
        // Conflicting: Use conflict resolution
        return { 
          strategy: 'conflict', 
          result: await resolveConflict(group, persona) 
        };
      }
      
      // Default: Complementary fusion
      return { 
        strategy: 'complementary', 
        result: await applyComplementaryFusion(group, intent) 
      };
    })
  );
  
  // Step 3: Assemble final context
  return assembleFusedContext(fusedGroups, persona.tokenBudget);
}
```

---

## 4. Modality-Aware Prioritization

### 4.1 Priority Scoring Model

Each context chunk receives a priority score:

```typescript
interface ContextPriorityScore {
  // Base scores
  recencyScore: number;        // 0.0 - 1.0 (newer = higher)
  relevanceScore: number;      // 0.0 - 1.0 (intent match)
  modalityScore: number;       // 0.0 - 1.0 (persona-dependent)
  qualityScore: number;        // 0.0 - 1.0 (extraction confidence)
  
  // Modality-specific decay
  decayFactor: number;         // Applied based on modality TTL
  halfLifeHours: number;       // Varies by modality
  
  // Persona boost
  personaBoost: number;        // Extra weight for persona-relevant modalities
  
  // Final calculation
  totalScore: number;
  rank: number;
}
```

### 4.2 Decay Factors by Modality

| Modality | Half-Life | Rationale |
|----------|-----------|-----------|
| Voice (chat) | 2 hours | Ephemeral, conversational |
| Text (chat) | 6 hours | Conversational but searchable |
| Image (receipt) | 24 hours | Transaction proof, short-term need |
| Image (product) | 7 days | Catalog reference |
| Document (contract) | 90 days | Legal retention |
| Document (thesis) | 365 days | Long-term project |
| Structured (ledger) | Permanent | Financial record |

### 4.3 Persona-Specific Modality Weights

```typescript
const personaModalityWeights: Record<PersonaType, ModalityWeights> = {
  'f_commerce_operator': {
    voice: 0.35,      // Heavy WhatsApp voice note usage
    image: 0.30,      // Receipts, product photos
    text: 0.20,       // Chat messages
    document: 0.10,   // Invoices, ledgers
    video: 0.03,      // Rare product demos
    structured: 0.02, // Order data
  },
  
  'academic_researcher': {
    document: 0.50,   // Papers, thesis chapters
    text: 0.25,       // Notes, citations
    image: 0.15,      // Figures, diagrams
    structured: 0.07, // Data tables
    voice: 0.02,      // Rare voice memos
    video: 0.01,      // Very rare
  },
  
  'zero_capital_creator': {
    image: 0.35,      // Content visuals
    video: 0.30,      // Short-form content
    text: 0.20,       // Captions, scripts
    voice: 0.10,      // Voiceovers
    document: 0.03,   // Briefs
    structured: 0.02, // Analytics
  },
  
  'sme_operator': {
    document: 0.35,   // Compliance, contracts
    structured: 0.25, // Financial data
    text: 0.20,       // Reports, emails
    image: 0.10,      // Receipts, invoices
    voice: 0.07,      // Meeting notes
    video: 0.03,      // Training materials
  },
};
```

---

## 5. Token Budget Management

### 5.1 Budget Allocation Strategy

```typescript
interface TokenBudgetAllocation {
  totalBudget: number;         // Model context window (e.g., 128K)
  reservedForSystem: number;   // System prompts, instructions
  reservedForResponse: number; // Space for model output
  availableForContext: number; // Remaining for retrieved context
  
  // Dynamic allocation by modality
  allocation: {
    text: number;
    image: number;
    voice: number;
    video: number;
    document: number;
    structured: number;
  };
  
  // Overflow handling
  overflowStrategy: 'truncate_lowest_priority' | 'summarize' | 'drop_modality';
}
```

### 5.2 Compression Techniques

When context exceeds budget:

#### Technique 1: Modality Dropping
```typescript
function dropLowestPriorityModality(
  chunks: ContextChunk[],
  budget: number
): ContextChunk[] {
  const sortedByPriority = chunks.sort((a, b) => b.priority - a.priority);
  
  let runningTotal = 0;
  const selected: ContextChunk[] = [];
  
  for (const chunk of sortedByPriority) {
    if (runningTotal + chunk.tokenCount <= budget) {
      selected.push(chunk);
      runningTotal += chunk.tokenCount;
    } else {
      // Drop this chunk (lowest priority that doesn't fit)
      logDroppedChunk(chunk, 'budget_overflow');
    }
  }
  
  return selected;
}
```

#### Technique 2: Summarization
```typescript
async function summarizeLongContext(
  chunk: ContextChunk,
  targetTokens: number
): Promise<ContextChunk> {
  if (chunk.tokenCount <= targetTokens) {
    return chunk; // No summarization needed
  }
  
  const summaryPrompt = `
    Summarize the following ${chunk.modality} content in ${targetTokens} tokens or less.
    Preserve key entities, numbers, and actionable information.
    Maintain original language (Bangla/English mix).
    
    Content: ${chunk.content}
  `;
  
  const summary = await callSummarizationModel(summaryPrompt);
  
  return {
    ...chunk,
    content: summary,
    tokenCount: countTokens(summary),
    wasSummarized: true,
    originalTokenCount: chunk.tokenCount,
    compressionRatio: chunk.tokenCount / countTokens(summary),
  };
}
```

#### Technique 3: Hierarchical Retrieval
```typescript
// Instead of loading full documents, load only relevant sections
async function hierarchicalRetrieval(
  document: DocumentChunk,
  query: string,
  budget: number
): Promise<ContextChunk[]> {
  // Step 1: Retrieve document outline/table of contents
  const outline = await extractOutline(document);
  
  // Step 2: Find most relevant sections
  const relevantSections = await rankSectionsByRelevance(outline, query);
  
  // Step 3: Load only top sections within budget
  const selectedSections: ContextChunk[] = [];
  let runningTotal = 0;
  
  for (const section of relevantSections) {
    const sectionContent = await loadSection(document, section.id);
    
    if (runningTotal + sectionContent.tokenCount <= budget) {
      selectedSections.push(sectionContent);
      runningTotal += sectionContent.tokenCount;
    } else {
      break; // Budget exhausted
    }
  }
  
  return selectedSections;
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement modality classifier & router
- [ ] Build text extraction pipeline (complete)
- [ ] Build image extraction pipeline (local OCR + cloud fallback)
- [ ] Create unified representation layer
- [ ] Implement basic prioritization scoring

### Phase 2: Advanced Modalities (Weeks 3-4)
- [ ] Build voice extraction pipeline (local Whisper + cloud fallback)
- [ ] Build document extraction pipeline (LiteParse integration)
- [ ] Implement cross-modality fusion engine
- [ ] Add persona-specific modality weights
- [ ] Implement token budget management

### Phase 3: Optimization (Weeks 5-6)
- [ ] Build video extraction pipeline (keyframe sampling)
- [ ] Implement structured data pipeline
- [ ] Add conflict resolution algorithms
- [ ] Optimize for low-bandwidth scenarios
- [ ] Implement caching strategies

### Phase 4: Production Readiness (Weeks 7-8)
- [ ] End-to-end integration testing
- [ ] Performance benchmarking
- [ ] Cost optimization analysis
- [ ] Observability instrumentation
- [ ] Documentation and runbooks

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
describe('ModalityClassifier', () => {
  it('should correctly classify WhatsApp voice note', () => {
    const file = {
      mimeType: 'audio/ogg',
      codec: 'opus',
      source: 'whatsapp',
      duration: 45,
    };
    
    expect(classifyModality(file)).toEqual({
      modality: 'voice',
      subtype: 'whatsapp_voice_note',
      strategy: 'local_whisper_first',
    });
  });
  
  it('should detect low-quality image requiring cloud fallback', () => {
    const image = {
      resolution: { width: 320, height: 240 },
      fileSize: 50_000,
      blurScore: 0.7, // High blur
    };
    
    expect(selectImageStrategy(image)).toBe('cloud_vision_full');
  });
});

describe('CrossModalityFusion', () => {
  it('should detect and resolve conflicting amounts', async () => {
    const chunks = [
      { modality: 'voice', content: 'পাঁচশ টাকা', extractedValue: 500 },
      { modality: 'image', content: '৳5000', extractedValue: 5000 },
    ];
    
    const result = await resolveConflict(chunks, 'f_commerce_operator');
    
    expect(result.requiresHumanReview).toBe(true);
    expect(result.resolutionStrategy).toBe('flag_for_human');
  });
});
```

### 7.2 Integration Tests

```typescript
describe('Multi-Modal Context Assembly Pipeline', () => {
  it('should process F-commerce order with voice + image + text', async () => {
    // Simulate real-world scenario
    const inputs = [
      { type: 'voice', source: 'whatsapp', content: 'আমি ৩টা শার্ট অর্ডার করতে চাই' },
      { type: 'image', source: 'camera', content: 'product_photo.jpg' },
      { type: 'text', source: 'chat', content: 'Size: L, Color: Blue' },
    ];
    
    const assembledContext = await assembleMultiModalContext(inputs, {
      persona: 'f_commerce_operator',
      intent: 'create_order',
      tokenBudget: 8000,
    });
    
    // Verify all modalities processed
    expect(assembledContext.modalities).toContain('voice');
    expect(assembledContext.modalities).toContain('image');
    expect(assembledContext.modalities).toContain('text');
    
    // Verify fusion occurred
    expect(assembledContext.fusedChunks.length).toBeGreaterThan(0);
    
    // Verify priority ordering
    expect(assembledContext.chunks[0].modality).toBe('voice'); // Highest priority for persona
    
    // Verify within budget
    expect(assembledContext.totalTokens).toBeLessThan(8000);
  });
});
```

### 7.3 Performance Benchmarks

| Scenario | Target Latency | Target Cost | Success Rate |
|----------|----------------|-------------|--------------|
| Text-only context | < 200ms | < $0.001 | > 99% |
| Image + Text | < 2s | < $0.05 | > 95% |
| Voice + Text | < 3s | < $0.08 | > 90% |
| Document (PDF) | < 1s | < $0.02 | > 98% |
| Full multi-modal (4 types) | < 10s | < $0.20 | > 85% |

---

## 8. Observability & Debugging

### 8.1 Key Metrics to Track

```typescript
interface MultiModalMetrics {
  // Volume metrics
  ingestionRate: {
    byModality: Record<string, number>; // chunks per minute
    totalBytesPerMinute: number;
  };
  
  // Quality metrics
  extractionConfidence: {
    byModality: Record<string, number>; // average confidence score
    lowConfidenceRate: number; // % below threshold
  };
  
  // Performance metrics
  processingLatency: {
    byModality: Record<string, number>; // p50, p95, p99
    endToEndLatency: number;
  };
  
  // Cost metrics
  costPerRequest: {
    byModality: Record<string, number>; // BDT equivalent
    totalCostPerDay: number;
  };
  
  // Fusion metrics
  fusionSuccessRate: number;
  conflictResolutionRate: number;
  humanReviewEscalationRate: number;
}
```

### 8.2 Debug Endpoints

```bash
# Inspect context assembly for a specific request
GET /api/debug/context-assembly/{requestId}

# View modality extraction results
GET /api/debug/extraction/{chunkId}

# Analyze fusion decisions
GET /api/debug/fusion/{fusionJobId}

# Replay context assembly with different parameters
POST /api/debug/replay-assembly
{
  "originalRequestId": "...",
  "overrides": {
    "tokenBudget": 4000,
    "persona": "academic_researcher",
    "prioritizeModality": "document"
  }
}
```

### 8.3 Common Debugging Scenarios

#### Scenario 1: Low Confidence in Image OCR
```bash
# Check extraction details
curl http://localhost:3000/api/debug/extraction/chunk_123 | jq

# Expected output:
{
  "chunkId": "chunk_123",
  "modality": "image",
  "extractionMethod": "local_paddleocr",
  "confidenceScore": 0.52,
  "extractedText": "৳ ?০০",  # Uncertain digits
  "fallbackAvailable": true,
  "fallbackTriggered": false,
  "recommendation": "Enable cloud fallback for this chunk"
}

# Action: Trigger cloud fallback manually
curl -X POST http://localhost:3000/api/debug/retry-extraction \
  -H "Content-Type: application/json" \
  -d '{"chunkId": "chunk_123", "strategy": "cloud_vision_full"}'
```

#### Scenario 2: Context Overflow
```bash
# Check token budget breakdown
curl http://localhost:3000/api/debug/context-budget/assembly_456 | jq

# Expected output:
{
  "totalBudget": 8000,
  "allocated": {
    "text": 2000,
    "image": 3000,
    "voice": 2500,
    "document": 1000
  },
  "droppedChunks": [
    {
      "chunkId": "chunk_789",
      "modality": "video",
      "reason": "lowest_priority",
      "tokenCount": 800
    }
  ],
  "recommendation": "Increase budget or reduce video priority for this persona"
}
```

---

## 9. Security & Compliance

### 9.1 Data Handling by Sensitivity

| Sensitivity Level | Allowed Modalities | Encryption Required | Retention Policy |
|-------------------|-------------------|---------------------|------------------|
| Public | All | None | Standard TTL |
| Internal | All except video | TLS in transit | 30 days |
| Confidential | Text, Image, Document | TLS + AES-256 at rest | 90 days, access logged |
| PII | Text, Structured only | TLS + AES-256, field-level encryption | 365 days, strict access control |
| Financial | All (with approval) | End-to-end encryption | 7 years (regulatory) |

### 9.2 Privacy-Preserving Processing

```typescript
// Blur faces in images before cloud processing
async function preprocessImageForCloud(image: ImageFile): Promise<ImageFile> {
  const faces = await detectFaces(image);
  
  if (faces.length > 0) {
    const blurred = await applyFaceBlurring(image, faces);
    logPrivacyAction('face_blurred', { faceCount: faces.length });
    return blurred;
  }
  
  return image;
}

// Anonymize voice before external API call
async function anonymizeVoiceForCloud(audio: AudioFile): Promise<AudioFile> {
  // Remove speaker-identifying characteristics
  const anonymized = await applyVoiceConversion(audio, {
    pitchShift: randomInRange(-2, 2),
    formantShift: randomInRange(-1, 1),
  });
  
  logPrivacyAction('voice_anonymized');
  return anonymized;
}
```

---

## 10. Appendix

### A. Modality Detection Decision Tree

```
Is it a file upload?
├─ YES → Check MIME type
│   ├─ audio/* → Voice
│   ├─ image/* → Image
│   ├─ video/* → Video
│   ├─ application/pdf → Document
│   ├─ text/* → Text
│   └─ Other → Manual classification
│
└─ NO → Is it from chat?
    ├─ WhatsApp message with attachment → Check attachment type
    ├─ Voice message → Voice
    ├─ Photo → Image
    └─ Text-only → Text
```

### B. Cost Optimization Cheat Sheet

| Optimization | Savings | Complexity | Recommendation |
|--------------|---------|------------|----------------|
| Local OCR first | 60-80% | Low | ✅ Always enable |
| Local Whisper (base) | 50-70% | Low | ✅ Enable for < 2min audio |
| Video keyframe sampling | 80-90% | Medium | ✅ Enable by default |
| Smart modality dropping | 20-40% | Medium | ✅ Enable with persona weights |
| Hierarchical retrieval | 30-50% | High | ⚠️ For long documents only |
| Cloud vision for all | - | N/A | ❌ Never do this |

### C. Glossary

- **Modality**: Type of media (text, image, voice, video, document, structured)
- **Fusion**: Combining information from multiple modalities
- **TTL**: Time To Live - how long context is retained
- **LiteParse**: Layout-aware document parser optimized for local execution
- **HE-DE**: Human Employee - Digital Employee collaboration model

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Sep 2026 | Shothik AI Team | Initial release |

**Related Documents:**
- `CONTEXT_ASSEMBLY_ARCHITECTURE.md`
- `PERSONA_CONTEXT_PROFILES.md`
- `CONTEXT_LIFECYCLE_AND_EXPIRATION_POLICY.md`
- `CONTEXT_SECURITY_AND_ISOLATION_BOUNDARIES.md`
