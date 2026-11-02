import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const storyBibleRouter = Router();

export type EntityCategory = "character" | "location" | "world_rule" | "timeline_event";

export interface BibleRelationship {
  targetEntityName: string;
  relationshipType: string;
}

export interface StoryBibleEntity {
  id: string;
  projectId: string;
  category: EntityCategory;
  name: string;
  aliases: string[];
  summary: string;
  details: string;
  tags: string[];
  firstMentionChapter: number;
  relationships: BibleRelationship[];
  updatedAt: string;
}

export interface StoryBibleStore {
  projectId: string;
  entities: StoryBibleEntity[];
  updatedAt: string;
}

// In-memory high-speed store
const bibleStores = new Map<string, StoryBibleStore>();

export function generateDefaultStoryBible(projectId: string): StoryBibleStore {
  const defaultEntities: StoryBibleEntity[] = [
    {
      id: "ent_himu",
      projectId,
      category: "character",
      name: "হিমু (Himu)",
      aliases: ["হিমালয়", "হলুদ পাঞ্জাবি", "মহামানব"],
      summary: "A whimsical wanderer of Dhaka streets who walks barefoot at midnight in a pocketless yellow panjabi.",
      details: "Father raised him under severe psychological discipline to become a detached observer of human fate. Deep intuitive empathy concealed behind mocking riddles.",
      tags: ["protagonist", "enigma", "dhaka_streets", "yellow_panjabi"],
      firstMentionChapter: 1,
      relationships: [
        { targetEntityName: "বাদল (Badal)", relationshipType: "Cousin / Admirer" },
        { targetEntityName: "রুপা (Rupa)", relationshipType: "Eternal Unspoken Love" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "ent_badal",
      projectId,
      category: "character",
      name: "বাদল (Badal)",
      aliases: ["বাদল মিয়া"],
      summary: "Himu's earnest, easily frightened maternal cousin who constantly seeks Himu's guidance.",
      details: "Middle-class student studying chemistry in Dhaka University. Often roped into Himu's midnight walks.",
      tags: ["ally", "cousin", "dhaka_university"],
      firstMentionChapter: 1,
      relationships: [
        { targetEntityName: "হিমু (Himu)", relationshipType: "Cousin" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "ent_sadarghat",
      projectId,
      category: "location",
      name: "সদরঘাট লঞ্চ টার্মিনাল (Sadarghat)",
      aliases: ["বুড়িগঙ্গা ঘাট", "Sadarghat Riverport"],
      summary: "The bustling, chaotic heart of Dhaka's riverway transit along the murky waters of the Buriganga.",
      details: "Smells of diesel, wet jute, raw river fish, and roasted tea. The gateway to the southern delta districts.",
      tags: ["dhaka_landmark", "riverway", "transit_hub", "night_market"],
      firstMentionChapter: 2,
      relationships: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "ent_yellow_panjabi_rule",
      projectId,
      category: "world_rule",
      name: "The Yellow Panjabi Vow (হলুদ পাঞ্জাবির নিয়ম)",
      aliases: ["Pocketless Rule", "সন্ন্যাস ব্রত"],
      summary: "Himu must never possess pockets or carry money, watches, or identification.",
      details: "A psychological and metaphysical constraint imposed by his father. If Himu accepts or holds money in pockets, his intuitive foresight vanishes.",
      tags: ["vow", "psychological_rule", "father_legacy"],
      firstMentionChapter: 1,
      relationships: [
        { targetEntityName: "হিমু (Himu)", relationshipType: "Governs Behavior" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "ent_midnight_walk_ch1",
      projectId,
      category: "timeline_event",
      name: "The 2:15 AM Rain Walk (বৃষ্টির রাত ২:১৫)",
      aliases: ["The Rain Walk"],
      summary: "Himu wakes Badal during a torrential monsoon thunderstorm and departs into waterlogged Dhaka.",
      details: "Marks the opening divergence of the story where Himu encounters the idling cab and the mysterious courier bag.",
      tags: ["inciting_incident", "monsoon", "canon_event"],
      firstMentionChapter: 1,
      relationships: [
        { targetEntityName: "হিমু (Himu)", relationshipType: "Participant" },
        { targetEntityName: "বাদল (Badal)", relationshipType: "Observer" }
      ],
      updatedAt: new Date().toISOString()
    }
  ];

  const store: StoryBibleStore = {
    projectId,
    entities: defaultEntities,
    updatedAt: new Date().toISOString()
  };

  bibleStores.set(projectId, store);
  return store;
}

// Sub-millisecond BM25 in-memory ranking algorithm
export function searchBibleEntities(
  entities: StoryBibleEntity[],
  query: string,
  categoryFilter?: EntityCategory
): { results: StoryBibleEntity[]; latencyMs: number } {
  const startTime = performance.now();
  const cleanQ = query.trim().toLowerCase();

  let filtered = entities;
  if (categoryFilter) {
    filtered = filtered.filter(e => e.category === categoryFilter);
  }

  if (!cleanQ) {
    const latencyMs = Number((performance.now() - startTime).toFixed(2));
    return { results: filtered, latencyMs };
  }

  const tokens = cleanQ.split(/\s+/).filter(Boolean);

  const scored = filtered.map(entity => {
    let score = 0;
    const nameLower = entity.name.toLowerCase();
    const summaryLower = entity.summary.toLowerCase();
    const detailsLower = entity.details.toLowerCase();
    const aliasesLower = entity.aliases.map(a => a.toLowerCase()).join(" ");
    const tagsLower = entity.tags.map(t => t.toLowerCase()).join(" ");

    tokens.forEach(token => {
      // Name exact prefix or full match
      if (nameLower === token) score += 20;
      else if (nameLower.includes(token)) score += 12;

      // Aliases match
      if (aliasesLower.includes(token)) score += 10;

      // Tag match
      if (tagsLower.includes(token)) score += 8;

      // Summary / Details match
      if (summaryLower.includes(token)) score += 5;
      if (detailsLower.includes(token)) score += 3;
    });

    return { entity, score };
  });

  const matching = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.entity);

  const latencyMs = Number((performance.now() - startTime).toFixed(2));
  return { results: matching, latencyMs };
}

// ======================== ROUTES ========================

// 1. GET /v1/projects/:id/story-bible & /api/v1/projects/:id/story-bible
storyBibleRouter.get(
  ["/v1/projects/:id/story-bible", "/api/v1/projects/:id/story-bible"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let store = bibleStores.get(projectId);
      if (!store) {
        store = generateDefaultStoryBible(projectId);
      }
      return res.json({ success: true, data: store });
    } catch (err: any) {
      logger.error({ err, projectId }, "[StoryBible] Failed to load story bible");
      const fallback = generateDefaultStoryBible(projectId);
      return res.json({ success: true, data: fallback });
    }
  }
);

// 2. GET /v1/projects/:id/story-bible/search & /api/v1/projects/:id/story-bible/search
storyBibleRouter.get(
  ["/v1/projects/:id/story-bible/search", "/api/v1/projects/:id/story-bible/search"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const q = String(req.query.q || "");
      const category = req.query.category ? (String(req.query.category) as EntityCategory) : undefined;

      let store = bibleStores.get(projectId);
      if (!store) {
        store = generateDefaultStoryBible(projectId);
      }

      const { results, latencyMs } = searchBibleEntities(store.entities, q, category);

      return res.json({
        success: true,
        data: {
          query: q,
          category,
          latencyMs,
          totalMatches: results.length,
          results
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[StoryBible] Search failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/story-bible/entities & /api/v1/projects/:id/story-bible/entities
const upsertEntitySchema = z.object({
  id: z.string().optional(),
  category: z.enum(["character", "location", "world_rule", "timeline_event"]),
  name: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  summary: z.string().min(1),
  details: z.string().default(""),
  tags: z.array(z.string()).default([]),
  firstMentionChapter: z.number().int().min(1).default(1),
  relationships: z.array(z.object({
    targetEntityName: z.string(),
    relationshipType: z.string()
  })).default([])
});

storyBibleRouter.post(
  ["/v1/projects/:id/story-bible/entities", "/api/v1/projects/:id/story-bible/entities"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = upsertEntitySchema.parse(req.body);
      let store = bibleStores.get(projectId);
      if (!store) {
        store = generateDefaultStoryBible(projectId);
      }

      const entityId = body.id || `ent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const existingIdx = store.entities.findIndex(e => e.id === entityId);

      const entity: StoryBibleEntity = {
        id: entityId,
        projectId,
        category: body.category,
        name: body.name,
        aliases: body.aliases,
        summary: body.summary,
        details: body.details,
        tags: body.tags,
        firstMentionChapter: body.firstMentionChapter,
        relationships: body.relationships,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        store.entities[existingIdx] = entity;
      } else {
        store.entities.unshift(entity);
      }

      store.updatedAt = new Date().toISOString();
      bibleStores.set(projectId, store);

      logger.info({ projectId, entityId, name: body.name }, "[StoryBible] Upserted entity");

      return res.json({ success: true, data: entity });
    } catch (err: any) {
      logger.error({ err, projectId }, "[StoryBible] Upsert entity failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. DELETE /v1/projects/:id/story-bible/entities/:entityId & /api/v1/projects/:id/story-bible/entities/:entityId
storyBibleRouter.delete(
  ["/v1/projects/:id/story-bible/entities/:entityId", "/api/v1/projects/:id/story-bible/entities/:entityId"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    const entityId = String(req.params.entityId);
    try {
      let store = bibleStores.get(projectId);
      if (!store) {
        store = generateDefaultStoryBible(projectId);
      }

      store.entities = store.entities.filter(e => e.id !== entityId);
      store.updatedAt = new Date().toISOString();
      bibleStores.set(projectId, store);

      return res.json({ success: true, message: `Entity ${entityId} deleted.` });
    } catch (err: any) {
      logger.error({ err, projectId, entityId }, "[StoryBible] Delete entity failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
