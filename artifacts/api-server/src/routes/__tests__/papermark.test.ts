import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Papermark Trackable Share & Analytics API", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) {
      server.closeAllConnections?.();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 15000);

  async function request(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
    const { method = "GET", body, headers = {} } = options;
    const reqHeaders: Record<string, string> = { ...headers };
    if (body) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // not json
    }

    return {
      status: res.status,
      body: json,
    };
  }

  const testUserId = "usr_vc_founder_1";
  let createdLinkId: string;
  let createdSlug: string;

  it("POST /api/v1/papermark/links should create a trackable pitch deck link", async () => {
    const res = await request("/api/v1/papermark/links", {
      method: "POST",
      body: {
        userId: testUserId,
        documentId: "doc_deck_seedstars_2026",
        title: "Seedstars Bangladesh 2026 Pitch Deck",
        documentType: "pitch_deck",
        customSlug: "seedstars-shothik-pitch",
        allowDownload: true,
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.customSlug).toBe("seedstars-shothik-pitch");
    expect(res.body.data.shareUrl).toContain("seedstars-shothik-pitch");
    expect(res.body.data.totalViews).toBe(0);

    createdLinkId = res.body.data.id;
    createdSlug = res.body.data.customSlug;
  });

  it("GET /api/v1/papermark/links should list user's links and aggregate summary KPIs", async () => {
    const res = await request(`/api/v1/papermark/links?userId=${testUserId}`, {
      method: "GET",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.links)).toBe(true);
    expect(res.body.data.links.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalLinks).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.summary.totalViews).toBe("number");
    expect(typeof res.body.data.summary.totalUniqueVisitors).toBe("number");
  });

  it("POST /api/v1/papermark/record-view should record visitor view telemetry and update analytics", async () => {
    const res = await request("/api/v1/papermark/record-view", {
      method: "POST",
      body: {
        slug: createdSlug,
        visitorId: "vis_angel_investor_dhaka",
        country: "Bangladesh",
        city: "Dhaka",
        device: "desktop",
        durationSeconds: 120,
        pagesViewed: [
          { page: 1, durationSec: 25 },
          { page: 2, durationSec: 45 },
          { page: 3, durationSec: 50 },
        ],
        completed: true,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalViews).toBe(1);
    expect(res.body.data.uniqueVisitors).toBe(1);
    expect(res.body.data.avgDurationSec).toBe(120);
    expect(res.body.data.completionRate).toBe(100);
  });

  it("GET /api/v1/papermark/links/:id/analytics should return page heatmaps and visitor insights", async () => {
    const res = await request(`/api/v1/papermark/links/${createdLinkId}/analytics?userId=${testUserId}`, {
      method: "GET",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pageHeatmap).toBeDefined();
    expect(res.body.data.pageHeatmap.length).toBe(3); // 3 pages viewed
    expect(res.body.data.visitors).toBeDefined();
    expect(res.body.data.visitors.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.visitors[0].city).toBe("Dhaka");
  });

  it("DELETE /api/v1/papermark/links/:id should revoke the trackable link", async () => {
    const res = await request(`/api/v1/papermark/links/${createdLinkId}?userId=${testUserId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(`/api/v1/papermark/links/${createdLinkId}/analytics?userId=${testUserId}`, {
      method: "GET",
    });

    expect(checkRes.status).toBe(404);
  });
});
