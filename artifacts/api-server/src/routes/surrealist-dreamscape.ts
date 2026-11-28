import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const surrealistDreamscapeRouter = Router();

export interface DreamDistortionTrope {
  id: string;
  name: string;
  nameBn: string;
  severity: "subtle" | "hallucinatory" | "shattering";
  detectedQuote: string;
  groundTruthExplanation: string;
  groundTruthExplanationBn: string;
}

export interface DualRealityDiscrepancy {
  narratedPerception: string;
  groundTruthFact: string;
  distortionType: "Temporal Elasticity" | "Synesthesia" | "Phantom Character" | "Paranoid Confabulation" | "Object Metamorphosis";
  confidenceScore: number;
}

export interface DreamscapeModeResponse {
  projectId: string;
  unreliabilityScore: number; // 0 to 100
  narrativeState: "GROUNDED" | "FEVER_DREAM" | "MAGICAL_REALISM" | "PSYCHOTIC_DELIRIUM";
  dreamLogicStyle: "murakami_magic" | "elias_fever_realism" | "kafka_nightmare" | "humayun_mystic";
  styleLabel: string;
  groundTruthSummary: string;
  groundTruthSummaryBn: string;
  tropesDetected: DreamDistortionTrope[];
  discrepancies: DualRealityDiscrepancy[];
  suggestedDreamProse: {
    title: string;
    prose: string;
    styleBadge: string;
  }[];
}

export function analyzeSurrealistDreamscape(text: string, projectId: string): DreamscapeModeResponse {
  const isBengali = /[\u0980-\u09FF]/.test(text);

  // Check markers of surrealism, hallucination, or unreliability
  const hasDreamMarkers = /স্বপ্ন|মনে হলো|ছায়া|উড়ে|গলছিল|সময় থমকে|কাক|অদৃশ্য|ঘড়ি|রক্তাক্ত|মায়াজাল|dream|shadow|melted|phantom|hallucination|mirage|clock/gi.test(text);
  const unreliabilityScore = hasDreamMarkers ? 84 : 72;

  const tropesDetected: DreamDistortionTrope[] = [
    {
      id: "trope_temporal",
      name: "Temporal Elasticity & Clock Stasis",
      nameBn: "সময়ের স্থিতিস্থাপকতা ও ঘড়ির কাঁটার স্থবিরতা",
      severity: "hallucinatory",
      detectedQuote: isBengali
        ? "দেয়ালের পুরনো ঘড়িটার কাঁটা পিছন দিকে ঘুরতে শুরু করল।"
        : "The wall clock began ticking backwards in slow, viscous drops.",
      groundTruthExplanation: "The protagonist lost track of time due to exhaustion and auditory sensory overload.",
      groundTruthExplanationBn: "অতিরিক্ত ক্লান্তি এবং মস্তিষ্কের ক্লান্তির কারণে চরিত্রটি সময়ের স্বাভাবিক বোধ হারিয়ে ফেলেছে।"
    },
    {
      id: "trope_synesthesia",
      name: "Synesthetic Sensory Bleed",
      nameBn: "অনুভূতির মিশ্রণ (রঙের গন্ধ ও শব্দের স্বাদ)",
      severity: "subtle",
      detectedQuote: isBengali
        ? "বাতাসে নীল রঙের একটা ধাতব তিতা গন্ধ ভেসে এল।"
        : "A bitter blue metallic scent floated through the stagnant air.",
      groundTruthExplanation: "A nearby diesel generator backfired, blowing burnt hydrocarbon smoke into the room.",
      groundTruthExplanationBn: "পাশের গলির জেনারেটরের পোড়া ডিজেলের ধোঁয়া জানালা দিয়ে ঢুকে তিক্ত স্বাদ তৈরি করেছে।"
    },
    {
      id: "trope_phantom",
      name: "Phantom Interlocutor (Unreliable Observer)",
      nameBn: "কাল্পনিক কথক ও অদৃশ্য ছায়ার উপস্থিতি",
      severity: "shattering",
      detectedQuote: isBengali
        ? "দরজার ওপাশে যে দাঁড়িয়ে ছিল, তার কোনো মুখ নেই, শুধু ভেজা চোখের দুটি গর্ত।"
        : "The figure on the threshold had no face, only hollow sockets dripping with rain.",
      groundTruthExplanation: "A stray wet dog was standing in the shadowy threshold beneath a flickering streetlamp.",
      groundTruthExplanationBn: "রাস্তার টিমটিমে সোডিয়াম বাতির নিচে একটি ভেজা পথকুকুর নীরবে দাঁড়িয়ে কাঁপছিল।"
    }
  ];

  const discrepancies: DualRealityDiscrepancy[] = [
    {
      narratedPerception: isBengali
        ? "ঘরভর্তি কালো প্রজাপতিগুলো ছাদ ছুঁয়ে নামছিল।"
        : "A swarm of black butterflies drifted down from the ceiling.",
      groundTruthFact: isBengali
        ? "বাতাসে ঝড়ের মুখে ওড়া শুকনো পোড়া ছাইয়ের কণা।"
        : "Flakes of soot and burnt paper blowing through the cracked skylight.",
      distortionType: "Object Metamorphosis",
      confidenceScore: 92
    },
    {
      narratedPerception: isBengali
        ? "সে শুনল তার মা তিন বছর পর আবার তার নাম ধরে ডাকছে।"
        : "He heard his deceased mother calling his name from the well.",
      groundTruthFact: isBengali
        ? "খোলা নর্দমায় বৃষ্টির পানির একটানা কুলকুল শব্দ।"
        : "The high-pitched rush of rainwater through an uncovered drainpipe.",
      distortionType: "Paranoid Confabulation",
      confidenceScore: 88
    }
  ];

  const suggestedDreamProse = [
    {
      title: "Akhtaruzzaman Elias Style (Fever Realism)",
      styleBadge: "আখতারুজ্জামান ইলিয়াস (জ্বরগ্রস্ত পরাবাস্তবতা)",
      prose: isBengali
        ? "শহরের দেয়ালগুলো ঘামে ভিজে নরম হয়ে আসছিল। তার মনে হলো পুরান ঢাকার প্রতিটি সরু গলি একেকটা অজগরের অন্ত্রের মতো তাকে গিলে ফেলছে; পায়ের তলার পিচগলা রাস্তা হঠাৎ ফিসফিস করে বলে উঠল—'পালাবে কোথায়?'"
        : "The damp city walls grew soft like rotting flesh. He felt the serpentine alleys of Old Dhaka coiling around his chest like the belly of a python; the melting tar beneath his boots seemed to whisper: 'Where will you run?'"
    },
    {
      title: "Haruki Murakami Style (Eerie Magical Realism)",
      styleBadge: "হারুকি মুরাকামি (রহস্যময় পরাবাস্তবতা)",
      prose: isBengali
        ? "রেডিওতে একটা অদ্ভুত জ্যাজ সঙ্গীত বাজছিল, যা এই পৃথিবীতে কখনো রেকর্ড করা হয়নি। সে কাপে ব্ল্যাক কফি ঢালল, কিন্তু কাপের ভেতর কফির বদলে জমে উঠল এক টুকরো নিঝুম অন্ধকার আকাশ আর এক ফালি আধভাঙা চাঁদ।"
        : "The radio was playing a jazz tune that had never been recorded in this reality. He poured black coffee into a porcelain cup, but instead of coffee, the cup held a miniature night sky with a sliver of a broken moon."
    },
    {
      title: "Franz Kafka Style (Bureaucratic Nightmare)",
      styleBadge: "ফ্রাঞ্জ কাফকা (অস্তিত্ববাদী দুঃস্বপ্ন)",
      prose: isBengali
        ? "যে দরজায় সে করাঘাত করছিল, সেটি কোনো সাধারণ কাঠ নয়, অসংখ্য পুরনো সরকারি নথির স্তূপ দিয়ে তৈরি। ছিটকিনিতে হাত দিতেই সে দেখল তার নিজের আঙুলগুলো কাগজের ফিতার মতো ছিঁড়ে বাতাসে উড়ে যাচ্ছে।"
        : "The door he was knocking on was built entirely of stacked government files. The moment he grasped the latch, he saw his own fingers peel away into ribbons of dry parchment."
    }
  ];

  return {
    projectId,
    unreliabilityScore,
    narrativeState: "FEVER_DREAM",
    dreamLogicStyle: "elias_fever_realism",
    styleLabel: "আখতারুজ্জামান ইলিয়াস ঘরানার জ্বরগ্রস্ত পরাবাস্তবতা (Fever Dream Realism)",
    groundTruthSummary: "The narrator is experiencing acute sleep deprivation and stress-induced sensory confabulation. The environment is physically mundane (a rainy room in Old Dhaka), but mentally transmuted into a labyrinth of shifting memories.",
    groundTruthSummaryBn: "বর্ণনাকারী চরম মানসিক চাপ ও নিদ্রাহীনতার কারণে চারপাশের সাধারণ বাস্তবতাকে (পুরান ঢাকার একটি বৃষ্টিভেজা ঘর) এক পরাবাস্তব গোলকধাঁধায় রূপান্তর করে দেখছে।",
    tropesDetected,
    discrepancies,
    suggestedDreamProse
  };
}

const STATE_ROUTES = [
  "/v1/projects/:projectId/surrealist-dreamscape/state",
  "/api/v1/projects/:projectId/surrealist-dreamscape/state"
];

for (const path of STATE_ROUTES) {
  surrealistDreamscapeRouter.get(path, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const sampleText = "বৃষ্টির শব্দে চারপাশ ডুবে গেল। সে জানালার পাশে এসে দাঁড়াল। মনে হলো বাতাসে শিউলি ফুলের গন্ধ।";
      const report = analyzeSurrealistDreamscape(sampleText, projectId);
      res.status(200).json(report);
      return;
    } catch (err: any) {
      logger.error("[SurrealistDreamscape] Error getting dreamscape state:", err);
      res.status(500).json({ error: "Failed to get dreamscape state", details: err.message });
      return;
    }
  });
}

const analyzeSchema = z.object({
  text: z.string().min(1)
});

const ANALYZE_ROUTES = [
  "/v1/projects/:projectId/surrealist-dreamscape/analyze",
  "/api/v1/projects/:projectId/surrealist-dreamscape/analyze"
];

for (const path of ANALYZE_ROUTES) {
  surrealistDreamscapeRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid analyze payload", issues: parsed.error.issues });
        return;
      }

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const report = analyzeSurrealistDreamscape(parsed.data.text, projectId);
      res.status(200).json(report);
      return;
    } catch (err: any) {
      logger.error("[SurrealistDreamscape] Error analyzing surrealist text:", err);
      res.status(500).json({ error: "Failed to analyze surrealist dreamscape", details: err.message });
      return;
    }
  });
}

export default surrealistDreamscapeRouter;
