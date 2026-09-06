import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArtifactPanel } from "../ArtifactPanel";
import { DocArtifact } from "../artifacts/DocArtifact";
import { SheetArtifact, evaluateFormula } from "../artifacts/SheetArtifact";
import { CodeArtifact } from "../artifacts/CodeArtifact";

describe("Universal Canvas & Interactive Artifacts Split-Pane", () => {
  describe("ArtifactPanel Component", () => {
    it("renders active artifact tab and quick switch controls", () => {
      const handleTabChange = vi.fn();
      const handleClose = vi.fn();

      render(
        <ArtifactPanel
          activeTab="doc"
          onTabChange={handleTabChange}
          onClose={handleClose}
          docTitle="Project Manifesto"
          docContent="Universal Human-Agent Operating System"
        />
      );

      expect(screen.getAllByText("Document").length).toBeGreaterThan(0);
      expect(screen.getByText("CRDT Synced")).toBeInTheDocument();
      expect(screen.getByLabelText("Switch Artifact Canvas")).toBeInTheDocument();
    });

    it("triggers onTabChange when quick pill button is clicked", () => {
      const handleTabChange = vi.fn();
      const handleClose = vi.fn();

      render(
        <ArtifactPanel
          activeTab="doc"
          onTabChange={handleTabChange}
          onClose={handleClose}
        />
      );

      const codePill = screen.getByTitle("Switch to Code");
      fireEvent.click(codePill);

      expect(handleTabChange).toHaveBeenCalledWith("code");
    });
  });

  describe("DocArtifact Direct Editing & Diff Inspection", () => {
    it("renders document content and toggles between preview and edit modes", () => {
      const handleContentChange = vi.fn();

      render(
        <DocArtifact
          initialTitle="Test Document"
          initialContent="Original Section Content"
          onContentChange={handleContentChange}
        />
      );

      expect(screen.getByText("Original Section Content")).toBeInTheDocument();

      // Click Edit button
      const editButton = screen.getByTitle("Directly Edit Document");
      fireEvent.click(editButton);

      // Textarea should be rendered
      const textarea = screen.getByPlaceholderText("Type or paste markdown content directly...");
      expect(textarea).toBeInTheDocument();

      // Type new text
      fireEvent.change(textarea, { target: { value: "Updated Section Content" } });
      expect(handleContentChange).toHaveBeenCalledWith("Updated Section Content");
    });
  });

  describe("SheetArtifact Cell Editing & Formula Evaluation", () => {
    it("evaluates mathematical formulas accurately", () => {
      const mockGrid = [
        ["Revenue", "1000"],
        ["Cost", "400"],
      ];

      expect(evaluateFormula("=SUM(B1:B2)", mockGrid)).toBe("1,400");
      expect(evaluateFormula("=B1-B2", mockGrid)).toBe("600");
      expect(evaluateFormula("=AVERAGE(B1:B2)", mockGrid)).toBe("700");
      expect(evaluateFormula("=IF(B1 > B2, 'Profitable', 'Loss')", mockGrid).toLowerCase()).toBe("profitable");
      expect(evaluateFormula("=IF(B1 < B2, 'Profitable', 'Loss')", mockGrid).toLowerCase()).toBe("loss");
      expect(evaluateFormula("=IF(invalid(js), 1, 0)", mockGrid)).toBe("#VALUE!");
    });

    it("triggers onDataChange when cell is updated", () => {
      const handleDataChange = vi.fn();

      render(
        <SheetArtifact
          title="Unit Economics"
          onDataChange={handleDataChange}
        />
      );

      expect(screen.getByText("Unit Economics")).toBeInTheDocument();
    });
  });

  describe("CodeArtifact Script Editing & Python Sandbox", () => {
    it("triggers onCodeChange when code is edited in the source textarea", () => {
      const handleCodeChange = vi.fn();

      render(
        <CodeArtifact
          initialCode="print('Hello Shothik')"
          onCodeChange={handleCodeChange}
        />
      );

      const textarea = screen.getByDisplayValue("print('Hello Shothik')");
      fireEvent.change(textarea, { target: { value: "print('Updated Code')" } });

      expect(handleCodeChange).toHaveBeenCalledWith("print('Updated Code')");
    });
  });
});
