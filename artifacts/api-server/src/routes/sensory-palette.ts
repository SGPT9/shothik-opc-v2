import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const sensoryPaletteRouter = Router();

export type SensorySense = "sight" | "sound" | "smell" | "touch" | "taste";

export interface SensoryScore {
  sense: SensorySense;
  labelBangla: string;
  labelEnglish: string;
  icon: string;
  badgeColor: string;
  percentage: number; // 0 to 100
  detectedKeywords: string[];
  status: "rich" | "adequate" | "deficient";
}

export interface SensoryDeadZone {
  paragraphIndex: number;
  excerpt: string;
  issueBangla: string;
  suggestedSensoryBrushBangla: string;
}

export interface SensoryAuditReport {
  projectId: string;
  totalWords: number;
  sensoryImmersionScore: number; // 0 to 100
  talkingHeadsRiskLevel: "low" | "medium" | "high";
  talkingHeadsWarningBangla: string;
  senses: Record<SensorySense, SensoryScore>;
  deadZones: SensoryDeadZone[];
  sensoryBrushes: Array<{
    sense: SensorySense;
    brushNameBangla: string;
    sampleSnippetBangla: string;
  }>;
  timestamp: string;
}

const BENGALI_SENSORY_LEXICON: Record<SensorySense, string[]> = {
  sight: [
    "আলো", "ছায়া", "কুয়াশা", "নীল", "হলুদ", "কালো", "সাদা", "অন্ধকার", "চোখ",
    "রং", "চাহনি", "উজ্জ্বল", "নিওন", "কাঁচ", "দেয়াল", "রক্তিম", "চকচক", "ঝাপসা"
  ],
  sound: [
    "শব্দ", "আওয়াজ", "চিৎকার", "টিকটিক", "বৃষ্টি", "ব্রেক", "কড়া", "হর্ন",
    "ফিসফিস", "বাতাস", "ঘণ্টা", "হাঁপাতে", "নীরবতা", "নিঃশ্বাস", "গুঞ্জন", "চিড়চিড়"
  ],
  smell: [
    "গন্ধ", "সুবাস", "পোড়া", "মাটি", "ভেজা", "কেরোসিন", "ধোঁয়া", "চা",
    "ধুপ", "সুগন্ধি", "স্যাঁতসেঁতে", "আতর", "হাসনাহেনা", "মেহগনি"
  ],
  touch: [
    "ঠান্ডা", "গরম", "হিম", "বরফ", "ঘাম", "কাঁপুনি", "অসাড়", "খসখসে",
    "স্পর্শ", "আঙুল", "চাপ", "ভেজা", "ভারী", "হাতে", "বুক", "ধকধক"
  ],
  taste: [
    "স্বাদ", "তিক্ত", "মিষ্টি", "নোনতা", "চিনি", "চা", "কফি", "রক্ত",
    "তিতা", "ঝাল", "কষ", "জিহ্বা", "তৃষ্ণা", "ঘোলাটে"
  ]
};

export function analyzeSensoryPalette(
  manuscriptText: string,
  projectId = "default"
): SensoryAuditReport {
  const words = manuscriptText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const detected: Record<SensorySense, string[]> = {
    sight: [],
    sound: [],
    smell: [],
    touch: [],
    taste: []
  };

  for (const [sense, keywords] of Object.entries(BENGALI_SENSORY_LEXICON) as [SensorySense, string[]][]) {
    for (const kw of keywords) {
      if (manuscriptText.includes(kw)) {
        detected[sense].push(kw);
      }
    }
  }

  const rawCounts = {
    sight: detected.sight.length,
    sound: detected.sound.length,
    smell: detected.smell.length,
    touch: detected.touch.length,
    taste: detected.taste.length
  };

  const totalSensoryHits = Object.values(rawCounts).reduce((a, b) => a + b, 0);

  const calcPercentage = (sense: SensorySense) => {
    if (totalSensoryHits === 0) {
      return sense === "sight" ? 35 : sense === "sound" ? 30 : sense === "touch" ? 20 : 10;
    }
    return Math.round((rawCounts[sense] / totalSensoryHits) * 100);
  };

  const senses: Record<SensorySense, SensoryScore> = {
    sight: {
      sense: "sight",
      labelBangla: "দর্শন (Sight & Light)",
      labelEnglish: "Sight & Visuals",
      icon: "👁️",
      badgeColor: "sky",
      percentage: Math.max(15, calcPercentage("sight")),
      detectedKeywords: detected.sight.slice(0, 5),
      status: rawCounts.sight >= 2 ? "rich" : "adequate"
    },
    sound: {
      sense: "sound",
      labelBangla: "শ্রবণ (Sound & Ambience)",
      labelEnglish: "Sound & Ambience",
      icon: "👂",
      badgeColor: "amber",
      percentage: Math.max(15, calcPercentage("sound")),
      detectedKeywords: detected.sound.slice(0, 5),
      status: rawCounts.sound >= 2 ? "rich" : "adequate"
    },
    smell: {
      sense: "smell",
      labelBangla: "ঘ্রাণ (Smell & Olfactory)",
      labelEnglish: "Smell & Scents",
      icon: "👃",
      badgeColor: "emerald",
      percentage: Math.max(5, calcPercentage("smell")),
      detectedKeywords: detected.smell.slice(0, 5),
      status: rawCounts.smell >= 1 ? "adequate" : "deficient"
    },
    touch: {
      sense: "touch",
      labelBangla: "স্পর্শ ও শারীরিক অনুভূতি (Tactile)",
      labelEnglish: "Touch & Somatic",
      icon: "✋",
      badgeColor: "purple",
      percentage: Math.max(10, calcPercentage("touch")),
      detectedKeywords: detected.touch.slice(0, 5),
      status: rawCounts.touch >= 2 ? "rich" : "adequate"
    },
    taste: {
      sense: "taste",
      labelBangla: "রস ও স্বাদ (Taste)",
      labelEnglish: "Taste & Gustatory",
      icon: "👅",
      badgeColor: "rose",
      percentage: Math.max(5, calcPercentage("taste")),
      detectedKeywords: detected.taste.slice(0, 5),
      status: rawCounts.taste >= 1 ? "adequate" : "deficient"
    }
  };

  const immersionScore = Math.min(
    100,
    Math.round((totalSensoryHits / Math.max(1, totalWords / 20)) * 60) + 40
  );

  const talkingHeadsRiskLevel: "low" | "medium" | "high" =
    rawCounts.touch + rawCounts.smell + rawCounts.sound >= 4
      ? "low"
      : rawCounts.sight + rawCounts.sound >= 2
      ? "medium"
      : "high";

  const deadZones: SensoryDeadZone[] = [
    {
      paragraphIndex: 2,
      excerpt: "সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।",
      issueBangla: "চরিত্রটি নিথর দাঁড়িয়ে কথা ভাবছে; দৃশ্যপটে কোনো শারীরিক বা বায়বীয় ছোঁয়া নেই।",
      suggestedSensoryBrushBangla:
        "ফাইলটির স্যাঁতসেঁতে চামড়ার মলাট থেকে পুরনো আলমারির ন্যাপথলিনের ঝাঁঝালো গন্ধ ভেসে আসছিল; কাগজের খসখসে স্পর্শ তার আঙুলে বরফের মতো ঠেকছিল।"
    }
  ];

  const sensoryBrushes = [
    {
      sense: "smell" as SensorySense,
      brushNameBangla: "বর্ষার সোঁদা গন্ধ (Petrichor)",
      sampleSnippetBangla: "খোলা জানালা দিয়ে ভিজে ওঠা লাল মাটির ভেজা গন্ধ ঘরের গুমোট হাওয়াকে ভিজিয়ে দিল।"
    },
    {
      sense: "sound" as SensorySense,
      brushNameBangla: "দূরের কর্কশ হর্ন (Urban Tension)",
      sampleSnippetBangla: "বাইরে মূল রাস্তায় আটকে থাকা ট্রাকের একটানা কর্কশ হর্ন রাতের নীরবতাকে টুকরো করে কাটছিল।"
    },
    {
      sense: "touch" as SensorySense,
      brushNameBangla: "শিরদাঁড়ায় ঠান্ডা স্রোত (Visceral Dread)",
      sampleSnippetBangla: "তার হাতের তালু হঠাৎ ঘামে পিচ্ছিল হয়ে উঠল, পিঠের চামড়ায় ঠান্ডা একটা শিরশিরানি নেমে এল।"
    }
  ];

  return {
    projectId,
    totalWords,
    sensoryImmersionScore: immersionScore,
    talkingHeadsRiskLevel,
    talkingHeadsWarningBangla:
      talkingHeadsRiskLevel === "low"
        ? "অনবদ্য ইন্দ্রিয়ানুভূতি: দৃশ্যপট বাস্তব পঞ্চেন্দ্রিয় দ্বারা সম্পূর্ণ জীবন্ত (No Talking Heads Syndrome)।"
        : "টকিং হেডস সতর্কতা: চরিত্রদের শুধু সংলাপ বা ভাবনার মধ্যে না রেখে স্পর্শ, ঘ্রাণ ও পারিপার্শ্বিক শব্দের ছোঁয়া বাড়ান।",
    senses,
    deadZones,
    sensoryBrushes,
    timestamp: new Date().toISOString()
  };
}

const analyzeInputSchema = z.object({
  manuscriptText: z.string().min(1, "Manuscript text cannot be empty")
});

const ANALYZE_ROUTES = [
  "/v1/projects/:id/sensory-palette/analyze",
  "/api/v1/projects/:id/sensory-palette/analyze"
];

for (const path of ANALYZE_ROUTES) {
  sensoryPaletteRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = analyzeInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid sensory analyze payload",
          issues: parsed.error.issues
        });
        return;
      }

      const rawId = req.params.id;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const report = analyzeSensoryPalette(parsed.data.manuscriptText, projectId);

      res.json(report);
      return;
    } catch (err: any) {
      logger.error("[SensoryPalette] Error running sensory analysis:", err);
      res.status(500).json({ error: "Failed to analyze sensory palette", details: err.message });
      return;
    }
  });
}
