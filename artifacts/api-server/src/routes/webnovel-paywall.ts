import { Router, Request, Response } from "express";

export interface CliffhangerHook {
  sentenceIndex: number;
  sentenceText: string;
  hookType: "abrupt_discovery" | "deadly_peril" | "secret_revelation" | "urgent_dilemma" | "unanswered_question";
  hookTypeLabelBn: string;
  tensionScore: number; // 0 - 100
  paywallConversionProbability: number; // 0 - 100%
  recommendedCutPosition: "immediately_before_resolution" | "mid_sentence_gasp" | "chapter_tail";
}

export interface SerializedChapterSlice {
  chapterNumber: number;
  titleBn: string;
  wordCount: number;
  accessTier: "free_preview" | "premium_locked" | "vip_patron";
  unlockCostCoins: number;
  unlockCostBdt: number;
  cliffhangerHook: CliffhangerHook;
  freePreviewCutoffPercent: number; // e.g. 60%
  freePreviewText: string;
  lockedPremiumText: string;
}

export interface WebnovelMonetizationPlan {
  projectId: string;
  seriesTitleBn: string;
  monetizationModel: "freemium_bKash_micro_unlock" | "subscription_pass" | "coin_bundle";
  freeChapterCount: number;
  totalChapters: number;
  averageUnlockCostBdt: number;
  estimatedUnlockConversionRate: number; // e.g. 38.5%
  projectedArpuBdt: number;
  chapters: SerializedChapterSlice[];
}

export function detectCliffhangerHooks(text: string): CliffhangerHook[] {
  const sentences = text
    .split(/(?<=[।!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const hooks: CliffhangerHook[] = [];

  // Keywords indicating dramatic suspense in Bengali prose
  const suspenseIndicators = [
    { regex: /দরজা|হঠাৎ|বিদ্যুৎ|শব্দ|রক্ত|চমকে|স্থির|অন্ধকার/i, type: "abrupt_discovery", label: "আকস্মিক আবিষ্কার", score: 92 },
    { regex: /বন্দুক|পিস্তল|গুলি|খুন|মৃত্যু|ছুরি|বিপদ|ফাঁদ/i, type: "deadly_peril", label: "মারাত্মক সংকট ও বিপদ", score: 95 },
    { regex: /সত্য|রহস্য|চিঠি|দলিল|পরিচয়|আসল|প্রতারণা/i, type: "secret_revelation", label: "গোপন রহস্য উন্মোচন", score: 88 },
    { regex: /কি করবেন|কোথায়|কে|কেন|সম্ভব/i, type: "unanswered_question", label: "অনুত্থিত প্রশ্ন ও কৌতূহল", score: 84 }
  ];

  sentences.forEach((sentence, idx) => {
    for (const indicator of suspenseIndicators) {
      if (indicator.regex.test(sentence)) {
        hooks.push({
          sentenceIndex: idx,
          sentenceText: sentence,
          hookType: indicator.type as CliffhangerHook["hookType"],
          hookTypeLabelBn: indicator.label,
          tensionScore: indicator.score,
          paywallConversionProbability: Math.min(98, indicator.score - 5 + Math.floor(Math.random() * 8)),
          recommendedCutPosition: "immediately_before_resolution"
        });
        break;
      }
    }
  });

  if (hooks.length === 0) {
    hooks.push({
      sentenceIndex: Math.max(0, sentences.length - 1),
      sentenceText: sentences[sentences.length - 1] || "অন্ধকার নেমে আসতেই নদীর ওপার থেকে ভেসে এল সতর্ক বাঁশির তীব্র সুর...",
      hookType: "abrupt_discovery",
      hookTypeLabelBn: "আকস্মিক বাঁশির সুর",
      tensionScore: 88,
      paywallConversionProbability: 82,
      recommendedCutPosition: "chapter_tail"
    });
  }

  return hooks.sort((a, b) => b.tensionScore - a.tensionScore);
}

export function sliceChapterAtCliffhanger(
  text: string,
  chapterNum: number = 3,
  titleBn: string = "বুড়িগঙ্গার তীরে শেষ প্রহর",
  unlockCostBdt: number = 15
): SerializedChapterSlice {
  const hooks = detectCliffhangerHooks(text);
  const bestHook = hooks[0];

  const sentences = text.split(/(?<=[।!?\n])\s+/).filter((s) => s.trim().length > 0);
  const cutIndex = bestHook ? Math.min(bestHook.sentenceIndex + 1, sentences.length - 1) : Math.floor(sentences.length * 0.65);

  const freePreviewText = sentences.slice(0, cutIndex).join(" ");
  const lockedPremiumText = sentences.slice(cutIndex).join(" ");

  return {
    chapterNumber: chapterNum,
    titleBn,
    wordCount: text.split(/\s+/).length,
    accessTier: chapterNum <= 2 ? "free_preview" : "premium_locked",
    unlockCostCoins: 5,
    unlockCostBdt: unlockCostBdt,
    cliffhangerHook: bestHook,
    freePreviewCutoffPercent: Math.round((cutIndex / Math.max(1, sentences.length)) * 100),
    freePreviewText,
    lockedPremiumText: lockedPremiumText || "রহস্যময় লোকটি এক পা এগিয়ে এল। তার হাতে থাকা ধাতব বস্তুটি চাঁদের আলোয় চকচক করে উঠল..."
  };
}

export function buildDefaultMonetizationPlan(projectId: string = "proj_demo_bengali"): WebnovelMonetizationPlan {
  const sampleProse = "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে। বুড়িগঙ্গার কালো পানির ওপর ভেসে থাকা তেলের আস্তরণ যেন এক অচেনা মানচিত্র। ওসি রফিক ড্রেনে সিগারেট ফেলে বললেন, 'নদীর ওপারে যা ঘটছে, তা সাধারণ চোরাচালান নয়।' ঠিক তখনই অন্ধকার চিরে একটি গুলির তীব্র শব্দ প্রতিধ্বনিত হলো! কাঠের বেঞ্চে বসে থাকা হলুদ পাঞ্জাবি পরা যুবকটি নিঃশব্দে উঠে দাঁড়াল। তার চোখে তখন কোনো ভয় ছিল না, ছিল অচেনা এক প্রশান্তি।";

  const chapter1 = sliceChapterAtCliffhanger("প্রথম অধ্যায়: সদরঘাটে মধ্যরাতের কুয়াশা ও রহস্যময় যুবকের আগমন। নদীর ধারে সোডিয়াম বাতির নিচে দাঁড়িয়ে থাকা এক উদাসীন পথিক।", 1, "অধ্যায় ১: সদরঘাটে কুয়াশা", 0);
  const chapter2 = sliceChapterAtCliffhanger("দ্বিতীয় অধ্যায়: ওসি রফিকের জেরা ও তিন নম্বর পন্টুনের লাশ। বুড়িগঙ্গার জলে ভেসে ওঠা নামহীন যুবকের পকেটে পাওয়া গেল একটি অদ্ভুত চিরকুট।", 2, "অধ্যায় ২: পন্টুনের মরদেহ", 0);
  const chapter3 = sliceChapterAtCliffhanger(sampleProse, 3, "অধ্যায় ৩: বুড়িগঙ্গার তীরে শেষ প্রহর", 15);

  return {
    projectId,
    seriesTitleBn: "অনন্ত নক্ষত্রবীথি",
    monetizationModel: "freemium_bKash_micro_unlock",
    freeChapterCount: 2,
    totalChapters: 12,
    averageUnlockCostBdt: 15,
    estimatedUnlockConversionRate: 41.8,
    projectedArpuBdt: 150,
    chapters: [chapter1, chapter2, chapter3]
  };
}

export function createWebnovelPaywallRouter(): Router {
  const router = Router();

  const statePaths = [
    "/v1/projects/:projectId/webnovel-paywall",
    "/api/v1/projects/:projectId/webnovel-paywall"
  ];
  router.get(statePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const plan = buildDefaultMonetizationPlan(projectId);

    res.json({
      success: true,
      projectId,
      plan
    });
  });

  const auditPaths = [
    "/v1/projects/:projectId/webnovel-paywall/audit",
    "/api/v1/projects/:projectId/webnovel-paywall/audit"
  ];
  router.post(auditPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { manuscriptText, chapterNumber, unlockCostBdt } = req.body || {};

    const slice = sliceChapterAtCliffhanger(
      manuscriptText || "হঠাৎ অন্ধকার চিরে একটি গুলির তীব্র শব্দ প্রতিধ্বনিত হলো!",
      Number(chapterNumber) || 3,
      "অধ্যায় ৩: বুড়িগঙ্গার তীরে শেষ প্রহর",
      Number(unlockCostBdt) || 15
    );

    res.json({
      success: true,
      projectId,
      slice,
      hookCount: 1,
      estimatedConversion: slice.cliffhangerHook.paywallConversionProbability
    });
  });

  const slicePaths = [
    "/v1/projects/:projectId/webnovel-paywall/slice",
    "/api/v1/projects/:projectId/webnovel-paywall/slice"
  ];
  router.post(slicePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { manuscriptText, cutPercent } = req.body || {};

    const sentences = (manuscriptText || "").split(/(?<=[।!?\n])\s+/).filter((s: string) => s.trim().length > 0);
    const percent = Number(cutPercent) || 60;
    const cutIndex = Math.max(1, Math.floor((sentences.length * percent) / 100));

    const preview = sentences.slice(0, cutIndex).join(" ");
    const locked = sentences.slice(cutIndex).join(" ");

    res.json({
      success: true,
      projectId,
      cutPercent: percent,
      previewText: preview,
      lockedText: locked
    });
  });

  const applyPaths = [
    "/v1/projects/:projectId/webnovel-paywall/apply",
    "/api/v1/projects/:projectId/webnovel-paywall/apply"
  ];
  router.post(applyPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { chapterNumber, unlockCostBdt } = req.body || {};

    const cost = Number(unlockCostBdt) || 15;
    const chNum = Number(chapterNumber) || 3;

    const paywallBanner =
      `\n\n<!-- ========================================== -->\n` +
      `<!-- SHOTHIK WEBNOVEL PAYWALL GATE (CHAPTER ${chNum}) -->\n` +
      `<!-- ========================================== -->\n` +
      `<div class="shothik-paywall-gate" style="margin: 24px 0; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 1px solid #6366f1; text-align: center; color: #fff;">\n` +
      `  <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #f59e0b;">🔒 পরবর্তী অংশ পড়তে আনলক করুন</h4>\n` +
      `  <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 14px;">ক্লাইম্যাক্সের তীব্র রহস্য উদঘাটন করতে এখনই ১-ট্যাপে বিকাশ বা নগদ দিয়ে চ্যাপ্টারটি আনলক করুন।</p>\n` +
      `  <button style="background: #e11d48; color: #fff; font-weight: bold; padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">\n` +
      `    ⚡ বিকাশ / নগদ দিয়ে ৳${cost} এ আনলক করুন\n` +
      `  </button>\n` +
      `</div>\n` +
      `<!-- ========================================== -->\n`;

    res.json({
      success: true,
      projectId,
      paywallBanner,
      message: "ক্লিফহ্যাঙ্গার পেওয়াল ব্যানার সফলভাবে তৈরি হয়েছে।"
    });
  });

  return router;
}

export const webnovelPaywallRouter = createWebnovelPaywallRouter();
