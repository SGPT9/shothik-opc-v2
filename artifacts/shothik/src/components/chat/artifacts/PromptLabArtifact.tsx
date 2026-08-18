"use client";

import { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Check,
  Sparkles,
  Layers,
  Sliders,
  Cpu,
  Download,
  Share2,
  FileCode,
  Zap,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: { key: string; defaultValue: string; description: string }[];
}

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: "south-asian-fintech",
    name: "Emerging Market FinTech & Carrier Orchestrator",
    category: "FinTech & Logistics",
    systemPrompt: `You are Shothik Hermes, an expert emerging-market software architect specializing in Bangladesh & South Asian commerce.
Your objectives:
1. Always suggest local MFS integration (bKash, Nagad) before credit cards.
2. Optimize all database queries and payloads for 2GB RAM Android devices on 3G/4G networks.
3. Automatically configure anti-fraud COD checks with Steadfast and Pathao courier tracking.
4. Output clean TypeScript, SQL migrations, and Banglish/English communication copy.`,
    userPromptTemplate: `Generate an order dispatch handler for merchant {{merchant_name}} selling {{product_category}} with COD amount ৳{{cod_amount}} BDT.`,
    variables: [
      { key: "merchant_name", defaultValue: "Aarong Artisan Hub", description: "Name of the merchant" },
      { key: "product_category", defaultValue: "Handcrafted Cotton Panjabi", description: "Product description" },
      { key: "cod_amount", defaultValue: "2,450", description: "Cash-on-delivery amount in BDT" },
    ],
  },
  {
    id: "r1-reasoning-distill",
    name: "DeepSeek-R1 Chain-of-Thought Distiller",
    category: "Reasoning & Math",
    systemPrompt: `You are a strict reasoning assistant utilizing step-by-step reflection before delivering code.
Wrap all internal mathematical proofs in <think>...</think> blocks.
Ensure zero hallucinations regarding API schemas or PostgreSQL foreign keys.`,
    userPromptTemplate: `Solve this unit economics optimization: Gross margin {{gross_margin}}%, CAC {{cac_usd}} USD, LTV {{ltv_usd}} USD.`,
    variables: [
      { key: "gross_margin", defaultValue: "76.6", description: "Target gross margin percentage" },
      { key: "cac_usd", defaultValue: "8.50", description: "Customer acquisition cost in USD" },
      { key: "ltv_usd", defaultValue: "64.00", description: "Lifetime value in USD" },
    ],
  },
];

export function PromptLabArtifact() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    merchant_name: "Aarong Artisan Hub",
    product_category: "Handcrafted Cotton Panjabi",
    cod_amount: "2,450",
  });
  const [simulatedOutput, setSimulatedOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleRunPrompt = () => {
    setIsRunning(true);
    setSimulatedOutput("");

    setTimeout(() => {
      let resolvedPrompt = activeTemplate.userPromptTemplate;
      Object.entries(variableValues).forEach(([k, v]) => {
        resolvedPrompt = resolvedPrompt.replace(new RegExp(`{{${k}}}`, "g"), v);
      });

      const response = `✅ [Shothik Hermes Prompt Lab Execution]
---
Model: deepseek-r1:7b (Local GPU Port 11434)
Latency: 480ms | Tokens: 312 | Temperature: 0.2

<think>
1. Analyzing payload for ${variableValues.merchant_name || "Merchant"}
2. Setting up Steadfast carrier webhook on tracking BD_ST_${Math.floor(100000 + Math.random() * 900000)}
3. Generating bKash dynamic PGW invoice for ৳${variableValues.cod_amount || "2450"} BDT
</think>

[Dispatched Code]
\`\`\`typescript
export async function dispatchOrder(orderId: string) {
  const courier = await steadfast.book({
    merchant: "${variableValues.merchant_name}",
    item: "${variableValues.product_category}",
    codAmountBdt: ${variableValues.cod_amount?.replace(/[^0-9]/g, "") || 2450},
  });
  return { success: true, tracking: courier.trackingCode };
}
\`\`\`
`;
      setSimulatedOutput(response);
      setIsRunning(false);
    }, 1000);
  };

  const handleExportModelfile = () => {
    const modelfile = `FROM deepseek-r1:7b
PARAMETER temperature 0.2
PARAMETER top_p 0.95
SYSTEM """${activeTemplate.systemPrompt}"""
`;
    const blob = new Blob([modelfile], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Modelfile.${activeTemplate.id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Prompt Engineering & Benchmark Lab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                Ollama Modelfile Ready
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Test system prompts with template variables and export to local Ollama GPU Modelfile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportModelfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Modelfile</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: Prompt Configuration */}
        <div className="border-r border-border p-4 space-y-4 overflow-y-auto bg-muted/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Prompt Template</span>
            <div className="flex gap-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer",
                    selectedTemplateId === t.id ? "bg-brand text-brand-foreground shadow-xs" : "bg-muted text-muted-foreground"
                  )}
                >
                  {t.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>System Prompt (Instructions)</span>
            </label>
            <textarea
              value={activeTemplate.systemPrompt}
              onChange={(e) => {
                const updated = templates.map((t) =>
                  t.id === activeTemplate.id ? { ...t, systemPrompt: e.target.value } : t
                );
                setTemplates(updated);
              }}
              rows={6}
              className="w-full text-xs font-mono bg-background border border-border rounded-xl p-3 outline-none focus:border-cyan-400 transition resize-none leading-relaxed"
            />
          </div>

          {/* Variables Inputs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">Template Variables</span>
            <div className="grid grid-cols-1 gap-2">
              {activeTemplate.variables.map((v) => (
                <div key={v.key} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-cyan-400 font-semibold">{`{{${v.key}}}`}</span>
                    <span className="text-muted-foreground">{v.description}</span>
                  </div>
                  <input
                    type="text"
                    value={variableValues[v.key] ?? v.defaultValue}
                    onChange={(e) => setVariableValues({ ...variableValues, [v.key]: e.target.value })}
                    className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunPrompt}
            disabled={isRunning}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? "Running Benchmark..." : "Execute System Prompt"}</span>
          </button>
        </div>

        {/* Right: Simulated GPU Inference Output */}
        <div className="flex flex-col h-full bg-[#0d1117] text-slate-100 overflow-hidden">
          <div className="h-10 bg-[#161b22] px-4 flex items-center justify-between border-b border-[#30363d] shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Inference Stream Output</span>
            </div>
            {simulatedOutput && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(simulatedOutput);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-3">
            {simulatedOutput ? (
              <pre className="whitespace-pre-wrap text-slate-200">{simulatedOutput}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 space-y-2">
                <Terminal className="w-8 h-8 text-muted-foreground/30" />
                <span className="text-xs">Click "Execute System Prompt" to run live test</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptLabArtifact;
