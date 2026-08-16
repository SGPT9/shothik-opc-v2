import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Mock react-i18next with English fallbacks
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "auth.nameLabel": "Full Name",
        "auth.namePlaceholder": "Enter your full name",
        "auth.emailLabel": "Email Address",
        "auth.emailPlaceholder": "Enter your work email",
        "auth.passwordLabel": "Password",
        "auth.createAccount": "Create Account",
        "auth.alreadyHaveAccount": "Already have an account? Sign in",
        "auth.termsAgreement": "I agree to the Terms of Service & Privacy Policy",
        "auth.intent.researchTitle": "Market Research & Intelligence",
        "auth.intent.assignmentTitle": "Student & Academic Writing",
        "auth.intent.twinTitle": "Autonomous Digital Twin",
      };
      if (translations[key]) return translations[key];
      // Format simple key fallback e.g. "auth.nameLabel" -> "Name" or defaultValue
      if (options?.defaultValue) return options.defaultValue;
      const parts = key.split(".");
      const last = parts[parts.length - 1];
      return last.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
    },
    i18n: {
      language: "en",
      changeLanguage: () => Promise.resolve(),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock window.matchMedia for JSDOM
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };

  // Mock scrollIntoView & scrollTo
  window.scrollTo = vi.fn();

  // Mock HTMLCanvasElement.getContext for PDF / Charts
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId) => {
      if (contextId === "2d") {
        return {
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          getImageData: vi.fn(() => ({ data: new Array(4) })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => []),
          setTransform: vi.fn(),
          drawImage: vi.fn(),
          save: vi.fn(),
          fillText: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          translate: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          transform: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn(),
        } as any;
      }
      return null;
    });
  }
}

if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = vi.fn();
}
if (typeof HTMLElement !== "undefined") {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

