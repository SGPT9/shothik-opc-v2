import { describe, it, expect, beforeEach } from "vitest";
import agentTracesRouter from "../agent-traces";
import { initSqliteTables, getAgentTracesBySession, getAgentTrace } from "@workspace/db";
import { dshRuntime } from "../../lib/dsh-runtime";
import { LoopEngineeringEngine } from "../../lib/loop-engineering-engine";

describe("Agent Traces API & Engine Integration", () => {
  beforeEach(async () => {
    await initSqliteTables();
  });

  function createMockRes() {
    let statusCode = 200;
    let responseData: any = null;

    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      },
      send: (data: any) => {
        responseData = data;
        return res;
      },
      getStatus: () => statusCode,
      getData: () => responseData,
    };
    return res;
  }

  function getRouteHandler(method: "get" | "post" | "delete", pathPrefix: string) {
    const layer = (agentTracesRouter.stack || []).find((l: any) => {
      const matchMethod = l.route?.methods?.[method];
      const matchPath = l.route?.path === pathPrefix || (Array.isArray(l.route?.path) && l.route.path.includes(pathPrefix));
      return matchMethod && matchPath;
    });
    return layer?.route?.stack?.[0]?.handle;
  }

  it("POST /v1/agent/traces stores trace and returns 201", async () => {
    const handler = getRouteHandler("post", "/v1/agent/traces");
    expect(handler).toBeDefined();

    const sessionId = `test_session_${Date.now()}`;
    const req: any = {
      body: {
        sessionId,
        agentName: "planner",
        prompt: "Decompose user goal into subtasks",
        response: "Decomposition complete with 3 subtasks",
        status: "completed",
        durationMs: 45,
        metadata: { model: "deepseek-r1", tokens: 120 },
      },
    };

    const res = createMockRes();
    await handler(req, res);

    expect(res.getStatus()).toBe(201);
    const data = res.getData();
    expect(data.success).toBe(true);
    expect(data.trace).toBeDefined();
    expect(data.trace.sessionId).toBe(sessionId);
    expect(data.trace.agentName).toBe("planner");

    // Verify persisted directly in SQLite
    const traces = await getAgentTracesBySession(sessionId);
    expect(traces.length).toBe(1);
    expect(traces[0].prompt).toBe("Decompose user goal into subtasks");
  });

  it("POST /v1/agent/traces returns 400 when required fields are missing", async () => {
    const handler = getRouteHandler("post", "/v1/agent/traces");
    const req: any = {
      body: {
        sessionId: "incomplete_session",
      },
    };

    const res = createMockRes();
    await handler(req, res);

    expect(res.getStatus()).toBe(400);
    expect(res.getData().success).toBe(false);
  });

  it("GET /v1/agent/traces/:sessionId retrieves session traces", async () => {
    const handler = getRouteHandler("get", "/v1/agent/traces");
    expect(handler).toBeDefined();

    const sessionId = `query_session_${Date.now()}`;
    // Insert trace
    const postHandler = getRouteHandler("post", "/v1/agent/traces");
    const reqPost: any = {
      body: {
        sessionId,
        agentName: "researcher",
        prompt: "Fetch primary sources",
        response: "Fetched 4 sources",
      },
    };
    await postHandler(reqPost, createMockRes());

    const reqGet: any = {
      params: { sessionId },
      query: {},
    };
    const resGet = createMockRes();
    await handler(reqGet, resGet);

    expect(resGet.getStatus()).toBe(200);
    const data = resGet.getData();
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(1);
    expect(data.traces[0].agentName).toBe("researcher");
  });

  it("DELETE /v1/agent/traces/:sessionId purges session traces", async () => {
    const sessionId = `del_session_${Date.now()}`;
    const postHandler = getRouteHandler("post", "/v1/agent/traces");
    await postHandler(
      {
        body: {
          sessionId,
          agentName: "temp-agent",
          prompt: "To be deleted",
        },
      },
      createMockRes()
    );

    const deleteHandler = getRouteHandler("delete", "/v1/agent/traces/:sessionId");
    expect(deleteHandler).toBeDefined();

    const reqDel: any = { params: { sessionId } };
    const resDel = createMockRes();
    await deleteHandler(reqDel, resDel);

    expect(resDel.getStatus()).toBe(200);
    const traces = await getAgentTracesBySession(sessionId);
    expect(traces.length).toBe(0);
  });

  it("persists DSH runtime lifecycle events into SQLite", async () => {
    const userId = "usr_tester_dsh";
    const session = await dshRuntime.initSession(userId, "Integration Test Session");

    await dshRuntime.recordEvent(
      session.id,
      "thought_block",
      { thought: "Analyzing graph topology", agent: "commander" },
      { durationMs: 25 }
    );

    const traces = await getAgentTracesBySession(session.id);
    expect(traces.length).toBeGreaterThanOrEqual(1);
    const thoughtTrace = traces.find((t) => t.agentName === "commander");
    expect(thoughtTrace).toBeDefined();
    expect(thoughtTrace?.prompt).toBe("Analyzing graph topology");
  });

  it("persists Loop Engineering stages into SQLite", async () => {
    const loopResult = await LoopEngineeringEngine.runLoop({
      prompt: "Reconcile courier settlements and generate summary",
      maxIterations: 1,
    });

    expect(loopResult.success).toBe(true);
    const traces = await getAgentTracesBySession(loopResult.loopId);
    expect(traces.length).toBe(5); // PERCEIVE, PLAN, EXECUTE, VERIFY/HEAL, CONVERGE
    expect(traces.map((t) => t.agentName)).toContain("loop-stage-perceive");
    expect(traces.map((t) => t.agentName)).toContain("loop-stage-plan");
    expect(traces.map((t) => t.agentName)).toContain("loop-stage-execute");
  });
});
