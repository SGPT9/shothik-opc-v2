import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Bengali Plagiarism & Citation Engine Suite", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("POST /api/academic/plagiarism/scan detects plagiarism and formats citations", async () => {
    const res = await fetch(`${baseUrl}/api/academic/plagiarism/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "স্বয়ংক্রিয় বাংলা ব্যাকরণ ও কৃত্রিম বুদ্ধিমত্তা বিশ্লেষণ",
        author: "আহমেদ সাদমান",
        text: "এই গবেষণায় কৃত্রিম বুদ্ধিমত্তা ও ভাষা প্রক্রিয়াকরণ মডেল ব্যবহার করে বাংলা ব্যাকরণ ও সিনট্যাক্স বিশ্লেষণ করা হয়েছে। ফলাফল অত্যন্ত আশাব্যঞ্জক।",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.report.reportId).toMatch(/^PLAG-/);
    expect(json.report.matches.length).toBeGreaterThan(0);
    expect(json.report.generatedCitations.apa).toContain("আহমেদ সাদমান");
    expect(json.report.auditHashSha256).toHaveLength(64);
  });
});
