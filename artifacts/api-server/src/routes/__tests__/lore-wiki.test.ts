import { describe, it, expect } from "vitest";
import {
  extractLoreWiki,
  type LoreEntity,
  type TransmediaPitchDeck
} from "../lore-wiki";

describe("Autonomous World Lore Wiki & Encyclopedia Engine (Capability #31)", () => {
  it("scans manuscript chapters to extract rich multi-category world lore entities", () => {
    const manuscript = "ওস্তাদ শামসুর রহমান লালবাগ কেল্লার পাতাল প্রকোষ্ঠে বসে নিষিদ্ধ নীল মোহরের পাঠোদ্ধার করছিলেন।";
    const wiki = extractLoreWiki(manuscript, "proj_lore_test");

    expect(wiki.projectId).toBe("proj_lore_test");
    expect(wiki.wikiTitle).toBeTruthy();
    expect(wiki.wikiTitleBn).toBeTruthy();
    expect(wiki.totalEntitiesCount).toBeGreaterThanOrEqual(6);
    expect(wiki.entities.length).toBeGreaterThanOrEqual(6);

    const categories = wiki.entities.map((e) => e.category);
    expect(categories).toContain("Character");
    expect(categories).toContain("Location");
    expect(categories).toContain("Faction");
    expect(categories).toContain("Artifact");
    expect(categories).toContain("Historical Event");
    expect(categories).toContain("Magic / Technology Law");

    // Check entity structure
    for (const entity of wiki.entities) {
      expect(entity.id).toBeTruthy();
      expect(entity.name).toBeTruthy();
      expect(entity.nameBn).toBeTruthy();
      expect(entity.summary).toBeTruthy();
      expect(entity.summaryBn).toBeTruthy();
      expect(["Minor", "Major", "Cataclysmic / Core"]).toContain(entity.threatLevelOrSignificance);
      expect(Array.isArray(entity.aliases)).toBe(true);
      expect(Array.isArray(entity.crossReferences)).toBe(true);
      expect(typeof entity.attributes).toBe("object");
    }
  });

  it("generates an IP licensing and transmedia pitch deck with franchise potential metrics", () => {
    const wiki = extractLoreWiki("A tale of delta guilds and acoustic threads.", "proj_pitch_test");
    const pitch: TransmediaPitchDeck = wiki.transmediaPitchDeck;

    expect(pitch).toBeTruthy();
    expect(pitch.logline).toBeTruthy();
    expect(pitch.loglineBn).toBeTruthy();
    expect(pitch.worldTone).toBeTruthy();
    expect(pitch.targetDemographic).toBeTruthy();
    expect(pitch.franchisePotentialScore).toBeGreaterThanOrEqual(80);
    expect(pitch.franchiseComparisons.length).toBeGreaterThanOrEqual(2);
    expect(["TV Mini-series", "Feature Film", "RPG Video Game", "Webtoon / Graphic Novel"]).toContain(
      pitch.recommendedAdaptationMedium
    );
  });

  it("validates cross-referencing between related world lore nodes", () => {
    const wiki = extractLoreWiki("", "proj_crossref_test");
    const shamsur = wiki.entities.find((e) => e.id === "lore_char_shamsur");
    expect(shamsur).toBeDefined();
    expect(shamsur?.crossReferences).toContain("lore_loc_lalbagh");
    expect(shamsur?.crossReferences).toContain("lore_art_indigo_seal");

    const lalbagh = wiki.entities.find((e) => e.id === "lore_loc_lalbagh");
    expect(lalbagh).toBeDefined();
    expect(lalbagh?.crossReferences).toContain("lore_char_shamsur");
  });
});
