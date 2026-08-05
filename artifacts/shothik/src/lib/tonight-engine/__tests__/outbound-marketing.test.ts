import { describe, it, expect, vi } from "vitest";
import { OutboundMarketingService } from "../outbound-marketing";
import fs from "fs";
import path from "path";

vi.mock("fs", () => {
  const m = {
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
  };
  return {
    ...m,
    default: m,
  };
});

describe("OutboundMarketingService", () => {
  it("should extract email leads from synthesized reports correctly", async () => {
    const mockReport = `
      # Product Research
      Here is a list of targeted outreach leads:
      - John Doe (john.doe@example.com)
      - Jane Miller (jane@startup.io)
    `;

    const result = await OutboundMarketingService.extractAndRegisterCampaigns({
      runId: "run_test_123",
      workspaceId: "ws_123",
      finalReport: mockReport,
      prompt: "Extract leads for outbound sales",
    });

    expect(result.leadsCount).toBe(2);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("should parse social media drafts block correctly", async () => {
    const mockReport = `
      # Marketing Campaign Draft
      [Twitter]
      Announcing our new open-source platform! Check it out at shothik.app #oss #nextjs
      
      [LinkedIn]
      We are thrilled to share the launch of our collaborative agency swarm orchestration engine!
    `;

    const result = await OutboundMarketingService.extractAndRegisterCampaigns({
      runId: "run_test_456",
      workspaceId: "ws_456",
      finalReport: mockReport,
      prompt: "Draft some social updates",
    });

    expect(result.postsCount).toBe(2);
  });
});
