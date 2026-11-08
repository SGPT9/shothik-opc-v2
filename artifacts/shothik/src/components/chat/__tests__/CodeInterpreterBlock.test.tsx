import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CodeInterpreterBlock } from "../CodeInterpreterBlock";

describe("CodeInterpreterBlock Component", () => {
  it("renders code block with language header", () => {
    render(
      <CodeInterpreterBlock
        code="const x = 10; console.log(x * 2);"
        language="javascript"
      />
    );

    expect(screen.getByText(/javascript/i)).toBeInTheDocument();
    expect(screen.getByText(/const x = 10;/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run code in sandbox" })).toBeInTheDocument();
  });

  it("executes code locally and displays the output", async () => {
    render(
      <CodeInterpreterBlock
        code="console.log('Result:', 40 + 2);"
        language="javascript"
      />
    );

    const runBtn = screen.getByRole("button", { name: "Run code in sandbox" });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Result: 42/)).toBeInTheDocument();
    });
  });

  it("handles custom async execution handler when provided", async () => {
    const handleExecute = vi.fn().mockResolvedValue({
      stdout: "DataFrame shape: (100, 4)",
      executionTimeMs: 42,
    });

    render(
      <CodeInterpreterBlock
        code="import pandas as pd; df = pd.DataFrame()"
        language="python"
        onExecute={handleExecute}
      />
    );

    const runBtn = screen.getByRole("button", { name: "Run code in sandbox" });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(handleExecute).toHaveBeenCalledWith(
        "import pandas as pd; df = pd.DataFrame()",
        "python"
      );
      expect(screen.getByText("DataFrame shape: (100, 4)")).toBeInTheDocument();
      expect(screen.getByText("42ms")).toBeInTheDocument();
    });
  });
});
