/**
 * Prompt Profile Registry & Intent-Aware System Injection Engine
 * Dynamically selects and injects domain-specific system prompts based on detected user intent.
 */

export type DomainIntent = "fcommerce_merchant" | "nbr_tax_advisor" | "nilkhet_author" | "code_architect";

export interface SystemPromptProfile {
  profileId: DomainIntent;
  title: string;
  systemInstruction: string;
  temperature: number;
}

export class PromptProfileManager {
  private profiles: Record<DomainIntent, SystemPromptProfile> = {
    fcommerce_merchant: {
      profileId: "fcommerce_merchant",
      title: "F-Commerce Sales & Delivery Specialist",
      systemInstruction: "You are Shothik F-Commerce Specialist. Parse order comments in Banglish/Bangla, extract phone numbers & delivery addresses, and issue bKash payment links.",
      temperature: 0.3,
    },
    nbr_tax_advisor: {
      profileId: "nbr_tax_advisor",
      title: "NBR Statutory Tax & VAT Advisor",
      systemInstruction: "You are Shothik NBR Tax Advisor. Calculate Section 78 income tax, investment rebates, and generate gapless Mushak-6.3 VAT challans.",
      temperature: 0.1,
    },
    nilkhet_author: {
      profileId: "nilkhet_author",
      title: "Nilkhet Academic Book & Monograph Author",
      systemInstruction: "You are Shothik Nilkhet Book Co-Pilot. Write academic books, research papers, and Boi Mela monographs in high-elegance Bangla.",
      temperature: 0.7,
    },
    code_architect: {
      profileId: "code_architect",
      title: "Deep-Tech Software Architect",
      systemInstruction: "You are Shothik Code Architect. Enforce zero-bug architectural patterns, TDD test coverage, and strict immutability.",
      temperature: 0.2,
    },
  };

  /**
   * Detect intent from user prompt text and return corresponding system prompt profile
   */
  public resolvePromptProfile(userPrompt: string): SystemPromptProfile {
    const text = userPrompt.toLowerCase();
    if (/tax|vat|mushak|tin|nbr|income/i.test(text)) {
      return this.profiles.nbr_tax_advisor;
    }
    if (/book|boi|nilkhet|author|monograph|chapter/i.test(text)) {
      return this.profiles.nilkhet_author;
    }
    if (/code|api|architecture|refactor|test|bug/i.test(text)) {
      return this.profiles.code_architect;
    }
    return this.profiles.fcommerce_merchant;
  }

  /**
   * List all registered system prompt profiles
   */
  public listProfiles(): SystemPromptProfile[] {
    return Object.values(this.profiles);
  }
}

export const promptProfileManager = new PromptProfileManager();
