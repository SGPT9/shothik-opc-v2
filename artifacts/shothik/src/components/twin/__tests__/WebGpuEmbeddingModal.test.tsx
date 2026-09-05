import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WebGpuEmbeddingModal } from "../WebGpuEmbeddingModal";

describe("WebGpuEmbeddingModal Component (WebGpuEmbeddingModal.tsx)", () => {
  it("renders modal header, BGE-m3 badge, and description", () => {
    render(<WebGpuEmbeddingModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Autonomous WebGPU Embedding & Reranking Engine")
    ).toBeInTheDocument();
    expect(screen.getByText("BGE-m3 FP16")).toBeInTheDocument();
    expect(screen.getByText(/On-device client-side embedding acceleration/i)).toBeInTheDocument();
  });

  it("renders all 3 navigation tabs", () => {
    render(<WebGpuEmbeddingModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/Semantic Cache Explorer/i)).toBeInTheDocument();
    expect(screen.getByText("WebGPU Compute Benchmark")).toBeInTheDocument();
    expect(screen.getByText("BGE-m3 Cross-Encoder Reranker")).toBeInTheDocument();
  });

  it("switches to WebGPU Compute Benchmark tab and displays vector options", async () => {
    render(<WebGpuEmbeddingModal open={true} onOpenChange={() => {}} />);

    const benchmarkTab = screen.getByText("WebGPU Compute Benchmark");
    fireEvent.click(benchmarkTab);

    await waitFor(() => {
      expect(screen.getByText("WebGPU Tensor Compute Shader Benchmark")).toBeInTheDocument();
      expect(screen.getByText("500 vectors")).toBeInTheDocument();
      expect(screen.getByText("1000 vectors")).toBeInTheDocument();
      expect(screen.getByText("2500 vectors")).toBeInTheDocument();
      expect(screen.getByText("Run WebGPU Benchmark")).toBeInTheDocument();
    });
  });

  it("switches to BGE-m3 Cross-Encoder Reranker tab and displays candidate documents", async () => {
    render(<WebGpuEmbeddingModal open={true} onOpenChange={() => {}} />);

    const rerankerTab = screen.getByText("BGE-m3 Cross-Encoder Reranker");
    fireEvent.click(rerankerTab);

    await waitFor(() => {
      expect(screen.getByText("Multilingual BGE-m3 Cross-Encoder Reranker")).toBeInTheDocument();
      expect(screen.getByText("Execute WebGPU Rerank")).toBeInTheDocument();
      expect(screen.getByText("BDIX Peering & Regional Edge Architecture")).toBeInTheDocument();
    });
  });

  it("renders quick preset buttons in Semantic Cache Explorer tab", () => {
    render(<WebGpuEmbeddingModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("BDIX Read Latency (Known Hit)")).toBeInTheDocument();
    expect(screen.getByText("bKash Fees (Paraphrase Hit)")).toBeInTheDocument();
    expect(screen.getByText("Canary Circuit Breaker")).toBeInTheDocument();
    expect(screen.getByText("Uncached Novel Query (Cold Miss)")).toBeInTheDocument();
  });
});
