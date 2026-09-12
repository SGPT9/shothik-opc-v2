# Context Compression and Summarization Strategies

**Document Type:** Technical Specification  
**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** September 2026  
**Author:** Shothik AI Architecture Team  
**Reviewers:** Core Engineering, ML/AI Team, Product  

---

## Executive Summary

This specification defines **context compression and summarization strategies** for ShothikGPT when retrieved context exceeds the model's token budget. Unlike naive truncation, Shothik employs intelligent compression techniques that preserve semantic meaning, critical entities, and actionable information while reducing token count by 40-70%.

### Key Objectives
1. **Maximize Information Density**: Retain highest-value content per token
2. **Preserve Actionability**: Never compress away instructions, numbers, or decisions
3. **Persona-Aware Compression**: Different strategies for different user types
4. **Cost-Quality Trade-off**: Optimize for BDT cost per successful task completion
5. **Reversible When Possible**: Maintain checkpoints for full-context recovery

### Design Principles
- **Progressive Compression**: Apply mildest effective technique first
- **Semantic Preservation**: Meaning > exact wording
- **Entity Protection**: Numbers, names, dates are sacrosanct
- **Bangla/Banglish Aware**: Compression must work for code-switched text
- **Observable**: Track compression ratio vs task success rate

---

## 1. Compression Decision Framework

### 1.1 When to Compress vs Discard

```typescript
interface CompressionDecision {
  // Input parameters
  currentTokens: number;
  budgetTokens: number;
  overflowPercentage: number;
  
  // Context characteristics
  hasCriticalEntities: boolean;
  hasRedundantInformation: boolean;
  hasLowConfidenceChunks: boolean;
  isTimeSensitive: boolean;
  
  // Persona constraints
  persona: PersonaType;
  taskCriticality: 'low' | 'medium' | 'high' | 'critical';
  
  // Decision output
  action: 'compress' | 'discard_low_priority' | 'summarize' | 'hybrid';
  technique: CompressionTechnique[];
  expectedCompressionRatio: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### Decision Tree

```
Is overflow < 20%?
├─ YES → Apply light compression (stopword removal, whitespace normalization)
│
└─ NO → Is there redundant information?
    ├─ YES → Apply deduplication + complementary fusion
    │
    └─ NO → Are there low-priority chunks?
        ├─ YES → Drop lowest priority chunks until within 10% of budget
        │         ↓
        │      Still over budget? → Compress remaining chunks
        │
        └─ NO → All chunks high priority?
            ├─ YES → Apply aggressive summarization
            │         ↓
            │      Still over budget? → Escalate to human review
            │
            └─ NO → Hybrid approach (drop + summarize)
```

### 1.2 Compression Technique Selection Matrix

| Overflow % | Redundancy | Priority Spread | Recommended Technique | Expected Reduction |
|------------|------------|-----------------|----------------------|-------------------|
| 0-20% | Low | Narrow | Light normalization | 5-15% |
| 20-40% | Medium | Medium | Deduplication + light summarization | 25-35% |
| 40-60% | High | Wide | Drop low-priority + moderate summarization | 40-55% |
| 60-80% | Any | Any | Aggressive summarization + entity preservation | 55-70% |
| 80%+ | Any | Any | Multi-pass compression + human escalation | 70-85% |

---

## 2. Compression Techniques

### 2.1 Technique 1: Normalization & Cleanup

**Use Case:** Minor overflow (< 20%), quick wins  
**Risk Level:** Very Low  
**Expected Reduction:** 5-15%

```typescript
interface NormalizationConfig {
  whitespace: {
    collapseMultipleSpaces: true;
    removeTrailingSpaces: true;
    normalizeNewlines: true; // Convert \r\n to \n
    removeEmptyLines: true;
  };
  
  banglish: {
    normalizeCommonVariations: true;
    // e.g., "kemon" → "kemon", "bhalo" → "bhalo"
    standardizeNumbers: true;
    // e.g., "১০০" ↔ "100" based on user preference
  };
  
  formatting: {
    removeMarkdownHeaders: false; // Keep structure
    removeBoldItalic: true; // Keep text, remove formatting
    shortenUrls: true; // Use bit.ly or similar
  };
}
```

**Implementation:**
```typescript
function applyNormalization(text: string, config: NormalizationConfig): string {
  let result = text;
  
  // Whitespace cleanup
  if (config.whitespace.collapseMultipleSpaces) {
    result = result.replace(/\s+/g, ' ');
  }
  
  if (config.whitespace.normalizeNewlines) {
    result = result.replace(/\r\n/g, '\n');
  }
  
  if (config.whitespace.removeEmptyLines) {
    result = result.replace(/^\s*[\r\n]/gm, '');
  }
  
  // Banglish normalization
  if (config.banglish.normalizeCommonVariations) {
    const variations: Record<string, string> = {
      'kemon asen': 'kemon',
      'valo': 'bhalo',
      'dhonnobad': 'dhonnobad',
      // ... more variations
    };
    
    Object.entries(variations).forEach(([variant, canonical]) => {
      result = result.replace(new RegExp(variant, 'gi'), canonical);
    });
  }
  
  // URL shortening
  if (config.formatting.shortenUrls) {
    result = await shortenLongUrls(result);
  }
  
  return result;
}
```

### 2.2 Technique 2: Stopword Removal (Context-Aware)

**Use Case:** Moderate overflow (20-40%), conversational text  
**Risk Level:** Low  
**Expected Reduction:** 10-20%

```typescript
interface StopwordRemovalConfig {
  // Language-specific stopword lists
  stopwords: {
    bengali: string[];
    english: string[];
    banglish: string[];
  };
  
  // Preserve stopwords in certain contexts
  preserveInContexts: {
    questions: true; // "কিভাবে করব?" needs "কিভাবে"
    negations: true; // "না" changes meaning
    emphasis: true; // "খুব", "অনেক"
    temporal: true; // "এখন", "পরে"
  };
  
  // Minimum sentence length after removal
  minSentenceLength: 5; // tokens
  
  // Don't remove if it creates ambiguity
  avoidAmbiguity: true;
}
```

**Bengali Stopwords (Partial List):**
```typescript
const bengaliStopwords = [
  'এবং', 'বা', 'কিন্তু', 'যদি', 'তবে', // Conjunctions
  'এই', 'ঐ', 'ওই', 'সেই', 'যে', 'কে', // Demonstratives
  'হয়', 'হয়েছে', 'ছিল', 'হবে', // Auxiliary verbs
  'আমি', 'তুমি', 'সে', 'আমরা', 'তোমরা', 'তারা', // Pronouns (sometimes)
  'একটি', 'একটা', 'কিছু', 'সব', // Quantifiers
];

const banglishStopwords = [
  'ar', 'ba', 'kintu', 'jodi', 'tobe',
  'ei', 'oi', 'je', 'ke',
  'hoy', 'hoyeche', 'chilo', 'hobe',
  'ami', 'tumi', 'se', 'amra', 'tomra', 'tara',
];
```

**Context-Aware Removal:**
```typescript
function smartStopwordRemoval(
  text: string,
  config: StopwordRemovalConfig
): string {
  const sentences = splitIntoSentences(text);
  
  return sentences.map(sentence => {
    const context = analyzeSentenceContext(sentence);
    
    // Determine which stopwords to preserve
    const preservedStopwords = new Set<string>();
    
    if (context.isQuestion && config.preserveInContexts.questions) {
      questionWords.forEach(w => preservedStopwords.add(w));
    }
    
    if (context.hasNegation && config.preserveInContexts.negations) {
      negationWords.forEach(w => preservedStopwords.add(w));
    }
    
    if (context.hasEmphasis && config.preserveInContexts.emphasis) {
      emphasisWords.forEach(w => preservedStopwords.add(w));
    }
    
    // Remove stopwords not in preserved set
    const tokens = tokenize(sentence);
    const filtered = tokens.filter(token => {
      const isStopword = config.stopwords.bengali.includes(token) ||
                         config.stopwords.banglish.includes(token);
      
      if (!isStopword) return true;
      if (preservedStopwords.has(token)) return true;
      
      return false;
    });
    
    // Ensure minimum sentence length
    if (filtered.length < config.minSentenceLength) {
      return sentence; // Keep original
    }
    
    return filtered.join(' ');
  }).join(' ');
}
```

### 2.3 Technique 3: Deduplication & Redundancy Removal

**Use Case:** Multiple sources providing same information  
**Risk Level:** Low-Medium  
**Expected Reduction:** 15-30%

```typescript
interface DeduplicationConfig {
  // Similarity thresholds
  exactMatchThreshold: 1.0;
  semanticSimilarityThreshold: 0.85;
  partialOverlapThreshold: 0.6;
  
  // What to compare
  compareBy: ('text' | 'entities' | 'intent' | 'all')[];
  
  // How to merge duplicates
  mergeStrategy: 'keep_highest_confidence' | 'keep_most_recent' | 'merge_complementary';
  
  // Cross-modality deduplication
  crossModality: {
    enabled: true;
    voiceVsText: true;
    imageVsText: true;
    documentVsExtractedChunks: true;
  };
}
```

**Semantic Similarity Detection:**
```typescript
async function findDuplicates(
  chunks: ContextChunk[],
  config: DeduplicationConfig
): Promise<DuplicateGroup[]> {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < chunks.length; i++) {
    if (processed.has(chunks[i].id)) continue;
    
    const group: ContextChunk[] = [chunks[i]];
    
    for (let j = i + 1; j < chunks.length; j++) {
      if (processed.has(chunks[j].id)) continue;
      
      const similarity = await calculateSimilarity(chunks[i], chunks[j], config);
      
      if (similarity >= config.semanticSimilarityThreshold) {
        group.push(chunks[j]);
        processed.add(chunks[j].id);
      }
    }
    
    if (group.length > 1) {
      groups.push({
        representative: selectRepresentative(group, config.mergeStrategy),
        duplicates: group,
        similarityScore: averageSimilarity(group),
      });
    }
    
    processed.add(chunks[i].id);
  }
  
  return groups;
}

async function calculateSimilarity(
  chunk1: ContextChunk,
  chunk2: ContextChunk,
  config: DeduplicationConfig
): Promise<number> {
  const scores: number[] = [];
  
  if (config.compareBy.includes('text')) {
    const textSim = await cosineSimilarity(
      await embed(chunk1.content),
      await embed(chunk2.content)
    );
    scores.push(textSim);
  }
  
  if (config.compareBy.includes('entities')) {
    const entities1 = extractEntities(chunk1.content);
    const entities2 = extractEntities(chunk2.content);
    const entitySim = jaccardSimilarity(entities1, entities2);
    scores.push(entitySim);
  }
  
  if (config.compareBy.includes('intent')) {
    const intent1 = await classifyIntent(chunk1.content);
    const intent2 = await classifyIntent(chunk2.content);
    const intentSim = intent1 === intent2 ? 1.0 : 0.0;
    scores.push(intentSim);
  }
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
```

**Merge Strategy Implementation:**
```typescript
function mergeDuplicateChunks(
  group: DuplicateGroup,
  strategy: MergeStrategy
): ContextChunk {
  switch (strategy) {
    case 'keep_highest_confidence':
      return group.duplicates.reduce((best, current) => 
        current.confidenceScore > best.confidenceScore ? current : best
      );
    
    case 'keep_most_recent':
      return group.duplicates.reduce((best, current) => 
        current.timestamp > best.timestamp ? current : best
      );
    
    case 'merge_complementary':
      // Extract unique information from each chunk
      const uniqueInfo = extractUniqueInformation(group.duplicates);
      return createMergedChunk(uniqueInfo, group.duplicates);
    
    default:
      throw new Error(`Unknown merge strategy: ${strategy}`);
  }
}
```

### 2.4 Technique 4: Abstractive Summarization

**Use Case:** Significant overflow (40-80%), long documents  
**Risk Level:** Medium-High  
**Expected Reduction:** 50-70%

```typescript
interface SummarizationConfig {
  // Target length
  targetTokens: number;
  targetCompressionRatio: number; // e.g., 0.3 = 70% reduction
  
  // Content priorities
  preserveEntities: {
    numbers: true;
    names: true;
    dates: true;
    locations: true;
    monetaryAmounts: true;
  };
  
  preserveStructure: {
    sections: boolean;
    bulletPoints: boolean;
    numberedLists: boolean;
  };
  
  // Language handling
  maintainLanguage: 'same_as_original' | 'user_preference';
  handleBanglish: 'preserve' | 'normalize_to_bangla' | 'normalize_to_english';
  
  // Quality controls
  minCoherenceScore: 0.7;
  allowHallucination: false;
  factCheckSummary: true;
  
  // Model selection
  summarizationModel: {
    provider: 'local_t5' | 'cloud_gpt' | 'cloud_claude';
    model: 't5-base' | 'gpt-3.5-turbo' | 'claude-3-haiku';
    fallbackChain: ['local_t5', 'cloud_claude'];
  };
}
```

**Prompt Template for Summarization:**
```typescript
const summarizationPrompt = `
You are an expert summarizer for ShothikGPT, an AI assistant for South Asian entrepreneurs.

TASK: Summarize the following content in ${targetTokens} tokens or less.

CRITICAL REQUIREMENTS:
1. PRESERVE all numbers, amounts, dates, and names exactly as written
2. MAINTAIN the original language mix (Bangla/English/Banglish)
3. KEEP all actionable information (instructions, decisions, next steps)
4. REMOVE redundant examples, verbose explanations, and filler words
5. DO NOT add any information not present in the original

CONTENT TO SUMMARIZE:
${content}

PERSONA CONTEXT:
- User Type: ${persona}
- Task: ${taskType}
- Criticality: ${criticality}

OUTPUT FORMAT:
Provide a concise summary that preserves meaning while reducing length.
Maintain the tone appropriate for ${persona}.

SUMMARY:
`;
```

**Entity-Preserving Summarization:**
```typescript
async function entityPreservingSummarize(
  content: string,
  config: SummarizationConfig
): Promise<string> {
  // Step 1: Extract and protect critical entities
  const entities = extractAndProtectEntities(content, config.preserveEntities);
  
  // Step 2: Replace entities with placeholders
  const contentWithPlaceholders = replaceWithPlaceholders(content, entities);
  
  // Step 3: Summarize the placeholder version
  const summary = await callSummarizationModel(
    summarizationPrompt,
    contentWithPlaceholders,
    config
  );
  
  // Step 4: Restore original entities
  const finalSummary = restoreEntities(summary, entities);
  
  // Step 5: Fact-check against original
  if (config.factCheckSummary) {
    const factCheckResult = await factCheckSummary(finalSummary, content);
    
    if (!factCheckResult.passed) {
      logWarning('Summary failed fact check', {
        failures: factCheckResult.failures,
        originalContent: content,
        summary: finalSummary,
      });
      
      // Retry with stricter constraints
      return await entityPreservingSummarize(content, {
        ...config,
        targetTokens: Math.floor(config.targetTokens * 1.2), // Allow slightly longer
      });
    }
  }
  
  return finalSummary;
}

function extractAndProtectEntities(
  content: string,
  config: EntityPreservationConfig
): ProtectedEntity[] {
  const entities: ProtectedEntity[] = [];
  
  if (config.numbers) {
    const numberMatches = content.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g);
    for (const match of numberMatches) {
      entities.push({
        type: 'number',
        value: match[0],
        placeholder: `__NUM_${entities.length}__`,
        position: match.index,
      });
    }
  }
  
  if (config.monetaryAmounts) {
    const moneyMatches = content.matchAll(/(?:৳|BDT|Tk\.?)\s*\d+(?:,\d{3})*/g);
    for (const match of moneyMatches) {
      entities.push({
        type: 'money',
        value: match[0],
        placeholder: `__MONEY_${entities.length}__`,
        position: match.index,
      });
    }
  }
  
  // Add more entity types (names, dates, locations)
  
  return entities;
}
```

### 2.5 Technique 5: Hierarchical Section Selection

**Use Case:** Long documents with clear structure  
**Risk Level:** Medium  
**Expected Reduction:** 40-60%

```typescript
interface HierarchicalSelectionConfig {
  // Document structure detection
  detectStructure: {
    headings: true;
    sections: true;
    paragraphs: true;
    lists: true;
  };
  
  // Relevance scoring
  scoringFactors: {
    headingRelevance: 0.4;
    contentRelevance: 0.4;
    positionalBoost: 0.1; // First/last sections often important
    recencyBoost: 0.1;
  };
  
  // Selection strategy
  selectionStrategy: 'top_k_sections' | 'threshold_based' | 'budget_filling';
  maxSections: 5;
  minSectionRelevance: 0.5;
  
  // Fallback
  includeExecutiveSummary: true;
  includeConclusion: true;
}
```

**Hierarchical Selection Algorithm:**
```typescript
async function selectRelevantSections(
  document: DocumentChunk,
  query: string,
  config: HierarchicalSelectionConfig,
  budget: number
): Promise<ContextChunk[]> {
  // Step 1: Parse document structure
  const structure = await parseDocumentStructure(document);
  
  // Step 2: Score each section for relevance
  const scoredSections = await Promise.all(
    structure.sections.map(async (section) => {
      const headingScore = await calculateRelevance(section.heading, query);
      const contentScore = await calculateRelevance(section.content, query);
      const positionalScore = calculatePositionalBoost(section.position, structure.totalSections);
      
      const totalScore = 
        headingScore * config.scoringFactors.headingRelevance +
        contentScore * config.scoringFactors.contentRelevance +
        positionalScore * config.scoringFactors.positionalBoost;
      
      return {
        section,
        scores: { headingScore, contentScore, positionalScore, totalScore },
      };
    })
  );
  
  // Step 3: Sort by relevance
  scoredSections.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
  
  // Step 4: Select top sections within budget
  const selectedSections: ContextChunk[] = [];
  let runningTokens = 0;
  
  // Always include executive summary if exists
  if (config.includeExecutiveSummary && structure.executiveSummary) {
    selectedSections.push(structure.executiveSummary);
    runningTokens += structure.executiveSummary.tokenCount;
  }
  
  for (const scored of scoredSections) {
    if (runningTokens + scored.section.tokenCount <= budget) {
      selectedSections.push(scored.section);
      runningTokens += scored.section.tokenCount;
      
      if (selectedSections.length >= config.maxSections) {
        break;
      }
    }
  }
  
  // Always include conclusion if space allows
  if (config.includeConclusion && structure.conclusion) {
    const remainingBudget = budget - runningTokens;
    if (structure.conclusion.tokenCount <= remainingBudget) {
      selectedSections.push(structure.conclusion);
    }
  }
  
  return selectedSections;
}
```

### 2.6 Technique 6: Checkpoint-Based Recovery

**Use Case:** Critical tasks requiring full context access  
**Risk Level:** Low (reversible)  
**Expected Reduction:** N/A (enables safe aggressive compression)

```typescript
interface CheckpointConfig {
  // What to checkpoint
  checkpointFullContext: true;
  checkpointEntities: true;
  checkpointMetadata: true;
  
  // Storage
  storageBackend: 'database' | 'redis' | 's3';
  ttlHours: 24;
  
  // Recovery triggers
  recoveryTriggers: {
    userRequest: true;
    modelConfusion: true; // Model indicates missing context
    taskFailure: true;
    lowConfidenceAnswer: true;
  };
}
```

**Checkpoint Creation:**
```typescript
async function createContextCheckpoint(
  requestId: string,
  fullContext: ContextChunk[],
  compressedContext: ContextChunk[],
  config: CheckpointConfig
): Promise<Checkpoint> {
  const checkpoint: Checkpoint = {
    id: `chk_${requestId}_${Date.now()}`,
    requestId,
    timestamp: Date.now(),
    ttlExpires: Date.now() + (config.ttlHours * 60 * 60 * 1000),
    
    // Store full context
    fullContext: config.checkpointFullContext ? fullContext : null,
    
    // Store extracted entities separately for quick access
    entities: config.checkpointEntities ? extractAllEntities(fullContext) : null,
    
    // Store metadata
    metadata: {
      originalTokenCount: sumTokens(fullContext),
      compressedTokenCount: sumTokens(compressedContext),
      compressionRatio: sumTokens(compressedContext) / sumTokens(fullContext),
      techniquesApplied: identifyCompressionTechniques(compressedContext),
      persona: inferPersonaFromContext(fullContext),
    },
    
    // Store mapping from compressed to original
    provenanceMap: buildProvenanceMap(compressedContext, fullContext),
  };
  
  // Store in database
  await db.contextCheckpoints.insert(checkpoint);
  
  // Also cache in Redis for fast access
  if (config.storageBackend === 'redis') {
    await redis.setex(
      `checkpoint:${checkpoint.id}`,
      config.ttlHours * 3600,
      JSON.stringify(checkpoint)
    );
  }
  
  return checkpoint;
}
```

**Checkpoint Recovery:**
```typescript
async function recoverFromCheckpoint(
  checkpointId: string,
  reason: RecoveryReason
): Promise<ContextChunk[]> {
  const checkpoint = await db.contextCheckpoints.find(checkpointId);
  
  if (!checkpoint) {
    throw new Error(`Checkpoint not found: ${checkpointId}`);
  }
  
  if (Date.now() > checkpoint.ttlExpires) {
    throw new Error(`Checkpoint expired: ${checkpointId}`);
  }
  
  // Log recovery event
  logRecoveryEvent({
    checkpointId,
    reason,
    timestamp: Date.now(),
  });
  
  // Return full context
  return checkpoint.fullContext;
}

// Usage in agent loop
async function executeAgentTask(
  context: ContextChunk[],
  checkpointId?: string
): Promise<AgentResult> {
  const result = await runAgentWithCompressedContext(context);
  
  // Check if model indicated confusion or missing context
  if (result.indicatesMissingContext && checkpointId) {
    const fullContext = await recoverFromCheckpoint(checkpointId, 'model_confusion');
    
    // Retry with full context
    return await runAgentWithFullContext(fullContext);
  }
  
  return result;
}
```

---

## 3. Persona-Specific Compression Profiles

### 3.1 F-Commerce Operator Profile

```typescript
const fCommerceCompressionProfile: CompressionProfile = {
  persona: 'f_commerce_operator',
  
  // Priorities
  preserveAtAllCosts: [
    'monetary_amounts',       // ৳500, ৳1000
    'transaction_ids',        // TrxID: ABC123
    'phone_numbers',          // +8801XXX
    'product_quantities',     // 3 pcs, 5 boxes
    'delivery_addresses',     // Full address
    'payment_methods',        // bKash, Nagad, COD
  ],
  
  canSummarizeHeavily: [
    'customer_conversation',  // Greetings, small talk
    'product_descriptions',   // Unless negotiating specifics
    'general_business_tips',  // Educational content
  ],
  
  canDiscardIfNeeded: [
    'old_promotional_content',
    'outdated_price_lists',
    'completed_transaction_history', // If older than 7 days
  ],
  
  // Compression preferences
  preferredTechniques: [
    'normalization',          // Quick, safe
    'deduplication',          // Common in chat conversations
    'entity_preserving_summary', // For long product descriptions
  ],
  
  avoidTechniques: [
    'stopword_removal',       // May lose politeness markers
    'aggressive_summarization', // Risk losing negotiation nuances
  ],
  
  // Language considerations
  languageHandling: {
    preserveBanglish: true,  // User communicates in Banglish
    preservePolitenessMarkers: true, // "দয়া করে", "ধন্যবাদ"
    preserveHonorifics: true, // "আপনি", "ভাইয়া", "আপু"
  },
};
```

### 3.2 Academic Researcher Profile

```typescript
const academicCompressionProfile: CompressionProfile = {
  persona: 'academic_researcher',
  
  // Priorities
  preserveAtAllCosts: [
    'citations',              // Author, year, journal
    'equations',              // LaTeX formulas
    'numerical_results',      // Statistical values
    'methodology_details',    // Experimental setup
    'figure_captions',        // Often contain key insights
  ],
  
  canSummarizeHeavily: [
    'literature_review',      // Unless directly relevant
    'background_introduction', // General context
    'acknowledgments',        // Not critical for research
  ],
  
  canDiscardIfNeeded: [
    'references_list',        // Can be retrieved later
    'appendix_materials',     // Supplementary info
    'repeated_methodology',   // If described multiple times
  ],
  
  // Compression preferences
  preferredTechniques: [
    'hierarchical_selection', // Papers have clear structure
    'entity_preserving_summary', // Protect citations and equations
    'checkpoint_recovery',    // Critical for accuracy
  ],
  
  avoidTechniques: [
    'stopword_removal',       // May change technical meaning
    'normalization',          // Preserve exact terminology
  ],
  
  // Special handling
  specialHandling: {
    preserveLaTeX: true,
    preserveCitationFormat: 'bibtex',
    maintainSectionHierarchy: true,
    keepFigureReferences: true,
  },
};
```

### 3.3 Zero-Capital Creator Profile

```typescript
const creatorCompressionProfile: CompressionProfile = {
  persona: 'zero_capital_creator',
  
  // Priorities
  preserveAtAllCosts: [
    'trend_keywords',         // Viral hashtags, trending topics
    'platform_requirements',  // Video length, aspect ratios
    'engagement_metrics',     // Views, likes, shares
    'collaboration_details',  // Partner names, terms
    'monetization_info',      // Revenue rates, thresholds
  ],
  
  canSummarizeHeavily: [
    'content_ideas',          // Unless actively developing
    'general_tips',           // Common advice
    'tool_recommendations',   // Can be retrieved later
  ],
  
  canDiscardIfNeeded: [
    'old_trend_data',         // Trends expire quickly
    'outdated_platform_updates',
    'completed_campaign_results',
  ],
  
  // Compression preferences
  preferredTechniques: [
    'normalization',          // Fast, preserves keywords
    'deduplication',          // Similar trend reports
    'light_summarization',    // For long articles
  ],
  
  avoidTechniques: [
    'aggressive_summarization', // May lose trend nuances
  ],
  
  // Temporal sensitivity
  temporalHandling: {
    prioritizeRecent: true,   // Last 48 hours most important
    decayOldTrends: true,     // Reduce priority after 1 week
    preserveEvergreen: true,  // Platform policies don't expire
  },
};
```

### 3.4 SME Operator Profile

```typescript
const smeCompressionProfile: CompressionProfile = {
  persona: 'sme_operator',
  
  // Priorities
  preserveAtAllCosts: [
    'compliance_deadlines',   // Tax filing dates, license renewals
    'financial_figures',      // Revenue, expenses, profits
    'legal_terms',            // Contract clauses
    'employee_information',   // Names, roles, salaries
    'vendor_details',         // Contact info, payment terms
  ],
  
  canSummarizeHeavily: [
    'meeting_notes',          // Unless action items
    'industry_reports',       // General market analysis
    'training_materials',     // Can reference later
  ],
  
  canDiscardIfNeeded: [
    'old_correspondence',     // Emails older than 90 days
    'draft_documents',        // Superseded versions
    'internal_memos',         // Non-critical updates
  ],
  
  // Compression preferences
  preferredTechniques: [
    'hierarchical_selection', // Reports have structure
    'entity_preserving_summary', // Protect financial/legal data
    'checkpoint_recovery',    // Compliance requires accuracy
  ],
  
  avoidTechniques: [
    'stopword_removal',       // Legal language is precise
    'aggressive_summarization', // Risk compliance issues
  ],
  
  // Compliance requirements
  complianceHandling: {
    retainForAudit: true,    // Keep full context for 7 years
    encryptionRequired: true, // Financial data
    accessLogging: true,      // Who accessed what
  },
};
```

---

## 4. Quality Assurance & Validation

### 4.1 Compression Quality Metrics

```typescript
interface CompressionQualityMetrics {
  // Information retention
  entityRetentionRate: number;     // % of entities preserved
  semanticSimilarityScore: number; // Cosine similarity before/after
  keyPointCoverage: number;        // % of key points retained
  
  // Readability
  coherenceScore: number;          // Human or model-rated coherence
  fluencyScore: number;            // Grammar and flow quality
  languageConsistency: number;     // Bangla/English mix preserved
  
  // Task success
  taskCompletionRate: number;      // % tasks completed successfully
  modelConfidenceScore: number;    // Model's confidence in answers
  humanSatisfactionScore: number;  // User ratings
  
  // Efficiency
  actualCompressionRatio: number;  // Achieved reduction
  processingLatencyMs: number;     // Time to compress
  costPerCompression: number;      // BDT cost
}
```

### 4.2 Automated Validation Pipeline

```typescript
async function validateCompressionQuality(
  original: ContextChunk[],
  compressed: ContextChunk[],
  config: ValidationConfig
): Promise<ValidationResult> {
  const metrics: CompressionQualityMetrics = {
    entityRetentionRate: await calculateEntityRetention(original, compressed),
    semanticSimilarityScore: await calculateSemanticSimilarity(original, compressed),
    keyPointCoverage: await calculateKeyPointCoverage(original, compressed),
    coherenceScore: await assessCoherence(compressed),
    fluencyScore: await assessFluency(compressed),
    languageConsistency: await assessLanguageMix(original, compressed),
    actualCompressionRatio: calculateCompressionRatio(original, compressed),
  };
  
  // Check against thresholds
  const failures: ValidationFailure[] = [];
  
  if (metrics.entityRetentionRate < config.minEntityRetention) {
    failures.push({
      metric: 'entityRetentionRate',
      expected: config.minEntityRetention,
      actual: metrics.entityRetentionRate,
      severity: 'critical',
    });
  }
  
  if (metrics.semanticSimilarityScore < config.minSemanticSimilarity) {
    failures.push({
      metric: 'semanticSimilarityScore',
      expected: config.minSemanticSimilarity,
      actual: metrics.semanticSimilarityScore,
      severity: 'high',
    });
  }
  
  // More checks...
  
  return {
    passed: failures.length === 0,
    metrics,
    failures,
    recommendations: generateRecommendations(failures),
  };
}
```

### 4.3 Human-in-the-Loop Validation

```typescript
interface HumanValidationConfig {
  // Sampling strategy
  samplingRate: number;        // % of compressions to validate
  stratifyByPersona: true;     // Ensure all personas represented
  prioritizeEdgeCases: true;   // Focus on difficult compressions
  
  // Validation criteria
  criteria: {
    meaningPreserved: boolean;
    entitiesAccurate: boolean;
    actionableInfoRetained: boolean;
    languageAppropriate: boolean;
    noHallucinations: boolean;
  };
  
  // Feedback collection
  collectFeedback: {
    rating: 1-5 scale;
    comments: open text;
    suggestedImprovements: open text;
  };
}
```

**Validation Workflow:**
```typescript
async function conductHumanValidation(
  compressionJob: CompressionJob,
  config: HumanValidationConfig
): Promise<HumanValidationResult> {
  // Sample compressions for review
  const sample = await sampleCompressionsForReview(compressionJob, config);
  
  // Send to human reviewers
  const reviews = await Promise.all(
    sample.map(async (item) => {
      const review = await humanReviewer.evaluate({
        original: item.original,
        compressed: item.compressed,
        criteria: config.criteria,
      });
      
      return {
        itemId: item.id,
        review,
        reviewerId: review.reviewerId,
        timestamp: Date.now(),
      };
    })
  );
  
  // Aggregate results
  const aggregatedResults = aggregateReviews(reviews);
  
  // Identify patterns in failures
  const failurePatterns = identifyFailurePatterns(reviews);
  
  // Generate improvement recommendations
  const recommendations = generateImprovementRecommendations(
    aggregatedResults,
    failurePatterns
  );
  
  return {
    validationId: `hv_${Date.now()}`,
    sampleSize: sample.length,
    averageRating: aggregatedResults.averageRating,
    passRate: aggregatedResults.passRate,
    failurePatterns,
    recommendations,
    timestamp: Date.now(),
  };
}
```

---

## 5. Performance Optimization

### 5.1 Caching Strategies

```typescript
interface CompressionCacheConfig {
  // What to cache
  cacheSummaries: true;
  cacheEntityExtractions: true;
  cacheSimilarityScores: true;
  
  // Cache keys
  keyStrategy: 'content_hash' | 'query_dependent' | 'hybrid';
  
  // TTL settings
  ttl: {
    summaries: 3600;         // 1 hour
    entities: 86400;         // 24 hours
    similarities: 3600;      // 1 hour
  };
  
  // Invalidation
  invalidateOn: {
    contentUpdate: true;
    personaChange: true;
    configChange: true;
  };
}
```

**Cache Implementation:**
```typescript
class CompressionCache {
  private redis: RedisClient;
  private config: CompressionCacheConfig;
  
  async getSummary(contentHash: string, persona: PersonaType): Promise<string | null> {
    const key = `summary:${contentHash}:${persona}`;
    return await this.redis.get(key);
  }
  
  async setSummary(
    contentHash: string,
    persona: PersonaType,
    summary: string,
    ttl: number
  ): Promise<void> {
    const key = `summary:${contentHash}:${persona}`;
    await this.redis.setex(key, ttl, summary);
  }
  
  async getEntities(contentHash: string): Promise<ProtectedEntity[] | null> {
    const key = `entities:${contentHash}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async invalidateContent(contentHash: string): Promise<void> {
    const pattern = `*:${contentHash}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 5.2 Parallel Processing

```typescript
async function parallelCompression(
  chunks: ContextChunk[],
  config: CompressionConfig,
  maxConcurrency: number = 5
): Promise<ContextChunk[]> {
  // Group chunks by compression technique
  const groups = groupByCompressionTechnique(chunks, config);
  
  // Process each group in parallel
  const results = await Promise.all(
    Object.entries(groups).map(async ([technique, groupChunks]) => {
      const semaphore = new Semaphore(maxConcurrency);
      
      const processed = await Promise.all(
        groupChunks.map(async (chunk) => {
          await semaphore.acquire();
          try {
            return await applyCompressionTechnique(chunk, technique as CompressionTechnique);
          } finally {
            semaphore.release();
          }
        })
      );
      
      return { technique, chunks: processed };
    })
  );
  
  // Flatten and re-sort by priority
  const allChunks = results.flatMap(r => r.chunks);
  return allChunks.sort((a, b) => b.priority - a.priority);
}
```

### 5.3 Lazy Compression

```typescript
interface LazyCompressionConfig {
  enabled: true;
  initialLoad: 'minimal'; // Only load essential context
  onDemandExpansion: true;
  prefetchLikelyNeeds: true;
}

class LazyContextLoader {
  private loadedChunks: Map<string, ContextChunk> = new Map();
  private pendingExpansions: Map<string, Promise<ContextChunk>> = new Map();
  
  async getChunk(chunkId: string, fullContext: boolean = false): Promise<ContextChunk> {
    // Return already loaded
    if (this.loadedChunks.has(chunkId)) {
      return this.loadedChunks.get(chunkId)!;
    }
    
    // Return pending expansion if exists
    if (this.pendingExpansions.has(chunkId)) {
      return await this.pendingExpansions.get(chunkId)!;
    }
    
    // Start loading
    const expansionPromise = this.expandChunk(chunkId, fullContext);
    this.pendingExpansions.set(chunkId, expansionPromise);
    
    try {
      const chunk = await expansionPromise;
      this.loadedChunks.set(chunkId, chunk);
      return chunk;
    } finally {
      this.pendingExpansions.delete(chunkId);
    }
  }
  
  private async expandChunk(chunkId: string, fullContext: boolean): Promise<ContextChunk> {
    // Fetch from storage
    const chunk = await fetchChunk(chunkId);
    
    // If full context requested, decompress
    if (fullContext && chunk.isCompressed) {
      return await decompressChunk(chunk);
    }
    
    return chunk;
  }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement normalization & cleanup
- [ ] Build stopword removal (context-aware)
- [ ] Create deduplication engine
- [ ] Set up basic quality metrics

### Phase 2: Advanced Techniques (Weeks 3-4)
- [ ] Implement abstractive summarization
- [ ] Build hierarchical section selection
- [ ] Create checkpoint-based recovery
- [ ] Develop persona-specific profiles

### Phase 3: Quality & Optimization (Weeks 5-6)
- [ ] Build automated validation pipeline
- [ ] Implement human-in-the-loop validation
- [ ] Add caching strategies
- [ ] Enable parallel processing

### Phase 4: Production Readiness (Weeks 7-8)
- [ ] End-to-end integration testing
- [ ] Performance benchmarking
- [ ] A/B testing framework
- [ ] Documentation and runbooks

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
describe('Compression Techniques', () => {
  describe('Normalization', () => {
    it('should collapse multiple spaces', () => {
      const input = 'Hello    world';
      const output = applyNormalization(input, defaultConfig);
      expect(output).toBe('Hello world');
    });
    
    it('should normalize Banglish variations', () => {
      const input = 'kemon asen vai?';
      const output = applyNormalization(input, banglaConfig);
      expect(output).toContain('kemon');
    });
  });
  
  describe('Entity Preservation', () => {
    it('should preserve all monetary amounts', () => {
      const input = 'Price: ৳500, Discount: ৳50, Final: ৳450';
      const summary = await summarize(input, entityPreservingConfig);
      expect(summary).toContain('৳500');
      expect(summary).toContain('৳450');
    });
  });
});
```

### 7.2 Integration Tests

```typescript
describe('End-to-End Compression Pipeline', () => {
  it('should compress F-commerce conversation while preserving order details', async () => {
    const conversation = [
      { role: 'customer', content: 'ভাইয়া, ৩টা শার্ট লাগবে। দাম কত?' },
      { role: 'merchant', content: 'প্রতিটা ৳৫০০ টাকা। মোট ৳১৫০০।' },
      { role: 'customer', content: 'ঠিক আছে। আগামীকাল পাঠাবেন। ধানমন্ডি।' },
    ];
    
    const compressed = await compressConversation(conversation, {
      persona: 'f_commerce_operator',
      targetCompressionRatio: 0.5,
    });
    
    // Verify critical info preserved
    expect(compressed).toContain('৩টা');
    expect(compressed).toContain('৳৫০০');
    expect(compressed).toContain('ধানমন্ডি');
    
    // Verify compression achieved
    expect(compressed.length).toBeLessThan(conversation.length * 0.6);
  });
});
```

### 7.3 Quality Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Entity Retention | > 98% | Automated extraction comparison |
| Semantic Similarity | > 0.85 | Embedding cosine similarity |
| Task Success Rate | > 90% | End-to-end task completion |
| User Satisfaction | > 4.0/5.0 | Post-task surveys |
| Compression Latency | < 500ms | P95 latency measurement |

---

## 8. Observability & Monitoring

### 8.1 Key Metrics

```typescript
interface CompressionMetrics {
  // Volume
  totalCompressions: number;
  byTechnique: Record<CompressionTechnique, number>;
  byPersona: Record<PersonaType, number>;
  
  // Quality
  averageCompressionRatio: number;
  entityRetentionRate: number;
  validationPassRate: number;
  
  // Performance
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  
  // Cost
  averageCostPerCompression: number;
  totalDailyCost: number;
  
  // Failures
  failureRate: number;
  byFailureType: Record<FailureType, number>;
}
```

### 8.2 Alerting Rules

```yaml
alerts:
  - name: HighCompressionFailureRate
    condition: failure_rate > 0.05
    severity: critical
    action: page_oncall
    
  - name: LowEntityRetention
    condition: entity_retention_rate < 0.95
    severity: warning
    action: slack_alert
    
  - name: HighCompressionLatency
    condition: p95_latency_ms > 1000
    severity: warning
    action: slack_alert
    
  - name: ExcessiveCompressionCost
    condition: daily_cost > budget_threshold
    severity: info
    action: email_report
```

---

## 9. Appendix

### A. Compression Technique Comparison

| Technique | Best For | Reduction | Risk | Cost |
|-----------|----------|-----------|------|------|
| Normalization | Minor overflow | 5-15% | Very Low | Negligible |
| Stopword Removal | Conversational text | 10-20% | Low | Low |
| Deduplication | Redundant sources | 15-30% | Low-Medium | Medium |
| Abstractive Summary | Long documents | 50-70% | Medium-High | High |
| Hierarchical Selection | Structured docs | 40-60% | Medium | Low-Medium |
| Checkpoint Recovery | Critical tasks | N/A | Very Low | Storage cost |

### B. Glossary

- **Compression Ratio**: Compressed size / Original size (lower = more compression)
- **Entity Retention**: % of critical entities (numbers, names, dates) preserved
- **Semantic Similarity**: Cosine similarity between original and compressed embeddings
- **Checkpoint**: Stored full context for recovery if needed
- **Abstractive Summary**: AI-generated summary (vs extractive which copies sentences)

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Sep 2026 | Shothik AI Team | Initial release |

**Related Documents:**
- `CONTEXT_ASSEMBLY_ARCHITECTURE.md`
- `MULTI_MODAL_CONTEXT_ASSEMBLY_SPEC.md`
- `PERSONA_CONTEXT_PROFILES.md`
- `CONTEXT_LIFECYCLE_AND_EXPIRATION_POLICY.md`
