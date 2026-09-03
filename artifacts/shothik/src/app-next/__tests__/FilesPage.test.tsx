import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilesPage from "../(primary-layout)/files/page";
import { saveOfflineManuscript, clearOfflineStorage } from "@/lib/offline/offline-storage";

describe("Files & Storage Page (FilesPage.tsx)", () => {
  beforeEach(() => {
    clearOfflineStorage();
  });

  it("renders files page and hydrates offline manuscripts from storage", () => {
    saveOfflineManuscript({
      id: "doc-test-1",
      title: "My Pitch Deck Notes",
      content: "# Pitch Deck\nOur TAM is $10B",
      updatedAt: Date.now(),
    });

    render(<FilesPage />);

    expect(screen.getByText(/Files & Knowledge Vault/i)).toBeInTheDocument();
    expect(screen.getByText("My_Pitch_Deck_Notes.md")).toBeInTheDocument();
    expect(screen.getByTestId("button-upload-file")).toBeInTheDocument();
  });

  it("filters file rows when user types in search box", () => {
    render(<FilesPage />);

    const searchInput = screen.getByTestId("input-search-files");
    fireEvent.change(searchInput, { target: { value: "Financials" } });

    expect(screen.getByText("Q3_Financials_v2.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Investor_Deck_Final.pptx")).not.toBeInTheDocument();
  });
});
