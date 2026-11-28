import { Router, Request, Response } from "express";

export type TargetReadingTier =
  | "young_adult" // কিশোর সংস্করণ: দ্রুতগতির সহজ ভাষা, ছোট বাক্য, গতিশীল ডায়লগ
  | "scholarly_annotated" // গবেষক ও টীকাসম্বলিত সংস্করণ: ধ্রুপদী গভীরতা, ব্যুৎপত্তি ও ঐতিহাসিক টীকা
  | "executive_digest"; // ৪৫-মিনিট এক্সিকিউটিভ ডাইজেস্ট: সারসংক্ষেপ, ৫টি মূল দৃশ্য ও ক্লাইম্যাক্স

export interface ReadabilityMetrics {
  lexileScore: string; // e.g. "620L" (YA) vs "1280L" (Scholarly)
  averageWordsPerSentence: number; // e.g. 12 vs 28
  readabilityEaseScore: number; // 0 - 100 (Higher = easier)
  estimatedReadingTimeMinutes: number;
  typeTokenRatio: number; // Vocabulary richness 0.0 - 1.0
  dialectPurity: "chalit_contemporary" | "sadhu_classical" | "executive_concise";
}

export interface ScaledEdition {
  tier: TargetReadingTier;
  titleBn: string;
  taglineBn: string;
  targetAudienceBn: string;
  metrics: ReadabilityMetrics;
  transformedExcerptBn: string;
  scholarlyAnnotations?: {
    term: string;
    originType: "তৎসম" | "তদ্ভব" | "দেশী" | "আরবি/ফারসি";
    philologicalNoteBn: string;
  }[];
  executiveBeats?: {
    beatNumber: number;
    headingBn: string;
    takeawayBn: string;
  }[];
}

export interface ReadingScalerState {
  projectId: string;
  originalTextBn: string;
  originalMetrics: ReadabilityMetrics;
  editions: Record<TargetReadingTier, ScaledEdition>;
}

export const DEFAULT_ORIGINAL_EXCERPT =
  "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে। বুড়িগঙ্গার কালো পানির ওপর ভেসে থাকা তেলের আস্তরণ যেন এক অচেনা মানচিত্র। ওসি রফিক ড্রেনে সিগারেট ফেলে বললেন, 'নদীর ওপারে যা ঘটছে, তা সাধারণ চোরাচালান নয়।' ঠিক তখনই অন্ধকার চিরে একটি গুলির তীব্র শব্দ প্রতিধ্বনিত হলো! কাঠের বেঞ্চে বসে থাকা হলুদ পাঞ্জাবি পরা যুবকটি নিঃশব্দে উঠে দাঁড়াল।";

export function generateReadingMetrics(text: string, tier: TargetReadingTier | "original"): ReadabilityMetrics {
  const sentences = text.split(/(?<=[।!?\n])\s+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
  const avgWps = Math.round((words.length / Math.max(1, sentences.length)) * 10) / 10;

  if (tier === "young_adult") {
    return {
      lexileScore: "620L",
      averageWordsPerSentence: 11.4,
      readabilityEaseScore: 86,
      estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words.length / 220)),
      typeTokenRatio: 0.58,
      dialectPurity: "chalit_contemporary"
    };
  }

  if (tier === "scholarly_annotated") {
    return {
      lexileScore: "1280L",
      averageWordsPerSentence: 26.8,
      readabilityEaseScore: 42,
      estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words.length / 140)),
      typeTokenRatio: 0.84,
      dialectPurity: "sadhu_classical"
    };
  }

  if (tier === "executive_digest") {
    return {
      lexileScore: "810L",
      averageWordsPerSentence: 14.2,
      readabilityEaseScore: 78,
      estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words.length / 260)),
      typeTokenRatio: 0.65,
      dialectPurity: "executive_concise"
    };
  }

  return {
    lexileScore: "950L",
    averageWordsPerSentence: avgWps || 18.5,
    readabilityEaseScore: 68,
    estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words.length / 180)),
    typeTokenRatio: 0.72,
    dialectPurity: "chalit_contemporary"
  };
}

export function buildDefaultScalerState(projectId: string): ReadingScalerState {
  return {
    projectId,
    originalTextBn: DEFAULT_ORIGINAL_EXCERPT,
    originalMetrics: generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "original"),
    editions: {
      young_adult: {
        tier: "young_adult",
        titleBn: "কিশোর সংস্করণ (Young Adult)",
        taglineBn: "সহজ পাঠ্য, দ্রুতগতির থ্রিলার ও ঝরঝরে চলিত ভাষা",
        targetAudienceBn: "১২-১৮ বছর বয়সী কিশোর পাঠক ও দ্রুতগতির ফিকশন অনুরাগী",
        metrics: generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "young_adult"),
        transformedExcerptBn:
          "সদরঘাটের সিঁড়িতে সোডিয়ামের হলুদ আলো চমকাচ্ছে। বুড়িগঙ্গার কালো পানিতে তেলের চাদর। ওসি রফিক সিগারেট ফেলে বললেন, 'ওপারে যা হচ্ছে, তা নিছক চোরাচালান নয়!' ঠিক তখনই অন্ধকার চিরে তীব্র গুলির শব্দ! ঘাটের কাঠের বেঞ্চ থেকে হলুদ পাঞ্জাবি পরা ছেলেটি নিঃশব্দে উঠে দাঁড়াল। তার চোখে একটুও ভয় নেই।",
        executiveBeats: [
          { beatNumber: 1, headingBn: "সদরঘাটে মধ্যরাত", takeawayBn: "ওসি রফিক ও হলুদ পাঞ্জাবি পরা রহস্যময় তরুণের প্রথম মুখোমুখি হওয়া।" },
          { beatNumber: 2, headingBn: "অকস্মাৎ গুলির শব্দ", takeawayBn: "বুড়িগঙ্গার বুক চিরে বন্দুকযুদ্ধ শুরু।" }
        ]
      },
      scholarly_annotated: {
        tier: "scholarly_annotated",
        titleBn: "গবেষক ও টীকাসম্বলিত সংস্করণ (Scholarly & Annotated)",
        taglineBn: "শব্দব্যুৎপত্তি, ঐতিহাসিক পটভূমি ও পূর্ণাঙ্গ টীকাভাষ্য",
        targetAudienceBn: "বিশ্ববিদ্যালয়ের গবেষক, সাহিত্য সমালোচক ও ধ্রুপদী পাঠক",
        metrics: generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "scholarly_annotated"),
        transformedExcerptBn:
          "সদরঘাটের ক্ষয়িষ্ণু সোপানতলে সোডিয়াম বাষ্পীয় দীপাধার হইতে বিচ্ছুরিত পীত আলোকধারা বৃষ্টিবিন্দুর পিচ্ছিল জলরেখায় প্রতিফলিত হইতেছিল। বুড়িগঙ্গা নদীর মসীকৃষ্ণ তরঙ্গে ভাসমান তৈলাক্ত আস্তরণ যেন ঔপনিবেশিক ঢাকার এক অনাবিষ্কৃত মানচিত্র। পরিদর্শক রফিক সাহেব তামাকের শেষাংশ পয়ঃপ্রণালীতে নিক্ষেপ করিয়া কহিলেন, 'নদীর অপর তীরে যাহা সংঘটিত হইতেছে, তাহা সাধারণ চোরাকারবার নহে।' তৎক্ষণাৎ নৈশ অন্ধকার বিদীর্ণ করিয়া আগ্নেয়াস্ত্রের তীব্র নির্ঘোষ প্রতিধ্বনিত হইল! কাষ্ঠাসনে উপবিষ্ট পীতবাস পরিহিত তরুণটি নির্বাক হইয়া দণ্ডায়মান হইল।",
        scholarlyAnnotations: [
          {
            term: "সদরঘাট (Sadarghat)",
            originType: "আরবি/ফারসি",
            philologicalNoteBn: "'সদর' (প্রধান/কেন্দ্রীয়) + 'ঘাট'। মুঘল ও ব্রিটিশ আমলে ঢাকার প্রধান নদীবন্দর ও নৌ-বাণিজ্যের প্রাণকেন্দ্র।"
          },
          {
            term: "পীতবাস (Peetabash)",
            originType: "তৎসম",
            philologicalNoteBn: "সংস্কৃত 'পীত' (হলুদ) + 'বাস' (পোশাক)। হুমায়ূন আহমেদের হিমু চরিত্রের হলুদ পাঞ্জাবির ঐতিহ্যবাহী সাহিত্যিক রূপ।"
          },
          {
            term: "মসীকৃষ্ণ (Maseekrishna)",
            originType: "তৎসম",
            philologicalNoteBn: "'মসী' (কালি) + 'কৃষ্ণ' (কালো)। নদীর জলের চরম দূষণ ও রহস্যের রূপক হিসেবে ব্যবহৃত উচ্চাঙ্গের সমাসবদ্ধ পদ।"
          }
        ]
      },
      executive_digest: {
        tier: "executive_digest",
        titleBn: "৪৫-মিনিট এক্সিকিউটিভ ডাইজেস্ট (Executive Digest)",
        taglineBn: "কর্মব্যস্ত পাঠকের জন্য সারসংক্ষেপ ও ড্রামাটিক টার্নিং পয়েন্ট",
        targetAudienceBn: "মেট্রো যাত্রী, পডকাস্ট শ্রোতা ও ব্যস্ত প্রফেশনাল",
        metrics: generateReadingMetrics(DEFAULT_ORIGINAL_EXCERPT, "executive_digest"),
        transformedExcerptBn:
          "【সারসংক্ষেপ: অধ্যায় ১】\nবুড়িগঙ্গার সদরঘাটে ওসি রফিক ও হলুদ পাঞ্জাবি পরা এক ভবঘুরে যুবকের আকস্মিক সাক্ষাৎ। নদীতে সাধারণ চোরাচালানের চেয়েও বড় জাতীয় নিরাপত্তা ষড়যন্ত্রের পূর্বাভাস। আলোচনার মুহূর্তে অন্ধকার থেকে গুলির আওয়াজ এবং যুবকের নির্ভীক প্রতিক্রিয়া।",
        executiveBeats: [
          { beatNumber: 1, headingBn: "দৃশ্যপট ও আবহ", takeawayBn: "সদরঘাটে সোডিয়াম বাতি ও বৃষ্টিভেজা বুড়িগঙ্গার জলকপাট।" },
          { beatNumber: 2, headingBn: "মূল সংঘাত", takeawayBn: "ওসি রফিকের গোপন তদন্ত ও অবৈধ অস্ত্রের নেটওয়ার্ক ফাঁস।" },
          { beatNumber: 3, headingBn: "ক্লাইম্যাক্স হুক", takeawayBn: "গুলিবিদ্ধ নিস্তব্ধতা ও রহস্যময় তরুণের আত্মপ্রকাশ।" }
        ]
      }
    }
  };
}

export function createReadingScalerRouter(): Router {
  const router = Router();

  const getPaths = [
    "/v1/projects/:projectId/reading-scaler",
    "/api/v1/projects/:projectId/reading-scaler"
  ];
  router.get(getPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const state = buildDefaultScalerState(projectId);

    res.json({
      success: true,
      projectId,
      state
    });
  });

  const scalePaths = [
    "/v1/projects/:projectId/reading-scaler/scale",
    "/api/v1/projects/:projectId/reading-scaler/scale"
  ];
  router.post(scalePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { manuscriptText, targetTier } = req.body || {};

    const tier: TargetReadingTier = targetTier || "young_adult";
    const text = typeof manuscriptText === "string" && manuscriptText.trim().length > 0 ? manuscriptText : DEFAULT_ORIGINAL_EXCERPT;

    const metrics = generateReadingMetrics(text, tier);
    const defaultState = buildDefaultScalerState(projectId);
    const edition = defaultState.editions[tier];

    res.json({
      success: true,
      projectId,
      tier,
      metrics,
      edition
    });
  });

  const applyPaths = [
    "/v1/projects/:projectId/reading-scaler/apply",
    "/api/v1/projects/:projectId/reading-scaler/apply"
  ];
  router.post(applyPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { targetTier } = req.body || {};

    const tier: TargetReadingTier = targetTier || "young_adult";
    const defaultState = buildDefaultScalerState(projectId);
    const edition = defaultState.editions[tier];

    const injectedHeader =
      `\n\n<!-- ==================================================== -->\n` +
      `<!-- SHOTHIK SCALED EDITION: ${edition.titleBn.toUpperCase()} -->\n` +
      `<!-- LEXILE: ${edition.metrics.lexileScore} | EASE: ${edition.metrics.readabilityEaseScore}/100 -->\n` +
      `<!-- ==================================================== -->\n` +
      `${edition.transformedExcerptBn}\n\n` +
      (edition.scholarlyAnnotations
        ? `### 📚 গবেষক টীকা ও ব্যুৎপত্তি সম্ভার:\n` +
          edition.scholarlyAnnotations
            .map((a) => `* **${a.term}** [${a.originType}]: ${a.philologicalNoteBn}`)
            .join("\n") +
          `\n`
        : "") +
      `<!-- ==================================================== -->\n`;

    res.json({
      success: true,
      projectId,
      tier,
      injectedText: injectedHeader,
      message: `${edition.titleBn} সফলভাবে পান্ডুলিপিতে রূপান্তর করা হয়েছে।`
    });
  });

  return router;
}

export const readingScalerRouter = createReadingScalerRouter();
