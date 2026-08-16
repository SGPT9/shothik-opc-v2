// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { ApprovalCard } from "../ApprovalCard";
import { SecretShareCard } from "../SecretShareCard";

describe("Control Layer — Human-in-the-Loop Components", () => {
  afterEach(() => {
    cleanup();
  });
  describe("ApprovalCard", () => {
    it("renders active approval request and fires onApprove callback", () => {
      const onApprove = vi.fn();
      const onDeny = vi.fn();

      render(
        <ApprovalCard
          checkpointId="chk_101"
          actionSummary="Execute SQL Migration on production database"
          reason="Modifies schema column 'organizations.billing_tier'"
          details="ALTER TABLE organizations ADD COLUMN billing_tier text DEFAULT 'free';"
          onApprove={onApprove}
          onDeny={onDeny}
        />
      );

      expect(screen.getByText("Approval Required")).toBeInTheDocument();
      expect(
        screen.getByText("Execute SQL Migration on production database")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Modifies schema column 'organizations.billing_tier'")
      ).toBeInTheDocument();

      // Expand details
      const detailsToggle = screen.getByRole("button", { name: /show details/i });
      fireEvent.click(detailsToggle);
      expect(
        screen.getByText(/ALTER TABLE organizations ADD COLUMN/i)
      ).toBeInTheDocument();

      // Approve action
      const approveBtn = screen.getByRole("button", { name: /Approve/i });
      fireEvent.click(approveBtn);
      expect(onApprove).toHaveBeenCalledTimes(1);
      expect(onDeny).not.toHaveBeenCalled();
    });

    it("renders active approval request and fires onDeny callback", () => {
      const onApprove = vi.fn();
      const onDeny = vi.fn();

      render(
        <ApprovalCard
          actionSummary="Delete orphaned cloud sandbox"
          reason="Cleanup allocated RAM resources"
          onApprove={onApprove}
          onDeny={onDeny}
        />
      );

      const denyBtn = screen.getByRole("button", { name: /Deny/i });
      fireEvent.click(denyBtn);
      expect(onDeny).toHaveBeenCalledTimes(1);
      expect(onApprove).not.toHaveBeenCalled();
    });

    it("renders collapsed audit record when resolved as approved", () => {
      render(
        <ApprovalCard
          actionSummary="Deploy production release v2.4.0"
          reason="Release to edge CDN"
          resolved={true}
          outcome="approved"
        />
      );

      expect(screen.queryByText("Approval Required")).not.toBeInTheDocument();
      expect(screen.getByText("Approved:")).toBeInTheDocument();
      expect(screen.getByText("Deploy production release v2.4.0")).toBeInTheDocument();
    });

    it("renders collapsed audit record when resolved as denied", () => {
      render(
        <ApprovalCard
          actionSummary="Purge user cache across regions"
          reason="Force refresh session state"
          resolved={true}
          outcome="denied"
        />
      );

      expect(screen.queryByText("Approval Required")).not.toBeInTheDocument();
      expect(screen.getByText("Denied:")).toBeInTheDocument();
      expect(screen.getByText("Purge user cache across regions")).toBeInTheDocument();
    });
  });

  describe("SecretShareCard", () => {
    it("renders masked credential input and submits trimmed secret ephemerally", () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      render(
        <SecretShareCard
          checkpointId="chk_secret_99"
          purpose="Authenticate with GitHub API for repository inspection"
          label="Personal Access Token"
          placeholder="ghp_..."
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText("Secure Credential Required")).toBeInTheDocument();
      expect(
        screen.getByText("Authenticate with GitHub API for repository inspection")
      ).toBeInTheDocument();
      expect(screen.getByText("Personal Access Token")).toBeInTheDocument();

      const input = screen.getByPlaceholderText("ghp_...") as HTMLInputElement;
      expect(input.type).toBe("password");

      // Toggle reveal
      const revealBtn = screen.getByTitle("Reveal");
      fireEvent.click(revealBtn);
      expect(input.type).toBe("text");

      // Type secret
      fireEvent.change(input, { target: { value: " ghp_testtoken123 " } });

      const submitBtn = screen.getByRole("button", { name: /Share securely/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledWith("ghp_testtoken123");
    });

    it("renders collapsed post-submission record without plain-text secret leak", () => {
      render(
        <SecretShareCard
          purpose="Authenticate with GitHub API"
          label="Personal Access Token"
          submitted={true}
        />
      );

      expect(
        screen.queryByText("Secure Credential Required")
      ).not.toBeInTheDocument();
      expect(screen.getByText("Personal Access Token")).toBeInTheDocument();
      expect(screen.getByText("••••••••")).toBeInTheDocument();
    });
  });
});
