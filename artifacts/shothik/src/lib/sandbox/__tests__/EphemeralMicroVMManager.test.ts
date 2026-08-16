import { describe, it, expect, vi } from "vitest";
import {
  EphemeralMicroVMManager,
  type MicroVMTransport,
  type MicroVMExecutionRequest,
  type MicroVMExecutionResult,
} from "../EphemeralMicroVMManager";

describe("EphemeralMicroVMManager — MicroVM Sandboxed Bridge", () => {
  it("pre-warms a standby pool and maintains active TTL", () => {
    const manager = new EphemeralMicroVMManager();
    expect(manager.isWarmPoolActive()).toBe(false);

    manager.prewarm();
    expect(manager.isWarmPoolActive()).toBe(true);

    manager.destroyPool();
    expect(manager.isWarmPoolActive()).toBe(false);
  });

  it("executes code and streams steps, traces, and artifacts to emitter", async () => {
    const emittedSteps: any[] = [];
    const emittedTraces: string[] = [];
    const emittedArtifacts: any[] = [];

    const fakeTransport: MicroVMTransport = {
      async execute(request: MicroVMExecutionRequest, emitter) {
        emitter?.onStep?.({
          id: "step-1",
          label: "Evaluating math",
          status: "completed",
        });
        emitter?.onTrace?.("Result: 420000 BDT");
        emitter?.onArtifact?.({
          type: "sheet",
          title: "Revenue Model",
          data: { total: 420000 },
        });

        return {
          status: "success",
          stdout: ["Result: 420000 BDT"],
          stderr: [],
          artifacts: [
            {
              type: "sheet",
              title: "Revenue Model",
              data: { total: 420000 },
            },
          ],
          durationMs: 45,
          memoryUsedMb: 12.8,
          microVmId: "vm-test-1",
        };
      },
    };

    const manager = new EphemeralMicroVMManager(fakeTransport);
    manager.prewarm();

    const result = await manager.execute(
      {
        language: "python",
        code: "print('Result: 420000 BDT')",
      },
      {
        onStep: (step) => emittedSteps.push(step),
        onTrace: (chunk) => emittedTraces.push(chunk),
        onArtifact: (art) => emittedArtifacts.push(art),
      }
    );

    expect(result.status).toBe("success");
    expect(result.stdout).toContain("Result: 420000 BDT");
    expect(emittedSteps.length).toBeGreaterThanOrEqual(1);
    expect(emittedTraces).toContain("Result: 420000 BDT");
    expect(emittedArtifacts[0].title).toBe("Revenue Model");
  });

  it("executes using default transport and detects financial code artifacts", async () => {
    const manager = new EphemeralMicroVMManager();
    const artifacts: any[] = [];

    const result = await manager.execute(
      {
        language: "python",
        code: "revenue_bdt = 150000 * 12\nprint(revenue_bdt)",
      },
      {
        onArtifact: (art) => artifacts.push(art),
      }
    );

    expect(result.status).toBe("success");
    expect(result.artifacts.length).toBe(1);
    expect(result.artifacts[0].type).toBe("sheet");
    expect(artifacts.length).toBe(1);
  });
});
