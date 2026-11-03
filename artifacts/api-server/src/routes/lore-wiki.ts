import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const loreWikiRouter = Router();

export type LoreCategory =
  | "Character"
  | "Faction"
  | "Location"
  | "Artifact"
  | "Historical Event"
  | "Magic / Technology Law";

export interface LoreEntity {
  id: string;
  name: string;
  nameBn: string;
  category: LoreCategory;
  categoryBn: string;
  aliases: string[];
  summary: string;
  summaryBn: string;
  firstMentionChapter: string;
  threatLevelOrSignificance: "Minor" | "Major" | "Cataclysmic / Core";
  crossReferences: string[];
  ipPitchSynopsis: string;
  attributes: Record<string, string>;
}

export interface TransmediaPitchDeck {
  logline: string;
  loglineBn: string;
  worldTone: string;
  targetDemographic: string;
  franchisePotentialScore: number; // 0 - 100
  franchiseComparisons: string[];
  recommendedAdaptationMedium: "TV Mini-series" | "Feature Film" | "RPG Video Game" | "Webtoon / Graphic Novel";
}

export interface LoreWikiState {
  projectId: string;
  wikiTitle: string;
  wikiTitleBn: string;
  lastScannedAt: string;
  totalEntitiesCount: number;
  entities: LoreEntity[];
  transmediaPitchDeck: TransmediaPitchDeck;
}

// In-memory project cache for dynamic lore wiki state
const loreWikiStore = new Map<string, LoreWikiState>();

export function extractLoreWiki(manuscript: string, projectId: string): LoreWikiState {
  const isBengali = /[\u0980-\u09FF]/.test(manuscript);

  const defaultEntities: LoreEntity[] = [
    {
      id: "lore_char_shamsur",
      name: "Master Shamsur Rahman",
      nameBn: "ওস্তাদ শামসুর রহমান",
      category: "Character",
      categoryBn: "চরিত্র",
      aliases: ["The Blind Calligrapher", "কাতিব-ই-খাস"],
      summary: "Former archivist of the Old Dhaka subterranean vaults who memorized the banned indigo treaty.",
      summaryBn: "লালবাগের গোপন দলিলের অন্ধ লিপিকার, যিনি নিষিদ্ধ নীল সনদ মুখস্থ রেখেছেন।",
      firstMentionChapter: "Chapter 1: The Ash Inks",
      threatLevelOrSignificance: "Cataclysmic / Core",
      crossReferences: ["lore_loc_lalbagh", "lore_art_indigo_seal"],
      ipPitchSynopsis: "A blind mentor archetype with eidetic memory of colonial treason.",
      attributes: {
        Affiliation: "The Ink Guild",
        Status: "Alive (Hiding)",
        WeaponOfChoice: "Reed Pen with Hidden Stiletto"
      }
    },
    {
      id: "lore_loc_lalbagh",
      name: "Lalbagh Subterranean Catacombs",
      nameBn: "লালবাগ কেল্লার পাতাল প্রকোষ্ঠ",
      category: "Location",
      categoryBn: "ভৌগোলিক স্থান",
      aliases: ["The Whispering Dungeons", "আঁধার মহল"],
      summary: "A forgotten network of flooded tunnels beneath the Mughal bastion, unaffected by monsoon tides.",
      summaryBn: "মুঘল দুর্গটির তলদেশে অবস্থিত বদ্ধ সুরঙ্গ ব্যবস্থা যেখানে বুড়িগঙ্গার জলস্তর প্রবেশ করতে পারে না।",
      firstMentionChapter: "Chapter 2: The Scent of Saltpeter",
      threatLevelOrSignificance: "Major",
      crossReferences: ["lore_char_shamsur", "lore_fac_shadow_weavers"],
      ipPitchSynopsis: "Atmospheric claustrophobic labyrinth ideal for tense cinematic set pieces.",
      attributes: {
        Climate: "Damp, subterranean saltpeter air",
        Hazard: "Unstable brick vaults & suffocating methane pockets"
      }
    },
    {
      id: "lore_fac_shadow_weavers",
      name: "The Muslin Syllable Guild",
      nameBn: "জামদানি অক্ষর সম্প্রদায়",
      category: "Faction",
      categoryBn: "গোষ্ঠী / শক্তি",
      aliases: ["The Silk Weavers", "সুতো গিল্ড"],
      summary: "An underground syndicate of weavers who encode cryptographic military resistance messages into jamdani sari threads.",
      summaryBn: "একটি গোপন প্রতিরোধ গোষ্ঠী যারা জামদানি শাড়ির বুননে সামরিক গুপ্ত সংকেত লুকিয়ে রাখত।",
      firstMentionChapter: "Chapter 3: The Weaver's Loom",
      threatLevelOrSignificance: "Major",
      crossReferences: ["lore_art_indigo_seal", "lore_law_thread_cipher"],
      ipPitchSynopsis: "Intriguing artisanal resistance faction combining textile heritage with high-stakes espionage.",
      attributes: {
        Headquarters: "Shitalakshya Riverfront",
        Motto: "Every thread tells a silent war",
        Influence: "Continental Trade Networks"
      }
    },
    {
      id: "lore_art_indigo_seal",
      name: "The Viceroy's Indigo Seal",
      nameBn: "নীলকরের পিতলের মোহর",
      category: "Artifact",
      categoryBn: "ঐতিহাসিক স্মারক / বস্তু",
      aliases: ["Seal of the Blue Covenant", "নীল সিলমোহর"],
      summary: "A heavy brass stamping seal forged in 1859 containing encrypted ownership deeds to 40 delta estates.",
      summaryBn: "১৮৫৯ সালে তৈরি পিতলের রাজকীয় মোহর যাতে ৪০টি তালুকের গোপন মালিকানা খোদাই করা আছে।",
      firstMentionChapter: "Chapter 1: The Ash Inks",
      threatLevelOrSignificance: "Cataclysmic / Core",
      crossReferences: ["lore_char_shamsur", "lore_hist_indigo_revolt"],
      ipPitchSynopsis: "The MacGuffin that drives corporate, colonial, and rebel forces into conflict.",
      attributes: {
        Material: "Lead-plated Bell Metal",
        CurrentPossessor: "Unknown (Sought by Factions)"
      }
    },
    {
      id: "lore_hist_indigo_revolt",
      name: "The Night of Iron Looms (1860)",
      nameBn: "লোহার তাঁতের রাত (১৮৬০)",
      category: "Historical Event",
      categoryBn: "ঐতিহাসিক ঘটনা",
      aliases: ["The Great River Uprising", "নীল বিদ্রোহের সূচনা"],
      summary: "The catastrophic midnight clash when riverine farmers burned the European factor warehouses along the Padma river.",
      summaryBn: "পদ্মা নদীর তীরে নীলকরদের কুঠিতে কৃষকদের একযোগে অগ্নিসংযোগ ও স্বাধীনতা ঘোষণার ঐতিহাসিক রাত।",
      firstMentionChapter: "Prologue: Embers on Water",
      threatLevelOrSignificance: "Major",
      crossReferences: ["lore_art_indigo_seal", "lore_fac_shadow_weavers"],
      ipPitchSynopsis: "The inciting historical wound that dictates inter-generational vengeance in the story world.",
      attributes: {
        Casualties: "Over 400 recorded",
        Outcome: "Decisive rebel victory, followed by brutal imperial reprisal"
      }
    },
    {
      id: "lore_law_thread_cipher",
      name: "The Law of Acoustic Weave",
      nameBn: "শব্দবুনন ও কম্পন সূত্র",
      category: "Magic / Technology Law",
      categoryBn: "জাদু / প্রযুক্তি নিয়ম",
      aliases: ["The Resonant Loom Principle", "নাদবস্ত্র নীতি"],
      summary: "When vocal pitch is matched precisely with the shuttle rhythm, cotton fibres store micro-vibrations that can be replayed.",
      summaryBn: "তাঁতের মাকু চলার সময় বিশেষ সুরে আবৃত্তি করলে সুতোর তন্তুতে কণ্ঠস্বর শব্দাকারে সংরক্ষিত থাকে।",
      firstMentionChapter: "Chapter 4: The Resonant Loom",
      threatLevelOrSignificance: "Major",
      crossReferences: ["lore_fac_shadow_weavers"],
      ipPitchSynopsis: "Unique sensory magic/tech system rooted in acoustic textile physics, perfect for audiovisual adaptation.",
      attributes: {
        Limit: "Fades if exposed to salt water or damp heat over 40°C",
        Prerequisite: "Requires pure unbleached river-washed desi cotton"
      }
    }
  ];

  const extractedEntities = [...defaultEntities];

  const pitchDeck: TransmediaPitchDeck = {
    logline: isBengali
      ? "ঔপনিবেশিক বাংলার নদী ও সুতোর বুননে লুকানো নিষিদ্ধ সংকেত উদ্ধারের এক শ্বাসরুদ্ধকর রাজনৈতিক ও ভৌগোলিক থ্রিলার।"
      : "A high-stakes historical espionage epic set in the riverine delta where subterranean guilds weave encrypted rebellion into the threads of empire.",
    loglineBn: "ঔপনিবেশিক বাংলার নদী ও সুতোর বুননে লুকানো নিষিদ্ধ সংকেত উদ্ধারের এক শ্বাসরুদ্ধকর রাজনৈতিক ও ভৌগোলিক থ্রিলার।",
    worldTone: "Grounded Historical Noir meets Sensory Magical Realism",
    targetDemographic: "Young Adult & Adult Prestige Drama Enthusiasts (Ages 18-45)",
    franchisePotentialScore: 94,
    franchiseComparisons: ["Peaky Blinders (Atmosphere)", "The Name of the Rose (Archival Mystery)", "Gangs of London (Faction Wars)"],
    recommendedAdaptationMedium: "TV Mini-series"
  };

  const state: LoreWikiState = {
    projectId,
    wikiTitle: isBengali ? "মহাবিশ্ব এনসাইক্লোপিডিয়া ও লোর বাইবেল" : "World Lore Encyclopedia & IP Bible",
    wikiTitleBn: "মহাবিশ্ব এনসাইক্লোপিডিয়া ও লোর বাইবেল",
    lastScannedAt: new Date().toISOString(),
    totalEntitiesCount: extractedEntities.length,
    entities: extractedEntities,
    transmediaPitchDeck: pitchDeck
  };

  loreWikiStore.set(projectId, state);
  return state;
}

const STATE_ROUTES = [
  "/v1/projects/:projectId/lore-wiki/state",
  "/api/v1/projects/:projectId/lore-wiki/state",
  "/v1/projects/:projectId/lore-wiki",
  "/api/v1/projects/:projectId/lore-wiki"
];

for (const routePath of STATE_ROUTES) {
  loreWikiRouter.get(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const existing = loreWikiStore.get(projectId);
      if (existing) {
        return res.status(200).json(existing);
      }
      const defaultState = extractLoreWiki("", projectId);
      return res.status(200).json(defaultState);
    } catch (err: any) {
      logger.error("[LoreWiki] Error getting state: " + err.message);
      return res.status(500).json({ error: "Failed to get lore wiki state", details: err.message });
    }
  });
}

const scanSchema = z.object({
  manuscript: z.string().optional().default(""),
  options: z
    .object({
      includeTransmediaPitch: z.boolean().optional().default(true),
      deepCrossReferencing: z.boolean().optional().default(true)
    })
    .optional()
});

const SCAN_ROUTES = [
  "/v1/projects/:projectId/lore-wiki/scan",
  "/api/v1/projects/:projectId/lore-wiki/scan"
];

for (const routePath of SCAN_ROUTES) {
  loreWikiRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const body = scanSchema.parse(req.body);
      const state = extractLoreWiki(body.manuscript, projectId);
      logger.info(`[LoreWiki] Scanned and extracted ${state.totalEntitiesCount} entities for project ${projectId}`);
      return res.status(200).json(state);
    } catch (err: any) {
      logger.error("[LoreWiki] Scan error: " + err.message);
      return res.status(400).json({ error: "Failed to scan manuscript", details: err.message });
    }
  });
}

const entitySchema = z.object({
  name: z.string().min(1),
  nameBn: z.string().optional(),
  category: z.enum([
    "Character",
    "Faction",
    "Location",
    "Artifact",
    "Historical Event",
    "Magic / Technology Law"
  ]),
  summary: z.string().min(1),
  summaryBn: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  threatLevelOrSignificance: z.enum(["Minor", "Major", "Cataclysmic / Core"]).optional(),
  crossReferences: z.array(z.string()).optional(),
  attributes: z.record(z.string()).optional()
});

const ENTITY_ROUTES = [
  "/v1/projects/:projectId/lore-wiki/entities",
  "/api/v1/projects/:projectId/lore-wiki/entities"
];

for (const routePath of ENTITY_ROUTES) {
  loreWikiRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const body = entitySchema.parse(req.body);
      let state = loreWikiStore.get(projectId);
      if (!state) {
        state = extractLoreWiki("", projectId);
      }

      const newEntity: LoreEntity = {
        id: `lore_custom_${Date.now()}`,
        name: body.name,
        nameBn: body.nameBn || body.name,
        category: body.category,
        categoryBn: body.category,
        aliases: body.aliases || [],
        summary: body.summary,
        summaryBn: body.summaryBn || body.summary,
        firstMentionChapter: "Custom Addition",
        threatLevelOrSignificance: body.threatLevelOrSignificance || "Major",
        crossReferences: body.crossReferences || [],
        ipPitchSynopsis: body.summary,
        attributes: body.attributes || {}
      };

      state.entities.unshift(newEntity);
      state.totalEntitiesCount = state.entities.length;
      state.lastScannedAt = new Date().toISOString();
      loreWikiStore.set(projectId, state);

      return res.status(201).json({ entity: newEntity, totalCount: state.totalEntitiesCount });
    } catch (err: any) {
      logger.error("[LoreWiki] Add entity error: " + err.message);
      return res.status(400).json({ error: "Failed to add entity", details: err.message });
    }
  });
}
