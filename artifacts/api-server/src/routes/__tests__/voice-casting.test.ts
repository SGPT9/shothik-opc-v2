import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  voiceCastingRouter,
  generateDefaultCastRoster,
  AVAILABLE_PERSONAS,
  synthesizeDialogueLine
} from "../voice-casting";

describe("Feature #11: Multi-Cast Voice Casting & Dialect Director", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(voiceCastingRouter);

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

  it("AVAILABLE_PERSONAS lists all 4 24kHz Bangla Voice AI personas with metadata", () => {
    expect(AVAILABLE_PERSONAS.length).toBe(4);
    const personaIds = AVAILABLE_PERSONAS.map(p => p.id);
    expect(personaIds).toContain("ayesha_sales");
    expect(personaIds).toContain("nusrat_banking");
    expect(personaIds).toContain("zara_corporate");
    expect(personaIds).toContain("tania_casual");

    const ayesha = AVAILABLE_PERSONAS.find(p => p.id === "ayesha_sales");
    expect(ayesha?.pitchHz).toBe(215);
  });

  it("GET /v1/voice-casting/available-personas returns available engine catalog", async () => {
    const res = await fetch(`${baseUrl}/v1/voice-casting/available-personas`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.engineSampleRate).toBe(24000);
    expect(json.data.personas.length).toBe(4);
  });

  it("GET /v1/projects/:id/voice-casting returns full character roster", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_casting/voice-casting`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.characters.length).toBeGreaterThanOrEqual(4);

    const himu = json.data.characters.find((c: any) => c.characterId === "char_himu");
    expect(himu).toBeDefined();
    expect(himu.personaId).toBe("ayesha_sales");
    expect(himu.dialect).toBe("Standard Dhaka Bangla");
  });

  it("POST /v1/projects/:id/voice-casting/assign updates character vocal settings", async () => {
    const payload = {
      characterId: "char_himu",
      characterName: "হিমু (Himu)",
      personaId: "ayesha_sales",
      dialect: "Standard Dhaka Bangla",
      pitchOffsetSemitones: -3,
      speakingRate: 0.9,
      defaultEmotion: "empathetic",
      customPronunciations: [{ word: "হলুদ", phoneticIpa: "holud" }],
      sampleLine: "আজ রাতে খালি পায়ে শহর দেখা যাক।"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_casting/voice-casting/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.pitchOffsetSemitones).toBe(-3);
    expect(json.data.speakingRate).toBe(0.9);
  });

  it("POST /v1/projects/:id/voice-casting/audition returns valid 24kHz audio synthesis", async () => {
    const payload = {
      characterName: "হিমু",
      personaId: "ayesha_sales",
      text: "আমি কোনো নিয়ম মানি না।",
      emotion: "empathetic"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_casting/voice-casting/audition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.audioBase64).toBeDefined();
    expect(json.data.sampleRate).toBe(24000);
    expect(json.data.latencyMs).toBeGreaterThan(0);
  });

  it("POST /v1/projects/:id/voice-casting/render-scene renders multi-cast dialogue clips", async () => {
    const sceneScript = `হিমু: এত রাতে বৃষ্টিতে হাঁটার আনন্দ আলাদা।
বাদল: হিমু ভাই, আমার ভয় করছে!
হিমু আকাশের দিকে তাকিয়ে নিঃশব্দে হাসল।`;

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_casting/voice-casting/render-scene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneText: sceneScript })
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.totalClips).toBe(3);
    expect(json.data.clips[0].speaker).toContain("হিমু");
    expect(json.data.clips[1].speaker).toContain("বাদল");
    expect(json.data.clips[2].speaker).toContain("কথক");
    expect(json.data.totalDurationSeconds).toBeGreaterThan(1);
  });
});
