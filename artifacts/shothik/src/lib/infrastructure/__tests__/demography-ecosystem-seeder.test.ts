import { describe, it, expect } from "vitest";
import { DemographyEcosystemSeeder } from "../demography-ecosystem-seeder";

describe("DemographyEcosystemSeeder Mega-Scale Validation", () => {
  it("should seed 10 F-Commerce Stores, 200 BCS Questions, 100 Remittances, 150 Porchas, 500 Webhooks across 8 Divisions", async () => {
    const seed = await DemographyEcosystemSeeder.seedDemographyEcosystemData();

    expect(seed.merchantStoresSeeded).toBe(10);
    expect(seed.bcsQuestionsSeeded).toBe(200);
    expect(seed.freelancerRemittancesSeeded).toBe(100);
    expect(seed.landPorchasSeeded).toBe(150);
    expect(seed.mfsWebhooksSeeded).toBe(500);
    expect(seed.divisionsCovered).toBe(8);
    expect(seed.totalSeededRecords).toBe(960);
  });
});
