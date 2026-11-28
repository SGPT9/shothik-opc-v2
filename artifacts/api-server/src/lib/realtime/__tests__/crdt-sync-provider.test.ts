import { describe, it, expect } from "vitest";
import { CrdtSyncProvider } from "../crdt-sync-provider.js";

describe("CRDT Sync Provider & Branch Reconciler", () => {
  it("reconciles alternative branch text into canonical manuscript with diff delta", () => {
    const canonical = "The morning dawn in Dhaka was quiet.";
    const branchText = "The morning dawn in Dhaka was stormy and dark.";
    const mergeResult = CrdtSyncProvider.mergeText(canonical, branchText);

    expect(mergeResult.hasConflicts).toBe(false);
    expect(mergeResult.mergedText).toBe(branchText);
    expect(mergeResult.diffs.length).toBeGreaterThan(0);
  });

  it("elects deterministic persistence leader from connected peers", () => {
    const peers = ["usr_collaborator_zebra", "usr_collaborator_alice", "usr_collaborator_charlie"];
    const leader1 = CrdtSyncProvider.determinePersistenceLeader(peers);
    const leader2 = CrdtSyncProvider.determinePersistenceLeader(peers);

    expect(leader1).toBe("usr_collaborator_alice");
    expect(leader1).toBe(leader2);
  });

  it("handles empty or single peer in leader election", () => {
    expect(CrdtSyncProvider.determinePersistenceLeader([])).toBeNull();
    expect(CrdtSyncProvider.determinePersistenceLeader(["usr_solo"])).toBe("usr_solo");
  });

  it("prepares clean document snapshots with SHA-256 integrity checksum", () => {
    const snapshot = CrdtSyncProvider.createSnapshotPayload({
      projectId: "prj_novel_branch_01",
      docId: "doc_ch_01",
      content: "সূর্য উঠার সাথে সাথে বুড়িগঙ্গার জল চকচক করে উঠল।",
      version: 4,
      authorId: "usr_bengali_novelist",
    });

    expect(snapshot.projectId).toBe("prj_novel_branch_01");
    expect(snapshot.content).toContain("বুড়িগঙ্গার জল");
    expect(snapshot.version).toBe(4);
    expect(snapshot.checksum).toHaveLength(64); // SHA-256 hex
    expect(snapshot.wordCount).toBe(9);
  });
});
