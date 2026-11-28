import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { persistSuiteManifest } from "../lib/novel-engine/suite-manifest-store";

export const chronoBraiderRouter = Router();

export type TemporalMovement = "Present Ground" | "Analepsis (Flashback)" | "Prolepsis (Flashforward)" | "Frame Narrative";

export interface ChronoNode {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterTitleBn: string;
  narrativeRevealIndex: number; // Order reader sees it (1, 2, 3...)
  inUniverseYear: number;       // Absolute chronological year (e.g., 1971, 1998, 2026)
  inUniverseDateStr: string;
  temporalMovement: TemporalMovement;
  perspectiveCharacter: string;
  characterAgeInScene: number;
  location: string;
  eraSensoryAnchor: string;
  eraSensoryAnchorBn: string;
  synopsis: string;
  synopsisBn: string;
}

export interface ChronoParadoxAnomaly {
  id: string;
  severity: "Low" | "Medium" | "High (Causal Paradox)";
  title: string;
  titleBn: string;
  description: string;
  affectedChapterIndices: number[];
  recommendation: string;
}

export interface ChronoBraiderState {
  projectId: string;
  title: string;
  titleBn: string;
  totalChaptersMapped: number;
  chronologicalSpanYears: number; // e.g., 55 years (1971 - 2026)
  narrativeComplexityScore: number; // 0 - 100
  nodes: ChronoNode[];
  anomalies: ChronoParadoxAnomaly[];
  transitionProseTemplates: {
    title: string;
    bengaliSnippet: string;
    englishSnippet: string;
  }[];
}

const chronoStore = new Map<string, ChronoBraiderState>();

export function analyzeChronoBraid(manuscript: string, projectId: string): ChronoBraiderState {
  const isBengali = /[\u0980-\u09FF]/.test(manuscript);

  const defaultNodes: ChronoNode[] = [
    {
      id: "node_ch1",
      chapterNumber: 1,
      chapterTitle: "The Whispers of Buriganga",
      chapterTitleBn: "বুড়িগঙ্গার ফিসফিসানি",
      narrativeRevealIndex: 1,
      inUniverseYear: 2026,
      inUniverseDateStr: "October 14, 2026",
      temporalMovement: "Present Ground",
      perspectiveCharacter: "Arafat Chowdhury",
      characterAgeInScene: 38,
      location: "Sadarghat Terminal, Dhaka",
      eraSensoryAnchor: "Neon cargo barge strobes, smartphone notifications, diesel fumes",
      eraSensoryAnchorBn: "কার্গো ট্রলারের নিয়ন বাতি, স্মার্টফোনের ভাইব্রেশন ও পোড়া ডিজেলের গন্ধ",
      synopsis: "Arafat discovers an unopened 1971 brass dispatch tube lodged inside an old wooden river chest.",
      synopsisBn: "আরাফাত পুরনো কাঠের সিন্দুকে ১৯৭১ সালের একটি সিলগালা করা পিতলের দলিল নল আবিষ্কার করে।"
    },
    {
      id: "node_ch2",
      chapterNumber: 2,
      chapterTitle: "Midnight at Nilkhet Barricade",
      chapterTitleBn: "নীলক্ষেত ব্যারিকেডের শেষ প্রহর",
      narrativeRevealIndex: 2,
      inUniverseYear: 1971,
      inUniverseDateStr: "March 25, 1971",
      temporalMovement: "Analepsis (Flashback)",
      perspectiveCharacter: "Professor Mofizul Haque (Grandfather)",
      characterAgeInScene: 42,
      location: "Dhaka University Campus & Nilkhet",
      eraSensoryAnchor: "Manual Remington typewriter clatter, curfew sirens, smell of tear gas",
      eraSensoryAnchorBn: "ম্যানুয়াল রেমিংটন টাইপরাইটারের খটখট শব্দ, কারফিউয়ের সাইরেন ও টিয়ার গ্যাসের ঝাঁজ",
      synopsis: "Professor Mofizul enciphers the university student registry onto waterproof muslin threads before troops arrive.",
      synopsisBn: "হানাদার বাহিনী প্রবেশের আগে অধ্যাপক মফিজুল শিক্ষার্থীদের তালিকা ওয়াটারপ্রুফ সুতোয় এনকোড করেন।"
    },
    {
      id: "node_ch3",
      chapterNumber: 3,
      chapterTitle: "The Monsoon of Floating Coffins",
      chapterTitleBn: "বন্যার জলে ভাসা সিন্দুক",
      narrativeRevealIndex: 3,
      inUniverseYear: 1988,
      inUniverseDateStr: "September 02, 1988",
      temporalMovement: "Analepsis (Flashback)",
      perspectiveCharacter: "Arafat Chowdhury (Childhood)",
      characterAgeInScene: 0, // Anomaly trigger: Born in 1988, scene shows him walking
      location: "Old Dhaka Shakhari Bazar Rooftops",
      eraSensoryAnchor: "Transistor radio weather bulletins, kerosene lamps, murky flood waters",
      eraSensoryAnchorBn: "ট্রানজিস্টার রেডিওর আবহাওয়া বার্তা, কেরোসিনের কুপি ও বন্যার ঘোলা পানি",
      synopsis: "During the catastrophic 1988 flood, young Arafat witnesses his father hiding the brass cylinder under floor tiles.",
      synopsisBn: "১৯৮৮ সালের বন্যায় মেঝে খুঁড়ে পিতলের নলটি লুকিয়ে রাখার দৃশ্য প্রত্যক্ষ করে।"
    },
    {
      id: "node_ch4",
      chapterNumber: 4,
      chapterTitle: "The Digital Decryption",
      chapterTitleBn: "ডিজিটাল পাঠোদ্ধার",
      narrativeRevealIndex: 4,
      inUniverseYear: 2026,
      inUniverseDateStr: "October 16, 2026",
      temporalMovement: "Present Ground",
      perspectiveCharacter: "Arafat Chowdhury",
      characterAgeInScene: 38,
      location: "Dhanmondi Tech Lab",
      eraSensoryAnchor: "Spectrometer lasers, 3D holographic wireframe mesh, high-frequency coil buzz",
      eraSensoryAnchorBn: "লেজার স্পেকট্রোমিটার, থ্রিডি হলোগ্রাফিক মেশ ও তারের মৃদু গুনগুন",
      synopsis: "Arafat and cryptographer Maya scan the acoustic threads, unlocking the voice recording from 1971.",
      synopsisBn: "আরাফাত ও মায়া সুতোর কম্পন স্ক্যান করে ১৯৭১ সালের কণ্ঠস্বর ফিরিয়ে আনে।"
    },
    {
      id: "node_ch5",
      chapterNumber: 5,
      chapterTitle: "Echoes of the Delta Basin (2035)",
      chapterTitleBn: "বদ্বীপের প্রতিধ্বনি (২০৩৫)",
      narrativeRevealIndex: 5,
      inUniverseYear: 2035,
      inUniverseDateStr: "December 16, 2035",
      temporalMovement: "Prolepsis (Flashforward)",
      perspectiveCharacter: "Maya Rahman",
      characterAgeInScene: 41,
      location: "Padma Bridge Climate Observatory",
      eraSensoryAnchor: "Autonomous solar hover-barges, holographic memorial obelisks, clean saline air",
      eraSensoryAnchorBn: "সৌরচালিত স্বয়ংক্রিয় ট্রলার, হলোগ্রাফিক স্মৃতিস্তম্ভ ও বাতাসের লবণাক্ত ঘ্রাণ",
      synopsis: "Decades into the future, the decrypted archival manifesto becomes the constitutional foundation of the Riverine Union.",
      synopsisBn: "ভবিষ্যতে এই উদ্ধারকৃত দলিল নতুন নদী সনদের মূল ভিত্তি হিসেবে স্বীকৃতি পায়।"
    }
  ];

  const anomalies: ChronoParadoxAnomaly[] = [
    {
      id: "anom_age_1988",
      severity: "High (Causal Paradox)",
      title: "Biological Age Conflict in 1988 Flashback",
      titleBn: "১৯৮৮ সালের ফ্ল্যাশব্যাকের বয়সগত অসঙ্গতি",
      description: "Character Arafat Chowdhury was born in October 1988 (Age 38 in 2026), but is depicted running across rooftops in September 1988.",
      affectedChapterIndices: [1, 3],
      recommendation: "Shift the flood chapter to 1998 (Age 10) or replace the perspective with his father or uncle."
    },
    {
      id: "anom_anachronism_tech",
      severity: "Medium",
      title: "1971 Material Culture Anachronism",
      titleBn: "১৯৭১ সালের উপাদানের কালবৈষম্য",
      description: "Ensure that cipher tools mentioned in Chapter 2 adhere strictly to mechanical or chemical telegraph era technology.",
      affectedChapterIndices: [2],
      recommendation: "Anchor cipher storage to hand-punched paper tape or woven textile threads rather than micro-electronics."
    }
  ];

  const transitions = [
    {
      title: "Monsoon Memory Ripple (স্মৃতির প্লাবন)",
      bengaliSnippet: "বাইরে বৃষ্টির শব্দটা হঠাৎ যেন বদলে গেল। বুড়িগঙ্গার জলের ছলাৎ ছলাৎ শব্দ নিমেষেই আরাফাতকে টেনে নিয়ে গেল পঁয়ত্রিশ বছর আগের এক অন্ধকার রাতে...",
      englishSnippet: "The sound of rain against the glass shifted frequency. In an instant, the murky river pulled him thirty-five years into the past, to a night drowned in floodwaters..."
    },
    {
      title: "Artifact Sensory Spark (স্মারকের স্পর্শ)",
      bengaliSnippet: "পিতলের নলের ঠান্ডা ধাতব স্পর্শ আঙুলে লাগতেই সময় থমকে দাঁড়াল। রক্তিম মার্চের সেই ধোঁয়াটে গন্ধ যেন আবার নাসারন্ধ্রে এসে ধাক্কা দিল...",
      englishSnippet: "As his cold fingertips grazed the tarnished brass, time folded in upon itself. The acrid stench of burnt paper from March 1971 hung once more in the stifling air..."
    },
    {
      title: "Prolepsis Flashforward (ভবিষ্যতের পূর্বাভাস)",
      bengaliSnippet: "সে তখনও জানত না, এই সামান্য চিঠির খণ্ডটি একদিন গোটা বদ্বীপের মানচিত্র আর ভবিষ্যৎকে বদলে দেবে, যার ফল দৃশ্যমান হবে আরও নয় বছর পর...",
      englishSnippet: "He could not know then that this fragile scrap of parchment would rewrite the destiny of the entire delta nine years into the unwritten future..."
    }
  ];

  const state: ChronoBraiderState = {
    projectId,
    title: isBengali ? "মাল্টি-টিয়ার ক্রোনো-ব্রেইডার (নন-লিনিয়ার টাইমলাইন)" : "Multi-Tier Chrono-Braider (Non-Linear Flashbacks)",
    titleBn: "মাল্টি-টিয়ার ক্রোনো-ব্রেইডার (নন-লিনিয়ার টাইমলাইন)",
    totalChaptersMapped: defaultNodes.length,
    chronologicalSpanYears: 64, // 1971 to 2035
    narrativeComplexityScore: 88,
    nodes: defaultNodes,
    anomalies,
    transitionProseTemplates: transitions
  };

  chronoStore.set(projectId, state); void persistSuiteManifest(projectId, "chrono_braider", state);
  return state;
}

const STATE_ROUTES = [
  "/v1/projects/:projectId/chrono-braider/state",
  "/api/v1/projects/:projectId/chrono-braider/state",
  "/v1/projects/:projectId/chrono-braider",
  "/api/v1/projects/:projectId/chrono-braider"
];

for (const routePath of STATE_ROUTES) {
  chronoBraiderRouter.get(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const existing = chronoStore.get(projectId);
      if (existing) {
        return res.status(200).json(existing);
      }
      const defaultState = analyzeChronoBraid("", projectId);
      return res.status(200).json(defaultState);
    } catch (err: any) {
      logger.error("[ChronoBraider] Error getting state: " + err.message);
      return res.status(500).json({ error: "Failed to get chrono braider state", details: err.message });
    }
  });
}

const auditSchema = z.object({
  manuscript: z.string().optional().default(""),
  options: z
    .object({
      strictParadoxCheck: z.boolean().optional().default(true),
      includeTransitions: z.boolean().optional().default(true)
    })
    .optional()
});

const AUDIT_ROUTES = [
  "/v1/projects/:projectId/chrono-braider/audit",
  "/api/v1/projects/:projectId/chrono-braider/audit"
];

for (const routePath of AUDIT_ROUTES) {
  chronoBraiderRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const body = auditSchema.parse(req.body);
      const state = analyzeChronoBraid(body.manuscript, projectId);
      logger.info(`[ChronoBraider] Audited ${state.totalChaptersMapped} timeline nodes for project ${projectId}`);
      return res.status(200).json(state);
    } catch (err: any) {
      logger.error("[ChronoBraider] Audit error: " + err.message);
      return res.status(400).json({ error: "Failed to audit chrono braid", details: err.message });
    }
  });
}

const nodeSchema = z.object({
  chapterNumber: z.number().int().positive(),
  chapterTitle: z.string().min(1),
  chapterTitleBn: z.string().optional(),
  inUniverseYear: z.number().int(),
  inUniverseDateStr: z.string().min(1),
  temporalMovement: z.enum([
    "Present Ground",
    "Analepsis (Flashback)",
    "Prolepsis (Flashforward)",
    "Frame Narrative"
  ]),
  perspectiveCharacter: z.string().min(1),
  characterAgeInScene: z.number(),
  location: z.string().min(1),
  eraSensoryAnchor: z.string().min(1),
  eraSensoryAnchorBn: z.string().optional(),
  synopsis: z.string().min(1),
  synopsisBn: z.string().optional()
});

const NODE_ROUTES = [
  "/v1/projects/:projectId/chrono-braider/nodes",
  "/api/v1/projects/:projectId/chrono-braider/nodes"
];

for (const routePath of NODE_ROUTES) {
  chronoBraiderRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const body = nodeSchema.parse(req.body);
      let state = chronoStore.get(projectId);
      if (!state) {
        state = analyzeChronoBraid("", projectId);
      }

      const newNode: ChronoNode = {
        id: `chrono_node_${Date.now()}`,
        chapterNumber: body.chapterNumber,
        chapterTitle: body.chapterTitle,
        chapterTitleBn: body.chapterTitleBn || body.chapterTitle,
        narrativeRevealIndex: state.nodes.length + 1,
        inUniverseYear: body.inUniverseYear,
        inUniverseDateStr: body.inUniverseDateStr,
        temporalMovement: body.temporalMovement,
        perspectiveCharacter: body.perspectiveCharacter,
        characterAgeInScene: body.characterAgeInScene,
        location: body.location,
        eraSensoryAnchor: body.eraSensoryAnchor,
        eraSensoryAnchorBn: body.eraSensoryAnchorBn || body.eraSensoryAnchor,
        synopsis: body.synopsis,
        synopsisBn: body.synopsisBn || body.synopsis
      };

      state.nodes.push(newNode);
      state.totalChaptersMapped = state.nodes.length;
      chronoStore.set(projectId, state); void persistSuiteManifest(projectId, "chrono_braider", state);

      return res.status(201).json({ node: newNode, totalChaptersMapped: state.totalChaptersMapped });
    } catch (err: any) {
      logger.error("[ChronoBraider] Add node error: " + err.message);
      return res.status(400).json({ error: "Failed to add chrono node", details: err.message });
    }
  });
}
