import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ShareConversationModal } from "../ShareConversationModal";
import { ShareArtifactModal } from "../ShareArtifactModal";
import { AgentDecisionExplanationModal } from "../AgentDecisionExplanationModal";
import { RagKnowledgeVaultModal } from "../RagKnowledgeVaultModal";

describe("Frontend AG-UI Chat Modals Accessibility & Interaction Suite", () => {
  describe("ShareConversationModal", () => {
    it("renders dialog with title, access permission options, and shareable link", () => {
      render(
        <ShareConversationModal
          isOpen={true}
          onClose={() => {}}
          conversationTitle="Q3 Growth Strategy"
          conversationId="conv_991823"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "share-conversation-title");

      expect(screen.getByText("Share Conversation")).toBeInTheDocument();
      expect(screen.getByText("Q3 Growth Strategy")).toBeInTheDocument();
      expect(screen.getByText("Public Link")).toBeInTheDocument();
      expect(screen.getByText("Workspace Team")).toBeInTheDocument();
      expect(screen.getByText("Private")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://shothikgpt.com/c/conv_991823")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <ShareConversationModal
          isOpen={false}
          onClose={() => {}}
          conversationTitle="Q3 Growth Strategy"
          conversationId="conv_991823"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("handles close button click and escape key dismissal", () => {
      const handleClose = vi.fn();
      render(
        <ShareConversationModal
          isOpen={true}
          onClose={handleClose}
          conversationTitle="Q3 Growth Strategy"
          conversationId="conv_991823"
        />
      );

      const closeBtn = screen.getByRole("button", { name: /close share conversation dialog/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Escape key dismissal
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it("switches access levels", () => {
      render(
        <ShareConversationModal
          isOpen={true}
          onClose={() => {}}
          conversationTitle="Q3 Growth Strategy"
          conversationId="conv_991823"
        />
      );

      const teamBtn = screen.getByRole("button", { name: /Workspace Team/i });
      fireEvent.click(teamBtn);
      expect(teamBtn.className).toContain("border-purple-500");
    });
  });

  describe("ShareArtifactModal", () => {
    it("renders dialog with title, public web link, and social broadcast buttons", () => {
      render(
        <ShareArtifactModal
          open={true}
          onOpenChange={() => {}}
          title="Supply Chain Analysis"
          artifactType="dossier"
          slug="art_supply_01"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "share-artifact-title");

      expect(screen.getByText("Share Public Link")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /WhatsApp/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /LinkedIn/i })).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      const { container } = render(
        <ShareArtifactModal
          open={false}
          onOpenChange={() => {}}
          title="Supply Chain Analysis"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("triggers onOpenChange on close button and escape key", () => {
      const handleOpenChange = vi.fn();
      render(
        <ShareArtifactModal
          open={true}
          onOpenChange={handleOpenChange}
          title="Supply Chain Analysis"
        />
      );

      const closeBtn = screen.getByRole("button", { name: /close share public link dialog/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      // Escape key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("AgentDecisionExplanationModal", () => {
    const mockDecision = {
      agentName: "Steadfast Dispatcher",
      agentHandle: "steadfast_agent",
      userPrompt: "Dispatch panjabi order to Uttara",
      decisionReasoning: "Customer DSR score is 98% with 0 historical cancellations. Safe for 1-click COD dispatch.",
      toolsInvoked: ["steadfast_create_order", "sms_gateway_notify"],
      capabilitySeamUsed: "courier_dispatch",
      providerSelected: "Steadfast Courier API v2",
      epistemicConfidence: 96,
    };

    it("renders agent decision audit details, epistemic score, and tools invoked", () => {
      render(
        <AgentDecisionExplanationModal
          isOpen={true}
          onClose={() => {}}
          decisionInfo={mockDecision}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "agent-decision-title");

      expect(screen.getByText("Agent Decision Audit")).toBeInTheDocument();
      expect(screen.getByText(/@steadfast_agent/i)).toBeInTheDocument();
      expect(screen.getByText("96% Confidence")).toBeInTheDocument();
      expect(screen.getByText(/Safe for 1-click COD dispatch/i)).toBeInTheDocument();
      expect(screen.getByText("steadfast_create_order")).toBeInTheDocument();
      expect(screen.getByText("sms_gateway_notify")).toBeInTheDocument();
      expect(screen.getByText(/Provider: Steadfast Courier API v2/i)).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <AgentDecisionExplanationModal
          isOpen={false}
          onClose={() => {}}
          decisionInfo={mockDecision}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("handles close button, Done button, and escape key", () => {
      const handleClose = vi.fn();
      render(
        <AgentDecisionExplanationModal
          isOpen={true}
          onClose={handleClose}
          decisionInfo={mockDecision}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /close agent decision audit dialog/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      const doneBtn = screen.getByRole("button", { name: /^done$/i });
      fireEvent.click(doneBtn);
      expect(handleClose).toHaveBeenCalledTimes(2);

      // Escape key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("RagKnowledgeVaultModal", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ documents: [] }),
      }));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("renders RAG knowledge vault dialog with title and tabs", async () => {
      await act(async () => {
        render(
          <RagKnowledgeVaultModal
            isOpen={true}
            onClose={() => {}}
          />
        );
      });

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      expect(screen.getByText("RAG Knowledge Vault & Vector Index")).toBeInTheDocument();
      expect(screen.getByText(/Vault Documents/i)).toBeInTheDocument();
      expect(screen.getByText("Semantic Search")).toBeInTheDocument();
      expect(screen.getByText("Ingest Manuscript / Docs")).toBeInTheDocument();
    });

    it("switches to Ingest tab and displays form inputs", async () => {
      await act(async () => {
        render(
          <RagKnowledgeVaultModal
            isOpen={true}
            onClose={() => {}}
          />
        );
      });

      const ingestTab = screen.getByRole("button", { name: /Ingest Manuscript \/ Docs/i });
      await act(async () => {
        fireEvent.click(ingestTab);
      });

      expect(screen.getByText("Document Title")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g. Bangladesh Logistics Regulatory Framework/i)).toBeInTheDocument();
      expect(screen.getByText("Document Content (Markdown / Text)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ingest into Vector Vault/i })).toBeInTheDocument();
    });

    it("handles close button dismissal", async () => {
      const handleClose = vi.fn();
      await act(async () => {
        render(
          <RagKnowledgeVaultModal
            isOpen={true}
            onClose={handleClose}
          />
        );
      });

      const closeBtn = screen.getByRole("button", { name: /close rag knowledge vault dialog/i });
      expect(closeBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(closeBtn);
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
