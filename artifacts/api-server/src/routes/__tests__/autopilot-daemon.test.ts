import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import {
  autopilotDaemonRouter,
  generateDefaultAutopilotState
} from "../autopilot-daemon";

describe("Feature #9: Autopilot Chapter Daemon & Mobile Push Dispatch", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(autopilotDaemonRouter);

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

  it("generateDefaultAutopilotState initializes valid daemon state with pending cards", () => {
    const state = generateDefaultAutopilotState("proj_test_ap");
    expect(state.config.enabled).toBe(true);
    expect(state.pendingCards.length).toBeGreaterThan(0);
    expect(state.lastRunReport?.consistencyIssues.length).toBeGreaterThan(0);
    expect(state.lastRunReport?.critique.consensusGrade).toBeDefined();
  });

  it("GET /api/v1/projects/:id/autopilot returns daemon state", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_ap/autopilot`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.config.scheduledTimeBST).toBe("02:00 BST");
    expect(json.data.pendingCards.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/v1/projects/:id/autopilot/run-now executes overnight consistency and dispatches card", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_ap/autopilot/run-now`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.lastRunReport.critique.geminiScore).toBeGreaterThan(80);
    expect(json.data.pendingCards[0].status).toBe("pending");
  });

  it("POST /api/v1/projects/:id/autopilot/config updates scheduled time and active channels", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_ap/autopilot/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: true,
        scheduledTimeBST: "03:30 BST",
        channels: ["telegram", "whatsapp"],
        webhookUrl: "https://api.telegram.org/bot_custom_endpoint"
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.scheduledTimeBST).toBe("03:30 BST");
  });

  it("POST /api/v1/projects/:id/autopilot/resolve-card approves fix card", async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects/proj_test_ap/autopilot/resolve-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card_revolver_fix",
        resolution: "approved"
      })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.card.status).toBe("approved");
    expect(json.data.appliedDiff).toContain(".৩৮ স্পেশাল");
  });
});
