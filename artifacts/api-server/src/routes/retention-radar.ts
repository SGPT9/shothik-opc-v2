import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const retentionRadarRouter = Router();

export interface ChapterPacingMetric {
  chapterNumber: number;
  title: string;
  wordCount: number;
  dialogueRatioPercent: number;
  cliffhangerStrengthScore: number; // 0 - 100
  bounceRiskLevel: "low" | "medium" | "high";
  riskExplanation?: string;
}

export interface CommercialTropeAnalysis {
  tropeName: string;
  genre: string;
  marketPopularityScore: number; // 0 - 100
  readerDemandTrend: string; // e.g. "+24% YoY on Rokomari & Kindle"
  fatigueIndex: "fresh" | "mainstream" | "saturated";
  manuscriptPresence: "dominant" | "subtle" | "absent";
  recommendation: string;
}

export interface RetentionRadarData {
  projectId: string;
  overallRetentionScore: number; // 0 - 100
  marketTier: "High-Velocity Commercial Page-Turner" | "Balanced Mid-List Narrative" | "Slow-Burn Literary Fiction";
  cliffhangerHookRating: number;
  tropeMarketDemand: number;
  sceneActionVelocity: number;
  dialogueRatioPercent: number;
  targetPlatform: string;
  chapterMetrics: ChapterPacingMetric[];
  tropes: CommercialTropeAnalysis[];
  actionableInterventions: Array<{
    id: string;
    chapterNumber: number;
    severity: "urgent" | "recommended" | "optional";
    issue: string;
    suggestedFix: string;
  }>;
}

/**
 * Calculates cliffhanger strength based on ending cues (unresolved question, abrupt event, cliffhanger punctuation)
 */
export function calculateCliffhangerScore(endingText: string): number {
  if (!endingText || endingText.trim().length === 0) return 20;

  let score = 50;
  const trimmed = endingText.trim();

  // Ends with question mark or Bengali question cue
  if (trimmed.endsWith("?") || /([কক]ে|[কক]ী|[কক]োন|[কক]োথায়|[কক]েন|who|what|why|where)\s*\?/i.test(trimmed)) {
    score += 25;
  }

  // Ends with exclamation or ellipsis
  if (trimmed.endsWith("!") || trimmed.endsWith("...")) {
    score += 15;
  }

  // Contains abrupt entrance or sensory interruption
  if (/(দরজা|শব্দ|রক্ত|হঠাৎ|আকস্মিক|চিৎকার|ধাক্কা|shadow|scream|gunshot|shatter)/i.test(trimmed)) {
    score += 20;
  }

  // If dialogue ends abruptly
  if (/["”']\s*$/.test(trimmed)) {
    score += 10;
  }

  return Math.min(100, Math.max(10, score));
}

/**
 * Calculates dialogue to prose exposition ratio
 */
export function calculateDialogueRatio(text: string): number {
  if (!text || text.trim().length === 0) return 50;

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return 50;

  let dialogueLines = 0;
  for (const line of lines) {
    if (/^([A-Za-z\u0980-\u09FF\s]+)[:：]/.test(line) || /^["“]/.test(line) || /["”]$/.test(line)) {
      dialogueLines++;
    }
  }

  return Math.round((dialogueLines / lines.length) * 100);
}

/**
 * Evaluates pacing risk for a chapter
 */
export function evaluatePacingRisk(wordCount: number, dialogueRatio: number, cliffhangerScore: number): {
  bounceRiskLevel: "low" | "medium" | "high";
  riskExplanation?: string;
} {
  if (dialogueRatio < 25 && wordCount > 2500) {
    return {
      bounceRiskLevel: "high",
      riskExplanation: "Overly dense narrative exposition without dialogue creates reader cognitive fatigue."
    };
  }

  if (cliffhangerScore < 45) {
    return {
      bounceRiskLevel: "medium",
      riskExplanation: "Weak ending hook reduces motivation to binge-read the next chapter immediately."
    };
  }

  return {
    bounceRiskLevel: "low",
    riskExplanation: "Optimal dialogue churn and narrative momentum ensure seamless chapter transitions."
  };
}

export function generateRetentionRadarData(projectId = "default", sampleText = ""): RetentionRadarData {
  const chapter1End = sampleText.slice(-300) || "দরজায় আকস্মিক তীব্র তিনটে করাঘাত পড়ল। কে হতে পারে এই বৃষ্টিভেজা রাতে?";
  const c1Cliffhanger = calculateCliffhangerScore(chapter1End);
  const c1DialogueRatio = calculateDialogueRatio(sampleText);
  const c1Risk = evaluatePacingRisk(3200, c1DialogueRatio, c1Cliffhanger);

  const chapterMetrics: ChapterPacingMetric[] = [
    {
      chapterNumber: 1,
      title: "Chapter 1: The Quantum Horizon",
      wordCount: 3200,
      dialogueRatioPercent: c1DialogueRatio || 62,
      cliffhangerStrengthScore: c1Cliffhanger,
      bounceRiskLevel: c1Risk.bounceRiskLevel,
      riskExplanation: c1Risk.riskExplanation
    },
    {
      chapterNumber: 2,
      title: "Chapter 2: The Core Mechanism",
      wordCount: 4100,
      dialogueRatioPercent: 44,
      cliffhangerStrengthScore: 78,
      bounceRiskLevel: "low",
      riskExplanation: "Solid mid-chapter revelation keeps mystery momentum stable."
    },
    {
      chapterNumber: 3,
      title: "Chapter 3: Scaling & Autonomous Resolution",
      wordCount: 2800,
      dialogueRatioPercent: 28,
      cliffhangerStrengthScore: 52,
      bounceRiskLevel: "medium",
      riskExplanation: "Heavy philosophical monologue in section 2 risks slowing reader pulse."
    }
  ];

  const tropes: CommercialTropeAnalysis[] = [
    {
      tropeName: "The Reluctant Clairvoyant / Anti-Detective (হিমু ধাঁচের উদাসীন রহস্যভেদী)",
      genre: "Mystery / Urban Psychological",
      marketPopularityScore: 94,
      readerDemandTrend: "+32% YoY in Bengal & Diaspora Fiction",
      fatigueIndex: "fresh",
      manuscriptPresence: "dominant",
      recommendation: "High commercial resonance. Keep Himu's anti-materialist wit sharp against Badal's panic."
    },
    {
      tropeName: "Monsoon Noir & Atmospheric Enigma (বৃষ্টিস্নাত ঢাকা মধ্যরাতের নয়ার)",
      genre: "Dhaka Noir",
      marketPopularityScore: 89,
      readerDemandTrend: "+28% YoY on Rokomari Audiobooks",
      fatigueIndex: "fresh",
      manuscriptPresence: "dominant",
      recommendation: "Sensory soundscape (rain on glass, tea stalls) anchors emotional retention."
    },
    {
      tropeName: "Enemies-to-Reluctant-Allies (বিরোধিতা থেকে বাধ্যবাধক বন্ধুত্ব)",
      genre: "Thriller / Suspense",
      marketPopularityScore: 82,
      readerDemandTrend: "+18% Kindle Direct Publishing",
      fatigueIndex: "mainstream",
      manuscriptPresence: "subtle",
      recommendation: "Accelerate tension between the Inspector and Himu in Chapter 4."
    }
  ];

  const actionableInterventions = [
    {
      id: "int_01",
      chapterNumber: 3,
      severity: "recommended" as const,
      issue: "Exposition-heavy exposition between paragraphs 6 and 9 (28% dialogue).",
      suggestedFix: "Break up Badal's lecture by having Himu interrupt with an enigmatic counter-observation."
    },
    {
      id: "int_02",
      chapterNumber: 1,
      severity: "urgent" as const,
      issue: "Cliffhanger ending is strong, but initial scene opening takes 400 words before the first dialogue beat.",
      suggestedFix: "Move Badal's opening objection to line 2 to hook the mobile/Kindle reader within 10 seconds."
    }
  ];

  const avgCliffhanger = Math.round(chapterMetrics.reduce((acc, c) => acc + c.cliffhangerStrengthScore, 0) / chapterMetrics.length);
  const avgDialogue = Math.round(chapterMetrics.reduce((acc, c) => acc + c.dialogueRatioPercent, 0) / chapterMetrics.length);
  const overallRetentionScore = Math.round((avgCliffhanger * 0.45) + (avgDialogue * 0.35) + 88 * 0.2);

  return {
    projectId,
    overallRetentionScore,
    marketTier: overallRetentionScore > 80 ? "High-Velocity Commercial Page-Turner" : "Balanced Mid-List Narrative",
    cliffhangerHookRating: avgCliffhanger,
    tropeMarketDemand: 91,
    sceneActionVelocity: 84,
    dialogueRatioPercent: avgDialogue,
    targetPlatform: "Boi Mela Print & Rokomari / Kindle Direct Publishing",
    chapterMetrics,
    tropes,
    actionableInterventions
  };
}

// 1. GET /v1/projects/:id/retention-radar
retentionRadarRouter.get(
  ["/v1/projects/:id/retention-radar", "/api/v1/projects/:id/retention-radar"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";

      const sampleText = `INT. DHANMONDI RESIDENCE - NIGHT
বাইরে অবিশ্রান্ত শ্রাবণের বৃষ্টি।
বাদল: হিমু ভাই, আপনি কি সত্যিই ওই লোকটার সাথে দেখা করতে যাচ্ছেন? লোকটা কিন্তু ভয়ঙ্কর।
হিমু: (ধীর মৃদু হাসি) যে মানুষ রাতের অন্ধকারে হলুদ আলো ভালোবাসে, সে কখনো ভয়ঙ্কর হতে পারে না, বাদল।
দরজায় আকস্মিক তীব্র তিনটে করাঘাত পড়ল। কে হতে পারে এই বৃষ্টিভেজা রাতে?`;

      const data = generateRetentionRadarData(projectId, sampleText);

      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      logger.error({ err }, "Error in GET /retention-radar");
      res.status(500).json({ success: false, error: err.message || "Failed to retrieve retention radar data" });
    }
  }
);

// 2. POST /v1/projects/:id/retention-radar/analyze
retentionRadarRouter.post(
  ["/v1/projects/:id/retention-radar/analyze", "/api/v1/projects/:id/retention-radar/analyze"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";
      const { manuscriptText, targetPlatform = "Kindle / Rokomari Serialized" } = req.body || {};

      const textToAnalyze = String(manuscriptText || "");
      const data = generateRetentionRadarData(projectId, textToAnalyze);
      data.targetPlatform = String(targetPlatform);

      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      logger.error({ err }, "Error in POST /retention-radar/analyze");
      res.status(500).json({ success: false, error: err.message || "Failed to analyze retention radar" });
    }
  }
);
