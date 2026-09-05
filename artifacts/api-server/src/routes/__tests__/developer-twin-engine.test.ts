import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import http from "http";
import twinTasksRouter from "../twin-tasks.js";

describe("Developer Twin Engine API Test Suite", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", twinTasksRouter);

    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("developer_twin appears in the specialized twins roster as the 10th twin", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/specialized-twins?companySlug=venture`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(10);
    const devTwin = json.data.find((t: any) => t.id === "developer_twin");
    expect(devTwin).toBeDefined();
    expect(devTwin.name).toBe("Developer Twin");
    expect(devTwin.category).toBe("Engineering & DevOps");
    expect(devTwin.avatar).toBe("💻");
    expect(devTwin.capabilities).toContain("Code Gen");
    expect(devTwin.capabilities).toContain("CI/CD");
    expect(devTwin.capabilities).toContain("Scaffold");
  });

  it("GET /api/v1/twin/developer/repos returns managed repos with health scores", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/repos`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);

    const repo = json.data[0];
    expect(repo.slug).toBeDefined();
    expect(repo.name).toBeDefined();
    expect(repo.healthScore).toBeGreaterThanOrEqual(0);
    expect(repo.healthScore).toBeLessThanOrEqual(100);
    expect(["healthy", "degraded", "failing"]).toContain(repo.status);
    expect(repo.techStack).toBeDefined();
    expect(repo.testsPassed).toBeDefined();
    expect(repo.testsTotal).toBeDefined();
  });

  it("POST /api/v1/twin/developer/scaffold generates a project from template", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/scaffold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "nextjs-storefront",
        projectName: "verifi-dashboard",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.projectName).toBe("verifi-dashboard");
    expect(json.data.template).toBe("nextjs-storefront");
    expect(json.data.filesGenerated.length).toBeGreaterThan(0);
    expect(json.data.entryPoint).toContain("verifi-dashboard/");
    expect(json.data.readmePreview).toContain("verifi-dashboard");
  });

  it("POST /api/v1/twin/developer/scaffold returns 400 for unknown template", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/scaffold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "nonexistent-template",
        projectName: "test-project",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Unknown scaffold template");
  });

  it("POST /api/v1/twin/developer/scaffold returns 400 when missing required fields", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/scaffold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST /api/v1/twin/developer/patch generates a code diff", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/patch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-storefront",
        issueDescription: "Fix bKash webhook race condition on concurrent TrxID settlement",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.repoSlug).toBe("shothik-storefront");
    expect(json.data.diff).toContain("---");
    expect(json.data.diff).toContain("+++");
    expect(json.data.filesChanged.length).toBeGreaterThan(0);
    expect(json.data.linesAdded).toBeGreaterThan(0);
    expect(json.data.confidence).toBeGreaterThanOrEqual(80);
    expect(json.data.confidence).toBeLessThanOrEqual(100);
    expect(json.data.reasoning).toBeDefined();
  });

  it("POST /api/v1/twin/developer/patch returns 400 for unknown repo", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/patch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "nonexistent-repo",
        issueDescription: "Fix something",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST /api/v1/twin/developer/build triggers a build pipeline", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoSlug: "shothik-api-server" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.repoSlug).toBe("shothik-api-server");
    expect(json.data.buildId).toBeDefined();
    expect(["success", "failed", "warnings"]).toContain(json.data.status);
    expect(json.data.durationMs).toBeGreaterThan(0);
    expect(json.data.logs.length).toBeGreaterThan(0);
    expect(json.data.testsPassed).toBeDefined();
    expect(json.data.testsTotal).toBeDefined();
    expect(json.data.bundleSizeKb).toBeGreaterThan(0);
  });

  it("POST /api/v1/twin/developer/deploy creates a pending approval (Protected Action)", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-storefront",
        environment: "production",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    // Must not auto-deploy — status should be pending_approval
    expect(json.data.status).toBe("pending_approval");
    expect(json.data.approvalId).toBeDefined();
    expect(json.data.environment).toBe("production");
    expect(json.data.estimatedDowntimeSeconds).toBeDefined();
    expect(json.data.changelog).toBeDefined();
  });

  it("POST /api/v1/twin/developer/deploy rejects invalid environment", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-storefront",
        environment: "invalid",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST /api/v1/twin/developer/self-heal executes Red-Green-Refactor loop in isolated sandbox", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/self-heal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-storefront",
        failingTestOrError: "TypeError: Cannot read properties of undefined (reading 'payload')",
        sandboxType: "vast_spot_gpu",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.repoSlug).toBe("shothik-storefront");
    expect(json.data.resolved).toBe(true);
    expect(json.data.iterations.length).toBeGreaterThanOrEqual(2);
    expect(json.data.finalPatch).toBeDefined();
    expect(json.data.allocatedSandbox).toContain("vast_spot_gpu");
    expect(json.data.blastRadiusScore).toBeGreaterThan(0);
  });

  it("POST /api/v1/twin/developer/self-heal returns 400 on missing params", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/self-heal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoSlug: "shothik-storefront" }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST /api/v1/twin/developer/blast-radius assesses AST impact and breaking changes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/blast-radius`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-storefront",
        targetFiles: ["src/db/schema.ts"],
        changeType: "schema_migration",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.riskLevel).toBe("high");
    expect(json.data.breakingChangeDetected).toBe(true);
    expect(json.data.databaseMigrationHazard).toBe(true);
    expect(json.data.crossTwinDependencies.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/twin/developer/deeptech-metrics returns autonomous engineering telemetry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/twin/developer/deeptech-metrics`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.selfHealingSuccessRate).toBeGreaterThan(90);
    expect(json.data.averageHealingTimeMs).toBeGreaterThan(0);
    expect(json.data.sandboxRunsCount).toBeGreaterThan(0);
  });

  it("GET /api/v1/twin/developer/deploys and POST review processes human approval for Protected Actions", async () => {
    // 1. Create a deploy request
    const createRes = await fetch(`${baseUrl}/api/v1/twin/developer/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoSlug: "shothik-api-server",
        environment: "production",
        changelog: "feat: release v2.4 zero-downtime rolling update",
      }),
    });
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    const approvalId = createJson.data.approvalId;
    expect(approvalId).toBeDefined();

    // 2. Verify it appears in deploy requests list
    const listRes = await fetch(`${baseUrl}/api/v1/twin/developer/deploys`);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    const found = listJson.data.find((d: any) => d.approvalId === approvalId);
    expect(found).toBeDefined();
    expect(found.status).toBe("pending_approval");

    // 3. Human Operator submits review: APPROVE
    const reviewRes = await fetch(`${baseUrl}/api/v1/twin/developer/deploys/${approvalId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        reviewerComment: "Approved by OPC Founder after manual smoke test verification",
      }),
    });
    expect(reviewRes.status).toBe(200);
    const reviewJson = await reviewRes.json();
    expect(reviewJson.success).toBe(true);
    expect(reviewJson.data.status).toBe("approved");

    // 4. Reviewing already approved deploy should fail
    const duplicateRes = await fetch(`${baseUrl}/api/v1/twin/developer/deploys/${approvalId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    expect(duplicateRes.status).toBe(400);
  });
});
