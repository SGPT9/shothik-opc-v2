import { describe, it, expect } from "vitest";
import {
  buildTree,
  getActiveBranch,
  getBranchSiblingIndexesForTarget,
  ROOT_SIBLING_KEY,
} from "../message-tree";
import type { ChatMessage } from "../types";

function createMockMessage(
  id: string,
  role: "user" | "assistant",
  content: string,
  parentMessageId?: string,
): ChatMessage {
  return {
    _id: id,
    conversationId: "convo-1",
    userId: "user-1",
    role,
    content,
    contentFormat: "markdown",
    status: "completed",
    parentMessageId,
  };
}

describe("message-tree DAG & Branch Navigation", () => {
  it("handles empty or null messages gracefully", () => {
    expect(buildTree(null)).toBeNull();
    expect(buildTree([])).toEqual([]);
    expect(getActiveBranch({ messages: [] })).toEqual({
      activeBranch: [],
      siblingMap: {},
    });
  });

  it("builds a linear conversation with correct depths and sibling indices", () => {
    const m1 = createMockMessage("m1", "user", "Hello");
    const m2 = createMockMessage("m2", "assistant", "Hi there", "m1");
    const m3 = createMockMessage("m3", "user", "How are you?", "m2");

    const tree = buildTree([m1, m2, m3]);
    expect(tree).toHaveLength(1);
    expect(tree![0]._id).toBe("m1");
    expect(tree![0].depth).toBe(0);
    expect(tree![0].siblingIndex).toBe(0);
    expect(tree![0].siblingCount).toBe(1);

    expect(tree![0].children).toHaveLength(1);
    expect(tree![0].children[0]._id).toBe("m2");
    expect(tree![0].children[0].depth).toBe(1);

    expect(tree![0].children[0].children[0]._id).toBe("m3");
    expect(tree![0].children[0].children[0].depth).toBe(2);

    const { activeBranch } = getActiveBranch({ messages: [m1, m2, m3] });
    expect(activeBranch.map((m) => m._id)).toEqual(["m1", "m2", "m3"]);
  });

  it("handles branched conversation (e.g. Regenerated assistant responses)", () => {
    const m1 = createMockMessage("m1", "user", "Write a story");
    const m2a = createMockMessage("m2a", "assistant", "Once upon a time in space...", "m1");
    const m2b = createMockMessage("m2b", "assistant", "In a galaxy far away...", "m1");

    const tree = buildTree([m1, m2a, m2b]);
    expect(tree).toHaveLength(1);
    expect(tree![0].children).toHaveLength(2);
    expect(tree![0].children[0].siblingIndex).toBe(0);
    expect(tree![0].children[0].siblingCount).toBe(2);
    expect(tree![0].children[1].siblingIndex).toBe(1);
    expect(tree![0].children[1].siblingCount).toBe(2);

    // Default active branch should pick the latest sibling m2b
    const defaultBranch = getActiveBranch({ messages: [m1, m2a, m2b] });
    expect(defaultBranch.activeBranch.map((m) => m._id)).toEqual(["m1", "m2b"]);

    // Switching sibling to 0 should select m2a
    const branch0 = getActiveBranch({
      messages: [m1, m2a, m2b],
      siblingMap: { m1: 0 },
    });
    expect(branch0.activeBranch.map((m) => m._id)).toEqual(["m1", "m2a"]);
  });

  it("breaks circular parent dependencies without crashing or looping infinitely", () => {
    const m1 = createMockMessage("m1", "user", "A", "m2");
    const m2 = createMockMessage("m2", "assistant", "B", "m1");

    const tree = buildTree([m1, m2]);
    expect(tree).toBeDefined();
    // One node becomes root, cycle back-edge is severed
    const { activeBranch } = getActiveBranch({ messages: [m1, m2] });
    expect(activeBranch.length).toBeGreaterThan(0);
    expect(activeBranch.length).toBeLessThanOrEqual(2);
  });

  it("resolves target branch sibling indexes correctly for deep nodes", () => {
    const m1 = createMockMessage("m1", "user", "Prompt");
    const m2a = createMockMessage("m2a", "assistant", "Option A", "m1");
    const m2b = createMockMessage("m2b", "assistant", "Option B", "m1");
    const m3a = createMockMessage("m3a", "user", "Followup to A", "m2a");
    const m3b = createMockMessage("m3b", "user", "Followup to B", "m2b");

    const indexesForM3a = getBranchSiblingIndexesForTarget([m1, m2a, m2b, m3a, m3b], "m3a");
    expect(indexesForM3a[ROOT_SIBLING_KEY]).toBe(0);
    expect(indexesForM3a["m1"]).toBe(0); // m2a is index 0

    const indexesForM3b = getBranchSiblingIndexesForTarget([m1, m2a, m2b, m3a, m3b], "m3b");
    expect(indexesForM3b["m1"]).toBe(1); // m2b is index 1
  });
});
