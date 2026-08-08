// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VerifyEmailCodePage from "../page";

const { replace, verifyEmail } = vi.hoisted(() => ({
  replace: vi.fn(),
  verifyEmail: vi.fn(),
}));

let insforgeClient: { auth: { verifyEmail: typeof verifyEmail } } | null = {
  auth: { verifyEmail },
};

vi.mock("@/lib/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === "email" ? "user@example.com" : null),
  }),
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/insforge/client", () => ({
  getInsforgeBrowserClient: () => insforgeClient,
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function submitOtp(otp: string) {
  fireEvent.change(screen.getByLabelText("auth.verificationCode"), {
    target: { value: otp },
  });
  fireEvent.click(screen.getByRole("button", { name: /auth.verifyEmail/ }));
}

describe("VerifyEmailCodePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insforgeClient = { auth: { verifyEmail } };
  });

  afterEach(() => {
    cleanup();
  });

  it("verifies the code via the Insforge browser client and redirects to login", async () => {
    verifyEmail.mockResolvedValue({ data: { success: true }, error: null });

    render(<VerifyEmailCodePage />);
    submitOtp("123456");

    await waitFor(() =>
      expect(verifyEmail).toHaveBeenCalledWith({
        email: "user@example.com",
        otp: "123456",
      }),
    );
    await screen.findByRole("status");

    await waitFor(
      () =>
        expect(replace).toHaveBeenCalledWith(
          "/auth/login?email=user%40example.com&verified=1",
        ),
      { timeout: 3000 },
    );
  });

  it("shows the backend error message when verification fails", async () => {
    verifyEmail.mockResolvedValue({
      data: null,
      error: { statusCode: 400, message: "Invalid or expired verification code" },
    });

    render(<VerifyEmailCodePage />);
    submitOtp("654321");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Invalid or expired verification code");
    expect(replace).not.toHaveBeenCalled();
  });

  it("rejects malformed codes client-side without calling the backend", async () => {
    const { container } = render(<VerifyEmailCodePage />);
    fireEvent.change(screen.getByLabelText("auth.verificationCode"), {
      target: { value: "12" },
    });
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it("shows a generic error when Insforge is not configured", async () => {
    insforgeClient = null;

    render(<VerifyEmailCodePage />);
    submitOtp("123456");

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(verifyEmail).not.toHaveBeenCalled();
  });
});
