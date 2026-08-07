import { describe, expect, it, vi } from "vitest";
import { POST, GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn().mockResolvedValue({ _id: "usr_term_test_123" }),
}));

describe("/api/hermes/terminal route handlers", () => {
  it("spawns an interactive terminal process via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "spawn",
        workspaceId: "ws_term_route_100",
        runId: "run_term_route_100",
        command: "npm run build",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.sessionId).toBeDefined();
    expect(data.data.status).toBe("running");
  });

  it("sends stdin input and queries output buffer via GET", async () => {
    // 1. Spawn
    const spawnReq = new NextRequest("http://localhost:3000/api/hermes/terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "spawn",
        workspaceId: "ws_term_route_200",
        runId: "run_term_route_200",
        command: "python main.py",
      }),
    });

    const spawnRes = await POST(spawnReq, { params: Promise.resolve({}) });
    const spawnData = await spawnRes.json();
    const sessionId = spawnData.data.sessionId;

    // 2. Send Input
    const inputReq = new NextRequest("http://localhost:3000/api/hermes/terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "input",
        sessionId,
        workspaceId: "ws_term_route_200",
        runId: "run_term_route_200",
        input: "y",
      }),
    });

    const inputRes = await POST(inputReq, { params: Promise.resolve({}) });
    expect(inputRes.status).toBe(200);

    // 3. Query via GET
    const getReq = new NextRequest(`http://localhost:3000/api/hermes/terminal?sessionId=${sessionId}`, {
      method: "GET",
    });

    const getRes = await GET(getReq, { params: Promise.resolve({}) });
    expect(getRes.status).toBe(200);

    const getData = await getRes.json();
    expect(getData.data.outputBuffer).toContain("> y\n");
  });
});
