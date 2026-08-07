import { describe, expect, it, vi } from "vitest";
import { POST, GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn().mockResolvedValue({ _id: "usr_swarm_test_123" }),
}));

describe("/api/hermes/swarm route handlers", () => {
  it("creates a new multi-agent swarm via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/swarm", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        workspaceId: "ws_swarm_test_100",
        runId: "run_swarm_test_100",
        initialRole: "researcher",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.swarmId).toBeDefined();
    expect(data.data.agents.length).toBe(4);
  });

  it("triggers agent handoff between Researcher and Writer", async () => {
    // 1. Create Swarm
    const createReq = new NextRequest("http://localhost:3000/api/hermes/swarm", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        workspaceId: "ws_swarm_test_200",
        runId: "run_swarm_test_200",
        initialRole: "researcher",
      }),
    });

    const createRes = await POST(createReq, { params: Promise.resolve({}) });
    const createData = await createRes.json();
    const swarmId = createData.data.swarmId;

    // 2. Trigger Handoff
    const handoffReq = new NextRequest("http://localhost:3000/api/hermes/swarm", {
      method: "POST",
      body: JSON.stringify({
        action: "handoff",
        swarmId,
        workspaceId: "ws_swarm_test_200",
        runId: "run_swarm_test_200",
        fromRole: "researcher",
        toRole: "writer",
        taskPayload: { summary: "Research completed." },
      }),
    });

    const handoffRes = await POST(handoffReq, { params: Promise.resolve({}) });
    expect(handoffRes.status).toBe(200);

    const handoffData = await handoffRes.json();
    const activeAgent = handoffData.data.agents.find((a: any) => a.id === handoffData.data.activeAgentId);
    expect(activeAgent.role).toBe("writer");
  });

  it("queries swarm topology via GET", async () => {
    const createReq = new NextRequest("http://localhost:3000/api/hermes/swarm", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        workspaceId: "ws_swarm_get",
        runId: "run_swarm_get",
      }),
    });

    const createRes = await POST(createReq, { params: Promise.resolve({}) });
    const createData = await createRes.json();
    const swarmId = createData.data.swarmId;

    const getReq = new NextRequest(`http://localhost:3000/api/hermes/swarm?swarmId=${swarmId}`, {
      method: "GET",
    });

    const getRes = await GET(getReq, { params: Promise.resolve({}) });
    expect(getRes.status).toBe(200);

    const getData = await getRes.json();
    expect(getData.data.swarmId).toBe(swarmId);
  });
});
