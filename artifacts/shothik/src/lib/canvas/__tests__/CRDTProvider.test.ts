import { describe, it, expect } from "vitest";
import { CRDTProvider } from "../CRDTProvider";

describe("CRDTProvider: Collaborative State Synchronization", () => {
  it("initializes state and applies local operations correctly", () => {
    const provider = new CRDTProvider("doc_1", { title: "Executive Report" });
    expect(provider.getData().title).toBe("Executive Report");

    provider.applyLocalOperation("replace", "title", "Updated Executive Report 2026");
    expect(provider.getData().title).toBe("Updated Executive Report 2026");
  });

  it("synchronizes remote operations deterministically without collision", () => {
    const peerA = new CRDTProvider("doc_shared", { count: 10 });
    const peerB = new CRDTProvider("doc_shared", { count: 10 });

    const opA = peerA.applyLocalOperation("replace", "count", 25);
    peerB.applyRemoteOperation(opA);

    expect(peerB.getData().count).toBe(25);
  });

  it("handles deep path updates accurately", () => {
    const provider = new CRDTProvider("sheet_1", { cells: { A1: "100" } });
    provider.applyLocalOperation("cell_update", "cells.B1", "200");
    provider.applyLocalOperation("cell_update", "cells.C1", "=A1 + B1");

    const data = provider.getData();
    expect(data.cells.A1).toBe("100");
    expect(data.cells.B1).toBe("200");
    expect(data.cells.C1).toBe("=A1 + B1");
  });
});
