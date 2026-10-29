import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import agentsRouter from "../agents.js";
import scheduleRouter from "../schedule.js";
import { memoryRouter } from "../memory.js";

const app = express();
app.use(express.json());
app.use("/api/agents", agentsRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api", memoryRouter);

describe("Agents Roster and Scheduler Route Suite", () => {
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

  describe("Agents Roster Endpoints", () => {
    it("GET /api/agents returns list of agents with 200", async () => {
      const res = await fetch(`${baseUrl}/api/agents`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("role");
    });

    it("POST /api/agents creates a new agent successfully", async () => {
      const payload = {
        name: "Financial Auditor",
        role: "NBR Mushak and Tax Audit Specialist",
        policy: "auto",
        description: "Audits tax and trial balance invoices",
      };
      const res = await fetch(`${baseUrl}/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(201);
      const created = await res.json();
      expect(created.name).toBe("Financial Auditor");
      expect(created.role).toBe("NBR Mushak and Tax Audit Specialist");
      expect(created.policy).toBe("auto");
      expect(created).toHaveProperty("id");

      // Verify GET /api/agents/:id
      const getRes = await fetch(`${baseUrl}/api/agents/${created.id}`);
      expect(getRes.status).toBe(200);
      const fetched = await getRes.json();
      expect(fetched.id).toBe(created.id);
    });

    it("POST /api/agents returns 400 when missing required fields", async () => {
      const res = await fetch(`${baseUrl}/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "incomplete" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Scheduler Endpoints", () => {
    it("GET /api/schedule returns list of scheduled tasks with 200", async () => {
      const res = await fetch(`${baseUrl}/api/schedule`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("cron");
      expect(data[0]).toHaveProperty("enabled");
    });

    it("POST /api/schedule creates a new scheduled job", async () => {
      const payload = {
        name: "Nightly Inventory Balance Check",
        cron: "0 2 * * *",
        enabled: true,
      };
      const res = await fetch(`${baseUrl}/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(201);
      const created = await res.json();
      expect(created.name).toBe(payload.name);
      expect(created.cron).toBe(payload.cron);
      expect(created.enabled).toBe(true);

      // Verify toggle with PATCH
      const patchRes = await fetch(`${baseUrl}/api/schedule/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
      expect(patchRes.status).toBe(200);
      const patched = await patchRes.json();
      expect(patched.enabled).toBe(false);
    });
  });

  describe("Memory Search Endpoints", () => {
    it("GET /api/memory/search returns search results", async () => {
      const res = await fetch(`${baseUrl}/api/memory/search?q=test`);
      expect(res.status).toBe(200);
      const results = await res.json();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
