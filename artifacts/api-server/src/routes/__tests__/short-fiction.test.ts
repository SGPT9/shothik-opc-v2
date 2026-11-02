import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import shortFictionRouter from "../short-fiction.js";

const app = express();
app.use(express.json());
app.use("/api", shortFictionRouter);

describe("Feature #5: Automated Commercial Short-Fiction Package Studio", () => {
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

  it("GET /api/v1/projects/:id/short-fiction returns complete 12-chapter commercial package", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-sf-1/short-fiction`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.packageId).toBeDefined();
    expect(json.data.logline).toBeDefined();
    expect(json.data.sellingPoints.length).toBeGreaterThanOrEqual(3);
    expect(json.data.characters.length).toBeGreaterThanOrEqual(3);
    expect(json.data.coverArtPrompts.frontCover).toBeDefined();
    expect(json.data.chapters.length).toBe(12);
    expect(json.data.totalWordCount).toBeGreaterThan(1500);
  });

  it("POST /api/v1/projects/:id/short-fiction/generate creates custom genre package", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-sf-custom/short-fiction/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Neon Dhaka 2084",
        genre: "Cyberpunk Political Noir",
        premise: "An augmented bio-hacker uncovers suppressed algorithmic election ciphers in Old Dhaka.",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("Neon Dhaka 2084");
    expect(json.data.genre).toBe("Cyberpunk Political Noir");
    expect(json.data.chapters.length).toBe(12);
  });

  it("POST /api/v1/projects/:id/short-fiction/apply-chapters formats all 12 chapters for manuscript", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-sf-1/short-fiction/apply-chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.chapters.length).toBe(12);
    expect(json.data.chapters[0].title).toBe("Chapter 1: The Broken Red Seal");
    expect(json.data.chapters[11].title).toBe("Chapter 12: Ink and Thunder");
  });

  it("GET /api/v1/projects/:id/short-fiction/export-markdown downloads full publication markdown", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj-sf-1/short-fiction/export-markdown`);
    expect(res.status).toBe(200);
    const markdown = await res.text();
    expect(markdown).toContain("# The Curzon Cipher");
    expect(markdown).toContain("Commercial Sales Pitch & Logline");
    expect(markdown).toContain("Chapter 1: The Broken Red Seal");
    expect(markdown).toContain("Chapter 12: Ink and Thunder");
  });
});
