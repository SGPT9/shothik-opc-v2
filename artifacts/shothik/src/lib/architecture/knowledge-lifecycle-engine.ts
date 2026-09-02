/**
 * ShothikGPT 12-Pillar Reference Architecture — Pillar 4: Knowledge Lifecycle Engine
 * 
 * Manages knowledge lifecycle end-to-end:
 *   Ingest ➔ Normalize ➔ Index ➔ Retrieve ➔ Validate ➔ Update ➔ Expire ➔ Re-index
 */

export interface KnowledgeRecord {
  id: string;
  sourceUri: string;
  authorityScore: number; // 0.0 to 1.0
  freshnessScore: number; // 0.0 to 1.0
  rawContent: string;
  normalizedContent: string;
  vectorEmbedding?: number[];
  version: number;
  createdAtIso: string;
  expiresAtIso?: string;
  tags: string[];
  conflictStatus: 'clean' | 'resolved' | 'conflict_flagged';
}

export class KnowledgeLifecycleEngine {
  private records: Map<string, KnowledgeRecord> = new Map();

  /**
   * 1. INGEST & 2. NORMALIZE
   */
  public ingest(sourceUri: string, rawContent: string, authorityScore = 0.9, tags: string[] = []): KnowledgeRecord {
    const normalizedContent = this.normalizeText(rawContent);
    const id = `kn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const record: KnowledgeRecord = {
      id,
      sourceUri,
      authorityScore,
      freshnessScore: 1.0,
      rawContent,
      normalizedContent,
      version: 1,
      createdAtIso: now.toISOString(),
      tags,
      conflictStatus: 'clean',
    };

    this.records.set(id, record);
    return record;
  }

  /**
   * 3. INDEX & 4. RETRIEVE
   */
  public retrieve(query: string, limit = 5): KnowledgeRecord[] {
    const normalizedQuery = this.normalizeText(query);
    const results: Array<{ record: KnowledgeRecord; score: number }> = [];

    for (const record of Array.from(this.records.values())) {
      let matchScore = 0;

      const words = normalizedQuery.split(/\s+/);
      for (const word of words) {
        if (word && record.normalizedContent.toLowerCase().includes(word.toLowerCase())) {
          matchScore += 1;
        }
      }

      if (matchScore > 0) {
        const finalScore = matchScore * record.authorityScore * record.freshnessScore;
        results.push({ record, score: finalScore });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => r.record);
  }

  /**
   * 5. VALIDATE & 6. UPDATE & 7. EXPIRE
   */
  public updateRecord(id: string, newContent: string): KnowledgeRecord | null {
    const existing = this.records.get(id);
    if (!existing) return null;

    const updated: KnowledgeRecord = {
      ...existing,
      rawContent: newContent,
      normalizedContent: this.normalizeText(newContent),
      version: existing.version + 1,
      freshnessScore: 1.0,
    };

    this.records.set(id, updated);
    return updated;
  }

  public expireStaleRecords(maxAgeDays = 30): number {
    const now = new Date().getTime();
    let expiredCount = 0;

    for (const record of Array.from(this.records.values())) {
      const created = new Date(record.createdAtIso).getTime();
      const ageDays = (now - created) / (1000 * 60 * 60 * 24);

      if (ageDays > maxAgeDays) {
        record.freshnessScore = Math.max(0.1, 1.0 - (ageDays - maxAgeDays) * 0.05);
        if (record.freshnessScore <= 0.2) {
          record.conflictStatus = 'conflict_flagged';
          expiredCount++;
        }
      }
    }

    return expiredCount;
  }

  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/পানী/g, 'পানি') // Bangla Academy spelling normalization
      .replace(/সরকারী/g, 'সরকারি');
  }

  public getAll(): KnowledgeRecord[] {
    return Array.from(this.records.values());
  }
}
