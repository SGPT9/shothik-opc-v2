/**
 * Skill Provider Registry — Unified Cross-Platform Skill Discovery
 * Adapted from DeepSeek Harness packages/skill/ (skill capability family)
 *
 * "This family discovers reusable agent instructions and exposes them to
 *  the model through a provider-neutral catalog and loader."
 *
 * Unified registry that discovers skills from:
 *  - ECC .agents/skills/ (local filesystem)
 *  - ShothikGPT Emporium (platform marketplace)
 *  - DSH cordis.yml skill plugins (harness config)
 */

// ── Types ───────────────────────────────────────────────

export type SkillSource = 'ecc' | 'emporium' | 'dsh' | 'custom';

export interface SkillDescriptor {
  /** Unique skill identifier (e.g., 'dsh-goal-driver', 'tdd-workflow') */
  readonly id: string;
  /** Human-readable display name */
  readonly name: string;
  /** Brief description of what the skill does */
  readonly description: string;
  /** Which system this skill comes from */
  readonly source: SkillSource;
  /** Filesystem path to SKILL.md (if local) */
  readonly path?: string;
  /** Semantic version */
  readonly version: string;
  /** Tags for search and categorization */
  readonly tags: readonly string[];
  /** When to use this skill (activation triggers) */
  readonly triggers: readonly string[];
  /** Whether the skill is currently loaded/active */
  loaded: boolean;
  /** Load timestamp */
  loadedAt?: number;
}

export interface SkillCatalogEntry {
  readonly descriptor: SkillDescriptor;
  /** Relevance score (0-1) based on query match */
  readonly relevance: number;
}

export interface SkillProviderPlugin {
  /** Unique provider ID */
  readonly id: string;
  /** Provider name */
  readonly name: string;
  /** Which source this provider serves */
  readonly source: SkillSource;
  /** Discover available skills from this provider */
  discover(): Promise<readonly SkillDescriptor[]>;
  /** Load a specific skill's content */
  load(skillId: string): Promise<string | null>;
}

// ── Skill Provider Registry ─────────────────────────────

export class SkillProviderRegistry {
  private readonly providers: Map<string, SkillProviderPlugin> = new Map();
  private readonly catalog: Map<string, SkillDescriptor> = new Map();
  private readonly loadedContent: Map<string, string> = new Map();
  private lastDiscoveryAt: number = 0;

  /**
   * Register a skill provider plugin.
   * Returns a disposer function (registrations are effects).
   */
  registerProvider(provider: SkillProviderPlugin): () => void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Skill provider already registered: ${provider.id}`);
    }
    this.providers.set(provider.id, provider);

    return () => {
      this.providers.delete(provider.id);
      // Remove skills from this provider
      for (const [id, desc] of this.catalog) {
        if (desc.source === provider.source) {
          this.catalog.delete(id);
          this.loadedContent.delete(id);
        }
      }
    };
  }

  /**
   * Discover all skills from all registered providers.
   * Merges results into the unified catalog.
   */
  async discoverAll(): Promise<readonly SkillDescriptor[]> {
    const allSkills: SkillDescriptor[] = [];

    for (const provider of this.providers.values()) {
      try {
        const skills = await provider.discover();
        for (const skill of skills) {
          this.catalog.set(skill.id, skill);
          allSkills.push(skill);
        }
      } catch (err) {
        // Provider failure shouldn't break discovery for others
        console.error(`Skill provider "${provider.id}" discovery failed:`, err);
      }
    }

    this.lastDiscoveryAt = Date.now();
    return allSkills;
  }

  /**
   * Search the catalog by query string.
   * Matches against name, description, tags, and triggers.
   * Returns sorted by relevance.
   */
  search(query: string): readonly SkillCatalogEntry[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 0);

    const results: SkillCatalogEntry[] = [];

    for (const descriptor of this.catalog.values()) {
      const relevance = this.computeRelevance(descriptor, queryTerms);
      if (relevance > 0) {
        results.push({ descriptor, relevance });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get the full catalog.
   */
  getCatalog(): readonly SkillDescriptor[] {
    return Array.from(this.catalog.values());
  }

  /**
   * Get skills filtered by source.
   */
  getBySource(source: SkillSource): readonly SkillDescriptor[] {
    return Array.from(this.catalog.values()).filter((s) => s.source === source);
  }

  /**
   * Load a skill's content (the SKILL.md instructions).
   * Caches loaded content for subsequent requests.
   */
  async loadSkill(skillId: string): Promise<string | null> {
    // Check cache first
    if (this.loadedContent.has(skillId)) {
      return this.loadedContent.get(skillId)!;
    }

    const descriptor = this.catalog.get(skillId);
    if (!descriptor) {
      return null;
    }

    // Find the provider for this skill's source
    for (const provider of this.providers.values()) {
      if (provider.source === descriptor.source) {
        try {
          const content = await provider.load(skillId);
          if (content) {
            this.loadedContent.set(skillId, content);
            descriptor.loaded = true;
            descriptor.loadedAt = Date.now();
            return content;
          }
        } catch {
          // Try next provider of same source
        }
      }
    }

    return null;
  }

  /**
   * Find the best matching skill for a given task context.
   * Uses trigger matching and tag relevance.
   */
  findBestMatch(context: string): SkillCatalogEntry | null {
    const results = this.search(context);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get registry status.
   */
  getStatus(): {
    providerCount: number;
    catalogSize: number;
    loadedSkills: number;
    lastDiscoveryAt: number;
    bySource: Record<string, number>;
  } {
    const bySource: Record<string, number> = {};
    for (const desc of this.catalog.values()) {
      bySource[desc.source] = (bySource[desc.source] ?? 0) + 1;
    }

    return {
      providerCount: this.providers.size,
      catalogSize: this.catalog.size,
      loadedSkills: this.loadedContent.size,
      lastDiscoveryAt: this.lastDiscoveryAt,
      bySource,
    };
  }

  private computeRelevance(descriptor: SkillDescriptor, queryTerms: string[]): number {
    if (queryTerms.length === 0) return 0;

    let score = 0;
    const searchable = [
      descriptor.name.toLowerCase(),
      descriptor.description.toLowerCase(),
      ...descriptor.tags.map((t) => t.toLowerCase()),
      ...descriptor.triggers.map((t) => t.toLowerCase()),
    ].join(' ');

    for (const term of queryTerms) {
      // Exact ID match — highest relevance
      if (descriptor.id.toLowerCase() === term) {
        score += 1.0;
        continue;
      }
      // Name contains term
      if (descriptor.name.toLowerCase().includes(term)) {
        score += 0.8;
        continue;
      }
      // Tag exact match
      if (descriptor.tags.some((t) => t.toLowerCase() === term)) {
        score += 0.7;
        continue;
      }
      // Trigger match
      if (descriptor.triggers.some((t) => t.toLowerCase().includes(term))) {
        score += 0.6;
        continue;
      }
      // Description contains term
      if (searchable.includes(term)) {
        score += 0.3;
      }
    }

    // Normalize by query length
    return Math.min(score / queryTerms.length, 1.0);
  }
}

// ── Built-in ECC Filesystem Skill Provider ──────────────

/**
 * Discovers skills from ECC .agents/skills/ directory structure.
 * Each subdirectory with a SKILL.md is a skill.
 */
export class EccFilesystemSkillProvider implements SkillProviderPlugin {
  readonly id = 'ecc-filesystem';
  readonly name = 'ECC Local Skills';
  readonly source: SkillSource = 'ecc';

  constructor(private readonly basePath: string) {}

  async discover(): Promise<readonly SkillDescriptor[]> {
    // This would scan basePath for SKILL.md files
    // For now, return empty — actual FS scanning depends on runtime
    return [];
  }

  async load(skillId: string): Promise<string | null> {
    // Would read the SKILL.md file from disk
    return null;
  }
}

/**
 * Discovers skills from ShothikGPT Emporium marketplace.
 */
export class EmporiumSkillProvider implements SkillProviderPlugin {
  readonly id = 'shothik-emporium';
  readonly name = 'ShothikGPT Emporium';
  readonly source: SkillSource = 'emporium';

  constructor(private readonly apiBaseUrl?: string) {}

  async discover(): Promise<readonly SkillDescriptor[]> {
    // Would query Emporium API for available skills
    // Placeholder — actual implementation depends on Emporium API
    return [];
  }

  async load(skillId: string): Promise<string | null> {
    // Would fetch skill content from Emporium API
    return null;
  }
}
