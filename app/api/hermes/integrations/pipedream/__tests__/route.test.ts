import { describe, expect, it } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("POST /api/hermes/integrations/pipedream", () => {
  it("fetches Pipedream connect OAuth configuration", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/integrations/pipedream", {
      method: "POST",
      body: JSON.stringify({
        mode: "get_config",
        externalUserId: "usr_pipedream_test",
        app: "slack",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.externalUserId).toBe("usr_pipedream_test");
    expect(data.data.app).toBe("slack");
  });

  it("runs a Pipedream workflow action", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/integrations/pipedream", {
      method: "POST",
      body: JSON.stringify({
        mode: "run_action",
        actionId: "slack-post-message",
        externalUserId: "usr_pipedream_test",
        params: { channel: "#general", text: "Hello from Hermes" },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.actionId).toBe("slack-post-message");
    expect(data.data.status).toBe("executed");
  });
});
