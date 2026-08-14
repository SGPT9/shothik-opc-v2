import { describe, it, expect, beforeEach } from "vitest";
import { DailyDigestService } from "../daily-digest-service";
import { saveOfflineTask, clearOfflineStorage } from "@/lib/offline/offline-storage";

describe("Daily CEO Briefing Digest Service (DailyDigestService.ts)", () => {
  beforeEach(() => {
    clearOfflineStorage();
  });

  it("generates an executive HTML morning briefing digest with overnight deliverables", () => {
    saveOfflineTask({
      id: "t-night-1",
      title: "Deploy Let's Encrypt SSL container on Dokploy",
      category: "Code",
      status: "completed",
      cost: "5 Credits",
      updatedAt: Date.now(),
    });

    const digest = DailyDigestService.generateDigest("VerifiQ AI");

    expect(digest.completedTasksCount).toBe(1);
    expect(digest.htmlContent).toContain("Deploy Let's Encrypt SSL container on Dokploy");
    expect(digest.htmlContent).toContain("SHOTHIK TWIN · DAILY CEO BRIEFING");
    expect(digest.netMarginPct).toBe(84.6);
    expect(digest.containerMemoryMb).toBe(28.4);
  });

  it("dispatches test digest email successfully", async () => {
    const result = await DailyDigestService.sendDigest("founder@startup.com");

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("msg_");
    expect(result.timestamp).toBeGreaterThan(0);
  });
});
