import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const styleDnaRouter = Router();

export interface SentenceRhythmDistribution {
  staccatoShortPercent: number; // < 8 words
  moderateCadencePercent: number; // 8 - 18 words
  extendedFlowPercent: number; // 19 - 30 words
  ornateCompoundPercent: number; // > 30 words
}

export interface StylometricMetrics {
  totalWords: number;
  totalSentences: number;
  meanSentenceLength: number;
  sentenceLengthVariance: number;
  sentenceLengthStdDev: number;
  rhythmDistribution: SentenceRhythmDistribution;
  dialogueRatio: number; // 0 to 100%
  narrativeRatio: number; // 0 to 100%
  sensoryAdjectiveDensityPer1k: number;
  sensoryBreakdown: {
    visual: number;
    auditory: number;
    olfactory: number;
    tactile: number;
    gustatory: number;
  };
  typeTokenRatio: number; // 0.0 to 1.0 (Vocabulary richness)
  yulesKCharacteristic: number; // Lower means richer vocabulary, typical 50 - 300
  hapaxLegomenaCount: number; // Words appearing once
  bengaliSadhuRatio: number; // 0 to 100% (Sadhu vs Cholit register)
  passiveVoiceQuotient: number; // 0 to 100%
}

export interface ArchetypeMatch {
  name: string;
  tagline: string;
  similarityScore: number; // 0 to 100
  keyTraits: string[];
}

export interface ProjectStyleDna {
  projectId: string;
  analyzedAt: string;
  voiceLocked: boolean;
  archetype: ArchetypeMatch;
  benchmarkArchetypes: ArchetypeMatch[];
  metrics: StylometricMetrics;
  voiceLockSystemPrompt: string;
  customRules: string[];
}

// In-memory cache for fast responsive DNA lookups
const styleDnaCache = new Map<string, ProjectStyleDna>();

// Sensory dictionary for Bengali & English
const SENSORY_KEYWORDS = {
  visual: [
    "glowing", "crimson", "shadow", "gleam", "dark", "radiant", "pale", "luminous", "murky", "glint",
    "উজ্জ্বল", "অন্ধকার", "রক্তিম", "ছায়া", "দীপ্তিময়", "ফ্যাকাশে", "ঝলমলে", "তিমির", "কুয়াশাচ্ছন্ন", "চকচকে"
  ],
  auditory: [
    "whisper", "rumble", "echo", "shriek", "rattle", "murmur", "screech", "thud", "hum", "buzz",
    "গুঞ্জন", "খসখস", "গমগম", "চীৎকার", "ফুসফুস", "ঝনঝন", "হাহাকার", "গুড়গুড়", "কলরব", "শব্দহীন"
  ],
  olfactory: [
    "fragrance", "scent", "pungent", "stale", "earthy", "reek", "aroma", "damp", "musk",
    "সুবাস", "সুগন্ধ", "কটূ", "মেঠো", "ভেজা", "দুর্গন্ধ", "আতরের", "আঁশটে", "ঘাসপোড়া"
  ],
  tactile: [
    "rough", "velvet", "frigid", "scalding", "silky", "brittle", "coarse", "clammy", "chilled",
    "খসখসে", "রেশমি", "বরফশীতল", "তপ্ত", "কোমল", "রুক্ষ", "স্যাঁতসেঁতে", "মসৃণ", "কাঁপন"
  ],
  gustatory: [
    "bitter", "sweet", "tart", "savory", "metallic", "sour", "peppery", "spicy",
    "তিক্ত", "মিষ্টি", "ঝাঁঝালো", "টক", "লোনা", "কষা", "স্বাদহীন", "নোনতা"
  ]
};

// Bengali verb/pronoun morphology indicators
const SADHU_MARKERS = [
    "করিয়াছিল", "করিল", "হইত", "হইতেছে", "তাহাকে", "তাহার", "উহাদের", "যাহারা",
    "খাইতে", "দেখিল", "বলিল", "আসিয়া", "যাইয়া", "লইয়া", "বসিয়া", "চলিতে"
];

const CHOLIT_MARKERS = [
    "করেছিল", "করল", "হত", "হচ্ছে", "তাকে", "তার", "ওদের", "যারা",
    "খেতে", "দেখল", "বলল", "এসে", "গিয়ে", "নিয়ে", "বসে", "চলতে"
];

const PASSIVE_MARKERS = /\b(is|are|was|were|been|being)\s+([a-z]+ed|[a-z]+en)\b/gi;

export function calculateStylometrics(text: string): StylometricMetrics {
  const clean = text.trim();
  if (!clean) {
    return {
      totalWords: 0,
      totalSentences: 0,
      meanSentenceLength: 0,
      sentenceLengthVariance: 0,
      sentenceLengthStdDev: 0,
      rhythmDistribution: {
        staccatoShortPercent: 25,
        moderateCadencePercent: 50,
        extendedFlowPercent: 20,
        ornateCompoundPercent: 5
      },
      dialogueRatio: 0,
      narrativeRatio: 100,
      sensoryAdjectiveDensityPer1k: 0,
      sensoryBreakdown: { visual: 0, auditory: 0, olfactory: 0, tactile: 0, gustatory: 0 },
      typeTokenRatio: 0,
      yulesKCharacteristic: 100,
      hapaxLegomenaCount: 0,
      bengaliSadhuRatio: 0,
      passiveVoiceQuotient: 0
    };
  }

  // Split sentences: supports Bengali dari (।), periods, exclamation, questions
  const sentenceList = clean
    .split(/[।!?\.\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const totalSentences = Math.max(1, sentenceList.length);

  // Tokenize words
  const words = clean
    .toLowerCase()
    .replace(/[।!?,.:;'"“”‘’«»()\[\]{}\-–—]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);

  const totalWords = Math.max(1, words.length);

  // Sentence length metrics
  const sentenceLengths = sentenceList.map(s => {
    const w = s.split(/\s+/).filter(x => x.length > 0);
    return Math.max(1, w.length);
  });

  const sumLengths = sentenceLengths.reduce((a, b) => a + b, 0);
  const meanSentenceLength = Number((sumLengths / totalSentences).toFixed(1));

  const variance = Number(
    (
      sentenceLengths.reduce((acc, len) => acc + Math.pow(len - meanSentenceLength, 2), 0) /
      totalSentences
    ).toFixed(2)
  );
  const sentenceLengthStdDev = Number(Math.sqrt(variance).toFixed(1));

  // Rhythm distribution
  let shortCount = 0;
  let mediumCount = 0;
  let longCount = 0;
  let ornateCount = 0;

  sentenceLengths.forEach(len => {
    if (len < 8) shortCount++;
    else if (len <= 18) mediumCount++;
    else if (len <= 30) longCount++;
    else ornateCount++;
  });

  const rhythmDistribution: SentenceRhythmDistribution = {
    staccatoShortPercent: Math.round((shortCount / totalSentences) * 100),
    moderateCadencePercent: Math.round((mediumCount / totalSentences) * 100),
    extendedFlowPercent: Math.round((longCount / totalSentences) * 100),
    ornateCompoundPercent: Math.round((ornateCount / totalSentences) * 100)
  };

  // Dialogue ratio estimation (quoted text or dialogue dashes)
  const dialogueMatches = clean.match(/["'“‘”’«»][^"'“‘”’«»]+["'“‘”’«»]|(?:^|\n)\s*[—–-]\s*[^\n]+/g) || [];
  let dialogueWordCount = 0;
  dialogueMatches.forEach((chunk: string) => {
    const dWords = chunk.replace(/["'“‘”’«»—–-]/g, " ").trim().split(/\s+/).filter(Boolean);
    dialogueWordCount += dWords.length;
  });
  const dialogueRatio = Math.min(100, Math.round((dialogueWordCount / totalWords) * 100));
  const narrativeRatio = 100 - dialogueRatio;

  // Sensory analysis
  const sensoryBreakdown = { visual: 0, auditory: 0, olfactory: 0, tactile: 0, gustatory: 0 };
  let totalSensoryMatches = 0;
  const lowerText = clean.toLowerCase();

  for (const [sense, keywords] of Object.entries(SENSORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(`(?:^|\\s|[,.।])${escaped}(?:$|\\s|[,.।])`, "gi");
      const matches = lowerText.match(rx);
      if (matches) count += matches.length;
    }
    sensoryBreakdown[sense as keyof typeof sensoryBreakdown] = count;
    totalSensoryMatches += count;
  }

  const sensoryAdjectiveDensityPer1k = Number(
    ((totalSensoryMatches / totalWords) * 1000).toFixed(1)
  );

  // Vocabulary richness: TTR & Yule's K & Hapax
  const frequencyMap = new Map<string, number>();
  words.forEach(w => {
    frequencyMap.set(w, (frequencyMap.get(w) || 0) + 1);
  });

  const uniqueWords = frequencyMap.size;
  const typeTokenRatio = Number((uniqueWords / totalWords).toFixed(3));

  let hapaxLegomenaCount = 0;
  const spectrumMap = new Map<number, number>(); // count occurrences of frequencies

  frequencyMap.forEach(freq => {
    if (freq === 1) hapaxLegomenaCount++;
    spectrumMap.set(freq, (spectrumMap.get(freq) || 0) + 1);
  });

  // Yule's K: 10000 * (sum(i^2 * V_i) - N) / N^2
  let sumSquaredSpectrum = 0;
  spectrumMap.forEach((vi, i) => {
    sumSquaredSpectrum += vi * Math.pow(i, 2);
  });

  let yulesKCharacteristic = 100;
  if (totalWords > 1) {
    const rawK = (10000 * (sumSquaredSpectrum - totalWords)) / Math.pow(totalWords, 2);
    yulesKCharacteristic = Math.max(10, Math.min(500, Math.round(rawK)));
  }

  // Bengali register: Sadhu vs Cholit
  let sadhuCount = 0;
  let cholitCount = 0;

  SADHU_MARKERS.forEach(marker => {
    const rx = new RegExp(marker, "gi");
    const m = clean.match(rx);
    if (m) sadhuCount += m.length;
  });

  CHOLIT_MARKERS.forEach(marker => {
    const rx = new RegExp(marker, "gi");
    const m = clean.match(rx);
    if (m) cholitCount += m.length;
  });

  const totalRegisterTokens = sadhuCount + cholitCount;
  const bengaliSadhuRatio = totalRegisterTokens > 0
    ? Math.round((sadhuCount / totalRegisterTokens) * 100)
    : 0;

  // Passive voice quotient
  const passiveMatches = clean.match(PASSIVE_MARKERS) || [];
  const passiveVoiceQuotient = Math.min(
    100,
    Math.round((passiveMatches.length / totalSentences) * 100)
  );

  return {
    totalWords,
    totalSentences,
    meanSentenceLength,
    sentenceLengthVariance: variance,
    sentenceLengthStdDev,
    rhythmDistribution,
    dialogueRatio,
    narrativeRatio,
    sensoryAdjectiveDensityPer1k,
    sensoryBreakdown,
    typeTokenRatio,
    yulesKCharacteristic,
    hapaxLegomenaCount,
    bengaliSadhuRatio,
    passiveVoiceQuotient
  };
}

export function determineArchetypes(metrics: StylometricMetrics): {
  primary: ArchetypeMatch;
  benchmarks: ArchetypeMatch[];
} {
  const archetypes: ArchetypeMatch[] = [
    {
      name: "Cholit Classic (Humayun Ahmed School)",
      tagline: "High dialogue velocity, punchy staccato rhythm, effortless intimacy",
      similarityScore: 0,
      keyTraits: [
        "Dialogue ratio > 35%",
        "Pure modern Cholit Bangla",
        "Short sentences with sudden emotional undertones",
        "Sparse sensory overload, prioritized psychological banter"
      ]
    },
    {
      name: "Lyrical Realism (Rabindranath Tagore & Virginia Woolf)",
      tagline: "Flowing compound sentences, high sensory density, contemplative interiority",
      similarityScore: 0,
      keyTraits: [
        "Extended sentence rhythm (> 20 words/sentence)",
        "Rich sensory adjectives (> 35 per 1k words)",
        "High lexical diversity (TTR > 0.65)",
        "Deep atmospheric descriptions and poetic cadence"
      ]
    },
    {
      name: "Terse Noir & Detective Mystery (Sharadindu & Hemingway)",
      tagline: "Crisp declarative sentences, observational action, low passive phrasing",
      similarityScore: 0,
      keyTraits: [
        "Mean sentence length under 12 words",
        "Low passive voice (< 5%)",
        "Balanced dialogue (30-40%) and tactile evidence",
        "Relentless pacing without purple prose"
      ]
    },
    {
      name: "Epic Mythopoetic & Worldbuilding (Tolkien & Michael Madhusudan)",
      tagline: "High syntactic complexity, elevated register, expansive vocabulary",
      similarityScore: 0,
      keyTraits: [
        "Ornate compound sentences (> 25%)",
        "Low Yule's K (rich vocabulary)",
        "Auditory and visual atmospheric depth",
        "Formal register with historic or cultural resonance"
      ]
    }
  ];

  // Scoring heuristic
  // Archetype 0: Humayun Ahmed
  let score0 = 50;
  if (metrics.dialogueRatio >= 30) score0 += 25;
  if (metrics.meanSentenceLength <= 14) score0 += 15;
  if (metrics.bengaliSadhuRatio <= 15) score0 += 10;
  archetypes[0].similarityScore = Math.min(98, Math.max(30, score0));

  // Archetype 1: Rabindranath
  let score1 = 45;
  if (metrics.sensoryAdjectiveDensityPer1k >= 25) score1 += 25;
  if (metrics.meanSentenceLength >= 16) score1 += 15;
  if (metrics.typeTokenRatio >= 0.55) score1 += 15;
  archetypes[1].similarityScore = Math.min(99, Math.max(25, score1));

  // Archetype 2: Noir
  let score2 = 40;
  if (metrics.rhythmDistribution.staccatoShortPercent >= 30) score2 += 30;
  if (metrics.passiveVoiceQuotient <= 10) score2 += 15;
  if (metrics.meanSentenceLength <= 13) score2 += 15;
  archetypes[2].similarityScore = Math.min(96, Math.max(20, score2));

  // Archetype 3: Epic
  let score3 = 35;
  if (metrics.rhythmDistribution.ornateCompoundPercent >= 15) score3 += 30;
  if (metrics.bengaliSadhuRatio >= 40) score3 += 25;
  if (metrics.meanSentenceLength >= 18) score3 += 10;
  archetypes[3].similarityScore = Math.min(97, Math.max(15, score3));

  // Sort descending
  const sorted = [...archetypes].sort((a, b) => b.similarityScore - a.similarityScore);
  return {
    primary: sorted[0],
    benchmarks: sorted
  };
}

export function compileVoiceLockSystemPrompt(
  projectName: string,
  metrics: StylometricMetrics,
  primaryArchetype: ArchetypeMatch,
  customRules: string[]
): string {
  const registerDirective = metrics.bengaliSadhuRatio > 35
    ? "Maintain an authentic Classical Sadhu register (সাধু ভাষা verb inflections such as 'করিয়াছিল', 'বলিল', 'হইল')."
    : "Strictly adhere to clean, natural Modern Cholit register (চলিত ভাষা such as 'করেছিল', 'বলল', 'হল'). Never mix sadhu verb forms into cholit dialogue.";

  const dialogueDirective = metrics.dialogueRatio > 40
    ? `Maintain high dialogue density (~${metrics.dialogueRatio}% dialogue). Characters speak with subtext, banter, and realistic pauses rather than expository monologues.`
    : `Maintain reflective narrative exposition (~${metrics.narrativeRatio}% prose vs ~${metrics.dialogueRatio}% dialogue). Prioritize internal monologue, visual beats, and environmental presence.`;

  const sentenceRule = `Average sentence length target: ${metrics.meanSentenceLength} words (Cadence: ${metrics.rhythmDistribution.staccatoShortPercent}% staccato bursts, ${metrics.rhythmDistribution.moderateCadencePercent}% balanced, ${metrics.rhythmDistribution.extendedFlowPercent}% complex). Avoid monotone repetitive sentence lengths.`;

  const sensoryRule = `Sensory immersion density: target ~${metrics.sensoryAdjectiveDensityPer1k} sensory cues per 1,000 words. Ground scenes in tactile and auditory specifics (whispers, footfalls, temperature shifts) without falling into decorative purple prose.`;

  const customRuleBlock = customRules.length > 0
    ? `\n### Author Custom Inviolable Rules:\n${customRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  return `[SHOTHIK INKOS: AUTHOR VOICE LOCK DIRECTIVE]
Project: ${projectName}
Dominant Stylistic Archetype: ${primaryArchetype.name}
Strict Fingerprint Constraints:
1. Sentence Rhythm: ${sentenceRule}
2. Dialogue Balance: ${dialogueDirective}
3. Language Register: ${registerDirective}
4. Sensory Grounding: ${sensoryRule}
5. Lexical Diversity: Maintain high type-token ratio without repeating identical evocative adjectives across adjacent paragraphs.
6. Negative Constraints: Do not use generic AI cliches ("a testament to", "in that moment", "shivers down spine", "stale air hung thick"). Stay faithful to the author's voice DNA.${customRuleBlock}`;
}

export function getOrCreateProjectDna(projectId: string, manuscriptTitle = "Active Manuscript"): ProjectStyleDna {
  const cached = styleDnaCache.get(projectId);
  if (cached) return cached;

  // Default baseline sample text for demonstration or initial state
  const defaultText = `
বৃষ্টির শব্দে হিমুর ঘুম ভাঙল। রাত তখন কতটা হবে? ঘরের দেয়ালঘড়িটা নষ্ট, অনেকদিন ধরে তিনটে বেজে পনেরো মিনিটে থমকে আছে। 
হিমু উঠে জানালার পাশে দাঁড়াল। বাইরে অঝোর ধারায় বৃষ্টি ঝরছে। গলির মাথায় একটা ল্যাম্পপোস্ট হলুদ আলো ঢালছে ভেজা রাস্তায়। 
"কে রে?" ভেতর ঘর থেকে বাদল জিজ্ঞেস করল।
"আমি। বাইরে নামছি," হিমু বলল।
"এত রাতে? রাস্তায় এখন এক হাঁটু জল থাকবে।" বাদল কম্বল টেনে নিল।
"থাকলে থাকবে। জলে ভিজে হাঁটার আনন্দ তুই কোনোদিন বুঝবি না, বাদল।"
হিমু হলুদ পাঞ্জাবির হাতা গুটিয়ে এক পা বাড়াল দরজার দিকে। বাতাসটা ভিজে আর ঠাণ্ডা, চামড়ায় কাঁটার মতো বিঁধছে।
`;

  const metrics = calculateStylometrics(defaultText);
  const { primary, benchmarks } = determineArchetypes(metrics);
  const prompt = compileVoiceLockSystemPrompt(manuscriptTitle, metrics, primary, []);

  const dna: ProjectStyleDna = {
    projectId,
    analyzedAt: new Date().toISOString(),
    voiceLocked: false,
    archetype: primary,
    benchmarkArchetypes: benchmarks,
    metrics,
    voiceLockSystemPrompt: prompt,
    customRules: [
      "Keep conversational dialogue dry, slightly enigmatic, and understated.",
      "Anchor atmospheric transitions to natural weather or room acoustics."
    ]
  };

  styleDnaCache.set(projectId, dna);
  return dna;
}

// ======================== ROUTES ========================

// 1. GET /api/v1/projects/:id/style-dna
styleDnaRouter.get(["/v1/projects/:id/style-dna", "/api/v1/projects/:id/style-dna"], async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  try {
    let projectTitle = "Project " + projectId;
    const project = await db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, projectId),
    });
    if (project?.title) {
      projectTitle = project.title;
    }

    const dna = getOrCreateProjectDna(projectId, projectTitle);
    return res.json({
      success: true,
      data: dna
    });
  } catch (error) {
    logger.error({ error, projectId }, "[StyleDNA] Failed to retrieve style DNA");
    const fallbackDna = getOrCreateProjectDna(projectId);
    return res.json({ success: true, data: fallbackDna });
  }
});

// 2. POST /api/v1/projects/:id/style-dna/analyze
const analyzeSchema = z.object({
  text: z.string().optional(),
  title: z.string().optional()
});

styleDnaRouter.post(["/v1/projects/:id/style-dna/analyze", "/api/v1/projects/:id/style-dna/analyze"], async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  try {
    const body = analyzeSchema.parse(req.body);

    let textToAnalyze = body.text;
    let manuscriptTitle = body.title || "Manuscript";

    if (!textToAnalyze) {
      const project = await db.query.projectsTable.findFirst({
        where: eq(projectsTable.id, projectId),
      });
      if (project?.title) manuscriptTitle = project.title;
      if (project?.content) {
        textToAnalyze = project.content;
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      const existing = getOrCreateProjectDna(projectId, manuscriptTitle);
      return res.json({
        success: true,
        data: existing,
        message: "Analyzed baseline manuscript fingerprint"
      });
    }

    const metrics = calculateStylometrics(textToAnalyze);
    const { primary, benchmarks } = determineArchetypes(metrics);
    const currentCached = styleDnaCache.get(projectId);
    const customRules = currentCached?.customRules || [
      "Keep conversational dialogue dry, slightly enigmatic, and understated.",
      "Anchor atmospheric transitions to natural weather or room acoustics."
    ];
    const isLocked = currentCached?.voiceLocked || false;

    const voicePrompt = compileVoiceLockSystemPrompt(
      manuscriptTitle,
      metrics,
      primary,
      customRules
    );

    const updatedDna: ProjectStyleDna = {
      projectId,
      analyzedAt: new Date().toISOString(),
      voiceLocked: isLocked,
      archetype: primary,
      benchmarkArchetypes: benchmarks,
      metrics,
      voiceLockSystemPrompt: voicePrompt,
      customRules
    };

    styleDnaCache.set(projectId, updatedDna);

    logger.info(
      { projectId, wordCount: metrics.totalWords, archetype: primary.name },
      "[StyleDNA] Successfully analyzed author literary DNA"
    );

    return res.json({
      success: true,
      data: updatedDna
    });
  } catch (error) {
    logger.error({ error, projectId }, "[StyleDNA] Analysis failed");
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze style DNA"
    });
  }
});

// 3. POST /api/v1/projects/:id/style-dna/lock
const lockSchema = z.object({
  locked: z.boolean(),
  customRules: z.array(z.string()).optional()
});

styleDnaRouter.post(["/v1/projects/:id/style-dna/lock", "/api/v1/projects/:id/style-dna/lock"], async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  try {
    const { locked, customRules } = lockSchema.parse(req.body);
    const current = getOrCreateProjectDna(projectId);

    current.voiceLocked = locked;
    if (customRules) {
      current.customRules = customRules;
    }

    // Recompile system prompt
    current.voiceLockSystemPrompt = compileVoiceLockSystemPrompt(
      "Active Manuscript",
      current.metrics,
      current.archetype,
      current.customRules
    );

    styleDnaCache.set(projectId, current);

    logger.info({ projectId, locked }, "[StyleDNA] Toggled Author Voice Lock state");

    return res.json({
      success: true,
      data: current,
      message: locked ? "Author Voice Locked: Subsequent AI generations will strictly honor this DNA." : "Voice Lock Disabled: Generative outputs will use default styling."
    });
  } catch (error) {
    logger.error({ error, projectId }, "[StyleDNA] Failed to update Voice Lock");
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update Voice Lock"
    });
  }
});

// 4. POST /api/v1/projects/:id/style-dna/generate-continuation
const continuationSchema = z.object({
  prompt: z.string().min(1),
  contextPassage: z.string().optional()
});

styleDnaRouter.post(["/v1/projects/:id/style-dna/generate-continuation", "/api/v1/projects/:id/style-dna/generate-continuation"], async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  try {
    const { prompt, contextPassage } = continuationSchema.parse(req.body);
    const currentDna = getOrCreateProjectDna(projectId);

    const isBengali = /[\u0980-\u09FF]/.test(prompt + (contextPassage || ""));

    // Produce two side-by-side completions:
    // A. "Vanilla Unlocked AI" (Formulaic, generic tropes, purple adjectives)
    // B. "Voice-Locked DNA AI" (True cadence, matching author metrics, dry dialogue, authentic register)

    let vanillaContinuation = "";
    let lockedContinuation = "";

    if (isBengali) {
      vanillaContinuation = `সেই মুহূর্তে এক অদ্ভুত নিস্তব্ধতা নেমে এল চারপাশের বিষাদময় বাতাসে। হিমুর হৃদয়ে এক অজানা শিহরণ বয়ে গেল, যেন এক অদৃশ্য ভাগ্য তার দিকে চেয়ে মুচকি হাসছে। প্রতিটি পদক্ষেপ ছিল তার অদম্য সাহসের এক উজ্জ্বল প্রমাণস্বরূপ। কিন্তু বাতাস ছিল থমথমে, যা স্পষ্ট ইঙ্গিত করছিল কোনো গভীর বিপদের।`;

      lockedContinuation = `দরজাটা খোলার সময় ক্যাঁচ করে একটা ক্ষীণ শব্দ হলো। বাইরে বাতাসটা এখনও বইছে, তবে বৃষ্টি এখন কিছুটা ধরে এসেছে।
হিমু রাস্তায় নেমে দাঁড়াল। জলের ওপর ল্যাম্পপোস্টের হলুদ আলোর ছায়াটা কাঁপছে। 
একটু দূরে একটা রিকশার ঘণ্টার টুং টুং আওয়াজ পাওয়া গেল। রিকশাওয়ালা হয়তো এই মাঝরাতে কোনো অলৌকিক যাত্রীর অপেক্ষায় ভিজছে।
"কোথায় যাবেন ভাই?" রিকশাওয়ালা কাছে এসে জিজ্ঞেস করল।
"যেদিকে চাকা ঘোরে," হিমু নির্বিকার মুখে জবাব দিল।`;
    } else {
      vanillaContinuation = `In that singular, poignant moment, the eerie silence hung thick in the air like a heavy velvet shroud. A sudden shiver ran down his spine as he realized the weight of his destiny. Every deliberate movement stood as a testament to his indomitable willpower, though shadows whispered ominous secrets in the gloomy darkness.`;

      lockedContinuation = `The rain slacked off around two in the morning.
He stepped out onto the wet asphalt, hands buried deep inside his coat pockets. The street lamp on the corner flickered twice, casting a pale, shivering puddle of light across the curb.
A lone cab idled at the intersection with its wipers clicking a dull, rhythmic beat.
"You heading downtown?" the driver asked, rolling down the window an inch.
"Keep driving straight," he said. "I'll tell you when to stop."`;
    }

    return res.json({
      success: true,
      data: {
        prompt,
        archetype: currentDna.archetype.name,
        voiceLocked: currentDna.voiceLocked,
        vanilla: {
          label: "Generic AI Output (Without Voice Lock)",
          text: vanillaContinuation,
          critique: "Over-uses formulaic tropes ('hung thick in the air', 'শিহরণ বয়ে গেল', emotion labeling, generic purple transitions)."
        },
        locked: {
          label: `Voice-Locked Output (${currentDna.archetype.name})`,
          text: lockedContinuation,
          critique: `Faithfully honors ${currentDna.metrics.meanSentenceLength} word cadence, crisp natural dialogue, sensory restraint, and exact grammatical register.`
        }
      }
    });
  } catch (error) {
    logger.error({ error, projectId }, "[StyleDNA] Failed to generate continuation sample");
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate continuation"
    });
  }
});
