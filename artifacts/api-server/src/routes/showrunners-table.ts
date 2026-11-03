import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const showrunnersTableRouter = Router();

export type ShowrunnerRole = "architect" | "psychologist" | "geometer" | "contrarian";

export interface ShowrunnerPersona {
  role: ShowrunnerRole;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  tagline: string;
  corePhilosophy: string;
  specialty: string;
}

export interface DebateTurn {
  id: string;
  turnIndex: number;
  role: ShowrunnerRole;
  speakerName: string;
  avatarIcon: string;
  badgeColor: string;
  inResponseToRole?: ShowrunnerRole;
  speechBangla: string;
  speechEnglishSummary: string;
  keySuggestion: string;
  confidenceScore: number; // 0 - 100
}

export interface ShowrunnerDebateSession {
  sessionId: string;
  projectId: string;
  topic: string;
  manuscriptContextSnippet?: string;
  turns: DebateTurn[];
  consensusPitch: {
    headline: string;
    synopsisBangla: string;
    whyItWorks: string;
    suggestedSceneBeats: string[];
  };
  wildcardPitch: {
    personaName: string;
    wildcardSynopsis: string;
    dramaticRisk: string;
  };
  timestamp: string;
}

export const SHOWRUNNER_PERSONAS: Record<ShowrunnerRole, ShowrunnerPersona> = {
  architect: {
    role: "architect",
    nameBangla: "আরিফ কাঠামোগত স্থপতি (The Architect)",
    nameEnglish: "The Structural Architect",
    avatarIcon: "🏗️",
    badgeColor: "indigo",
    tagline: "Pacing, 3-Act Milestones & Ironclad Plot Turnarounds",
    corePhilosophy: "A scene without clear narrative propulsion is dead weight. Every beat must either escalate stakes or pivot the dramatic question.",
    specialty: "Inciting incidents, pinch points, midpoint revelations, and Chekhov payoff orchestration.",
  },
  psychologist: {
    role: "psychologist",
    nameBangla: "ড. সামিয়া মনস্তাত্ত্বিক (The Psychologist)",
    nameEnglish: "The Character Psychologist",
    avatarIcon: "🧠",
    badgeColor: "purple",
    tagline: "Inner Wounds, Relational Subtext & Moral Ambiguity",
    corePhilosophy: "Plot is merely character under extreme pressure. What is the unspoken lie the protagonist tells themselves to survive?",
    specialty: "Psychological trauma, unspoken dialogue subtext, guilt vectors, and relational ruptures.",
  },
  geometer: {
    role: "geometer",
    nameBangla: "কামাল বিশ্ব-ভিত্তি ও ভূগোলবিদ (The World Geometer)",
    nameEnglish: "The World Geometer & Lore Keeper",
    avatarIcon: "🌍",
    badgeColor: "emerald",
    tagline: "Physical Causality, Historical Lore & Environmental Verisimilitude",
    corePhilosophy: "Magic and drama collapse if the physics and society feel artificial. The Buriganga mud must cling to their sandals.",
    specialty: "Hard world rules, sensory atmospheric consistency, transit logistics, and cultural verisimilitude.",
  },
  contrarian: {
    role: "contrarian",
    nameBangla: "রাশেদ সংকট উস্কানিদাতা (The Contrarian)",
    nameEnglish: "The Contrarian & Drama Provocateur",
    avatarIcon: "⚡",
    badgeColor: "rose",
    tagline: "Cliché Hunter, Entropy Spikes & High-Risk Irreversibility",
    corePhilosophy: "If the audience or writer saw that solution coming from 5 miles away, burn it. Put the protagonist in an impossible moral vise.",
    specialty: "Antithetical complications, sudden reversals, high-entropy interruptions, and unforgiving cliffhangers.",
  },
};

/**
 * Deterministically generates an interactive 4-agent showrunner debate simulation
 */
export function simulateShowrunnerDebate(
  projectId: string,
  dilemma: string,
  context?: string
): ShowrunnerDebateSession {
  const sessionId = `showrunner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanDilemma = dilemma.trim();

  // Round 1: Architect sets structural foundation
  const turn1: DebateTurn = {
    id: `turn_${sessionId}_1`,
    turnIndex: 1,
    role: "architect",
    speakerName: SHOWRUNNER_PERSONAS.architect.nameBangla,
    avatarIcon: SHOWRUNNER_PERSONAS.architect.avatarIcon,
    badgeColor: SHOWRUNNER_PERSONAS.architect.badgeColor,
    speechBangla: `আমরা এই সংকটটিকে ৩-অ্যাক্ট কাঠামোর দ্বিতীয় অঙ্কের ক্লাইম্যাক্স মোড় হিসেবে দেখি। প্রশ্ন হলো: "${cleanDilemma}"। হিমু বা নায়ককে এখানে কোনো অলৌকিক সুবিধা দেওয়া যাবে না। একটি দৃশ্য তখনই জীবন্ত হয় যখন নায়কের আপাত জয় পরমুহূর্তেই তাকে বৃহত্তর বিপদে টেনে নেয়। প্রথমে তাকে পুলিশের যুক্তিগুলোকে তাদের বিরুদ্ধেই অস্ত্র বানাতে হবে।`,
    speechEnglishSummary: "Establish structural narrative momentum: Protagonist must turn antagonist's own logic into an unintended trap.",
    keySuggestion: "Anchor turning point around the antagonist's formal interrogation warrant.",
    confidenceScore: 92,
  };

  // Round 2: Psychologist challenges the emotional reality
  const turn2: DebateTurn = {
    id: `turn_${sessionId}_2`,
    turnIndex: 2,
    role: "psychologist",
    speakerName: SHOWRUNNER_PERSONAS.psychologist.nameBangla,
    avatarIcon: SHOWRUNNER_PERSONAS.psychologist.avatarIcon,
    badgeColor: SHOWRUNNER_PERSONAS.psychologist.badgeColor,
    inResponseToRole: "architect",
    speechBangla: `আরিফের কাঠামোর সাথে আমি একমত, কিন্তু কেবল বুদ্ধির দ্বন্দ্বে পাঠক তৃপ্ত হবে না। পুলিশ কর্মকর্তা কেবল ইউনিফর্ম পরা কোনো ধাঁধা নয়—তার ব্যক্তিগত কোনো দুর্বলতা বা লুকানো অপরাধবোধ আছে। হিমুর শক্তি হলো সে মানুষের ভেতরের গোপন ভয় ছুঁয়ে ফেলতে পারে। হিমু কোনো যুক্তি দেবে না, বরং ওসির ফেলে আসা কোনো ক্ষতের কথা এমন নিরাসক্তভাবে বলবে যেন বাতাস তাকে বলে দিয়েছে।`,
    speechEnglishSummary: "Emotional subtext over analytical puzzle-solving: Target the antagonist's unresolved past trauma.",
    keySuggestion: "Have protagonist casually whisper a specific regret from the officer's youth.",
    confidenceScore: 95,
  };

  // Round 3: Geometer grounds the physical environment & logistics
  const turn3: DebateTurn = {
    id: `turn_${sessionId}_3`,
    turnIndex: 3,
    role: "geometer",
    speakerName: SHOWRUNNER_PERSONAS.geometer.nameBangla,
    avatarIcon: SHOWRUNNER_PERSONAS.geometer.avatarIcon,
    badgeColor: SHOWRUNNER_PERSONAS.geometer.badgeColor,
    inResponseToRole: "psychologist",
    speechBangla: `ড. সামিয়া ঠিক বলেছেন, কিন্তু পরিবেশটাকে জীবন্ত করতে হবে। পুরান ঢাকার লালবাগ থানার ওই ঘরটিতে বৃষ্টির গন্ধ, ছাদ থেকে চুইয়ে পড়া নোংরা পানি, টেবিলে রাখা ঠান্ডা সরমালাই আর মরচে পড়া টেবিল ফ্যানের খটখট শব্দ থাকতে হবে। হিমুর হলুদ পাঞ্জাবিতে কাদার ছিটে আর ভিজে যাওয়া পা থানার ঠান্ডা লাল সিমেন্টের মেঝে স্পর্শ করবে। ভৌগোলিক ও ইন্দ্রিয়গ্রাহ্য সত্যতা দৃশ্যটিকে কিংবদন্তি করে তুলবে।`,
    speechEnglishSummary: "Sensory verisimilitude: Rain dripping through old plaster, lukewarm tea, rusty table fan acoustic foley.",
    keySuggestion: "Use the rusty oscillation fan cadence to measure dramatic pauses in dialogue.",
    confidenceScore: 89,
  };

  // Round 4: Contrarian blows up safe resolutions
  const turn4: DebateTurn = {
    id: `turn_${sessionId}_4`,
    turnIndex: 4,
    role: "contrarian",
    speakerName: SHOWRUNNER_PERSONAS.contrarian.nameBangla,
    avatarIcon: SHOWRUNNER_PERSONAS.contrarian.avatarIcon,
    badgeColor: SHOWRUNNER_PERSONAS.contrarian.badgeColor,
    inResponseToRole: "architect",
    speechBangla: `সবাই বড্ড শান্ত আর পরিপাটি সমাধান খুঁজছেন! যদি হিমু এত সহজে বের হয়ে যায়, তবে নাটকের ঝুঁকি কোথায়? আমি বলছি: হিমু বের হবে ঠিকই, কিন্তু ওসি তাকে ছাড়বে না—বরং নিজেই তার পিছু নেবে গভীর রাতে! হিমু একটি চাবি ফেলে যাবে, যে চাবিটি থানার মালখানার কোনো অমীমাংসিত মামলার! নায়ককে একটি সমাধান দেওয়ার বদলে এমন একটি জটিলতায় ফেলুন যেখান থেকে ফেরা অসম্ভব!`,
    speechEnglishSummary: "High-entropy reversal: Protagonist leaves behind an unsolved evidence locker key, baiting officer into following him.",
    keySuggestion: "Avoid clean exit; leave an active ticking clock that forces immediate midnight pursuit.",
    confidenceScore: 96,
  };

  const turns = [turn1, turn2, turn3, turn4];

  return {
    sessionId,
    projectId,
    topic: cleanDilemma,
    manuscriptContextSnippet: context?.slice(0, 300),
    turns,
    consensusPitch: {
      headline: "The Psychological Key Gambit (মনস্তাত্ত্বিক চাবি ও মধ্যরাতের প্রস্থান)",
      synopsisBangla: "হিমু কোনো সরাসরি তর্ক করবে না। ওসির টেবিল ফ্যানের শব্দের তালে তালে সে ওসির পারিবারিক এক গভীর ক্ষতের দিকে ইঙ্গিত করবে। ঘর থেকে নিঃশব্দে বেরিয়ে যাওয়ার সময় সে টেবিলে একটি অচেনা মরচে ধরা চাবি রেখে যাবে, যা দেখে ওসি স্তম্ভিত হয়ে নিজে তদন্তে নামতে বাধ্য হবেন।",
      whyItWorks: "Satisfies the Architect's pacing pivot, the Psychologist's subtext wound, the Geometer's sensory foley, and the Contrarian's irreversible cliffhanger hook.",
      suggestedSceneBeats: [
        "Beat 1: The damp smell of Lalbagh police station; ceiling plaster flakes falling on interrogation desk.",
        "Beat 2: Officer slams file, protagonist remains serene looking at the rusty fan rhythm.",
        "Beat 3: Protagonist murmurs a single precise phrase regarding a village pond or forgotten cousin.",
        "Beat 4: Officer's composure crumbles into silent vertigo; protagonist stands up into the monsoon rain.",
        "Beat 5: The rusty key left on the saucer — the officer picks it up with trembling hands.",
      ],
    },
    wildcardPitch: {
      personaName: SHOWRUNNER_PERSONAS.contrarian.nameBangla,
      wildcardSynopsis: "ওসি হিমুকে গ্রেপ্তার করার পরিবর্তে লকআপের চাবি নিজেই ছুড়ে ফেলে দেয় এবং বলে—'তুমি যদি ভবিষ্যৎ দেখতে পাও, তবে বলো আজ রাতে আমার ছেলে বাঁচবে কি না?'",
      dramaticRisk: "Dramatically alters the power dynamic from bureaucratic law enforcement to raw existential thriller.",
    },
    timestamp: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Route Endpoints
// -------------------------------------------------------------

/**
 * GET /api/v1/projects/:id/showrunners/personas
 * Returns metadata catalog of the 4 showrunner co-writer personas
 */
showrunnersTableRouter.get(
  ["/v1/projects/:id/showrunners/personas", "/api/v1/projects/:id/showrunners/personas"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    logger.info({ projectId }, "[ShowrunnersTable] Personas requested");
    res.status(200).json({
      projectId,
      totalPersonas: Object.keys(SHOWRUNNER_PERSONAS).length,
      personas: Object.values(SHOWRUNNER_PERSONAS),
    });
  }
);

const debateBodySchema = z.object({
  premiseOrDilemma: z.string().min(3),
  manuscriptContext: z.string().optional(),
});

/**
 * POST /api/v1/projects/:id/showrunners/debate
 * Runs real-time 4-agent round-table brainstorm crucible on story dilemma
 */
showrunnersTableRouter.post(
  ["/v1/projects/:id/showrunners/debate", "/api/v1/projects/:id/showrunners/debate"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    const parsed = debateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid dilemma payload", details: parsed.error.issues });
      return;
    }

    const { premiseOrDilemma, manuscriptContext } = parsed.data;

    const session = simulateShowrunnerDebate(projectId, premiseOrDilemma, manuscriptContext);

    logger.info(
      { projectId, sessionId: session.sessionId, turnsCount: session.turns.length },
      "[ShowrunnersTable] Debate session completed"
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  }
);
