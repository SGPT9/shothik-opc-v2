import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import tabletopRouter from "../tabletop.js";

const app = express();
app.use(express.json());
app.use("/api", tabletopRouter);

describe("Feature #4: Live Director's Tabletop Scene Simulator (InkOS Play)", () => {
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

  it("GET /api/v1/projects/:id/tabletop initializes or returns active tabletop world state", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-tt-1/tabletop`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.sessionId).toBeDefined();
    expect(json.data.worldContract).toBeDefined();
    expect(json.data.visualContract).toBeDefined();
    expect(json.data.characters.length).toBeGreaterThanOrEqual(2);
    expect(json.data.clues.length).toBeGreaterThanOrEqual(2);
    expect(json.data.partyInventory.length).toBeGreaterThan(0);
    expect(json.data.turnHistory.length).toBe(1);
  });

  it("POST /api/v1/projects/:id/tabletop/step resolves a turn and updates tension", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-tt-1/tabletop/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Barricade the inner vault door with the heavy teak card catalog",
        actor: "Director",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.session.turnHistory.length).toBe(2);
    expect(json.data.latestTurn.sceneNarration).toContain("Rahman drops the brass key");
    expect(json.data.latestTurn.dialogueLines.length).toBeGreaterThan(0);
    expect(json.data.session.worldContract.tensionMeter).toBeGreaterThan(45);
  });

  it("POST /api/v1/projects/:id/tabletop/step discovers hidden clue when exploring folio", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-tt-1/tabletop/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Examine the Botany folio behind the reference desk for the secret ledger",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const clue2 = json.data.session.clues.find((c: any) => c.id === "clue-2");
    expect(clue2.status).toBe("discovered");
    expect(json.data.session.partyInventory).toContain("1952 Clandestine Financial Ledger (Black Calfskin)");
  });

  it("POST /api/v1/projects/:id/tabletop/revise rolls back the last step", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-tt-1/tabletop/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.turnHistory.length).toBe(2);
  });

  it("POST /api/v1/projects/:id/tabletop/export-prose compiles scene turns into manuscript prose", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-tt-1/tabletop/export-prose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.prose).toBeDefined();
    expect(json.data.wordCount).toBeGreaterThan(50);
    expect(json.data.prose).toContain("Professor Rahman");
  });
});
