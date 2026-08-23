import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OfflineSyncBadge } from "../OfflineSyncBadge";
import { OfflineSyncEngine } from "@/lib/offline/OfflineSyncEngine";
import { clearOfflineStorage } from "@/lib/offline/offline-storage";

describe("OfflineSyncBadge", () => {
  beforeEach(() => {
    clearOfflineStorage();
    OfflineSyncEngine.resetInstance();
  });

  afterEach(() => {
    OfflineSyncEngine.resetInstance();
  });

  it("renders offline status pill when offline", () => {
    const engine = OfflineSyncEngine.getInstance();
    engine.setOnlineStatus(false);

    render(<OfflineSyncBadge />);
    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
  });

  it("displays queued count when offline with pending outbox items", () => {
    const engine = OfflineSyncEngine.getInstance();
    engine.setOnlineStatus(false);
    engine.enqueue("courier_dispatch", { trackingId: "ST-123" });

    render(<OfflineSyncBadge />);
    expect(screen.getByText(/Offline · 1 queued/i)).toBeInTheDocument();
  });

  it("renders retry button when there are failed sync items", async () => {
    const mockTransport = vi.fn().mockResolvedValue({ success: false, error: "Network error" });
    const engine = OfflineSyncEngine.getInstance(mockTransport);
    engine.setOnlineStatus(false);
    engine.enqueue("mfs_verify", { trxId: "TRX-FAILED" });

    // Flush and fail
    engine.setOnlineStatus(true, false);
    await engine.flush(mockTransport);

    render(<OfflineSyncBadge />);
    const retryBtn = screen.getByRole("button");
    expect(retryBtn).toHaveTextContent(/1 failed · Retry/i);

    // Clicking retry triggers flush
    fireEvent.click(retryBtn);
    expect(mockTransport).toHaveBeenCalled();
  });
});
