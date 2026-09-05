import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WasmVectorIndexModal } from "../WasmVectorIndexModal";

describe("WasmVectorIndexModal Component (WasmVectorIndexModal.tsx)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/v1/crdt/vectors/status")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                status: {
                  initialized: true,
                  linearMemoryPages: 2,
                  linearMemoryBytes: 131072,
                  vectorCount: 5,
                  maxVectorCapacity: 85,
                  vectorDimension: 384,
                  clusterClock: {
                    dhaka_bdix_edge_node: 5,
                    singapore_sg1_peer: 12,
                    local_client_capsule: 4,
                  },
                },
              }),
          });
        }
        if (url.includes("/api/v1/crdt/vectors/entries")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                entries: [
                  {
                    slotIndex: 0,
                    metadata: {
                      id: "vec_bdix_peering",
                      documentId: "doc_infra_001",
                      textExcerpt: "Dhaka BDIX direct IXP edge peering provides sub-5ms latency.",
                      tags: ["infrastructure", "bdix"],
                      peerOrigin: "dhaka_bdix_edge_node",
                      crdtClock: { dhaka_bdix_edge_node: 1 },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                    vector: [0.12, 0.45, -0.22, 0.91],
                  },
                ],
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      })
    );
  });

  it("renders modal header, WASM badge, and linear buffer description", () => {
    render(<WasmVectorIndexModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Autonomous Edge WebAssembly Linear CRDT Vector Indices")
    ).toBeInTheDocument();
    expect(screen.getByText("WASM 64KB Linear Pages")).toBeInTheDocument();
    expect(
      screen.getByText(/Zero-copy 384-dimensional dense vector indexing/i)
    ).toBeInTheDocument();
  });

  it("renders all 3 navigation tabs", () => {
    render(<WasmVectorIndexModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/Linear WASM Memory Explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/Nearest-Neighbor Search Chamber/i)).toBeInTheDocument();
    expect(screen.getByText(/CRDT Vector Delta Sync & Benchmark/i)).toBeInTheDocument();
  });

  it("switches to Nearest-Neighbor Search Chamber tab and displays search controls and presets", async () => {
    render(<WasmVectorIndexModal open={true} onOpenChange={() => {}} />);

    const searchTab = screen.getByText(/Nearest-Neighbor Search Chamber/i);
    fireEvent.click(searchTab);

    await waitFor(() => {
      expect(screen.getByText("BDIX Peering")).toBeInTheDocument();
      expect(screen.getByText("bKash Payout")).toBeInTheDocument();
      expect(screen.getByText("Nilkhet POD")).toBeInTheDocument();
      expect(screen.getByText("Cosine Similarity")).toBeInTheDocument();
      expect(screen.getByText("Euclidean (L2)")).toBeInTheDocument();
      expect(screen.getByText("Search Nearest")).toBeInTheDocument();
    });
  });

  it("switches to CRDT Vector Delta Sync & Benchmark tab and displays cluster clocks and benchmark controls", async () => {
    render(<WasmVectorIndexModal open={true} onOpenChange={() => {}} />);

    const syncTab = screen.getByText(/CRDT Vector Delta Sync & Benchmark/i);
    fireEvent.click(syncTab);

    await waitFor(() => {
      expect(screen.getByText(/Decentralized CRDT Cluster Clocks/i)).toBeInTheDocument();
      expect(screen.getByText("Export Local Delta")).toBeInTheDocument();
      expect(screen.getByText("Merge Delta")).toBeInTheDocument();
      expect(screen.getByText(/WebAssembly Linear Memory Throughput Benchmark/i)).toBeInTheDocument();
      expect(screen.getByText("Run Benchmark")).toBeInTheDocument();
    });
  });

  it("renders vector packing inputs on explorer tab", () => {
    render(<WasmVectorIndexModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText(/Pack Vector into WebAssembly Linear Buffer/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Pack Vector into Buffer")).toBeInTheDocument();
    expect(screen.getByText("384 Float32 (Dense)")).toBeInTheDocument();
  });
});
