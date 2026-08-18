import { LocalComputeAdapter } from "../artifacts/swarm-orchestrator/src/compute/LocalComputeAdapter.js";

interface DebateAgent {
  role: string;
  name: string;
  focus: string;
  prompt: string;
}

const AGENTS: DebateAgent[] = [
  {
    role: "FRONTEND_LEAD",
    name: "Ayesha (Frontend Architect)",
    focus: "DeepSeek-close minimalism, 60fps rendering, Ask-First composer, Zero first-paint clutter",
    prompt: `You are the Frontend Architect for Shothik. Argue where features belong based on user ergonomics, minimalist design rules, and visual clarity. Debate where BoiMela 3D Studio, F-Commerce Hub, Swarm DAG Telemetry, and Voice Mode should live.`,
  },
  {
    role: "BACKEND_LEAD",
    name: "Tariq (Backend Lead)",
    focus: "Network boundaries, payload efficiency, WebSocket isolation, and microservice decoupling",
    prompt: `You are the Backend Lead for Shothik. Argue where features belong based on API payload efficiency, streaming performance, and decoupling heavy studio rendering from lightweight chat API loops.`,
  },
  {
    role: "DEMOGRAPHY_PRODUCT",
    name: "Sabbir (South Asian Product Strategist)",
    focus: "Bangladeshi creator workflows, bKash MFS speed, Nilkhet publishing standards, and low-spec mobile devices",
    prompt: `You are the Product Strategist focused on Bangladesh creators, book publishers, and F-Commerce merchants. Argue what layout gives the fastest conversion for bKash TrxID verification and Amar Ekushey book formatting.`,
  },
  {
    role: "QA_RED_TEAM",
    name: "Farhan (QA & Security Lead)",
    focus: "State leakage, drawer overflow, mobile keyboard occlusion, and privileged telemetry leak",
    prompt: `You are the QA Red-Team Lead. Critique the other proposals for drawer crowding, state desync, and exposing raw backend swarm traces on consumer chat surfaces.`,
  },
];

async function runMultiAgentDebate() {
  console.log("================================================================================");
  console.log("🏛️ AUTONOMOUS MULTI-AGENT ARCHITECTURAL DEBATE: FRONTEND INFORMATION ARCHITECTURE");
  console.log("================================================================================\n");

  const compute = new LocalComputeAdapter();
  const debateLog: Array<{ speaker: string; argument: string }> = [];

  for (const agent of AGENTS) {
    console.log(`🎙️ [Debate Floor] ${agent.name} (${agent.role}) is speaking...`);
    const systemPrompt = `${agent.prompt}\n\nContext: We need to decide where to mount:
1. BoiMela 6x9 3D Publishing Studio
2. F-Commerce & MFS Hub (bKash/Nagad/Steadfast)
3. Swarm Fleet DAG Telemetry
4. Holographic Avatar Voice Mode

Format your argument in 3 concise bullet points with your concrete recommendation.`;

    const res = await compute.generate({
      prompt: "Propose the optimal frontend placement for these 4 subsystems so Shothik remains fast, clean, and intuitive.",
      system: systemPrompt,
    });

    const argumentText = res.response || "No response generated";
    debateLog.push({ speaker: agent.name, argument: argumentText });
    console.log(`\n--- ${agent.name} Proposal ---`);
    console.log(argumentText);
    console.log("--------------------------------------------------------------------------------\n");
  }

  console.log("👑 [Commander Moderator] Synthesizing Consensus Architecture from Multi-Agent Debate...\n");

  const consensusPrompt = `You are Commander Agent. Review the debate arguments from the Frontend Lead, Backend Lead, Product Strategist, and QA Lead:\n\n${JSON.stringify(
    debateLog,
    null,
    2
  )}\n\nProvide the FINAL BINDING Information Architecture (IA) Table mapping each subsystem to its exact route or surface, with the rationale.`;

  const finalRes = await compute.generate({
    prompt: "Synthesize the final Information Architecture decision table.",
    system: consensusPrompt,
  });

  console.log("================================================================================");
  console.log("🏆 FINAL MULTI-AGENT CONSENSUS & INFORMATION ARCHITECTURE MATRIX");
  console.log("================================================================================");
  console.log(finalRes.response);
  console.log("================================================================================\n");
}

runMultiAgentDebate().catch(console.error);
