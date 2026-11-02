import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  styleDnaRouter,
  calculateStylometrics,
  determineArchetypes,
  compileVoiceLockSystemPrompt
} from "../style-dna";

describe("Feature #7: Literary Style DNA & Author Voice Fingerprinting", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(styleDnaRouter);

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

  it("calculates accurate stylometrics for mixed dialogue and prose", () => {
    const sampleText = `
হিমু জানালার পাশে দাঁড়াল। বাইরে অঝোর ধারায় বৃষ্টি ঝরছে।
"কোথায় যাচ্ছিস তুই?" বাদল জিজ্ঞেস করল।
"বাইরে নামছি।" হিমু হাসল।
বাতাস ছিল ভিজে আর ঠাণ্ডা।
`;
    const metrics = calculateStylometrics(sampleText);

    expect(metrics.totalWords).toBeGreaterThan(10);
    expect(metrics.totalSentences).toBeGreaterThanOrEqual(4);
    expect(metrics.meanSentenceLength).toBeGreaterThan(0);
    expect(metrics.dialogueRatio).toBeGreaterThan(0);
    expect(metrics.typeTokenRatio).toBeGreaterThan(0);
    expect(metrics.rhythmDistribution).toBeDefined();
    expect(metrics.sensoryBreakdown).toBeDefined();
  });

  it("matches primary literary archetypes and generates a system prompt", () => {
    const sampleText = `
"আজ রাতে চাঁদের আলো কেমন?"
"খুব মায়াবী।" সে বলল।
"তাহলে চল হাঁটি।"
`;
    const metrics = calculateStylometrics(sampleText);
    const { primary, benchmarks } = determineArchetypes(metrics);

    expect(primary.name).toBeDefined();
    expect(benchmarks.length).toBe(4);

    const prompt = compileVoiceLockSystemPrompt("Test Story", metrics, primary, [
      "Avoid melodramatic tears."
    ]);
    expect(prompt).toContain("[SHOTHIK INKOS: AUTHOR VOICE LOCK DIRECTIVE]");
    expect(prompt).toContain("Avoid melodramatic tears.");
  });

  it("GET /api/v1/projects/:id/style-dna returns project DNA with benchmarks", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_style/style-dna`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.projectId).toBe("proj_test_style");
    expect(json.data.metrics).toBeDefined();
    expect(json.data.archetype).toBeDefined();
    expect(json.data.benchmarkArchetypes.length).toBe(4);
    expect(json.data.voiceLockSystemPrompt).toContain("AUTHOR VOICE LOCK DIRECTIVE");
  });

  it("POST /api/v1/projects/:id/style-dna/analyze recalculates metrics on submitted text", async () => {
    const customProse = `
The heavy rain drummed against the tin roof with a steady, relentless hum.
"Are you leaving tonight?" she asked, her voice a fragile whisper in the dark.
"I have no choice," he replied, tightening his rough wool collar.
`;
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_style/style-dna/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: customProse, title: "Night Whispers" })
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.metrics.totalWords).toBeGreaterThan(20);
    expect(json.data.metrics.sensoryBreakdown.auditory).toBeGreaterThan(0);
    expect(json.data.archetype).toBeDefined();
  });

  it("POST /api/v1/projects/:id/style-dna/lock toggles voice lock and updates custom directives", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_style/style-dna/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locked: true,
        customRules: ["Strictly prevent melodramatic climaxes.", "Prioritize acoustic sensory details."]
      })
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.voiceLocked).toBe(true);
    expect(json.data.customRules).toContain("Strictly prevent melodramatic climaxes.");
    expect(json.data.voiceLockSystemPrompt).toContain("Strictly prevent melodramatic climaxes.");
  });

  it("POST /api/v1/projects/:id/style-dna/generate-continuation outputs side-by-side vanilla vs locked drafts", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_style/style-dna/generate-continuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "হিমু মাঝরাতে বৃষ্টিতে ভিজতে নামল।"
      })
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.vanilla.text).toBeDefined();
    expect(json.data.locked.text).toBeDefined();
    expect(json.data.vanilla.critique).toBeDefined();
    expect(json.data.locked.critique).toBeDefined();
  });
});
