import { describe, expect, it } from "vitest";
import { POST, GET } from "../route";
import { NextRequest } from "next/server";

describe("/api/hermes/god-mode route handlers", () => {
  it("starts a 7-day autonomous God Mode session via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/god-mode", {
      method: "POST",
      body: JSON.stringify({
        action: "start",
        workspaceId: "ws_god_test",
        intent: "Continuous Dev & Test",
        durationDays: 7,
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.sessionId).toBeDefined();
    expect(data.data.status).toBe("active");
  });

  it("queries session status via GET", async () => {
    // First start a session to get a valid sessionId
    const startReq = new NextRequest("http://localhost:3000/api/hermes/god-mode", {
      method: "POST",
      body: JSON.stringify({
        action: "start",
        workspaceId: "ws_god_get_test",
      }),
    });

    const startRes = await POST(startReq, { params: Promise.resolve({}) });
    const startData = await startRes.json();
    const sessionId = startData.data.sessionId;

    const getReq = new NextRequest(`http://localhost:3000/api/hermes/god-mode?sessionId=${sessionId}`, {
      method: "GET",
    });

    const getRes = await GET(getReq, { params: Promise.resolve({}) });
    expect(getRes.status).toBe(200);

    const getData = await getRes.json();
    expect(getData.data.sessionId).toBe(sessionId);
  });
});
