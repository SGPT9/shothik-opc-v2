import assert from "node:assert";
import { buildDynamicDeck } from "../artifacts/shothik/src/components/chat/artifacts/SlidesArtifact";
import { buildDynamicResearch } from "../artifacts/shothik/src/components/chat/artifacts/DeepResearchArtifact";
import { buildDynamicSheet } from "../artifacts/shothik/src/components/chat/artifacts/SheetArtifact";

console.log("🧪 [TDD Suite] Running tests for dynamic artifact engines...");

// ── Test 1: buildDynamicDeck Seam ──
console.log("  ▶ Testing buildDynamicDeck seam...");
const fintechDeck = buildDynamicDeck("10-Slide Investor Pitch Deck for South Asian FinTech");
assert.strictEqual(fintechDeck.length, 8, "Expected 8 slides for consulting pitch deck");
assert.strictEqual(fintechDeck[0].layout, "hero", "Slide 1 should be hero layout");
assert(fintechDeck[0].title.length > 0, "Slide 1 title must not be empty");
assert(fintechDeck[0].speakerNotes.length > 0, "Slide 1 speaker notes must be generated");

const healthtechDeck = buildDynamicDeck("Healthcare Telemedicine Platform in Sylhet");
assert.strictEqual(healthtechDeck.length, 8, "Expected 8 slides for healthtech deck");
assert(healthtechDeck.some((s) => s.title.toLowerCase().includes("health") || s.tag.toLowerCase().includes("market")), "Should synthesize healthcare domain context");

// ── Test 2: buildDynamicResearch Seam ──
console.log("  ▶ Testing buildDynamicResearch seam...");
const dbResearch = buildDynamicResearch("Compare PostgreSQL vs MongoDB for high-concurrency writing apps");
assert(dbResearch.sources.length >= 2, "Expected at least 2 verified sources for database queries");
assert(dbResearch.sources.some((s) => s.domain.includes("postgresql.org")), "Must include official PostgreSQL reference");
assert(dbResearch.summary.includes("PostgreSQL"), "Summary report must contain PostgreSQL analysis");

const taxResearch = buildDynamicResearch("NBR Income Tax Act 2023 Section 78 investment tax rebate");
assert(taxResearch.sources.some((s) => s.domain.includes("nbr.gov.bd")), "Must cite NBR portal");
assert(taxResearch.summary.includes("Section 78"), "Summary must articulate Section 78 tax clauses");

// ── Test 3: buildDynamicSheet Seam ──
console.log("  ▶ Testing buildDynamicSheet seam...");
const logisticsSheet = buildDynamicSheet("Steadfast & Pathao Courier COD Fee Breakdown");
assert.strictEqual(logisticsSheet.headers.length, 4, "Logistics model should have 4 comparison columns");
assert(logisticsSheet.rows.some((r) => r[0].includes("bKash")), "Must model bKash/Nagad gateway splits");
assert.strictEqual(logisticsSheet.kpis.length, 4, "Must provide 4 top highlight KPI cards");

// ── Test 4: DiffEngine Myers LCS Seam ──
console.log("  ▶ Testing DiffEngine Myers LCS seam...");
const { DiffEngine } = await import("../artifacts/shothik/src/lib/canvas/DiffEngine.js");
const diffChunks = DiffEngine.computeDiff("Hello old world", "Hello brave new world");
assert(diffChunks.length >= 3, "DiffEngine must decompose added and removed tokens");
assert(diffChunks.some((c: any) => c.type === "added" && c.value === "brave new"), "DiffEngine must identify added tokens");

// ── Test 5: SpeculativeEngine Seam ──
console.log("  ▶ Testing SpeculativeEngine client inference seam...");
const { SpeculativeEngine } = await import("../artifacts/shothik/src/lib/inference/SpeculativeEngine.js");
const specRewrite = await SpeculativeEngine.rewrite("This is a fast delivery system");
assert(specRewrite.latencyMs < 100, "Speculative transform latency must be <100ms");
assert(specRewrite.output.includes("low-latency"), "Must replace fast with low-latency");

// ── Test 6: EpistemicGraphMemory DAG Seam ──
console.log("  ▶ Testing EpistemicGraphMemory conflict DAG seam...");
const { EpistemicGraphMemory } = await import("../artifacts/shothik/src/lib/memory/EpistemicGraphMemory.js");
const memoryGraph = new EpistemicGraphMemory("script_test_epistemic_graph");
memoryGraph.clear();
const firstDec = memoryGraph.addDecision("We use Pathao courier in Dhaka", "DECISION");
const secondDec = memoryGraph.addDecision("We switched to Steadfast Courier nationwide", "DECISION");
assert.strictEqual(secondDec.supersededNode?.id, firstDec.newNode.id, "Second decision must supersede conflicting courier rule");
assert(memoryGraph.getActiveContext().includes("Steadfast Courier"), "Active context must only return authoritative node");

// ── Test 7: WasmSandbox Formula Evaluator Seam ──
console.log("  ▶ Testing WasmSandbox formula evaluation & self-healing seam...");
const { WasmSandbox } = await import("../artifacts/shothik/src/lib/sandbox/WasmSandbox.ts");
const healedRes = WasmSandbox.evaluateWithSelfHealing("=A1 / 0", { A1: 1500 });
assert.strictEqual(healedRes.healed, true, "WasmSandbox must intercept and self-heal division by zero");
assert.strictEqual(healedRes.value, 1500, "Healed formula must evaluate to safe fallback");

console.log("✅ [TDD Suite] All 7 dynamic artifact and deep-tech engine contract tests passed!");

