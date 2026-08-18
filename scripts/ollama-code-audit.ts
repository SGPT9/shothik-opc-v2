import { LocalComputeAdapter } from "../artifacts/swarm-orchestrator/src/compute/LocalComputeAdapter.js";
import * as fs from "fs";
import * as path from "path";

async function runOllamaVerification() {
  console.log("================================================================================");
  console.log("🤖 RUNNING OLLAMA GPU CODE & FLOW AUDITOR (qwen2.5-coder:7b)");
  console.log("================================================================================\n");

  const compute = new LocalComputeAdapter();

  const studioFilePath = path.resolve("artifacts/shothik/src/components/writing-studio/IntegratedWritingStudio.tsx");
  const panelFilePath = path.resolve("artifacts/shothik/src/components/chat/ArtifactPanel.tsx");

  const studioCode = fs.readFileSync(studioFilePath, "utf-8");
  const panelCode = fs.readFileSync(panelFilePath, "utf-8");

  const prompt = `You are a Senior Principal Code Reviewer and UI/UX Architect. Audit the following implementation connecting BoiMela3DPageFlipPreview into the Writing Studio and Chat ArtifactPanel.

File 1: IntegratedWritingStudio.tsx (FormatView with 3D 6x9 BoiMela preview):
\`\`\`tsx
${studioCode.slice(0, 3500)}
\`\`\`

File 2: ArtifactPanel.tsx (BoiMela drawer tab with 1-click Writing Studio handoff):
\`\`\`tsx
${panelCode.slice(0, 3500)}
\`\`\`

Verify and evaluate:
1. Architectural Flow: Does the placement of BoiMela 3D flip preview inside FormatView and the 1-click handoff in Chat drawer make sense for authors?
2. Code Quality & Typing: Are props, states, and components cleanly integrated?
3. Bengali Localization: Are the typography tokens and labels (সোলায়মানলিপি, কালপুরুষ) appropriate?
4. Final Verdict: APPROVED or CHANGES_REQUESTED with a short rationale.`;

  console.log("⚡ Sending implementation payload to Ollama on local Intel Arc GPU...");
  const startTime = Date.now();

  const result = await compute.generate({
    prompt,
    system: "You are an expert static analysis and UI flow verification agent.",
  });

  const duration = Date.now() - startTime;

  console.log("\n================================================================================");
  console.log(`📋 OLLAMA VERIFICATION REPORT (${duration}ms)`);
  console.log("================================================================================\n");
  console.log(result.response);
  console.log("\n================================================================================\n");
}

runOllamaVerification().catch(console.error);
