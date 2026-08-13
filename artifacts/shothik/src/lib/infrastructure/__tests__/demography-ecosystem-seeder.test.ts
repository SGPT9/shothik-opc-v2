import { describe, it, expect } from "vitest";
import { DemographyEcosystemSeeder } from "../demography-ecosystem-seeder";

describe("DemographyEcosystemSeeder Validation", () => {
  it("should seed 5 South Asian ecosystem domains (Stores, BCS, Remittances, Porchas, Webhooks)", async () => {
    const seed = await DemographyEcosystemSeeder.seedDemographyEcosystemData();

    expect(seed.merchantStoresSeeded).toBe(3);
    expect(seed.bcsQuestionsSeeded).toBe(50);
    expect(seed.freelancerRemittancesSeeded).toBe(25);
    expect(seed.landPorchasSeeded).toBe(40);
    expect(seed.mfsWebhooksSeeded).toBe(100);
  });
});
