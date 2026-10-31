import { describe, it, expect } from "vitest";
import { MonacoPresenceManager } from "../monaco-presence-manager.js";

describe("Monaco Presence & Dual-Language Sync Manager", () => {
  it("serializes remote cursor and dual-language paragraph scroll alignment", () => {
    const payload = MonacoPresenceManager.formatScrollSyncPayload({
      userId: "usr_translator",
      sourceParagraphId: "p_12",
      targetParagraphId: "p_12_bn",
      scrollRatio: 0.45,
    });
    expect(payload.sourceParagraphId).toBe("p_12");
    expect(payload.targetParagraphId).toBe("p_12_bn");
    expect(payload.scrollRatio).toBe(0.45);
    expect(payload.timestamp).toBeDefined();
  });

  it("assigns consistent deterministic color palette based on user ID", () => {
    const color1 = MonacoPresenceManager.getUserColor("usr_author_alice");
    const color2 = MonacoPresenceManager.getUserColor("usr_author_alice");
    const color3 = MonacoPresenceManager.getUserColor("usr_author_bob");

    expect(color1).toBe(color2);
    expect(color1.colorHex).toMatch(/^#[0-9A-F]{6}$/i);
    expect(color1.label).toBeDefined();
    expect(typeof color3.colorHex).toBe("string");
  });

  it("formats remote cursor broadcast payload with selection bounds", () => {
    const cursor = MonacoPresenceManager.formatCursorPayload({
      userId: "usr_editor_01",
      userName: "Tariq Hasan",
      projectId: "prj_bengali_lit_01",
      lineNumber: 42,
      column: 15,
      selection: {
        startLineNumber: 42,
        startColumn: 10,
        endLineNumber: 42,
        endColumn: 25,
      },
    });

    expect(cursor.userId).toBe("usr_editor_01");
    expect(cursor.position.lineNumber).toBe(42);
    expect(cursor.position.column).toBe(15);
    expect(cursor.selection).toBeDefined();
    expect(cursor.selection?.endColumn).toBe(25);
    expect(cursor.color.colorHex).toBeDefined();
  });

  it("throttles high-frequency cursor movements to protect Realtime connection", () => {
    const manager = new MonacoPresenceManager();
    const userId = "usr_fast_typer";

    const allowedFirst = manager.shouldBroadcastCursor(userId, 1000);
    expect(allowedFirst).toBe(true);

    // 10ms later - within 30ms window -> should throttle
    const allowedImmediate = manager.shouldBroadcastCursor(userId, 1010);
    expect(allowedImmediate).toBe(false);

    // 35ms later -> outside 30ms window -> should allow
    const allowedLater = manager.shouldBroadcastCursor(userId, 1035);
    expect(allowedLater).toBe(true);
  });
});
