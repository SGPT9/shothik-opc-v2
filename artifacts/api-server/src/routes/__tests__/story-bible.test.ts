import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  storyBibleRouter,
  generateDefaultStoryBible,
  searchBibleEntities
} from "../story-bible";

describe("Feature #10: Sub-Millisecond Offline Story Bible HUD", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(storyBibleRouter);

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

  it("generateDefaultStoryBible initializes entities across all 4 categories", () => {
    const store = generateDefaultStoryBible("proj_test_bible");
    expect(store.entities.length).toBeGreaterThanOrEqual(5);
    expect(store.entities.some(e => e.category === "character")).toBe(true);
    expect(store.entities.some(e => e.category === "location")).toBe(true);
    expect(store.entities.some(e => e.category === "world_rule")).toBe(true);
    expect(store.entities.some(e => e.category === "timeline_event")).toBe(true);
  });

  it("searchBibleEntities executes in < 5ms with BM25 ranking", () => {
    const store = generateDefaultStoryBible("proj_test_bible");
    const { results, latencyMs } = searchBibleEntities(store.entities, "হিমু");
    expect(latencyMs).toBeLessThan(5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("হিমু");
  });

  it("GET /api/v1/projects/:id/story-bible returns complete story bible store", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_bible/story-bible`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.entities.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/projects/:id/story-bible/search returns filtered query matches", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_bible/story-bible/search?q=sadarghat`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.latencyMs).toBeLessThan(10);
    expect(json.data.results.length).toBeGreaterThan(0);
    expect(json.data.results[0].category).toBe("location");
  });

  it("POST /api/v1/projects/:id/story-bible/entities creates a new lore entry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_bible/story-bible/entities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "character",
        name: "রুপা (Rupa)",
        aliases: ["নীল শাড়ি"],
        summary: "The ethereal blue-sari wearing muse waiting by the telephone.",
        details: "Lives in an upper-middle-class house in Dhanmondi. Endlessly calls Himu's aunt's landline.",
        tags: ["love_interest", "dhanmondi"],
        firstMentionChapter: 3,
        relationships: [{ targetEntityName: "হিমু (Himu)", relationshipType: "Beloved" }]
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("রুপা (Rupa)");
  });
});
