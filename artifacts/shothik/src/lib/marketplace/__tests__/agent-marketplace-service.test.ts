/**
 * AgentMarketplaceService Unit Test Suite (Emporium Marketplace)
 */

import { describe, it, expect } from "vitest";
import { agentMarketplaceService } from "../agent-marketplace-service";

describe("AgentMarketplaceService (Emporium Platform Marketplace)", () => {
  it("returns catalog items filtered by category", () => {
    const vatItems = agentMarketplaceService.getCatalog("vat-tax");
    expect(vatItems.length).toBeGreaterThan(0);
    expect(vatItems[0].category).toBe("vat-tax");
    expect(vatItems[0].name).toContain("NBR");
  });

  it("searches Emporium catalog by query string", () => {
    const searchResults = agentMarketplaceService.getCatalog("all", "Nilkhet");
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].name).toContain("Nilkhet");
  });

  it("installs agent preset and calculates 80/20 bKash creator revenue split", () => {
    const res = agentMarketplaceService.installAgent("agent_nbr_vat");
    expect(res.success).toBe(true);
    expect(res.creatorPayoutBdt).toBe(80); // 80% of 100 BDT
    expect(res.platformFeeBdt).toBe(20); // 20% platform fee
  });

  it("throws error for non-existent agent id", () => {
    expect(() => agentMarketplaceService.installAgent("non_existent_agent")).toThrow("not found");
  });
});
