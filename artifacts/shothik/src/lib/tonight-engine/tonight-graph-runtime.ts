import { randomUUID } from "crypto";
import { getHermesOrchestrator } from "@/lib/hermes";
import { getHermesStreamingEngine } from "@/lib/hermes/modules/streaming-engine";
import { streamOvernightLLM, resolveOvernightModel, type OvernightDepth } from "./llm-overnight-client";
import { AGENCY_PERSONAS, type AgencyPersona } from "./agency-personas";
import { OutboundMarketingService } from "./outbound-marketing";
import { TonightMemoryService } from "./tonight-memory-rag";
import { SwarmRouter, ConsensusEngine } from "./swarm-router";
import { SelfHealingRuntime } from "@/lib/infrastructure/self-healing-runtime";
import logger from "@/lib/logger";
import type { RunId, SwarmTopology, HermesEventEnvelope } from "@/lib/hermes/contracts/core";

export type StateNode = "NODE_PLAN" | "NODE_DEEP_SCAN" | "NODE_SWARM_EXECUTE" | "NODE_VERIFY" | "NODE_REPAIR" | "NODE_SYNTHESIZE";

export interface GraphStepResult {
  node: StateNode;
  status: "success" | "failed" | "skipped";
  output: string;
  metadata?: Record<string, any>;
}

export interface TonightGraphState {
  runId: RunId;
  workspaceId: string;
  userId: string;
  prompt: string;
  depth: OvernightDepth;
  topology: SwarmTopology;
  activeNode: StateNode;
  plan: Array<{ personaKey: string; title: string }>;
  contextData: string;
  swarmOutputs: Array<{ personaKey: string; output: string }>;
  finalReport: string;
  leadsCount: number;
  postsCount: number;
  artifactId?: string;
  error?: string;
}

export class TonightGraphRuntime {
  /**
   * Executes an overnight task using Open-SWE state graph transitions
   * combined with Ruflo swarm coordination.
   */
  static async executeGraph(params: {
    runId: RunId;
    workspaceId: string;
    userId: string;
    prompt: string;
    depth: OvernightDepth;
    attachmentUrls?: string[];
  }): Promise<TonightGraphState> {
    const { runId, workspaceId, userId, prompt, depth } = params;
    const streaming = getHermesStreamingEngine();

    const swarmSelection = SwarmRouter.selectTopologyAndPlan(prompt, depth);

    const state: TonightGraphState = {
      runId,
      workspaceId,
      userId,
      prompt,
      depth,
      topology: swarmSelection.topology,
      activeNode: "NODE_PLAN",
      plan: swarmSelection.plan,
      contextData: "",
      swarmOutputs: [],
      finalReport: "",
      leadsCount: 0,
      postsCount: 0,
    };

    try {
      // 1. NODE_PLAN: Determine persona swarm strategy & plan steps
      state.activeNode = "NODE_PLAN";
      await this.emitGraphState(state, `Swarm topology set to '${state.topology}' with ${state.plan.length} persona nodes`);

      // 2. NODE_DEEP_SCAN: Gather context (Web search / RAG memory lookup)
      state.activeNode = "NODE_DEEP_SCAN";
      await this.emitGraphState(state, "Performing deep scan & retrieving historical RAG memory");

      const pastMemories = await TonightMemoryService.searchRunMemory(workspaceId, prompt, 3);
      const memoryContext = pastMemories.length > 0
        ? `\n\n[Historical Workspace RAG Memory]\n` + pastMemories.map((m) => `• ${m.title}: ${m.snippet}`).join("\n")
        : "";

      state.contextData = `[User Request]: ${prompt}${memoryContext}`;

      // 3. NODE_SWARM_EXECUTE: Execute multi-persona swarm loop
      state.activeNode = "NODE_SWARM_EXECUTE";
      await this.emitGraphState(state, "Executing persona swarm nodes");

      let accumulatedContext = state.contextData;

      for (let i = 0; i < state.plan.length; i++) {
        const step = state.plan[i];
        const persona: AgencyPersona = AGENCY_PERSONAS[step.personaKey] || AGENCY_PERSONAS.general;

        const progressEvent: HermesEventEnvelope = {
          eventId: randomUUID(),
          runId,
          workspaceId,
          domain: "tonight-engine",
          eventType: "progress_update",
          sequence: i + 1,
          timestamp: new Date().toISOString(),
          payload: {
            step: i + 1,
            totalSteps: state.plan.length,
            persona: persona.role,
            title: step.title,
            progressPercent: Math.round(((i + 1) / (state.plan.length + 2)) * 100),
          },
          metadata: { personaKey: step.personaKey, topology: state.topology },
        };
        await streaming.emitRunEvent(progressEvent);

        const stepPrompt = `
Task: ${step.title}
Original Request: ${prompt}
Persona Directive: ${persona.systemDirective}
Persona Instructions:
${persona.instructions.map((ins) => `- ${ins}`).join("\n")}

Context & Previous Swarm Inputs:
${accumulatedContext}
`;

        let stepOutput = "";
        for await (const chunk of streamOvernightLLM(stepPrompt, { depth })) {
          stepOutput += chunk;
        }

        state.swarmOutputs.push({ personaKey: step.personaKey, output: stepOutput });
        accumulatedContext += `\n\n[Output from ${persona.role} (${step.personaKey})]:\n${stepOutput.slice(0, 1000)}`;
      }

      // 4. NODE_VERIFY & REPAIR: Verify outputs & execute closed-loop self-healing repair if needed
      state.activeNode = "NODE_VERIFY";
      let consensus = ConsensusEngine.verifyConsensus(state.swarmOutputs);
      await this.emitGraphState(
        state,
        `Auditing outputs — Swarm consensus score: ${consensus.score}% (${consensus.passed ? "Verified" : "Degraded"})`
      );

      if (!consensus.passed || consensus.missingPersonas.length > 0) {
        state.activeNode = "NODE_REPAIR";
        await this.emitGraphState(state, "Consensus degraded — triggering closed-loop self-healing repair");

        for (const missingPersona of consensus.missingPersonas) {
          const repair = await SelfHealingRuntime.attemptClosedLoopRepair({
            runId,
            workspaceId,
            failedPersonaKey: missingPersona,
            errorMessage: `Degraded output or low consensus score for persona '${missingPersona}'`,
          });

          if (repair.success) {
            const idx = state.swarmOutputs.findIndex((s) => s.personaKey === missingPersona);
            if (idx >= 0) {
              state.swarmOutputs[idx].output = repair.repairedOutput;
            } else {
              state.swarmOutputs.push({ personaKey: missingPersona, output: repair.repairedOutput });
            }
          }
        }

        consensus = ConsensusEngine.verifyConsensus(state.swarmOutputs);
        await this.emitGraphState(
          state,
          `Post-repair consensus score: ${consensus.score}% (${consensus.passed ? "Verified" : "Degraded"})`
        );
      }

      const coordinatorPrompt = `
You are the Lead Swarm Coordinator compiling the final synthesized overnight report for the user.

Original Request: ${prompt}
Swarm Topology: ${state.topology}

Persona Sub-Agent Contributions:
${state.swarmOutputs.map((s) => `### ${AGENCY_PERSONAS[s.personaKey]?.role || s.personaKey}\n${s.output}`).join("\n\n")}

Instructions:
1. Combine all persona outputs into a coherent, executive-grade Markdown report.
2. Include sections for Executive Summary, Detailed Analysis/Implementation, Outbound Campaign Leads (if emails found), and Social Media Drafts.
`;

      let finalReport = "";
      for await (const chunk of streamOvernightLLM(coordinatorPrompt, { depth })) {
        finalReport += chunk;
      }
      state.finalReport = finalReport;

      // 5. NODE_SYNTHESIZE: Catalog artifacts & index into RAG vector memory
      state.activeNode = "NODE_SYNTHESIZE";
      await this.emitGraphState(state, "Indexing RAG memory and saving Hermes artifact");

      const campaignRes = await OutboundMarketingService.extractAndRegisterCampaigns({
        runId,
        workspaceId,
        finalReport: state.finalReport,
        prompt,
      });

      state.leadsCount = campaignRes.leadsCount;
      state.postsCount = campaignRes.postsCount;

      // Index into RAG vector memory
      await TonightMemoryService.indexRunMemory({
        runId,
        workspaceId,
        topic: prompt.slice(0, 80),
        reportContent: state.finalReport,
        leadsCount: state.leadsCount,
        postsCount: state.postsCount,
      });

      // Save durable HermesArtifact via HermesOrchestrator
      try {
        const orchestrator = getHermesOrchestrator();
        const artifact = await orchestrator.artifactManager.createArtifact({
          workspaceId,
          runId,
          userId,
          domain: "tonight-engine",
          title: `Overnight Report: ${prompt.slice(0, 60)}`,
          description: `Synthesized report generated by ${state.topology} swarm topology`,
          content: {
            reportText: state.finalReport,
            leadsCount: state.leadsCount,
            postsCount: state.postsCount,
            topology: state.topology,
            swarmOutputs: state.swarmOutputs,
          },
          metadata: { depth, prompt },
        });
        state.artifactId = artifact.id;
      } catch (err: any) {
        logger.warn("[tonight-graph-runtime] Artifact persistence fallback", { error: err.message });
        state.artifactId = `art_${randomUUID()}`;
      }

      const artifactEvent: HermesEventEnvelope = {
        eventId: randomUUID(),
        runId,
        workspaceId,
        artifactId: state.artifactId,
        domain: "tonight-engine",
        eventType: "artifact_created",
        sequence: state.plan.length + 2,
        timestamp: new Date().toISOString(),
        payload: {
          artifactId: state.artifactId,
          title: `Overnight Report: ${prompt.slice(0, 60)}`,
          leadsCount: state.leadsCount,
          postsCount: state.postsCount,
        },
        metadata: {},
      };
      await streaming.emitRunEvent(artifactEvent);

      logger.info("[tonight-graph-runtime] Overnight state graph completed successfully", {
        runId,
        workspaceId,
        topology: state.topology,
        artifactId: state.artifactId,
      });

      return state;
    } catch (err: any) {
      state.error = err.message || "State graph execution failed";
      logger.error("[tonight-graph-runtime] State graph execution failed", { runId, error: state.error });
      throw err;
    }
  }

  private static selectSwarmPlan(prompt: string, depth: OvernightDepth): Array<{ personaKey: string; title: string }> {
    const p = prompt.toLowerCase();

    if (p.includes("market") || p.includes("lead") || p.includes("outreach") || p.includes("growth")) {
      return [
        { personaKey: "researcher", title: "Strategic Market & Growth Research" },
        { personaKey: "content-creator", title: "Content Copywriting & Campaign Messaging" },
        { personaKey: "sales-outreach", title: "B2B Sales Prospecting & Lead Extraction" },
      ];
    }

    if (p.includes("code") || p.includes("feature") || p.includes("fix") || p.includes("bug") || p.includes("app")) {
      return [
        { personaKey: "product-manager", title: "Requirements & Specification Scoping" },
        { personaKey: "github-fixer", title: "Architecture & Implementation Strategy" },
        { personaKey: "security-auditor", title: "Security Audit & Code Review" },
        { personaKey: "test-automator", title: "Testing Strategy & Verification Plan" },
      ];
    }

    if (depth === "deep") {
      return [
        { personaKey: "general", title: "Co-Founder Business Overview" },
        { personaKey: "researcher", title: "Deep Market & Competitor Research" },
        { personaKey: "github-fixer", title: "Technical Solution Blueprint" },
        { personaKey: "content-creator", title: "Marketing & Launch Strategy" },
      ];
    }

    return [
      { personaKey: "general", title: "High-level Strategy Analysis" },
      { personaKey: "researcher", title: "Market Research & Fact Synthesis" },
      { personaKey: "content-creator", title: "Executive Report & Draft Generation" },
    ];
  }

  private static async emitGraphState(state: TonightGraphState, message: string) {
    const streaming = getHermesStreamingEngine();
    const event: HermesEventEnvelope = {
      eventId: randomUUID(),
      runId: state.runId,
      workspaceId: state.workspaceId,
      domain: "tonight-engine",
      eventType: "graph_state_transition",
      sequence: Date.now(),
      timestamp: new Date().toISOString(),
      payload: {
        activeNode: state.activeNode,
        topology: state.topology,
        message,
      },
      metadata: {},
    };
    await streaming.emitRunEvent(event);
  }
}
