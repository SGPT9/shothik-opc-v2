import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterPage from "../page";

const push = vi.fn();
const register = vi.fn();
let currentIntent = "research";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "intent" ? currentIntent : null),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    register,
  }),
}));

vi.mock("@/lib/navigation", () => ({
  useRouter: () => ({
    push,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "intent" ? currentIntent : null),
  }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/i18n", () => {
  const enTranslations: Record<string, string> = {
    "auth.createWorkspaceBadge": "Get Started",
    "auth.registerHeadline": "Create your account",
    "auth.registerSubheadline": "Start your journey with Shothik",
    "auth.firstRunRecommendation": "First Step",
    "auth.createYourAccount": "Create your account",
    "auth.setUpYourWorkspace": "Set up your workspace",
    "auth.registerDescription": "Enter your details to create an account",
    "auth.name": "Name",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.country": "Country",
    "auth.whatDoYouWantFirst": "What do you want to do first?",
    "auth.termsAgreement": "I agree to the terms and conditions",
    "auth.createAccount": "Create account",
    "auth.creatingAccount": "Creating account...",
    "auth.alreadyHaveAccount": "Already have an account? Login",
    "auth.enterVerificationCode": "Enter verification code",
    "auth.messages.nameRequired": "Name is required.",
    "auth.messages.invalidEmail": "Invalid email address.",
    "auth.messages.passwordTooShort": "Password must be at least 6 characters long.",
    "auth.messages.passwordsDoNotMatch": "Passwords do not match yet.",
    "auth.messages.mustAgreeTerms": "You must agree to the terms and conditions before creating an account.",
    "auth.messages.fixHighlighted": "Please fix the highlighted fields before continuing.",
    "auth.messages.accountCreatedVerify": "Account created. Please verify your email before signing in.",
    "auth.messages.registrationSuccessRedirect": "Registration successful!",
    "auth.intent.continueTitle": "Continue",
    "auth.intent.writingStudioTitle": "Writing Studio",
    "auth.intent.researchTitle": "Research",
    "auth.intent.assignmentTitle": "Assignment",
    "auth.intent.twinTitle": "Digital Twin",
  };
  return {
    useTranslation: () => ({
      t: (key: string) => enTranslations[key] || key,
      locale: "en",
      setLocale: vi.fn(),
    }),
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    push.mockReset();
    register.mockReset();
    currentIntent = "research";
  });

  it("shows inline validation errors when required registration fields are invalid", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Shothik User" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "456" } });

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Please fix the highlighted fields before continuing.");
    expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match yet.")).toBeInTheDocument();
    expect(screen.getByText("You must agree to the terms and conditions before creating an account.")).toBeInTheDocument();
  });

  it("preserves the selected intent in the login recovery link", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("What do you want to do first?"), {
      target: { value: "assignment" },
    });

    expect(screen.getByRole("link", { name: /Already have an account\? Login/i })).toHaveAttribute(
      "href",
      "/auth/login?intent=assignment"
    );
  });

  it("offers a verification code link when signup requires email verification", async () => {
    register.mockResolvedValue({ requiresEmailVerification: true });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Shothik User" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Account created. Please verify your email before signing in.");
    expect(screen.getByRole("link", { name: /Enter verification code/i })).toHaveAttribute(
      "href",
      "/auth/verify-email?email=user%40example.com",
    );
  });
});
