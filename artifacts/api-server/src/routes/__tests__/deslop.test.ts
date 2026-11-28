import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import deslopRouter, { SLOP_RULES } from "../deslop.js";

const app = express();
app.use(express.json());
app.use("/api", deslopRouter);

describe("Feature #3: Semantic Prose De-Slopper Suite", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
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

  it("verifies all 7 rubric categories are present in SLOP_RULES", () => {
    const ruleIds = SLOP_RULES.map((r) => r.id);
    expect(ruleIds).toContain("emotion_labeling");
    expect(ruleIds).toContain("unsupported_conclusions");
    expect(ruleIds).toContain("formulaic_triads");
    expect(ruleIds).toContain("generic_transitions");
    expect(ruleIds).toContain("decorative_purple_prose");
    expect(ruleIds).toContain("cliche_metaphors");
    expect(ruleIds).toContain("bengali_idiom_dilution");
    expect(SLOP_RULES.length).toBe(7);
  });

  it("GET /api/v1/projects/:id/deslop returns audit data for project", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-test-1/deslop`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.projectId).toBe("proj-test-1");
    expect(json.data.findings.length).toBeGreaterThan(0);
    expect(json.data.cleanlinessScore).toBeGreaterThanOrEqual(0);
    expect(json.data.cleanlinessScore).toBeLessThanOrEqual(100);
    expect(json.data.rubricSummary.emotion_labeling).toBeDefined();
    expect(json.data.rubricSummary.bengali_idiom_dilution).toBeDefined();
  });

  it("POST /api/v1/projects/:id/deslop/audit correctly flags emotion labeling, unsupported conclusions, and triads", async () => {
    const sample = `Professor Rahman felt an overwhelming sense of melancholy. This changed everything forever in ways they could not imagine. He was surrounded by pain, hope, and longing in the stale air. A palpable silence fell over the room.`;

    const res = await fetch(`${baseUrl}/api/v1/projects/proj-test-1/deslop/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sample,
        intensity: "standard",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.findings.length).toBeGreaterThanOrEqual(4);

    const rulesFound = json.data.findings.map((f: any) => f.ruleId);
    expect(rulesFound).toContain("emotion_labeling");
    expect(rulesFound).toContain("unsupported_conclusions");
    expect(rulesFound).toContain("formulaic_triads");
    expect(rulesFound).toContain("generic_transitions");
  });

  it("POST /api/v1/projects/:id/deslop/audit catches Bengali synthetic idiom dilution", async () => {
    const bengaliSample = `তার মনে গভীর আশঙ্কার সৃষ্টি হলো যখন সে খবরটি শুনল। সে আকস্মিকভাবে হতভম্ব হয়ে গেল এবং পরিস্থিতি অত্যন্ত জটিল হয়ে গেল।`;

    const res = await fetch(`${baseUrl}/api/v1/projects/proj-test-bn/deslop/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: bengaliSample,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const idiomFindings = json.data.findings.filter((f: any) => f.ruleId === "bengali_idiom_dilution");
    expect(idiomFindings.length).toBeGreaterThanOrEqual(2);
    expect(idiomFindings[0].vernacularTip).toBeDefined();
  });

  it("POST /api/v1/projects/:id/deslop/rewrite successfully de-slops text and boosts cleanliness score", async () => {
    const sloppedText = `In the archives, he felt an overwhelming sense of melancholy. This changed everything forever. Little did he know that fate was waiting. তার মনে গভীর আশঙ্কার সৃষ্টি হলো।`;

    const res = await fetch(`${baseUrl}/api/v1/projects/proj-test-rewrite/deslop/rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sloppedText,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.changesApplied).toBeGreaterThan(0);
    expect(json.data.rewrittenText).not.toContain("overwhelming sense of melancholy");
    expect(json.data.rewrittenText).not.toContain("This changed everything forever");
    expect(json.data.rewrittenText).toContain("ছ্যাঁত করে উঠল");
    expect(json.data.projectedCleanlinessScore).toBeGreaterThan(json.data.previousCleanlinessScore);
  });
});
