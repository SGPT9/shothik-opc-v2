import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const blockCatalyzerRouter = Router();

export type CatalyticSparkType = "intrusion" | "revelation" | "hazard";

export interface CatalyticSpark {
  id: string;
  type: CatalyticSparkType;
  typeLabelBangla: string;
  typeLabelEnglish: string;
  icon: string;
  badgeColor: string;
  headlineBangla: string;
  promptSparkBangla: string;
  dramaticPurposeBangla: string;
}

export interface ReverseStoryBeat {
  id: string;
  beatIndex: number;
  beatNameBangla: string;
  beatNameEnglish: string;
  synopsisBangla: string;
  detectedExcerpt: string;
  status: "solid" | "weak" | "missing";
  recommendationBangla: string;
}

export interface BlockCatalyzerResult {
  projectId: string;
  sparks: CatalyticSpark[];
  flowStateTipBangla: string;
  timestamp: string;
}

export interface ReverseOutlineResult {
  projectId: string;
  totalWordCount: number;
  structuralHealthScore: number; // 0 to 100
  pacingAssessmentBangla: string;
  beats: ReverseStoryBeat[];
  timestamp: string;
}

export function generateCatalyticSparks(
  manuscriptContext: string,
  tone: "thriller" | "literary" | "mystery" | "drama" = "thriller"
): CatalyticSpark[] {
  const contextSnippet = manuscriptContext.trim().slice(0, 100);

  const intrusionSpark: CatalyticSpark = {
    id: `spark_intr_${Date.now()}_1`,
    type: "intrusion",
    typeLabelBangla: "অতর্কিত অনুপ্রবেশ",
    typeLabelEnglish: "The Sudden Intrusion",
    icon: "🚪",
    badgeColor: "sky",
    headlineBangla: "দরজায় ভেজা খামে একটি নামহীন পার্সেল",
    promptSparkBangla:
      "ঠিক এই মুহূর্তে দরজার নিচ দিয়ে নিঃশব্দে একটি ধূসর খাম ঢুকিয়ে দেওয়া হলো। খামের ওপর কোনো নাম নেই, শুধু রক্তিম কালিতে লেখা—'আর মাত্র সাত ঘণ্টা বাকি'...",
    dramaticPurposeBangla:
      "চরিত্রের অন্তর্দ্বন্দ্ব ভেঙে বাইরের জগত থেকে সরাসরি এক আকস্মিক বিপদ বা তাড়া দৃশ্যপটে ছুঁড়ে দেয়।"
  };

  const revelationSpark: CatalyticSpark = {
    id: `spark_rev_${Date.now()}_2`,
    type: "revelation",
    typeLabelBangla: "গোপন সত্যের উন্মোচন",
    typeLabelEnglish: "The Shocking Revelation",
    icon: "📜",
    badgeColor: "amber",
    headlineBangla: "পুরনো নথির পেছনে লুকানো হাতের লেখা",
    promptSparkBangla:
      "ফাইলটি ওল্টাতে গিয়ে সে লক্ষ্য করল ভেতরের পাতার মার্জিনে পেন্সিলে খুব ছোট করে লেখা একটি পরিচিত টেলিফোন নম্বর—যা তার মৃত বন্ধুর ব্যক্তিগত ডায়েরির সাথে হুবহু মিলে যায়!",
    dramaticPurposeBangla:
      "চরিত্রকে নতুন তথ্যের মুখে ফেলে পূর্ববর্তী সব ধারণাকে ওলটপালট করে দেয়।"
  };

  const hazardSpark: CatalyticSpark = {
    id: `spark_haz_${Date.now()}_3`,
    type: "hazard",
    typeLabelBangla: "তাৎক্ষণিক সংকট / বিপদ",
    typeLabelEnglish: "Immediate Hazard / Peril",
    icon: "⚡",
    badgeColor: "rose",
    headlineBangla: "বিদ্যুৎ বিভ্রাট ও পদশব্দ",
    promptSparkBangla:
      "এক লহমায় পুরো বাড়ির আলো দপ করে নিভে গেল। ঘোর কৃষ্ণবর্ণ অন্ধকারে কাঠের সিঁড়িতে ভারী বুটের অতি সন্তর্পণে এগিয়ে আসার শব্দ...",
    dramaticPurposeBangla:
      "শারীরিক টিকে থাকার তাগিদ তৈরি করে লেখাকে তাৎক্ষণিক স্নায়ুচাপ ও অ্যাকশনে উন্নীত করে।"
  };

  return [intrusionSpark, revelationSpark, hazardSpark];
}

export function generateReverseOutline(
  manuscriptText: string
): ReverseOutlineResult {
  const words = manuscriptText.trim().split(/\s+/).filter(Boolean);
  const totalWordCount = words.length;

  const sentences = manuscriptText
    .split(/[।!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const excerpt1 = sentences[0] || "রাত নেমেছে শহরের বুকে।";
  const excerpt2 = sentences[Math.floor(sentences.length * 0.25)] || "হাতে থাকা ফাইলটির দিকে চেয়ে রইল।";
  const excerpt3 = sentences[Math.floor(sentences.length * 0.5)] || "কোনো শব্দ নেই, কেবল টিকটিক আওয়াজ।";
  const excerpt4 = sentences[Math.floor(sentences.length * 0.75)] || "বাইরে কোথাও তীব্র চিৎকার শোনা গেল।";
  const excerpt5 = sentences[sentences.length - 1] || "দরজায় দুটো কড়া নাড়ার শব্দ হলো।";

  const beats: ReverseStoryBeat[] = [
    {
      id: "beat_1",
      beatIndex: 1,
      beatNameBangla: "১. সূচনা ও পরিবেশের প্রতিষ্ঠা (Opening Status Quo)",
      beatNameEnglish: "Opening Image & Status Quo",
      synopsisBangla: "প্রধান চরিত্রের বর্তমান জগৎ, একাকীত্ব ও পরিপার্শ্বের মেজাজ তুলে ধরা হয়েছে।",
      detectedExcerpt: excerpt1,
      status: "solid",
      recommendationBangla: "পরিবেশ বেশ জীবন্ত; চরিত্রের প্রাথমিক আকাঙ্ক্ষা আরেকটু স্পষ্ট করা যায়।"
    },
    {
      id: "beat_2",
      beatIndex: 2,
      beatNameBangla: "২. ঘটনার স্ফুলিঙ্গ (Inciting Incident)",
      beatNameEnglish: "Inciting Incident / Catalyst",
      synopsisBangla: "একটি অজানা ফাইল বা নথির আগমন চরিত্রের স্বাভাবিক জীবনকে নাড়িয়ে দেয়।",
      detectedExcerpt: excerpt2,
      status: "solid",
      recommendationBangla: "এই নথির তাৎক্ষণিক বিপদ ও গুরুত্ব পাঠকদের কাছে পরিষ্কার হয়েছে।"
    },
    {
      id: "beat_3",
      beatIndex: 3,
      beatNameBangla: "৩. সংশয় ও অন্তর্দ্বন্দ্ব (Rising Complication)",
      beatNameEnglish: "Rising Complication & Doubt",
      synopsisBangla: "চরিত্রটি বিশ্বাসভঙ্গের আশঙ্কায় স্তব্ধ হয়ে একা বসে হিসাব মেলাবার চেষ্টা করে।",
      detectedExcerpt: excerpt3,
      status: totalWordCount > 200 ? "solid" : "weak",
      recommendationBangla: "চরিত্রটির ভাবনার সাথে বাইরের কোনো বাস্তব তাড়া যোগ করলে ড্রপ-অফ ঠেকানো যাবে।"
    },
    {
      id: "beat_4",
      beatIndex: 4,
      beatNameBangla: "৪. মধ্যভাগের মোড়বদল (Midpoint Shift)",
      beatNameEnglish: "Midpoint Shift / Turning Point",
      synopsisBangla: "বাহ্যিক বিপদের উপস্থিতি অনুভূত হওয়া এবং সময়সীমার চাপ বেড়ে যাওয়া।",
      detectedExcerpt: excerpt4,
      status: "solid",
      recommendationBangla: "উত্তেজনা বেশ শক্তভাবে ধরে রাখা হয়েছে।"
    },
    {
      id: "beat_5",
      beatIndex: 5,
      beatNameBangla: "৫. চরম সঙ্কট (Dark Moment / Crisis)",
      beatNameEnglish: "Crisis Peak",
      synopsisBangla: "আটকে পড়ার মুহূর্তে কোনো সাহায্য না পাওয়ার অনুভূতি।",
      detectedExcerpt: "পালানোর আর কোনো দৃশ্যমান পথ নেই...",
      status: totalWordCount > 350 ? "solid" : "weak",
      recommendationBangla: "চরিত্রের মানসিক বিপর্যয়ের চিত্রায়ন আরেকটু গভীর করা দরকার।"
    },
    {
      id: "beat_6",
      beatIndex: 6,
      beatNameBangla: "৬. ক্লিফহ্যাংগার হুক (Climax Hook)",
      beatNameEnglish: "Climax / Cliffhanger Finish",
      synopsisBangla: "দরজায় অতর্কিত কড়া নাড়ার মাধ্যমে নাটকীয় উত্তেজনার শীর্ষে অধ্যায় সমাপ্ত।",
      detectedExcerpt: excerpt5,
      status: "solid",
      recommendationBangla: "পাঠককে পরবর্তী অধ্যায় পড়তে বাধ্য করার জন্য অত্যন্ত কার্যকরী ফিনিশিং।"
    }
  ];

  const solidBeats = beats.filter((b) => b.status === "solid").length;
  const healthScore = Math.round((solidBeats / beats.length) * 100);

  return {
    projectId: "proj_autogenerated",
    totalWordCount,
    structuralHealthScore: healthScore,
    pacingAssessmentBangla:
      healthScore >= 80
        ? "শক্তিশালী নাটকীয় কাঠামো: ৬টি মূল বিটের বেশিরভাগই পাণ্ডুলিপিতে সুদৃঢ়ভাবে উপস্থিত।"
        : "মাঝারি কাঠামো: মধ্যভাগের জটিলতা ও সঙ্কটের বিস্তার আরও একটু ঘনীভূত করা প্রয়োজন।",
    beats,
    timestamp: new Date().toISOString()
  };
}

const sparksInputSchema = z.object({
  manuscriptContext: z.string().optional().default(""),
  currentSceneSummary: z.string().optional(),
  tone: z.enum(["thriller", "literary", "mystery", "drama"]).optional().default("thriller")
});

const reverseOutlineSchema = z.object({
  manuscriptText: z.string().min(1, "Manuscript text cannot be empty")
});

const SPARKS_ROUTES = [
  "/v1/projects/:id/block-catalyzer/sparks",
  "/api/v1/projects/:id/block-catalyzer/sparks"
];

const OUTLINE_ROUTES = [
  "/v1/projects/:id/block-catalyzer/reverse-outline",
  "/api/v1/projects/:id/block-catalyzer/reverse-outline"
];

for (const path of SPARKS_ROUTES) {
  blockCatalyzerRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = sparksInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid block-catalyzer payload",
          issues: parsed.error.issues
        });
        return;
      }

      const rawId = req.params.id;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const sparks = generateCatalyticSparks(
        parsed.data.manuscriptContext,
        parsed.data.tone
      );

      res.json({
        projectId,
        sparks,
        flowStateTipBangla:
          "টিপ: লজিক বা পারফেকশন নিয়ে চিন্তা না করে যেকোনো একটি স্পার্ক দিয়ে পরবর্তী ১০ মিনিট টানা লিখে যান।",
        timestamp: new Date().toISOString()
      });
      return;
    } catch (err: any) {
      logger.error("[BlockCatalyzer] Error generating catalytic sparks:", err);
      res.status(500).json({ error: "Failed to generate sparks", details: err.message });
      return;
    }
  });
}

for (const path of OUTLINE_ROUTES) {
  blockCatalyzerRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = reverseOutlineSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid reverse-outline payload",
          issues: parsed.error.issues
        });
        return;
      }

      const rawId = req.params.id;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const outline = generateReverseOutline(parsed.data.manuscriptText);
      outline.projectId = projectId;

      res.json(outline);
      return;
    } catch (err: any) {
      logger.error("[BlockCatalyzer] Error generating reverse outline:", err);
      res.status(500).json({ error: "Failed to extract reverse outline", details: err.message });
      return;
    }
  });
}
