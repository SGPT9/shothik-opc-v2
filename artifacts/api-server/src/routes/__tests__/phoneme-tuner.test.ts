import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  phonemeTunerRouter,
  analyzeBengaliPhonetics,
  generateDefaultPhonemeDictionary,
  convertBengaliToIpa
} from "../phoneme-tuner";

describe("Feature #12: Custom Phoneme & Diacritic Pronunciation Tuner", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(phonemeTunerRouter);

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

  it("analyzeBengaliPhonetics accurately identifies diacritics and generates IPA", () => {
    const analysis = analyzeBengaliPhonetics("বাঁশঝাড়");
    expect(analysis.diacritics.hasChandrabindu).toBe(true);
    expect(analysis.diacritics.hasHasanta).toBe(false);
    expect(analysis.ipa).toContain("~̃");
    expect(analysis.ssmlPhoneme).toContain('<phoneme alphabet="ipa"');
  });

  it("GET /v1/projects/:id/phonemes returns initialized dictionary entries", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_phn/phonemes`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.entries.length).toBeGreaterThanOrEqual(4);

    const himu = json.data.entries.find((e: any) => e.grapheme === "হিমালয়");
    expect(himu).toBeDefined();
    expect(himu.category).toBe("character_name");
  });

  it("POST /v1/projects/:id/phonemes/transcribe returns syllabification and SSML", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_phn/phonemes/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: "কহিনুর" })
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.word).toBe("কহিনুর");
    expect(json.data.ipa).toBeDefined();
    expect(json.data.syllabification.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /v1/projects/:id/phonemes upserts a custom pronunciation entry", async () => {
    const payload = {
      grapheme: "অনিরুদ্ধ",
      ipa: "onirudːʱo",
      category: "character_name",
      notes: "Protagonist's shadow self"
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_phn/phonemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.grapheme).toBe("অনিরুদ্ধ");
    expect(json.data.ipa).toBe("onirudːʱo");
    expect(json.data.diacritics.hasHasanta).toBe(true);
  });

  it("POST /v1/projects/:id/phonemes/scan-manuscript detects compound phonetic candidates", async () => {
    const sampleText = "রাতের অন্ধকারে সোমেশ্বরী নদীর তীরে নৈঋত কোণে বাঁশঝাড় কাঁপছিল। অন্তরীক্ষে তখন বিদ্যুৎ চমকাচ্ছিল।";

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_phn/phonemes/scan-manuscript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manuscriptText: sampleText })
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.totalScannedWords).toBeGreaterThan(0);
    expect(json.data.candidates).toBeDefined();
    expect(json.data.candidates.length).toBeGreaterThanOrEqual(1);
  });

  it("DELETE /v1/projects/:id/phonemes/:entryId removes custom entry", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_phn/phonemes/phn_himu`, {
      method: "DELETE"
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
  });
});
