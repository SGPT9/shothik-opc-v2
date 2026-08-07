import { beforeEach, describe, expect, it } from "vitest";
import { HermesTerminalEngine } from "../index";

describe("HermesTerminalEngine Module", () => {
  beforeEach(() => {
    HermesTerminalEngine.clearStore();
  });

  it("creates an interactive terminal command session", async () => {
    const session = await HermesTerminalEngine.createSession({
      workspaceId: "ws_term_test",
      runId: "run_term_100",
      command: "npm test",
    });

    expect(session.sessionId).toContain("trm_");
    expect(session.status).toBe("running");
    expect(session.outputBuffer[0]).toContain("npm test");
  });

  it("appends output logs and sends stdin input", async () => {
    const session = await HermesTerminalEngine.createSession({
      workspaceId: "ws_term_test",
      runId: "run_term_200",
      command: "python script.py",
    });

    HermesTerminalEngine.appendOutput(session.sessionId, "Enter your name:\n");
    await HermesTerminalEngine.sendInput(session.sessionId, "Alice");

    const updated = HermesTerminalEngine.getSession(session.sessionId);
    expect(updated?.outputBuffer).toContain("> Alice\n");
  });

  it("completes session with exit code 0", async () => {
    const session = await HermesTerminalEngine.createSession({
      workspaceId: "ws_term_test",
      runId: "run_term_300",
      command: "ls -la",
    });

    const completed = await HermesTerminalEngine.completeSession(session.sessionId, 0);
    expect(completed.status).toBe("completed");
    expect(completed.exitCode).toBe(0);
  });

  it("kills running session on SIGKILL", async () => {
    const session = await HermesTerminalEngine.createSession({
      workspaceId: "ws_term_test",
      runId: "run_term_400",
      command: "sleep 100",
    });

    const killed = await HermesTerminalEngine.killSession(session.sessionId);
    expect(killed.status).toBe("killed");
    expect(killed.exitCode).toBe(137);
  });
});
