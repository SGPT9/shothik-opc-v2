import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MultiModelParetoModal } from "../MultiModelParetoModal";

describe("MultiModelParetoModal Component (MultiModelParetoModal.tsx)", () => {
  it("renders modal header, Cost Saved badge, and metric cards", () => {
    render(<MultiModelParetoModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Autonomous Multi-Model Cost & Accuracy Pareto Optimizer")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/COST SAVED/i)[0]).toBeInTheDocument();
    expect(screen.getByText("Total Cost Saved")).toBeInTheDocument();
    expect(screen.getByText("Active Strategy")).toBeInTheDocument();
    expect(screen.getByText("Queries Processed")).toBeInTheDocument();
  });

  it("renders all 4 models in Pareto Frontier Matrix tab", () => {
    render(<MultiModelParetoModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Google Gemini 2.5 Flash")).toBeInTheDocument();
    expect(screen.getByText("DeepSeek V3 (MoE)")).toBeInTheDocument();
    expect(screen.getByText("Anthropic Claude 3.7 Sonnet")).toBeInTheDocument();
    expect(screen.getByText("Local Sovereign Ollama (Qwen 2.5 14B)")).toBeInTheDocument();
  });

  it("switches to Routing Strategies tab and selects a strategy", async () => {
    render(<MultiModelParetoModal open={true} onOpenChange={() => {}} />);

    const stratTab = screen.getByText("Routing Strategies");
    expect(stratTab).toBeInTheDocument();
    fireEvent.click(stratTab);

    await waitFor(() => {
      expect(screen.getByText("Cost Minimizer")).toBeInTheDocument();
      expect(screen.getByText("Quality Maximizer")).toBeInTheDocument();
      expect(screen.getByText("Offline Sovereign Mode")).toBeInTheDocument();
    });

    const costMinimizerCard = screen.getByText("Cost Minimizer");
    fireEvent.click(costMinimizerCard);

    await waitFor(() => {
      expect(screen.getByText(/strategy/i)).toBeInTheDocument();
    });
  });

  it("switches to Query Router Playground tab and evaluates prompt route", async () => {
    render(<MultiModelParetoModal open={true} onOpenChange={() => {}} />);

    const playgroundTab = screen.getByText("Query Router Playground");
    fireEvent.click(playgroundTab);

    await waitFor(() => {
      expect(screen.getByText("Simulated Query / Task Prompt:")).toBeInTheDocument();
    });

    const evalBtn = screen.getByText("Evaluate Route");
    expect(evalBtn).toBeInTheDocument();

    fireEvent.click(evalBtn);

    await waitFor(() => {
      expect(screen.getByText("Optimal Model Selected")).toBeInTheDocument();
    });
  });

  it("triggers Calibrate Frontier button and displays notification", async () => {
    render(<MultiModelParetoModal open={true} onOpenChange={() => {}} />);

    const calibrateBtn = screen.getByText("Calibrate Frontier");
    expect(calibrateBtn).toBeInTheDocument();

    fireEvent.click(calibrateBtn);

    await waitFor(() => {
      expect(screen.getByText(/calibrat/i)).toBeInTheDocument();
    });
  });
});
