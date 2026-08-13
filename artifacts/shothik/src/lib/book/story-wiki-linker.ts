/**
 * Story Wiki Linker & Bidirectional Entity Engine
 * Inspired by MateClaw LLM-Wiki Architecture
 * 
 * Features:
 *  - Extract [[Entity|Alias]] markdown wikilinks
 *  - Automated prose entity detection and HTML wiki-span annotation
 *  - Bidirectional forward and backlink graph compilation
 */

export interface WikiLoreEntity {
  id: string;
  name: string;
  aliases?: string[];
  category: 'character' | 'setting' | 'plot_hook' | 'general';
  details: string;
}

export interface ExtractedWikiLink {
  target: string;
  alias: string;
}

export interface ChapterSource {
  id: string;
  title: string;
  content: string;
}

export interface BidirectionalGraph {
  entities: Record<string, {
    entity: WikiLoreEntity;
    referencedInChapters: string[];
  }>;
  chapters: Record<string, {
    chapterId: string;
    chapterTitle: string;
    referencedEntityIds: string[];
  }>;
}

/**
 * Extracts explicit [[Target|Alias]] or [[Target]] wikilinks from text.
 */
export function extractWikiLinks(text: string): ExtractedWikiLink[] {
  if (!text) return [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: ExtractedWikiLink[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const target = match[1].trim();
    const alias = match[2] ? match[2].trim() : target;
    if (target) {
      links.push({ target, alias });
    }
  }

  return links;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Autolinks entity names/aliases in prose into interactive HTML spans.
 * Avoids replacing matches inside existing HTML tags/attributes.
 */
export function autoLinkEntities(htmlOrProse: string, entities: WikiLoreEntity[]): string {
  if (!htmlOrProse || !entities || entities.length === 0) return htmlOrProse || '';

  const textMap = new Map<string, { entityId: string; category: string }>();
  const patterns: string[] = [];

  for (const entity of entities) {
    const names = [entity.name, ...(entity.aliases || [])].filter(Boolean);
    for (const name of names) {
      const lower = name.toLowerCase();
      if (!textMap.has(lower)) {
        textMap.set(lower, { entityId: entity.id, category: entity.category });
        patterns.push(escapeRegex(name));
      }
    }
  }

  if (patterns.length === 0) return htmlOrProse;

  // Sort patterns by length descending so longer phrases match first
  patterns.sort((a, b) => b.length - a.length);
  const combinedRegex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');

  // Split content by HTML tags so we only replace text in prose nodes
  const parts = htmlOrProse.split(/(<[^>]+>)/g);

  return parts.map((part) => {
    // If it's an HTML tag, don't modify it
    if (part.startsWith('<') && part.endsWith('>')) {
      return part;
    }

    return part.replace(combinedRegex, (match) => {
      const info = textMap.get(match.toLowerCase());
      if (!info) return match;
      return `<span class="story-wiki-link cursor-pointer underline decoration-brand/40 hover:decoration-brand text-brand font-medium" data-wiki-target="${info.entityId}" data-wiki-category="${info.category}">${match}</span>`;
    });
  }).join('');
}

/**
 * Builds a complete bidirectional knowledge graph linking entities to chapters and vice-versa.
 */
export function buildBidirectionalGraph(
  entities: WikiLoreEntity[],
  chapters: ChapterSource[]
): BidirectionalGraph {
  const entityMap: BidirectionalGraph['entities'] = {};
  const chapterMap: BidirectionalGraph['chapters'] = {};

  for (const entity of entities) {
    entityMap[entity.id] = {
      entity,
      referencedInChapters: [],
    };
  }

  for (const chapter of chapters) {
    const matchedEntityIds = new Set<string>();
    const textContent = chapter.content || '';

    // Check explicit [[wikilinks]]
    const explicitLinks = extractWikiLinks(textContent);
    for (const link of explicitLinks) {
      const targetLower = link.target.toLowerCase();
      const found = entities.find(
        e => e.name.toLowerCase() === targetLower || e.aliases?.some(a => a.toLowerCase() === targetLower)
      );
      if (found) {
        matchedEntityIds.add(found.id);
      }
    }

    // Check natural text occurrences
    for (const entity of entities) {
      const namesToCheck = [entity.name, ...(entity.aliases || [])];
      for (const name of namesToCheck) {
        const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
        if (regex.test(textContent)) {
          matchedEntityIds.add(entity.id);
          break;
        }
      }
    }

    const referencedList = Array.from(matchedEntityIds);
    chapterMap[chapter.id] = {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      referencedEntityIds: referencedList,
    };

    for (const entityId of referencedList) {
      if (entityMap[entityId]) {
        entityMap[entityId].referencedInChapters.push(chapter.id);
      }
    }
  }

  return {
    entities: entityMap,
    chapters: chapterMap,
  };
}
