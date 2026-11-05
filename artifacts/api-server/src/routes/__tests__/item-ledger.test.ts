import { describe, it, expect } from "vitest";
import {
  createItemLedgerRouter,
  auditManuscriptInventory,
  DEFAULT_ITEMS,
  type InventoryItem
} from "../item-ledger.js";

describe("Capability #35: Strict Physical Item Economy & Ammunition Ledger", () => {
  it("maintains deterministic inventory items with ammunition and encumbrance metrics", () => {
    expect(DEFAULT_ITEMS.length).toBeGreaterThanOrEqual(4);
    const revolver = DEFAULT_ITEMS.find((i) => i.id === "item_webley_revolver");
    expect(revolver).toBeDefined();
    expect(revolver?.maxCapacity).toBe(6);
    expect(revolver?.currentCharges).toBe(2);
    expect(revolver?.weightKg).toBeGreaterThan(0.5);
  });

  it("audits manuscript text and detects ammunition depletion violations", () => {
    // Manuscript describing 4 gunshots when revolver only has 2 charges left
    const shootingScene = "গুলি চলল চারবার। প্রথম গুলি লক্ষ্যভ্রষ্ট হলেও পরের তিনবার ফায়ার করতেই আততায়ী মাটিতে লুটিয়ে পড়ল।";
    const audit = auditManuscriptInventory(shootingScene, DEFAULT_ITEMS);

    expect(audit.anomalies.length).toBeGreaterThanOrEqual(1);
    const ammoAnomaly = audit.anomalies.find((a) => a.severity === "critical_depletion");
    expect(ammoAnomaly).toBeDefined();
    expect(ammoAnomaly?.message).toContain("গুলি অবশিষ্ট ছিল");
    expect(audit.generatedInventoryScene).toContain("রিভলভারটি");
  });

  it("detects encumbrance overload when character carries excessive weight", () => {
    const heavyItems: InventoryItem[] = [
      ...DEFAULT_ITEMS,
      {
        id: "item_heavy_chest",
        name: "Solid Teak Iron-Bound Strongbox",
        nameBn: "লোহার পাত বসানো ভারী কাঠের সিন্ধুক",
        category: "relic",
        owner: "ওসি রফিক (OC Rafiq)",
        quantity: 1,
        weightKg: 28.5,
        condition: "pristine",
        originChapter: 3,
        lastUsedChapter: 3,
        isEquipped: true,
        notes: "Filled with British silver coins and deed ledgers."
      }
    ];

    const audit = auditManuscriptInventory("", heavyItems);
    const overloadAnomaly = audit.anomalies.find((a) => a.severity === "encumbrance_overload");
    expect(overloadAnomaly).toBeDefined();
    expect(overloadAnomaly?.message).toContain("ওজন");
  });

  it("exports an Express router function for item ledger state and consumption", () => {
    const router = createItemLedgerRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
