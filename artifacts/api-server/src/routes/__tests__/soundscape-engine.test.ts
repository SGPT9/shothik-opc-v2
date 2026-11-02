import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  soundscapeEngineRouter,
  FOLEY_CATALOG,
  extractAcousticCues,
  generateDefaultSoundscape
} from "../soundscape-engine";

describe("Feature #13: Immersive 3D Binaural Soundscape & Audio Foley Engine", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(soundscapeEngineRouter);

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

  it("FOLEY_CATALOG contains essential Bangladeshi atmospheric layers with spatial coordinates", () => {
    expect(FOLEY_CATALOG.length).toBeGreaterThanOrEqual(5);
    const ids = FOLEY_CATALOG.map(f => f.id);
    expect(ids).toContain("foley_monsoon_rain");
    expect(ids).toContain("foley_dhaka_night_traffic");
    expect(ids).toContain("foley_sadarghat_river");
    expect(ids).toContain("foley_tea_stall_kerosene");

    const rain = FOLEY_CATALOG.find(f => f.id === "foley_monsoon_rain");
    expect(rain?.defaultPosition.y).toBeGreaterThan(0); // elevated
  });

  it("extractAcousticCues accurately detects rain, river, and traffic cues", () => {
    const text = "বৃষ্টিতে ভিজে সদরঘাটের লঞ্চে ওঠার সময় দূর থেকে ট্রাফিকের শব্দ ভেসে এলো।";
    const { cues, recommendedLayers, atmosphereProfile } = extractAcousticCues(text);

    expect(cues.some(c => c.includes("Rain"))).toBe(true);
    expect(cues.some(c => c.includes("Riverport"))).toBe(true);
    expect(cues.some(c => c.includes("Traffic"))).toBe(true);
    expect(recommendedLayers.length).toBeGreaterThanOrEqual(3);
  });

  it("GET /v1/soundscapes/catalog returns available 3D foley library", async () => {
    const res = await fetch(`${baseUrl}/v1/soundscapes/catalog`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.panningModel).toBe("HRTF");
    expect(json.data.catalog.length).toBeGreaterThanOrEqual(5);
  });

  it("GET /v1/projects/:id/soundscape returns initialized soundscape mix", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_snd/soundscape`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.layers.length).toBeGreaterThan(0);
    expect(json.data.atmosphereProfile).toBeDefined();
  });

  it("POST /v1/projects/:id/soundscape/analyze generates balanced 3D multi-track mix", async () => {
    const payload = {
      sceneText: "রাতের আঁধারে চায়ের দোকানে বসে হিমু কেটলির বাষ্পের দিকে চেয়ে রইল। বাইরে তখন তুমুল বৃষ্টি।",
      sceneTitle: "Tea Stall in Monsoon"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_snd/soundscape/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.detectedAcousticCues.length).toBeGreaterThanOrEqual(2);
    expect(json.data.layers.some((l: any) => l.foleyId === "foley_monsoon_rain")).toBe(true);
    expect(json.data.layers.some((l: any) => l.foleyId === "foley_tea_stall_kerosene")).toBe(true);
  });

  it("POST /v1/projects/:id/soundscape/render-binaural produces stereo binaural audio master", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_snd/soundscape/render-binaural`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationSeconds: 15 })
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.channels).toBe(2);
    expect(json.data.sampleRate).toBe(24000);
    expect(json.data.audioBase64).toBeDefined();
  });
});
