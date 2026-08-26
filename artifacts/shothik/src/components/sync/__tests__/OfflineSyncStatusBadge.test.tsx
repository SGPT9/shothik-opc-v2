import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { OfflineSyncStatusBadge } from "../OfflineSyncStatusBadge";
import { offlineCrdtStore } from "@/lib/sync/offline-crdt-store";

describe("OfflineSyncStatusBadge Component", () => {
  beforeEach(() => {
    offlineCrdtStore.clearForTesting();
    offlineCrdtStore.setOnlineStatus(true);
  });

  it("renders null by default when online and idle", () => {
    const { container } = render(<OfflineSyncStatusBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders 'Synced' badge when showWhenOnline is true", () => {
    render(<OfflineSyncStatusBadge showWhenOnline={true} />);
    const badge = screen.getByTestId("offline-sync-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Synced");
  });

  it("switches to 'Offline' badge when window offline event fires", () => {
    render(<OfflineSyncStatusBadge />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    const badge = screen.getByTestId("offline-sync-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Offline (0 queued)");
  });

  it("displays pending queued count when outbox has mutations", () => {
    offlineCrdtStore.queueOutboxMutation("mfs_verify", { trxId: "TRX-101" });

    render(<OfflineSyncStatusBadge />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    const badge = screen.getByTestId("offline-sync-badge");
    expect(badge).toHaveTextContent("Offline (1 queued)");
  });
});
