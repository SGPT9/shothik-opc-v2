import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const characterDuetRouter = Router();

export type DuetPartnerId = "himu" | "badal" | "rupa" | "oc_rafiq" | "misir_ali";

export interface DuetPartnerProfile {
  id: DuetPartnerId;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  taglineBangla: string;
  counterStyleBangla: string;
  temperament: "elusive" | "nervous" | "longing" | "suspicious" | "logical";
  sampleServeResponses: string[];
}

export interface RallyShot {
  id: string;
  speaker: "author" | "character";
  speakerName: string;
  text: string;
  timestamp: string;
}

export interface DuetVolleyResult {
  partnerId: DuetPartnerId;
  partnerNameBangla: string;
  characterResponseBangla: string;
  emotionalShift: string;
  rallyCount: number;
  subtextInsightBangla: string;
  pacingRhythm: "snappy" | "contemplative" | "explosive" | "poetic";
  rallySummary: RallyShot[];
}

export const DUET_PARTNERS: Record<DuetPartnerId, DuetPartnerProfile> = {
  himu: {
    id: "himu",
    nameBangla: "হিমু",
    nameEnglish: "Himu (The Elusive Anti-Hero)",
    avatarIcon: "🚶‍♂️",
    badgeColor: "amber",
    taglineBangla: "জোছনা আর হলুদ পাঞ্জাবির খামখেয়ালি পরিব্রাজক",
    counterStyleBangla: "ধাঁধাঁযুক্ত, পার্থিব যুক্তিহীন এবং অপ্রত্যাশিত উত্তর",
    temperament: "elusive",
    sampleServeResponses: [
      "তোমার যুক্তির পকেটটা একটু ফুটো আছে, ওখান দিয়ে সব কৌতূহল গলে পড়ে যাচ্ছে।",
      "রাত বারোটার পর রাস্তা কাউকে প্রশ্ন করে না, শুধু হাঁটিয়ে নিয়ে যায়।",
      "চা তো খাব, তবে চিনি ছাড়া। মিষ্টি জিনিসে মানুষের মোহ বাড়ে।"
    ]
  },
  badal: {
    id: "badal",
    nameBangla: "বাদল",
    nameEnglish: "Badal (The Loyal & Anxious Cousin)",
    avatarIcon: "👓",
    badgeColor: "sky",
    taglineBangla: "হিমুদার অলৌকিক কথায় হতবিহ্বল কিন্তু একান্ত অনুগত",
    counterStyleBangla: "উৎকণ্ঠা, অতি-প্রশ্ন এবং চশমা ঠিক করার নার্ভাস ভঙ্গি",
    temperament: "nervous",
    sampleServeResponses: [
      "হিমুদা, ছোটমামা কিন্তু বন্দুক বের করে রেখেছেন, তুমি এখুনি বাড়ি এসো না!",
      "আমার খুব ভয় করছে হিমুদা, সত্যি কি আজ অমাবস্যায় কিছু ঘটবে?",
      "আমি কি যাব সাথে? একা একা এই অন্ধকারে কেমন যেন লাগছে।"
    ]
  },
  rupa: {
    id: "rupa",
    nameBangla: "রূপা",
    nameEnglish: "Rupa (The Unrequited Longing)",
    avatarIcon: "🥀",
    badgeColor: "rose",
    taglineBangla: "অপেক্ষার নীল খামে বন্দি নীলপদ্ম",
    counterStyleBangla: "অভিমান, গভীর নিঃশব্দ দৃষ্টি এবং তীক্ষ্ণ বেদনা",
    temperament: "longing",
    sampleServeResponses: [
      "তুমি কি সত্যিই মানুষ, হিমু? নাকি শুধুই এক টুকরো বিভ্রান্তিকর ছায়া?",
      "প্রতিবার বৃষ্টির সময় ভাবি তোমার ফোন আসবে, কিন্তু আসে কেবল বাতাস।",
      "কাল রাতে তোমার জন্য নীল শাড়ি পরে বারান্দায় বসেছিলাম, আসোনি কেন?"
    ]
  },
  oc_rafiq: {
    id: "oc_rafiq",
    nameBangla: "ওসি রফিক",
    nameEnglish: "OC Rafiq (The Cynical Policeman)",
    avatarIcon: "👮‍♂️",
    badgeColor: "red",
    taglineBangla: "লাল ডায়েরি আর হাতকড়ার বাস্তবতায় বিশ্বাসী পুলিশ অফিসার",
    counterStyleBangla: "সন্দেহ, কর্কশ জেরা এবং টেবিলে ফাইল আছাড়ের হুমকি",
    temperament: "suspicious",
    sampleServeResponses: [
      "তোমার এসব দার্শনিক ভুজুংভাজুং বাদ দাও! তিনটার সময় ওই গলিতে কী করছিলে বলো?",
      "বেশি পাকনামি করলে রিমান্ডে দিয়ে সব হলুদ রং এক মিনিটে সাদা করে দেব।",
      "লাশের পকেটে তোমার হাতের লেখা চিরকুট পাওয়া গেল কেন? জবাব দাও!"
    ]
  },
  misir_ali: {
    id: "misir_ali",
    nameBangla: "মিসির আলি",
    nameEnglish: "Misir Ali (The Rational Psychologist)",
    avatarIcon: "📖",
    badgeColor: "emerald",
    taglineBangla: "মানব মনের অন্ধকার কুঠুরির যৌক্তিক ব্যাখ্যাকারী",
    counterStyleBangla: "শান্ত যুক্তি, বৈজ্ঞানিক হাইপোথিসিস ও সিগারেট ধরানোর বিরতি",
    temperament: "logical",
    sampleServeResponses: [
      "মানুষ যাকে অলৌকিক ভাবে, তা আসলে তার অবচেতন ভয়ের প্রতিফলন মাত্র।",
      "ঘটনার সময় আপনার হৃৎস্পন্দন বেড়ে যাওয়ার কারণটা শারীরিক, ভৌতিক নয়।",
      "চায়ে আরেক চামচ চিনি দিন। মস্তিষ্কের গ্লুকোজ কমে গেলে সিদ্ধান্ত ভুল হয়।"
    ]
  }
};

export function generateDuetCounterVolley(
  partnerId: DuetPartnerId,
  latestAuthorSentence: string,
  history: Array<{ speaker: "author" | "character"; text: string }> = [],
  sceneTone: "tense" | "witty" | "somber" | "romantic" = "witty"
): DuetVolleyResult {
  const meta = DUET_PARTNERS[partnerId] || DUET_PARTNERS.himu;
  const rallyCount = history.length + 2; // includes current shot pair

  const authorText = latestAuthorSentence.trim();

  let counterText = "";
  let emotionalShift = "";
  let subtextInsight = "";
  let pacingRhythm: "snappy" | "contemplative" | "explosive" | "poetic" = "snappy";

  if (partnerId === "himu") {
    if (authorText.includes("?") || authorText.includes("কেন") || authorText.includes("কি")) {
      counterText = `হিমু একগাল হেসে পাঞ্জাবির পকেটে হাত ঢোকাল, "সব 'কেন'-র উত্তর যদি রাস্তায় পাওয়া যেত, তবে মানুষ ঘরে তালা দিত না।"`;
      emotionalShift = "কৌতূহলী পরিহাস → নিরাসক্ত দার্শনিক উদাসীনতা";
      subtextInsight = "হিমু লেখককে বাস্তববাদী হিসাবের বাইরে এনে রহস্যের ঘোরের মধ্যে টানছে।";
      pacingRhythm = "contemplative";
    } else if (authorText.includes("ভয়") || authorText.includes("বিপদ") || authorText.includes("পুলিশ")) {
      counterText = `হিমু আকাশের দিকে তাকিয়ে চোখ বুজল, "বিপদ যখন পায়ের শব্দ পেয়ে কাছে আসে, তখন তার চোখের দিকে সরাসরি তাকাতে হয়।"`;
      emotionalShift = "উদ্বেগহীন ঔদ্ধত্য → নির্ভীক প্ররোচনা";
      subtextInsight = "চরিত্রটি যেকোনো পার্থিব বিপদকে হেলাফেলা করে দৃশ্যটির উত্তেজনা দ্বিগুণ করছে।";
      pacingRhythm = "explosive";
    } else {
      counterText = `সে খালি পায়ে ভেজা ঘাসের উপর এক কদম এগিয়ে বলল, "তুমি যা দেখছ তা সত্য নয়; যা দেখতে পাচ্ছ না, সেখানেই আসল গল্পটা লুকিয়ে আছে।"`;
      emotionalShift = "খামখেয়ালি সান্নিধ্য → গভীর অন্তর্দৃষ্টি";
      subtextInsight = "লেখককে পরবর্তী বাক্যে কোনো অলৌকিক বা অপ্রত্যাশিত পদক্ষেপ নিতে বাধ্য করছে।";
      pacingRhythm = "poetic";
    }
  } else if (partnerId === "badal") {
    counterText = `বাদল চশমাটা নাকের ডগায় নামিয়ে হাঁপাতে হাঁপাতে বলল, "${authorText.length > 20 ? "হিমুদা, তুমি যেভাবে বলছ আমার হাত-পা বরফ হয়ে যাচ্ছে!" : "তুমি কি পাগল হয়ে গেলে নাকি? এখুনি এখান থেকে চলো!"}"`;
    emotionalShift = "আশঙ্কা → চরম উদ্বেগ";
    subtextInsight = "বাদলের ভীতি পাঠকদের জন্য বিপদসীমার মাপকাঠি হিসেবে কাজ করছে।";
    pacingRhythm = "snappy";
  } else if (partnerId === "rupa") {
    counterText = `রূপা তার চোখের পাতা সামান্য তুলে স্থির গলায় বলল, "তোমার এই কথার ভেতর দিয়ে আমি স্পষ্ট দেখতে পাচ্ছি তুমি আবার পালাবার পথ খুঁজছ।"`;
    emotionalShift = "স্নিগ্ধ অভিমান → অপ্রতিরোধ্য মনস্তাত্ত্বিক চাপ";
    subtextInsight = "রূপা চরিত্রের মুখে লেখকের মিথ্যা আত্মরক্ষাকে মুহূর্তেই চূর্ণ করছে।";
    pacingRhythm = "poetic";
  } else if (partnerId === "oc_rafiq") {
    counterText = `ওসি রফিক একদলা ধোঁয়া ছেড়ে লাঠিটা সশব্দে টেবিলে ঠুকলেন, "অনেক নাটক হয়েছে! এবার সোজা কথায় বলো, ওই ফাইলটা কার কাছে?"`;
    emotionalShift = "ধৈর্যচ্যুতি → সরাসরি হুমকি";
    subtextInsight = "দৃশ্যপটের গতি মন্থর হতে না দিয়ে শারীরিক ও আইনি চাপ প্রয়োগ করা হয়েছে।";
    pacingRhythm = "explosive";
  } else {
    // misir_ali
    counterText = `মিসির আলি চশমা মুছে শান্ত গলায় বললেন, "আপনার এই বাক্যের ব্যাকরণে একটা অদ্ভুত অসঙ্গতি আছে; আপনি যা বলছেন তা বিশ্বাস করেন না।"`;
    emotionalShift = "পর্যবেক্ষণশীল নীরবতা → অভ্রান্ত যুক্তিজাল";
    subtextInsight = "মনস্তাত্ত্বিক যুক্তি প্রয়োগ করে চরিত্রের লুকানো উদ্দেশ্যকে অনাবৃত করছে।";
    pacingRhythm = "contemplative";
  }

  const updatedRally: RallyShot[] = [
    ...history.map((h, i) => ({
      id: `shot_${i + 1}`,
      speaker: h.speaker,
      speakerName: h.speaker === "author" ? "লেখক (You)" : meta.nameBangla,
      text: h.text,
      timestamp: new Date().toISOString()
    })),
    {
      id: `shot_${history.length + 1}`,
      speaker: "author",
      speakerName: "লেখক (You)",
      text: latestAuthorSentence,
      timestamp: new Date().toISOString()
    },
    {
      id: `shot_${history.length + 2}`,
      speaker: "character",
      speakerName: meta.nameBangla,
      text: counterText,
      timestamp: new Date().toISOString()
    }
  ];

  return {
    partnerId: meta.id,
    partnerNameBangla: meta.nameBangla,
    characterResponseBangla: counterText,
    emotionalShift,
    rallyCount,
    subtextInsightBangla: subtextInsight,
    pacingRhythm,
    rallySummary: updatedRally
  };
}

const volleyInputSchema = z.object({
  partnerId: z.enum(["himu", "badal", "rupa", "oc_rafiq", "misir_ali"]).default("himu"),
  latestAuthorSentence: z.string().min(1, "Sentence cannot be empty"),
  history: z
    .array(
      z.object({
        speaker: z.enum(["author", "character"]),
        text: z.string()
      })
    )
    .optional()
    .default([]),
  sceneTone: z.enum(["tense", "witty", "somber", "romantic"]).optional().default("witty")
});

const PARTNER_ROUTES = [
  "/v1/projects/:id/character-duet/partners",
  "/api/v1/projects/:id/character-duet/partners"
];

const VOLLEY_ROUTES = [
  "/v1/projects/:id/character-duet/volley",
  "/api/v1/projects/:id/character-duet/volley"
];

for (const path of PARTNER_ROUTES) {
  characterDuetRouter.get(path, (req: Request, res: Response) => {
    try {
      const partners = Object.values(DUET_PARTNERS);
      res.json({
        projectId: req.params.id,
        count: partners.length,
        partners
      });
      return;
    } catch (err: any) {
      logger.error("[CharacterDuet] Error fetching duet partners:", err);
      res.status(500).json({ error: "Failed to fetch duet partners", details: err.message });
      return;
    }
  });
}

for (const path of VOLLEY_ROUTES) {
  characterDuetRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = volleyInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid duet volley payload",
          issues: parsed.error.issues
        });
        return;
      }

      const { partnerId, latestAuthorSentence, history, sceneTone } = parsed.data;
      const result = generateDuetCounterVolley(
        partnerId,
        latestAuthorSentence,
        history,
        sceneTone
      );

      res.json(result);
      return;
    } catch (err: any) {
      logger.error("[CharacterDuet] Error generating counter volley:", err);
      res.status(500).json({ error: "Failed to generate duet volley", details: err.message });
      return;
    }
  });
}
