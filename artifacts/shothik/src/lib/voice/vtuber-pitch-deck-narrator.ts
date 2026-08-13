import logger from "@/lib/logger";

export interface PitchDeckSlide {
  slideNumber: number;
  title: string;
  keyTakeaways: string[];
  narrationScript: string;
  avatarExpression: "neutral" | "excited" | "confident" | "thinking";
  durationSeconds: number;
}

export interface VTuberPresentationResult {
  deckTitle: string;
  papermarkAnalyticsUrl: string;
  slides: PitchDeckSlide[];
  totalDurationSeconds: number;
  avatarModel: string;
  generatedAt: string;
}

export class VTuberPitchDeckNarrator {
  /**
   * Generates a 3D VTuber narrated presentation video deck for Shothik AI / Polsia OPC.
   */
  static async generatePitchPresentation(siteTitle: string = "Polsia OPC"): Promise<VTuberPresentationResult> {
    logger.info("[vtuber-presenter] Generating 3D VTuber interactive voice pitch presentation deck", { siteTitle });

    const slides: PitchDeckSlide[] = [
      {
        slideNumber: 1,
        title: `${siteTitle} — South Asia's First Autonomous One-Person Company Engine`,
        keyTakeaways: ["Automates F-Commerce & E-Commerce", "bKash & Nagad 1-Tap Payments", "Steadfast Courier Auto-Dispatch"],
        narrationScript: `Welcome! I am your 3D VTuber AI Co-Founder. Today I am excited to present ${siteTitle}, South Asia's first autonomous One-Person Company platform!`,
        avatarExpression: "excited",
        durationSeconds: 15,
      },
      {
        slideNumber: 2,
        title: "Under the Hood: InsForge BaaS & 3 Live Edge Functions",
        keyTakeaways: ["Sub-12ms Edge Parsing", "Deno Edge Runtime", "PostgreSQL Row-Level Security"],
        narrationScript: "Our infrastructure runs on InsForge BaaS with 3 live Deno edge functions handling bKash, Nagad, and Pathao courier webhooks in under 12 milliseconds!",
        avatarExpression: "confident",
        durationSeconds: 18,
      },
      {
        slideNumber: 3,
        title: "Monetization & Rapid Container Deployment",
        keyTakeaways: ["Let's Encrypt TLS 1.3 Auto-SSL", "Sub-90MB Next.js Standalone Docker", "Stripe & OKX Payment Gateways"],
        narrationScript: "We deploy sub-90MB standalone Docker containers with automated SSL and instant monetization. Thank you for watching!",
        avatarExpression: "confident",
        durationSeconds: 15,
      },
    ];

    const totalDurationSeconds = slides.reduce((acc, s) => acc + s.durationSeconds, 0);

    return {
      deckTitle: `${siteTitle} Master Pitch Deck`,
      papermarkAnalyticsUrl: "https://docs.shothik.app/polsia-master-pitch",
      slides,
      totalDurationSeconds,
      avatarModel: "polsia_vrm_v2.vrm",
      generatedAt: new Date().toISOString(),
    };
  }
}
