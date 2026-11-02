import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { multiverseRouter, generateDefaultMultiverseLedger } from "../multiverse";

describe("Feature #8: 'What-If?' Multi-Verse & Fanfiction Canon Sandbox", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(multiverseRouter);

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

  it("generateDefaultMultiverseLedger creates 4 timeline archetypes", () => {
    const ledger = generateDefaultMultiverseLedger("test_proj_mv");
    expect(ledger.timelines.length).toBe(4);
    expect(ledger.timelines.some(t => t.mode === "canon")).toBe(true);
    expect(ledger.timelines.some(t => t.mode === "au")).toBe(true);
    expect(ledger.timelines.some(t => t.mode === "ooc")).toBe(true);
    expect(ledger.timelines.some(t => t.mode === "relationship")).toBe(true);
  });

  it("GET /api/v1/projects/:id/multiverse returns multiverse timeline ledger", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/test_proj_mv/multiverse`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.timelines.length).toBeGreaterThanOrEqual(4);
    expect(json.data.activeTimelineId).toBeDefined();
  });

  it("POST /api/v1/projects/:id/multiverse/branch spawns a new timeline branch", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/test_proj_mv/multiverse/branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "AU: The Midnight Heist Succeeded",
        mode: "au",
        divergenceChapter: 4,
        divergencePremise: "What if the safe was cracked before the alarm triggered?"
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.createdBranch.name).toBe("AU: The Midnight Heist Succeeded");
    expect(json.data.createdBranch.rippleEffects.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/projects/:id/multiverse/simulate synthesizes an alternate scene draft", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/test_proj_mv/multiverse/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timelineId: "tl_au_witness_alive",
        sceneBeatPrompt: "হিমু নৌকায় করে নদী পার হচ্ছে।"
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.simulatedScene).toBeDefined();
    expect(json.data.simulatedScene.length).toBeGreaterThan(20);
  });

  it("POST /api/v1/projects/:id/multiverse/promote updates canon timeline", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/test_proj_mv/multiverse/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timelineId: "tl_au_witness_alive"
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const promoted = json.data.timelines.find((t: any) => t.id === "tl_au_witness_alive");
    expect(promoted.isCanon).toBe(true);
  });
});
