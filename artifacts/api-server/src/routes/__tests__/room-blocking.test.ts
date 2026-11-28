import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  roomBlockingRouter,
  checkRaySegmentIntersection,
  computeCharacterSightlines,
  generateDefaultRoomLayout
} from "../room-blocking";

describe("Feature #15: 3D Spatial Room Blocking & Line-of-Sight Canvas", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(roomBlockingRouter);

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

  it("checkRaySegmentIntersection identifies orthogonal intersection correctly", () => {
    const rayStart = { x: 0, y: 5 };
    const rayEnd = { x: 10, y: 5 };
    const segStart = { x: 5, y: 0 };
    const segEnd = { x: 5, y: 10 };

    const hits = checkRaySegmentIntersection(rayStart, rayEnd, segStart, segEnd);
    expect(hits).toBe(true);

    // Non-intersecting ray
    const missRayStart = { x: 0, y: 12 };
    const missRayEnd = { x: 10, y: 12 };
    const misses = checkRaySegmentIntersection(missRayStart, missRayEnd, segStart, segEnd);
    expect(misses).toBe(false);
  });

  it("computeCharacterSightlines flags Mahogany Bookshelf barrier between Himu and Badal", () => {
    const layout = generateDefaultRoomLayout("proj_test_blk");
    const sightlines = computeCharacterSightlines(layout);

    const himuToBadal = sightlines.find(
      s => s.sourceCharId === "char_himu" && s.targetCharId === "char_badal"
    );

    expect(himuToBadal).toBeDefined();
    expect(himuToBadal?.hasClearLineOfSight).toBe(false);
    expect(himuToBadal?.blockingObstacleName).toContain("Mahogany Bookshelf");
  });

  it("GET /v1/projects/:id/room-blocking returns layout with characters and obstacles", async () => {
    const res = await fetch(`${baseUrl}/v1/projects/proj_test_blk/room-blocking`);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.layout.characters.length).toBeGreaterThanOrEqual(3);
    expect(json.data.layout.obstacles.length).toBeGreaterThanOrEqual(2);
    expect(json.data.sightlines.length).toBeGreaterThan(0);
  });

  it("POST /v1/projects/:id/room-blocking/update-layout updates character position", async () => {
    const payload = {
      characters: [
        {
          id: "char_himu",
          name: "হিমু (Himu)",
          position: { x: 6.0, y: 3.5 }, // Moved past partition!
          facingAngleDeg: 90,
          fovConeDeg: 120,
          elevation: "standing" as const,
          color: "#eab308"
        },
        {
          id: "char_badal",
          name: "বাদল (Badal)",
          position: { x: 7.5, y: 3.5 },
          facingAngleDeg: 270,
          fovConeDeg: 120,
          elevation: "seated" as const,
          color: "#3b82f6"
        }
      ]
    };

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_blk/room-blocking/update-layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);

    const newHimuToBadal = json.data.sightlines.find(
      (s: any) => s.sourceCharId === "char_himu" && s.targetCharId === "char_badal"
    );
    expect(newHimuToBadal.hasClearLineOfSight).toBe(true);
  });

  it("POST /v1/projects/:id/room-blocking/audit-scene flags occluded sightline bug in prose", async () => {
    // Reset to default layout where partition blocks them
    generateDefaultRoomLayout("proj_test_blk");

    const res = await fetch(`${baseUrl}/v1/projects/proj_test_blk/room-blocking/audit-scene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneProse: "হিমু ঘরে ঢুকেই সোজা বাদলের চোখে পড়ল হিমু। বাদল ফিসফিস করে কথা বলতে লাগল।"
      })
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.inconsistencies.length).toBeGreaterThanOrEqual(1);
    expect(json.data.stagingHealthScore).toBeLessThan(100);
  });
});
