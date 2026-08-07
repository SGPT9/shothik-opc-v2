import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn().mockResolvedValue({ _id: "usr_sheets_test_123" }),
}));

vi.mock("@/lib/hermes/modules/sheets-orchestrator", () => ({
  getHermesSheetsOrchestrator: vi.fn(() => ({
    generateSpreadsheet: vi.fn().mockResolvedValue("run_sheets_test_456"),
  })),
}));

describe("POST /api/hermes/sheets/generate", () => {
  it("creates a new spreadsheet generation run for authenticated users", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/sheets/generate", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_sheets_test",
        title: "Q4 Financial Forecast",
        prompt: "Quarterly revenue, expenses, and net profit projections.",
        sheetCount: 2,
        theme: "corporate",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.runId).toBe("run_sheets_test_456");
    expect(data.data.streamUrl).toContain("/api/hermes/runs/run_sheets_test_456");
    expect(data.data.workspaceId).toBe("ws_sheets_test");
  });
});
