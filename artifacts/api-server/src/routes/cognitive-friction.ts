import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const cognitiveFrictionRouter = Router();

export type FrictionLevel = "effortless" | "moderate" | "heavy" | "tangled_crimson";

export interface AnalyzedSentenceFriction {
  index: number;
  text: string;
  wordCount: number;
  clauseCount: number;
  frictionScore: number; // 0 (effortless) to 100 (tangled crimson)
  frictionLevel: FrictionLevel;
  primaryCause: string;
  primaryCauseBn: string;
  estimatedFixationMs: number;
  regressionProbabilityPercent: number;
  streamlinedRevision: string;
}

export interface CognitiveFrictionReport {
  projectId: string;
  overallFrictionScore: number; // 0 to 100
  flowGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  verdictSummary: string;
  verdictSummaryBn: string;
  totalSentences: number;
  totalWords: number;
  distribution: {
    effortlessPercent: number;
    moderatePercent: number;
    heavyPercent: number;
    tangledPercent: number;
  };
  highestFrictionSentences: AnalyzedSentenceFriction[];
  allSentences: AnalyzedSentenceFriction[];
  timestamp: string;
}

export function analyzeCognitiveFriction(text: string, projectId: string): CognitiveFrictionReport {
  if (!text || !text.trim()) {
    return {
      projectId,
      overallFrictionScore: 10,
      flowGrade: "A+",
      verdictSummary: "Effortless reading velocity with zero syntactic bottlenecks.",
      verdictSummaryBn: "সহজবোধ্য এবং সাবলীল বাক্যগঠন। কোনো মানসিক টানাপোড়েন বা জট নেই।",
      totalSentences: 0,
      totalWords: 0,
      distribution: {
        effortlessPercent: 100,
        moderatePercent: 0,
        heavyPercent: 0,
        tangledPercent: 0
      },
      highestFrictionSentences: [],
      allSentences: [],
      timestamp: new Date().toISOString()
    };
  }

  // Split into sentences using Bengali and English sentence delimiters
  const rawSentences = text
    .split(/([।?!]+|\n+)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !/^[।?!]+$/.test(s));

  const sentences: string[] = [];
  for (const s of rawSentences) {
    if (s.length > 2) sentences.push(s);
  }

  const analyzedSentences: AnalyzedSentenceFriction[] = sentences.map((sentence, idx) => {
    const words = sentence.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Bengali and English conjunction and subordinate clause markers
    const conjunctions = (sentence.match(/এবং|কিন্তু|অথবা|যদিও|তথাপি|যেহেতু|সেহেতু|যার ফলে|ফলে|যাতে|কারণ|যেখানে|and|but|or|although|however|whereas|because|since/gi) || []).length;
    const commas = (sentence.match(/[,;—–]/g) || []).length;
    const clauseCount = Math.max(1, 1 + conjunctions + Math.floor(commas / 2));

    // Calculate syntactic cognitive friction (0 to 100)
    let score = 15;
    if (wordCount > 30) score += 40;
    else if (wordCount > 20) score += 25;
    else if (wordCount > 12) score += 10;

    score += conjunctions * 12;
    score += commas * 6;

    // Complex verbal chains in Bengali
    const compoundVerbs = (sentence.match(/করে ফেলেছিল|দাঁড়িয়ে ছিল|ভাবতে লাগল|চলে যেতে বাধ্য হলো|শুরু করেছিল/gi) || []).length;
    score += compoundVerbs * 8;

    score = Math.min(98, Math.max(8, score));

    let frictionLevel: FrictionLevel = "effortless";
    let primaryCause = "Direct syntactic structure with immediate subject-verb resolution.";
    let primaryCauseBn = "সহজ ও স্বচ্ছ বাক্যগঠন; কোনো জটিলতা নেই।";

    if (score >= 75) {
      frictionLevel = "tangled_crimson";
      primaryCause = `Overloaded syntactic maze (${wordCount} words, ${clauseCount} clauses). Reader working memory strained before predicate resolution.`;
      primaryCauseBn = `বাক্যে অতিরিক্ত উপবাক্য ও শব্দের ভার (${wordCount}টি শব্দ)। বাক্য শেষ হওয়ার আগেই পাঠকের মনোযোগের ওপর অতিরিক্ত চাপ পড়ছে।`;
    } else if (score >= 50) {
      frictionLevel = "heavy";
      primaryCause = `Dense clause stacking (${clauseCount} clauses). Requires deliberate reader focus.`;
      primaryCauseBn = `একাধিক সংযোজক ও দীর্ঘ উপবাক্য থাকায় পাঠগতি কিছুটা মন্থর হচ্ছে।`;
    } else if (score >= 30) {
      frictionLevel = "moderate";
      primaryCause = "Balanced cadence; slight cognitive resistance but standard narrative pace.";
      primaryCauseBn = "স্বাভাবিক সাহিত্যিক ভারসাম্যপূর্ণ বাক্য; পাঠগতি সুষম।";
    }

    // Streamlined de-tangled revision
    let streamlinedRevision = sentence;
    if (score >= 50) {
      // Create a punchier split version
      if (sentence.includes(" এবং ")) {
        const parts = sentence.split(" এবং ");
        streamlinedRevision = `${parts[0]}। তারপর ${parts.slice(1).join(" ")}`;
      } else if (sentence.includes(" কিন্তু ")) {
        const parts = sentence.split(" কিন্তু ");
        streamlinedRevision = `${parts[0]}। তবে ${parts.slice(1).join(" ")}`;
      } else if (sentence.includes(", ")) {
        const parts = sentence.split(", ");
        streamlinedRevision = `${parts[0]}। ${parts.slice(1).join(", ")}`;
      } else {
        streamlinedRevision = `সংক্ষিপ্ত রূপ: ${sentence.slice(0, Math.floor(sentence.length * 0.7))}।`;
      }
    }

    return {
      index: idx + 1,
      text: sentence,
      wordCount,
      clauseCount,
      frictionScore: score,
      frictionLevel,
      primaryCause,
      primaryCauseBn,
      estimatedFixationMs: Math.round(180 + wordCount * 22 + score * 3),
      regressionProbabilityPercent: Math.min(85, Math.round(score * 0.75)),
      streamlinedRevision
    };
  });

  const totalWords = analyzedSentences.reduce((acc, s) => acc + s.wordCount, 0);
  const totalSentences = analyzedSentences.length;

  const effortlessCount = analyzedSentences.filter((s) => s.frictionLevel === "effortless").length;
  const moderateCount = analyzedSentences.filter((s) => s.frictionLevel === "moderate").length;
  const heavyCount = analyzedSentences.filter((s) => s.frictionLevel === "heavy").length;
  const tangledCount = analyzedSentences.filter((s) => s.frictionLevel === "tangled_crimson").length;

  const distribution = {
    effortlessPercent: totalSentences > 0 ? Math.round((effortlessCount / totalSentences) * 100) : 100,
    moderatePercent: totalSentences > 0 ? Math.round((moderateCount / totalSentences) * 100) : 0,
    heavyPercent: totalSentences > 0 ? Math.round((heavyCount / totalSentences) * 100) : 0,
    tangledPercent: totalSentences > 0 ? Math.round((tangledCount / totalSentences) * 100) : 0
  };

  const overallFrictionScore =
    totalSentences > 0
      ? Math.round(analyzedSentences.reduce((acc, s) => acc + s.frictionScore, 0) / totalSentences)
      : 15;

  let flowGrade: "A+" | "A" | "B" | "C" | "D" | "F" = "A";
  if (overallFrictionScore <= 25) flowGrade = "A+";
  else if (overallFrictionScore <= 40) flowGrade = "A";
  else if (overallFrictionScore <= 55) flowGrade = "B";
  else if (overallFrictionScore <= 70) flowGrade = "C";
  else if (overallFrictionScore <= 85) flowGrade = "D";
  else flowGrade = "F";

  const verdictSummary =
    overallFrictionScore <= 35
      ? "Luminous reading flow. Sentences resolve cleanly with minimal working memory fatigue."
      : overallFrictionScore <= 60
      ? "Moderate cognitive load. Pacing is steady but several clause-stacked sentences create reader friction."
      : "High cognitive drag detected. Reader eye-tracking regression risk is elevated due to syntactic tangles.";

  const verdictSummaryBn =
    overallFrictionScore <= 35
      ? "চমৎকার সাবলীল পাঠগতি। বাক্যগুলো সহজেই মনে দাগ কাটে এবং কোনো মানসিক ক্লান্তি তৈরি করে না।"
      : overallFrictionScore <= 60
      ? "স্বাভাবিক পাঠপ্রবাহ, তবে কিছু দীর্ঘ ও জটিল বাক্যে যতিচিহ্ন ও বাক্য বিভাজনের প্রয়োজন রয়েছে।"
      : "উচ্চ মানসিক চাপ ও পাঠ-বাধা শনাক্ত হয়েছে। পাঠকের দৃষ্টি আটকে যাওয়ার ঝুঁকি বেশি।";

  const highestFrictionSentences = [...analyzedSentences]
    .sort((a, b) => b.frictionScore - a.frictionScore)
    .slice(0, 5);

  return {
    projectId,
    overallFrictionScore,
    flowGrade,
    verdictSummary,
    verdictSummaryBn,
    totalSentences,
    totalWords,
    distribution,
    highestFrictionSentences,
    allSentences: analyzedSentences,
    timestamp: new Date().toISOString()
  };
}

const HEATMAP_ROUTES = [
  "/v1/projects/:projectId/cognitive-friction/heatmap",
  "/api/v1/projects/:projectId/cognitive-friction/heatmap"
];

for (const path of HEATMAP_ROUTES) {
  cognitiveFrictionRouter.get(path, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const defaultProse = `বৃষ্টির শব্দে চারপাশ ডুবে গেল। সে চুপচাপ দাঁড়িয়ে রইল, কোনো কথা বলল না।
রাত তখন অনেক গভীর এবং বাতাসে এমন এক অদ্ভুত ভেজা গন্ধ ছিল যা তাকে বহু বছর আগের সেই ঝড়ের রাতের কথা মনে করিয়ে দিচ্ছিল, যে রাতে তার সব কিছু হারিয়ে গিয়েছিল।
সে জানত, কাল ভোরের আলো ফুটলে এই ঘরের আর কোনো চিহ্ন অবশিষ্ট থাকবে না।`;

      const report = analyzeCognitiveFriction(defaultProse, projectId);
      res.status(200).json(report);
      return;
    } catch (err: any) {
      logger.error("[CognitiveFriction] Error generating friction heatmap:", err);
      res.status(500).json({ error: "Failed to generate cognitive friction heatmap", details: err.message });
      return;
    }
  });
}

const analyzeSchema = z.object({
  text: z.string().min(1)
});

const ANALYZE_ROUTES = [
  "/v1/projects/:projectId/cognitive-friction/analyze",
  "/api/v1/projects/:projectId/cognitive-friction/analyze"
];

for (const path of ANALYZE_ROUTES) {
  cognitiveFrictionRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid analyze payload", issues: parsed.error.issues });
        return;
      }

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const report = analyzeCognitiveFriction(parsed.data.text, projectId);
      res.status(200).json(report);
      return;
    } catch (err: any) {
      logger.error("[CognitiveFriction] Error analyzing text friction:", err);
      res.status(500).json({ error: "Failed to analyze cognitive friction", details: err.message });
      return;
    }
  });
}

export default cognitiveFrictionRouter;
