import logger from "@/lib/logger";
import { type PerplexityFocusMode } from "@/components/perplexity/PerplexityFocusSelector";
import { type PerplexitySource } from "@/components/perplexity/PerplexitySourcesGrid";

export interface PerplexityServiceMapping {
  slotName: "header_action" | "focus_selector" | "sources_grid" | "execution_card" | "canvas_drawer";
  serviceId: string;
  serviceTitle: string;
  mappedComponent: string;
  actionProvider: string;
  creditCost: number;
}

export interface PerplexityRoutingResult {
  query: string;
  detectedFocusMode: PerplexityFocusMode;
  suggestedSources: PerplexitySource[];
  mappedServices: PerplexityServiceMapping[];
  recommendedExecutionAction?: "bkash_verify" | "steadfast_book" | "nbr_tax_clearance";
  routedAt: string;
}

export class PerplexityDesignSystemService {
  /**
   * Intelligently routes incoming user queries into Perplexity design system slots and platform execution services.
   */
  static routeQuery(query: string): PerplexityRoutingResult {
    logger.info("[perplexity-design] Intelligently routing query to Perplexity design slots", { query });

    const lower = query.toLowerCase();
    let detectedFocusMode: PerplexityFocusMode = "all";
    let recommendedExecutionAction: PerplexityRoutingResult["recommendedExecutionAction"];

    if (lower.includes("tax") || lower.includes("nbr") || lower.includes("tin") || lower.includes("bkash") || lower.includes("payment")) {
      detectedFocusMode = "finance_tax";
      if (lower.includes("bkash") || lower.includes("payment")) {
        recommendedExecutionAction = "bkash_verify";
      } else {
        recommendedExecutionAction = "nbr_tax_clearance";
      }
    } else if (lower.includes("store") || lower.includes("courier") || lower.includes("steadfast") || lower.includes("merchant")) {
      detectedFocusMode = "merchant";
      recommendedExecutionAction = "steadfast_book";
    } else if (lower.includes("paper") || lower.includes("bcs") || lower.includes("viva") || lower.includes("exam")) {
      detectedFocusMode = "academic";
    } else if (lower.includes("tam") || lower.includes("sam") || lower.includes("som") || lower.includes("startup") || lower.includes("pro")) {
      detectedFocusMode = "pro_search";
    }

    const mappedServices: PerplexityServiceMapping[] = [
      {
        slotName: "header_action",
        serviceId: "credit_metering_550",
        serviceTitle: "Universal Credit Metering & bKash Top-Up",
        mappedComponent: "MonetizationPaywallModal",
        actionProvider: "InsForge BaaS + bKash Gateway",
        creditCost: 0,
      },
      {
        slotName: "header_action",
        serviceId: "swarm_debate_engine",
        serviceTitle: "3-Agent Swarm Adversarial Debate",
        mappedComponent: "SwarmAdversarialDebateModal",
        actionProvider: "DeepSeek-R1 Swarm Triad",
        creditCost: 3,
      },
      {
        slotName: "focus_selector",
        serviceId: `focus_${detectedFocusMode}`,
        serviceTitle: `Perplexity Focus Mode: ${detectedFocusMode.toUpperCase()}`,
        mappedComponent: "PerplexityFocusSelector",
        actionProvider: "Shothik Intelligent Router",
        creditCost: 1,
      },
      {
        slotName: "sources_grid",
        serviceId: "grounded_web_audit",
        serviceTitle: "Grounded Live Web Competitor & Policy Audit",
        mappedComponent: "PerplexitySourcesGrid",
        actionProvider: "Wigolo Keyless Engine + search_web",
        creditCost: 2,
      },
      {
        slotName: "execution_card",
        serviceId: recommendedExecutionAction || "bkash_verify",
        serviceTitle: "1-Tap Real-World Execution Card",
        mappedComponent: "ChatGPTVoiceOrbModal",
        actionProvider: "Shothik Edge Webhook Execution",
        creditCost: 5,
      },
    ];

    const suggestedSources: PerplexitySource[] = [
      {
        id: 1,
        title: "Chaldal Grocery E-Commerce Logistics & Market Sizing",
        domain: "chaldal.com",
        url: "https://chaldal.com",
        snippet: "Dhaka logistics hubs and 15-minute grocery delivery operations across 8 divisions.",
      },
      {
        id: 2,
        title: "ShopUp F-Commerce Merchant Network & COD Returns",
        domain: "shopup.com.bd",
        url: "https://shopup.com.bd",
        snippet: "B2B commerce platform connecting 500k+ micro-merchants with courier partners.",
      },
      {
        id: 3,
        title: "NBR Income Tax Act 2023 & SRO 228 SRO Guidelines",
        domain: "nbr.gov.bd",
        url: "https://nbr.gov.bd",
        snippet: "Official Bangladesh National Board of Revenue tax slabs and 15% Section 78 rebates.",
      },
    ];

    return {
      query,
      detectedFocusMode,
      suggestedSources,
      mappedServices,
      recommendedExecutionAction,
      routedAt: new Date().toISOString(),
    };
  }
}
