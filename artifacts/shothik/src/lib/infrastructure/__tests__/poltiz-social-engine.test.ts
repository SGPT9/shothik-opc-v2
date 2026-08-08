import { describe, it, expect } from "vitest";
import { PoltizSocialEngine } from "../poltiz-social-engine";

describe("PoltizSocialEngine Postiz-Compatible Growth Automation", () => {
  it("should generate formatted X threads, LinkedIn posts, and Dev.to articles with Polsia Framework 6 metrics", async () => {
    const campaign = await PoltizSocialEngine.generateGrowthCampaign({
      workspaceId: "ws_soc_test_1",
      projectTitle: "AI Writing Assistant SaaS",
      milestoneSummary: "Shipped 1-click Coolify web hosting with active SSL and OpenAPI REST playground.",
      metrics: { arr: "$7.5M", usersCount: 7000 },
      platforms: ["twitter", "linkedin", "devto"],
    });

    expect(campaign.campaignId).toBeDefined();
    expect(campaign.posts.length).toBe(3);

    const twitterPost = campaign.posts.find((p) => p.platform === "twitter");
    expect(twitterPost?.content).toContain("AI Writing Assistant SaaS");
    expect(twitterPost?.content).toContain("$7.5M");
    expect(twitterPost?.status).toBe("scheduled");
  });

  it("should publish/dispatch social post payloads cleanly", async () => {
    const publishResult = await PoltizSocialEngine.publishSocialPost({
      platform: "twitter",
      content: "Testing Postiz Agent CLI bridge dispatch!",
    });

    expect(publishResult.success).toBe(true);
    expect(publishResult.postId).toBeDefined();
  });
});
