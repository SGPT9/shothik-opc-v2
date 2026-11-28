import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  bookTokGeneratorRouter,
  BOOKTOK_TEMPLATES,
  compileLipSyncTimeline,
  generateDefaultTeaser
} from "../booktok-generator";

describe("Feature #14: 2D Talking-Head Lip-Sync Video & BookTok Teaser Generator", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(bookTokGeneratorRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it("BOOKTOK_TEMPLATES lists viral video styles for TikTok and Reels", () => {
    expect(BOOKTOK_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    const ids = BOOKTOK_TEMPLATES.map(t => t.id);
    expect(ids).toContain("tpl_midnight_hook");
    expect(ids).toContain("tpl_character_confession");
    expect(ids).toContain("tpl_plot_twist_betrayal");
  });

  it("compileLipSyncTimeline generates 25fps visemes and kinetic subtitles", () => {
    const script = "রাত আড়াইটায় দরজায় কে কড়া নাড়ল?";
    const duration = 5.0;
    const { subtitles, visemes } = compileLipSyncTimeline(script, duration);

    expect(subtitles.length).toBe(6);
    expect(visemes.length).toBe(Math.floor(duration * 25));
    expect(visemes[0].viseme).toBeDefined();
    expect(visemes.some(v => v.eyeBlink)).toBe(true);
  });

  it("GET /v1/projects/:id/booktok/templates returns template catalog", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_btk/booktok/templates`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.templates.length).toBeGreaterThanOrEqual(3);
    expect(json.data.supportedAspectRatios).toContain("9:16");
  });

  it("GET /v1/projects/:id/booktok/current returns initialized video teaser manifest", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_btk/booktok/current`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.aspectRatio).toBe("9:16");
    expect(json.data.kineticSubtitles.length).toBeGreaterThan(0);
    expect(json.data.visemeTimeline.length).toBeGreaterThan(0);
  });

  it("POST /v1/projects/:id/booktok/generate-script extracts viral hook from manuscript", async () => {
    const payload = {
      manuscriptExcerpt: "বুড়িগঙ্গার ওপার থেকে হঠাৎ এক অচেনা চিৎকার ভেসে এলো। হিমু থমকে দাঁড়াল।",
      templateId: "tpl_midnight_hook",
      characterName: "হিমু"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_btk/booktok/generate-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.hookLine).toContain("বুড়িগঙ্গার ওপার থেকে");
    expect(json.data.hookViralScore).toBeGreaterThanOrEqual(80);
  });

  it("POST /v1/projects/:id/booktok/render-teaser compiles full 9:16 lip-sync video manifest", async () => {
    const payload = {
      title: "Himu 15s Midnight Teaser",
      templateId: "tpl_midnight_hook",
      characterName: "হিমু (Himu)",
      personaId: "ayesha_sales",
      scriptText: "আমি কোনো নিয়ম মানি না, নিয়ম আমাকে খুঁজে নেয়।",
      aspectRatio: "9:16"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_btk/booktok/render-teaser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.aspectRatio).toBe("9:16");
    expect(json.data.audioBase64).toBeDefined();
    expect(json.data.visemeTimeline.length).toBeGreaterThan(0);
    expect(json.data.durationSeconds).toBeGreaterThan(0);
  });
});
