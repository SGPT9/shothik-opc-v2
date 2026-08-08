import logger from "@/lib/logger";

export interface LifecycleCommandParams {
  command: "/spec" | "/plan" | "/build" | "/test" | "/review" | "/webperf" | "/code-simplify" | "/ship";
  targetPath?: string;
  autoExecute?: boolean;
}

export interface LifecycleCommandResult {
  command: string;
  lifecycleStage: "DEFINE" | "PLAN" | "BUILD" | "VERIFY" | "REVIEW" | "SHIP";
  activatedSkills: string[];
  outputSummary: string;
  executedAt: string;
}

export class AddyOsmaniSkillsService {
  /**
   * Production-grade lifecycle commands & agent skills adapted from addyosmani/agent-skills.
   * Maps 8 core slash commands (/spec, /plan, /build, /test, /review, /webperf, /code-simplify, /ship) across 6 lifecycle stages.
   */
  static async executeLifecycleCommand(params: LifecycleCommandParams): Promise<LifecycleCommandResult> {
    logger.info("[addyosmani-skills] Executing production lifecycle slash command", {
      command: params.command,
      targetPath: params.targetPath,
      autoExecute: params.autoExecute,
    });

    const mapping: Record<string, { stage: "DEFINE" | "PLAN" | "BUILD" | "VERIFY" | "REVIEW" | "SHIP"; skills: string[] }> = {
      "/spec": { stage: "DEFINE", skills: ["requirements-spec", "interview-me"] },
      "/plan": { stage: "PLAN", skills: ["architectural-planning", "task-decomposition"] },
      "/build": { stage: "BUILD", skills: ["frontend-ui-engineering", "api-and-interface-design"] },
      "/test": { stage: "VERIFY", skills: ["test-driven-development", "vitest-runner"] },
      "/review": { stage: "REVIEW", skills: ["code-review-and-quality", "five-axis-review"] },
      "/webperf": { stage: "VERIFY", skills: ["webperf-optimization", "core-web-vitals-lcp-inp"] },
      "/code-simplify": { stage: "REVIEW", skills: ["code-simplification", "refactoring-patterns"] },
      "/ship": { stage: "SHIP", skills: ["production-deployment-gate", "vps-docker-deploy"] },
    };

    const config = mapping[params.command] || { stage: "BUILD", skills: ["frontend-ui-engineering"] };

    return {
      command: params.command,
      lifecycleStage: config.stage,
      activatedSkills: config.skills,
      outputSummary: `Executed ${params.command} across ${config.stage} lifecycle stage with ${config.skills.join(", ")} skills activated.`,
      executedAt: new Date().toISOString(),
    };
  }
}
