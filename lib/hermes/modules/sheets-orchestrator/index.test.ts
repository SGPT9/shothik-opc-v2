import { describe, expect, it, vi } from "vitest";
import { getHermesSheetsOrchestrator } from "./index";

vi.mock("@/lib/insforge/rag-memory", () => ({
  InsForgeTwinRagMemory: {
    searchWorkspaceContext: vi.fn().mockResolvedValue("RAG Sheet Context"),
  },
}));

describe("Hermes Sheets Orchestrator Engine (Phase 2)", () => {
  it("generates spreadsheet run with initial grid and RAG context", async () => {
    const orchestrator = getHermesSheetsOrchestrator();

    const runId = await orchestrator.generateSpreadsheet({
      requestId: "req_sheet_test",
      workspaceId: "ws_sheet_test",
      prompt: "Q3 Sales and Expense Report",
      title: "Q3 Financials",
      sheetCount: 2,
      theme: "modern",
      userId: "usr_sheet_test",
    });

    expect(runId).toBeDefined();

    const status = await orchestrator.getRunStatus(runId);
    expect(status.status).toBe("completed");
    expect(status.progress).toBe(100);
  });

  it("updates spreadsheet cell values and emits events", async () => {
    const orchestrator = getHermesSheetsOrchestrator();

    const runId = await orchestrator.generateSpreadsheet({
      requestId: "req_sheet_upd",
      workspaceId: "ws_sheet_test",
      prompt: "Inventory Grid",
      title: "Inventory",
      sheetCount: 1,
      theme: "classic",
      userId: "usr_sheet_test",
    });

    await orchestrator.updateCell({
      requestId: "req_cell_upd",
      workspaceId: "ws_sheet_test",
      runId,
      sheetIndex: 0,
      cell: "C5",
      value: 1250,
      userId: "usr_sheet_test",
    });
  });

  it("evaluates formulas like SUM and AVERAGE", async () => {
    const orchestrator = getHermesSheetsOrchestrator();

    const sumRes = await orchestrator.calculateFormula({
      requestId: "req_calc",
      workspaceId: "ws_sheet_test",
      runId: "run_test_123",
      sheetIndex: 0,
      formula: "=SUM(B2:B10)",
      targetCell: "B11",
      userId: "usr_sheet_test",
    });

    expect(sumRes.result).toBe(700);
  });

  it("exports spreadsheet to target format", async () => {
    const orchestrator = getHermesSheetsOrchestrator();

    const exportRes = await orchestrator.exportSheet({
      requestId: "req_export",
      workspaceId: "ws_sheet_test",
      runId: "run_sheet_exp",
      format: "csv",
      userId: "usr_sheet_test",
    });

    expect(exportRes.format).toBe("csv");
    expect(exportRes.url).toContain("run_sheet_exp");
  });
});
