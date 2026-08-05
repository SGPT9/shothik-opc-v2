import type { SwarmTopology } from "@/lib/hermes/contracts/core";
import { AGENCY_PERSONAS, type AgencyPersona } from "./agency-personas";
import type { OvernightDepth } from "./llm-overnight-client";
import logger from "@/lib/logger";

export interface SwarmPlan {
  topology: SwarmTopology;
  plan: Array<{ personaKey: string; title: string }>;
}

export interface SwarmOutput {
  personaKey: string;
  output: string;
}

export interface ConsensusResult {
  passed: boolean;
  score: number;
  missingPersonas: string[];
  recommendations: string[];
}

export class SwarmRouter {
  /**
   * Intelligently selects optimal Ruflo swarm topology and persona step graph based on task attributes.
   */
  static selectTopologyAndPlan(prompt: string, depth: OvernightDepth): SwarmPlan {
    const p = prompt.toLowerCase();

    // 1. Technical/Architecture/Security or Deep Tasks -> Hierarchical Topology
    if (
      depth === "deep" ||
      p.includes("code") ||
      p.includes("architecture") ||
      p.includes("security") ||
      p.includes("refactor") ||
      p.includes("database") ||
      p.includes("api")
    ) {
      return {
        topology: "hierarchical",
        plan: [
          { personaKey: "product-manager", title: "Technical Requirements & Domain Modeling" },
          { personaKey: "github-fixer", title: "System Architecture & Implementation Design" },
          { personaKey: "security-auditor", title: "Security Vulnerability & RLS Policy Audit" },
          { personaKey: "test-automator", title: "Verification Strategy & E2E Test Suite" },
        ],
      };
    }

    // 2. Sales / Growth / Lead Gen Tasks -> Coordinator Topology
    if (
      p.includes("market") ||
      p.includes("lead") ||
      p.includes("sales") ||
      p.includes("outreach") ||
      p.includes("prospecting") ||
      p.includes("growth")
    ) {
      return {
        topology: "coordinator",
        plan: [
          { personaKey: "researcher", title: "Target Market & Audience Analysis" },
          { personaKey: "content-creator", title: "Outreach Copywriting & Value Positioning" },
          { personaKey: "sales-outreach", title: "B2B Sales Cadence & Lead Extraction" },
        ],
      };
    }

    // 3. UI/UX / Design / Frontend Tasks -> Mesh Topology
    if (
      p.includes("ui") ||
      p.includes("ux") ||
      p.includes("design") ||
      p.includes("css") ||
      p.includes("tailwind") ||
      p.includes("landing")
    ) {
      return {
        topology: "mesh",
        plan: [
          { personaKey: "ux-architect", title: "User Journey & Layout Wireframing" },
          { personaKey: "ui-designer", title: "Design System Tokens & Accessibility Validation" },
          { personaKey: "github-fixer", title: "Responsive Frontend Component Implementation" },
        ],
      };
    }

    // 4. Default / Deep Thinking -> Adaptive Coordinator or Ring Topology
    return {
      topology: "ring",
      plan: [
        { personaKey: "general", title: "Foundational Strategy & Business Goals" },
        { personaKey: "researcher", title: "Deep Industry Research & Benchmark Analysis" },
        { personaKey: "github-fixer", title: "Implementation Roadmap & Tech Stack Blueprint" },
        { personaKey: "seo-specialist", title: "AEO/SEO Visibility & Core Web Vitals Audit" },
      ],
    };
  }
}

export class ConsensusEngine {
  /**
   * Evaluates outputs from sub-agent persona nodes for completeness and coherence before synthesis.
   */
  static verifyConsensus(outputs: SwarmOutput[]): ConsensusResult {
    const missingPersonas: string[] = [];

    if (outputs.length === 0) {
      return {
        passed: false,
        score: 0,
        missingPersonas: ["all"],
        recommendations: ["Re-run swarm nodes — no persona outputs were produced."],
      };
    }

    let emptyCount = 0;
    for (const item of outputs) {
      if (!item.output || item.output.trim().length < 30) {
        missingPersonas.push(item.personaKey);
        emptyCount++;
      }
    }

    const score = Math.round(((outputs.length - emptyCount) / outputs.length) * 100);
    const passed = score >= 60;

    logger.info("[consensus-engine] Swarm consensus verification completed", {
      totalNodes: outputs.length,
      emptyCount,
      score,
      passed,
    });

    return {
      passed,
      score,
      missingPersonas,
      recommendations: passed
        ? ["Swarm consensus verified — proceed to report synthesis."]
        : [`Low consensus score (${score}%). Re-evaluating missing nodes: ${missingPersonas.join(", ")}`],
    };
  }
}
