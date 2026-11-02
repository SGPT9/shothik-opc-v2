import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import foreshadowingRouter from "../foreshadowing.js";

const app = express();
app.use(express.json());
app.use("/api", foreshadowingRouter);

describe("Feature #6: Chekhov’s Gun & Plot Foreshadowing Lifecycle Tracker", () => {
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

  it("GET /api/v1/projects/:id/foreshadowing returns 4-stage lifecycle ledger", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-fg-1/foreshadowing`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.guns.length).toBeGreaterThanOrEqual(4);
    expect(json.data.payoffHealthScore).toBeGreaterThan(50);
    expect(json.data.totalOpen).toBeDefined();
    expect(json.data.totalProgressing).toBeDefined();
    expect(json.data.totalDeferred).toBeDefined();
  });

  it("POST /api/v1/projects/:id/foreshadowing/upsert registers a new narrative gun", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-fg-1/foreshadowing/upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cyanide Capsule inside Fountain Pen",
        category: "physical_prop",
        state: "open",
        setupChapter: 2,
        setupSnippet: "The gold nib unscrewed backward to reveal a tiny glass ampoule of potassium cyanide.",
        expectedPayoffChapter: 11,
        payoffNotes: "Threatened to be used during the basement interrogation.",
        urgency: "critical",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const savedGun = json.data.guns.find((g: any) => g.name.includes("Cyanide Capsule"));
    expect(savedGun).toBeDefined();
    expect(savedGun.urgency).toBe("critical");
  });

  it("POST /api/v1/projects/:id/foreshadowing/transition advances gun state to resolved", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-fg-1/foreshadowing/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gunId: "gun-1",
        nextState: "resolved",
        chapter: 11,
        note: "Revolver fired to break padlock on Keraniganj pressroom.",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const gun1 = json.data.guns.find((g: any) => g.id === "gun-1");
    expect(gun1.state).toBe("resolved");
    expect(gun1.resolvedChapter).toBe(11);
  });

  it("POST /api/v1/projects/:id/foreshadowing/scan audits manuscript and computes health score", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-fg-1/foreshadowing/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.payoffHealthScore).toBeGreaterThanOrEqual(0);
    expect(json.data.payoffHealthScore).toBeLessThanOrEqual(100);
  });
});
