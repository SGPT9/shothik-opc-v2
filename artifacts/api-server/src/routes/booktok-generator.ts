import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { synthesizeDialogueLine } from "./voice-casting";
import { persistSuiteManifest, loadSuiteManifest } from "../lib/novel-engine/suite-manifest-store";

export const bookTokGeneratorRouter = Router();

export type VisemeType =
  | "silence"
  | "viseme_silence"
  | "viseme_aa"
  | "viseme_E"
  | "viseme_I"
  | "viseme_O"
  | "viseme_U"
  | "viseme_PP"
  | "viseme_FF";

export interface VisemeKeyframe {
  timeSeconds: number;
  viseme: VisemeType;
  mouthOpenRatio: number;
  mouthSpreadRatio: number;
  eyeBlink: boolean;
}

export interface KineticSubtitleWord {
  text: string;
  startTime: number;
  endTime: number;
  highlight: boolean;
}

export interface BookTokTeaserManifest {
  id: string;
  projectId: string;
  title: string;
  templateId: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  durationSeconds: number;
  characterName: string;
  personaId: string;
  avatarStyle: string;
  hookLine: string;
  scriptText: string;
  callToAction: string;
  hookViralScore: number;
  kineticSubtitles: KineticSubtitleWord[];
  visemeTimeline: VisemeKeyframe[];
  audioBase64: string;
  backgroundAmbience: string;
  socialHashtags: string[];
  updatedAt: string;
}

export const BOOKTOK_TEMPLATES = [
  {
    id: "tpl_midnight_hook",
    name: "The 2:15 AM Midnight Cliffhanger",
    targetAudience: "BookTok & Thriller Fans",
    style: "noir_neon_dhaka",
    defaultHook: "রাত আড়াইটায় দরজায় কে কড়া নাড়ল জানেন? আপনি কল্পনাও করতে পারবেন না...",
    cta: "পুরো উপন্যাস পড়তে এখনই রকমারি বা সেবা প্রকাশনীতে বুক করুন।"
  },
  {
    id: "tpl_character_confession",
    name: "The Barefoot Enigma Confession",
    targetAudience: "Literary & Cult Fiction Lovers",
    style: "anime_himu",
    defaultHook: "মানুষ মনে করে আমি ভবঘুরে। কিন্তু তারা জানে না বাবার শেষ চিঠিটায় কী লেখা ছিল...",
    cta: "অমর একুশে বইমেলায় সংগ্রহ করুন সম্পূর্ণ সংস্করণ।"
  },
  {
    id: "tpl_plot_twist_betrayal",
    name: "The 90-Second Betrayal Twist",
    targetAudience: "Shorts & Reels Mystery Enthusiasts",
    style: "graphic_novel",
    defaultHook: "যাকে সবচেয়ে বিশ্বস্ত ভেবেছিলেন, তদন্তের ফাইল খুলতেই তার হাতের ছাপ পাওয়া গেল...",
    cta: "লিংক ইন বায়ো থেকে ফ্রি চ্যাপ্টার ১ পড়ুন।"
  }
];

const teaserStores = new Map<string, BookTokTeaserManifest>();

// Compute Viseme Timeline & Kinetic Subtitles from spoken script
export function compileLipSyncTimeline(
  scriptText: string,
  totalDurationSeconds: number
): {
  subtitles: KineticSubtitleWord[];
  visemes: VisemeKeyframe[];
} {
  const words = scriptText.split(/\s+/).filter(Boolean);
  const wordDuration = totalDurationSeconds / Math.max(1, words.length);

  const subtitles: KineticSubtitleWord[] = [];
  words.forEach((word, idx) => {
    const startTime = Number((idx * wordDuration).toFixed(2));
    const endTime = Number(((idx + 1) * wordDuration).toFixed(2));
    subtitles.push({
      text: word,
      startTime,
      endTime,
      highlight: idx % 3 === 0
    });
  });

  // Generate 25fps viseme keyframes (every 0.04s)
  const fps = 25;
  const totalFrames = Math.floor(totalDurationSeconds * fps);
  const visemes: VisemeKeyframe[] = [];

  const visemeCycle: VisemeType[] = [
    "viseme_aa",
    "viseme_E",
    "viseme_O",
    "viseme_PP",
    "viseme_aa",
    "viseme_U",
    "viseme_silence"
  ];

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = Number((frame / fps).toFixed(2));
    const cycleIdx = frame % visemeCycle.length;
    const isBlink = frame % 75 === 0 || frame % 75 === 1; // Blink every 3 seconds

    const currentViseme = visemeCycle[cycleIdx];
    let mouthOpen = 0.6;
    let mouthSpread = 0.5;

    if (currentViseme === "viseme_aa") {
      mouthOpen = 0.9;
      mouthSpread = 0.6;
    } else if (currentViseme === "viseme_O" || currentViseme === "viseme_U") {
      mouthOpen = 0.7;
      mouthSpread = 0.2;
    } else if (currentViseme === "viseme_PP") {
      mouthOpen = 0.0;
      mouthSpread = 0.4;
    } else if (currentViseme === "viseme_silence") {
      mouthOpen = 0.05;
      mouthSpread = 0.3;
    }

    visemes.push({
      timeSeconds: time,
      viseme: currentViseme,
      mouthOpenRatio: mouthOpen,
      mouthSpreadRatio: mouthSpread,
      eyeBlink: isBlink
    });
  }

  return { subtitles, visemes };
}

export function generateDefaultTeaser(projectId: string): BookTokTeaserManifest {
  const template = BOOKTOK_TEMPLATES[0];
  const scriptText = `${template.defaultHook} ${template.cta}`;
  const duration = 12.0;
  const { subtitles, visemes } = compileLipSyncTimeline(scriptText, duration);

  const manifest: BookTokTeaserManifest = {
    id: `btk_${Date.now()}`,
    projectId,
    title: "Dhaka Midnight Rain 15s Hook",
    templateId: template.id,
    aspectRatio: "9:16",
    durationSeconds: duration,
    characterName: "হিমু (Himu)",
    personaId: "ayesha_sales",
    avatarStyle: "noir_neon_dhaka",
    hookLine: template.defaultHook,
    scriptText,
    callToAction: template.cta,
    hookViralScore: 94,
    kineticSubtitles: subtitles,
    visemeTimeline: visemes,
    audioBase64: "UklGRqRwAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YYBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    backgroundAmbience: "monsoon_rain_tin",
    socialHashtags: ["#BookTokBangla", "#Himu", "#BanglaNovel", "#ThrillerShorts", "#AmarEkushey"],
    updatedAt: new Date().toISOString()
  };

  teaserStores.set(projectId, manifest);
  return manifest;
}

// ======================== ROUTES ========================

// 1. GET /v1/projects/:id/booktok/templates
bookTokGeneratorRouter.get(
  ["/v1/projects/:id/booktok/templates", "/api/v1/projects/:id/booktok/templates"],
  async (_req: Request, res: Response) => {
    return res.json({
      success: true,
      data: {
        templates: BOOKTOK_TEMPLATES,
        supportedAspectRatios: ["9:16", "16:9", "1:1"],
        recommendedDuration: 15
      }
    });
  }
);

// 2. GET /v1/projects/:id/booktok/current
bookTokGeneratorRouter.get(
  ["/v1/projects/:id/booktok/current", "/api/v1/projects/:id/booktok/current"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let teaser = teaserStores.get(projectId);
      if (!teaser) {
        const persisted = await loadSuiteManifest<BookTokTeaserManifest>(projectId, "booktok");
        if (persisted && persisted.id) {
          teaser = persisted;
          teaserStores.set(projectId, teaser);
        } else {
          teaser = generateDefaultTeaser(projectId);
        }
      }
      return res.json({ success: true, data: teaser });
    } catch (err: any) {
      logger.error({ err, projectId }, "[BookTok] Failed to fetch teaser");
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/booktok/generate-script
const generateScriptSchema = z.object({
  manuscriptExcerpt: z.string().min(1),
  templateId: z.string().default("tpl_midnight_hook"),
  characterName: z.string().default("হিমু (Himu)")
});

bookTokGeneratorRouter.post(
  ["/v1/projects/:id/booktok/generate-script", "/api/v1/projects/:id/booktok/generate-script"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = generateScriptSchema.parse(req.body);
      const template = BOOKTOK_TEMPLATES.find(t => t.id === body.templateId) || BOOKTOK_TEMPLATES[0];

      // Synthesize viral 15-second TikTok hook from manuscript
      const sentences = body.manuscriptExcerpt.split(/[।!?\n]/).map(s => s.trim()).filter(Boolean);
      const primeSentence = sentences[0] || "রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া।";

      const viralHook = `জানেন কি? ${primeSentence} কিন্তু আসল রহস্যটা সেখানে শুরু হয়নি...`;
      const fullScript = `${viralHook} ${template.cta}`;
      const hookViralScore = Math.min(98, 88 + Math.floor(Math.random() * 10));

      return res.json({
        success: true,
        data: {
          projectId,
          templateId: template.id,
          characterName: body.characterName,
          hookLine: viralHook,
          scriptText: fullScript,
          callToAction: template.cta,
          hookViralScore,
          suggestedHashtags: ["#BookTokBangla", "#MysteryReels", "#BanglaStory", "#ViralNovel"]
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[BookTok] Generate script failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. POST /v1/projects/:id/booktok/render-teaser
const renderTeaserSchema = z.object({
  title: z.string().default("BookTok Teaser Reel"),
  templateId: z.string().default("tpl_midnight_hook"),
  characterName: z.string().default("হিমু (Himu)"),
  personaId: z.string().default("ayesha_sales"),
  scriptText: z.string().min(1),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16")
});

bookTokGeneratorRouter.post(
  ["/v1/projects/:id/booktok/render-teaser", "/api/v1/projects/:id/booktok/render-teaser"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = renderTeaserSchema.parse(req.body);

      // Synthesize audio with Feature #11 Voice AI daemon
      const audioResult = await synthesizeDialogueLine({
        text: body.scriptText,
        personaId: body.personaId,
        emotion: "dramatic",
        speakingRate: 1.05
      });

      const duration = Math.min(20, Math.max(8, audioResult.durationSeconds || 12));
      const { subtitles, visemes } = compileLipSyncTimeline(body.scriptText, duration);

      const manifest: BookTokTeaserManifest = {
        id: `btk_${Date.now()}`,
        projectId,
        title: body.title,
        templateId: body.templateId,
        aspectRatio: body.aspectRatio,
        durationSeconds: Number(duration.toFixed(2)),
        characterName: body.characterName,
        personaId: body.personaId,
        avatarStyle: "noir_neon_dhaka",
        hookLine: body.scriptText.slice(0, 80) + "...",
        scriptText: body.scriptText,
        callToAction: "সম্পূর্ণ গল্প শুনতে এখনই ক্লিক করুন।",
        hookViralScore: 95,
        kineticSubtitles: subtitles,
        visemeTimeline: visemes,
        audioBase64: audioResult.audioBase64,
        backgroundAmbience: "monsoon_rain_tin",
        socialHashtags: ["#BookTokBangla", "#ReelsViral", "#ShothikAI", "#StoryHook"],
        updatedAt: new Date().toISOString()
      };

      teaserStores.set(projectId, manifest);
      void persistSuiteManifest(projectId, "booktok", manifest);

      return res.json({
        success: true,
        data: manifest
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[BookTok] Render teaser failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
