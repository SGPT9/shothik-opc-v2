import { describe, expect, it } from "vitest";
import {
  GenerateSpreadsheetCommandSchema,
  UpdateCellCommandSchema,
  CalculateFormulaCommandSchema,
  ExportSheetCommandSchema,
  HermesSheetEventEnvelopeSchema,
} from "./sheets";

describe("Hermes Chat-To-Sheets Contracts (Phase 2)", () => {
  it("validates GenerateSpreadsheetCommand with defaults", () => {
    const parsed = GenerateSpreadsheetCommandSchema.parse({
      requestId: "req_sheet_123",
      workspaceId: "ws_sheet_456",
      prompt: "Q3 Sales and Revenue Projection",
      userId: "usr_sheet_789",
    });

    expect(parsed.title).toBe("Untitled Spreadsheet");
    expect(parsed.sheetCount).toBe(1);
    expect(parsed.theme).toBe("classic");
  });

  it("validates UpdateCellCommand cell notation and values", () => {
    const parsed = UpdateCellCommandSchema.parse({
      requestId: "req_upd",
      workspaceId: "ws_1",
      runId: "run_1",
      cell: "B12",
      value: 45000,
      userId: "usr_1",
    });

    expect(parsed.cell).toBe("B12");
    expect(parsed.value).toBe(45000);

    const invalidCell = UpdateCellCommandSchema.safeParse({
      requestId: "req_upd",
      workspaceId: "ws_1",
      runId: "run_1",
      cell: "12B", // Invalid cell format
      value: 100,
      userId: "usr_1",
    });

    expect(invalidCell.success).toBe(false);
  });

  it("validates CalculateFormulaCommand formula prefix", () => {
    const parsed = CalculateFormulaCommandSchema.parse({
      requestId: "req_calc",
      workspaceId: "ws_1",
      runId: "run_1",
      formula: "=SUM(A1:A10)",
      targetCell: "A11",
      userId: "usr_1",
    });

    expect(parsed.formula).toBe("=SUM(A1:A10)");

    const invalidFormula = CalculateFormulaCommandSchema.safeParse({
      requestId: "req_calc",
      workspaceId: "ws_1",
      runId: "run_1",
      formula: "SUM(A1:A10)", // Missing '='
      targetCell: "A11",
      userId: "usr_1",
    });

    expect(invalidFormula.success).toBe(false);
  });

  it("validates ExportSheetCommand export formats", () => {
    const csvExport = ExportSheetCommandSchema.parse({
      requestId: "req_exp",
      workspaceId: "ws_1",
      runId: "run_1",
      format: "csv",
      userId: "usr_1",
    });

    expect(csvExport.format).toBe("csv");
  });

  it("validates HermesSheetEventEnvelope schema", () => {
    const envelope = HermesSheetEventEnvelopeSchema.parse({
      eventId: "c200bc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      runId: "run_sheet_99",
      workspaceId: "ws_sheet_99",
      domain: "sheets",
      eventType: "sheet.cell_updated",
      timestamp: new Date().toISOString(),
      payload: { cell: "A1", value: 100 },
    });

    expect(envelope.domain).toBe("sheets");
    expect(envelope.eventType).toBe("sheet.cell_updated");
  });
});
