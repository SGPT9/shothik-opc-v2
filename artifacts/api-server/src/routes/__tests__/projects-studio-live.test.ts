import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import projectsRouter from "../projects.js";

const app = express();
app.use(express.json());
app.use("/api", projectsRouter);

describe("Shothik Writing Studio Projects & Autosave Live Integration", () => {
  let server: any;
  let baseUrl: string;
  const testUserId = `test_user_studio_${Date.now()}`;
  let createdProjectId: string;
  const localProjectId = `local_proj_${Date.now()}`;

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

  it("creates a new project in Postgres via POST /api/v1/projects", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
        "Idempotency-Key": `idem_proj_${Date.now()}`,
      },
      body: JSON.stringify({
        title: "Amar Boi - A Novel on Modern Bangladesh",
        type: "book",
        description: "An AI assisted novel exploring socio-economic transformations",
        sections: [
          { id: "sec_1", title: "Chapter 1: The Meghna Delta", wordCount: 1200 },
        ],
        settings: {
          tone: "literary",
          dialect: "standard_colloquial",
        },
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    expect(json.data.title).toBe("Amar Boi - A Novel on Modern Bangladesh");
    expect(json.data.userId).toBe(testUserId);
    expect(json.data.sections).toHaveLength(1);
    createdProjectId = json.data.id;
  });

  it("lists projects for the user via GET /api/v1/projects", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.some((p: any) => p.id === createdProjectId)).toBe(true);
  });

  it("retrieves the created project by ID via GET /api/v1/projects/:id", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/${createdProjectId}`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(createdProjectId);
    expect(json.data.type).toBe("book");
  });

  it("updates project details via PATCH /api/v1/projects/:id", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/${createdProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        content: "মেঘনা নদীর তীরে সকালের কুয়াশা ধীরে ধীরে কাটছে...",
        wordCount: 8,
        progress: 25,
        starred: true,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.progress).toBe(25);
    expect(json.data.starred).toBe(true);
    expect(json.data.content).toContain("মেঘনা");
  });

  it("saves and retrieves autosave draft via /api/v1/writing/autosave", async () => {
    // 1. POST autosave
    const saveRes = await fetch(`${baseUrl}/api/v1/writing/autosave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        localProjectId,
        content: "Draft in progress - paragraph 1",
        wordCount: 5,
      }),
    });

    expect(saveRes.status).toBe(200);
    const saveJson = await saveRes.json();
    expect(saveJson.success).toBe(true);
    expect(saveJson.data.localProjectId).toBe(localProjectId);

    // 2. GET autosave
    const getRes = await fetch(`${baseUrl}/api/v1/writing/autosave/${localProjectId}`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.success).toBe(true);
    expect(getJson.data.content).toBe("Draft in progress - paragraph 1");
    expect(getJson.data.wordCount).toBe(5);
  });

  it("deletes the project via DELETE /api/v1/projects/:id", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/${createdProjectId}`, {
      method: "DELETE",
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(createdProjectId);

    // Verify it is deleted
    const verifyRes = await fetch(`${baseUrl}/api/v1/projects/${createdProjectId}`, {
      headers: {
        "x-user-id": testUserId,
      },
    });
    expect(verifyRes.status).toBe(404);
  });
});
