import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import projectsRouter from "../projects.js";

const app = express();
app.use(express.json());
app.use("/api", projectsRouter);

describe("Project Room Link & Plot Branching", () => {
  let server: any;
  let baseUrl: string;
  const testUserId = `test_owner_${Date.now()}`;
  let rootProjectId: string;

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

  it("creates a base project and generates a shareable room link", async () => {
    // 1. Create base project
    const createRes = await fetch(`${baseUrl}/api/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        title: "Dusk over Padma River",
        type: "book",
        description: "A novel with alternative plot branches",
      }),
    });
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    rootProjectId = createJson.data.id;

    // 2. Generate shareable room link
    const shareRes = await fetch(`${baseUrl}/api/v1/projects/create-share-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        projectId: rootProjectId,
        accessMode: "link_edit",
      }),
    });

    expect(shareRes.status).toBe(200);
    const shareJson = await shareRes.json();
    expect(shareJson.success).toBe(true);
    expect(shareJson.data.shareToken).toMatch(/^prj_sh_[a-f0-9]{8}$/);
    expect(shareJson.data.accessMode).toBe("link_edit");
    expect(shareJson.data.shareUrl).toContain(shareJson.data.shareToken);
  });

  it("creates a plot branch with isolated storyline state", async () => {
    const branchRes = await fetch(`${baseUrl}/api/v1/projects/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        parentProjectId: rootProjectId,
        branchName: "Alternative-Tragic-Ending",
      }),
    });

    expect(branchRes.status).toBe(201);
    const branchJson = await branchRes.json();
    expect(branchJson.success).toBe(true);
    expect(branchJson.data.branchName).toBe("Alternative-Tragic-Ending");
    expect(branchJson.data.parentProjectId).toBe(rootProjectId);
    expect(branchJson.data.title).toContain("(Branch: Alternative-Tragic-Ending)");
  });

  it("lists all storyline branches for the project lineage", async () => {
    const listRes = await fetch(`${baseUrl}/api/v1/projects/${rootProjectId}/branches`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(Array.isArray(listJson.data)).toBe(true);
    expect(listJson.data.some((b: any) => b.branchName === "Alternative-Tragic-Ending")).toBe(true);
  });
});
