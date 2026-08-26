import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BookCenterCanvas, type CanvasTab } from "../BookCenterCanvas";

// Mock child modals
vi.mock("@/components/scenariolab/ScenarioLabModal", () => ({
  ScenarioLabModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="mock-scenariolab-modal">ScenarioLab Modal</div> : null,
}));

vi.mock("../PrintPreflightModal", () => ({
  PrintPreflightModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="mock-preflight-modal">Preflight Modal</div> : null,
}));

vi.mock("../CommercializeBookModal", () => ({
  CommercializeBookModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="mock-commercialize-modal">Commercialize Modal</div> : null,
}));

vi.mock("@/components/voice/VTuberVoiceAvatarOverlay", () => ({
  VTuberVoiceAvatarOverlay: () => <div data-testid="mock-vtuber-overlay">VTuber Overlay</div>,
}));

describe("BookCenterCanvas Component", () => {
  const defaultProps = {
    activeTab: "editor" as CanvasTab,
    onTabChange: vi.fn(),
    editorText: "Hello world chapter text",
    onEditorTextChange: vi.fn(),
    livePreviewUrl: "https://demo.shothik.ai",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders editor tab with text and word count stats", () => {
    render(<BookCenterCanvas {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Write your chapter manuscript here/i)).toBeInTheDocument();
    expect(screen.getByText("4 words")).toBeInTheDocument();
    expect(screen.getByText(/UTF-8 Bengali & English/i)).toBeInTheDocument();
  });

  it("calls onTabChange when clicking navigation tabs", () => {
    const onTabChange = vi.fn();
    render(<BookCenterCanvas {...defaultProps} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText("Fortune Sheet"));
    expect(onTabChange).toHaveBeenCalledWith("sheet");

    fireEvent.click(screen.getByText("Web Preview"));
    expect(onTabChange).toHaveBeenCalledWith("web_preview");

    fireEvent.click(screen.getByText("Slides Pitch"));
    expect(onTabChange).toHaveBeenCalledWith("slides");
  });

  it("converts Bijoy to Unicode Bengali when clicking Bijoy button", () => {
    const onEditorTextChange = vi.fn();
    render(
      <BookCenterCanvas
        {...defaultProps}
        editorText="Avgvi bvg"
        onEditorTextChange={onEditorTextChange}
      />
    );

    const bijoyBtn = screen.getByTitle(/Convert Bijoy\/ANSI Bengali to Standard Unicode/i);
    fireEvent.click(bijoyBtn);

    expect(onEditorTextChange).toHaveBeenCalled();
  });

  it("toggles between editor and web_preview on Cmd+\\ / Ctrl+\\ keyboard shortcut", () => {
    const onTabChange = vi.fn();
    render(<BookCenterCanvas {...defaultProps} activeTab="editor" onTabChange={onTabChange} />);

    // Simulate Cmd + \
    fireEvent.keyDown(window, { key: "\\", metaKey: true });
    expect(onTabChange).toHaveBeenCalledWith("web_preview");
  });

  it("renders web preview iframe and toggles element inspector", () => {
    render(<BookCenterCanvas {...defaultProps} activeTab="web_preview" />);

    expect(screen.getByTestId("live-preview-iframe")).toBeInTheDocument();
    expect(screen.getByText("https://demo.shothik.ai")).toBeInTheDocument();

    const inspectorToggle = screen.getByTestId("toggle-element-inspector");
    expect(inspectorToggle).toHaveTextContent("Inspect Element");

    // Toggle inspector ON
    fireEvent.click(inspectorToggle);
    expect(inspectorToggle).toHaveTextContent("Inspector ON");
    expect(screen.getByText(/Hover over any element in the preview below to inspect…/i)).toBeInTheDocument();

    // Simulate postMessage hover event from iframe
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "SHOTHIK_INSPECT_HOVER",
            selector: "button.hero-cta",
            tagName: "BUTTON",
            textContent: "Get Started Now",
            dimensions: "140x40",
          },
        })
      );
    });

    expect(screen.getByText(/button\.hero-cta/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy Selector/i)).toBeInTheDocument();
  });

  it("opens ScenarioLab modal, Preflight modal, and Commercialize modal when clicked", () => {
    render(<BookCenterCanvas {...defaultProps} activeTab="sheet" />);

    // Open ScenarioLab
    fireEvent.click(screen.getByText(/Launch ScenarioLab™ Console/i));
    expect(screen.getByTestId("mock-scenariolab-modal")).toBeInTheDocument();

    // Open Preflight
    fireEvent.click(screen.getByText("Preflight"));
    expect(screen.getByTestId("mock-preflight-modal")).toBeInTheDocument();

    // Open Commercialize
    fireEvent.click(screen.getByTestId("button-sell-in-twin"));
    expect(screen.getByTestId("mock-commercialize-modal")).toBeInTheDocument();
  });
});
